// Tipos para o módulo Time Sheet

export interface TimeSheetItem {
  numeroAddvalora: string;
  segurado: string;
  regulador: string;
  tempoMinutos: number;
  valor: number;
  dataTimeSheet: string;
  operacao: string;
  // Campos de enriquecimento via organograma
  diretoria: string;
  coordenador: string;
  equipe: string;
}

export interface OperacaoResumo {
  operacao: string;
  quantidadeTimeSheets: number;
  valorTotal: number;
}

export interface ParsedTimesheetData {
  resumoPorOperacao: OperacaoResumo[];
  itensDetalhados: TimeSheetItem[];
  totalGeral: {
    quantidadeTotal: number;
    valorTotal: number;
  };
}

export interface FiltrosTimesheet {
  operacao: string | null;
  diretoria: string | null;
  coordenador: string | null;
  equipe: string | null;
  regulador: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  busca: string;
}
