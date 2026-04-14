"use client";

import { TimeSheetItem, OperacaoResumo, ParsedTimesheetData } from "./timesheet-types";
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

function normalizeWord(w: string): string {
  return w
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

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

function fixConcatenations(text: string): string {
  return text
    .replace(/Min(R\$)/g, "Min $1")
    .replace(/(R\$\s*-?\d+[.,]\d{2})(\d{2}\/\d{2}\/\d{4})/g, "$1 $2")
    .replace(/(R\$\s*-?\d+)(\d{2}\/\d{2}\/\d{4})/g, "$1 $2")
    .replace(/[ ]{2,}/g, " ");
}

// ─── CONVERSÕES ───────────────────────────────────────────────────────────────

function parseMoeda(valor: string): number {
  if (!valor) return 0;
  let v = valor.replace(/R\$\s*/gi, "").replace(/\s/g, "").trim();
  v = v.replace(/\d{2}\/\d{2}\/\d{4}$/, "").trim();
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseData(data: string): string {
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : data;
}

// ─── EXTRAÇÃO DE REGULADOR ────────────────────────────────────────────────────

const REGULADORES_SORTED = Object.keys(REGULADORES_MAP).sort(
  (a, b) => b.length - a.length
);

interface RegResult {
  segurado: string;
  regulador: string;
  diretoria: string;
  equipe: string;
  coordenador: string;
  operacao: string;
}

function extractReguladorAndSegurado(head: string): RegResult {
  const headClean = head.replace(/\s+/g, " ").trim();
  const words = headClean.split(/\s+/).filter(Boolean);
  const wordsNorm = words.map(normalizeWord);

  for (const key of REGULADORES_SORTED) {
    const info = REGULADORES_MAP[key];
    if (!info) continue;
    const keyWords = key.split(/\s+/).filter(Boolean);
    const kLen = keyWords.length;

    // Caso 1: palavras completas
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

    // Caso 2: primeira palavra colada ao fim do segurado
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

// ─── BLOCOS E ENTRADAS ────────────────────────────────────────────────────────

function getOperationBlocks(text: string): Array<{ operacao: string; content: string }> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: Array<{ operacao: string; lines: string[] }> = [];
  let currentOp = "Não mapeada";
  for (const line of lines) {
    const op = OPERACOES_VALIDAS.find((o) => line.toLowerCase() === o.toLowerCase());
    if (op) { currentOp = op; blocks.push({ operacao: op, lines: [] }); continue; }
    if (!blocks.length) blocks.push({ operacao: currentOp, lines: [] });
    blocks[blocks.length - 1].lines.push(line);
  }
  return blocks.map((b) => ({ operacao: b.operacao, content: b.lines.join(" ") }));
}

function parseEntriesFromBlock(blockText: string, operacao: string): TimeSheetItem[] {
  const text = fixConcatenations(blockText);
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

// ─── PDF.JS ───────────────────────────────────────────────────────────────────

let pdfjs: typeof import("pdfjs-dist") | null = null;
async function getPdfjs() {
  if (!pdfjs) {
    pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjs;
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

export async function parseTimesheetPDFClient(file: File): Promise<ParsedTimesheetData> {
  const PDFJS = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[]).map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  const normalized = normalizePdfText(fullText);
  const blocks = getOperationBlocks(normalized);
  const resumoPorOperacao = extrairResumoOperacoes(fullText);
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

  return {
    resumoPorOperacao,
    itensDetalhados: itensValidos,
    totalGeral: {
      quantidadeTotal: itensValidos.length,
      valorTotal: itensValidos.reduce((s, i) => s + i.valor, 0),
    },
  };
}
