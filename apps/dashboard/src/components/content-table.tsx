/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Sparkline } from "@/components/charts";
import { VerdictBadge } from "@/components/studio-parts";
import { fmtCompact, fmtDate, fmtNum } from "@/lib/format";
import type { ContentRow } from "@/lib/studio-schema";

// One colour rule for every "higher is better" column: green when the value is more than 10% above
// the column's median (or past 100%), red when more than 10% below, grey in between.
type Tone = "good" | "bad" | "flat";
const NEAR = 0.1;

function toneOf(v: number, mid: number, full: number): Tone {
  if (v >= full) return "good";
  if (mid <= 0) return "flat";
  const r = v / mid;
  return r > 1 + NEAR ? "good" : r < 1 - NEAR ? "bad" : "flat";
}

const TONE_CLS: Record<Tone, string> = {
  good: "bg-tint-green text-ink",
  bad: "bg-tint-red text-ink",
  flat: "text-ink2",
};

/** A percentage cell. `full` is 100% in the value's own unit (1 for ratios, 100 for avgViewPct). */
function PctCell({ v, mid, full, digits = 0 }: { v: number | null; mid: number; full: number; digits?: number }) {
  if (v === null) return <span className="text-muted">—</span>;
  const over = v > full;
  const tone = toneOf(v, mid, full);
  const title = over
    ? `${((v / full) * 100).toFixed(0)}%: replayed, ${(v / full).toFixed(1)}× on average`
    : `${((v / full) * 100).toFixed(digits)}% (column median ${((mid / full) * 100).toFixed(digits)}%)`;
  return (
    <span title={title} className={`inline-flex min-w-12 items-center justify-end gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${TONE_CLS[tone]}`}>
      {over ? <>100%+<span aria-label="replayed" role="img">🔁</span></> : `${((v / full) * 100).toFixed(digits)}%`}
    </span>
  );
}

type Col = { key: string; label: string; get: (r: ContentRow) => number | null; render: (r: ContentRow, med: Record<string, number>) => React.ReactNode; hint?: string; w: number };

const vs = (x: number | null) => {
  if (x === null) return null;
  const tone = Math.abs(x - 1) <= NEAR ? "text-muted" : x > 1 ? "text-good-text" : "text-critical-text";
  return <span className={`ml-1 inline-flex items-center text-[11px] font-semibold ${tone}`}>{x >= 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{x.toFixed(1)}×</span>;
};

const COLS: Col[] = [
  { key: "views", label: "Views", w: 80, get: (r) => r.views, render: (r) => <span className="font-semibold tabular-nums">{fmtNum(r.views)}</span> },
  { key: "views48", label: "48 h", w: 96, hint: "Views in the first two days, against the median of its format", get: (r) => r.views48, render: (r) => <span className="tabular-nums">{r.views48 === null ? "—" : fmtCompact(r.views48)}{vs(r.vs48)}</span> },
  { key: "pct", label: "% viewed", w: 92, hint: "Average share of the video watched; past 100% means viewers replayed it", get: (r) => r.avgViewPct, render: (r, m) => <PctCell v={r.avgViewPct} mid={m.pct!} full={100} /> },
  { key: "hook", label: "Hook hold", w: 96, hint: "Share still watching at 3 s (Shorts) or 30 s (long); past 100% means replays", get: (r) => r.hookHold, render: (r, m) => <PctCell v={r.hookHold} mid={m.hook!} full={1} /> },
  { key: "engaged", label: "Engaged", w: 92, hint: "Engaged views ÷ views: the closest the API gets to Studio's stayed-to-watch", get: (r) => r.engagedRatio, render: (r, m) => <PctCell v={r.engagedRatio} mid={m.engaged!} full={1} /> },
  { key: "ctr", label: "CTR", w: 80, get: (r) => r.ctr, render: (r, m) => <PctCell v={r.ctr} mid={m.ctr!} full={1} digits={1} /> },
  { key: "likes", label: "Likes", w: 72, get: (r) => r.likes, render: (r) => <span className="tabular-nums">{fmtNum(r.likes)}</span> },
  { key: "shares", label: "Shares", w: 72, get: (r) => r.shares, render: (r) => <span className="tabular-nums">{fmtNum(r.shares)}</span> },
  { key: "subs", label: "Subs", w: 64, get: (r) => r.subsNet, render: (r) => <span className={`tabular-nums ${r.subsNet > 0 ? "text-good-text" : r.subsNet < 0 ? "text-critical-text" : ""}`}>{r.subsNet > 0 ? "+" : ""}{fmtNum(r.subsNet)}</span> },
];

const VIDEO_W = 300;
const SPARK_W = 128;

/**
 * Keeps the header row pinned under the app header while the page scrolls. CSS sticky can't do it
 * here: the table needs its own horizontal scroller and the card clips, both of which trap sticky.
 */
function useStickyHead(wrap: React.RefObject<HTMLDivElement | null>, head: React.RefObject<HTMLTableSectionElement | null>) {
  useEffect(() => {
    let raf = 0;
    const place = () => {
      raf = 0;
      const w = wrap.current, h = head.current;
      if (!w || !h) return;
      const top = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const box = w.getBoundingClientRect();
      const y = Math.max(0, Math.min(top - box.top, box.height - h.offsetHeight));
      w.style.setProperty("--head-y", `${y}px`);
      h.dataset.stuck = y > 0 ? "1" : "0";
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(place); };
    place();
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    return () => { window.removeEventListener("scroll", ask); window.removeEventListener("resize", ask); cancelAnimationFrame(raf); };
  }, [wrap, head]);
}

export function ContentTable({ rows }: { rows: ContentRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "published", dir: -1 });
  const wrap = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  useStickyHead(wrap, headRef);

  // A column with no value for any video (CTR before the Reporting API lands) is left out.
  const cols = useMemo(() => COLS.filter((c) => rows.some((r) => c.get(r) !== null)), [rows]);
  const med = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of cols) {
      const xs = rows.map(c.get).filter((x): x is number => x !== null).sort((a, b) => a - b);
      const n = xs.length;
      out[c.key] = n === 0 ? 0 : n % 2 ? xs[(n - 1) / 2]! : (xs[n / 2 - 1]! + xs[n / 2]!) / 2;
    }
    return out;
  }, [rows, cols]);
  const shown = useMemo(() => {
    const f = rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.videoId.includes(q));
    const col = cols.find((c) => c.key === sort.key);
    return [...f].sort((a, b) => sort.dir * (col ? (col.get(a) ?? -Infinity) - (col.get(b) ?? -Infinity) : a.publishAt.localeCompare(b.publishAt)));
  }, [rows, q, sort, cols]);
  const minW = VIDEO_W + SPARK_W + cols.reduce((s, c) => s + c.w, 0);

  const thCls = "relative z-10 whitespace-nowrap border-b border-line bg-surface-2 px-2 py-2.5 text-right font-semibold [transform:translateY(var(--head-y,0px))] group-data-[stuck=1]/head:shadow-[0_1px_0_var(--line)]";
  const head = (key: string, label: string, hint?: string, extra = "") => (
    <th key={key} className={`${thCls} ${extra}`} title={hint} scope="col">
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }))} className={`inline-flex items-center gap-1 font-semibold hover:text-brand ${sort.key === key ? "text-brand" : ""}`}>
        {label}{sort.key === key ? (sort.dir < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />) : <ChevronsUpDown className="size-3 opacity-40" />}
      </button>
    </th>
  );
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-ring bg-surface-2 px-4 py-2.5">
        <Search aria-hidden className="size-4" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${rows.length} videos`} className="h-8 flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:text-muted" />
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-1.5 text-[11.5px] text-muted">
        <span className="inline-flex items-center gap-1"><span aria-hidden className="size-2.5 rounded-sm bg-tint-green" />over 10% above the column median</span>
        <span className="inline-flex items-center gap-1"><span aria-hidden className="size-2.5 rounded-sm bg-tint-red" />over 10% below</span>
        <span>grey: near the median</span>
        <span>100%+ 🔁 = viewers replayed it (hover for the real figure)</span>
      </p>
      <div ref={wrap} className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-[13px]" style={{ minWidth: minW }}>
          <thead ref={headRef} className="group/head text-[12px] text-muted" data-stuck="0">
            <tr>
              {head("published", "Video", undefined, "sticky left-0 z-20 pl-4 text-left")}
              {cols.map((c) => head(c.key, c.label, c.hint))}
              <th scope="col" className={`${thCls} pr-4`}>First 7 days</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <motion.tr key={r.videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.4) }} className="group/row">
                <td className="sticky left-0 z-[5] border-b border-line bg-surface px-2 py-2 pl-4 group-last/row:border-0 group-hover/row:bg-surface-2" style={{ width: VIDEO_W }}>
                  <Link href={`/videos/${r.videoId}`} className="flex min-w-[240px] items-center gap-2.5">
                    <img src={r.thumbnailUrl} alt="" loading="lazy" className={`shrink-0 border border-ring object-cover ${r.format === "long" ? "h-9 w-16" : "h-12 w-7"} rounded-lg`} />
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-semibold text-ink hover:underline">{r.title}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">{fmtDate(r.publishAt)} · {r.format === "long" ? "Long" : "Short"}{r.verdict && <VerdictBadge verdict={r.verdict} />}</span>
                    </span>
                  </Link>
                </td>
                {cols.map((c) => <td key={c.key} className="border-b border-line px-2 py-2 text-right group-last/row:border-0 group-hover/row:bg-surface-2">{c.render(r, med)}</td>)}
                <td className="border-b border-line px-2 py-2 pr-4 group-last/row:border-0 group-hover/row:bg-surface-2" style={{ width: SPARK_W }}><Sparkline values={r.first7} height={26} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
