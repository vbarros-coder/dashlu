"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type EvolucaoMensalItem = {
  mes: string;
  totalGeral: number;
  [key: string]: string | number;
};

type Props = {
  data: EvolucaoMensalItem[];
  selectedSeguradora?: string | null;
  onSelectSeguradora?: (nome: string | null) => void;
};

export default function LineChartComponent({
  data,
  selectedSeguradora,
  onSelectSeguradora,
}: Props) {
  if (!data?.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Sem dados para exibir
      </div>
    );
  }

  const seguradorasDaSerie = Object.keys(data[0]).filter(
    (key) => key !== "mes" && key !== "totalGeral"
  );

  function getStrokeWidth(key: string) {
    if (!selectedSeguradora) return key === "totalGeral" ? 3 : 2;
    if (key === "totalGeral") return 1.5;
    return key === selectedSeguradora ? 3 : 1;
  }

  function getOpacity(key: string) {
    if (!selectedSeguradora) return 1;
    if (key === "totalGeral") return 0.35;
    return key === selectedSeguradora ? 1 : 0.2;
  }

  function handleLegendClick(dataKey: string) {
    if (!onSelectSeguradora) return;
    if (dataKey === "totalGeral") {
      onSelectSeguradora(null);
      return;
    }
    onSelectSeguradora(selectedSeguradora === dataKey ? null : dataKey);
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(15,42,68,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <h2 className="mb-1 text-sm font-semibold text-white">
        Evolução Mensal de Acionamentos
      </h2>
      <p className="mb-5 text-xs text-slate-500">
        {selectedSeguradora
          ? `Destaque: ${selectedSeguradora} · clique na legenda para desmarcar`
          : "Clique na legenda para destacar uma seguradora"}
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0F2A44",
              border: "1px solid rgba(245,130,32,0.3)",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: 12,
            }}
            formatter={(value, name) => [
              Number(value ?? 0).toLocaleString("pt-BR"),
              String(name),
            ]}
          />
          <Legend
            formatter={(value) => {
              return (
                <span
                  style={{
                    color:
                      value === "totalGeral"
                        ? "#cbd5e1"
                        : selectedSeguradora && value !== selectedSeguradora
                        ? "#64748b"
                        : "#cbd5e1",
                    cursor: "pointer",
                  }}
                  onClick={() => handleLegendClick(String(value))}
                >
                  {value === "totalGeral" ? "Total Geral" : String(value)}
                </span>
              );
            }}
          />

          <Line
            type="monotone"
            dataKey="totalGeral"
            name="totalGeral"
            strokeWidth={getStrokeWidth("totalGeral")}
            strokeOpacity={getOpacity("totalGeral")}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />

          {seguradorasDaSerie.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              strokeWidth={getStrokeWidth(key)}
              strokeOpacity={getOpacity(key)}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}