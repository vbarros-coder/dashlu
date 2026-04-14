import { DashboardData, RawDashboardData, Seguradora } from "./types";
import { getUnidadeClassificacao } from "./unidade-map";

/**
 * Adaptador de dados que transforma a resposta bruta do Apps Script (JSON)
 * no formato esperado pelos componentes do dashboard.
 */
export function adaptDashboardData(rawData: RawDashboardData): DashboardData {
  // 1. Adapta as seguradoras
  const seguradoras: Seguradora[] = rawData.seguradoras.map((raw) => {
    return {
      ...raw,
      nome: raw.seguradora || "Desconhecida",
      area: "Múltiplas",
      diretoria: "Múltiplas",
      coordenador: "Múltiplo",
      time: "Múltiplos",
      diretor: "Múltiplos",
    };
  });

  return {
    seguradoras,
    evolucaoMensal: rawData.evolucaoMensal,
    rows: rawData.rows || [],
    config: rawData.config,
    meta: rawData.meta,
    debug: rawData.debug,
  };
}
