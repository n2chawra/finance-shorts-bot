"use client";

import { ChevronDown, CircleCheck, CircleX, Minus, Timer, Workflow, XCircle } from "lucide-react";
import { Accordion } from "radix-ui";

import { Card, ErrorNote, Loading, PageHeader, ResultBadge, Tile, VideoLink } from "@/components/ui";
import { fmtDateTime, fmtDuration, titleCase } from "@/lib/format";
import { useRuns } from "@/lib/queries";

export default function RunsPage() {
  const { data, error, isLoading } = useRuns();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const failed = data.filter((r) => r.status === "failed").length;
  const avg = data.length ? data.reduce((a, r) => a + r.durationSec, 0) / data.length : 0;

  return (
    <>
      <PageHeader title="Runs" sub={`Latest ${data.length} routine runs`} />
      <div className="mb-4 grid grid-cols-3 gap-3 md:gap-4">
        <Tile label="Runs" icon={Workflow} value={String(data.length)} />
        <Tile label="Failed" icon={XCircle} tone="critical" value={String(failed)} sub={data.length ? `${Math.round((failed / data.length) * 100)}% of runs` : undefined} />
        <Tile label="Avg duration" icon={Timer} tone="info" value={fmtDuration(avg)} />
      </div>

      <Card className="!p-0 overflow-hidden">
        <Accordion.Root type="multiple">
          {data.map((r) => (
            <Accordion.Item key={r.id} value={r.id} className="border-b border-line last:border-0">
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-wash md:px-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {fmtDateTime(r.startedAt)} · {r.kind === "video" ? "Video" : "Template work"} · {fmtDuration(r.durationSec)}
                    </div>
                    {r.error && <div className="mt-1 text-xs text-ink2">{r.error}</div>}
                  </div>
                  <ResultBadge ok={r.status === "ok"} okLabel="OK" />
                  <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-slide-up">
                <div className="px-3 pb-3 md:px-4">
                  <ol className="rounded-xl bg-wash px-3">
                    {r.steps.map((s, i) => (
                      <li key={i} className="flex items-center gap-3 border-b border-line py-1.5 text-sm last:border-0">
                        {s.status === "ok" ? <CircleCheck aria-label="OK" className="size-4 text-good" /> : s.status === "failed" ? <CircleX aria-label="Failed" className="size-4 text-critical" /> : <Minus aria-label="Skipped" className="size-4 text-muted" />}
                        <span className="flex-1">{titleCase(s.agent)}{s.note && <span className="text-ink2"> · {s.note}</span>}</span>
                        <span className="text-xs tabular-nums text-muted">{s.status === "skipped" ? "skipped" : fmtDuration(s.durationSec)}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-ink2">
                    {r.videoId && <VideoLink id={r.videoId} className="font-medium text-brand-text">Open video</VideoLink>}
                    {r.sessionUrl ? <a className="underline" href={r.sessionUrl} target="_blank" rel="noreferrer">Open Claude session</a> : <span className="text-muted">No Claude session link (sample data)</span>}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Card>
    </>
  );
}
