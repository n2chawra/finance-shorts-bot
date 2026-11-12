import { useId } from "react";

/** Paisa Panchayat mark: three rising coin stacks in a marigold squircle. Pure SVG, scales with `className`. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  // a unique gradient id per mark: with a shared id, a mark inside a hidden panel would blank the others
  const id = `pp-g-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fcc964" />
          <stop offset="1" stopColor="#e8890c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect x="7" y="17.5" width="4.5" height="7.5" rx="1.6" fill="#1c1203" opacity="0.55" />
      <rect x="13.75" y="12.5" width="4.5" height="12.5" rx="1.6" fill="#1c1203" opacity="0.78" />
      <rect x="20.5" y="7" width="4.5" height="18" rx="1.6" fill="#1c1203" />
    </svg>
  );
}

export function Wordmark({ sub = "Studio", tone = "ink" }: { sub?: string; tone?: "ink" | "rail" }) {
  return (
    <span className="min-w-0 leading-tight">
      <span className={`block truncate font-display text-[15px] font-semibold tracking-[-0.02em] ${tone === "rail" ? "text-rail-ink" : "text-ink"}`}>Paisa Panchayat</span>
      <span className={`block truncate text-[11px] ${tone === "rail" ? "text-rail-ink2" : "text-muted"}`}>{sub}</span>
    </span>
  );
}
