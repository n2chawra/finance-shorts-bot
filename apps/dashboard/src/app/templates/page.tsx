"use client";

import { BarList } from "@/components/charts";
import { BarChart3 } from "lucide-react";

import { Card, ErrorNote, Loading, PageHeader, Slider, Toggle } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDateTime, fmtNum } from "@/lib/format";
import { usePatchTemplate, useTemplates } from "@/lib/queries";

export default function TemplatesPage() {
  const { data, error, isLoading } = useTemplates();
  const patch = usePatchTemplate();
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const ranked = data.filter((t) => t.avgViews !== null).sort((a, b) => b.avgViews! - a.avgViews!);

  return (
    <>
      <PageHeader title="Templates" sub={`${data.filter((t) => t.enabled).length} of ${data.length} enabled`} />
      {patch.error && <div className="mb-4"><ErrorNote error={patch.error} /></div>}

      <Card title="Average views per published video" icon={BarChart3} className="mb-4">
        <BarList fmt={fmtNum} rows={ranked.map((t) => ({ key: t.id, label: t.name, value: t.avgViews!, sub: `${t.publishedCount} published` }))} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.map((t) => (
          <Card key={t.id}>
            <div className="flex gap-4">
              <video controls preload="none" poster={t.sampleThumbnailUrl} src={t.sampleVideoUrl} aria-label={`Sample video for ${t.name}`}
                className={`aspect-[9/16] w-28 shrink-0 rounded-xl border border-ring bg-black shadow-card transition-opacity ${t.enabled ? "" : "opacity-50"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{t.name}</h2>
                    <p className="font-mono text-xs text-muted">{t.id} · v{t.version}</p>
                  </div>
                  <Toggle label={`Enable ${t.name}`} checked={t.enabled} disabled={patch.isPending} onChange={(enabled) => patch.mutate({ id: t.id, enabled }, { onSuccess: () => toast(`${t.name} ${enabled ? "enabled" : "disabled"}`) })} />
                </div>
                <p className="mt-2 text-sm text-ink2">{t.description}</p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-ink2">Avg views</dt><dd className="font-semibold tabular-nums">{t.avgViews === null ? "—" : fmtNum(t.avgViews)}</dd>
                  <dt className="text-ink2">Videos</dt><dd>{t.videoCount} made, {t.publishedCount} published</dd>
                  <dt className="text-ink2">Last used</dt><dd>{t.lastUsedAt ? fmtDateTime(t.lastUsedAt) : "—"}</dd>
                </dl>
                <div className="mt-3 text-sm">
                  <span className="text-ink2">Weight</span>
                  <Slider label={`Weight for ${t.name}`} min={0} max={3} step={0.1} value={t.weight} disabled={patch.isPending || !t.enabled}
                    onCommit={(weight) => patch.mutate({ id: t.id, weight }, { onSuccess: () => toast(`${t.name} weight set to ${weight.toFixed(1)}`) })} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Weight is how often the planner favours a template (1.0 is neutral). Disabled templates are never picked.</p>
    </>
  );
}
