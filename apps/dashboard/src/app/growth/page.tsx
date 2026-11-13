/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowRight, BookOpenCheck, Check, CircleSlash, Clapperboard, Eye, FlaskConical, Gauge, History, ListOrdered, Medal, Repeat, ScanEye, ShieldAlert, TrendingDown, Trophy, X } from "lucide-react";
import Link from "next/link";

import { Badge, Card, Empty, ErrorNote, Loading, Meter, PageHeader, Stagger, type Tone } from "@/components/ui";
import { fmtCompact, fmtDateTime, fmtDayKey, fmtRelative } from "@/lib/format";
import { ESCALATE_AFTER, ESCALATE_BELOW, type Growth, KIND_LABEL, KIND_METRIC, OWNER_AFTER, cyclesUnder, nextKind, shownConfidence, testDayLabel, verdictDueDay } from "@/lib/growth";
import { useGrowth } from "@/lib/queries";

import { WinnersCard } from "./winners";
import { isRecent } from "@/lib/recent";

/*
 * The weekly loop, view only (owner, 2026-11-12): this week's test and how it's going, the recipe every
 * Short follows, what's next, the record so far, and what the reviewer and the auditor have learned.
 */

const pct = (x: number | null | undefined, d = 0) => (x == null ? "—" : `${(x * 100).toFixed(d)}%`);
const VERDICT: Record<string, { label: string; tone: Tone; icon: typeof Check }> = {
  keep: { label: "Kept", tone: "good", icon: Check },
  revert: { label: "Reverted", tone: "critical", icon: X },
  abandon: { label: "No difference", tone: "neutral", icon: CircleSlash },
  extend: { label: "Extended", tone: "warning", icon: Repeat },
  wait: { label: "Running", tone: "info", icon: FlaskConical },
};
const verdictOf = (v: string | null | undefined) => VERDICT[v ?? "wait"] ?? VERDICT.wait;

/** What the scoreboard means right now, in one line. */
function reading(e: NonNullable<NonNullable<Growth["status"]>["experiment"]>, keep: number, conf: number): { text: string; tone: Tone } {
  if (e.verdict === "keep") return { text: "The challenger won: it joins the recipe tonight", tone: "good" };
  if (e.verdict === "revert") return { text: "The challenger lost: it is removed tonight", tone: "critical" };
  if (e.verdict === "abandon") return { text: "No clear difference: the next challenger starts tonight", tone: "neutral" };
  if (e.verdict === "extend") return { text: "Too close to call: the test gets one more week", tone: "warning" };
  const need = Math.max(0, e.minPerArm - Math.min(e.counted.on, e.counted.off));
  if (e.points == null) return { text: "Collecting data: the first Shorts need two days of numbers", tone: "info" };
  const lean = e.points >= keep / 2 ? "Leaning challenger" : e.points <= -keep / 2 ? "Leaning champion" : "Too close to call";
  return { text: `${lean} · ${need ? `needs ${need} more Short${need === 1 ? "" : "s"} a side` : (e.pOnBetter ?? 0.5) < conf && 1 - (e.pOnBetter ?? 0.5) < conf ? "needs more confidence" : "ready for a verdict"}`, tone: "info" };
}

/** The difference in points on a −10…+10 track, with the keep and revert lines. */
function DiffGauge({ points, keep, revert }: { points: number | null | undefined; keep: number; revert: number }) {
  const span = 12;
  const at = (x: number) => `${((Math.max(-span, Math.min(span, x)) + span) / (2 * span)) * 100}%`;
  return (
    <div>
      <div className="relative h-9">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-surface-3">
          <div className="absolute inset-y-0 bg-critical-soft" style={{ left: 0, right: `calc(100% - ${at(revert)})` }} />
          <div className="absolute inset-y-0 bg-good-soft" style={{ left: at(keep), right: 0 }} />
        </div>
        {[revert, 0, keep].map((x) => <span key={x} aria-hidden className={`absolute top-1 h-7 w-px ${x === 0 ? "bg-ring-strong" : "bg-ink2/40"}`} style={{ left: at(x) }} />)}
        {points != null && (
          <span className="absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: at(points) }}>
            <span className="size-4 rounded-full border-[3px] border-surface bg-primary shadow-lift" />
          </span>
        )}
      </div>
      <div className="relative mt-1 h-4 text-[11px] text-muted">
        <span className="absolute -translate-x-1/2" style={{ left: at(revert) }}>{revert} revert</span>
        <span className="absolute -translate-x-1/2" style={{ left: at(0) }}>0</span>
        <span className="absolute -translate-x-1/2" style={{ left: at(keep) }}>+{keep} keep</span>
      </div>
    </div>
  );
}

function Side({ label, sub, value, counted, published, need, highlight }: { label: string; sub: string; value: number | null | undefined; counted: number; published: number; need: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-brand/30 bg-brand-soft" : "border-ring bg-surface-2"}`}>
      <div className="text-[12.5px] font-medium text-ink2">{label}</div>
      <div className="mt-0.5 text-[11.5px] text-muted">{sub}</div>
      <div className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{pct(value, 1)}</div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-muted"><span>Shorts with numbers</span><span className="font-medium tabular-nums text-ink">{counted} / {need}</span></div>
      <div className="mt-1.5"><Meter value={counted} max={need} label={`${label} Shorts counted`} tone={highlight ? "brand" : "series"} /></div>
      <div className="mt-2 text-[11.5px] text-muted">{published} published so far</div>
    </div>
  );
}

/** Champion vs challenger stayed to watch per cycle, with the 45% line. */
function CycleChart({ rows }: { rows: Growth["stayedByCycle"] }) {
  const max = 0.7, h = 150;
  const y = (v: number) => h - (Math.min(v, max) / max) * h;
  return (
    <div className="relative" style={{ height: h + 28 }}>
      <div aria-hidden className="absolute inset-x-0 border-t border-dashed border-warning" style={{ top: y(ESCALATE_BELOW) }} />
      <span className="absolute right-0 -translate-y-full pb-0.5 text-[11px] font-medium text-warning-text" style={{ top: y(ESCALATE_BELOW) }}>45%</span>
      <div className="absolute bottom-0 left-0 right-9 flex items-end gap-4" style={{ height: h + 28 }}>
        {rows.map((r) => (
          <div key={r.cycle} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-end justify-center gap-1.5" style={{ height: h }}>
              {([["champion", "bg-ring-strong"], ["challenger", "bg-primary"]] as const).map(([k, cls]) => (
                <div key={k} className="flex w-full max-w-9 flex-col items-center justify-end" style={{ height: h }}>
                  <span className="mb-1 text-[10.5px] font-medium tabular-nums text-ink2">{pct(r[k], 0)}</span>
                  <div className={`w-full rounded-t-md ${cls}`} style={{ height: r[k] == null ? 0 : h - y(r[k]!) }} title={`Cycle ${r.cycle} ${k}: ${pct(r[k], 1)}`} />
                </div>
              ))}
            </div>
            <span className="text-[11.5px] text-muted">Cycle {r.cycle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GrowthPage() {
  const { data, error, isLoading } = useGrowth();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const s = data.status, e = s?.experiment ?? null;
  const t = s?.thresholds ?? { keepPoints: 5, revertPoints: -5, confidence: 0.8 };
  const kind = e?.kind ?? data.history.find((h) => h.id === data.running)?.kind ?? "first-second";
  const under = cyclesUnder(data.stayedByCycle);
  const upcoming = nextKind(data.history, data.stayedByCycle);
  const nextUp = data.challengers.findIndex((c) => c.kind === upcoming);
  const due = e ? verdictDueDay(e.startedAt, e.maxDays) : null;
  const conf = e ? shownConfidence(e) : null;
  const r = e ? reading(e, t.keepPoints, t.confidence) : null;
  const finished = data.history.filter((h) => h.verdict);
  const kept = finished.filter((h) => h.verdict === "keep").length;

  return (
    <Stagger>
      <PageHeader title="Growth loop" sub="The Shorts get better one tested change a week: half of them try a challenger, code compares stayed to watch, the winner joins the recipe. Here is this week's test, how it's going and what the system has learned.">
        <Badge tone="brand">Cycle {data.cycle || "—"}</Badge>
        <Badge tone={kept ? "good" : "neutral"} dot>{kept} of {finished.length} tests kept</Badge>
      </PageHeader>

      {/* this week's test, and the escalation rule */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card title="This week's test" icon={FlaskConical} accent="lime" className="hero-glow lg:col-span-8"
          description={e ? `${KIND_LABEL[kind] ?? kind} · judged on ${KIND_METRIC[kind] ?? "stayed to watch"}` : undefined}
          action={e ? <Badge tone={verdictOf(e.verdict).tone} dot>{verdictOf(e.verdict).label}</Badge> : undefined}>
          {e ? (
            <>
              <p className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">{e.description ?? e.id}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-ring bg-surface p-3.5">
                  <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink2"><Trophy aria-hidden className="size-4 text-warning-text" />Champion · half the Shorts</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink2">The current recipe, unchanged.</p>
                </div>
                <div className="rounded-xl border border-brand/30 bg-brand-soft p-3.5">
                  <div className="flex items-center gap-2 text-[12.5px] font-medium text-brand-text"><FlaskConical aria-hidden className="size-4" />Challenger · the other half</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink2">The recipe with this one change.</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink2">Started {e.startedAt ? fmtDayKey(e.startedAt) : "—"}{due ? ` · verdict due by ${fmtDayKey(due)}` : ""}{e.extended ? " · extended once" : ""}</span>
                  <span className="font-medium tabular-nums">{testDayLabel(e.days, e.maxDays, e.startedAt ? fmtDayKey(e.startedAt) : "soon")}</span>
                </div>
                <div className="mt-2"><Meter value={Math.max(0, e.days ?? 0)} max={e.maxDays} label="Days into the test" /></div>
              </div>
            </>
          ) : <Empty icon={FlaskConical} title="No test running">The improver starts the next challenger the night a verdict lands.</Empty>}
        </Card>

        <Card title="If it keeps not working" icon={ShieldAlert} accent="sun" className="lg:col-span-4"
          description={`Stayed to watch under ${pct(ESCALATE_BELOW)} for ${ESCALATE_AFTER} cycles in a row makes the next test a format change; ${OWNER_AFTER} asks you to change the niche or stop.`}>
          <div className="flex items-end justify-between">
            <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{under}<span className="ml-1 text-lg font-medium text-muted">/ {ESCALATE_AFTER}</span></span>
            <span className="text-[12.5px] text-muted">cycles under {pct(ESCALATE_BELOW)}</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: OWNER_AFTER }, (_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < under ? (i >= ESCALATE_AFTER ? "bg-critical" : "bg-warning") : "bg-surface-3"}`} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-[13px]">
            <span className="text-muted">Next cycle: </span><span className="font-semibold">{KIND_LABEL[upcoming]}</span>
            {s?.channelStayed14d != null && <div className="mt-1 text-[12.5px] text-muted">Channel stayed to watch, last 14 days: <span className="font-medium text-ink">{pct(s.channelStayed14d, 1)}</span></div>}
          </div>
        </Card>
      </div>

      {/* live scoreboard */}
      {e && (
        <Card title="Live scoreboard" icon={Gauge} accent="sky" className="mt-5"
          description={`Refreshed every 6 hours from YouTube Analytics${s ? ` · ${fmtRelative(s.generatedAt)}` : ""}. A Short counts once it has two days of numbers.`}
          action={r ? <Badge tone={r.tone} dot>{r.text}</Badge> : undefined}>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1.3fr]">
            <Side label="Champion" sub={`${KIND_METRIC[kind] ?? "stayed to watch"} · current recipe`} value={e.value.off} counted={e.counted.off} published={e.published.off} need={e.minPerArm} />
            <Side label="Challenger" sub={`${KIND_METRIC[kind] ?? "stayed to watch"} · with the change`} value={e.value.on} counted={e.counted.on} published={e.published.on} need={e.minPerArm} highlight />
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-ring p-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] font-medium text-ink2">Difference</span>
                  <span className={`text-[22px] font-semibold tabular-nums ${e.points == null ? "text-muted" : e.points >= 0 ? "text-good-text" : "text-critical-text"}`}>{e.points == null ? "—" : `${e.points > 0 ? "+" : ""}${e.points.toFixed(1)} pts`}</span>
                </div>
                <div className="mt-2"><DiffGauge points={e.points} keep={t.keepPoints} revert={t.revertPoints} /></div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="font-medium text-ink2">Confidence the challenger is better</span>
                  <span className="font-semibold tabular-nums">{pct(conf)}</span>
                </div>
                <div className="mt-2"><Meter value={(conf ?? 0.5) * 100} max={100} label="Confidence" tone={(conf ?? 0) >= t.confidence ? "good" : "series"} /></div>
                <div className="mt-1.5 text-[11.5px] text-muted">Kept at +{t.keepPoints} points with {pct(t.confidence)} confidence; reverted at {t.revertPoints}.</div>
              </div>
            </div>
          </div>
          {e.why && <p className="mt-4 text-[12.5px] text-muted">Evaluator: {e.why}</p>}
        </Card>
      )}

      {/* the recipe, and what's next */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Champion recipe" icon={Medal} accent="sun" description={`What every Short follows${data.recipe?.updatedAt ? ` · updated ${fmtDayKey(data.recipe.updatedAt)}` : ""}. A kept test adds or replaces a rule.`}>
          {data.recipe?.rules.length ? (
            <ul className="flex flex-col gap-2">
              {data.recipe.rules.map((rule) => (
                <li key={rule.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-good-soft text-good-text"><Check aria-hidden className="size-3.5" /></span>
                  <span className="min-w-0 flex-1 text-[13.5px] leading-snug">{rule.text}</span>
                  {rule.from && <Badge tone={rule.from.startsWith("cycle") ? "brand" : "neutral"}>{rule.from.startsWith("cycle") ? `Won in ${rule.from}` : rule.from}</Badge>}
                </li>
              ))}
            </ul>
          ) : <Empty icon={Medal} title="No recipe file yet">The improver writes it the next time a test is kept.</Empty>}
        </Card>

        <Card title="Up next" icon={ListOrdered} accent="grape" description={`Waiting challengers, in order. The next cycle is a ${KIND_LABEL[upcoming].toLowerCase()}, so the first of that kind goes next.`}>
          {data.challengers.length ? (
            <ol className="flex flex-col gap-2">
              {data.challengers.map((c, i) => (
                <li key={c.id} className={`rounded-xl border px-3.5 py-3 ${i === nextUp ? "border-brand/30 bg-brand-soft" : "border-line bg-surface-2"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {i === nextUp && <Badge tone="brand" icon={ArrowRight}>Next</Badge>}
                    <Badge tone={c.kind === "look" ? "violet" : c.kind === "format" ? "warning" : "info"}>{KIND_LABEL[c.kind ?? ""] ?? c.kind ?? "Test"}</Badge>
                    {c.from && <span className="text-[11.5px] text-muted">from {c.from}</span>}
                  </div>
                  <p className="mt-1.5 text-[13.5px] font-medium leading-snug">{c.test ?? c.id}</p>
                  {c.why && <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Why: {c.why}</p>}
                </li>
              ))}
            </ol>
          ) : <Empty icon={ListOrdered} title="The queue is empty">Research, the auditor and the reviewer add challengers with their evidence.</Empty>}
        </Card>
      </div>

      {/* the record */}
      <Card title="Progress over time" icon={History} accent="mint" className="mt-5" description="Stayed to watch of each side, per finished cycle, and every test so far.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="min-w-0">
            {data.stayedByCycle.length ? <CycleChart rows={data.stayedByCycle} /> : <Empty icon={TrendingDown} title="No finished cycle yet">The chart starts when the first verdict lands.</Empty>}
            <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-ink2">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-ring-strong" />Champion</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-primary" />Challenger</span>
              <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-warning" />45% line</span>
            </div>
          </div>
          <ul className="min-w-0 divide-y divide-line rounded-xl border border-ring">
            {[...data.history].reverse().map((h) => {
              const v = verdictOf(h.verdict), row = data.stayedByCycle.find((x) => x.cycle === h.cycle);
              return (
                <li key={`${h.cycle}-${h.id}`} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 text-[12px] font-semibold tabular-nums">{h.cycle}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium">{h.test ?? h.id}</div>
                    <div className="text-[12px] text-muted">{KIND_LABEL[h.kind ?? ""] ?? h.kind}{h.started ? ` · ${fmtDayKey(h.started)}` : ""}{row ? ` · ${pct(row.champion)} → ${pct(row.challenger)}` : ""}</div>
                  </div>
                  <Badge tone={v.tone} icon={v.icon}>{v.label}</Badge>
                </li>
              );
            })}
            {data.history.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-muted">No tests yet.</li>}
          </ul>
        </div>
      </Card>

      {/* what the most-watched animated Shorts on our topics do */}
      <WinnersCard twins={data.twins} />

      {/* what the reviewer and the auditor learned */}
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        <Card title="Video reviewer" icon={ScanEye} accent="pink" className="xl:col-span-7"
          description={`Watches our Shorts next to where viewers left and writes lessons every script must follow. Next run ${fmtDateTime(data.reviewer.nextRunAt)} IST (${fmtRelative(data.reviewer.nextRunAt)}).`}>
          {data.reviewer.lastDay && (
            <div className="mb-4 rounded-xl border border-line bg-surface-2 p-3.5 text-[13px]">
              <span className="font-medium">Last run {fmtDayKey(data.reviewer.lastDay)}: </span><span className="text-ink2">{data.reviewer.lastSummary}</span>
            </div>
          )}
          {data.lessons.length ? (
            <ol className="flex flex-col gap-3">
              {data.lessons.map((l) => (
                <li key={l.n} className="rounded-xl border border-ring p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-surface-3 text-[11.5px] font-semibold">{l.n}</span>
                    <span className="text-[14px] font-semibold">{l.title}</span>
                    {l.date && isRecent(l.date) && <Badge tone="brand">New</Badge>}
                    <span className="ml-auto text-[11.5px] text-muted">{l.date ? fmtDayKey(l.date) : ""}{l.source ? ` · ${l.source}` : ""}</span>
                  </div>
                  {l.seen && <p className="mt-2 text-[12.5px] leading-relaxed text-muted"><span className="font-medium text-ink2">Seen: </span>{l.seen}</p>}
                  {l.fix && <p className="mt-1.5 text-[13px] leading-relaxed"><span className="font-semibold text-good-text">Fix: </span>{l.fix}</p>}
                </li>
              ))}
            </ol>
          ) : <Empty icon={BookOpenCheck} title="No lessons yet">The reviewer adds them after watching our Shorts.</Empty>}
        </Card>

        <div className="flex flex-col gap-5 xl:col-span-5">
          <Card title="Where viewers leave" icon={Eye} accent="red" description={`The auditor's weekly tally of the picture on screen when viewers drop${data.pictures?.writtenAt ? ` · ${fmtDayKey(data.pictures.writtenAt)}` : ""}.`}>
            {data.pictures?.lossByPicture.length ? (
              <ul className="flex flex-col gap-2.5">
                {data.pictures.lossByPicture.map((p, i) => {
                  const max = Math.max(...data.pictures!.lossByPicture.map((x) => x.avgDrop ?? 0), 0.01);
                  return (
                    <li key={p.kind}>
                      <div className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className={i === 0 ? "font-semibold" : ""}>{p.kind}</span>
                        <span className="shrink-0 tabular-nums text-ink2">{pct(p.avgDrop)} leave · {p.shorts ?? "?"} Shorts</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
                        <div className={`h-full rounded-full ${i === 0 ? "bg-critical" : "bg-warning"}`} style={{ width: `${((p.avgDrop ?? 0) / max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <Empty icon={Eye} title="No tally yet">The auditor fills this every Sunday once enough Shorts have retention data.</Empty>}
            {data.pictures?.worst && <p className="mt-4 rounded-xl border border-critical/20 bg-critical-soft px-3.5 py-2.5 text-[13px]"><span className="font-semibold">Retired: </span><span className="text-ink2">{data.pictures.worst}</span></p>}
          </Card>

          <Card title="The bar to beat" icon={Clapperboard} accent="lime" description="Our 3 Shorts that held viewers best. The writer and QA work to match them.">
            {data.reference.length ? (
              <ul className="grid grid-cols-3 gap-3">
                {data.reference.map((v) => (
                  <li key={v.id} className="group relative overflow-hidden rounded-xl border border-ring bg-surface-2">
                    <img src={v.thumbnailUrl} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
                    <div className="p-2.5">
                      <Link href={`/videos/${v.id}`} className="line-clamp-2 text-[12px] font-medium leading-snug after:absolute after:inset-0 hover:text-brand-text">{v.title}</Link>
                      {v.views != null && <span className="mt-1 block text-[11px] text-muted">{fmtCompact(v.views)} views</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <Empty icon={Clapperboard} title="Not chosen yet">The auditor picks them each Sunday.</Empty>}
          </Card>
        </div>
      </div>
    </Stagger>
  );
}
