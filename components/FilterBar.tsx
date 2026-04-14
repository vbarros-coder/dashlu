"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  seguradoras: string[];
  unidades: string[];
  areas: string[];
  diretorias: string[];
  anos: string[];
  meses: string[];
  selectedSeguradora: string;
  selectedUnidade: string;
  selectedArea: string;
  selectedDiretoria: string;
  selectedAno: string;
  selectedMes: string;
  onSeguradoraChange: (v: string) => void;
  onUnidadeChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onDiretoriaChange: (v: string) => void;
  onAnoChange: (v: string) => void;
  onMesChange: (v: string) => void;
  onClear: () => void;
};

const sel: CSSProperties = {
  background: "rgba(15,42,68,0.85)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#e2e8f0",
  borderRadius: "8px",
  padding: "8px 32px 8px 12px",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  minWidth: "160px",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="pl-0.5 text-[10px] uppercase tracking-widest text-slate-600">
        {label}
      </span>
      {children}
    </div>
  );
}

function sanitize(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((v) => String(v ?? "").trim())
        .filter(Boolean)
        .filter((v) => v.toLowerCase() !== "todos")
        .filter((v) => v.toLowerCase() !== "todas")
    )
  );
}

export default function FilterBar({
  seguradoras,
  unidades,
  areas,
  diretorias,
  anos,
  meses,
  selectedSeguradora,
  selectedUnidade,
  selectedArea,
  selectedDiretoria,
  selectedAno,
  selectedMes,
  onSeguradoraChange,
  onUnidadeChange,
  onAreaChange,
  onDiretoriaChange,
  onAnoChange,
  onMesChange,
  onClear,
}: Props) {
  const uniqueAnos = sanitize(anos);
  const uniqueMeses = sanitize(meses);
  const uniqueSeguradoras = sanitize(seguradoras);
  const uniqueUnidades = sanitize(unidades);
  const uniqueAreas = sanitize(areas);
  const uniqueDiretorias = sanitize(diretorias);

  const showArea = uniqueAreas.length > 0;
  const showDiretoria = uniqueDiretorias.length > 0;

  const hasFilters =
    !!selectedSeguradora ||
    !!selectedUnidade ||
    !!selectedArea ||
    !!selectedDiretoria ||
    !!selectedMes ||
    !selectedAno;

  return (
    <div
      className="mb-8 rounded-xl px-5 py-4"
      style={{
        background: "rgba(15,42,68,0.5)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 pb-[9px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5 text-slate-500"
          >
            <path
              fillRule="evenodd"
              d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.5.75a3 3 0 0 1-4.342-2.684V15.86a1.5 1.5 0 0 0-.44-1.061L2.879 8.617A3 3 0 0 1 2 6.496V5.452a1.857 1.857 0 0 1 1.792-1.514Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Filtros
          </span>
        </div>

        <Field label="Ano">
          <select
            value={selectedAno}
            onChange={(e) => onAnoChange(e.target.value)}
            style={sel}
          >
            <option value="">Todos</option>
            {uniqueAnos.map((a, i) => (
              <option key={`${a}-${i}`} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mês">
          <select
            value={selectedMes}
            onChange={(e) => onMesChange(e.target.value)}
            style={sel}
          >
            <option value="">Todos</option>
            {uniqueMeses.map((m, i) => (
              <option key={`${m}-${i}`} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Seguradora">
          <select
            value={selectedSeguradora}
            onChange={(e) => onSeguradoraChange(e.target.value)}
            style={{ ...sel, minWidth: "190px" }}
          >
            <option value="">Todas</option>
            {uniqueSeguradoras.map((s, i) => (
              <option key={`${s}-${i}`} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Unidade">
          <select
            value={selectedUnidade}
            onChange={(e) => onUnidadeChange(e.target.value)}
            style={sel}
          >
            <option value="">Todas</option>
            {uniqueUnidades.map((u, i) => (
              <option key={`${u}-${i}`} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>

        {showArea && (
          <Field label="Área">
            <select
              value={selectedArea}
              onChange={(e) => onAreaChange(e.target.value)}
              style={sel}
            >
              <option value="">Todas</option>
              {uniqueAreas.map((a, i) => (
                <option key={`${a}-${i}`} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        )}

        {showDiretoria && (
          <Field label="Diretoria">
            <select
              value={selectedDiretoria}
              onChange={(e) => onDiretoriaChange(e.target.value)}
              style={sel}
            >
              <option value="">Todas</option>
              {uniqueDiretorias.map((d, i) => (
                <option key={`${d}-${i}`} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        )}

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-lg px-3 py-[9px] text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              background: "rgba(245,130,32,0.1)",
              border: "1px solid rgba(245,130,32,0.3)",
              color: "#F58220",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}