const IST = "Asia/Kolkata";

const dateTime = new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const dateOnly = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: IST });
const num = new Intl.NumberFormat("en-IN");

/** "13 Oct, 19:07" in IST. */
export const fmtDateTime = (iso: string) => dateTime.format(new Date(iso));
/** "Tue, 13 Oct" in IST. */
export const fmtDate = (iso: string) => dateOnly.format(new Date(iso));
/** "YYYY-MM-DD" in IST. */
export const istDay = (d: Date | string) => dayKey.format(typeof d === "string" ? new Date(d) : d);
/** "13 Oct" from a YYYY-MM-DD key. */
export const fmtDayKey = (day: string) => new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(`${day}T00:00:00Z`));
/** Indian grouping: 1,23,456. */
export const fmtNum = (n: number) => num.format(Math.round(n));

/** Short count: 950, 12.4K, 1.2 L. */
export function fmtCompact(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

export function fmtDuration(sec: number): string {
  const s = Math.round(sec);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
}

/** "in 3h 20m", "2d ago". */
export function fmtRelative(iso: string, now = Date.now()): string {
  const diff = Date.parse(iso) - now;
  const mins = Math.round(Math.abs(diff) / 60000);
  const text = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${Math.round(mins / 1440)}d`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}

export const titleCase = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
