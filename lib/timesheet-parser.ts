"use server";

import pdfParse from "pdf-parse";
import {
  TimeSheetItem,
  OperacaoResumo,
  ParsedTimesheetData,
} from "./timesheet-types";
import { REGULADORES_MAP } from "./reguladores-map";

// ─── OPERAÇÕES VÁLIDAS ────────────────────────────────────────────────────────

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

// ─── NORMALIZAÇÃO ─────────────────────────────────────────────────────────────

/** Normaliza uma única palavra: remove acentos, lowercase, apenas alfanuméricos */
function normalizeWord(w: string): string {
  return w
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Limpa o texto bruto do PDF */
function normalizePdfText(raw: string): string {
  return raw
    .replace(/\uFFFE|\uFFFF|\uFFFD/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b\d{1,3}\/\d{2,3}\b/g, " ")
    .replace(/\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2}\s*Addvalora Global Loss Adjusters/gi, " ")
    .replace(/Nº\s+Addvalora\s+Segurado\s+Regulador\s+Tempo\s+Valor\s*Data\s*do\s*Time\s*Sheet/gi, " ")
    .replace(/Existe\s+\d+\s+time\s+sheets?\s+no\s+valor\s+de\s+R\$[^.\n]+\./gi, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Separa valor+data colados e Min+R$ colados */
function fixConcatenations(text: string): string {
  return text
    // "MinR$" → "Min R$"
    .replace(/Min(R\$)/g, "Min $1")
    // "R$ 140.0009/04/2026" → "R$ 140.00 09/04/2026"
    .replace(/(R\$\s*-?\d+[.,]\d{2})(\d{2}\/\d{2}\/\d{4})/g, "$1 $2")
    // "R$ 140009/04/2026" sem decimal
    .replace(/(R\$\s*-?\d+)(\d{2}\/\d{2}\/\d{4})/g, "$1 $2")
    .replace(/[ ]{2,}/g, " ");
}

// ─── CONVERSÕES ───────────────────────────────────────────────────────────────

function parseMoeda(valor: string): number {
  if (!valor) return 0;
  let v = valor.replace(/R\$\s*/gi, "").replace(/\s/g, "").trim();
  // Remove data colada que possa ter sobrado
  v = v.replace(/\d{2}\/\d{2}\/\d{4}$/, "").trim();
  // Formato BR: 1.234,56
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseData(data: string): string {
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : data;
}

// ─── EXTRAÇÃO DE REGULADOR ────────────────────────────────────────────────────

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

/**
 * Extrai segurado e regulador do texto que vem antes do tempo.
 *
 * Estratégia:
 * 1. Divide o texto em palavras e normaliza cada palavra individualmente
 * 2. Para cada regulador do mapa (maior primeiro), tenta casar as palavras
 * 3. Trata o caso de concatenação: "SaúdeLucas" = fim do segurado + início do regulador
 */
function extractReguladorAndSegurado(head: string): RegResult {
  const headClean = head.replace(/\s+/g, " ").trim();
  const words = headClean.split(/\s+/).filter(Boolean);
  const wordsNorm = words.map(normalizeWord);

  for (const key of REGULADORES_SORTED) {
    const info = REGULADORES_MAP[key];
    if (!info) continue;

    const keyWords = key.split(/\s+/).filter(Boolean);
    const kLen = keyWords.length;

    // --- Caso 1: palavras completas correspondem ---
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

    // --- Caso 2: primeira palavra do regulador está colada ao fim do segurado ---
    // Ex: headWord = "SaúdeLucas", keyWords[0] = "lucas"
    if (kLen > 1) {
      for (let i = 0; i < words.length; i++) {
        const hw = wordsNorm[i];
        const firstKw = keyWords[0];
        // A palavra normalizada TERMINA com a primeira palavra-chave
        if (hw.length > firstKw.length && hw.endsWith(firstKw)) {
          const restLen = kLen - 1;
          if (i + restLen < words.length) {
            const restMatch = keyWords.slice(1).every(
              (kw, j) => wordsNorm[i + 1 + j] === kw
            );
            if (restMatch) {
              const splitAt = words[i].length - firstKw.length;
              const prefix = words[i].slice(0, splitAt); // fim do segurado
              const regFirst = words[i].slice(splitAt);  // início do regulador
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

  // Fallback: padrão "Representante - ..."
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

// ─── BLOCOS POR OPERAÇÃO ──────────────────────────────────────────────────────

function getOperationBlocks(
  text: string
): Array<{ operacao: string; content: string }> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: Array<{ operacao: string; lines: string[] }> = [];
  let currentOp = "Não mapeada";

  for (const line of lines) {
    const op = OPERACOES_VALIDAS.find(
      (o) => line.toLowerCase() === o.toLowerCase()
    );
    if (op) {
      currentOp = op;
      blocks.push({ operacao: op, lines: [] });
      continue;
    }
    if (!blocks.length) blocks.push({ operacao: currentOp, lines: [] });
    blocks[blocks.length - 1].lines.push(line);
  }

  return blocks.map((b) => ({ operacao: b.operacao, content: b.lines.join(" ") }));
}

// ─── EXTRAÇÃO DE ENTRADAS ─────────────────────────────────────────────────────

function parseEntriesFromBlock(
  blockText: string,
  operacao: string
): TimeSheetItem[] {
  const text = fixConcatenations(blockText);
  const results: TimeSheetItem[] = [];

  // Localiza todas as posições de números Addvalora (10 dígitos)
  const numPattern = /\b(\d{10})\b/g;
  const entries: { pos: number; num: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = numPattern.exec(text)) !== null) {
    entries.push({ pos: m.index, num: m[1] });
  }

  for (let i = 0; i < entries.length; i++) {
    const start = entries[i].pos;
    const end = i + 1 < entries.length ? entries[i + 1].pos : text.length;

    // Extrai e normaliza o texto da entrada
    const entryText = text.slice(start, end).replace(/\s+/g, " ").trim();
    const numeroAddvalora = entries[i].num;
    const rest = entryText.slice(10).trim(); // tudo depois do número

    // Extrai a cauda: <tempo> Min <R$ valor> <dd/mm/yyyy>
    // Usa \s* em vez de \s+ pois Min e R$ podem estar colados
    const tailRx = /(\d+)\s*Min\s*(R\$\s*-?[\d.,]+)\s+(\d{2}\/\d{2}\/\d{4})\s*$/;
    const tail = rest.match(tailRx);
    if (!tail) continue;

    const tempoMinutos = parseInt(tail[1], 10);
    const valorFormatado = tail[2].trim();
    const dataTimeSheet = tail[3].trim();

    // Cabeça = segurado + regulador (tudo antes da cauda)
    const head = rest.slice(0, rest.length - tail[0].length).trim();

    const { segurado, regulador, diretoria, equipe, coordenador, operacao: opReg } =
      extractReguladorAndSegurado(head);

    results.push({
      numeroAddvalora,
      segurado,
      regulador,
      tempoMinutos,
      valor: parseMoeda(valorFormatado),
      dataTimeSheet: parseData(dataTimeSheet),
      operacao: opReg !== "Não mapeada" ? opReg : operacao,
      diretoria,
      coordenador,
      equipe,
    });
  }

  return results;
}

// ─── RESUMO POR OPERAÇÃO ──────────────────────────────────────────────────────

function extrairResumoOperacoes(text: string): OperacaoResumo[] {
  const resumos: OperacaoResumo[] = [];
  const rx =
    /Existe(?:m)?\s+(\d+)\s+time\s+sheets?\s+no\s+valor\s+de\s+R\$?\s*([\d.,]+)\s+em\s+([^\n.]+)/gi;
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

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

export async function parseTimesheetPDF(
  buffer: Buffer
): Promise<ParsedTimesheetData> {
  const data = await pdfParse(buffer);
  const rawText = data.text;

  const normalized = normalizePdfText(rawText);
  const blocks = getOperationBlocks(normalized);
  const resumoPorOperacao = extrairResumoOperacoes(rawText);

  const itensDetalhados: TimeSheetItem[] = [];
  for (const block of blocks) {
    itensDetalhados.push(...parseEntriesFromBlock(block.content, block.operacao));
  }

  const itensValidos = itensDetalhados
    .filter((r) => r.numeroAddvalora && r.dataTimeSheet)
    .map((r) => ({
      ...r,
      segurado: r.segurado.replace(/\s+/g, " ").trim(),
      regulador: r.regulador.replace(/\s+/g, " ").trim(),
    }));

  // Log de diagnóstico
  const naoId = itensValidos.filter((r) => r.regulador === "Não identificado");
  if (naoId.length > 0) {
    console.warn(
      `[Parser] ${naoId.length} reguladores não identificados:`,
      [...new Set(naoId.map((r) => r.regulador))].slice(0, 20)
    );
  }

  return {
    resumoPorOperacao,
    itensDetalhados: itensValidos,
    totalGeral: {
      quantidadeTotal: itensValidos.length,
      valorTotal: itensValidos.reduce((s, i) => s + i.valor, 0),
    },
  };
}
