"use server";

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

function normalizePdfText(rawText: string): string {
  return rawText
    .replace(/\uFFFE|\uFFFF|\uFFFD/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b\d{1,3}\/150\b/g, " ")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, " ")
    .replace(/\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2}\s*Addvalora Global Loss Adjusters/gi, " ")
    .replace(/Nº\s+Addvalora\s+Segurado\s+Regulador\s+Tempo\s+Valor\s*Data\s*do\s*Time\s*Sheet/gi, " ")
    .replace(/Existe\s+\d+\s+time\s+sheets?\s+no\s+valor\s+de\s+R\$[^.]+\./gi, " ")
    .replace(/[ \t]{2,}/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitValueAndDate(text: string): string {
  return text
    .replace(/R\$\s*(-?\d+(?:[.,]\d+)?)\s*(\d{2}\/\d{2}\/\d{4})/g, (match, valor, data) => {
      return `R$ ${valor} ${data}`;
    })
    .replace(/[ ]{2,}/g, " ");
}

// ─── CONVERSÕES ──────────────────────────────────────────────────────────────

function parseMoeda(valor: string): number {
  if (!valor) return 0;
  let limpo = valor.replace(/R\$\s*/gi, "").trim();
  limpo = limpo.replace(/\d{2}\/\d{2}\/\d{4}$/, "").trim();
  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  }
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseTempo(tempo: string): number {
  if (!tempo) return 0;
  const match = tempo.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseData(data: string): string {
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : data;
}

// ─── DETECÇÃO DE OPERAÇÕES ───────────────────────────────────────────────────

function getOperationBlocks(text: string): Array<{ operacao: string; content: string }> {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const blocks: Array<{ operacao: string; content: string[] }> = [];
  let currentOperation = "Não mapeada";

  for (const line of lines) {
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

interface RegResult {
  segurado: string;
  regulador: string;
  diretoria: string;
  equipe: string;
  coordenador: string;
  operacao: string;
}

const REGULADORES_SORTED = Object.keys(REGULADORES_MAP).sort(
  (a, b) => b.length - a.length
);

function extractReguladorAndSegurado(head: string): RegResult {
  const headClean = head.replace(/\s+/g, " ").trim();
  const words = headClean.split(/\s+/).filter(Boolean);
  const wordsNorm = words.map(normalizeName);

  for (const key of REGULADORES_SORTED) {
    const info = REGULADORES_MAP[key];
    if (!info) continue;

    const keyWords = key.split(/\s+/).filter(Boolean);
    const kLen = keyWords.length;

    for (let i = 0; i <= words.length - kLen; i++) {
      if (keyWords.every((kw, j) => wordsNorm[i + j] === kw)) {
        return {
          segurado: words.slice(0, i).join(" "),
          regulador: words.slice(i, i + kLen).join(" "),
          diretoria: info.diretoria,
          equipe: info.equipe,
          coordenador: info.coordenador,
          operacao: info.operacao,
        };
      }
    }

    if (kLen > 1) {
      for (let i = 0; i < words.length; i++) {
        const hw = wordsNorm[i];
        const firstKw = keyWords[0];
        if (hw.length > firstKw.length && hw.endsWith(firstKw)) {
          const restLen = kLen - 1;
          if (i + restLen < words.length) {
            const restMatch = keyWords.slice(1).every(
              (kw, j) => wordsNorm[i + 1 + j] === kw
            );
            if (restMatch) {
              const splitAt = words[i].length - firstKw.length;
              const prefix = words[i].slice(0, splitAt);
              const regFirst = words[i].slice(splitAt);
              const seguradoWords = [...words.slice(0, i)];
              if (prefix) seguradoWords.push(prefix);
              return {
                segurado: seguradoWords.join(" ").trim(),
                regulador: [regFirst, ...words.slice(i + 1, i + kLen)].join(" "),
                diretoria: info.diretoria,
                equipe: info.equipe,
                coordenador: info.coordenador,
                operacao: info.operacao,
              };
            }
          }
        }
      }
    }
  }

  const repMatch = headClean.match(/^(.*?)(Representante\s*-\s*.+)$/i);
  if (repMatch) {
    return {
      segurado: repMatch[1].trim(),
      regulador: repMatch[2].trim(),
      diretoria: "Não mapeada",
      equipe: "Não mapeada",
      coordenador: "Não identificado",
      operacao: "Não mapeada",
    };
  }

  return {
    segurado: headClean,
    regulador: "Não identificado",
    diretoria: "Não mapeada",
    equipe: "Não mapeada",
    coordenador: "Não identificado",
    operacao: "Não mapeada",
  };
}

// ─── EXTRAÇÃO DE ENTRADAS ────────────────────────────────────────────────────

function parseEntriesFromBlock(blockText: string, operacao: string): TimeSheetItem[] {
  const text = splitValueAndDate(blockText);
  const results: TimeSheetItem[] = [];
  const numPattern = /\b(\d{10})\b/g;
  const entries: { pos: number; num: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = numPattern.exec(text)) !== null) {
    entries.push({ pos: m.index, num: m[1] });
  }

  for (let i = 0; i < entries.length; i++) {
    const start = entries[i].pos;
    const end = i + 1 < entries.length ? entries[i + 1].pos : text.length;
    const entryText = text.slice(start, end).replace(/\s+/g, " ").trim();
    const numeroAddvalora = entries[i].num;
    const rest = entryText.slice(10).trim();

    const tailRx = /(\d+)\s*Min\s*(R\$\s*-?[\d.,]+)\s+(\d{2}\/\d{2}\/\d{4})\s*$/;
    const tail = rest.match(tailRx);
    if (!tail) continue;

    const tempoMinutos = parseInt(tail[1], 10);
    const head = rest.slice(0, rest.length - tail[0].length).trim();
    const { segurado, regulador, diretoria, equipe, coordenador, operacao: opReg } =
      extractReguladorAndSegurado(head);

    results.push({
      numeroAddvalora,
      segurado,
      regulador,
      tempoMinutos,
      valor: parseMoeda(tail[2].trim()),
      dataTimeSheet: parseData(tail[3].trim()),
      operacao: opReg !== "Não mapeada" ? opReg : operacao,
      diretoria,
      coordenador,
      equipe,
    });
  }

  return results;
}

function extrairResumoOperacoes(text: string): OperacaoResumo[] {
  const resumos: OperacaoResumo[] = [];
  const rx = /Existe(?:m)?\s+(\d+)\s+time\s+sheets?\s+no\s+valor\s+de\s+R\$?\s*([\d.,]+)\s+em\s+([^\n.]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    resumos.push({
      operacao: m[3].trim().replace(/[:.]$/, ""),
      quantidadeTimeSheets: parseInt(m[1], 10),
      valorTotal: parseMoeda(m[2]),
    });
  }
  return resumos;
}

// ─── FUNÇÃO PRINCIPAL ────────────────────────────────────────────────────────

/**
 * Extrai texto do PDF usando pdfjs-dist (compatível com serverless)
 * Import dinâmico para evitar erro DOMMatrix no build
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import dinâmico do build legacy - só executa em runtime, não no build
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // @ts-ignore - o tipo do pdfjs legacy não tem default export tipado
    const PDFJS = pdfjs;
    
    // Desabilitar worker para ambiente serverless
    PDFJS.GlobalWorkerOptions.workerSrc = "";
    
    const data = new Uint8Array(buffer);
    const pdf = await PDFJS.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText;
  } catch (error) {
    console.error("[PDF Extract] Erro ao extrair texto:", error);
    throw new Error("Falha ao extrair texto do PDF");
  }
}

/**
 * Extrai dados do PDF do Baruc Time Sheet
 */
export async function parseTimesheetPDF(
  buffer: Buffer
): Promise<ParsedTimesheetData> {
  try {
    const text = await extractTextFromPDF(buffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error("PDF não contém texto extraível.");
    }
    
    console.log("[PDF Parser] Texto extraído (primeiros 500 chars):", text.substring(0, 500));
    
    const normalized = normalizePdfText(text);
    const blocks = getOperationBlocks(normalized);
    const resumoPorOperacao = extrairResumoOperacoes(text);
    const itensDetalhados: TimeSheetItem[] = [];
    
    for (const block of blocks) {
      const entries = parseEntriesFromBlock(block.content, block.operacao);
      itensDetalhados.push(...entries);
    }
    
    const itensValidos = itensDetalhados
      .filter(row => row.numeroAddvalora && row.dataTimeSheet)
      .map(row => ({
        ...row,
        segurado: row.segurado.replace(/\s+/g, " ").trim(),
        regulador: row.regulador.replace(/\s+/g, " ").trim(),
      }));
    
    const quantidadeTotal = itensValidos.length;
    const valorTotal = itensValidos.reduce((sum, item) => sum + item.valor, 0);
    
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
