"use client";

import { useState } from "react";
import { ParsedTimesheetData } from "@/lib/timesheet-types";
import UploadArea from "./UploadArea";
import TimesheetDashboard from "./TimesheetDashboard";

export default function TimesheetSection() {
  const [data, setData] = useState<ParsedTimesheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    console.log("[TimesheetSection] Enviando para API:", file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/timesheet/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(json.error || `Erro HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Falha ao processar o PDF");
      }

      const parsedData: ParsedTimesheetData = json.data;

      console.log("[TimesheetSection] Dados recebidos:", {
        resumoCount: parsedData.resumoPorOperacao.length,
        itensCount: parsedData.itensDetalhados.length,
      });

      if (
        parsedData.itensDetalhados.length === 0 &&
        parsedData.resumoPorOperacao.length === 0
      ) {
        setError(
          "Não foi possível extrair dados do PDF. Verifique se o arquivo é um time sheet do Baruc válido."
        );
        setData(null);
      } else {
        setData(parsedData);
      }
    } catch (err) {
      console.error("[TimesheetSection] Erro:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao processar o PDF. Tente novamente."
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-0.5 rounded-full" style={{ background: "#F58220" }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Time Sheet
          </h2>
        </div>

        {data && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Novo upload
          </button>
        )}
      </div>

      {!data ? (
        <div className="space-y-4">
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm">
                Faça upload do PDF exportado do Baruc para visualizar os dados de
                time sheet
              </p>
            </div>

            <UploadArea onFileUpload={handleFileUpload} isLoading={isLoading} />

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <TimesheetDashboard data={data} />
      )}
    </div>
  );
}
