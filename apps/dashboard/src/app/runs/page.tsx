"use client";

import { ChevronDown, CircleCheck, CircleX, ExternalLink, Gauge, Minus, Timer, Workflow } from "lucide-react";
import { Accordion } from "radix-ui";
import { useState } from "react";

import { Tracker } from "@/components/charts";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, ResultBadge, Segmented, Stagger, Stat, VideoLink } from "@/components/ui";
import { fmtDateTime, fmtDuration, fmtRelative, titleCase } from "@/lib/format";
import { useRuns } from "@/lib/queries";
import type { Run } from "@/lib/schemas";

type Filter = "all" | "video" | "template_work" | "failed";

/** What a run made: a Short, a long video or template work (long runs looked like Shorts here) */
const kindLabel = (r: Run) => r.kind === "template_work" ? "Template" : r.format === "long" ? "Long video" : "Short";

/** The empty list says why it is empty: "Failed" with none used to read as if no runs had happened at all */
const EMPTY: Record<Filter, { title: string; body: string }> = {
  all: { title: "No runs yet", body: "Runs appear about a minute after a routine commits." },
  video: { title: "No video runs yet", body: "Video runs appear about a minute after a routine commits." },
  template_work: { title: "No template work yet", body: "Runs that improve or add a template, instead of making a video, show here." },
  failed: { title: "No failed runs", body: "Every run listed here passed." },
};

export default function RunsPage() {
  const { data, error, isLoading } = useRuns();
  const [filter, setFilter] = useState<Filter>("all");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const failed = data.filter((r) => r.status === "failed").length;
  const shipped = data.filter((r) => r.kind === "video" && r.status === "ok").length;
  const shippedLong = data.filter((r) => r.kind === "video" && r.status === "ok" && r.format === "long").length;
  const avg = data.length ? data.reduce((a, r) => a + r.durationSec, 0) / data.length : 0;
  const rate = data.length ? Math.round(((data.length - failed) / data.length) * 100) : 0;
  const shown = data.filter((r) => filter === "all" ? true : filter === "failed" ? r.status === "failed" : r.kind === filter);
  const recent = [...data].slice(0, 40).reverse();

  return (
    <Stagger>
      <PageHeader title="Runs" sub="Each routine run that committed something: a video (shipped or failed) or template work" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Runs" accent="sky" icon={Workflow} value={String(data.length)} sub={data.length ? `since ${fmtDateTime(data[data.length - 1].startedAt)}` : undefined} />
        <Stat label="Success rate" accent={rate >= 90 ? "mint" : rate >= 70 ? "sun" : "red"} icon={Gauge} value={`${rate}%`} sub={`${failed} failed`} />
        <Stat label="Videos shipped" accent="lime" icon={CircleCheck} value={String(shipped)} sub={shippedLong ? `${shipped - shippedLong} Shorts · ${shippedLong} long` : undefined} />
        <Stat label="Avg duration" accent="grape" icon={Timer} value={fmtDuration(avg)} sub="first step to last" />
      </div>

      {recent.length > 0 && (
        <Card title="Recent runs" description={`Oldest to newest, last ${recent.length}`} className="mt-5">
          <Tracker height={44} items={recent.map((r) => ({
            key: r.id, tone: r.status === "ok" ? "good" : "critical",
            tip: `${fmtDateTime(r.startedAt)} · ${r.kind === "video" ? kindLabel(r) : "Template work"} · ${r.status === "ok" ? "OK" : "Failed"}`,
          }))} />
        </Card>
      )}

      <div className="mb-4 mt-10 flex flex-wrap items-end justify-between gap-3 border-b-2 border-edge pb-3">
        <h2 className="font-display text-[26px] uppercase leading-none">History</h2>
        <Segmented label="Filter runs" value={filter} onChange={setFilter}
          options={[{ value: "all", label: "All" }, { value: "video", label: "Videos" }, { value: "template_work", label: "Templates" }, { value: "failed", label: "Failed" }]} />
      </div>

      {shown.length === 0 ? <Card><Empty icon={filter === "failed" ? CircleCheck : Workflow} title={EMPTY[filter].title}>{EMPTY[filter].body}</Empty></Card> : (
        <Card flush>
          <Accordion.Root type="multiple" className="divide-y-2 divide-edge">
            {shown.map((r) => (
              <Accordion.Item key={r.id} value={r.id}>
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center gap-3 pr-4 text-left transition-colors hover:bg-lime/20 data-[state=open]:bg-surface-2 md:pr-5">
                    <span aria-hidden className={`grid w-12 shrink-0 self-stretch place-items-center border-r-2 border-edge text-on-accent ${r.status === "ok" ? "bg-mint" : "bg-red"}`}>{r.status === "ok" ? <CircleCheck strokeWidth={2.5} className="size-5" /> : <CircleX strokeWidth={2.5} className="size-5" />}</span>
                    <div className="min-w-0 flex-1 py-3">
                      <div className="truncate text-[14px] font-bold">{r.title}</div>
                      <div className="mt-1 flex flex-wrap gap-x-2 font-mono text-[11px] font-bold uppercase text-muted">
                        <span>{fmtDateTime(r.startedAt)}</span><span aria-hidden>·</span><span>{fmtRelative(r.startedAt)}</span><span aria-hidden>·</span><span>{fmtDuration(r.durationSec)}</span>
                        {/* the kind badge is hidden on phones; name a run that isn't a Short in the line instead */}
                        {kindLabel(r) !== "Short" && <><span aria-hidden className="sm:hidden">·</span><span className="sm:hidden" data-testid="run-kind-inline">{kindLabel(r)}</span></>}
                      </div>
                      {r.error && <div className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold text-critical-text">{r.error}</div>}
                    </div>
                    <span className="hidden sm:inline"><Badge>{kindLabel(r)}</Badge></span>
                    <ResultBadge ok={r.status === "ok"} okLabel="OK" />
                    <span className="grid size-8 shrink-0 place-items-center border-2 border-edge bg-surface"><ChevronDown aria-hidden strokeWidth={3} className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" /></span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-slide-up">
                  <div className="border-t-2 border-dashed border-edge bg-surface-2 px-4 py-4 md:px-5">
                    <ol className="relative ml-1.5 border-l-2 border-edge">
                      {r.steps.map((s, i) => (
                        <li key={i} className="relative flex items-start gap-3 pb-2.5 pl-5 text-[13px] last:pb-0">
                          <span className="absolute -left-[10px] top-0.5 grid size-[18px] place-items-center border-2 border-edge bg-surface">
                            {s.status === "ok" ? <CircleCheck aria-label="OK" strokeWidth={3} className="size-3 text-good" /> : s.status === "failed" ? <CircleX aria-label="Failed" strokeWidth={3} className="size-3 text-critical" /> : <Minus aria-label="Skipped" strokeWidth={3} className="size-3 text-muted" />}
                          </span>
                          <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="block text-ink2">{s.note}</span>}</span>
                          <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {r.videoId && <VideoLink id={r.videoId} className="font-semibold text-ink font-bold">Open video →</VideoLink>}
                      {r.sessionUrl && <a className="inline-flex items-center gap-1 text-ink2 hover:text-ink" href={r.sessionUrl} target="_blank" rel="noreferrer">Claude session <ExternalLink aria-hidden className="size-3" /></a>}
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Card>
      )}
    </Stagger>
  );
}
