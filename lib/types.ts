/**
 * Tipos para os dados brutos vindos do Google Apps Script
 */
export interface RawDashboardData {
  seguradoras: RawSeguradora[];
  evolucaoMensal: RawEvolucaoMensal[];
  rows: RawRow[];
  config: {
    anos: string[];
    meses: string[];
    unidades: string[];
    diretorias: string[];
    areas: string[];
  };
  meta: {
    totalLinhas: number;
    abasLidas: string[];
    atualizadoEm: string;
  };
  debug?: any;
}

export interface RawRow {
  data: string;
  ano: string;
  mes: string;
  numeroSeguradora: string;
  seguradora: string;
  segurado: string;
  unidade: string;
  area: string;
  diretoria: string;
  diretora: string;
  coordenador: string;
  observacoes: string;
  coordenadorAceitou: string;
  abaOrigem: string;
  // Campo especial para diretorias que usam agregação por quantidade (ex: RCP)
  quantidade?: number;
  // Marca linhas mensais agregadas (RCP/Everton) — filtro de período usa mês, não dia
  isMonthlyAggregated?: boolean;
}

export interface RawSeguradora {
  data: string;
  numeroSeguradora: string | number;
  seguradora: string; // "Nome da Seguradora" na planilha
  segurado: string;   // "Nome do Segurado" na planilha
  unidade: string;
  observacoes?: string;
  coordenadorAceitou?: string;
  acionamentos: number; // Campo calculado ou presente no JSON consolidado
  variacao: number;     // Campo calculado ou presente no JSON consolidado
}

export interface RawEvolucaoMensal {
  mes: string;
  total: number;
  [key: string]: string | number;
}

/**
 * Tipos para a camada de classificação de unidades
 */
export type UnidadeCategoria = 'time' | 'tipo' | 'area' | 'diretor';

export interface UnidadeMapping {
  unidade: string;
  time: string;
  tipo: string;
  area: string;
  diretor: string;
}

/**
 * Tipos processados para o Dashboard (Consumidos pelos componentes)
 */
export interface DashboardData {
  seguradoras: Seguradora[];
  evolucaoMensal: EvolucaoMensal[];
  rows: RawRow[];
  config: {
    anos: string[];
    meses: string[];
    unidades: string[];
    diretorias: string[];
    areas: string[];
  };
  meta: {
    totalLinhas: number;
    abasLidas: string[];
    atualizadoEm: string;
  };
  debug?: any;
}

export interface Seguradora extends RawSeguradora {
  nome: string; 
  area: string;
  diretoria: string;
  coordenador: string;
  time: string;
  diretor: string;
}

export interface EvolucaoMensal extends RawEvolucaoMensal {}

export interface KpiResult {
  total: number;
  count: number;
  top: Seguradora | undefined;
  media: number;
  topUnidade: string;
  topUnidadeTotal: number;
  // Novos KPIs
  topTime: string;
  topTimeTotal: number;
  topArea: string;
  topAreaTotal: number;
  topDiretor: string;
  topDiretorTotal: number;
  timeMaiorCrescimento: { nome: string; pct: number } | null;
  seguradoraMaiorCrescimento: { nome: string; pct: number } | null;
  seguradoraMaiorQueda: { nome: string; pct: number } | null;
}

export type InsightType = "success" | "warning" | "danger" | "info";

export interface Insight {
  type: InsightType;
  titulo: string;
  corpo: string;
  tag: string;
}

export interface DashboardInsights {
  lideranca: Insight[];
  crescimento: Insight[];
  queda: Insight[];
  operacional: Insight[];
  textoExecutivo: string;
}

/**
 * Tipos para Mercado Financeiro
 */
export interface MercadoFinanceiroItem {
  indice: string;
  ticker: string;
  precoFormatado: string;
  variacaoFormatada: string;
  ultimaNegociacao: string;
  status: string;
}

export interface MercadoFinanceiroResponse {
  ok: boolean;
  items: MercadoFinanceiroItem[];
}
