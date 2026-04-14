"use client";

import { useState } from "react";

interface DadosGarantiaProps {
  garantiaData: {
    ok: boolean;
    origem: string;
    atualizadoEm: string;
    resumo: {
      totalCasos: number;
      porStatus: Record<string, number>;
      porComplexidade: Record<string, number>;
    };
    rankings: {
      topSeguradoras: Array<{ nome: string; quantidade: number }>;
      reguladores: Array<{ nome: string; quantidade: number }>;
    };
    distribuicao: {
      sg1: number;
      sg2: number;
      sg3: number;
    };
  } | null;
  filtroDiretoria?: string;
}

export default function DadosGarantia({ garantiaData, filtroDiretoria }: DadosGarantiaProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  if (!garantiaData || !garantiaData.ok) {
    return null;
  }

  // Se filtrou por diretoria e não é Rebeca, não mostrar
  if (filtroDiretoria && filtroDiretoria !== "Rebeca Hilcko") {
    return null;
  }

  const totalCasos = garantiaData.resumo.totalCasos;
  const distribuidos = garantiaData.resumo.porStatus["Distribuído"] || 0;
  const recebidos = garantiaData.resumo.porStatus["Recebido"] || 0;
  const topSeguradoras = garantiaData.rankings.topSeguradoras.slice(0, 3);
  const topReguladores = garantiaData.rankings.reguladores.slice(0, 3);

  return (
    <>
      {/* Card principal - sempre visível */}
      <div 
        className="rounded-xl p-4 mb-4 cursor-pointer transition-all hover:opacity-90"
        style={{ background: "rgba(245,130,32,0.08)", border: "1px solid rgba(245,130,32,0.2)" }}
        onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-0.5 rounded-full" style={{ background: "#F58220" }} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Garantia / Fiança</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,130,32,0.2)", color: "#F58220" }}>
                  Rebeca Hilcko
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalCasos.toLocaleString("pt-BR")} casos de garantia • {distribuidos.toLocaleString("pt-BR")} distribuídos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-slate-500">Top Seguradora</div>
              <div className="text-sm font-medium text-white">{topSeguradoras[0]?.nome || "N/A"}</div>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`w-5 h-5 text-slate-500 transition-transform ${mostrarDetalhes ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Painel de detalhes */}
      {mostrarDetalhes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Coluna 1 - Resumo */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Resumo</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total de Casos</span>
                <span className="text-lg font-bold text-white">{totalCasos}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Distribuídos</span>
                <span className="text-sm font-medium text-emerald-400">{distribuidos}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Recebidos</span>
                <span className="text-sm font-medium text-amber-400">{recebidos}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <h5 className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Por Equipe</h5>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">SG1</span>
                  <span className="text-slate-300">{garantiaData.distribuicao.sg1}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">SG2</span>
                  <span className="text-slate-300">{garantiaData.distribuicao.sg2}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">SG3</span>
                  <span className="text-slate-300">{garantiaData.distribuicao.sg3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2 - Top Seguradoras */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Top Seguradoras</h4>
            
            <div className="space-y-2">
              {topSeguradoras.map((seg, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-5">#{i + 1}</span>
                    <span className="text-sm text-slate-300 truncate max-w-[120px]">{seg.nome}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{seg.quantidade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3 - Top Reguladores */}
          <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Top Reguladores</h4>
            
            <div className="space-y-2">
              {topReguladores.map((reg, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-5">#{i + 1}</span>
                    <span className="text-sm text-slate-300">{reg.nome}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{reg.quantidade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
