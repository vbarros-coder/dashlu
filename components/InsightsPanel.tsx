"use client";

import { useState, useMemo } from "react";

interface InsightItem {
  tipo: "lideranca" | "crescimento" | "queda" | "alerta";
  tag: string;
  titulo: string;
  descricao: string;
  entidade?: string; // nome da seguradora, unidade, etc.
  dados?: {
    atual?: number;
    anterior?: number;
    percentual?: number;
    mesAtual?: string;
    mesAnterior?: string;
  };
}

interface InsightsPanelProps {
  filteredRows: Array<{
    data: string;
    mes: string;
    ano: string;
    seguradora: string;
    unidade: string;
    area: string;
    diretoria: string;
    segurado?: string;
    observacoes?: string;
  }>;
  totalAcionamentos: number;
}

interface ModalData {
  item: InsightItem;
  detalhamento: {
    titulo: string;
    linhas: Array<{ label: string; valor: string; destaque?: boolean }>;
    tabela?: Array<{ col1: string; col2: string; col3?: string }>;
    explicacao: string;
  };
}

export default function InsightsPanel({ filteredRows, totalAcionamentos }: InsightsPanelProps) {
  const [modalAberto, setModalAberto] = useState<ModalData | null>(null);

  const insights = useMemo(() => {
    if (!filteredRows.length) return null;

    // Agrupar por seguradora
    const porSeguradora = filteredRows.reduce((acc, row) => {
      if (!acc[row.seguradora]) acc[row.seguradora] = 0;
      acc[row.seguradora]++;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por unidade/time
    const porUnidade = filteredRows.reduce((acc, row) => {
      if (!acc[row.unidade]) acc[row.unidade] = 0;
      acc[row.unidade]++;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por área
    const porArea = filteredRows.reduce((acc, row) => {
      if (!acc[row.area]) acc[row.area] = 0;
      acc[row.area]++;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por mês para calcular variações
    const porMes = filteredRows.reduce((acc, row) => {
      const chave = `${row.ano}-${row.mes}`;
      if (!acc[chave]) acc[chave] = { mes: row.mes, ano: row.ano, total: 0, porSeguradora: {}, porUnidade: {} };
      acc[chave].total++;
      if (!acc[chave].porSeguradora[row.seguradora]) {
        acc[chave].porSeguradora[row.seguradora] = 0;
      }
      acc[chave].porSeguradora[row.seguradora]++;
      if (!acc[chave].porUnidade[row.unidade]) {
        acc[chave].porUnidade[row.unidade] = 0;
      }
      acc[chave].porUnidade[row.unidade]++;
      return acc;
    }, {} as Record<string, { 
      mes: string; 
      ano: string; 
      total: number; 
      porSeguradora: Record<string, number>;
      porUnidade: Record<string, number>;
    }>);

    const mesesOrdenados = Object.values(porMes).sort((a, b) => {
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
      return meses.indexOf(a.mes) - meses.indexOf(b.mes);
    });

    // LIDERANÇA
    const topSeguradora = Object.entries(porSeguradora)
      .sort((a, b) => b[1] - a[1])[0];
    
    const topUnidade = Object.entries(porUnidade)
      .sort((a, b) => b[1] - a[1])[0];

    const lideranca: InsightItem[] = [];
    if (topSeguradora) {
      const percentual = ((topSeguradora[1] / totalAcionamentos) * 100).toFixed(1);
      lideranca.push({
        tipo: "lideranca",
        tag: "TOP SEGURADORA",
        titulo: `${topSeguradora[0]} lidera o volume`,
        descricao: `${topSeguradora[1].toLocaleString("pt-BR")} acionamentos (${percentual}% do total).`,
        entidade: topSeguradora[0],
      });
    }
    if (topUnidade) {
      lideranca.push({
        tipo: "lideranca",
        tag: "TIME LÍDER",
        titulo: `${topUnidade[0]} em destaque`,
        descricao: `Lidera a operação atual com ${topUnidade[1].toLocaleString("pt-BR")} acionamentos.`,
        entidade: topUnidade[0],
      });
    }

    // CRESCIMENTO
    const crescimento: InsightItem[] = [];
    if (mesesOrdenados.length >= 2) {
      const mesAtual = mesesOrdenados[mesesOrdenados.length - 1];
      const mesAnterior = mesesOrdenados[mesesOrdenados.length - 2];

      // Calcular crescimento por seguradora
      const crescimentoPorSeguradora = Object.keys(mesAtual.porSeguradora).map(seg => {
        const atual = mesAtual.porSeguradora[seg] || 0;
        const anterior = mesAnterior.porSeguradora[seg] || 0;
        const variacao = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
        return { seguradora: seg, variacao, atual, anterior };
      }).filter(s => s.variacao > 0).sort((a, b) => b.variacao - a.variacao);

      if (crescimentoPorSeguradora.length > 0) {
        const topCrescimento = crescimentoPorSeguradora[0];
        crescimento.push({
          tipo: "crescimento",
          tag: "ALTA SEGURADORA",
          titulo: `${topCrescimento.seguradora} em alta`,
          descricao: `Crescimento real de +${topCrescimento.variacao.toFixed(1)}% no período.`,
          entidade: topCrescimento.seguradora,
          dados: {
            atual: topCrescimento.atual,
            anterior: topCrescimento.anterior,
            percentual: topCrescimento.variacao,
            mesAtual: mesAtual.mes,
            mesAnterior: mesAnterior.mes,
          }
        });
      }
    }

    // QUEDA (ALERTA)
    const queda: InsightItem[] = [];
    if (mesesOrdenados.length >= 2) {
      const mesAtual = mesesOrdenados[mesesOrdenados.length - 1];
      const mesAnterior = mesesOrdenados[mesesOrdenados.length - 2];

      // Calcular queda por seguradora
      const quedaPorSeguradora = Object.keys(mesAnterior.porSeguradora).map(seg => {
        const atual = mesAtual.porSeguradora[seg] || 0;
        const anterior = mesAnterior.porSeguradora[seg] || 0;
        const variacao = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
        return { seguradora: seg, variacao, atual, anterior };
      }).filter(s => s.variacao < -10).sort((a, b) => a.variacao - b.variacao);

      if (quedaPorSeguradora.length > 0) {
        const topQueda = quedaPorSeguradora[0];
        queda.push({
          tipo: "queda",
          tag: "ALERTA CRÍTICO",
          titulo: `Retração em ${topQueda.seguradora}`,
          descricao: `Queda de ${topQueda.variacao.toFixed(1)}% detectada na base. Recomenda-se ação comercial.`,
          entidade: topQueda.seguradora,
          dados: {
            atual: topQueda.atual,
            anterior: topQueda.anterior,
            percentual: topQueda.variacao,
            mesAtual: mesAtual.mes,
            mesAnterior: mesAnterior.mes,
          }
        });
      }
    }

    // ALERTAS OPERACIONAIS
    const alertas: InsightItem[] = [];
    
    // Concentração excessiva
    if (topSeguradora) {
      const percentual = (topSeguradora[1] / totalAcionamentos) * 100;
      if (percentual > 40) {
        alertas.push({
          tipo: "alerta",
          tag: "RISCO CONCENTRAÇÃO",
          titulo: `Dependência Excessiva`,
          descricao: `A seguradora ${topSeguradora[0]} concentra mais de 40% da operação atual.`,
          entidade: topSeguradora[0],
        });
      }
    }

    // Área líder
    const topArea = Object.entries(porArea).sort((a, b) => b[1] - a[1])[0];
    if (topArea) {
      const percentual = ((topArea[1] / totalAcionamentos) * 100).toFixed(1);
      alertas.push({
        tipo: "alerta",
        tag: "ÁREA LÍDER",
        titulo: `Região ${topArea[0]} com maior demanda`,
        descricao: `Concentra ${percentual}% dos acionamentos filtrados.`,
        entidade: topArea[0],
      });
    }

    return { lideranca, crescimento, queda, alertas, mesesOrdenados, porMes };
  }, [filteredRows, totalAcionamentos]);

  const handleCardClick = (item: InsightItem) => {
    if (!insights) return;

    let detalhamento: ModalData["detalhamento"];

    switch (item.tipo) {
      case "lideranca":
        if (item.tag === "TOP SEGURADORA") {
          // Calcular evolução da seguradora líder
          const evolucao = insights.mesesOrdenados.map(m => ({
            mes: `${m.mes}/${m.ano}`,
            valor: m.porSeguradora[item.entidade || ""] || 0
          }));
          
          detalhamento = {
            titulo: `Análise: ${item.entidade}`,
            linhas: [
              { label: "Total no período", valor: item.descricao.split(" acionamentos")[0], destaque: true },
              { label: "Participação", valor: item.descricao.match(/\d+\.?\d*%/)?.[0] || "" },
              { label: "Média mensal", valor: Math.round(evolucao.reduce((a, b) => a + b.valor, 0) / evolucao.length).toString() },
            ],
            tabela: [
              { col1: "Mês", col2: "Acionamentos", col3: "% do Total" },
              ...evolucao.map(e => ({
                col1: e.mes,
                col2: e.valor.toString(),
                col3: `${((e.valor / totalAcionamentos) * 100).toFixed(1)}%`
              }))
            ],
            explicacao: `A ${item.entidade} é a seguradora com maior volume de acionamentos no período analisado. ${evolucao[evolucao.length - 1]?.valor > evolucao[0]?.valor ? "Há tendência de crescimento ao longo do tempo." : "Acompanhe a evolução mensal para identificar sazonalidades."}`
          };
        } else {
          // Time líder
          const unidadeRows = filteredRows.filter(r => r.unidade === item.entidade);
          const porMesUnidade = unidadeRows.reduce((acc, row) => {
            const chave = `${row.ano}-${row.mes}`;
            acc[chave] = (acc[chave] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          detalhamento = {
            titulo: `Análise: ${item.entidade}`,
            linhas: [
              { label: "Total no período", valor: item.descricao.match(/\d+/)?.[0] || "", destaque: true },
              { label: "% do total geral", valor: `${((unidadeRows.length / totalAcionamentos) * 100).toFixed(1)}%` },
              { label: "Diretoria", valor: unidadeRows[0]?.diretoria || "N/A" },
            ],
            tabela: [
              { col1: "Mês", col2: "Acionamentos" },
              ...Object.entries(porMesUnidade).map(([mes, val]) => ({
                col1: mes,
                col2: val.toString()
              }))
            ],
            explicacao: `A unidade ${item.entidade} lidera em volume de acionamentos. Este desempenho pode estar relacionado à carteira de clientes ativa, sazonalidade do setor ou campanhas recentes.`
          };
        }
        break;

      case "crescimento":
        detalhamento = {
          titulo: `Análise de Crescimento: ${item.entidade}`,
          linhas: [
            { label: "Mês anterior", valor: `${item.dados?.mesAnterior}: ${item.dados?.anterior} acionamentos` },
            { label: "Mês atual", valor: `${item.dados?.mesAtual}: ${item.dados?.atual} acionamentos`, destaque: true },
            { label: "Variação", valor: `+${item.dados?.percentual?.toFixed(1)}%`, destaque: true },
          ],
          explicacao: `O crescimento de ${item.dados?.percentual?.toFixed(1)}% pode ser explicado por: novos contratos ativados, aumento de sinistralidade no setor, sazonalidade típica do período, ou ações comerciais recentes. Recomenda-se verificar novos segurados e renovações de contratos.`
        };
        break;

      case "queda":
        // Identificar possíveis causas
        const seguradoraRows = filteredRows.filter(r => r.seguradora === item.entidade);
        const mesesComDados = [...new Set(seguradoraRows.map(r => `${r.ano}-${r.mes}`))];
        
        detalhamento = {
          titulo: `Análise de Queda: ${item.entidade}`,
          linhas: [
            { label: "Mês anterior", valor: `${item.dados?.mesAnterior}: ${item.dados?.anterior} acionamentos` },
            { label: "Mês atual", valor: `${item.dados?.mesAtual}: ${item.dados?.atual} acionamentos`, destaque: true },
            { label: "Queda", valor: `${item.dados?.percentual?.toFixed(1)}%`, destaque: true },
            { label: "Meses com atividade", valor: mesesComDados.length.toString() },
          ],
          explicacao: `A queda de ${Math.abs(item.dados?.percentual || 0).toFixed(1)}% pode indicar: redução de carteira, migração de clientes para concorrentes, melhoria na prevenção de sinistros, ou sazonalidade negativa. ${item.dados?.atual === 0 ? "ATENÇÃO: Nenhum acionamento no mês atual - verificar se há suspensão de contratos ou problemas operacionais." : "Recomenda-se contato comercial para entender a retenção de clientes."}`
        };
        break;

      case "alerta":
        if (item.tag === "RISCO CONCENTRAÇÃO") {
          const segRows = filteredRows.filter(r => r.seguradora === item.entidade);
          const percentual = ((segRows.length / totalAcionamentos) * 100).toFixed(1);
          
          detalhamento = {
            titulo: `Alerta de Concentração: ${item.entidade}`,
            linhas: [
              { label: "Seguradora", valor: item.entidade || "", destaque: true },
              { label: "Acionamentos", valor: segRows.length.toString() },
              { label: "Do total", valor: `${percentual}%`, destaque: true },
              { label: "Unidades atendidas", valor: [...new Set(segRows.map(r => r.unidade))].length.toString() },
            ],
            explicacao: `Concentração acima de 40% representa risco operacional. Se houver perda desta carteira, o impacto será significativo. Recomenda-se: diversificar carteira, renegociar contratos, e desenvolver plano de contingência.`
          };
        } else {
          const areaRows = filteredRows.filter(r => r.area === item.entidade);
          detalhamento = {
            titulo: `Análise de Área: ${item.entidade}`,
            linhas: [
              { label: "Área", valor: item.entidade || "", destaque: true },
              { label: "Acionamentos", valor: areaRows.length.toString() },
              { label: "Do total", valor: item.descricao.match(/\d+\.?\d*%/)?.[0] || "" },
              { label: "Unidades", valor: [...new Set(areaRows.map(r => r.unidade))].length.toString() },
            ],
            explicacao: `A área ${item.entidade} concentra a maior demanda. Isso pode indicar: maior exposição a riscos, volume maior de contratos, ou características regionais específicas. Avaliar necessidade de reforço operacional nesta região.`
          };
        }
        break;

      default:
        detalhamento = {
          titulo: item.titulo,
          linhas: [{ label: "Descrição", valor: item.descricao }],
          explicacao: "Clique para ver detalhes."
        };
    }

    setModalAberto({ item, detalhamento });
  };

  if (!insights) return null;

  const colunas = [
    { titulo: "LIDERANÇA", items: insights.lideranca, cor: "#3b82f6" },
    { titulo: "CRESCIMENTO", items: insights.crescimento, cor: "#10b981" },
    { titulo: "QUEDA (ALERTA)", items: insights.queda, cor: "#ef4444" },
    { titulo: "ALERTAS OPERACIONAIS", items: insights.alertas, cor: "#f59e0b" },
  ];

  return (
    <>
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {colunas.map((coluna, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {coluna.titulo}
              </h3>
              {coluna.items.length > 0 ? (
                coluna.items.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleCardClick(item)}
                    className="rounded-lg p-4 transition-all hover:opacity-90 cursor-pointer hover:scale-[1.02]"
                    style={{
                      background: item.tipo === "lideranca" ? "rgba(59,130,246,0.08)" :
                                 item.tipo === "crescimento" ? "rgba(16,185,129,0.08)" :
                                 item.tipo === "queda" ? "rgba(239,68,68,0.08)" :
                                 "rgba(245,158,11,0.08)",
                      border: `1px solid ${item.tipo === "lideranca" ? "rgba(59,130,246,0.15)" :
                                       item.tipo === "crescimento" ? "rgba(16,185,129,0.15)" :
                                       item.tipo === "queda" ? "rgba(239,68,68,0.15)" :
                                       "rgba(245,158,11,0.15)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wider"
                        style={{
                          color: item.tipo === "lideranca" ? "#60a5fa" :
                                 item.tipo === "crescimento" ? "#34d399" :
                                 item.tipo === "queda" ? "#f87171" :
                                 "#fbbf24"
                        }}
                      >
                        {item.tag}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-600">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 mt-1.5">
                      {item.titulo}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.descricao}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 italic">
                      Clique para analisar →
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="rounded-lg p-4"
                  style={{
                    background: "rgba(15,42,68,0.3)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p className="text-xs text-slate-600 italic">
                    Nenhum dado significativo no período.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Detalhamento */}
      {modalAberto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setModalAberto(null)}
        >
          <div 
            className="w-full max-w-lg max-h-[80vh] overflow-auto rounded-xl p-6" 
            style={{ background: "#0F2A44", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{modalAberto.detalhamento.titulo}</h2>
              <button
                onClick={() => setModalAberto(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Linhas de dados */}
            <div className="space-y-3 mb-6">
              {modalAberto.detalhamento.linhas.map((linha, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: linha.destaque ? "rgba(245,130,32,0.1)" : "rgba(255,255,255,0.03)" }}
                >
                  <span className="text-sm text-slate-400">{linha.label}</span>
                  <span className={`text-sm font-medium ${linha.destaque ? 'text-white' : 'text-slate-300'}`}>{linha.valor}</span>
                </div>
              ))}
            </div>

            {/* Tabela opcional */}
            {modalAberto.detalhamento.tabela && modalAberto.detalhamento.tabela.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Evolução Detalhada</h4>
                <div className="overflow-hidden rounded-lg border border-white/5">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                        {Object.keys(modalAberto.detalhamento.tabela[0]).map((key) => (
                          <th key={key} className="text-left p-3 text-xs font-medium text-slate-400 uppercase">
                            {key === 'col1' ? 'Período' : key === 'col2' ? 'Valor' : '%'}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modalAberto.detalhamento.tabela.slice(1).map((row, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="p-3 text-sm text-slate-300">{row.col1}</td>
                          <td className="p-3 text-sm text-white font-medium">{row.col2}</td>
                          {row.col3 && <td className="p-3 text-sm text-slate-400">{row.col3}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Explicação/Justificativa */}
            <div className="p-4 rounded-lg" style={{ background: "rgba(245,130,32,0.05)", border: "1px solid rgba(245,130,32,0.2)" }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#F58220" }}>
                Análise e Recomendação
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {modalAberto.detalhamento.explicacao}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
