import { RawDashboardData } from "./types";

/**
 * Dados de simulação baseados na ESTRUTURA REAL da planilha.
 * Unidades: Property 1, 3, 4, 5, RCG1, RCP1, Garantia, Transportes.
 */
export const rawMockData: RawDashboardData = {
  config: {
    anos: ["2024"],
    meses: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    unidades: ["Property 1", "Property 3", "Property 4", "Property 5", "RCG1", "RCP1", "Garantia", "Transportes"],
    diretorias: ["Diretoria 1", "Diretoria 2"],
    areas: ["Área 1", "Área 2"],
  },
  rows: [],
  meta: {
    totalLinhas: 0,
    abasLidas: [],
    atualizadoEm: new Date().toISOString(),
  },
  seguradoras: [
    { 
      data: "2024-01-15", 
      numeroSeguradora: "1010", 
      seguradora: "Porto Seguro", 
      segurado: "Empresa Alfa", 
      unidade: "Property 1", 
      acionamentos: 450, 
      variacao: 5.2 
    },
    { 
      data: "2024-01-16", 
      numeroSeguradora: "2020", 
      seguradora: "Bradesco Seguros", 
      segurado: "Condomínio Beta", 
      unidade: "Property 3", 
      acionamentos: 380, 
      variacao: -2.1 
    },
    { 
      data: "2024-01-17", 
      numeroSeguradora: "3030", 
      seguradora: "Allianz", 
      segurado: "Indústria Gama", 
      unidade: "RCG1", 
      acionamentos: 310, 
      variacao: 8.7 
    },
    { 
      data: "2024-01-18", 
      numeroSeguradora: "4040", 
      seguradora: "SulAmérica", 
      segurado: "Frota Delta", 
      unidade: "Garantia", 
      acionamentos: 280, 
      variacao: 1.4 
    },
    { 
      data: "2024-01-19", 
      numeroSeguradora: "5050", 
      seguradora: "Tokio Marine", 
      segurado: "Logística Epsilon", 
      unidade: "Transportes", 
      acionamentos: 220, 
      variacao: -4.3 
    },
    { 
      data: "2024-01-20", 
      numeroSeguradora: "6060", 
      seguradora: "HDI Seguros", 
      segurado: "Pessoa Física Zeta", 
      unidade: "RCP1", 
      acionamentos: 190, 
      variacao: 3.9 
    },
    { 
      data: "2024-01-21", 
      numeroSeguradora: "7070", 
      seguradora: "Mapfre", 
      segurado: "Comércio Eta", 
      unidade: "Property 4", 
      acionamentos: 150, 
      variacao: 6.5 
    },
    { 
      data: "2024-01-22", 
      numeroSeguradora: "8080", 
      seguradora: "Liberty Seguros", 
      segurado: "Serviços Theta", 
      unidade: "Property 5", 
      acionamentos: 120, 
      variacao: -1.8 
    },
  ],
  evolucaoMensal: [
    { mes: "Jan", total: 2100, "Porto Seguro": 450, "Bradesco Seguros": 380, "Allianz": 310, "SulAmérica": 280 },
    { mes: "Fev", total: 1950, "Porto Seguro": 420, "Bradesco Seguros": 360, "Allianz": 290, "SulAmérica": 260 },
    { mes: "Mar", total: 2200, "Porto Seguro": 480, "Bradesco Seguros": 400, "Allianz": 330, "SulAmérica": 300 },
  ],
};

// Manteve-se calcKpis e gerarCSV por compatibilidade (embora o dashboard agora use analytics.ts)
import { KpiResult, Seguradora, EvolucaoMensal } from "./types";

export function calcKpis(
  filteredSeguradoras: Seguradora[],
  filteredEvolucao: EvolucaoMensal[],
): KpiResult {
  // Lógica legada se necessária para componentes menores
  const total = filteredSeguradoras.reduce((s, d) => s + d.acionamentos, 0);
  const count = filteredSeguradoras.length;
  const sorted = [...filteredSeguradoras].sort((a, b) => b.acionamentos - a.acionamentos);
  const top = sorted[0];

  return { 
    total, 
    count, 
    top, 
    media: 0, 
    topUnidade: "–", 
    topUnidadeTotal: 0,
    topTime: "–",
    topTimeTotal: 0,
    topArea: "–",
    topAreaTotal: 0,
    topDiretor: "–",
    topDiretorTotal: 0,
    timeMaiorCrescimento: null,
    seguradoraMaiorCrescimento: null,
    seguradoraMaiorQueda: null
  };
}

export function gerarCSV(
  dados: Seguradora[],
  ano: string,
  mes: string,
): string {
  const periodo = mes ? `${mes}/${ano}` : `Ano ${ano}`;
  const cabecalho = ["Data", "Nº Seguradora", "Seguradora", "Segurado", "Unidade", "Acionamentos", "Variação (%)"].join(",");
  const linhas = dados.map((s) =>
    [s.data, s.numeroSeguradora, `"${s.nome}"`, `"${s.segurado}"`, `"${s.unidade}"`, s.acionamentos, s.variacao].join(","),
  );
  return [cabecalho, ...linhas].join("\n");
}
