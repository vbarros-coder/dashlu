"use client";

import { useState } from "react";
import UploadArea from "@/components/timesheet/UploadArea";
import TimesheetDashboard from "@/components/timesheet/TimesheetDashboard";
import { ParsedTimesheetData } from "@/lib/timesheet-types";

export default function TimeSheetPage() {
  const [data, setData] = useState<ParsedTimesheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Enviar para API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/timesheet/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao processar PDF");
      }

      const parsedData: ParsedTimesheetData = await response.json();

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
      console.error("Erro ao processar PDF:", err);
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

  return (
    <div className="min-h-screen bg-[#0a192f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f2a44]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F58220] to-[#e06b00] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Time Sheet</h1>
                  <p className="text-xs text-slate-400">
                    Upload e análise de time sheets do Baruc
                  </p>
                </div>
              </div>
            </div>

            <a
              href="/"
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="space-y-8">
            {/* Estado vazio / Upload */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Importar Time Sheet
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Faça upload do PDF exportado do Baruc para visualizar os dados de
                time sheet, incluindo resumo por operação, valores e tempo
                dedicado.
              </p>
            </div>

            <UploadArea
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />

            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium">Erro ao processar PDF</p>
                    <p className="text-red-300/80 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#F58220]/10 flex items-center justify-center mb-3">
                  <span className="text-[#F58220] font-bold">1</span>
                </div>
                <h3 className="text-white font-medium mb-1">Exporte do Baruc</h3>
                <p className="text-sm text-slate-400">
                  Gere o PDF de time sheet no sistema Baruc
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#F58220]/10 flex items-center justify-center mb-3">
                  <span className="text-[#F58220] font-bold">2</span>
                </div>
                <h3 className="text-white font-medium mb-1">Faça Upload</h3>
                <p className="text-sm text-slate-400">
                  Arraste ou clique para selecionar o arquivo
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-[#F58220]/10 flex items-center justify-center mb-3">
                  <span className="text-[#F58220] font-bold">3</span>
                </div>
                <h3 className="text-white font-medium mb-1">Visualize</h3>
                <p className="text-sm text-slate-400">
                  Analise os dados processados automaticamente
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Botão voltar / novo upload */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setData(null)}
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Fazer novo upload
              </button>

              <div className="text-sm text-slate-400">
                {data.totalGeral.quantidadeTotal} registros processados
              </div>
            </div>

            {/* Dashboard com dados */}
            <TimesheetDashboard data={data} />
          </div>
        )}
      </main>
    </div>
  );
}
