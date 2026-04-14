"use client";

import { useMemo } from "react";

interface RowForStats {
  data: string;
  mes: string;
  ano: string;
  seguradora: string;
  // Campo opcional para bases mensais agregadas (ex: RCP)
  quantidade?: number;
}

interface FiltroPeriodoEStatsProps {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (v: string) => void;
  onDataFimChange: (v: string) => void;
  filteredRows: RowForStats[];
}

const inputStyle: React.CSSProperties = {
  background: "rgba(15,42,68,0.85)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#e2e8f0",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  outline: "none",
  minWidth: "140px",
};

/**
 * Calcula o total somando quantidade quando presente, senão contando 1 por linha.
 * Correto para bases diárias (Garantia, Property etc.) e mensais agregadas (RCP).
 */
function somarTotal(rows: RowForStats[]): number {
  return rows.reduce((acc, row) => {
    const qtd = typeof row.quantidade === "number" && row.quantidade > 0
      ? row.quantidade
      : 1;
    return acc + qtd;
  }, 0);
}

function calcularVariacaoMensal(rows: RowForStats[]) {
  // Agrupar por mês/ano somando quantidade
  const porMes = rows.reduce(
    (acc, row) => {
      const chave = `${row.ano}-${row.mes}`;
      if (!acc[chave]) {
        acc[chave] = { mes: row.mes, ano: row.ano, total: 0 };
      }
      // Somar quantidade se disponível, senão contar como 1
      const qtd = typeof row.quantidade === "number" && row.quantidade > 0
        ? row.quantidade
        : 1;
      acc[chave].total += qtd;
      return acc;
    },
    {} as Record<string, { mes: string; ano: string; total: number }>
  );

  const mesesOrdenados = Object.values(porMes).sort((a, b) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
    return meses.indexOf(a.mes) - meses.indexOf(b.mes);
  });

  if (mesesOrdenados.length < 2) return null;

  const atual = mesesOrdenados[mesesOrdenados.length - 1];
  const anterior = mesesOrdenados[mesesOrdenados.length - 2];

  const variacao = ((atual.total - anterior.total) / anterior.total) * 100;

  return {
    mesAtual: atual.mes,
    mesAnterior: anterior.mes,
    anoAtual: atual.ano,
    anoAnterior: anterior.ano,
    totalAtual: atual.total,
    totalAnterior: anterior.total,
    variacao,
    cresceu: variacao > 0,
    estabilizou: variacao === 0,
  };
}

export default function FiltroPeriodoEStats({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  filteredRows,
}: FiltroPeriodoEStatsProps) {
  const stats = useMemo(() => calcularVariacaoMensal(filteredRows), [filteredRows]);
  const totalPeriodo = useMemo(() => somarTotal(filteredRows), [filteredRows]);

  const temFiltroData = dataInicio || dataFim;

  return (
    <div className="mb-6 rounded-xl px-5 py-4" style={{ background: "rgba(15,42,68,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex flex-wrap items-center gap-6">
        {/* Filtro de Período */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-slate-500">
              <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Período</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              style={inputStyle}
              placeholder="Data início"
            />
            <span className="text-slate-600">–</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              style={inputStyle}
              placeholder="Data fim"
            />
          </div>
        </div>

        {/* Estatísticas de Variação — exibidas somente quando NÃO há filtro de data */}
        {stats && !temFiltroData && (
          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-slate-500">
                <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Variação Mensal</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {stats.mesAnterior}/{stats.anoAnterior} → {stats.mesAtual}/{stats.anoAtual}
              </span>

              <div
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: stats.cresceu
                    ? "rgba(16,185,129,0.15)"
                    : stats.estabilizou
                    ? "rgba(107,114,128,0.15)"
                    : "rgba(239,68,68,0.15)",
                  color: stats.cresceu ? "#10b981" : stats.estabilizou ? "#6b7280" : "#ef4444",
                }}
              >
                <span>{stats.cresceu ? "↑" : stats.estabilizou ? "→" : "↓"}</span>
                <span>{Math.abs(stats.variacao).toFixed(1)}%</span>
              </div>
              <span className="text-[10px] text-slate-600">
                ({stats.totalAnterior.toLocaleString("pt-BR")} → {stats.totalAtual.toLocaleString("pt-BR")} acionamentos)
              </span>
            </div>
          </div>
        )}

        {/* Resumo quando há filtro de data — usa soma de quantidade */}
        {temFiltroData && (
          <div className="flex items-center gap-2 pl-6 border-l border-white/10">
            <span className="text-[11px] text-slate-500">Período filtrado:</span>
            <span className="text-xs font-medium text-slate-300">
              {totalPeriodo.toLocaleString("pt-BR")} acionamentos
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
