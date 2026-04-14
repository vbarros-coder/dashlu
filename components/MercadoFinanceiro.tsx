"use client";

import { useEffect, useState, useRef } from "react";
import { MercadoFinanceiroItem, MercadoFinanceiroResponse } from "@/lib/types";

const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbw2TZmhPu2jJz1PgoosfZTcAqNupJR52_ioiTjcz1YBG2y_pkzzeL6Gg1Qu1GnA9WXk/exec";

// Cores sutis para status
function getStatusColor(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (normalized === "alta") return "#059669"; // verde mais suave
  if (normalized === "queda") return "#dc2626"; // vermelho mais suave
  return "#6b7280"; // cinza (estável)
}

function getStatusIcon(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (normalized === "alta") return "↑";
  if (normalized === "queda") return "↓";
  return "→";
}

// Hook para animação de contagem
function useCountUp(targetValue: string, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);

  useEffect(() => {
    if (targetValue === previousValue.current) return;

    const numericMatch = targetValue.match(/[\d.,]+/);
    if (!numericMatch) {
      setDisplayValue(targetValue);
      previousValue.current = targetValue;
      return;
    }

    const numericStr = numericMatch[0].replace(/\./g, "").replace(",", ".");
    const targetNum = parseFloat(numericStr);
    const startNum = parseFloat(previousValue.current.match(/[\d.,]+/)?.[0]?.replace(/\./g, "").replace(",", ".") || "0");

    if (isNaN(targetNum) || isNaN(startNum)) {
      setDisplayValue(targetValue);
      previousValue.current = targetValue;
      return;
    }

    const startTime = Date.now();
    const prefix = targetValue.substring(0, targetValue.indexOf(numericMatch[0]));
    const suffix = targetValue.substring(targetValue.indexOf(numericMatch[0]) + numericMatch[0].length);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startNum + (targetNum - startNum) * easeOut;

      const formatted = current.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

// Card individual com animações
function MercadoCard({ item, index }: { item: MercadoFinanceiroItem; index: number }) {
  const statusColor = getStatusColor(item.status);
  const statusIcon = getStatusIcon(item.status);
  const animatedPrice = useCountUp(item.precoFormatado, 600);

  return (
    <div
      className="mercado-card rounded-lg p-3 transition-all duration-300 ease-out"
      style={{
        background: "rgba(11, 37, 69, 0.6)",
        border: "1px solid rgba(255,255,255,0.05)",
        animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xs font-medium text-slate-300">{item.indice}</h3>
          <span className="text-[10px] text-slate-500">{item.ticker}</span>
        </div>
        <div
          className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium transition-colors duration-300"
          style={{
            background: `${statusColor}15`,
            color: statusColor,
          }}
        >
          {statusIcon}
        </div>
      </div>

      <div className="mb-1">
        <span className="text-base font-semibold text-slate-200 tabular-nums">
          {animatedPrice}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-medium transition-colors duration-300"
          style={{ color: statusColor }}
        >
          {item.variacaoFormatada}
        </span>
        <span className="text-[9px] text-slate-600">{item.ultimaNegociacao}</span>
      </div>

      <style jsx>{`
        .mercado-card {
          opacity: 0;
          transform: translateY(12px);
        }
        .mercado-card:hover {
          background: rgba(11, 37, 69, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Skeleton loader discreto
function SkeletonCard() {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(11, 37, 69, 0.4)",
        border: "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse mb-1" />
          <div className="h-2 w-10 bg-slate-700/30 rounded animate-pulse" />
        </div>
        <div className="w-5 h-5 bg-slate-700/30 rounded animate-pulse" />
      </div>
      <div className="h-5 w-20 bg-slate-700/50 rounded animate-pulse mb-1" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-12 bg-slate-700/30 rounded animate-pulse" />
        <div className="h-2 w-8 bg-slate-700/20 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function MercadoFinanceiro() {
  const [data, setData] = useState<MercadoFinanceiroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(false);

  async function fetchData(isBackground = false) {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch(ENDPOINT_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result: MercadoFinanceiroResponse = await response.json();

      if (!result.ok || !Array.isArray(result.items)) {
        throw new Error("Formato de resposta inválido");
      }

      // Atualização suave sem flicker
      setData((prev) => {
        if (prev.length === 0 || !mountedRef.current) {
          mountedRef.current = true;
          return result.items;
        }
        // Mantém os dados e atualiza suavemente
        return result.items;
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dados de mercado:", err);
      if (!mountedRef.current) {
        setError("Não foi possível carregar dados de mercado");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(true); // Background refresh
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="mt-8 pt-6 border-t border-white/5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-slate-600" />
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Mercado Financeiro
          </h2>
        </div>
        <p className="text-[10px] text-slate-600 mb-3">Principais Índices</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 pt-6 border-t border-white/5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-slate-600" />
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Mercado Financeiro
          </h2>
        </div>
        <p className="text-[10px] text-slate-600 mb-3">Principais Índices</p>
        <div className="rounded-lg p-4 text-center bg-slate-800/30 border border-white/5">
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 pt-6 border-t border-white/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 rounded-full bg-slate-600" />
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Mercado Financeiro
          </h2>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse" />
            <span className="text-[9px] text-slate-600">Atualizando...</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-600 mb-3">Principais Índices</p>

      {lastUpdated && (
        <p className="text-[9px] text-slate-700 mb-3">
          Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {data.map((item, index) => (
          <MercadoCard key={`${item.ticker}-${index}`} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
