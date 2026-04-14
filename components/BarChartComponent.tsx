"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type SeguradoraItem = {
  nome: string;
  acionamentos: number;
};

type Props = {
  data: SeguradoraItem[];
  selectedSeguradora?: string | null;
  onSelect?: (nome: string | null) => void;
};

const COLOR_DEFAULT = "#1E3A5F";
const COLOR_SELECTED = "#F58220";
const COLOR_DIM = "rgba(30,58,95,0.4)";

export default function BarChartComponent({ data, selectedSeguradora, onSelect }: Props) {
  function getColor(nome: string) {
    if (!selectedSeguradora) return COLOR_DEFAULT;
    if (nome === selectedSeguradora) return COLOR_SELECTED;
    return COLOR_DIM;
  }

  function handleClick(payload: { nome?: string } | null) {
    if (!onSelect || !payload?.nome) return;
    onSelect(selectedSeguradora === payload.nome ? null : payload.nome);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          onClick={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ev = e as any;
            const payload = ev?.activePayload?.[0]?.payload as { nome?: string } | undefined;
            handleClick(payload ?? null);
          }}
          style={{ cursor: onSelect ? "pointer" : "default" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="nome"
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(245,130,32,0.06)" }}
            contentStyle={{
              background: "#0F2A44",
              border: "1px solid rgba(245,130,32,0.3)",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: 12,
            }}
            itemStyle={{ color: "#f1f5f9" }}
            labelStyle={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 4 }}
            formatter={(value) => [Number(value ?? 0).toLocaleString("pt-BR"), "Acionamentos"]}
          />
          <Bar dataKey="acionamentos" radius={[4, 4, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.nome)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
