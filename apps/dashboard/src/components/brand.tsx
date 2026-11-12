import { useId } from "react";

/** Paisa Panchayat mark: three rising bars in a blue-to-violet tile. Scales with `className`. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  // a unique gradient id per mark: with a shared id, a mark inside a hidden panel blanks the others
  const id = `pp-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f75ff" />
          <stop offset="1" stopColor="#7c5cf5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <rect x="8" y="17" width="4" height="7" rx="1.5" fill="#fff" opacity="0.6" />
      <rect x="14" y="12.5" width="4" height="11.5" rx="1.5" fill="#fff" opacity="0.8" />
      <rect x="20" y="8" width="4" height="16" rx="1.5" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ sub = "Studio", tone = "ink" }: { sub?: string; tone?: "ink" | "light" }) {
  return (
    <span className="min-w-0 leading-tight">
      <span className={`block truncate text-[14px] font-semibold tracking-[-0.01em] ${tone === "light" ? "text-white" : "text-ink"}`}>Paisa Panchayat</span>
      <span className={`block truncate text-[11.5px] ${tone === "light" ? "text-white/60" : "text-muted"}`}>{sub}</span>
    </span>
  );
}
