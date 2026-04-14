export type SeguradoraItem = {
  id: string;
  nome: string;
  acionamentos: number;
  variacao: number;
  unidade: string;
};

export type EvolucaoMensalItem = {
  mes: string;
  totalGeral: number;
  [key: string]: string | number;
};

export type RawRow = {
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
};

export type DashboardResponse = {
  seguradoras: SeguradoraItem[];
  evolucaoMensal: EvolucaoMensalItem[];
  rows: RawRow[];
  config: {
    anos: string[];
    meses: string[];
    unidades: string[];
  };
  meta: {
    totalLinhas: number;
    abasLidas: string[];
    atualizadoEm: string;
  };
};

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro no servidor de origem (Google): ${response.status}\nPreview: ${text.slice(0, 300)}`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.seguradoras) || !Array.isArray(data.evolucaoMensal)) {
    throw new Error("Resposta do Apps Script em formato inválido.");
  }

  return data;
}