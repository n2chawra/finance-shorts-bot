/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, Search, Sparkles, ThumbsDown, ThumbsUp, Minus, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Sparkline } from "@/components/charts";
import { Delta, Num } from "@/components/ui";
import { fmtCompact, fmtDate, fmtNum, fmtRelative } from "@/lib/format";
import type { AiChannel, AiVideo, ContentRow } from "@/lib/studio-schema";

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------- tabs ----------------

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; icon: LucideIcon }[] }) {
  return (
    <div role="tablist" className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-ring px-4 md:mx-0 md:px-0">
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={on} type="button" onClick={() => onChange(t.value)}
            className={`relative flex shrink-0 items-center gap-1.5 px-3 pb-2.5 pt-1.5 text-[13px] font-medium transition-colors ${on ? "text-ink" : "text-muted hover:text-ink2"}`}>
            <t.icon aria-hidden className={`size-4 ${on ? "text-brand" : ""}`} />{t.label}
            {on && <motion.span layoutId="studio-tab" className="absolute inset-x-1 -bottom-px h-[2px] rounded-full brand-gradient" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- hero ----------------

export function HeroStat({ label, value, fmt, delta, upIsGood = true, spark, sub, live, icon: Icon, accent = "var(--c1)" }: {
  label: string; value: number | null; fmt: (n: number) => string; delta?: number | null; upIsGood?: boolean; spark?: number[]; sub?: React.ReactNode; live?: boolean; icon?: LucideIcon; accent?: string;
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.35, ease: EASE }}
      className="hero-glow relative min-w-0 overflow-hidden rounded-2xl border border-ring bg-surface p-4 shadow-card md:p-5">
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-60"><Sparkline values={spark} height={40} color={accent} /></div>
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink2">
            {live ? <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-good" /></span>
              : Icon && <Icon aria-hidden className="size-3.5 text-muted" />}
            {label}
          </span>
          {delta !== undefined && <Delta value={delta} upIsGood={upIsGood} />}
        </div>
        <div className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] md:text-[34px]">
          {value === null ? <span className="text-muted">—</span> : <Num value={value} fmt={fmt} />}
        </div>
        {sub && <div className="mt-2 text-xs text-muted">{sub}</div>}
        <div className="h-10" />
      </div>
    </motion.div>
  );
}

/** A small number row under the hero: label, value, change. */
export function MiniStat({ label, value, delta, upIsGood = true, hint }: { label: string; value: React.ReactNode; delta?: number | null; upIsGood?: boolean; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-ring bg-surface px-3.5 py-3 shadow-card" title={hint}>
      <div className="truncate text-xs text-muted">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-lg font-semibold tabular-nums tracking-tight">{value}</span>
        {delta !== undefined && <Delta value={delta ?? null} upIsGood={upIsGood} />}
      </div>
    </div>
  );
}

// ---------------- AI ----------------

const VERDICT = {
  hit: { label: "Hit", icon: ThumbsUp, cls: "bg-good-soft text-good-text ring-good/30" },
  okay: { label: "Okay", icon: Minus, cls: "bg-warning-soft text-warning-text ring-warning/30" },
  miss: { label: "Miss", icon: ThumbsDown, cls: "bg-critical-soft text-critical-text ring-critical/30" },
} as const;

export function VerdictBadge({ verdict, size = "sm" }: { verdict: "hit" | "okay" | "miss"; size?: "sm" | "lg" }) {
  const v = VERDICT[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset ${v.cls} ${size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]"}`}>
      <v.icon aria-hidden className={size === "lg" ? "size-4" : "size-3"} />{v.label}
    </span>
  );
}

export function AiTag({ at }: { at?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-text">
      <Sparkles aria-hidden className="size-3" />AI analysis{at ? <span className="font-normal opacity-80"> · {fmtRelative(at)}</span> : null}
    </span>
  );
}

type Ev = { text: string; tab: string | null };
function EvidenceList({ items, onJump, tone }: { items: Ev[]; onJump?: (tab: string) => void; tone: "good" | "critical" | "info" }) {
  const dot = tone === "good" ? "bg-good" : tone === "critical" ? "bg-critical" : "bg-series";
  return (
    <ul className="space-y-2">
      {items.map((e, i) => (
        <li key={i} className="flex gap-2 text-[13px] leading-snug text-ink">
          <span aria-hidden className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
          <span className="min-w-0">
            {e.text}
            {e.tab && onJump && <button type="button" onClick={() => onJump(e.tab!)} className="ml-1.5 rounded-md bg-wash-2 px-1.5 py-0.5 text-[11px] font-medium text-ink2 hover:bg-brand-soft hover:text-brand-text">see chart →</button>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The auditor's channel analysis: headline, what works, what doesn't, audience, three moves. */
export function AiChannelCard({ ai, onJump, compact }: { ai: AiChannel | null; onJump?: (tab: string) => void; compact?: boolean }) {
  if (!ai) {
    return (
      <div className="rounded-2xl border border-dashed border-ring-strong p-5 text-sm text-ink2">
        <AiTag /> <p className="mt-2">The first AI analysis is written by the nightly auditor once the deep stats have run. It reads every number on this page and the comments, then says what to change.</p>
      </div>
    );
  }
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-brand/25 bg-surface p-5 shadow-card">
      <div aria-hidden className="absolute inset-y-0 left-0 w-1 brand-gradient" />
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="relative">
        <AiTag at={ai.writtenAt} />
        <h3 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight md:text-lg">{ai.headline}</h3>
        <div className={`mt-4 grid gap-5 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-good-text">Working</h4><EvidenceList items={ai.working} onJump={onJump} tone="good" /></div>
          <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-critical-text">Not working</h4><EvidenceList items={ai.notWorking} onJump={onJump} tone="critical" /></div>
          {!compact && <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-info-text">Audience</h4><EvidenceList items={ai.audience} onJump={onJump} tone="info" /></div>}
        </div>
        {ai.recommendations.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Do next</h4>
            <ol className="grid gap-2.5 md:grid-cols-3">
              {ai.recommendations.map((r, i) => (
                <li key={i} className="rounded-xl bg-wash p-3">
                  <div className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full brand-gradient text-[11px] font-bold text-white">{i + 1}</span><span className="text-[13px] font-medium leading-snug">{r.do}</span></div>
                  <p className="mt-1.5 pl-7 text-xs text-muted">{r.because}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/** One video's verdict: badge, headline, why (with numbers), what viewers said, what to change. */
export function AiVideoCard({ ai, title, thumbnailUrl, href }: { ai: AiVideo; title?: string; thumbnailUrl?: string; href?: string }) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-16 w-9 shrink-0 rounded-md object-cover ring-1 ring-ring" loading="lazy" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><VerdictBadge verdict={ai.verdict} /><AiTag at={ai.writtenAt} /></div>
          {title && <div className="mt-1 truncate text-xs text-muted">{title}</div>}
          <p className="mt-1 text-[14px] font-semibold leading-snug">{ai.headline}</p>
        </div>
      </div>
      {ai.why.length > 0 && <div className="mt-3"><EvidenceList items={ai.why} tone={ai.verdict === "miss" ? "critical" : ai.verdict === "hit" ? "good" : "info"} /></div>}
      {ai.viewersSaid.length > 0 && (
        <div className="mt-3 rounded-lg bg-wash p-2.5 text-xs text-ink2"><span className="font-semibold text-ink">Viewers said: </span>{ai.viewersSaid.join(" · ")}</div>
      )}
      {ai.next && <p className="mt-3 text-[13px]"><span className="font-semibold text-brand-text">Next time: </span>{ai.next}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-ring bg-surface p-4 shadow-card transition-colors";
  return href ? <Link href={href} className={`${cls} hover:border-brand/40`}>{body}</Link> : <div className={cls}>{body}</div>;
}

// ---------------- content table ----------------

/** Heat-tinted cell: green above the median of the column, red below. */
function Heat({ v, lo, mid, hi, children }: { v: number | null; lo: number; mid: number; hi: number; children: React.ReactNode }) {
  if (v === null) return <span className="text-muted">—</span>;
  const k = v >= mid ? Math.min(1, (v - mid) / Math.max(hi - mid, 1e-9)) : -Math.min(1, (mid - v) / Math.max(mid - lo, 1e-9));
  const bg = k >= 0 ? `color-mix(in oklab, var(--good) ${Math.round(k * 26)}%, transparent)` : `color-mix(in oklab, var(--critical) ${Math.round(-k * 22)}%, transparent)`;
  return <span className="inline-block min-w-12 rounded-md px-1.5 py-0.5 text-right tabular-nums" style={{ background: bg }}>{children}</span>;
}

type Col = { key: string; label: string; get: (r: ContentRow) => number | null; render: (r: ContentRow, s: Stats) => React.ReactNode; hint?: string };
type Stats = Record<string, { lo: number; mid: number; hi: number }>;

const pct = (x: number | null, d = 0) => (x === null ? "—" : `${(x * 100).toFixed(d)}%`);
const vs = (x: number | null) => {
  if (x === null) return null;
  const up = x >= 1;
  return <span className={`ml-1 inline-flex items-center text-[11px] font-semibold ${Math.abs(x - 1) < 0.1 ? "text-muted" : up ? "text-good-text" : "text-critical-text"}`}>{up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{x.toFixed(1)}×</span>;
};

const COLS: Col[] = [
  { key: "views", label: "Views", get: (r) => r.views, render: (r) => <span className="font-medium tabular-nums">{fmtNum(r.views)}</span> },
  { key: "views48", label: "48 h", hint: "Views in the first two days, against the median of its format", get: (r) => r.views48, render: (r) => <span className="tabular-nums">{r.views48 === null ? "—" : fmtCompact(r.views48)}{vs(r.vs48)}</span> },
  { key: "pct", label: "% viewed", get: (r) => r.avgViewPct, render: (r, s) => <Heat v={r.avgViewPct} {...s.pct!}>{r.avgViewPct === null ? "—" : `${r.avgViewPct.toFixed(0)}%`}</Heat> },
  { key: "hook", label: "Hook hold", hint: "Share still watching at 3 s (Shorts) or 30 s (long)", get: (r) => r.hookHold, render: (r, s) => <Heat v={r.hookHold} {...s.hook!}>{pct(r.hookHold)}</Heat> },
  { key: "engaged", label: "Engaged", hint: "Engaged views ÷ views: the closest the API gets to Studio's stayed-to-watch", get: (r) => r.engagedRatio, render: (r, s) => <Heat v={r.engagedRatio} {...s.engaged!}>{pct(r.engagedRatio)}</Heat> },
  { key: "ctr", label: "CTR", get: (r) => r.ctr, render: (r, s) => <Heat v={r.ctr} {...s.ctr!}>{pct(r.ctr, 1)}</Heat> },
  { key: "likes", label: "Likes", get: (r) => r.likes, render: (r) => <span className="tabular-nums">{fmtNum(r.likes)}</span> },
  { key: "shares", label: "Shares", get: (r) => r.shares, render: (r) => <span className="tabular-nums">{fmtNum(r.shares)}</span> },
  { key: "subs", label: "Subs", get: (r) => r.subsNet, render: (r) => <span className={`tabular-nums ${r.subsNet > 0 ? "text-good-text" : r.subsNet < 0 ? "text-critical-text" : ""}`}>{r.subsNet > 0 ? "+" : ""}{fmtNum(r.subsNet)}</span> },
];

export function ContentTable({ rows }: { rows: ContentRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "published", dir: -1 });
  const stats: Stats = useMemo(() => {
    const out: Stats = {};
    for (const c of COLS) {
      const xs = rows.map(c.get).filter((x): x is number => x !== null).sort((a, b) => a - b);
      out[c.key] = { lo: xs[0] ?? 0, mid: xs[Math.floor(xs.length / 2)] ?? 0, hi: xs.at(-1) ?? 1 };
    }
    return out;
  }, [rows]);
  const shown = useMemo(() => {
    const f = rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.videoId.includes(q));
    const col = COLS.find((c) => c.key === sort.key);
    return [...f].sort((a, b) => sort.dir * (col ? (col.get(a) ?? -Infinity) - (col.get(b) ?? -Infinity) : a.publishAt.localeCompare(b.publishAt)));
  }, [rows, q, sort]);
  const head = (key: string, label: string, hint?: string) => (
    <th key={key} className="whitespace-nowrap px-2 py-2.5 text-right font-medium first:text-left" title={hint}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }))} className={`inline-flex items-center gap-1 hover:text-ink ${sort.key === key ? "text-ink" : ""}`}>
        {label}{sort.key === key ? (sort.dir < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ChevronsUpDown className="size-3 opacity-40" />}
      </button>
    </th>
  );
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Search aria-hidden className="size-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${rows.length} videos`} className="h-7 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted" />
      </div>
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[920px] text-[13px]">
          <thead className="sticky top-0 z-10 bg-surface-2 text-xs text-muted">
            <tr>{head("published", "Video")}{COLS.map((c) => head(c.key, c.label, c.hint))}<th className="px-2 py-2.5 text-right font-medium">First 7 days</th></tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <motion.tr key={r.videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.4) }} className="border-b border-line last:border-0 hover:bg-wash">
                <td className="px-2 py-2 pl-4">
                  <Link href={`/videos/${r.videoId}`} className="flex min-w-[240px] items-center gap-2.5">
                    <img src={r.thumbnailUrl} alt="" loading="lazy" className={`shrink-0 rounded-md object-cover ring-1 ring-ring ${r.format === "long" ? "h-9 w-16" : "h-12 w-7"}`} />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium text-ink hover:underline">{r.title}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">{fmtDate(r.publishAt)} · {r.format === "long" ? "Long" : "Short"}{r.verdict && <VerdictBadge verdict={r.verdict} />}</span>
                    </span>
                  </Link>
                </td>
                {COLS.map((c) => <td key={c.key} className="px-2 py-2 text-right">{c.render(r, stats)}</td>)}
                <td className="w-28 px-2 py-2 pr-4"><Sparkline values={r.first7} height={26} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Placeholder while a part of the data hasn't arrived: says when it will. */
export function Waiting({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="dot-grid flex flex-col items-center justify-center rounded-xl border border-dashed border-ring px-6 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-surface shadow-card ring-1 ring-ring"><Icon aria-hidden className="size-5 text-muted" /></span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted">{children}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function StudioSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}

export { fmtDate };
