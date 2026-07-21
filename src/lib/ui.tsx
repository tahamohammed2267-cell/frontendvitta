import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { cn } from "./cn";
import { useStore } from "./store";
import { useCountUp, useInView } from "./motion";

// ── Card ────────────────────────────────────────────────────

export function Card({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-ink-200 bg-white", pad && "p-5", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">{title}</h3>
        {sub && <p className="mt-0.5 text-[12.5px] text-ink-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ── Badge / pills ───────────────────────────────────────────

const toneStyles: Record<string, string> = {
  blue: "bg-accent-50 text-accent-700 border-accent-100",
  green: "bg-pos-50 text-pos-700 border-pos-100",
  orange: "bg-warn-50 text-warn-700 border-warn-100",
  red: "bg-crit-50 text-crit-700 border-crit-100",
  gray: "bg-ink-50 text-ink-600 border-ink-200",
  dark: "bg-ink-900 text-white border-ink-900",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof toneStyles; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", toneStyles[tone], className)}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" | "low" | "blocking" | "important" | "nice-to-have" }) {
  const map: Record<string, { tone: keyof typeof toneStyles; label: string }> = {
    critical: { tone: "red", label: "Critical" },
    high: { tone: "orange", label: "High" },
    medium: { tone: "orange", label: "Medium" },
    low: { tone: "gray", label: "Low" },
    blocking: { tone: "red", label: "Blocking" },
    important: { tone: "orange", label: "Important" },
    "nice-to-have": { tone: "gray", label: "Nice to have" },
  };
  const m = map[severity];
  return (
    <Badge tone={m.tone}>
      <span className={cn("h-1.5 w-1.5 rounded-full", severity === "critical" || severity === "blocking" ? "bg-crit-600" : severity === "low" || severity === "nice-to-have" ? "bg-ink-400" : "bg-warn-600")} />
      {m.label}
    </Badge>
  );
}

// ── Confidence ──────────────────────────────────────────────

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? "bg-pos-600" : pct >= 75 ? "bg-accent-600" : pct >= 50 ? "bg-warn-600" : "bg-crit-600";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="num text-[11px] font-medium text-ink-600">{pct}%</span>
    </div>
  );
}

// ── Status dot ──────────────────────────────────────────────

export function StatusDot({ tone }: { tone: "green" | "orange" | "red" | "blue" | "gray" }) {
  const colors = { green: "bg-pos-600", orange: "bg-warn-600", red: "bg-crit-600", blue: "bg-accent-600", gray: "bg-ink-400" };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[tone])} />;
}

// ── Buttons ─────────────────────────────────────────────────

export function Button({
  children, variant = "primary", className, onClick, disabled,
}: { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string; onClick?: () => void; disabled?: boolean }) {
  const styles = {
    primary: "bg-accent-600 text-white hover:bg-accent-700",
    secondary: "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50",
    ghost: "text-ink-600 hover:bg-ink-100",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40", styles[variant], className)}
    >
      {children}
    </button>
  );
}

// ── Sparkline ───────────────────────────────────────────────
// Compact trend line with a soft gradient fill. Draws in left→right
// when it enters the viewport (unless the tile already handles that).

const trendStroke = { up: "#0e5f45", down: "#dc2626", flat: "#8a93a6" } as const;

export function Sparkline({
  data, trend = "flat", width = 96, height = 32, animate = true, className, color, stretch = false,
}: { data: number[]; trend?: "up" | "down" | "flat"; width?: number; height?: number; animate?: boolean; className?: string; color?: string; stretch?: boolean }) {
  const gid = useId().replace(/:/g, "");
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 3;
  const y = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / span);
  const pts = data.map((v, i) => [i * stepX, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${yy.toFixed(1)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const stroke = color ?? trendStroke[trend];
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={stretch ? "100%" : width}
      height={stretch ? "100%" : height}
      className={cn(animate && "spark-draw", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2} fill={stroke} />
    </svg>
  );
}

// ── KPI stat ────────────────────────────────────────────────
// Premium metric tile: count-up value, a delta chip, and an inline
// sparkline that packs six months of trend into the same footprint.
// Every field beyond `label`/`value` is optional, so existing call
// sites keep working untouched.

export function Stat({
  label, value, sub, trend, series, delta,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
  series?: number[];
  delta?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const shown = useCountUp(value, inView);
  const tone = trend === "up" ? "text-pos-700" : trend === "down" ? "text-crit-700" : "text-ink-500";

  return (
    <div ref={ref}>
      <p className="text-[12px] font-medium text-ink-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="num text-[26px] font-semibold leading-none tracking-tight text-ink-900">{shown}</p>
        {series && series.length > 1 && inView && (
          <Sparkline data={series} trend={trend} className="mb-0.5 shrink-0" />
        )}
      </div>
      {(delta || sub) && (
        <div className={cn("mt-1.5 flex items-center gap-1 text-[12px]", tone)}>
          {delta && trend && trend !== "flat" && (
            trend === "up" ? <ArrowUpRight size={13} className="shrink-0" /> : <ArrowDownRight size={13} className="shrink-0" />
          )}
          {delta && <span className="num font-medium">{delta}</span>}
          {delta && sub && <span className="text-ink-300">·</span>}
          {sub && <span className={delta ? "text-ink-500" : undefined}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ── Section label ───────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">{children}</p>;
}

// ── Empty state ─────────────────────────────────────────────

export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-ink-100 text-ink-400">{icon}</div>
      <p className="text-[14px] font-medium text-ink-800">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-[12.5px] text-ink-500">{sub}</p>}
    </div>
  );
}

// ── Source citation chip ────────────────────────────────────

export function SourceChip({
  doc, page, field, value, confidence, snippet,
}: {
  doc: string;
  page: number;
  field?: string;
  value?: string;
  confidence?: number;
  snippet?: string;
}) {
  const openSourceDrawer = useStore((s) => s.openSourceDrawer);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openSourceDrawer({ doc, page, field, value, confidence, snippet });
      }}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] text-ink-600 transition-colors hover:border-accent-500 hover:text-accent-700"
    >
      <span className="truncate font-medium">{doc}</span>
      {page > 0 && <span className="num shrink-0 text-ink-400">p.{page}</span>}
    </button>
  );
}

// ── Modal / Drawer ──────────────────────────────────────────

export function Modal({
  open, onClose, title, sub, children, width = "560px",
}: { open: boolean; onClose: () => void; title: string; sub?: string; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-6 fade-up" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg border border-ink-200 bg-white shadow-[0_20px_60px_rgba(11,14,20,0.25)]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">{title}</h3>
            {sub && <p className="mt-0.5 text-[12.5px] text-ink-500">{sub}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><X size={16} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function Drawer({
  open, onClose, title, sub, children, width = "440px",
}: { open: boolean; onClose: () => void; title: string; sub?: string; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40" onClick={onClose}>
      <div
        className="fade-up flex h-full flex-col overflow-hidden border-l border-ink-200 bg-white shadow-[0_0_40px_rgba(11,14,20,0.15)]"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">{title}</h3>
            {sub && <p className="mt-0.5 text-[12.5px] text-ink-500">{sub}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><X size={16} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── Gauge ───────────────────────────────────────────────────

export function Gauge({ value, max = 100, target, label, unit = "%" }: { value: number; max?: number; target?: number; label?: string; unit?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 42;
  const circumference = Math.PI * r; // semicircle
  const offset = circumference * (1 - pct);
  const color = pct >= 0.9 ? "#059669" : pct >= 0.7 ? "#0e5f45" : pct >= 0.5 ? "#d97706" : "#dc2626";
  const targetPct = target !== undefined ? Math.max(0, Math.min(1, target / max)) : undefined;
  const targetAngle = targetPct !== undefined ? Math.PI * (1 - targetPct) : undefined;
  const targetX = targetAngle !== undefined ? 50 + r * Math.cos(targetAngle) : undefined;
  const targetY = targetAngle !== undefined ? 50 - r * Math.sin(targetAngle) : undefined;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 58" className="w-full max-w-[160px]">
        <path d={`M 8 50 A ${r} ${r} 0 0 1 92 50`} fill="none" stroke="#eceef3" strokeWidth={8} strokeLinecap="round" />
        <path
          d={`M 8 50 A ${r} ${r} 0 0 1 92 50`}
          fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .4s ease" }}
        />
        {targetX !== undefined && targetY !== undefined && (
          <line x1={targetX} y1={targetY - 5} x2={targetX} y2={targetY + 5} stroke="#12161f" strokeWidth={2} />
        )}
      </svg>
      <p className="num -mt-2 text-[20px] font-semibold tracking-tight text-ink-900">{value}{unit}</p>
      {label && <p className="mt-0.5 text-[11px] text-ink-500">{label}</p>}
    </div>
  );
}
