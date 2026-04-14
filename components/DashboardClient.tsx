"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDashboardData, DashboardResponse, EvolucaoMensalItem } from "@/lib/fetch-dashboard-data";
import { RawRow } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import BarChartComponent from "@/components/BarChartComponent";
import LineChartComponent from "@/components/LineChartComponent";
import RankingTable from "@/components/RankingTable";
import RankingDiretores from "@/components/RankingDiretores";
import MercadoFinanceiro from "@/components/MercadoFinanceiro";
import FiltroPeriodoEStats from "@/components/FiltroPeriodoEStats";
import InsightsPanel from "@/components/InsightsPanel";
import DebugDataOrigem from "@/components/DebugDataOrigem";
import TimesheetSection from "@/components/timesheet/TimesheetSection";
import { getUnidadeClassificacao, DIRETORES_OFICIAIS } from "@/lib/unidade-map";

const MONTH_ORDER = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Converte data do formato DD/MM/YYYY ou yyyy-mm-dd para objeto Date
 * Retorna null se a data for inválida
 */
function parseDataBR(dataStr: string): Date | null {
  if (!dataStr || typeof dataStr !== 'string') return null;
  
  // Verifica formato ISO yyyy-mm-dd (usado pelo input type="date")
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }
  
  // Verifica formato DD/MM/YYYY
  const parts = dataStr.split('/');
  if (parts.length === 3) {
    const dia = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10) - 1; // meses em JS são 0-11
    const ano = parseInt(parts[2], 10);
    
    if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
      const data = new Date(ano, mes, dia);
      // Verifica se a data é válida
      if (data.getDate() === dia && data.getMonth() === mes && data.getFullYear() === ano) {
        return data;
      }
    }
  }
  
  // Fallback: tenta parse padrão
  const fallback = new Date(dataStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

const ENDPOINT_GARANTIA = "https://script.google.com/macros/s/AKfycby4inZLSHL03vwcBElgSmoirE6Q3xDOLnFqlseqV-ssVdevR3BDa3VTxqgBz3zz280z2A/exec";

const ENDPOINT_RCP = "https://script.google.com/macros/s/AKfycbzRUdAaW2bLconAS-VfN-7WHBqQmYjfggWev52uPOyzcgi3xhxJWMBhJrKwmrT_h-nP0A/exec";
// Fallback URL (redirect do Google — menos estável que a exec, use como backup)
const ENDPOINT_RCP_FALLBACK = "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMWeQFBwrQXK7P4qcH7w0m8RCPX8PFZjaoUeCVkglp-DBg-RYHHV7ramnoHSFoqu742-FEms051q49jfLD9ULQUwqCSoc2CPZUwCB4AsmlHDPX7BV1p-CLgNg9WiR9QTblznYpZSF1lm2km0DTh-_b909uQfX0xIc0xD4VY5Sug_RnBnZpajfE6DTfXRyEhyJe5LP1Z2w09O9st5sxUyCkNnaI9ZCvJUxcqBbg6tDvrHV64rfCig3FLeYgsvEl5g-TuAt4N9l1wEHwdHsKBpdEF5KMArHw&lib=Mbhaa8mSqXLzrk6zxCMZhNRHumANbtT3a";

/**
 * Busca e normaliza dados do endpoint RCP (diretoria Everton Voleck)
 */
async function fetchRCPData(): Promise<RawRow[]> {
  console.log("[RCP] Iniciando fetch...");
  console.log("[RCP] URL fetch:", ENDPOINT_RCP);

  try {
    const response = await fetch(ENDPOINT_RCP, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[RCP] Erro HTTP:", response.status);
      return [];
    }

    const result = await response.json();
    console.log("[RCP] Resposta bruta:", result);
    console.log("[RCP] Estrutura recebida:", Object.keys(result));

    if (!result.success || !result.records || !Array.isArray(result.records)) {
      console.error("[RCP] Dados inválidos - records não encontrado");
      return [];
    }

    const records = result.records;
    console.log("[RCP] recebidos:", records.length);
    console.log("[RCP] Primeiro registro:", records[0]);
    console.log("[RCP] Total acionamentos do endpoint:", result.totalAcionamentos);

    // Verificar totais por mês
    const totaisPorMes: Record<string, number> = {};
    records.forEach((rec: any) => {
      const qtd = parseInt(String(rec.quantidade ?? "1"), 10) || 1;
      totaisPorMes[rec.mes] = (totaisPorMes[rec.mes] || 0) + qtd;
    });
    console.log("[RCP] Totais por mes (endpoint):", totaisPorMes);

    const normalizados: RawRow[] = [];

    records.forEach((rec: any, index: number) => {
      // Cada registro é uma linha oficial - usar quantidade para agregação
      // NÃO expandir em N linhas, manter quantidade como campo numérico
      const quantidade = Math.max(1, parseInt(String(rec.quantidade ?? "1"), 10) || 1);

      // Converter mes (YYYY-MM) em nome abreviado e ano
      let mesNome = "Jan";
      let anoStr = "2026";
      if (rec.mes && typeof rec.mes === "string" && rec.mes.includes("-")) {
        const [anoP, mesP] = rec.mes.split("-");
        const mesNum = parseInt(mesP, 10);
        if (mesNum >= 1 && mesNum <= 12) mesNome = MONTH_ORDER[mesNum - 1];
        if (anoP) anoStr = anoP;
      } else if (rec.ano) {
        anoStr = String(rec.ano);
        if (rec.mesNumero && rec.mesNumero >= 1 && rec.mesNumero <= 12) {
          mesNome = MONTH_ORDER[rec.mesNumero - 1];
        }
      }

      // Criar UMA linha por registro, mantendo quantidade como campo
      // isMonthlyAggregated = true garante tratamento especial de filtro de período
      normalizados.push({
        data: rec.data || `${anoStr}-${String(MONTH_ORDER.indexOf(mesNome) + 1).padStart(2, "0")}-01`,
        ano: anoStr,
        mes: mesNome,
        numeroSeguradora: `RCP-${index + 1}`,
        seguradora: rec.seguradora || "Não informada",
        segurado: "",
        unidade: rec.unidade || "RCP",
        area: "RCP",
        diretoria: "Everton Voleck",
        diretora: "Everton Voleck",
        coordenador: rec.regulador || rec.reguladorOriginal || "Não informado",
        observacoes: rec.operacao || "RCP",
        coordenadorAceitou: "Sim",
        abaOrigem: rec.abaOrigem || "RCP",
        quantidade: quantidade,
        isMonthlyAggregated: true,
      });
    });

    console.log("[RCP] após parse:", normalizados.length);
    
    // Verificar totais por mês após normalização
    const totaisPorMesNormalizado: Record<string, number> = {};
    normalizados.forEach((row) => {
      totaisPorMesNormalizado[row.mes] = (totaisPorMesNormalizado[row.mes] || 0) + (row.quantidade || 1);
    });
    console.log("[RCP] Totais por mes (normalizado):", totaisPorMesNormalizado);
    console.log("[RCP] Primeira amostra:", normalizados[0]);
    console.log("[RCP] Última amostra:", normalizados[normalizados.length - 1]);
    
    return normalizados;
  } catch (err) {
    console.error("[RCP] Erro no fetch:", err);
    return [];
  }
}

/**
 * Busca e normaliza dados da planilha de Garantia
 */
async function fetchGarantiaData(): Promise<RawRow[]> {
  console.log("[Garantia] Iniciando fetch...");
  
  try {
    const response = await fetch(ENDPOINT_GARANTIA, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[Garantia] Erro HTTP:", response.status);
      return [];
    }

    const result = await response.json();
    console.log("[Garantia] Resposta completa:", result);
    console.log("[Garantia] Estrutura recebida:", Object.keys(result));

    // Verificar se tem casos (formato correto do endpoint)
    if (!result.ok || !result.casos || !Array.isArray(result.casos)) {
      console.error("[Garantia] Dados inválidos - casos não encontrado");
      console.error("[Garantia] Estrutura:", Object.keys(result));
      return [];
    }

    const casos = result.casos;
    console.log("Garantia - recebidos:", casos.length);
    
    // Debug: verificar formato das datas
    if (casos.length > 0) {
      console.log('[DEBUG] Primeiro caso - data raw:', casos[0].data, 'tipo:', typeof casos[0].data);
      console.log('[DEBUG] Primeiro caso - aba:', casos[0].aba);
    }

    // Normalizar cada caso para o formato RawRow
    const normalizados: RawRow[] = casos.map((caso: any, index: number) => {
      // Mapear aba (SG1/SG2/SG3) para unidade correta
      let unidade = "SG1"; // Default
      if (caso.aba === "SG1") unidade = "SG1";
      else if (caso.aba === "SG2") unidade = "SG2";
      else if (caso.aba === "SG3") unidade = "SG3";
      
      // Processar data corretamente
      let dataStr = "";
      let mes = "Jan";
      let ano = "2025";
      
      if (caso.data && typeof caso.data === 'string') {
        // Data vem no formato DD/MM/YYYY
        dataStr = caso.data;
        const dataParts = caso.data.split('/');
        if (dataParts.length === 3) {
          const mesNum = parseInt(dataParts[1]);
          const anoNum = parseInt(dataParts[2]);
          
          if (mesNum >= 1 && mesNum <= 12) {
            mes = MONTH_ORDER[mesNum - 1];
          }
          if (anoNum >= 2020 && anoNum <= 2030) {
            ano = anoNum.toString();
          }
        }
      } else {
        // Se não tem data, usar data atual
        const hoje = new Date();
        dataStr = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
        mes = MONTH_ORDER[hoje.getMonth()];
        ano = hoje.getFullYear().toString();
      }
      
      return {
        data: dataStr,
        ano: ano,
        mes: mes,
        numeroSeguradora: caso.processo || `GAR-${index + 1}`,
        seguradora: caso.seguradora || "Não informada",
        segurado: caso.segurado || "Não informado",
        unidade: unidade,
        area: "Garantia",
        diretoria: "Garantia",
        diretora: "Rebeca Hilcko",
        coordenador: caso.regulador || "Não informado",
        observacoes: [caso.status, caso.observacoes].filter(Boolean).join(" - "),
        coordenadorAceitou: "Sim",
        abaOrigem: caso.aba || "Garantia"
      };
    });

    console.log("Garantia - após parse:", normalizados.length);
    if (normalizados.length > 0) {
      console.log("[Garantia] Primeira amostra:", normalizados[0]);
      console.log("[Garantia] Última amostra:", normalizados[normalizados.length - 1]);
      
      // Log de distribuição por mês
      const porMes: Record<string, number> = {};
      normalizados.forEach(r => {
        porMes[r.mes] = (porMes[r.mes] || 0) + 1;
      });
      console.log("[Garantia] Distribuição por mês:", porMes);
    }
    
    return normalizados;
  } catch (err) {
    console.error("[Garantia] Erro no fetch:", err);
    return [];
  }
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Calcula o total de acionamentos considerando o campo quantidade quando presente
 * Para RCP e outras diretorias que usam agregação por quantidade
 */
function calcularTotal(rows: RawRow[]): number {
  return rows.reduce((total, row) => {
    // Se tem quantidade definida, usar ela; senão contar como 1
    const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
      ? row.quantidade 
      : 1;
    return total + qtd;
  }, 0);
}

/**
 * Agrupa rows por uma chave e soma as quantidades
 */
function agruparPorChave(rows: RawRow[], chaveFn: (row: RawRow) => string): Record<string, number> {
  const resultado: Record<string, number> = {};
  rows.forEach(row => {
    const chave = chaveFn(row);
    const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
      ? row.quantidade 
      : 1;
    resultado[chave] = (resultado[chave] || 0) + qtd;
  });
  return resultado;
}

function isValidYear(year: string) {
  return /^\d{4}$/.test(year) && Number(year) >= 2025 && Number(year) <= CURRENT_YEAR;
}

function sortMonths(months: string[]) {
  return [...months].sort(
    (a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
  );
}

/**
 * Normaliza nomes de unidades vindos da planilha
 * Corrige erros de digitação, espaços e variações
 */
function normalizarUnidade(nome: string): string {
  if (!nome) return "";
  
  const limpo = nome.trim();
  const lower = limpo.toLowerCase();
  
  // Property (corrigir "propety", "propery", "proerty", "prperty", etc)
  // Usa regex para capturar qualquer coisa que se pareça com Property
  if (/p\s*r\s*o\s*p\s*e?\s*r?\s*t\s*y/i.test(limpo) ||
      lower.includes("prop") ||
      lower.includes("prp") ||
      lower.includes("perty") ||
      lower.includes("proer") ||
      lower.includes("prerty")) {
    const numero = limpo.match(/\d/);
    if (numero) return `Property ${numero[0]}`;
  }
  
  // RCG (Responsabilidade Civil Geral)
  if (lower.includes("rcg") || lower.includes("rc geral") || lower.includes("r.c.g")) {
    const numero = limpo.match(/\d/);
    if (numero) return `RCG${numero[0]}`;
    return "RCG1";
  }
  
  // RCP (Responsabilidade Civil Profissional)
  if (lower.includes("rcp") || lower.includes("rc prof") || lower.includes("r.c.p")) {
    const numero = limpo.match(/\d/);
    if (numero) return `RCP${numero[0]}`;
    return "RCP1";
  }
  
  // Garantia
  if (lower.includes("garantia") || lower.includes("garant")) {
    return "Garantia";
  }
  
  // Fiança
  if (lower.includes("fiança") || lower.includes("fianca") || lower.includes("fian�")) {
    return "Fiança";
  }
  
  // Transportes
  if (lower.includes("transport") || lower.includes("transp")) {
    return "Transportes";
  }
  
  // Engenharia
  if (lower.includes("engenharia") || lower.includes("engen")) {
    return "Engenharia";
  }
  
  // Energia
  if (lower.includes("energia") || lower.includes("energ")) {
    return "Energia";
  }
  
  // Construção
  if (lower.includes("construção") || lower.includes("construcao") || lower.includes("constr")) {
    return "Construção";
  }
  
  return limpo;
}

function downloadCSV(rows: RawRow[]) {
  const headers = [
    "Data",
    "Ano",
    "Mês",
    "Nº Seguradora",
    "Seguradora",
    "Segurado",
    "Unidade",
    "Área",
    "Diretoria",
    "Coordenador",
    "Observações",
    "Coordenador Aceitou",
    "Aba Origem",
  ];
  const csvRows = rows.map((item) => [
    item.data,
    item.ano,
    item.mes,
    item.numeroSeguradora,
    item.seguradora,
    item.segurado,
    item.unidade,
    item.area,
    item.diretoria,
    item.coordenador,
    item.observacoes,
    item.coordenadorAceitou,
    item.abaOrigem,
  ]);

  const csv = [headers, ...csvRows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `acionamentos_filtrados_${new Date().getTime()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="h-4 w-0.5 rounded-full" style={{ background: "#F58220" }} />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {children}
      </h2>
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [selectedSeguradora, setSelectedSeguradora] = useState<string | null>(null);
  const [selectedUnidade, setSelectedUnidade] = useState<string>("");
  const [selectedAno, setSelectedAno] = useState<string>("");
  const [selectedMes, setSelectedMes] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedDiretoria, setSelectedDiretoria] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  // Intervalo de sincronização automática (em ms) — 2 minutos
  const SYNC_INTERVAL = 2 * 60 * 1000;

  async function loadData(silent = false) {
    if (silent) {
      setSyncing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      // Carregar dados principais e garantia em paralelo
      const [dashboardData, garantiaRows, rcpRows] = await Promise.all([
        fetchDashboardData(),
        fetchGarantiaData(),
        fetchRCPData()
      ]);
      
      console.log("[Dashboard] Dados principais:", dashboardData.rows?.length || 0, "registros");
      console.log("[Garantia] Recebidos:", garantiaRows.length);
      console.log("[RCP] Recebidos:", rcpRows.length);
      
      // Mesclar dados de garantia e RCP aos dados principais
      const extraRows = [...garantiaRows, ...rcpRows];
      if (extraRows.length > 0) {
        const rowsMesclados = [...(dashboardData.rows || []), ...extraRows];
        
        console.log("Total final:", rowsMesclados.length);
        
        // Atualizar config com novas unidades, anos e meses
        const unidadesExistentes = new Set(dashboardData.config?.unidades || []);
        const anosExistentes = new Set(dashboardData.config?.anos || []);
        const mesesExistentes = new Set(dashboardData.config?.meses || []);
        
        // Adicionar dados de Garantia e RCP aos conjuntos
        extraRows.forEach(r => {
          unidadesExistentes.add(r.unidade);
          if (r.ano && isValidYear(r.ano)) anosExistentes.add(r.ano);
          if (r.mes && MONTH_ORDER.includes(r.mes)) mesesExistentes.add(r.mes);
        });
        
        setData({
          ...dashboardData,
          rows: rowsMesclados,
          config: {
            ...dashboardData.config,
            unidades: Array.from(unidadesExistentes).sort(),
            anos: Array.from(anosExistentes).sort(),
            meses: Array.from(mesesExistentes),
          }
        });
      } else {
        setData(dashboardData);
      }
      
      setLastUpdated(new Date());

      if (!silent) {
        const anosLimpos = (dashboardData.config?.anos || [])
          .filter(isValidYear)
          .sort((a, b) => Number(a) - Number(b));
        if (anosLimpos.length > 0) {
          setSelectedAno(anosLimpos[anosLimpos.length - 1]);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      if (!silent) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao carregar dados."
        );
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadData(false);

    // Sincronização automática periódica
    const interval = setInterval(() => loadData(true), SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const anosValidos = useMemo(() => {
    if (!data) return [];
    return (data.config?.anos ?? [])
      .filter(isValidYear)
      .sort((a, b) => Number(a) - Number(b));
  }, [data]);

  const mesesOrdenados = useMemo(() => {
    if (!data) return [];
    return sortMonths(
      (data.config?.meses ?? []).filter((mes) => MONTH_ORDER.includes(mes))
    );
  }, [data]);

  const seguradorasUnicas = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set((data.rows ?? []).map((s) => s.seguradora).filter(Boolean))).sort();
  }, [data]);

  const unidadesUnicas = useMemo(() => {
    if (!data) return [];
    const unidadesBrutas = (data.config?.unidades ?? []).filter(Boolean);
    const unidadesNormalizadas = unidadesBrutas.map(normalizarUnidade);
    return Array.from(new Set(unidadesNormalizadas)).sort();
  }, [data]);

  const areasUnicas = useMemo(() => {
    if (!data) return [];
    const areas = (data.rows ?? [])
      .map((row) => {
        // Linhas com quantidade explícita (RCP, etc.) usam row.area diretamente
        if (typeof row.quantidade === 'number') return row.area || "Não definida";
        const classif = getUnidadeClassificacao(row.unidade);
        return classif.area !== "Não definida" ? classif.area : (row.area || "Não definida");
      })
      .filter(Boolean);
    return Array.from(new Set(areas)).sort();
  }, [data]);

  const diretoriasUnicas = useMemo(() => {
    if (!data) return [];
    const dirs = (data.rows ?? [])
      .map((row) => {
        // Linhas com quantidade explícita (RCP, etc.) usam row.diretoria diretamente
        if (typeof row.quantidade === 'number') return row.diretoria || row.diretora || "Não definido";
        const classif = getUnidadeClassificacao(row.unidade);
        return classif.diretor !== "Não definido" ? classif.diretor : (row.diretoria || "Não definido");
      })
      .filter((d) => d && d !== "Não definido");
    return Array.from(new Set(dirs)).sort();
  }, [data]);

  // 1. Filtragem Principal Baseada em data.rows
  const filteredRows = useMemo(() => {
    if (!data) return [];
    
    // Debug: contar dados do Garantia antes do filtro
    const garantiaRowsBefore = (data.rows ?? []).filter(r => r.area === 'Garantia' || r.unidade === 'SG1' || r.unidade === 'SG2');
    console.log('[DEBUG] Garantia rows antes do filtro:', garantiaRowsBefore.length);
    if (garantiaRowsBefore.length > 0) {
      console.log('[DEBUG] Amostra Garantia (antes):', {
        data: garantiaRowsBefore[0].data,
        ano: garantiaRowsBefore[0].ano,
        mes: garantiaRowsBefore[0].mes,
        unidade: garantiaRowsBefore[0].unidade,
        area: garantiaRowsBefore[0].area,
        diretoria: garantiaRowsBefore[0].diretoria,
        diretora: garantiaRowsBefore[0].diretora,
      });
    }
    
    const filtered = (data.rows ?? []).filter((row) => {
      // Linhas com quantidade explícita (RCP, etc.) usam campos diretos sem classificação
      const isAggregatedRow = typeof row.quantidade === 'number';

      let areaEfetiva: string;
      let diretorEfetivo: string;

      if (isAggregatedRow) {
        areaEfetiva = row.area || "Não definida";
        diretorEfetivo = row.diretoria || row.diretora || "Não definido";
      } else {
        const classif = getUnidadeClassificacao(row.unidade);
        areaEfetiva = classif.area !== "Não definida" ? classif.area : (row.area || "Não definida");
        diretorEfetivo = classif.diretor !== "Não definido" ? classif.diretor : (row.diretora || row.diretoria || "Não definido");
      }
      
      const matchAno = !selectedAno || row.ano === selectedAno;
      const matchMes = !selectedMes || row.mes === selectedMes;
      const matchSeguradora = !selectedSeguradora || row.seguradora === selectedSeguradora;
      const matchUnidade = !selectedUnidade || normalizarUnidade(row.unidade) === selectedUnidade;
      const matchArea = !selectedArea || areaEfetiva === selectedArea;
      const matchDiretoria = !selectedDiretoria || diretorEfetivo === selectedDiretoria;

      // Filtro de período — lógica diferente para base mensal (RCP) vs diária (demais)
      let matchPeriodo = true;
      if (dataInicio || dataFim) {
        if (row.isMonthlyAggregated) {
          // RCP: comparar por competência mensal (YYYY-MM), ignorar o dia do input
          const rowMonthKey = `${row.ano}-${String(MONTH_ORDER.indexOf(row.mes) + 1).padStart(2, "0")}`;
          if (dataInicio) {
            const inicioMonthKey = dataInicio.substring(0, 7); // "YYYY-MM"
            matchPeriodo = matchPeriodo && rowMonthKey >= inicioMonthKey;
          }
          if (dataFim) {
            const fimMonthKey = dataFim.substring(0, 7); // "YYYY-MM"
            matchPeriodo = matchPeriodo && rowMonthKey <= fimMonthKey;
          }
        } else {
          // Demais diretorias: comparação diária normal — usando parser de data BR
          // Zerar horário para comparar apenas datas
          const rowDate = parseDataBR(row.data);
          if (!rowDate) {
            matchPeriodo = false; // Data inválida não passa no filtro
          } else {
            // Zerar horário da rowDate para comparação precisa
            rowDate.setHours(0, 0, 0, 0);
            if (dataInicio) {
              const inicio = parseDataBR(dataInicio);
              if (inicio) {
                inicio.setHours(0, 0, 0, 0);
                matchPeriodo = matchPeriodo && rowDate >= inicio;
              }
            }
            if (dataFim) {
              const fim = parseDataBR(dataFim);
              if (fim) {
                fim.setHours(23, 59, 59, 999);
                matchPeriodo = matchPeriodo && rowDate <= fim;
              }
            }
          }
        }
      }

      return (
        matchAno &&
        matchMes &&
        matchSeguradora &&
        matchUnidade &&
        matchArea &&
        matchDiretoria &&
        matchPeriodo
      );
    });
    
    // Debug: contar dados do Garantia após o filtro
    const garantiaRowsAfter = filtered.filter(r => r.area === 'Garantia' || r.unidade === 'SG1' || r.unidade === 'SG2');
    console.log('[DEBUG] Garantia rows após o filtro:', garantiaRowsAfter.length);
    
    // Debug: contar dados do RCP após o filtro
    const rcpRowsAfter = filtered.filter(r => r.diretoria === 'Everton Voleck' || r.area === 'RCP');
    console.log('[DEBUG] RCP rows após o filtro:', rcpRowsAfter.length);
    console.log('[DEBUG] RCP total quantidade:', rcpRowsAfter.reduce((sum, r) => sum + (r.quantidade || 1), 0));
    
    console.log('[DEBUG] Filtros aplicados:', { selectedAno, selectedMes, selectedDiretoria, selectedArea, dataInicio, dataFim });
    
    return filtered;
  }, [
    data,
    selectedAno,
    selectedMes,
    selectedSeguradora,
    selectedUnidade,
    selectedArea,
    selectedDiretoria,
    dataInicio,
    dataFim,
  ]);

  // 2. Recalcular Seguradoras para Ranking e BarChart
  const recalculatedSeguradoras = useMemo(() => {
    if (!filteredRows.length) return [];

    const grouped: Record<string, { acionamentos: number; unitCounts: Record<string, number> }> = {};

    filteredRows.forEach((row) => {
      if (!grouped[row.seguradora]) {
        grouped[row.seguradora] = { acionamentos: 0, unitCounts: {} };
      }
      // Usar quantidade se disponível, senão 1
      const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
        ? row.quantidade 
        : 1;
      grouped[row.seguradora].acionamentos += qtd;
      const u = row.unidade || "Não definido";
      grouped[row.seguradora].unitCounts[u] = (grouped[row.seguradora].unitCounts[u] || 0) + qtd;
    });

    return Object.entries(grouped)
      .map(([nome, info], idx) => {
        // Usa a unidade mais frequente para classificar a seguradora
        const topUnit = Object.entries(info.unitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
        const classif = getUnidadeClassificacao(topUnit);
        // Fallback para valores padrão quando classificação falhar
        const areaEfetiva = classif.area !== "Não definida" ? classif.area : "Garantia";
        const diretorEfetivo = classif.diretor !== "Não definido" ? classif.diretor : "Rebeca Hilcko";
        return {
          id: `rank-${idx}-${nome}`,
          nome,
          acionamentos: info.acionamentos,
          variacao: 0,
          unidade: topUnit,
          area: areaEfetiva,
          diretoria: diretorEfetivo,
          coordenador: classif.coordenador,
        };
      })
      .sort((a, b) => b.acionamentos - a.acionamentos);
  }, [filteredRows]);

  // 3. Recalcular Evolução Mensal (Tendência)
  const recalculatedEvolucao = useMemo(() => {
    if (!data) return [];

    const trendRows = (data.rows ?? []).filter((row) => {
      // Mesma lógica de classificação usada no filteredRows
      const isAggregatedRow = typeof row.quantidade === 'number';
      let areaEfetiva: string;
      let diretorEfetivo: string;

      if (isAggregatedRow) {
        areaEfetiva = row.area || "Não definida";
        diretorEfetivo = row.diretoria || row.diretora || "Não definido";
      } else {
        const classif = getUnidadeClassificacao(row.unidade);
        areaEfetiva = classif.area !== "Não definida" ? classif.area : (row.area || "Não definida");
        diretorEfetivo = classif.diretor !== "Não definido" ? classif.diretor : (row.diretora || row.diretoria || "Não definido");
      }

      const matchAno = !selectedAno || row.ano === selectedAno;
      const matchSeguradora = !selectedSeguradora || row.seguradora === selectedSeguradora;
      const matchUnidade = !selectedUnidade || normalizarUnidade(row.unidade) === selectedUnidade;
      const matchArea = !selectedArea || areaEfetiva === selectedArea;
      const matchDiretoria = !selectedDiretoria || diretorEfetivo === selectedDiretoria;

      return (
        matchAno &&
        matchSeguradora &&
        matchUnidade &&
        matchArea &&
        matchDiretoria
      );
    });

    // Calcular top 4 usando soma de quantidade
    const seguradoraTotals: Record<string, number> = {};
    trendRows.forEach((row) => {
      const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
        ? row.quantidade 
        : 1;
      seguradoraTotals[row.seguradora] = (seguradoraTotals[row.seguradora] || 0) + qtd;
    });
    
    const top4Names = Object.entries(seguradoraTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((x) => x.name);

    const monthlyMap: Record<string, EvolucaoMensalItem> = {};

    trendRows.forEach((row) => {
      const mes = row.mes;
      if (!monthlyMap[mes]) {
        monthlyMap[mes] = { mes, totalGeral: 0 };
      }
      // Usar quantidade se disponível, senão 1
      const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
        ? row.quantidade 
        : 1;
      monthlyMap[mes].totalGeral += qtd;

      if (top4Names.includes(row.seguradora)) {
        monthlyMap[mes][row.seguradora] = (Number(monthlyMap[mes][row.seguradora]) || 0) + qtd;
      }
    });

    // Filtra meses com registros isolados (dados espúrios / entradas únicas)
    const allValues = Object.values(monthlyMap).map((m) => m.totalGeral as number);
    const maxTotal = Math.max(...allValues, 1);
    const minThreshold = Math.max(2, Math.floor(maxTotal * 0.02));

    return sortMonths(Object.keys(monthlyMap))
      .map((m) => monthlyMap[m])
      .filter((m) => (m.totalGeral as number) >= minThreshold);
  }, [data, selectedAno, selectedSeguradora, selectedUnidade, selectedArea, selectedDiretoria]);

  // 4. KPIs Recalculados
  const totalAcionamentos = calcularTotal(filteredRows);
  
  // Debug: log quando filtro mudar
  useEffect(() => {
    if (selectedDiretoria === "Everton Voleck") {
      console.log("[DEBUG Everton] Filtros:", { selectedAno, selectedMes, selectedDiretoria });
      console.log("[DEBUG Everton] filteredRows.length:", filteredRows.length);
      console.log("[DEBUG Everton] totalAcionamentos (calcularTotal):", totalAcionamentos);
      
      // Verificar distribuição por mês
      const porMes: Record<string, { count: number; totalQtd: number }> = {};
      filteredRows.forEach(row => {
        const mes = row.mes;
        const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 ? row.quantidade : 1;
        if (!porMes[mes]) porMes[mes] = { count: 0, totalQtd: 0 };
        porMes[mes].count++;
        porMes[mes].totalQtd += qtd;
      });
      console.log("[DEBUG Everton] Distribuição por mês:", porMes);
      
      // Verificar se há linhas RCP
      const rcpRows = filteredRows.filter(r => r.diretoria === "Everton Voleck");
      console.log("[DEBUG Everton] Linhas RCP no filteredRows:", rcpRows.length);
      if (rcpRows.length > 0) {
        console.log("[DEBUG Everton] Amostra RCP:", rcpRows[0]);
      }
    }
  }, [filteredRows, selectedAno, selectedMes, selectedDiretoria, totalAcionamentos]);
  
  const seguradorasAtivasCount = recalculatedSeguradoras.length;
  const topSeguradora = recalculatedSeguradoras[0] || null;

  // 5. Ranking de Diretores — sempre exibe todos os diretores do organograma
  const rankingDiretores = useMemo(() => {
    // Inicializa com todos os diretores oficiais zerados
    const grouped: Record<string, {
      acionamentos: number;
      area: string;
      unidades: Set<string>;
      coordenadores: Record<string, number>;
    }> = {};

    DIRETORES_OFICIAIS.forEach(({ diretor, area }) => {
      grouped[diretor] = { acionamentos: 0, area, unidades: new Set(), coordenadores: {} };
    });

    filteredRows.forEach((row) => {
      // Para linhas com quantidade explícita (RCP), usar diretoria diretamente
      const isAggregatedRow = typeof row.quantidade === 'number';
      let dir: string;
      
      if (isAggregatedRow) {
        dir = row.diretoria || row.diretora || "Não definido";
      } else {
        const classif = getUnidadeClassificacao(row.unidade);
        dir = classif.diretor;
        if (!dir || dir === "Não definido") {
          dir = row.diretora || row.diretoria || "Não definido";
        }
      }
      
      if (!dir || dir === "Não definido" || !grouped[dir]) return;
      
      // Usar quantidade se disponível, senão 1
      const qtd = typeof row.quantidade === 'number' && row.quantidade > 0 
        ? row.quantidade 
        : 1;
      grouped[dir].acionamentos += qtd;
      
      if (!isAggregatedRow) {
        const classif = getUnidadeClassificacao(row.unidade);
        if (classif.time && classif.time !== "Não mapeado") {
          grouped[dir].unidades.add(classif.time);
        } else {
          grouped[dir].unidades.add(row.unidade);
        }
        const coord = (classif.coordenador && classif.coordenador !== "—")
          ? classif.coordenador
          : `${classif.time || row.unidade} (s/ coord.)`;
        grouped[dir].coordenadores[coord] = (grouped[dir].coordenadores[coord] || 0) + qtd;
      } else {
        grouped[dir].unidades.add(row.unidade);
        const coord = row.coordenador || row.unidade || "Não informado";
        grouped[dir].coordenadores[coord] = (grouped[dir].coordenadores[coord] || 0) + qtd;
      }
    });

    return Object.entries(grouped)
      .map(([diretor, info]) => ({
        diretor,
        area: info.area,
        acionamentos: info.acionamentos,
        unidades: Array.from(info.unidades).sort(),
        coordenadores: Object.entries(info.coordenadores)
          .map(([nome, total]) => ({ nome, total }))
          .sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.acionamentos - a.acionamentos);
  }, [filteredRows]);

  function toggleSeguradora(nome: string | null) {
    setSelectedSeguradora((prev) => (prev === nome ? null : nome));
  }

  function handleClear() {
    setSelectedSeguradora(null);
    setSelectedUnidade("");
    setSelectedMes("");
    setSelectedArea("");
    setSelectedDiretoria("");
    setDataInicio("");
    setDataFim("");
    setSelectedAno(anosValidos[anosValidos.length - 1] ?? "");
  }

  function handleExportCSV() {
    downloadCSV(filteredRows);
  }

  const periodoLabel =
    [selectedMes, selectedAno].filter(Boolean).join("/") ||
    (selectedAno ? `Ano ${selectedAno}` : "Período atual");

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-[#F58220]" />
        <div className="animate-pulse text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Sincronizando com a planilha oficial...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-white">Indisponibilidade de Dados</h2>
        <p className="mb-8 max-w-md leading-relaxed text-slate-400">
          {error || "Não foi possível conectar ao servidor do Google Apps Script."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">

      {/* Barra de status de sincronização */}
      <div className="mb-4 flex items-center justify-end gap-3">
        {syncing ? (
          <span className="flex items-center gap-2 text-xs text-blue-400">
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Sincronizando com Apps Script...
          </span>
        ) : lastUpdated ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sincronizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            <span className="ml-2 text-slate-600">· atualiza a cada 2 min</span>
          </span>
        ) : null}
        <button
          onClick={() => loadData(true)}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Atualizar
        </button>
      </div>

      <FilterBar
        seguradoras={seguradorasUnicas}
        unidades={unidadesUnicas}
        areas={areasUnicas}
        diretorias={diretoriasUnicas}
        anos={anosValidos}
        meses={mesesOrdenados}
        selectedSeguradora={selectedSeguradora ?? ""}
        selectedUnidade={selectedUnidade}
        selectedArea={selectedArea}
        selectedDiretoria={selectedDiretoria}
        selectedAno={selectedAno}
        selectedMes={selectedMes}
        onSeguradoraChange={(v) => setSelectedSeguradora(v || null)}
        onUnidadeChange={setSelectedUnidade}
        onAreaChange={setSelectedArea}
        onDiretoriaChange={setSelectedDiretoria}
        onAnoChange={setSelectedAno}
        onMesChange={setSelectedMes}
        onClear={handleClear}
      />

      <FiltroPeriodoEStats
        dataInicio={dataInicio}
        dataFim={dataFim}
        onDataInicioChange={setDataInicio}
        onDataFimChange={setDataFim}
        filteredRows={filteredRows}
      />

      <section className="mb-8 mt-6">
        <SectionTitle>Indicadores Executivos — {periodoLabel}</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Total de Acionamentos
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {totalAcionamentos.toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Seguradoras Ativas
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {seguradorasAtivasCount}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Maior Seguradora
            </div>
            <div className="mt-2 text-lg font-bold text-white">
              {topSeguradora?.nome ?? "—"}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {topSeguradora
                ? `${topSeguradora.acionamentos.toLocaleString("pt-BR")} acionamentos`
                : "Sem dados"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-xs uppercase tracking-widest text-slate-400">
              Abas Lidas
            </div>
            <div className="mt-2 text-sm font-medium text-white">
              {data.meta.abasLidas.join(", ")}
            </div>
          </div>
        </div>
      </section>

      {/* Dados de Garantia agora estão integrados ao dataset principal */}

      <section className="mb-8">
        <SectionTitle>Distribuição e Evolução</SectionTitle>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            className="flex h-[450px] flex-col rounded-xl p-6"
            style={{
              background: "rgba(15,42,68,0.7)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            <h2 className="mb-1 text-sm font-semibold text-white">
              Acionamentos por Seguradora
            </h2>
            <p className="mb-5 text-xs text-slate-500">
              {selectedSeguradora
                ? `Filtrado: ${selectedSeguradora} · clique novamente para desmarcar`
                : "Clique em uma barra para filtrar"}
            </p>

            <div className="min-h-0 flex-1">
              <BarChartComponent
                data={recalculatedSeguradoras}
                selectedSeguradora={selectedSeguradora}
                onSelect={toggleSeguradora}
              />
            </div>
          </div>

          <div
            className="flex h-[450px] flex-col rounded-xl p-6"
            style={{
              background: "rgba(15,42,68,0.7)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            <LineChartComponent
              data={recalculatedEvolucao}
              selectedSeguradora={selectedSeguradora}
              onSelectSeguradora={toggleSeguradora}
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <SectionTitle>Ranking de Seguradoras</SectionTitle>
        <RankingTable
          data={recalculatedSeguradoras}
          selectedSeguradora={selectedSeguradora}
          onSelect={toggleSeguradora}
        />
      </section>

      <section className="mb-8">
        <SectionTitle>Ranking de Diretores</SectionTitle>
        <RankingDiretores data={rankingDiretores} />
      </section>

      <InsightsPanel 
        filteredRows={filteredRows}
        totalAcionamentos={totalAcionamentos}
      />

      <MercadoFinanceiro />

      <section className="mb-2">
        <SectionTitle>Exportação</SectionTitle>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "rgba(15,42,68,0.8)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
            }}
          >
            Exportar CSV
            <span className="text-[10px] text-slate-500">
              — {filteredRows.length} linhas
            </span>
          </button>
        </div>
      </section>

      <DebugDataOrigem
        filteredRows={filteredRows}
        totalAcionamentos={totalAcionamentos}
        filtrosAplicados={{
          ano: selectedAno,
          mes: selectedMes,
          seguradora: selectedSeguradora || undefined,
          unidade: selectedUnidade || undefined,
          area: selectedArea || undefined,
          diretoria: selectedDiretoria || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        }}
      />

      {/* Time Sheet Section - Novo módulo independente */}
      <section className="mb-8">
        <TimesheetSection />
      </section>
    </main>
  );
}