"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const now = new Date();
  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header
      className="relative flex items-center justify-between px-8 py-5"
      style={{ background: "#0F2A44" }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #F58220 0%, #ffb347 60%, transparent 100%)" }}
      />

      <div className="flex items-center gap-5">
        <div className="flex-shrink-0">
          <Image
            src="/logo-addvalora.jpg"
            alt="Addvalora"
            width={148}
            height={42}
            priority
            className="object-contain"
          />
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            Dashboard de Acionamentos
          </h1>
          <p className="text-xs text-slate-400 capitalize mt-0.5">
            Monitoramento estrategico · <span className="normal-case">{formatted}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ao vivo
        </span>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-white/10 hover:ring-red-500/30 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}
