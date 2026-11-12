/** Paisa Panchayat mark: a lime block with a bold ₹ and a hard shadow. Scales with `className`. */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden className={`shrink-0 ${className}`}>
      <rect x="4" y="4" width="32" height="32" fill="var(--hard)" />
      <rect x="0" y="0" width="32" height="32" fill="var(--lime)" stroke="var(--edge)" strokeWidth="2.5" />
      <path d="M9 8.5h14M9 13.5h14M12 8.5c5.5 0 7.5 2.2 7.5 5s-2.3 5-7.5 5h-1.5l9 8" fill="none" stroke="#0b0b0b" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function Wordmark({ sub = "Control room", tone = "ink" }: { sub?: string; tone?: "ink" | "rail" }) {
  return (
    <span className="min-w-0 leading-none">
      <span className={`block truncate font-display text-[17px] uppercase tracking-tight ${tone === "rail" ? "text-[#f3eee1]" : "text-ink"}`}>Paisa Panchayat</span>
      <span className={`nb-label mt-1 block truncate !text-[10px] ${tone === "rail" ? "text-lime" : "text-muted"}`}>{sub}</span>
    </span>
  );
}
