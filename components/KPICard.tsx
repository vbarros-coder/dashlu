type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: React.ReactNode;
  highlight?: boolean;
};

export default function KPICard({ title, value, subtitle, trend, icon, highlight = false }: Props) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: highlight
          ? "linear-gradient(135deg, rgba(245,130,32,0.15) 0%, rgba(30,58,95,0.8) 100%)"
          : "rgba(15,42,68,0.7)",
        border: highlight ? "1px solid rgba(245,130,32,0.5)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: highlight
          ? "0 0 24px rgba(245,130,32,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide uppercase text-slate-400">{title}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
          style={{
            background: highlight ? "rgba(245,130,32,0.2)" : "rgba(255,255,255,0.06)",
            color: highlight ? "#F58220" : "#94a3b8",
          }}
        >
          {icon}
        </span>
      </div>

      <div>
        <p
          className="text-2xl font-bold tracking-tight leading-tight"
          style={{ color: highlight ? "#F58220" : "#ffffff" }}
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-auto">
          {trend >= 0 ? (
            <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l8 8H4l8-8z" />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20l-8-8h16l-8 8z" />
            </svg>
          )}
          <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? "+" : ""}{trend}% vs. mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
