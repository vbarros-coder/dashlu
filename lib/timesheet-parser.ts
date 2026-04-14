"use server";

import pdfParse from "pdf-parse";
import {
  TimeSheetItem,
  OperacaoResumo,
  ParsedTimesheetData,
} from "./timesheet-types";
import { REGULADORES_MAP, normalizeName } from "./reguladores-map";

// ─── OPERAÇÕES VÁLIDAS ───────────────────────────────────────────────────────

const OPERACOES_VALIDAS = [
  "Consultoria (Sem Seguradora)",
  "Fiança locatícia",
  "Garantia",
  "Massificados",
  "Outros Ramos",
  "Property",
  "RC Geral",
  "RC Profissional",
  "Ressarcimento",
  "RC do Operador do Transporte Multimodal (RCOTM-C)",
  "RC do Transportador Aéreo de Carga (RCTA-C)",
  "RC do Transportador Aquaviário de Carga (RCA-C)",
  "RC do Transportador Rodoviário de Carga (RCTR-C)",
  "RC por Desaparecimento de Carga (RC-DC)",
  "Transporte Internacional Exportação",
  "Transporte Internacional Importação",
  "Transporte Nacional",
  "Vida",
];

// ─── NORMALIZAÇÃO DO TEXTO ───────────────────────────────────────────────────

/**
 * Normaliza o texto bruto extraído do PDF
 * Remove ruídos, caracteres especiais, cabeçalhos repetidos, etc.
 */
function normalizePdfText(rawText: string): string {
  return rawText
    // Remove caracteres especiais do PDF
    .replace(/\uFFFE|\uFFFF|\uFFFD/g, " ")
    // Normaliza quebras de linha
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove URLs
    .replace(/https?:\/\/\S+/g, " ")
    // Remove números de página (ex: "1/150", "-- 1 of 150 --")
    .replace(/\b\d{1,3}\/150\b/g, " ")
    .replace(/--\s*\d+\s+of\s+\d+\s+--/g, " ")
    // Remove cabeçalhos de data/hora repetidos
    .replace(/\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2}\s*Addvalora Global Loss Adjusters/gi, " ")
    // Remove cabeçalho de tabela repetido
    .replace(/Nº Addvalora\s+Segurado\s+Regulador\s+Tempo\s+Valor\s*Data do\s*Time Sheet/gi, " ")
    // Remove linhas de resumo (ex: "Existe X time sheet no valor de...")
    .replace(/Existe\s+\d+\s+time\s+sheets?\s+no\s+valor\s+de\s+R\$[^.]+\./gi, " ")
    // Normaliza espaços múltiplos
    .replace(/[ \t]{2,}/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Separa valor e data quando estão colados
 * Ex: "R$ 140.0009/04/2026" -> "R$ 140.00 09/04/2026"
 */
function splitValueAndDate(text: string): string {
  return text
    // Padrão: R$ seguido de número com decimais seguido de data colada
    // Ex: R$ 140.0009/04/2026 -> R$ 140.00 09/04/2026
    .replace(/R\$\s*(-?\d+(?:[.,]\d+)?)\s*(\d{2}\/\d{2}\/\d{4})/g, (match, valor, data) => {
      return `R$ ${valor} ${data}`;
    })
    // Normaliza espaços
    .replace(/[ ]{2,}/g, " ");
}

// ─── PARSING DE VALORES ──────────────────────────────────────────────────────

/**
 * Converte valor monetário brasileiro (R$ 1.234,56) para número
 */
function parseMoeda(valor: string): number {
  if (!valor) return 0;
  
  let limpo = valor
    .replace(/R\$\s*/gi, "")
    .trim();
  
  // Se ainda contém data, remove
  limpo = limpo.replace(/\d{2}\/\d{2}\/\d{4}$/, "").trim();
  
  // Trata formato brasileiro: 1.234,56 -> 1234.56
  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    // Pode ter ponto decimal
    const partes = limpo.split(".");
    if (partes.length > 2) {
      // Milhar: 1.234.567 -> 1234567
      limpo = partes.join("");
    }
  }
  
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/**
 * Converte tempo no formato "X Min" para número de minutos
 */
function parseTempo(tempo: string): number {
  if (!tempo) return 0;
  const match = tempo.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Converte data no formato dd/mm/aaaa para yyyy-mm-dd
 */
function parseData(data: string): string {
  if (!data) return "";
  const match = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return data;
}

// ─── DETECÇÃO DE OPERAÇÕES ───────────────────────────────────────────────────

/**
 * Detecta blocos de operação no texto do PDF
 */
function getOperationBlocks(text: string): Array<{ operacao: string; content: string }> {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const blocks: Array<{ operacao: string; content: string[] }> = [];
  let currentOperation = "Não mapeada";
  
  for (const line of lines) {
    // Verifica se a linha é um nome de operação válida
    let isOperacao = false;
    let operacaoEncontrada = "";
    
    for (const op of OPERACOES_VALIDAS) {
      if (line.toLowerCase() === op.toLowerCase()) {
        isOperacao = true;
        operacaoEncontrada = op;
        break;
      }
    }
    
    if (isOperacao && !/\d{10}/.test(line)) {
      currentOperation = operacaoEncontrada;
      blocks.push({ operacao: currentOperation, content: [] });
      continue;
    }
    
    // Adiciona linha ao bloco atual
    if (!blocks.length) {
      blocks.push({ operacao: currentOperation, content: [] });
    }
    blocks[blocks.length - 1].content.push(line);
  }
  
  return blocks.map(b => ({
    operacao: b.operacao,
    content: b.content.join(" "),
  }));
}

// ─── EXTRAÇÃO DE REGULADOR ───────────────────────────────────────────────────

/**
 * Busca informações do regulador pelo nome usando o mapa existente
 */
function getReguladorInfoLocal(name: string): { 
  diretoria: string; 
  equipe: string; 
  operacao: string;
  coordenador: string;
} | null {
  if (!name || !name.trim()) return null;
  
  const normalizado = normalizeName(name);
  
  // Match exato
  if (REGULADORES_MAP[normalizado]) {
    return REGULADORES_MAP[normalizado];
  }
  
  // Match parcial seguro
  const tokens = normalizado.split(" ").filter(Boolean);
  if (tokens.length >= 1) {
    const candidatos = Object.keys(REGULADORES_MAP).filter((chave) => {
      const chaveTokens = chave.split(" ");
      return tokens.every((t, i) => chaveTokens[i] === t);
    });
    
    if (candidatos.length === 1) {
      return REGULADORES_MAP[candidatos[0]];
    }
  }
  
  return null;
}

/**
 * Obtém lista de nomes de reguladores conhecidos do mapa
 */
function getKnownRegulatorsFromMap(): string[] {
  return Object.keys(REGULADORES_MAP).sort((a, b) => b.length - a.length);
}

/**
 * Extrai regulador e segurado do texto
 */
function extractReguladorAndSegurado(head: string): { 
  segurado: string; 
  regulador: string;
  diretoria: string;
  equipe: string;
  coordenador: string;
} {
  const headNorm = head.replace(/\s+/g, " ").trim();
  
  // Tenta encontrar um regulador conhecido no texto
  const knownRegulators = getKnownRegulatorsFromMap();
  
  for (const regulatorKey of knownRegulators) {
    // O regulador no mapa está normalizado (sem acentos, lowercase)
    // Precisamos buscar no texto original
    const info = REGULADORES_MAP[regulatorKey];
    if (!info) continue;
    
    // Cria regex case-insensitive para buscar o nome
    // Divide o nome normalizado em palavras
    const palavras = regulatorKey.split(/\s+/);
    const regex = new RegExp(
      palavras.map(p => `\\b${p}\\b`).join("\\s+"),
      "i"
    );
    
    const match = headNorm.match(regex);
    
    if (match) {
      const regulador = match[0];
      const idx = headNorm.search(regex);
      
      if (idx !== -1) {
        const segurado = headNorm.slice(0, idx).trim();
        
        return {
          segurado,
          regulador,
          diretoria: info.diretoria || "Não mapeada",
          equipe: info.equipe || "Não mapeada",
          coordenador: info.coordenador || "Não identificado",
        };
      }
    }
  }
  
  // Verifica padrão "Representante - ..."
  const repMatch = headNorm.match(/^(.*?)(Representante\s*-\s*.+)$/i);
  if (repMatch) {
    return {
      segurado: repMatch[1].trim(),
      regulador: repMatch[2].trim(),
      diretoria: "Não mapeada",
      equipe: "Não mapeada",
      coordenador: "Não identificado",
    };
  }
  
  return {
    segurado: headNorm,
    regulador: "Não identificado",
    diretoria: "Não mapeada",
    equipe: "Não mapeada",
    coordenador: "Não identificado",
  };
}

// ─── EXTRAÇÃO DE ENTRADAS ────────────────────────────────────────────────────

/**
 * Extrai entradas de time sheet de um bloco de texto
 */
function parseEntriesFromBlock(blockText: string, operacao: string): TimeSheetItem[] {
  // Aplica separação de valor+data colados
  const normalized = splitValueAndDate(blockText);
  
  const results: TimeSheetItem[] = [];
  
  // Padrão para capturar entradas:
  // Número Addvalora (10 dígitos) + conteúdo + tempo + valor + data
  const entryRegex = /(\d{10})\s+([\s\S]*?)\s+(\d+)\s+Min\s+(R\$\s*-?[\d.,]+)\s+(\d{2}\/\d{2}\/\d{4})/g;
  
  let match: RegExpExecArray | null;
  
  while ((match = entryRegex.exec(normalized)) !== null) {
    const numeroAddvalora = match[1]?.trim() || "";
    const head = match[2]?.replace(/\s+/g, " ").trim() || "";
    const tempoMinutos = Number(match[3]) || 0;
    const valorFormatado = match[4]?.trim() || "";
    const dataTimeSheet = match[5]?.trim() || "";
    
    const { segurado, regulador, diretoria, equipe, coordenador } = extractReguladorAndSegurado(head);
    
    results.push({
      numeroAddvalora,
      segurado,
      regulador,
      tempoMinutos,
      valor: parseMoeda(valorFormatado),
      dataTimeSheet: parseData(dataTimeSheet),
      operacao,
      diretoria,
      coordenador,
      equipe,
    });
  }
  
  return results;
}

// ─── RESUMO POR OPERAÇÃO ─────────────────────────────────────────────────────

/**
 * Extrai o resumo por operação do texto do PDF
 */
function extrairResumoOperacoes(text: string): OperacaoResumo[] {
  const resumos: OperacaoResumo[] = [];
  
  const padraoResumo = 
    /Existe(?:m)?\s+(\d+)\s+time\s+sheets?\s+no\s+valor\s+de\s+R?\$?\s*([\d.,]+)\s+em\s+([^\n.]+)/gi;
  
  let match;
  while ((match = padraoResumo.exec(text)) !== null) {
    const quantidade = parseInt(match[1], 10);
    const valor = parseMoeda(match[2]);
    const operacao = match[3].trim().replace(/\.$/, "").replace(/:$/, "");
    
    resumos.push({
      operacao,
      quantidadeTimeSheets: quantidade,
      valorTotal: valor,
    });
  }
  
  return resumos;
}

// ─── FUNÇÃO PRINCIPAL ────────────────────────────────────────────────────────

/**
 * Extrai dados do PDF do Baruc Time Sheet
 */
export async function parseTimesheetPDF(
  buffer: Buffer
): Promise<ParsedTimesheetData> {
  try {
    let text: string;
    
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (pdfError) {
      console.error("[PDF Parser] Erro ao parsear PDF:", pdfError);
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar corrompido ou protegido.");
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error("PDF não contém texto extraível.");
    }
    
    console.log("[PDF Parser] Texto extraído (primeiros 500 chars):", text.substring(0, 500));
    
    // Normaliza o texto
    const normalized = normalizePdfText(text);
    
    // Extrai blocos por operação
    const blocks = getOperationBlocks(normalized);
    
    console.log("[PDF Parser] Blocos encontrados:", blocks.length);
    
    // Extrai resumo por operação
    const resumoPorOperacao = extrairResumoOperacoes(text);
    
    // Extrai itens detalhados de cada bloco
    const itensDetalhados: TimeSheetItem[] = [];
    
    for (const block of blocks) {
      const entries = parseEntriesFromBlock(block.content, block.operacao);
      itensDetalhados.push(...entries);
    }
    
    // Filtra entradas válidas e limpa campos
    const itensValidos = itensDetalhados
      .filter(row => row.numeroAddvalora && row.dataTimeSheet)
      .map(row => ({
        ...row,
        segurado: row.segurado.replace(/\s+/g, " ").trim(),
        regulador: row.regulador.replace(/\s+/g, " ").trim(),
      }));
    
    // Estatísticas
    const quantidadeTotal = itensValidos.length;
    const valorTotal = itensValidos.reduce((sum, item) => sum + item.valor, 0);
    
    // Log de reguladores não identificados
    const naoIdentificados = itensValidos.filter(i => i.regulador === "Não identificado");
    if (naoIdentificados.length > 0) {
      console.log("[PDF Parser] Reguladores não identificados:", naoIdentificados.length);
    }
    
    console.log("[PDF Parser] Resultado:", {
      resumoCount: resumoPorOperacao.length,
      itensCount: quantidadeTotal,
      valorTotal,
    });
    
    return {
      resumoPorOperacao,
      itensDetalhados: itensValidos,
      totalGeral: {
        quantidadeTotal,
        valorTotal,
      },
    };
  } catch (error) {
    console.error("[PDF Parser] Erro:", error);
    throw error;
  }
}
