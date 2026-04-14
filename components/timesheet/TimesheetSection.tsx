"use client";

import { useState, useEffect } from "react";
import { ParsedTimesheetData, TimeSheetItem } from "@/lib/timesheet-types";
import UploadArea from "./UploadArea";
import TimesheetDashboard from "./TimesheetDashboard";

type SavedTimeSheet = {
  id: string;
  filename: string;
  importedAt: string;
  totalItems: number;
  totalValor: number;
  _count?: { items: number };
};

export default function TimesheetSection() {
  const [data, setData] = useState<ParsedTimesheetData | null>(null);
  const [savedTimeSheets, setSavedTimeSheets] = useState<SavedTimeSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadSavedTimeSheets();
  }, []);

  const loadSavedTimeSheets = async () => {
    try {
      const res = await fetch("/api/timesheet/save");
      const json = await res.json();
      if (json.success) {
        setSavedTimeSheets(json.data);
      }
    } catch (err) {
      console.error("Erro ao carregar time sheets:", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setCurrentFile(file);

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

  const handleSaveToDatabase = async () => {
    if (!data || !currentFile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        filename: currentFile.name,
        fileSize: currentFile.size,
        totalItems: data.itensDetalhados.length,
        totalValor: data.totalGeral.valorTotal,
        items: data.itensDetalhados.map((item: TimeSheetItem) => ({
          ...item,
          dataTimeSheet: new Date(item.dataTimeSheet).toISOString(),
        })),
        resumos: data.resumoPorOperacao,
      };

      const res = await fetch("/api/timesheet/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Falha ao salvar");
      }

      setSuccess(`Time sheet salvo com sucesso! ID: ${json.data.id.slice(0, 8)}`);
      await loadSavedTimeSheets();
    } catch (err) {
      console.error("[Save] Erro:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao salvar no banco de dados"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setData(null);
    setError(null);
    setSuccess(null);
    setCurrentFile(null);
  };

  const handleLoadSaved = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/timesheet/${id}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Falha ao carregar");
      }

      const saved = json.data;
      const convertedData: ParsedTimesheetData = {
        resumoPorOperacao: saved.resumos.map((r: any) => ({
          operacao: r.operacao,
          quantidadeTimeSheets: r.quantidade,
          valorTotal: r.valorTotal,
        })),
        itensDetalhados: saved.items.map((item: any) => ({
          numeroAddvalora: item.numeroAddvalora,
          segurado: item.segurado,
          regulador: item.regulador,
          tempoMinutos: item.tempoMinutos,
          valor: item.valor,
          dataTimeSheet: item.dataTimeSheet,
          operacao: item.operacao,
          diretoria: item.diretoria,
          equipe: item.equipe,
          coordenador: item.coordenador,
        })),
        totalGeral: {
          quantidadeTotal: saved.totalItems,
          valorTotal: saved.totalValor,
        },
      };

      setData(convertedData);
      setCurrentFile(null);
    } catch (err) {
      console.error("[Load] Erro:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este time sheet?")) return;

    try {
      const res = await fetch(`/api/timesheet/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (json.success) {
        await loadSavedTimeSheets();
        setSuccess("Time sheet excluído com sucesso");
      }
    } catch (err) {
      console.error("[Delete] Erro:", err);
      setError("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-0.5 rounded-full" style={{ background: "#F58220" }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Time Sheet
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-full bg-slate-800/50"
          >
            {showSaved ? "Ocultar" : "Ver"} Salvos ({savedTimeSheets.length})
          </button>
          
          {data && (
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Novo
            </button>
          )}
        </div>
      </div>

      {/* Lista de salvos */}
      {showSaved && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Time Sheets Salvos</h3>
          {savedTimeSheets.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum time sheet salvo ainda.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedTimeSheets.map((ts) => (
                <div
                  key={ts.id}
                  onClick={() => handleLoadSaved(ts.id)}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{ts.filename}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(ts.importedAt).toLocaleDateString("pt-BR")} • {ts._count?.items || ts.totalItems} itens • R$ {ts.totalValor?.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSaved(ts.id, e)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload / Visualização */}
      {!data ? (
        <div className="space-y-4">
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm">
                Faça upload do PDF exportado do Baruc para visualizar os dados de time sheet
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
        <div className="space-y-4">
          {/* Botão salvar */}
          {currentFile && (
            <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
              <div>
                <p className="text-sm text-slate-300">Arquivo: {currentFile.name}</p>
                <p className="text-xs text-slate-500">
                  {data.itensDetalhados.length} itens • R$ {data.totalGeral.valorTotal.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Salvar no Banco
                  </>
                )}
              </button>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-400 text-sm text-center">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <TimesheetDashboard data={data} />
        </div>
      )}
    </div>
  );
}
