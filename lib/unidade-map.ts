export type UnidadeClassificacao = {
  time: string;
  tipo: string;
  area: string;
  diretor: string;
  coordenador: string;
};

/** Diretores oficiais do organograma (usados para garantir presença no ranking) */
export const DIRETORES_OFICIAIS: { diretor: string; area: string }[] = [
  { diretor: "Paulo Cardoso",    area: "Property / Construção" },
  { diretor: "Clark Pellegrino", area: "Engenharia / Transportes" },
  { diretor: "Rebeca Hilcko",     area: "Garantia" },
  { diretor: "Alex Guagliardi",   area: "Responsabilidade Civil Geral" },
  { diretor: "Everton Voleck",  area: "Responsabilidade Civil Profissional" },
];

/**
 * Mapeamento baseado no organograma real.
 * Fonte: relação de equipes fornecida pelo usuário.
 */
export const unidadeMap: Record<string, UnidadeClassificacao> = {
  // =========================
  // PROPERTY / CONSTRUÇÃO
  // Diretor: Paulo Cardoso
  // =========================
  P1: {
    time: "Property 1",
    tipo: "Property",
    area: "Property / Construção",
    diretor: "Paulo Cardoso",
    coordenador: "Marcos Araújo",
  },
  P2: {
    time: "Property 2 — Energia, Telecom e Mecânica",
    tipo: "Property",
    area: "Engenharia / Transportes",
    diretor: "Clark Pellegrino",
    coordenador: "Henrique Palma",
  },
  P3: {
    time: "Property 3",
    tipo: "Property",
    area: "Property / Construção",
    diretor: "Paulo Cardoso",
    coordenador: "Marilia V. Andrechewski",
  },
  P4: {
    time: "Property 4",
    tipo: "Property",
    area: "Property / Construção",
    diretor: "Paulo Cardoso",
    coordenador: "Bruno Santos",
  },
  P5: {
    time: "Property 5",
    tipo: "Property",
    area: "Property / Construção",
    diretor: "Paulo Cardoso",
    coordenador: "Paulo Costa",
  },
  P6: {
    time: "Property 6",
    tipo: "Property",
    area: "Property / Construção",
    diretor: "Paulo Cardoso",
    coordenador: "—",
  },

  // =========================
  // ENGENHARIA / TRANSPORTES
  // Diretor: Clark Pellegrino
  // =========================
  T1: {
    time: "Energia / Transportes 1",
    tipo: "Transportes",
    area: "Engenharia / Transportes",
    diretor: "Clark Pellegrino",
    coordenador: "Humberto Camelo",
  },
  T2: {
    time: "Energia / Transportes 2",
    tipo: "Transportes",
    area: "Engenharia / Transportes",
    diretor: "Clark Pellegrino",
    coordenador: "Henrique Palma",
  },

  // =========================
  // GARANTIA / FIANÇA / RISCOS
  // Diretora: Rebeca Hilcko
  // =========================
  SG1: {
    time: "Garantia 1",
    tipo: "Garantia",
    area: "Garantia",
    diretor: "Rebeca Hilcko",
    coordenador: "Teresa Aragón",
  },
  SG2: {
    time: "Garantia 2",
    tipo: "Garantia",
    area: "Garantia",
    diretor: "Rebeca Hilcko",
    coordenador: "Matheus Vicente",
  },
  SG3: {
    time: "Garantia 3",
    tipo: "Garantia",
    area: "Garantia",
    diretor: "Rebeca Hilcko",
    coordenador: "Fernando Silva",
  },

  // =========================
  // RESPONSABILIDADE CIVIL GERAL (RCG)
  // Diretor: Alex Guagliardi
  // =========================
  RCG1: {
    time: "RC Geral 1",
    tipo: "RC Geral",
    area: "Responsabilidade Civil Geral",
    diretor: "Alex Guagliardi",
    coordenador: "Guilherme Silveira",
  },
  RCG2: {
    time: "RC Geral 2",
    tipo: "RC Geral",
    area: "Responsabilidade Civil Geral",
    diretor: "Alex Guagliardi",
    coordenador: "—",
  },

  // =========================
  // RESPONSABILIDADE CIVIL PROFISSIONAL (RCP)
  // Diretor: Everton Voleck
  // =========================
  RCP1: {
    time: "RC Profissional 1",
    tipo: "RC Profissional",
    area: "Responsabilidade Civil Profissional",
    diretor: "Everton Voleck",
    coordenador: "João Victor",
  },
  RCP2: {
    time: "RC Profissional 2",
    tipo: "RC Profissional",
    area: "Responsabilidade Civil Profissional",
    diretor: "Everton Voleck",
    coordenador: "Michelle Oliveira",
  },
  RCP3: {
    time: "RC Profissional 3",
    tipo: "RC Profissional",
    area: "Responsabilidade Civil Profissional",
    diretor: "Everton Voleck",
    coordenador: "Guilherme Bomfim",
  },

  // =========================
  // DEFAULT
  // =========================
  DEFAULT: {
    time: "Não mapeado",
    tipo: "Não definido",
    area: "Não definida",
    diretor: "Não definido",
    coordenador: "—",
  },
};

/**
 * Normaliza siglas e tenta classificar unidades de forma resiliente.
 */
function normalizeKey(value: string): string {
  return value
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[-_/]/g, "");
}

export function getUnidadeClassificacao(unidade: string): UnidadeClassificacao {
  if (!unidade) return unidadeMap.DEFAULT;

  const raw = unidade.trim();
  const key = normalizeKey(raw);

  // Match direto por chave
  if (unidadeMap[key]) return unidadeMap[key];

  // =========================
  // MATCHES INTELIGENTES
  // =========================

  // Property / P1..P6
  if (key === "P1" || key.includes("PROPERTY1")) return unidadeMap.P1;
  if (key === "P2" || key.includes("PROPERTY2")) return unidadeMap.P2;
  if (key === "P3" || key.includes("PROPERTY3")) return unidadeMap.P3;
  if (key === "P4" || key.includes("PROPERTY4")) return unidadeMap.P4;
  if (key === "P5" || key.includes("PROPERTY5")) return unidadeMap.P5;
  if (key === "P6" || key.includes("PROPERTY6")) return unidadeMap.P6;

  if (key.includes("PROPERTYCONSTRUCAO") || key.includes("RODOVIAS")) return unidadeMap.P1;
  if (key.includes("ENERGIA") || key.includes("TELECOM") || key.includes("MECANICA")) return unidadeMap.T1;
  if (key.includes("RESIDENCIAL") && key.includes("1")) return unidadeMap.P3;
  if (key.includes("RESIDENCIAL") && key.includes("2")) return unidadeMap.P4;
  if (key.includes("INDUSTRIAL")) return unidadeMap.P5;

  // Transportes
  if (key === "T1" || key.includes("TRANSP") || key.includes("MARINE")) return unidadeMap.T1;
  if (key === "T2") return unidadeMap.T2;

  // Garantia / Fiança
  if (key === "SG1") return unidadeMap.SG1;
  if (key === "SG2") return unidadeMap.SG2;
  if (key === "SG3") return unidadeMap.SG3;
  // Suporte para nomes completos das unidades (Garantia 1, Garantia 2, Garantia 3)
  if (key === "GARANTIA1" || key.includes("GARANTIA") && key.includes("1")) return unidadeMap.SG1;
  if (key === "GARANTIA2" || key.includes("GARANTIA") && key.includes("2")) return unidadeMap.SG2;
  if (key === "GARANTIA3" || key.includes("GARANTIA") && key.includes("3")) return unidadeMap.SG3;
  if (key.includes("GARANTIA") && key.includes("FINANCE")) return unidadeMap.SG1;
  if (key.includes("GARANTIA") && key.includes("TRABALH")) return unidadeMap.SG1;
  if (key.includes("PERFORMANCE")) return unidadeMap.SG2;
  if (key.includes("LEGALENGINEERING") || key.includes("RESSARCIMENTO")) return unidadeMap.SG3;
  if (key.includes("GARANTIA") || key.includes("FIANCA")) return unidadeMap.SG1;

  // RC Geral
  if (key === "RCG1") return unidadeMap.RCG1;
  if (key === "RCG2") return unidadeMap.RCG2;
  if (key.includes("RCG") && key.includes("1")) return unidadeMap.RCG1;
  if (key.includes("RCG") && key.includes("2")) return unidadeMap.RCG2;
  if (key.includes("RCGERAL")) return unidadeMap.RCG1;

  // RC Profissional
  if (key === "RCP1") return unidadeMap.RCP1;
  if (key === "RCP2") return unidadeMap.RCP2;
  if (key === "RCP3") return unidadeMap.RCP3;
  if (key.includes("RCP") && key.includes("1")) return unidadeMap.RCP1;
  if (key.includes("RCP") && key.includes("2")) return unidadeMap.RCP2;
  if (key.includes("RCP") && key.includes("3")) return unidadeMap.RCP3;
  if (key.includes("RCPROFISSIONAL")) return unidadeMap.RCP1;

  return unidadeMap.DEFAULT;
}
