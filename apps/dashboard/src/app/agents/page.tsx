"use client";

import { Bot, CalendarClock, Clapperboard, Clock, ExternalLink, FlaskConical, GitMerge, Lightbulb, LayoutDashboard, Newspaper, Scale, Search, ShieldAlert, ShieldCheck, Telescope, Wrench } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Tabs } from "radix-ui";
import { useState } from "react";

import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, Stat, type Tone, VideoLink } from "@/components/ui";
import { fmtDateTime, fmtDayKey, fmtRelative, titleCase } from "@/lib/format";
import { useAgents, useSettings } from "@/lib/queries";
import { fmtMinutes, fmtRunWindow, summarizeRunTimes } from "@/lib/run-times";
import type { Activity, Agents } from "@/lib/schemas";

const AGENT: Record<Activity["agent"], { name: string; role: string; icon: typeof Bot; time: string }> = {
  auditor: { name: "Auditor", role: "Checks the numbers against YouTube, fixes bugs, keeps the code clean", icon: ShieldCheck, time: "23:00" },
  scout: { name: "Scout", role: "Finds long-video topics and studies how long-form is made", icon: Telescope, time: "09:37" },
  studio: { name: "Studio", role: "Makes one long video end to end, with its thumbnail", icon: Clapperboard, time: "14:37 Mon/Wed/Fri" },
  research: { name: "Research", role: "Finds what makes Shorts better and what's new in Claude", icon: Search, time: "23:47" },
  improver: { name: "Improver", role: "Tests changes on half the videos, keeps what works", icon: Wrench, time: "06:17" },
  dashboard: { name: "Dashboard", role: "Hunts bugs and polishes this dashboard", icon: LayoutDashboard, time: "07:37" },
  monthly: { name: "Monthly review", role: "Reviews the month and proposes setting changes for you to approve", icon: CalendarClock, time: "12:07 on the 1st" },
};
const DECISION: Record<Activity["decision"], { label: string; tone: Tone }> = {
  acted: { label: "Made a change", tone: "good" },
  waited: { label: "Decided to wait", tone: "info" },
  blocked: { label: "Blocked", tone: "critical" },
  nothing: { label: "Nothing to do", tone: "neutral" },
};
const STATUS: Record<string, Tone> = { running: "info", testing: "info", kept: "good", reverted: "critical", abandoned: "neutral", new: "brand", rejected: "neutral", done: "good", open: "brand" };

const repoLink = (url: string) => (/^https?:/.test(url) ? url : `https://github.com/n2chawra/finance-shorts-bot/blob/main/${url}`);

function ActivityCard({ a }: { a: Activity }) {
  const meta = AGENT[a.agent];
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-text"><meta.icon aria-hidden className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">{meta.name}</h3>
            <Badge tone={DECISION[a.decision].tone} dot>{DECISION[a.decision].label}</Badge>
            <span className="text-xs text-muted">{fmtDayKey(a.day)}</span>
          </div>
          {a.startedAt && a.finishedAt && <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted"><Clock aria-hidden className="size-3" />{fmtRunWindow(a.startedAt, a.finishedAt)}</p>}
          <p className="mt-1.5 text-[13px] leading-relaxed">{a.summary}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink2"><span className="font-medium text-ink">Why: </span>{a.why}</p>

          {a.findings.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium text-muted">What it found</div>
              <ul className="flex flex-col gap-1.5">
                {a.findings.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex gap-2 text-[13px]">
                    <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning-text" />
                    <span>
                      <span className="font-medium">{f.title}</span>{f.detail && <span className="text-ink2">: {f.detail}</span>}
                      {f.link && <a href={f.link} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center text-brand-text hover:underline">source<ExternalLink aria-hidden className="ml-0.5 size-3" /></a>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {a.changes.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium text-muted">What it changed</div>
              <ul className="flex flex-col gap-1.5">
                {a.changes.map((c, i) => (
                  <li key={i} className="rounded-lg bg-surface-2 px-3 py-2 text-[13px]">
                    <span className="font-medium">{c.title}</span>
                    {c.experiment && <Badge tone="info">A/B: {c.experiment}</Badge>}
                    {c.detail && <span className="mt-0.5 block text-ink2">{c.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {a.nextCheck && <span className="inline-flex items-center gap-1"><CalendarClock aria-hidden className="size-3.5" />Next check {fmtDayKey(a.nextCheck)}</span>}
            {a.links.map((l) => <a key={l.url} href={repoLink(l.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">{l.label}<ExternalLink aria-hidden className="size-3" /></a>)}
          </div>
        </div>
      </div>
    </Card>
  );
}

const SEVERITY: Record<NonNullable<Agents["dataAudit"]>["issues"][number]["severity"], Tone> = { error: "critical", warning: "warning", owner: "brand", info: "neutral" };

/** Tonight's data audit: the dashboard's numbers checked against YouTube and the database. */
function DataAuditCard({ audit }: { audit: Agents["dataAudit"] }) {
  if (!audit) return null;
  const s = audit.summary;
  const shown = audit.issues.filter((i) => i.severity !== "info");
  const clean = s.error + s.warning + s.owner === 0;
  return (
    <Card title="Data audit" icon={Scale} description={`${fmtRelative(audit.generatedAt)} · ${s.checked} videos checked ${audit.youtubeChecked ? "against YouTube" : "(YouTube not connected)"}`}
      action={<Badge tone={s.error ? "critical" : s.warning || s.owner ? "warning" : "good"} dot>{clean ? "Numbers match" : `${s.error} errors · ${s.warning + s.owner} warnings`}</Badge>}>
      {shown.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {shown.slice(0, 6).map((i, n) => (
            <li key={n} className="flex flex-wrap items-baseline gap-2 text-[13px]">
              <Badge tone={SEVERITY[i.severity]}>{i.kind.replaceAll("_", " ")}</Badge>
              <span className="text-ink2">{i.videoId && <span className="font-mono text-xs">{i.videoId} · </span>}{i.detail}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-[13px] text-ink2">What the dashboard shows matches YouTube and the database. The auditor checks this every night before its run.</p>}
    </Card>
  );
}

/** How long each routine ran last night, and the 7-night average and max. Needs startedAt/finishedAt from the agents. */
function RunTimesCard({ data }: { data: Agents }) {
  const names = Object.fromEntries((Object.keys(AGENT) as Activity["agent"][]).map((k) => [k, AGENT[k].name]));
  const rows = summarizeRunTimes(data.activity, data.videoRuns, names as Record<Activity["agent"], string>);
  if (!rows.some((r) => r.last)) return null;
  return (
    <Card title="Run times" icon={Clock} description="Last night, and the average and longest of the last 7 nights. Each run should end before the next one starts.">
      <ul className="divide-y divide-line text-[13px]">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 py-2 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr_auto]">
            <span className="font-medium">{r.name}</span>
            <span className="col-span-2 order-last text-ink2 sm:order-none sm:col-span-1">
              {r.last ? <>{fmtRunWindow(r.last.start, r.last.end)}{r.last.note ? ` · ${r.last.note}` : ""}</> : "no times recorded yet"}
            </span>
            <span className="text-right text-xs text-muted">{r.avg !== null ? `avg ${fmtMinutes(r.avg)} · max ${fmtMinutes(r.max!)} (${r.nights})` : ""}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActivityTab({ data }: { data: Agents }) {
  const days = [...new Set(data.activity.map((a) => a.day))].sort().reverse();
  if (!days.length) return <Card><Empty icon={Bot} title="No agent activity yet">Each agent writes a summary here after its nightly run (23:00, 23:47, 06:17 and 07:37 IST).</Empty></Card>;
  // each agent's newest report up front; everything older folded away, newest first
  const agents = Object.keys(AGENT) as Activity["agent"][];
  const latest = agents.map((agent) => data.activity.filter((x) => x.agent === agent).sort((a, b) => b.day.localeCompare(a.day))[0]).filter((a): a is Activity => !!a);
  const older = data.activity.filter((a) => !latest.includes(a)).sort((a, b) => b.day.localeCompare(a.day) || a.agent.localeCompare(b.agent));
  return (
    <div className="flex flex-col gap-8">
      <DataAuditCard audit={data.dataAudit} />
      <RunTimesCard data={data} />
      <section>
        <h2 className="mb-3 text-sm font-medium text-ink2">Latest from each agent</h2>
        <div className="grid gap-3 lg:grid-cols-2">{latest.map((a) => <ActivityCard key={a.agent} a={a} />)}</div>
      </section>
      {older.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink2 hover:text-ink">
            <span className="group-open:hidden">Show</span><span className="hidden group-open:inline">Hide</span> earlier reports ({older.length})
          </summary>
          <ul className="mt-3 flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
            {older.slice(0, 60).map((a) => (
              <li key={`${a.day}-${a.agent}`}>
                <details className="group/r px-4 py-2.5">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                    <span className="w-16 shrink-0 tabular-nums text-muted">{fmtDayKey(a.day)}</span>
                    <span className="font-medium">{AGENT[a.agent].name}</span>
                    <Badge tone={DECISION[a.decision].tone} dot>{DECISION[a.decision].label}</Badge>
                    <span className="min-w-0 flex-1 basis-full truncate text-ink2 sm:basis-0">{a.summary}</span>
                  </summary>
                  <div className="mt-2"><ActivityCard a={a} /></div>
                </details>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ExperimentsTab({ data }: { data: Agents }) {
  if (!data.experiments.length) return <Card><Empty icon={FlaskConical} title="No experiments yet">The improver tests each change on half the new videos and keeps it only if the numbers say so.</Empty></Card>;
  return (
    <Card flush>
      <ul>
        {data.experiments.map((e) => {
          const result = e.result as { ratio?: number; confidence?: number; n?: number } | undefined;
          return (
            <li key={e.id} className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3 last:border-0 md:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[13px] font-medium">{e.id}</span>
                  {e.status && <Badge tone={STATUS[e.status] ?? "neutral"} dot>{titleCase(e.status)}</Badge>}
                  {e.area && <Badge>{e.area}</Badge>}
                </div>
                {e.description && <p className="mt-1 text-[13px] text-ink2">{e.description}</p>}
                {e.hypothesis && <p className="mt-0.5 text-xs text-muted">Hypothesis: {e.hypothesis}</p>}
              </div>
              <div className="text-right text-xs text-muted">
                {e.startedAt && <div>started {fmtDayKey(e.startedAt.slice(0, 10))}</div>}
                {result?.ratio !== undefined && (
                  <div className={`mt-0.5 text-[13px] font-medium ${result.ratio >= 1 ? "text-good-text" : "text-critical-text"}`}>
                    {result.ratio >= 1 ? "+" : ""}{Math.round((result.ratio - 1) * 100)}% views{result.confidence ? ` · ${Math.round(result.confidence * 100)}% sure` : ""}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ProposalsTab({ data }: { data: Agents }) {
  if (!data.proposals.length) return <Card><Empty icon={Lightbulb} title="No proposals yet">Research adds ideas here every night.</Empty></Card>;
  const sorted = [...data.proposals].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return (
    <Card flush>
      <ul>
        {sorted.slice(0, 60).map((p) => (
          <li key={p.id} className="border-b border-line px-4 py-3 last:border-0 md:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium">{p.title}</span>
              {p.status && <Badge tone={STATUS[p.status] ?? "neutral"} dot>{titleCase(p.status)}</Badge>}
              {p.area && <Badge>{p.area}</Badge>}
              {typeof p.route === "string" && <Badge tone={ROUTE[p.route] ?? "neutral"}>{p.route}</Badge>}
              {p.priority === "breaking" && <Badge tone="critical" dot>breaking</Badge>}
            </div>
            {p.change && <p className="mt-1 text-[13px] text-ink2">{p.change}</p>}
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
              {p.date && <span>{fmtDayKey(p.date)}</span>}
              {p.confidence && <span>confidence {p.confidence}</span>}
              {p.effort && <span>effort {p.effort}</span>}
              {(p.evidence ?? []).slice(0, 3).map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">source {i + 1}</a>)}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MergesTab({ data }: { data: Agents }) {
  if (!data.merges.length) return <Card><Empty icon={GitMerge} title="No merges yet">Every agent change passes the guard and the tests before it reaches the live pipeline. Results show here.</Empty></Card>;
  return (
    <Card flush>
      <ul>
        {data.merges.map((m, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 md:px-5">
            {m.result === "merged" ? <GitMerge aria-hidden className="mt-0.5 size-4 text-good" /> : <ShieldAlert aria-hidden className="mt-0.5 size-4 text-critical" />}
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{AGENT[m.agent as Activity["agent"]]?.name ?? m.agent}</span>
                <Badge tone={m.result === "merged" ? "good" : "critical"}>{m.result === "merged" ? "Merged" : "Blocked"}</Badge>
                <span className="font-mono text-xs text-muted">{m.branch}</span>
              </div>
              {m.reasons.length > 0 && <ul className="mt-1 list-disc pl-5 text-ink2">{m.reasons.map((r, j) => <li key={j}>{r}</li>)}</ul>}
            </div>
            <div className="shrink-0 text-right text-xs text-muted">
              <div title={fmtDateTime(m.at)}>{fmtRelative(m.at)}</div>
              {m.runUrl && <a href={m.runUrl} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">run</a>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const ROUTE: Record<string, Tone> = { video: "brand", adopt: "good", experiment: "info", template: "warning", owner: "neutral" };
const PRIORITY: Record<string, Tone> = { breaking: "critical", high: "warning", normal: "neutral" };

/** Video ideas research found (news, trends, evergreen), and which video used each. */
function TopicsTab({ data }: { data: Agents }) {
  if (!data.topics.length) return <Card><Empty icon={Newspaper} title="No topics yet">Research reads the money news every night and lists ready video ideas here. Breaking stories go into the next morning&apos;s videos.</Empty></Card>;
  return (
    <Card flush>
      <ul>
        {data.topics.slice(0, 60).map((t) => {
          const state = t.usedBy ? "used" : t.status ?? "new";
          return (
            <li key={t.id} className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3 last:border-0 md:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium">{t.title}</span>
                  {t.priority && <Badge tone={PRIORITY[t.priority] ?? "neutral"} dot>{t.priority}</Badge>}
                  {t.kind && <Badge>{t.kind}</Badge>}
                </div>
                {t.angle && <p className="mt-1 text-[13px] text-ink2">{t.angle}</p>}
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                  {t.found && <span>found {fmtDayKey(t.found)}</span>}
                  {t.expires && state === "new" && <span>until {fmtDayKey(t.expires)}</span>}
                  {(t.facts ?? []).length > 0 && <span>{t.facts!.length} sourced fact{t.facts!.length === 1 ? "" : "s"} ({[...new Set(t.facts!.map((f) => f.source).filter(Boolean))].join(", ")})</span>}
                  {(t.templates ?? []).length > 0 && <span>{t.templates!.join(", ")}</span>}
                  {(t.sources ?? []).slice(0, 2).map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">source {i + 1}</a>)}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs">
                {t.usedBy ? <VideoLink id={t.usedBy} className="font-medium text-brand-text hover:underline">Video {t.usedBy}</VideoLink>
                  : <Badge tone={state === "new" ? "brand" : "neutral"}>{state === "new" ? "Waiting for a video" : titleCase(state)}</Badge>}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

const TAB = "relative h-9 shrink-0 whitespace-nowrap px-2.5 text-[13px] text-ink2 transition-colors hover:text-ink data-[state=active]:font-medium data-[state=active]:text-ink";

export default function AgentsPage() {
  const { data, error, isLoading } = useAgents();
  const settings = useSettings().data;
  const [tab, setTab] = useState("activity");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const running = data.experiments.filter((e) => e.status === "running").length;
  const kept = data.experiments.filter((e) => e.status === "kept").length;
  const reverted = data.experiments.filter((e) => e.status === "reverted" || e.status === "abandoned").length;
  const lastNight = [...new Set(data.activity.map((a) => a.day))].sort().at(-1);
  const paused = settings?.agents.paused;
  const waiting = data.topics.filter((t) => !t.usedBy && (t.status ?? "new") === "new").length;
  const tabs = [
    { value: "activity", label: "Activity" },
    { value: "experiments", label: `Experiments${running ? ` (${running})` : ""}` },
    { value: "topics", label: `Topic feed${waiting ? ` (${waiting})` : ""}` },
    { value: "proposals", label: "Proposals" },
    { value: "merges", label: "Merge log" },
  ];

  return (
    <Stagger>
      <PageHeader title="Agents" sub="Six agents run the channel: four improve the automation overnight, two make the long videos by day. Here's what they did, what they found, and why they changed something or waited.">
        {paused ? <Badge tone="warning" dot>Paused in settings</Badge> : <Badge tone="good" dot>Running nightly</Badge>}
        <Link href="/settings#agents" className="text-xs text-ink2 hover:text-ink">Settings</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Experiments running" icon={FlaskConical} value={String(running)} sub={`max ${settings?.agents.maxActiveExperiments ?? 3} at once`} />
        <Stat label="Kept" icon={GitMerge} value={String(kept)} sub="proved better, now default" />
        <Stat label="Reverted" icon={ShieldAlert} value={String(reverted)} sub="didn't help, removed" />
        <Stat label="Last report" icon={CalendarClock} value={lastNight ? fmtDayKey(lastNight) : "—"} sub="23:00 · 23:47 · 06:17 · 07:37 · 09:37 · 14:37 IST" />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(AGENT) as Activity["agent"][]).map((k) => {
          const a = AGENT[k];
          const latest = data.activity.find((x) => x.agent === k);
          const enabled = settings ? settings.agents[k] : true;
          return (
            <motion.div key={k} className="rounded-xl border border-ring bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2"><a.icon aria-hidden className="size-4 text-brand-text" /><span className="text-sm font-medium">{a.name}</span>
                <span className="ml-auto text-xs text-muted">{a.time} IST</span></div>
              <p className="mt-1 text-xs text-muted">{a.role}</p>
              <div className="mt-2">{!enabled ? <Badge tone="warning">Switched off</Badge> : latest ? <Badge tone={DECISION[latest.decision].tone} dot>{DECISION[latest.decision].label} · {fmtDayKey(latest.day)}</Badge> : <Badge>No runs yet</Badge>}</div>
            </motion.div>
          );
        })}
      </div>

      <Tabs.Root value={tab} onValueChange={setTab} className="mt-6">
        <Tabs.List aria-label="Agent sections" className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b border-ring">
          {tabs.map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} className={TAB}>
              {t.label}
              {tab === t.value && <motion.span layoutId="agents-tab" className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-ink" />}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="activity" className="outline-none"><ActivityTab data={data} /></Tabs.Content>
        <Tabs.Content value="experiments" className="outline-none"><ExperimentsTab data={data} /></Tabs.Content>
        <Tabs.Content value="topics" className="outline-none"><TopicsTab data={data} /></Tabs.Content>
        <Tabs.Content value="proposals" className="outline-none"><ProposalsTab data={data} /></Tabs.Content>
        <Tabs.Content value="merges" className="outline-none"><MergesTab data={data} /></Tabs.Content>
      </Tabs.Root>
    </Stagger>
  );
}
