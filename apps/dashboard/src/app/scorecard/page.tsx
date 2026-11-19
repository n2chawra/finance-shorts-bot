/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowRight, ArrowUp, CircleHelp, Gauge, ListChecks, Mountain, Scale, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { BandPill, MetricTile } from "@/components/scorecard";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Segmented, Stagger, Why } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtRelative } from "@/lib/format";
import { useIsFirstChannel, useScorecard } from "@/lib/queries";
import { CEILING, METRIC, METRICS, type MetricDef, type MetricKey, type ScoreShort, type Side, bandOf, isQuestionTitle, median, summarize } from "@/lib/scorecard";

/*
 * Is it working? (owner, 2026-11-16: "analytics I can watch every day to see if the videos are working").
 * The four numbers that decide whether YouTube shows a Short past its first test audience, each against its
 * target, the 48-hour views against the 1.2K ceiling every Short has stopped at, and before vs after the
 * content reset of 16 Nov.
 */

type Range = "7" | "14" | "28";
const ease = [0.16, 1, 0.3, 1] as const;
const VERDICT_RING: Record<string, string> = { good: "var(--good)", warning: "var(--warning)", critical: "var(--critical)", neutral: "var(--ring-strong)" };

/** "2 of 4" as a ring. */
function Ring({ on, of, color }: { on: number; of: number; color: string }) {
  const r = 34, c = 2 * Math.PI * r, share = of ? on / of : 0;
  return (
    <div className="relative grid size-[64px] shrink-0 place-items-center" role="img" aria-label={`${on} of ${of || 4} numbers on target`}>
      <svg viewBox="0 0 84 84" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="7" />
        <motion.circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - share) }} transition={{ duration: 1, ease }} />
      </svg>
      <div className="text-center leading-none">
        <span className="text-[18px] font-semibold tracking-[-0.03em] tabular-nums">{on}</span>
        <span className="text-[11px] font-medium text-muted">/{of || 4}</span>
      </div>
    </div>
  );
}

/** Which way a number moved, judged by which way is better: one colour rule for the whole page. */
type Move = "better" | "worse" | "same";
const MOVE_TEXT: Record<Move, string> = { better: "text-good-text", worse: "text-critical-text", same: "text-muted" };
function moveOf(up: boolean, now: number | null, prev: number | null, fmt: (v: number) => string): Move | null {
  if (now == null || prev == null) return null;
  if (fmt(now) === fmt(prev)) return "same";
  return (now > prev) === up ? "better" : "worse";
}
function MoveArrow({ now, prev, move }: { now: number; prev: number; move: Move }) {
  if (move === "same") return <span aria-hidden>&rarr;</span>;
  const Icon = now > prev ? ArrowUp : ArrowDown;
  return <Icon aria-hidden className="size-3.5" />;
}

/** This week's medians against last week's, each with its arrow: progress first. */
function WeekLine({ now, prev }: { now: Record<MetricKey, number | null>; prev: Record<MetricKey, number | null> }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-4">
      {METRICS.map((m: MetricDef) => {
        const a = now[m.key], b = prev[m.key];
        const move = moveOf(m.higherIsBetter, a, b, m.format);
        return (
          <li key={m.key} className="min-w-0">
            <div className="truncate text-[12px] font-medium text-muted">{m.label}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={`text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums ${move ? MOVE_TEXT[move] : ""}`}>
                {a == null ? <span className="text-muted">&mdash;</span> : m.format(a)}
              </span>
              {a != null && b != null && move
                ? <span className={`inline-flex items-center gap-0.5 whitespace-nowrap text-[12.5px] font-medium ${MOVE_TEXT[move]}`}>
                    <MoveArrow now={a} prev={b} move={move} />{move === "same" ? "same as" : "from"}&nbsp;<span className="tabular-nums">{m.format(b)}</span>
                  </span>
                : <span className="text-[12px] text-muted">{a == null ? "waiting for numbers" : "no Shorts last week"}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** 48-hour views of each Short on a log scale, with the 1.2K ceiling and the 5K and 10K marks. */
function CeilingChart({ shorts, resetDay }: { shorts: ScoreShort[]; resetDay: string }) {
  const rows = [...shorts].reverse().slice(-28);
  const top = Math.max(20_000, ...rows.map((s) => s.views48 ?? s.views));
  const lo = Math.log10(30), hi = Math.log10(top);
  const y = (v: number) => `${Math.max(0, Math.min(100, ((Math.log10(Math.max(v, 30)) - lo) / (hi - lo)) * 100))}%`;
  const resetAt = Date.parse(`${resetDay}T00:00:00+05:30`);
  const med = median(rows.map((s) => s.views48));
  const lines = [
    { at: CEILING, label: "1.2K ceiling", cls: "border-warning", text: "text-warning-text", pos: "-top-4" },
    { at: 5_000, label: "5K", cls: "border-ring-strong", text: "text-muted", pos: "-top-2" },
    { at: 10_000, label: "10K", cls: "border-ring-strong", text: "text-muted", pos: "-top-2" },
    ...(med != null ? [{ at: med, label: `median ${fmtCompact(med)}`, cls: "border-ink2/60", text: "text-ink2", pos: "top-1" }] : []),
  ];
  if (!rows.length) return <Empty icon={Mountain} title="No Shorts in this range">Pick a longer range.</Empty>;
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative min-h-[220px] flex-1"><div className="absolute inset-0 pl-1 pr-[72px]">
        {lines.map((l) => (
          <div key={l.label} aria-hidden className={`absolute left-0 right-0 border-t border-dashed ${l.cls}`} style={{ bottom: y(l.at) }}>
            <span className={`absolute right-0 ${l.pos} whitespace-nowrap bg-surface pl-1.5 text-[10.5px] font-semibold leading-none ${l.text}`}>{l.label}</span>
          </div>
        ))}
        <div className="relative flex h-full items-end gap-[3px]">
          {rows.map((s, i) => {
            const v = s.views48 ?? s.views;
            const after = Date.parse(s.publishAt) >= resetAt;
            const early = s.views48 == null;
            const broke = v > CEILING;
            return (
              <Link key={s.id} href={`/videos/${s.id}`} className="group relative flex h-full min-w-0 flex-1 items-end rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`${s.title}: ${fmtCompact(v)} views${early ? " so far" : " in 48 hours"}`}>
                <motion.span initial={{ height: 0 }} animate={{ height: y(v) }} transition={{ duration: 0.8, delay: i * 0.015, ease }}
                  className={`w-full rounded-t-[4px] transition-opacity group-hover:opacity-80 ${broke ? "bg-good" : after ? "bg-brand" : "bg-ring-strong"} ${early ? "opacity-45 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,rgba(255,255,255,.35)_3px_6px)]" : ""}`} />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] leading-snug text-surface shadow-lift group-hover:block group-focus-visible:block">
                  <b className="tabular-nums">{fmtCompact(v)}</b> {early ? "views so far" : "views in 48 h"}<br /><span className="opacity-80">{s.title}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div></div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-ink2">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-ring-strong" />Before the reset</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-brand" />New recipe</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-good" />Past the ceiling</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-ring-strong opacity-45" />Under 2 days old (views so far)</span>
        {med != null && <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-ink2/60" />Median 48 h views</span>}
        <span className="ml-auto text-muted">oldest → newest · log scale · click a bar to open it</span>
      </div>
    </div>
  );
}

/** Before vs after the reset, metric by metric. */
function BeforeAfter({ before, after, resetDay }: { before: Side; after: Side; resetDay: string }) {
  const rows: { label: string; b: number | null; a: number | null; fmt: (v: number) => string; up: boolean; key?: keyof typeof METRIC }[] = [
    ...METRICS.map((m) => ({ label: m.short, b: before.medians[m.key], a: after.medians[m.key], fmt: m.format, up: m.higherIsBetter, key: m.key })),
    { label: "48 h views", b: before.views48, a: after.views48, fmt: (v: number) => fmtCompact(v), up: true },
    { label: "Shares / 1K", b: before.sharesPer1k, a: after.sharesPer1k, fmt: (v: number) => v.toFixed(2), up: true },
    { label: "Subs / 1K", b: before.subsPer1k, a: after.subsPer1k, fmt: (v: number) => v.toFixed(2), up: true },
  ];
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-line pb-2 text-[11.5px] font-medium text-muted">
        <span />
        <span className="w-16 text-right">Before<span className="block font-normal">{before.n} Shorts</span></span>
        <span className="w-20 text-right text-brand-text">Since {fmtDayKey(resetDay)}<span className="block font-normal text-muted">{after.n} Shorts</span></span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => {
          const move = moveOf(r.up, r.a, r.b, r.fmt);
          return (
            <li key={r.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-2.5 text-[13px]">
              <span className="text-ink2">{r.label}</span>
              <span className="w-16 text-right tabular-nums text-muted">{r.b == null ? "—" : r.fmt(r.b)}</span>
              <span className={`inline-flex w-20 items-center justify-end gap-1 font-semibold tabular-nums ${move ? MOVE_TEXT[move] : ""}`}>
                {r.a == null ? <span className="font-normal text-muted">waiting</span> : r.fmt(r.a)}
                {r.a != null && r.b != null && move && <MoveArrow now={r.a} prev={r.b} move={move} />}
              </span>
            </li>
          );
        })}
      </ul>
      {after.n === 0 && <p className="mt-3 text-[12.5px] text-muted">The first Shorts on the new recipe go out tomorrow; their numbers arrive about two days later.</p>}
    </div>
  );
}

function Cell({ k, v }: { k: keyof typeof METRIC; v: number | null }) {
  const m = METRIC[k];
  const band = bandOf(m, v);
  if (v == null) return <span className="text-[12px] text-muted">waiting</span>;
  return <BandPill band={band}><span className="tabular-nums">{m.format(v)}</span></BandPill>;
}

/** Every Short in range with its four numbers. */
function ShortsTable({ shorts, resetDay }: { shorts: ScoreShort[]; resetDay: string }) {
  const resetAt = Date.parse(`${resetDay}T00:00:00+05:30`);
  if (!shorts.length) return <div className="p-5"><Empty icon={ListChecks} title="No Shorts in this range">Pick a longer range.</Empty></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface-2 text-[11.5px] font-medium text-muted">
            <th className="px-5 py-2.5 font-medium">Short</th>
            {METRICS.map((m) => <th key={m.key} className="px-3 py-2.5 font-medium">{m.short}</th>)}
            <th className="px-5 py-2.5 text-right font-medium">48 h views</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {shorts.map((s) => {
            const after = Date.parse(s.publishAt) >= resetAt;
            const v48 = s.views48 ?? null;
            return (
              <tr key={s.id} className="transition-colors hover:bg-surface-2">
                <td className="px-5 py-2.5">
                  <Link href={`/videos/${s.id}`} className="flex min-w-0 items-center gap-3">
                    <img src={s.thumbnailUrl} alt="" loading="lazy" className="aspect-[9/16] w-8 shrink-0 rounded-md bg-surface-3 object-cover" />
                    <span className="min-w-0">
                      <span className="line-clamp-1 max-w-[340px] font-medium hover:text-brand-text">{s.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
                        {fmtRelative(s.publishAt)}
                        {after && <Badge tone="brand">New recipe</Badge>}
                        {isQuestionTitle(s.title) && <Badge tone="violet">Question title</Badge>}
                      </span>
                    </span>
                  </Link>
                </td>
                {METRICS.map((m) => <td key={m.key} className="px-3 py-2.5"><Cell k={m.key} v={s[m.key]} /></td>)}
                <td className="px-5 py-2.5 text-right">
                  {v48 == null
                    ? <span className="text-[12px] text-muted">{fmtCompact(s.views)} so far</span>
                    : <span className={`font-semibold tabular-nums ${v48 > CEILING ? "text-good-text" : ""}`}>{fmtCompact(v48)}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ScorecardPage() {
  const { data, error, isLoading } = useScorecard();
  const first = useIsFirstChannel();   // the 1.2K ceiling and the 16 Nov reset are Paisa Panchayat's own history
  const [range, setRange] = useState<Range>("7");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const s = summarize(data.shorts, data.resetDay, Number(range));
  const v = s.verdict;
  // this week (last 7 days) against the 7 days before, whatever the range
  const s7 = Number(range) === 7 ? s : summarize(data.shorts, data.resetDay, 7);
  const weekAgo = Date.now() - 7 * 86_400_000, twoWeeksAgo = weekAgo - 7 * 86_400_000;
  const prevShorts = data.shorts.filter((x) => { const t = Date.parse(x.publishAt); return t >= twoWeeksAgo && t < weekAgo; });
  const lastWeek = Object.fromEntries(METRICS.map((m) => [m.key, median(prevShorts.map((x) => x[m.key]))])) as Record<MetricKey, number | null>;

  return (
    <Stagger>
      <PageHeader title="Scorecard" sub={`Is it working? YouTube shows each Short to a small test audience first and only widens it when that audience stays. These are the four numbers it judges${first ? ", against the targets that get a Short past the 1.2K ceiling" : ""}.`}>
        <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "28", label: "28 days" }]} />
      </PageHeader>

      {/* progress first: this week vs last week, then the targets */}
      <motion.section variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="panel hero-glow relative overflow-hidden bg-surface p-5 md:p-6">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">This week vs last week</h2>
          <span className="text-[12px] text-muted">medians of the Shorts of the last 7 days against the 7 before · green moved the right way, red the wrong way</span>
        </div>
        <WeekLine now={s7.now.medians} prev={lastWeek} />
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          <Ring on={v.onTarget} of={v.measured || 4} color={VERDICT_RING[v.tone]} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-medium text-ink2">{v.measured ? `${v.onTarget} of ${v.measured} on target` : "Waiting for numbers"}</span>
              <span className="text-[12px] text-muted">· {s.recent.length} Shorts in the last {range} days, {s.measured} with YouTube&apos;s numbers</span>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug text-ink2">{v.line}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.ladder.map((l) => (
              <span key={l.at} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${l.n ? "border-good/30 bg-good-soft text-good-text" : "border-ring bg-surface-2 text-ink2"}`}>
                <Mountain aria-hidden className="size-3.5" /><b className="tabular-nums">{l.n}</b> past {l.at / 1000}K
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ring bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink2">
              <Sparkles aria-hidden className="size-3.5" />Best ever {fmtCompact(s.best)}
            </span>
          </div>
        </div>
      </motion.section>

      {/* the four numbers */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <MetricTile key={m.key} m={m} value={s.now.medians[m.key]} before={s.before.medians[m.key]} trail={s.trail[m.key]}
            n={s.recent.filter((x) => x[m.key] != null).length} />
        ))}
      </div>

      {/* the ceiling, and before vs after (Paisa Panchayat's own history) */}
      {first && <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <Card title="Breaking the ceiling" icon={Mountain} accent="mint" className="flex flex-col lg:col-span-8 [&>div:last-child]:flex [&>div:last-child]:flex-1 [&>div:last-child]:flex-col"
          description={`Views in the first 48 hours of our latest Shorts, with their median. Every Short so far stopped under ${fmtCompact(CEILING)}; a bar past that line means YouTube took it to a bigger audience.`}>
          <CeilingChart shorts={data.shorts.slice(0, Math.min(28, Math.max(21, s.recent.length)))} resetDay={data.resetDay} />
        </Card>
        <Card title="Before vs after the reset" icon={Scale} accent="grape" className="lg:col-span-4"
          description="Medians of the 14 days before the content reset against every Short since. Green moved the right way, red the wrong way, grey didn't move.">
          <BeforeAfter before={s.before} after={s.after} resetDay={data.resetDay} />
        </Card>
      </div>}

      {/* every Short */}
      <Card flush title="Every Short" icon={ListChecks} accent="sky" className="mt-5"
        description={`The last ${range} days, newest first. A Short gets its numbers about two days after it goes out.`}
        action={<Link href="/analytics" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-medium text-ink2 hover:bg-surface-3 hover:text-ink">Full analytics <ArrowRight aria-hidden className="size-3.5" /></Link>}>
        <ShortsTable shorts={s.recent} resetDay={data.resetDay} />
      </Card>

      {/* how to read it */}
      <Card title="What each number tells you to fix" icon={CircleHelp} className="mt-5">
        <ul className="grid gap-3 md:grid-cols-2">
          {METRICS.map((m) => (
            <li key={m.key} className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-ink2 shadow-xs"><Gauge aria-hidden className="size-3.5" /></span>
              <div className="min-w-0 text-[13px]">
                <div className="font-semibold">{m.label} <span className="font-normal text-muted">· target {m.target}</span></div>
                <Why className="mt-1" label="What it means and how to fix it">
                  <p className="text-ink2">{m.what}.</p>
                  <p className="text-muted"><span className="font-medium text-ink2">When it&apos;s red:</span> {m.fix.charAt(0).toLowerCase() + m.fix.slice(1)}.</p>
                </Why>
              </div>
            </li>
          ))}
        </ul>
        {data.source === "sample" && <p className="mt-4 text-[12px] text-muted">Showing sample data: no database is connected.</p>}
        <Why className="mt-3" label="Where these numbers come from">
          <p className="text-muted">Stayed to watch is the API&apos;s engaged views ÷ views, the closest it gives to YouTube Studio&apos;s &ldquo;stayed to watch&rdquo;.
            The others come from each Short&apos;s retention curve, which YouTube fills in about two days after upload.</p>
        </Why>
      </Card>
    </Stagger>
  );
}

