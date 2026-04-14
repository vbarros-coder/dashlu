"use client";

import { Fragment, useState } from "react";

export type CoordItem = { nome: string; total: number };

export type DiretorItem = {
  diretor: string;
  area: string;
  acionamentos: number;
  unidades: string[];
  coordenadores: CoordItem[];
};

type Props = {
  data: DiretorItem[];
};

const DIRECTOR_COLORS: Record<string, string> = {
  "Paulo Cardoso":    "#60a5fa",
  "Clark Pellegrino": "#34d399",
  "Rebeca Hilcko":     "#f472b6",
  "Alex Guagliardi":   "#fb923c",
  "Everton Violeck":  "#a78bfa",
};

function getColor(diretor: string) {
  return DIRECTOR_COLORS[diretor] ?? "#94a3b8";
}

export default function RankingDiretores({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        Sem dados para exibir.
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.acionamentos, 0);
  const max = data[0]?.acionamentos ?? 1;

  function toggleExpand(diretor: string) {
    setExpanded((prev) => (prev === diretor ? null : diretor));
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "rgba(15,42,68,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-8" />
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Diretor</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Área / Diretoria</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Unidades</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Acionamentos</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">% Total</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Participação</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const pct = total ? (item.acionamentos / total) * 100 : 0;
              const barWidth = max ? (item.acionamentos / max) * 100 : 0;
              const color = getColor(item.diretor);
              const isOpen = expanded === item.diretor;

              return (
                <Fragment key={item.diretor}>
                  {/* Linha do Diretor */}
                  <tr
                    key={item.diretor}
                    onClick={() => toggleExpand(item.diretor)}
                    className="transition-colors"
                    style={{
                      cursor: "pointer",
                      background: isOpen ? `${color}0d` : "transparent",
                      borderBottom: isOpen ? "none" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Ícone expand */}
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      <span
                        className="inline-block transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ▶
                      </span>
                    </td>

                    {/* # */}
                    <td className="px-4 py-4 text-sm text-slate-500">{index + 1}</td>

                    {/* Diretor */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{ background: `${color}22`, color }}
                        >
                          {item.diretor.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{item.diretor}</span>
                      </div>
                    </td>

                    {/* Área */}
                    <td className="px-4 py-4 text-sm text-slate-300">{item.area}</td>

                    {/* Unidades */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.unidades.map((u) => (
                          <span
                            key={u}
                            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ background: `${color}18`, color }}
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acionamentos */}
                    <td className="px-4 py-4 text-right text-sm font-bold text-white">
                      {item.acionamentos.toLocaleString("pt-BR")}
                    </td>

                    {/* % */}
                    <td className="px-4 py-4 text-right text-sm text-slate-300">
                      {pct.toFixed(1)}%
                    </td>

                    {/* Barra */}
                    <td className="px-4 py-4" style={{ minWidth: 120 }}>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, background: color }}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Sub-tabela de Coordenadores */}
                  {isOpen && (
                    <tr
                      key={`${item.diretor}-detail`}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td colSpan={8} className="px-0 py-0">
                        <div
                          className="mx-6 mb-4 mt-1 overflow-hidden rounded-lg"
                          style={{
                            background: "rgba(0,0,0,0.2)",
                            border: `1px solid ${color}33`,
                          }}
                        >
                          <table className="w-full border-collapse">
                            <thead>
                              <tr style={{ borderBottom: `1px solid ${color}22` }}>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                                  Coordenador / Equipe
                                </th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                                  Acionamentos
                                </th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                                  % da Diretoria
                                </th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                                  Participação
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.coordenadores.map((coord, ci) => {
                                const coordPct = item.acionamentos
                                  ? (coord.total / item.acionamentos) * 100
                                  : 0;
                                const coordMax = item.coordenadores[0]?.total ?? 1;
                                const coordBar = (coord.total / coordMax) * 100;
                                return (
                                  <tr
                                    key={coord.nome}
                                    style={{
                                      background: ci % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                                    }}
                                  >
                                    <td className="px-4 py-2.5 text-sm text-slate-200">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-1.5 w-1.5 rounded-full"
                                          style={{ background: color }}
                                        />
                                        {coord.nome}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-white">
                                      {coord.total.toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-sm text-slate-400">
                                      {coordPct.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-2.5" style={{ minWidth: 100 }}>
                                      <div
                                        className="h-1.5 w-full overflow-hidden rounded-full"
                                        style={{ background: "rgba(255,255,255,0.06)" }}
                                      >
                                        <div
                                          className="h-full rounded-full"
                                          style={{ width: `${coordBar}%`, background: `${color}99` }}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
