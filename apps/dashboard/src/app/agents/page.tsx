"use client";

import { Bot, CalendarClock, ExternalLink, FlaskConical, GitMerge, Lightbulb, LayoutDashboard, Scale, Search, ShieldAlert, ShieldCheck, Wrench } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Tabs } from "radix-ui";
import { useState } from "react";

import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, Stat, type Tone } from "@/components/ui";
import { fmtDateTime, fmtDayKey, fmtRelative, titleCase } from "@/lib/format";
import { useAgents, useSettings } from "@/lib/queries";
import type { Activity, Agents } from "@/lib/schemas";

const AGENT: Record<Activity["agent"], { name: string; role: string; icon: typeof Bot; time: string }> = {
  auditor: { name: "Auditor", role: "Checks the numbers against YouTube, fixes bugs, keeps the code clean", icon: ShieldCheck, time: "23:00" },
  research: { name: "Research", role: "Finds what makes Shorts better and what's new in Claude", icon: Search, time: "00:07" },
  improver: { name: "Improver", role: "Tests changes on half the videos, keeps what works", icon: Wrench, time: "05:17" },
  dashboard: { name: "Dashboard", role: "Hunts bugs and polishes this dashboard", icon: LayoutDashboard, time: "06:47" },
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
          </div>
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

function ActivityTab({ data }: { data: Agents }) {
  const days = [...new Set(data.activity.map((a) => a.day))].sort().reverse();
  if (!days.length) return <Card><Empty icon={Bot} title="No agent activity yet">Each agent writes a summary here after its nightly run (23:00, 00:07, 05:17 and 06:47 IST).</Empty></Card>;
  return (
    <div className="flex flex-col gap-8">
      <DataAuditCard audit={data.dataAudit} />
      {days.slice(0, 14).map((day) => (
        <section key={day}>
          <h2 className="mb-3 text-sm font-medium text-ink2">{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`))}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {(Object.keys(AGENT) as Activity["agent"][]).map((agent) => {
              const a = data.activity.find((x) => x.day === day && x.agent === agent);
              return a ? <ActivityCard key={agent} a={a} /> : (
                <Card key={agent}><p className="text-[13px] text-muted">{AGENT[agent].name}: no report for this night.</p></Card>
              );
            })}
          </div>
        </section>
      ))}
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

const TAB = "relative h-9 px-2.5 text-[13px] text-ink2 transition-colors hover:text-ink data-[state=active]:font-medium data-[state=active]:text-ink";

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
  const tabs = [
    { value: "activity", label: "Activity" },
    { value: "experiments", label: `Experiments${running ? ` (${running})` : ""}` },
    { value: "proposals", label: "Proposals" },
    { value: "merges", label: "Merge log" },
  ];

  return (
    <Stagger>
      <PageHeader title="Agents" sub="Four agents check and improve the automation every night while you sleep. Here's what they did, what they found, and why they changed something or waited.">
        {paused ? <Badge tone="warning" dot>Paused in settings</Badge> : <Badge tone="good" dot>Running nightly</Badge>}
        <Link href="/settings#agents" className="text-xs text-ink2 hover:text-ink">Settings</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Experiments running" icon={FlaskConical} value={String(running)} sub={`max ${settings?.agents.maxActiveExperiments ?? 3} at once`} />
        <Stat label="Kept" icon={GitMerge} value={String(kept)} sub="proved better, now default" />
        <Stat label="Reverted" icon={ShieldAlert} value={String(reverted)} sub="didn't help, removed" />
        <Stat label="Last report" icon={CalendarClock} value={lastNight ? fmtDayKey(lastNight) : "—"} sub="23:00 · 00:07 · 05:17 · 06:47 IST" />
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
        <Tabs.Content value="proposals" className="outline-none"><ProposalsTab data={data} /></Tabs.Content>
        <Tabs.Content value="merges" className="outline-none"><MergesTab data={data} /></Tabs.Content>
      </Tabs.Root>
    </Stagger>
  );
}
