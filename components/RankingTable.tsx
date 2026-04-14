"use client";

type SeguradoraItem = {
  id: string;
  nome: string;
  acionamentos: number;
  variacao: number;
  unidade: string;
  area: string;
  diretoria: string;
  coordenador: string;
};

type Props = {
  data: SeguradoraItem[];
  selectedSeguradora?: string | null;
  onSelect?: (nome: string | null) => void;
};

export default function RankingTable({
  data,
  selectedSeguradora = null,
  onSelect,
}: Props) {
  const total = data.reduce((acc, item) => acc + item.acionamentos, 0);

  function handleRowClick(nome: string) {
    if (!onSelect) return;
    onSelect(selectedSeguradora === nome ? null : nome);
  }

  function formatPercent(value: number) {
    return `${value.toFixed(1)}%`;
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "rgba(15,42,68,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                #
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Seguradora
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Unidade
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Área
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Diretoria
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Coordenador
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Acionamentos
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                % Total
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Participação
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Nenhuma seguradora encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const percentual = total ? (item.acionamentos / total) * 100 : 0;
                const isSelected = selectedSeguradora === item.nome;

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.nome)}
                    className="transition-colors"
                    style={{
                      cursor: onSelect ? "pointer" : "default",
                      background: isSelected
                        ? "rgba(245,130,32,0.08)"
                        : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
                          style={{
                            background: "rgba(96,165,250,0.12)",
                            color: "#93c5fd",
                          }}
                        >
                          {item.nome?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {item.nome}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{
                          background: "rgba(96,165,250,0.08)",
                          color: "#93c5fd",
                        }}
                      >
                        {item.unidade}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-400">
                      {item.area}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-400">
                      {item.diretoria}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-400 italic">
                      {item.coordenador}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-semibold text-white">
                      {item.acionamentos.toLocaleString("pt-BR")}
                    </td>

                    <td className="px-4 py-4 text-right text-sm text-slate-300">
                      {formatPercent(percentual)}
                    </td>

                    <td className="px-4 py-4">
                      <div
                        className="h-2 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(percentual, 100)}%`,
                            background: "linear-gradient(90deg, #60a5fa, #93c5fd)",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}