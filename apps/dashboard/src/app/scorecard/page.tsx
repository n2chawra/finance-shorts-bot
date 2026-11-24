/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown, ArrowRight, ArrowUp, CircleHelp, Gauge, ListChecks, Mountain, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { BandPill, MetricTile } from "@/components/scorecard";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Segmented, Stagger, Why } from "@/components/ui";
import { fmtCompact, fmtRelative } from "@/lib/format";
import { useScorecard } from "@/lib/queries";
import { CEILING, METRIC, METRICS, type MetricDef, type MetricKey, type ScoreShort, bandOf, isQuestionTitle, median, summarize } from "@/lib/scorecard";

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
function WeekLine({ now, prev, prevCount }: { now: Record<MetricKey, number | null>; prev: Record<MetricKey, number | null>; prevCount: number }) {
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
                : <span className="text-[12px] text-muted">{a == null ? "waiting for numbers" : prevCount ? "last week's still waiting" : "no Shorts last week"}</span>}
            </div>
          </li>
        );
      })}
    </ul>
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
      <PageHeader title="Scorecard" sub={`Is it working? YouTube shows each Short to a small test audience first and only widens it when that audience stays. These are the four numbers it judges.`}>
        <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "28", label: "28 days" }]} />
      </PageHeader>

      {/* progress first: this week vs last week, then the targets */}
      <motion.section variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="panel hero-glow relative overflow-hidden bg-surface p-5 md:p-6">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">This week vs last week</h2>
          <span className="text-[12px] text-muted">medians of the Shorts of the last 7 days against the 7 before · green moved the right way, red the wrong way</span>
        </div>
        <WeekLine now={s7.now.medians} prev={lastWeek} prevCount={prevShorts.length} />
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          {/* the ring stays beside its reading on a phone too, so it never sits alone on a row */}
          <div data-testid="scorecard-verdict" className="flex min-w-0 flex-1 items-center gap-3">
            <Ring on={v.onTarget} of={v.measured || 4} color={VERDICT_RING[v.tone]} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[12.5px] font-medium text-ink2">{v.measured ? `${v.onTarget} of ${v.measured} on target` : "Waiting for numbers"}</span>
                <span className="text-[12px] text-muted"><span aria-hidden className="hidden sm:inline">· </span>{s.recent.length} Shorts in the last {range} days, {s.measured} with YouTube&apos;s numbers</span>
              </div>
              <p className="mt-1 text-[13.5px] leading-snug text-ink2">{v.line}</p>
            </div>
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

