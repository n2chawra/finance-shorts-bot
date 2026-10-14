"use client";

import { BarChart3, LayoutTemplate } from "lucide-react";

import { BarList } from "@/components/charts";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Slider, Stagger, Toggle } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtNum, fmtRelative } from "@/lib/format";
import { usePatchTemplate, useTemplates } from "@/lib/queries";

export default function TemplatesPage() {
  const { data, error, isLoading } = useTemplates();
  const patch = usePatchTemplate();
  const toast = useToast();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const ranked = data.filter((t) => t.avgViews !== null).sort((a, b) => b.avgViews! - a.avgViews!);
  const fail = (e: Error) => toast(e.message, "error");

  return (
    <Stagger>
      <PageHeader title="Templates" sub={`${data.filter((t) => t.enabled).length} of ${data.length} enabled · the planner picks among enabled ones, weighted`} />

      <Card title="Average views per published video" icon={BarChart3} description="Lifetime views, live where available" className="mb-3">
        {ranked.length ? <BarList fmt={fmtNum} rows={ranked.map((t) => ({ key: t.id, label: t.name, value: t.avgViews!, sub: `${t.publishedCount} published` }))} />
          : <Empty icon={BarChart3}>Rankings appear once templates have published videos.</Empty>}
      </Card>

      {data.length === 0 ? <Card><Empty icon={LayoutTemplate} title="No templates yet" /></Card> : (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {data.map((t) => (
            <Card key={t.id} className={t.enabled ? "" : "opacity-75"}>
              <div className="flex gap-4">
                <video controls preload="none" poster={t.sampleThumbnailUrl || undefined} src={t.sampleVideoUrl || undefined} aria-label={`Sample video for ${t.name}`}
                  className={`aspect-[9/16] w-24 shrink-0 rounded-lg border border-ring bg-black transition-[filter] md:w-28 ${t.enabled ? "" : "grayscale"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-medium">{t.name}</h2>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">{t.id} · v{t.version}</p>
                    </div>
                    <Toggle label={`Enable ${t.name}`} checked={t.enabled} disabled={patch.isPending}
                      onChange={(enabled) => patch.mutate({ id: t.id, enabled }, { onSuccess: () => toast(`${t.name} ${enabled ? "enabled" : "disabled"}`), onError: fail })} />
                  </div>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink2">{t.description}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-2.5 text-center">
                    <div><dt className="text-[11px] text-muted">Avg views</dt><dd className="mt-0.5 text-[13px] font-medium tabular-nums">{t.avgViews === null ? "—" : fmtNum(t.avgViews)}</dd></div>
                    <div><dt className="text-[11px] text-muted">Made</dt><dd className="mt-0.5 text-[13px] font-medium tabular-nums">{t.videoCount}</dd></div>
                    <div><dt className="text-[11px] text-muted">Published</dt><dd className="mt-0.5 text-[13px] font-medium tabular-nums">{t.publishedCount}</dd></div>
                  </dl>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>{t.lastUsedAt ? `Last used ${fmtRelative(t.lastUsedAt)}` : "Not used yet"}</span>
                    {!t.enabled && <Badge tone="neutral">Disabled</Badge>}
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 text-xs text-muted">Weight</div>
                    <Slider label={`Weight for ${t.name}`} min={0} max={3} step={0.1} value={t.weight} disabled={patch.isPending || !t.enabled}
                      onCommit={(weight) => patch.mutate({ id: t.id, weight }, { onSuccess: () => toast(`${t.name} weight set to ${weight.toFixed(1)}`), onError: fail })} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-muted">Weight is how often the planner favours a template (1.0 is neutral). Disabled templates are never picked. The variety rules still apply on top.</p>
    </Stagger>
  );
}
