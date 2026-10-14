"use client";

import { ChevronDown, CircleCheck, CircleX, ExternalLink, Gauge, Minus, Timer, Workflow } from "lucide-react";
import { Accordion } from "radix-ui";
import { useState } from "react";

import { Tracker } from "@/components/charts";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, ResultBadge, Segmented, Stagger, Stat, VideoLink } from "@/components/ui";
import { fmtDateTime, fmtDuration, fmtRelative, titleCase } from "@/lib/format";
import { useRuns } from "@/lib/queries";

type Filter = "all" | "video" | "template_work" | "failed";

export default function RunsPage() {
  const { data, error, isLoading } = useRuns();
  const [filter, setFilter] = useState<Filter>("all");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const failed = data.filter((r) => r.status === "failed").length;
  const shipped = data.filter((r) => r.kind === "video" && r.status === "ok").length;
  const avg = data.length ? data.reduce((a, r) => a + r.durationSec, 0) / data.length : 0;
  const rate = data.length ? Math.round(((data.length - failed) / data.length) * 100) : 0;
  const shown = data.filter((r) => filter === "all" ? true : filter === "failed" ? r.status === "failed" : r.kind === filter);
  const recent = [...data].slice(0, 40).reverse();

  return (
    <Stagger>
      <PageHeader title="Runs" sub="Each routine run that committed something: a video (shipped or failed) or template work" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Runs" icon={Workflow} value={String(data.length)} sub={data.length ? `since ${fmtDateTime(data[data.length - 1].startedAt)}` : undefined} />
        <Stat label="Success rate" icon={Gauge} value={`${rate}%`} sub={`${failed} failed`} />
        <Stat label="Videos shipped" icon={CircleCheck} value={String(shipped)} />
        <Stat label="Avg duration" icon={Timer} value={fmtDuration(avg)} sub="first step to last" />
      </div>

      {recent.length > 0 && (
        <Card title="Recent runs" description={`Oldest to newest, last ${recent.length}`} className="mt-3">
          <Tracker height={28} items={recent.map((r) => ({
            key: r.id, tone: r.status === "ok" ? "good" : "critical",
            tip: `${fmtDateTime(r.startedAt)} · ${r.kind === "video" ? "Video" : "Template work"} · ${r.status === "ok" ? "OK" : "Failed"}`,
          }))} />
        </Card>
      )}

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">History</h2>
        <Segmented label="Filter runs" value={filter} onChange={setFilter}
          options={[{ value: "all", label: "All" }, { value: "video", label: "Videos" }, { value: "template_work", label: "Templates" }, { value: "failed", label: "Failed" }]} />
      </div>

      {shown.length === 0 ? <Card><Empty icon={Workflow} title="No runs here">Runs appear about a minute after a routine commits.</Empty></Card> : (
        <Card flush>
          <Accordion.Root type="multiple">
            {shown.map((r) => (
              <Accordion.Item key={r.id} value={r.id} className="border-b border-line last:border-0">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-wash md:px-5">
                    <span aria-hidden className={`size-2 shrink-0 rounded-full ${r.status === "ok" ? "bg-good" : "bg-critical"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{r.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
                        <span>{fmtDateTime(r.startedAt)}</span><span aria-hidden>·</span><span>{fmtRelative(r.startedAt)}</span><span aria-hidden>·</span><span>{fmtDuration(r.durationSec)}</span>
                      </div>
                      {r.error && <div className="mt-1 line-clamp-2 text-xs text-ink2">{r.error}</div>}
                    </div>
                    <span className="hidden sm:inline"><Badge>{r.kind === "video" ? "Video" : "Template"}</Badge></span>
                    <ResultBadge ok={r.status === "ok"} okLabel="OK" />
                    <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-slide-up">
                  <div className="px-4 pb-4 md:px-5">
                    <ol className="relative ml-1.5 border-l border-ring">
                      {r.steps.map((s, i) => (
                        <li key={i} className="relative flex items-start gap-3 pb-2.5 pl-5 text-[13px] last:pb-0">
                          <span className="absolute -left-[9px] top-0.5 grid size-[17px] place-items-center rounded-full bg-surface">
                            {s.status === "ok" ? <CircleCheck aria-label="OK" className="size-4 text-good" /> : s.status === "failed" ? <CircleX aria-label="Failed" className="size-4 text-critical" /> : <Minus aria-label="Skipped" className="size-4 text-muted" />}
                          </span>
                          <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="block text-ink2">{s.note}</span>}</span>
                          <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {r.videoId && <VideoLink id={r.videoId} className="font-medium text-brand-text">Open video →</VideoLink>}
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
