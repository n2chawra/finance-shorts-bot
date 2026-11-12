/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, Search, Sparkles, ThumbsDown, ThumbsUp, Minus, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Sparkline } from "@/components/charts";
import { type Accent, ACCENT, Delta, Num, tabClass } from "@/components/ui";
import { fmtCompact, fmtDate, fmtNum, fmtRelative } from "@/lib/format";
import type { AiChannel, AiVideo, ContentRow } from "@/lib/studio-schema";

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------- tabs ----------------

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; icon: LucideIcon }[] }) {
  return (
    <div role="tablist" aria-label="Analytics sections" className="no-scrollbar scroll-fade-x -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1.5 md:mx-0 md:px-0">
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} role="tab" aria-selected={on} type="button" onClick={() => onChange(t.value)} data-state={on ? "active" : "inactive"} className={tabClass}>
            <t.icon aria-hidden strokeWidth={2.5} className={`size-4 ${on ? "text-lime" : ""}`} />{t.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- hero ----------------

/** The old chart-colour accents map onto the flat fills. */
const FILL: Record<string, Accent> = { "var(--c1)": "sky", "var(--c3)": "mint", "var(--c7)": "grape", "var(--c6)": "lime", "var(--c2)": "tang", "var(--c4)": "sun", "var(--c5)": "pink" };

export function HeroStat({ label, value, fmt, delta, upIsGood = true, spark, sub, live, icon: Icon, accent = "var(--c1)" }: {
  label: string; value: number | null; fmt: (n: number) => string; delta?: number | null; upIsGood?: boolean; spark?: number[]; sub?: React.ReactNode; live?: boolean; icon?: LucideIcon; accent?: string;
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 520, damping: 30 }}
      className={`nb relative min-w-0 overflow-hidden p-4 md:p-5 ${ACCENT[FILL[accent] ?? "sky"]}`}>
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0"><Sparkline values={spark} height={40} color="#0b0b0b" /></div>
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <span className="nb-label flex items-center gap-1.5">
            {live ? <span className="size-2.5 animate-pulse-dot border border-[#0b0b0b] bg-red" />
              : Icon && <Icon aria-hidden strokeWidth={2.5} className="size-3.5" />}
            {label}
          </span>
          {delta !== undefined && <Delta value={delta} upIsGood={upIsGood} />}
        </div>
        <div className="mt-3 font-display text-[34px] leading-none tracking-tight md:text-[40px]">
          {value === null ? <span className="text-muted">—</span> : <Num value={value} fmt={fmt} />}
        </div>
        {sub && <div className="mt-2 text-[12.5px] font-semibold text-muted">{sub}</div>}
        <div className="h-10" />
      </div>
    </motion.div>
  );
}

/** A small number row under the hero: label, value, change. */
export function MiniStat({ label, value, delta, upIsGood = true, hint }: { label: string; value: React.ReactNode; delta?: number | null; upIsGood?: boolean; hint?: string }) {
  return (
    <div className="nb-sm min-w-0 bg-surface px-3.5 py-3" title={hint}>
      <div className="nb-label truncate !text-[10px] text-muted">{label}</div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate font-display text-xl tabular-nums">{value}</span>
        {delta !== undefined && <Delta value={delta ?? null} upIsGood={upIsGood} />}
      </div>
    </div>
  );
}

// ---------------- AI ----------------

const VERDICT = {
  hit: { label: "Hit", icon: ThumbsUp, cls: "bg-mint" },
  okay: { label: "Okay", icon: Minus, cls: "bg-sun" },
  miss: { label: "Miss", icon: ThumbsDown, cls: "bg-red" },
} as const;

export function VerdictBadge({ verdict, size = "sm" }: { verdict: "hit" | "okay" | "miss"; size?: "sm" | "lg" }) {
  const v = VERDICT[verdict];
  return (
    <span className={`inline-flex items-center gap-1 border-2 border-edge font-bold uppercase text-on-accent ${v.cls} ${size === "lg" ? "px-3 py-1 text-sm" : "px-1.5 py-px text-[11px]"}`}>
      <v.icon aria-hidden className={size === "lg" ? "size-4" : "size-3"} />{v.label}
    </span>
  );
}

export function AiTag({ at }: { at?: string }) {
  return (
    <span className="inline-flex items-center gap-1 border-2 border-edge bg-grape px-1.5 py-px text-[11px] font-bold uppercase text-on-accent">
      <Sparkles aria-hidden className="size-3" />AI analysis{at ? <span className="font-normal opacity-80"> · {fmtRelative(at)}</span> : null}
    </span>
  );
}

type Ev = { text: string; tab: string | null };
function EvidenceList({ items, onJump, tone }: { items: Ev[]; onJump?: (tab: string) => void; tone: "good" | "critical" | "info" }) {
  const dot = tone === "good" ? "bg-mint" : tone === "critical" ? "bg-red" : "bg-sky";
  return (
    <ul className="space-y-2">
      {items.map((e, i) => (
        <li key={i} className="flex gap-2 text-[13px] font-medium leading-snug text-ink">
          <span aria-hidden className={`mt-1 size-2.5 shrink-0 border-2 border-edge ${dot}`} />
          <span className="min-w-0">
            {e.text}
            {e.tab && onJump && <button type="button" onClick={() => onJump(e.tab!)} className="ml-1.5 border-2 border-edge bg-surface px-1.5 text-[11px] font-bold uppercase text-ink hover:bg-lime hover:text-on-accent">see chart →</button>}
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
      <div className="nb-stripes border-2 border-dashed border-edge p-5 text-sm font-medium text-ink2">
        <AiTag /> <p className="mt-2">The first AI analysis is written by the nightly auditor once the deep stats have run. It reads every number on this page and the comments, then says what to change.</p>
      </div>
    );
  }
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
      className="nb relative overflow-hidden bg-surface">
      <div className="border-b-2 border-edge bg-grape px-5 py-4 on-accent">
        <AiTag at={ai.writtenAt} />
        <h3 className="mt-2.5 font-display text-[19px] uppercase leading-tight md:text-[22px]">{ai.headline}</h3>
      </div>
      <div className="relative p-5">
        <div className={`mt-4 grid gap-5 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          <div><h4 className="nb-label mb-3 inline-block border-2 border-edge bg-mint px-1.5 text-on-accent">Working</h4><EvidenceList items={ai.working} onJump={onJump} tone="good" /></div>
          <div><h4 className="nb-label mb-3 inline-block border-2 border-edge bg-red px-1.5 text-on-accent">Not working</h4><EvidenceList items={ai.notWorking} onJump={onJump} tone="critical" /></div>
          {!compact && <div><h4 className="nb-label mb-3 inline-block border-2 border-edge bg-sky px-1.5 text-on-accent">Audience</h4><EvidenceList items={ai.audience} onJump={onJump} tone="info" /></div>}
        </div>
        {ai.recommendations.length > 0 && (
          <div className="mt-6 border-t-2 border-edge pt-5">
            <h4 className="nb-label mb-3 text-ink">Do next</h4>
            <ol className="grid gap-3 md:grid-cols-3">
              {ai.recommendations.map((r, i) => (
                <li key={i} className="nb-sm bg-lime p-3 on-accent">
                  <div className="flex gap-2"><span className="grid size-6 shrink-0 place-items-center border-2 border-edge bg-surface font-display text-[12px] text-ink">{i + 1}</span><span className="text-[13.5px] font-bold leading-snug">{r.do}</span></div>
                  <p className="mt-1.5 pl-8 text-xs font-medium text-muted">{r.because}</p>
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
        {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-16 w-9 shrink-0 border-2 border-edge object-cover" loading="lazy" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><VerdictBadge verdict={ai.verdict} /><AiTag at={ai.writtenAt} /></div>
          {title && <div className="mt-1 truncate text-xs text-muted">{title}</div>}
          <p className="mt-1.5 text-[14.5px] font-bold leading-snug">{ai.headline}</p>
        </div>
      </div>
      {ai.why.length > 0 && <div className="mt-3"><EvidenceList items={ai.why} tone={ai.verdict === "miss" ? "critical" : ai.verdict === "hit" ? "good" : "info"} /></div>}
      {ai.viewersSaid.length > 0 && (
        <div className="mt-3 border-2 border-dashed border-edge bg-wash p-2.5 text-xs font-medium text-ink2"><span className="font-bold text-ink">Viewers said: </span>{ai.viewersSaid.join(" · ")}</div>
      )}
      {ai.next && <p className="mt-3 text-[13px]"><span className="font-semibold text-ink font-bold">Next time: </span>{ai.next}</p>}
    </>
  );
  const cls = "nb block bg-surface p-4";
  return href ? <Link href={href} className={`${cls} nb-press`}>{body}</Link> : <div className={cls}>{body}</div>;
}

// ---------------- content table ----------------

/** Heat-tinted cell: green above the median of the column, red below. */
function Heat({ v, lo, mid, hi, children }: { v: number | null; lo: number; mid: number; hi: number; children: React.ReactNode }) {
  if (v === null) return <span className="text-muted">—</span>;
  const k = v >= mid ? Math.min(1, (v - mid) / Math.max(hi - mid, 1e-9)) : -Math.min(1, (mid - v) / Math.max(mid - lo, 1e-9));
  const bg = k >= 0 ? `color-mix(in oklab, var(--mint) ${Math.round(k * 90)}%, transparent)` : `color-mix(in oklab, var(--red) ${Math.round(-k * 70)}%, transparent)`;
  return <span className="inline-block min-w-12 border-2 border-transparent px-1.5 py-0.5 text-right font-mono text-[12px] font-bold tabular-nums" style={{ background: bg, borderColor: Math.abs(k) > 0.6 ? "var(--edge)" : undefined }}>{children}</span>;
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
  { key: "views", label: "Views", get: (r) => r.views, render: (r) => <span className="font-semibold tabular-nums">{fmtNum(r.views)}</span> },
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
    <th key={key} className="whitespace-nowrap px-2 py-2.5 text-right font-semibold first:text-left" title={hint}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }))} className={`inline-flex items-center gap-1 font-bold hover:text-lime ${sort.key === key ? "text-lime" : ""}`}>
        {label}{sort.key === key ? (sort.dir < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ChevronsUpDown className="size-3 opacity-40" />}
      </button>
    </th>
  );
  return (
    <div>
      <div className="flex items-center gap-2 border-b-2 border-edge bg-surface-2 px-4 py-2.5">
        <Search aria-hidden strokeWidth={3} className="size-4" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${rows.length} videos`} className="h-8 flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:text-muted" />
      </div>
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[920px] text-[13px]">
          <thead className="sticky top-0 z-10 border-b-2 border-edge bg-ink text-[11px] uppercase tracking-wide text-plane">
            <tr>{head("published", "Video")}{COLS.map((c) => head(c.key, c.label, c.hint))}<th className="px-2 py-2.5 text-right font-semibold">First 7 days</th></tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <motion.tr key={r.videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.4) }} className="border-b-2 border-line last:border-0 hover:bg-lime/20">
                <td className="px-2 py-2 pl-4">
                  <Link href={`/videos/${r.videoId}`} className="flex min-w-[240px] items-center gap-2.5">
                    <img src={r.thumbnailUrl} alt="" loading="lazy" className={`shrink-0 border-2 border-edge object-cover ${r.format === "long" ? "h-9 w-16" : "h-12 w-7"}`} />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-semibold text-ink hover:underline">{r.title}</span>
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
    <div className="nb-stripes flex flex-col items-center justify-center border-2 border-dashed border-edge px-6 py-10 text-center">
      <span className="nb-sm grid size-12 place-items-center bg-sun text-on-accent"><Icon aria-hidden strokeWidth={2.5} className="size-5" /></span>
      <p className="mt-4 font-display text-[15px] uppercase">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] font-medium text-ink2">{children}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton  ${className}`} />;
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
