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

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

// Dados vazios para quando o endpoint falhar
const EMPTY_RESPONSE: DashboardResponse = {
  seguradoras: [],
  evolucaoMensal: [],
  rows: [],
  config: {
    anos: ["2026"],
    meses: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    unidades: [],
  },
  meta: {
    totalLinhas: 0,
    abasLidas: [],
    atualizadoEm: new Date().toISOString(),
  },
};

export async function fetchDashboardData(): Promise<DashboardResponse> {
  // Se não tiver URL configurada, retorna dados vazios
  if (!APPS_SCRIPT_URL) {
    console.warn("[Dashboard] NEXT_PUBLIC_APPS_SCRIPT_URL não configurado");
    return EMPTY_RESPONSE;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[Dashboard] Erro HTTP:", response.status);
      return EMPTY_RESPONSE;
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.seguradoras) || !Array.isArray(data.evolucaoMensal)) {
      console.warn("[Dashboard] Resposta em formato inválido");
      return EMPTY_RESPONSE;
    }

    return data;
  } catch (err) {
    console.warn("[Dashboard] Erro ao buscar dados:", err);
    return EMPTY_RESPONSE;
  }
}