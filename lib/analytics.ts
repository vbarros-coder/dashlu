import { Seguradora, EvolucaoMensal, KpiResult, DashboardInsights, Insight } from "./types";

/**
 * Calcula os KPIs consolidados respeitando os filtros aplicados.
 */
export function calculateKPIs(
  filteredSeguradoras: Seguradora[],
  filteredEvolucao: EvolucaoMensal[]
): KpiResult {
  const total = filteredSeguradoras.reduce((s, d) => s + d.acionamentos, 0);
  const count = new Set(filteredSeguradoras.map(s => s.nome)).size;
  const sorted = [...filteredSeguradoras].sort((a, b) => b.acionamentos - a.acionamentos);
  const top = sorted[0];

  const media =
    filteredEvolucao.length > 0
      ? Math.round(filteredEvolucao.reduce((s, m) => s + m.total, 0) / filteredEvolucao.length)
      : 0;

  // Helper para agrupar e encontrar o líder
  const getLeader = (dimension: keyof Seguradora) => {
    if (filteredSeguradoras.length === 0) return { name: "–", total: 0 };
    const grouped = filteredSeguradoras.reduce<Record<string, number>>((acc, s) => {
      const val = String(s[dimension] || "Não Mapeado");
      acc[val] = (acc[val] ?? 0) + s.acionamentos;
      return acc;
    }, {});
    const topEntry = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    return { 
      name: topEntry?.[0] ?? "–", 
      total: topEntry?.[1] ?? 0 
    };
  };

  const leaderUnidade = getLeader("unidade");
  const leaderTime = getLeader("time");
  const leaderArea = getLeader("area");
  const leaderDiretor = getLeader("diretor");

  // Crescimento e Queda (Seguradoras)
  const sortedByGrowth = [...filteredSeguradoras].filter(s => s.variacao !== 0).sort((a, b) => b.variacao - a.variacao);
  const seguradoraMaiorCrescimento = sortedByGrowth[0]?.variacao > 0 
    ? { nome: sortedByGrowth[0].nome, pct: sortedByGrowth[0].variacao } 
    : null;
  const seguradoraMaiorQueda = sortedByGrowth[sortedByGrowth.length - 1]?.variacao < 0 
    ? { nome: sortedByGrowth[sortedByGrowth.length - 1].nome, pct: sortedByGrowth[sortedByGrowth.length - 1].variacao } 
    : null;

  // Crescimento (Times)
  const timeGrowth = filteredSeguradoras.reduce<Record<string, { soma: number, count: number }>>((acc, s) => {
    if (!acc[s.time]) acc[s.time] = { soma: 0, count: 0 };
    acc[s.time].soma += s.variacao;
    acc[s.time].count += 1;
    return acc;
  }, {});
  
  const timeGrowthRanked = Object.entries(timeGrowth)
    .map(([nome, stats]) => ({ nome, pct: parseFloat((stats.soma / stats.count).toFixed(1)) }))
    .filter(t => t.pct !== 0)
    .sort((a, b) => b.pct - a.pct);

  const timeMaiorCrescimento = timeGrowthRanked[0]?.pct > 0 ? timeGrowthRanked[0] : null;

  return {
    total,
    count,
    top,
    media,
    topUnidade: leaderUnidade.name,
    topUnidadeTotal: leaderUnidade.total,
    topTime: leaderTime.name,
    topTimeTotal: leaderTime.total,
    topArea: leaderArea.name,
    topAreaTotal: leaderArea.total,
    topDiretor: leaderDiretor.name,
    topDiretorTotal: leaderDiretor.total,
    timeMaiorCrescimento,
    seguradoraMaiorCrescimento,
    seguradoraMaiorQueda
  };
}

/**
 * Gera os insights gerenciais e o texto executivo.
 */
export function generateInsights(
  kpis: KpiResult,
  filteredSeguradoras: Seguradora[],
  selectedMes: string,
  selectedAno: string
): DashboardInsights {
  const lideranca: Insight[] = [];
  const crescimento: Insight[] = [];
  const queda: Insight[] = [];
  const operacional: Insight[] = [];

  // 1. Liderança
  if (kpis.top) {
    lideranca.push({
      type: "info",
      tag: "Top Seguradora",
      titulo: `${kpis.top.nome} lidera o volume`,
      corpo: `${kpis.top.acionamentos.toLocaleString("pt-BR")} acionamentos (${((kpis.top.acionamentos / kpis.total) * 100).toFixed(1)}% do total).`,
    });
  }
  lideranca.push({
    type: "info",
    tag: "Time Líder",
    titulo: `Time ${kpis.topTime} em destaque`,
    corpo: `Lidera a operação atual com ${kpis.topTimeTotal.toLocaleString("pt-BR")} acionamentos.`,
  });

  // 2. Crescimento
  if (kpis.seguradoraMaiorCrescimento) {
    crescimento.push({
      type: "success",
      tag: "Alta Seguradora",
      titulo: `${kpis.seguradoraMaiorCrescimento.nome} em alta`,
      corpo: `Crescimento real de +${kpis.seguradoraMaiorCrescimento.pct}% no período.`,
    });
  } else {
    crescimento.push({
      type: "info",
      tag: "Status",
      titulo: "Sem altas significativas",
      corpo: "Não foram detectados crescimentos relevantes no filtro atual.",
    });
  }

  // 3. Queda
  if (kpis.seguradoraMaiorQueda) {
    queda.push({
      type: "danger",
      tag: "Alerta Crítico",
      titulo: `Retração em ${kpis.seguradoraMaiorQueda.nome}`,
      corpo: `Queda de ${kpis.seguradoraMaiorQueda.pct}% detectada na base. Recomenda-se ação comercial.`,
    });
  }

  // 4. Operacional & Alertas
  if (kpis.top && (kpis.top.acionamentos / kpis.total) > 0.4) {
    operacional.push({
      type: "warning",
      tag: "Risco Concentração",
      titulo: "Dependência Excessiva",
      corpo: `A seguradora ${kpis.top.nome} concentra mais de 40% da operação atual.`,
    });
  }
  operacional.push({
    type: "info",
    tag: "Área Líder",
    titulo: `Região ${kpis.topArea} com maior demanda`,
    corpo: `Concentra ${((kpis.topAreaTotal / kpis.total) * 100).toFixed(1)}% dos acionamentos filtrados.`,
  });

  // Texto Executivo
  const periodo = selectedMes ? `${selectedMes}/${selectedAno}` : `o ano de ${selectedAno}`;
  const partes = [];
  
  if (kpis.top) {
    partes.push(`${kpis.top.nome} lidera ${periodo} com ${((kpis.top.acionamentos / kpis.total) * 100).toFixed(1)}% do volume total.`);
  }
  if (kpis.seguradoraMaiorCrescimento) {
    partes.push(`${kpis.seguradoraMaiorCrescimento.nome} apresenta maior crescimento (+${kpis.seguradoraMaiorCrescimento.pct}%).`);
  }
  if (kpis.seguradoraMaiorQueda) {
    partes.push(`${kpis.seguradoraMaiorQueda.nome} apresenta queda relevante (${kpis.seguradoraMaiorQueda.pct}%).`);
  } else {
    partes.push("Não há quedas críticas registradas para o período.");
  }
  partes.push(`A unidade ${kpis.topUnidade} e a área ${kpis.topArea} concentram o maior peso operacional.`);

  return {
    lideranca,
    crescimento,
    queda,
    operacional,
    textoExecutivo: partes.join(" ")
  };
}

/**
 * Retorna o ranking agrupado por uma dimensão específica.
 */
export function getRankingPorDimensao(data: Seguradora[], dimension: keyof Seguradora) {
  const grouped = data.reduce<Record<string, number>>((acc, s) => {
    const key = String(s[dimension] || "Não Mapeado");
    acc[key] = (acc[key] ?? 0) + s.acionamentos;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([nome, acionamentos]) => ({ nome, acionamentos }))
    .sort((a, b) => b.acionamentos - a.acionamentos);
}
