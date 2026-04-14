"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ParsedTimesheetData,
  TimeSheetItem,
  FiltrosTimesheet,
} from "@/lib/timesheet-types";

interface TimesheetDashboardProps {
  data: ParsedTimesheetData;
}

const COLORS = ["#F58220", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function TimesheetDashboard({ data }: TimesheetDashboardProps) {
  const [filtros, setFiltros] = useState<FiltrosTimesheet>({
    operacao: null,
    diretoria: null,
    coordenador: null,
    equipe: null,
    regulador: null,
    dataInicio: null,
    dataFim: null,
    busca: "",
  });

  const limparFiltros = () =>
    setFiltros({
      operacao: null,
      diretoria: null,
      coordenador: null,
      equipe: null,
      regulador: null,
      dataInicio: null,
      dataFim: null,
      busca: "",
    });

  // Listas únicas derivadas de todos os itens (para os selects)
  const opcoes = useMemo(() => {
    const todos = data.itensDetalhados;
    return {
      operacoes: [...new Set(todos.map((i) => i.operacao))].filter(Boolean).sort(),
      diretorias: [...new Set(todos.map((i) => i.diretoria))].filter(Boolean).sort(),
      coordenadores: [...new Set(todos.map((i) => i.coordenador))].filter(Boolean).sort(),
      equipes: [...new Set(todos.map((i) => i.equipe))].filter(Boolean).sort(),
      reguladores: [...new Set(todos.map((i) => i.regulador))].filter(Boolean).sort(),
    };
  }, [data.itensDetalhados]);

  // Filtrar itens
  const itensFiltrados = useMemo(() => {
    return data.itensDetalhados.filter((item) => {
      if (filtros.operacao && item.operacao !== filtros.operacao) return false;
      if (filtros.diretoria && item.diretoria !== filtros.diretoria) return false;
      if (filtros.coordenador && item.coordenador !== filtros.coordenador) return false;
      if (filtros.equipe && item.equipe !== filtros.equipe) return false;
      if (filtros.regulador && item.regulador !== filtros.regulador) return false;
      if (filtros.dataInicio && item.dataTimeSheet < filtros.dataInicio) return false;
      if (filtros.dataFim && item.dataTimeSheet > filtros.dataFim) return false;
      if (filtros.busca) {
        const buscaLower = filtros.busca.toLowerCase();
        const matchAddvalora = item.numeroAddvalora.toLowerCase().includes(buscaLower);
        const matchSegurado = item.segurado.toLowerCase().includes(buscaLower);
        const matchRegulador = item.regulador.toLowerCase().includes(buscaLower);
        if (!matchAddvalora && !matchSegurado && !matchRegulador) return false;
      }
      return true;
    });
  }, [data.itensDetalhados, filtros]);

  // KPIs
  const kpis = useMemo(() => {
    const valorTotal = itensFiltrados.reduce((sum, item) => sum + item.valor, 0);
    const quantidadeTotal = itensFiltrados.length;

    const valorPorOperacao = new Map<string, number>();
    itensFiltrados.forEach((item) => {
      valorPorOperacao.set(item.operacao, (valorPorOperacao.get(item.operacao) || 0) + item.valor);
    });
    const operacaoMaiorValor = Array.from(valorPorOperacao.entries()).sort((a, b) => b[1] - a[1])[0];

    const qtdPorOperacao = new Map<string, number>();
    itensFiltrados.forEach((item) => {
      qtdPorOperacao.set(item.operacao, (qtdPorOperacao.get(item.operacao) || 0) + 1);
    });
    const operacaoMaiorQtd = Array.from(qtdPorOperacao.entries()).sort((a, b) => b[1] - a[1])[0];

    const identificados = itensFiltrados.filter((i) => i.diretoria !== "Não identificada").length;

    return {
      valorTotal,
      quantidadeTotal,
      operacaoMaiorValor: operacaoMaiorValor?.[0] || "-",
      valorOperacaoMaior: operacaoMaiorValor?.[1] || 0,
      operacaoMaiorQtd: operacaoMaiorQtd?.[0] || "-",
      qtdOperacaoMaior: operacaoMaiorQtd?.[1] || 0,
      identificados,
      naoIdentificados: quantidadeTotal - identificados,
    };
  }, [itensFiltrados]);

  // Dados para gráficos
  const dadosGraficoValor = useMemo(() => {
    const map = new Map<string, number>();
    itensFiltrados.forEach((item) => {
      map.set(item.operacao, (map.get(item.operacao) || 0) + item.valor);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [itensFiltrados]);

  const dadosGraficoQtd = useMemo(() => {
    const map = new Map<string, number>();
    itensFiltrados.forEach((item) => {
      map.set(item.operacao, (map.get(item.operacao) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [itensFiltrados]);

  const dadosGraficoDiretoria = useMemo(() => {
    const map = new Map<string, number>();
    itensFiltrados.forEach((item) => {
      map.set(item.diretoria, (map.get(item.diretoria) || 0) + item.valor);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [itensFiltrados]);

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const selectClass =
    "bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F58220]";

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Filtros</h4>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar Addvalora, segurado ou regulador..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            className="flex-1 min-w-[260px] bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#F58220]"
          />

          <select
            value={filtros.diretoria || ""}
            onChange={(e) => setFiltros({ ...filtros, diretoria: e.target.value || null, coordenador: null, equipe: null })}
            className={selectClass}
          >
            <option value="">Todas as diretorias</option>
            {opcoes.diretorias.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filtros.coordenador || ""}
            onChange={(e) => setFiltros({ ...filtros, coordenador: e.target.value || null })}
            className={selectClass}
          >
            <option value="">Todos os coordenadores</option>
            {opcoes.coordenadores.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filtros.equipe || ""}
            onChange={(e) => setFiltros({ ...filtros, equipe: e.target.value || null })}
            className={selectClass}
          >
            <option value="">Todas as equipes</option>
            {opcoes.equipes.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <select
            value={filtros.operacao || ""}
            onChange={(e) => setFiltros({ ...filtros, operacao: e.target.value || null })}
            className={selectClass}
          >
            <option value="">Todas as operações</option>
            {opcoes.operacoes.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>

          <select
            value={filtros.regulador || ""}
            onChange={(e) => setFiltros({ ...filtros, regulador: e.target.value || null })}
            className={selectClass}
          >
            <option value="">Todos os reguladores</option>
            {opcoes.reguladores.map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>

          <input
            type="date"
            value={filtros.dataInicio || ""}
            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value || null })}
            className={selectClass}
            title="Data início"
          />

          <input
            type="date"
            value={filtros.dataFim || ""}
            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value || null })}
            className={selectClass}
            title="Data fim"
          />

          <button
            onClick={limparFiltros}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Valor Total</p>
          <p className="text-2xl font-bold text-white">{formatarMoeda(kpis.valorTotal)}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Quantidade Total</p>
          <p className="text-2xl font-bold text-white">{kpis.quantidadeTotal}</p>
          <p className="text-xs text-slate-500 mt-1">
            {kpis.identificados} identificados · {kpis.naoIdentificados} pendentes
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Maior Operação (Valor)</p>
          <p className="text-lg font-bold text-white truncate">{kpis.operacaoMaiorValor}</p>
          <p className="text-sm text-[#F58220]">{formatarMoeda(kpis.valorOperacaoMaior)}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Maior Operação (Qtd)</p>
          <p className="text-lg font-bold text-white truncate">{kpis.operacaoMaiorQtd}</p>
          <p className="text-sm text-[#F58220]">{kpis.qtdOperacaoMaior} time sheets</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-base font-semibold text-white mb-4">Valor por Operação</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoValor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip
                  formatter={(v) => formatarMoeda(Number(v))}
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#F58220" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-base font-semibold text-white mb-4">Qtd por Operação</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGraficoQtd}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={75}
                  dataKey="value"
                >
                  {dadosGraficoQtd.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-base font-semibold text-white mb-4">Valor por Diretoria</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoDiretoria} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip
                  formatter={(v) => formatarMoeda(Number(v))}
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            Registros Detalhados ({itensFiltrados.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr>
                {["Nº Addvalora", "Segurado", "Regulador", "Diretoria", "Equipe", "Operação", "Tempo", "Valor", "Data"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {itensFiltrados.map((item, index) => (
                <tr key={`${item.numeroAddvalora}-${index}`} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-3 text-white font-medium">{item.numeroAddvalora}</td>
                  <td className="px-3 py-3 text-slate-300 max-w-[180px] truncate">{item.segurado}</td>
                  <td className="px-3 py-3 text-slate-300">{item.regulador || "-"}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${item.diretoria === "Não identificada" ? "bg-slate-700 text-slate-400" : "bg-slate-600 text-white"}`}>
                      {item.diretoria}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{item.equipe || "-"}</td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                      {item.operacao}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{item.tempoMinutos} min</td>
                  <td className="px-3 py-3 text-[#F58220] font-medium whitespace-nowrap">{formatarMoeda(item.valor)}</td>
                  <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                    {item.dataTimeSheet
                      ? new Date(item.dataTimeSheet + "T12:00:00").toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
