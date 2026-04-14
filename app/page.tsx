import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0a1628" }}>
      <Header />

      <DashboardClient />

      <footer
        className="px-10 py-4 text-center text-xs text-slate-700"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        Addvalora · Dashboard de Acionamentos · Dados de demonstração · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
