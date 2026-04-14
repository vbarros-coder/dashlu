"use client";

import { useState } from "react";

interface DebugDataOrigemProps {
  filteredRows: Array<{
    data: string;
    mes: string;
    ano: string;
    seguradora: string;
    unidade: string;
    area: string;
    diretoria: string;
  }>;
  totalAcionamentos: number;
  filtrosAplicados: {
    ano?: string;
    mes?: string;
    seguradora?: string;
    unidade?: string;
    area?: string;
    diretoria?: string;
    dataInicio?: string;
    dataFim?: string;
  };
}

export default function DebugDataOrigem({ filteredRows, totalAcionamentos, filtrosAplicados }: DebugDataOrigemProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
        style={{
          background: "rgba(245,130,32,0.2)",
          border: "1px solid rgba(245,130,32,0.4)",
          color: "#F58220",
        }}
        title="Ver origem dos dados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.5 2.5.013.407.05.672.11.809.053.12.14.226.27.317.264.18.64.247 1.127.2l.103-.009a.75.75 0 01.102 1.493 5.98 5.98 0 01-1.08.078c-1.135 0-2.107-.296-2.795-1.027-.689-.73-.956-1.76-.917-3.067.03-1.025.387-1.622 1.107-1.852.72-.23 1.4-.072 1.893.358zM12 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Origem dos Dados
      </button>
    );
  }

  // Calcular distribuição por ano
  const porAno = filteredRows.reduce((acc, row) => {
    acc[row.ano] = (acc[row.ano] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcular distribuição por seguradora (top 5)
  const porSeguradora = filteredRows.reduce((acc, row) => {
    acc[row.seguradora] = (acc[row.seguradora] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSeguradoras = Object.entries(porSeguradora)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calcular distribuição por mês
  const porMes = filteredRows.reduce((acc, row) => {
    const chave = `${row.ano}-${row.mes}`;
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mesesOrdenados = Object.entries(porMes).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-xl p-6" style={{ background: "#0F2A44", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Origem dos Dados</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Resumo */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="text-2xl font-bold text-white mb-1">{totalAcionamentos.toLocaleString("pt-BR")}</div>
          <div className="text-sm text-slate-400">Total de acionamentos filtrados</div>
        </div>

        {/* Filtros Aplicados */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Filtros Aplicados</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(filtrosAplicados).filter(([_, v]) => v).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs text-slate-500 capitalize">{k}:</span>
                <span className="text-xs text-slate-300">{v}</span>
              </div>
            ))}
            {!Object.values(filtrosAplicados).some(Boolean) && (
              <div className="col-span-2 text-xs text-slate-600 italic">Nenhum filtro específico aplicado (todos os dados)</div>
            )}
          </div>
        </div>

        {/* Distribuição por Ano */}
        {Object.keys(porAno).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Distribuição por Ano</h3>
            <div className="space-y-2">
              {Object.entries(porAno).sort().map(([ano, count]) => (
                <div key={ano} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-sm text-slate-300">{ano}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / totalAcionamentos) * 100}%`,
                          background: "#F58220"
                        }}
                      />
                    </div>
                    <span className="text-sm text-slate-400 w-16 text-right">{count.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Seguradoras */}
        {topSeguradoras.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Top 5 Seguradoras</h3>
            <div className="space-y-2">
              {topSeguradoras.map(([seguradora, count]) => (
                <div key={seguradora} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-sm text-slate-300 truncate max-w-[200px]">{seguradora}</span>
                  <span className="text-sm text-slate-400">{count.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evolução Mensal */}
        {mesesOrdenados.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Evolução Mensal</h3>
            <div className="space-y-2">
              {mesesOrdenados.map(([mes, count]) => (
                <div key={mes} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-sm text-slate-300">{mes}</span>
                  <span className="text-sm text-slate-400">{count.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
