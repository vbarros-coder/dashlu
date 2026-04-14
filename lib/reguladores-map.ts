/**
 * Mapa de reguladores baseado no Organograma Addvalora (01.04.2026)
 *
 * Estrutura: chave = nome normalizado (lowercase, sem acento, trim)
 * Organização por Diretoria > Coordenação > Equipe
 *
 * Para adicionar novos reguladores: basta inserir na seção correta.
 * Aliases de primeiro nome cobrem nomes curtos vindos do PDF.
 */

export interface ReguladorInfo {
  diretoria: string;
  coordenador: string;
  equipe: string;
  operacao: string;
}

// ─── Utilitários de normalização ────────────────────────────────────────────

/** Remove acentos, converte para lowercase e limpa espaços duplicados */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Mapa principal (chave = nome normalizado completo) ──────────────────────

export const REGULADORES_MAP: Record<string, ReguladorInfo> = {

  // =========================================================================
  // RCP — RESPONSABILIDADE CIVIL PROFISSIONAL
  // Diretor Técnico: Everton Voleck
  // =========================================================================

  // ── RCP1 — Coordenador: João Victor ──────────────────────────────────────
  "joao victor": {
    diretoria: "RCP",
    coordenador: "João Victor",
    equipe: "RCP1",
    operacao: "RC Profissional",
  },
  "leticia lopes lugli": {
    diretoria: "RCP",
    coordenador: "João Victor",
    equipe: "RCP1",
    operacao: "RC Profissional",
  },
  "leticia": {
    diretoria: "RCP",
    coordenador: "João Victor",
    equipe: "RCP1",
    operacao: "RC Profissional",
  },
  // TODO: Confirmar nome completo de "Aline" em RCP1
  // TODO: Confirmar nome completo de "Kássia" em RCP1 (organograma lista Kassia Martins em P3)
  // TODO: Confirmar nome completo de "Renata" em RCP1 (organograma lista Renata Bernardini em RCP2)
  // TODO: Confirmar nome completo de "Thaynara" em RCP1 (organograma lista Thaynara Santos em RCG e Thaynara Andrade em RCP2)
  // TODO: Confirmar nome completo de "Willian" em RCP1 (organograma lista Willian Ribeiro em Jurídico)

  // ── RCP2 — Coordenadora: Michelle Oliveira ───────────────────────────────
  "michelle oliveira": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "renata bernardini": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "sarah bezerra": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "sarah": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "alexandre guimaraes": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "alana do prado": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "maria aparecida dias": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "patricia tavares": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "gabriel salles": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "nelson filho": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "thaynara andrade": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "raul pellegrino": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "adriele eduarda": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  // TODO: Confirmar nome completo de "Amâncio" em RCP2 (organograma lista Amancio Ulm em Property P2)
  // TODO: Confirmar nome completo de "Emily" em RCP2 (não encontrado no organograma)
  // TODO: Confirmar nome completo de "Maria Júlia D" em RCP2
  // TODO: Confirmar nome completo de "Rodolfo" em RCP2 (organograma lista Rodolfo Lima/Andrade em Property)

  // ── RCP3 — Coordenador: Guilherme Bonfim ─────────────────────────────────
  "guilherme bonfim": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "leonardo bonfim": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "leonardo": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "lucas rocha": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "micheli dutra": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "micheli": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "matheus dias": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "matheus": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "maria julia pinheiro": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "maria julia p": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "deize araujo": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  // TODO: Confirmar nome completo de "Jordan" em RCP3 (não encontrado no organograma)
  // TODO: Confirmar nome completo de "Natieli" em RCP3 (organograma lista Natieli Ingrid em Garantia SG1)

  // =========================================================================
  // RCG — RESPONSABILIDADE CIVIL GERAL
  // Diretor Técnico: Alex Guagliardi
  // Coordenador: Guilherme Silveira
  // =========================================================================

  "guilherme silveira": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "thaynara santos": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "william de carvalho": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "fabio moura": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG1",
    operacao: "RC Geral",
  },
  "ana carrano": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "caroline motta": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "brenda silverio": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "gabrielly rocha": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },

  // =========================================================================
  // GARANTIA / FIANÇA / RESSARCIMENTO
  // Diretora Técnica: Rebeca Hilcko
  // Gerente de Garantia: Stephany Miara
  // =========================================================================

  // ── SG1 — Coord. Judicial, Adicional Trabalhista, Fiança e Ressarcimento
  // Coordenadora: Teresa Aragón
  "teresa aragon": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "natieli ingrid": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "natieli": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "aline cristine": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "mariana hellen": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "pamella santos": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "emanoela navarro": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "adrielly martins": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "kauane goncalves": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "kaua barros": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "lucas borges": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "rafaela baldissera": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "sandra oliveira": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },

  // ── SG2 — Performance
  // Coordenador: Matheus Vicente
  "matheus vicente": {
    diretoria: "Garantia",
    coordenador: "Matheus Vicente",
    equipe: "SG2",
    operacao: "Garantia",
  },
  // TODO: mapear reguladores de SG2 quando identificados

  // ── SG3 — Legal Engineering for Operations
  // Coordenador: Fernando Silva
  "fernando silva": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "estella fayet": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "igor trindade": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "ana paula penha": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "carlos alfradique": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "nathalia galdino": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "beatriz lins": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "seidy domingues": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "guilherme kiem": {
    diretoria: "Garantia",
    coordenador: "Rebeca Hilcko",
    equipe: "Garantia",
    operacao: "Garantia",
  },
  "gabriela malagutti": {
    diretoria: "Garantia",
    coordenador: "Rebeca Hilcko",
    equipe: "Garantia",
    operacao: "Garantia",
  },
  "stephany miara": {
    diretoria: "Garantia",
    coordenador: "Rebeca Hilcko",
    equipe: "Garantia",
    operacao: "Garantia",
  },
  "jefferson santos": {
    diretoria: "Garantia",
    coordenador: "Rebeca Hilcko",
    equipe: "Garantia",
    operacao: "Garantia",
  },

  // =========================================================================
  // PROPERTY — CONSTRUÇÃO, RODOVIAS, EMPRESARIAL, INDUSTRIAL
  // Diretor Técnico: Paulo Cardoso
  // =========================================================================

  // ── P1 — Property Construção, Rodovias e Industrial
  // Coordenador: Marcos Araújo
  "marcos araujo": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "alexandre lopes": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "victor das neves": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "luciano lucariny": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "ndongala garcia": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "jamila luciano": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "fernando pellegrino": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "maissur dallalba": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },

  // ── P2 — Property Energia, Telecom e Mecânica
  // Coordenador: Henrique Palma
  "henrique palma": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "efraim bento de oliveira": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "alisson goulart": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "eduardo domingues": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "elcimar pimentel": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "aline rodrigues": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "amancio ulm": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "luiz eduardo veiga": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "thiago amaro": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "william valente": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "vinicios almeida": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },

  // ── P3 — Property Empresarial e Residencial
  // Coordenadora: Marilia V. Andrechewski
  "marilia v andrechewski": {
    diretoria: "Property",
    coordenador: "Marilia V. Andrechewski",
    equipe: "P3",
    operacao: "Property",
  },
  "kassia martins": {
    diretoria: "Property",
    coordenador: "Marilia V. Andrechewski",
    equipe: "P3",
    operacao: "Property",
  },
  "rodolfo andrade": {
    diretoria: "Property",
    coordenador: "Marilia V. Andrechewski",
    equipe: "P3",
    operacao: "Property",
  },

  // ── P4 — Property Empresarial e Residencial
  // Coordenador: Bruno Santos
  "bruno santos": {
    diretoria: "Property",
    coordenador: "Bruno Santos",
    equipe: "P4",
    operacao: "Property",
  },
  // TODO: mapear reguladores de P4 quando identificados

  // ── P5 — Property Industrial
  // Coordenador: Paulo Costa
  "paulo costa": {
    diretoria: "Property",
    coordenador: "Paulo Costa",
    equipe: "P5",
    operacao: "Property",
  },
  "nicole da silva": {
    diretoria: "Property",
    coordenador: "Paulo Costa",
    equipe: "P5",
    operacao: "Property",
  },
  "eduardo piana": {
    diretoria: "Property",
    coordenador: "Paulo Costa",
    equipe: "P5",
    operacao: "Property",
  },

  // ── Assistentes/Suporte Property ─────────────────────────────────────────
  "rodolfo lima": {
    diretoria: "Property",
    coordenador: "Paulo Cardoso",
    equipe: "Property",
    operacao: "Property",
  },
  "michele roberta": {
    diretoria: "Property",
    coordenador: "Paulo Cardoso",
    equipe: "Property",
    operacao: "Property",
  },
  "michele costa": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },

  // =========================================================================
  // TRANSPORTE / MARINE
  // Diretor Técnico e Comercial: Clark Pellegrino
  // Coordenador: Humberto Camelo (T1)
  // =========================================================================

  "humberto camelo": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "robson freitas": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "roberto k matsuda": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "marcia gimenez": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "simone lira": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "luis claudio": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "giovanna cruz": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  // "maria julia" sem sobrenome (T1) - alias ambíguo, deixado sem alias curto
  "maria julia t1": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },

  // =========================================================================
  // JURÍDICO / PARALEGAL / COMPLIANCE
  // =========================================================================

  "willian ribeiro": {
    diretoria: "Jurídico",
    coordenador: "Willian Ribeiro",
    equipe: "Jurídico",
    operacao: "Consultoria",
  },
  // TODO: Confirmar se "Willian" (RCP1 no acionamentos) é Willian Ribeiro do Jurídico

  // =========================================================================
  // NIE — NÚCLEO DE INTELIGÊNCIA ESTRATÉGICA
  // =========================================================================

  "eduardo ottoni": {
    diretoria: "NIE",
    coordenador: "Eduardo Ottoni",
    equipe: "NIE",
    operacao: "Consultoria",
  },

  // =========================================================================
  // REGULADORES ADICIONAIS DO PDF (Time Sheet) - APENAS NOMES NÃO MAPEADOS
  // =========================================================================

  // Nomes completos dos reguladores que aparecem no PDF
  "amancio jose fonseca oliveira ulm": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "sarah vitoria claudino bezerra": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "rodolfo pucharelli andrade": {
    diretoria: "Property",
    coordenador: "Marilia V. Andrechewski",
    equipe: "P3",
    operacao: "Property",
  },
  "maria julia da silva david": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "willian de carvalho vitor": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "renata beatriz p de a bernardini": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "aline rodrigues lonardoni": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "fernando lourenco de souza pellegrino": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "jamila oliveira luciano": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "luis claudio vieira neves": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "renato alves portugal": {
    diretoria: "Property",
    coordenador: "Paulo Costa",
    equipe: "P5",
    operacao: "Property",
  },
  "elcimar pereira pimentel": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "deize mara araujo lavesso": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "marcus vinicius do prado da silva": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "aline cristine furquim": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },
  "rubens da silva": {
    diretoria: "Property",
    coordenador: "Paulo Costa",
    equipe: "P5",
    operacao: "Property",
  },
  "william dias alfradique valente": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "efraim bento de oliveira cangamba": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "alisson oliveira": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "luciano haas lucariny": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "ndongala garcia manuel lufuanquenda": {
    diretoria: "Property",
    coordenador: "Marcos Araújo",
    equipe: "P1",
    operacao: "Property",
  },
  "camila barrios motta": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "gabrielly v de souza rocha": {
    diretoria: "RCG",
    coordenador: "Guilherme Silveira",
    equipe: "RCG",
    operacao: "RC Geral",
  },
  "matheus dias queiroz da silva": {
    diretoria: "RCP",
    coordenador: "Guilherme Bonfim",
    equipe: "RCP3",
    operacao: "RC Profissional",
  },
  "alana do prado silva": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "leticia s lopes lugli": {
    diretoria: "RCP",
    coordenador: "João Victor",
    equipe: "RCP1",
    operacao: "RC Profissional",
  },
  "nathalia meneses galdino": {
    diretoria: "Garantia",
    coordenador: "Fernando Silva",
    equipe: "SG3",
    operacao: "Garantia",
  },
  "thaynara de borba ferreira dos santos": {
    diretoria: "RCP",
    coordenador: "Michelle Oliveira",
    equipe: "RCP2",
    operacao: "RC Profissional",
  },
  "vinicius rosario de oliveira almeida": {
    diretoria: "Property",
    coordenador: "Henrique Palma",
    equipe: "P2",
    operacao: "Property",
  },
  "marcia romero gimenez": {
    diretoria: "Transporte/Marine",
    coordenador: "Humberto Camelo",
    equipe: "T1",
    operacao: "Transportes",
  },
  "euclides roberto vieira paiva junior": {
    diretoria: "Garantia",
    coordenador: "Teresa Aragón",
    equipe: "SG1",
    operacao: "Garantia",
  },

};

// ─── Busca flexível de reguladores ──────────────────────────────────────────

/**
 * Busca informações do regulador pelo nome.
 * 1. Tenta match exato pelo nome normalizado completo
 * 2. Tenta match por prefixo (primeiros N tokens)
 * 3. Se não encontrar, retorna null (não inventar vínculo)
 */
export function getReguladorInfo(name: string): ReguladorInfo | null {
  if (!name || !name.trim()) return null;

  const normalizado = normalizeName(name);

  console.log("[Timesheet] Regulador normalizado:", normalizado);

  // 1. Match exato
  if (REGULADORES_MAP[normalizado]) {
    const info = REGULADORES_MAP[normalizado];
    console.log("[Timesheet] Match exato:", info);
    return info;
  }

  // 2. Match parcial seguro: verifica se alguma chave COMEÇA com o nome normalizado
  //    (útil para "leonardo" -> "leonardo bonfim")
  //    Só aceita se houver exatamente 1 candidato para evitar ambiguidade
  const tokens = normalizado.split(" ").filter(Boolean);
  if (tokens.length >= 1) {
    const candidatos = Object.keys(REGULADORES_MAP).filter((chave) => {
      const chaveTokens = chave.split(" ");
      // A chave deve começar com todos os tokens do nome buscado
      return tokens.every((t, i) => chaveTokens[i] === t);
    });

    if (candidatos.length === 1) {
      const info = REGULADORES_MAP[candidatos[0]];
      console.log("[Timesheet] Match parcial:", candidatos[0], "->", info);
      return info;
    }

    if (candidatos.length > 1) {
      console.log("[Timesheet] Ambíguo - múltiplos candidatos:", candidatos);
    }
  }

  // 3. Sem match seguro
  console.log("[Timesheet] Sem match para:", normalizado);
  return null;
}
