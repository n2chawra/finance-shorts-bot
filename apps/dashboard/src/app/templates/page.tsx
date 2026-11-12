"use client";

import { BarChart3, LayoutTemplate } from "lucide-react";

import { BarList } from "@/components/charts";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, Toggle } from "@/components/ui";
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

  const retired = (t: (typeof data)[number]) => t.description.startsWith("Retired:");
  const live = data.filter((t) => !retired(t));
  const old = data.filter(retired);

  return (
    <Stagger>
      <PageHeader title="Templates" sub="One story template per format: every video is its own storyboard, drawn by Remotion. Turning one off pauses that format." />

      {live.length === 0 ? <Card className="mb-3"><Empty icon={LayoutTemplate} title="No templates yet" /></Card> : (
        <div className="mb-6 grid gap-5 lg:grid-cols-2">
          {live.map((t) => {
            const long = t.id.startsWith("long");
            return (
              <Card key={t.id} className={t.enabled ? "" : "opacity-80"}>
                <div className="mb-4 flex items-center justify-between">
                  <Badge tone={long ? "info" : "violet"}>{long ? "Long · 16:9" : "Short · 9:16"}</Badge>
                  <Badge tone={t.enabled ? "good" : "neutral"} dot>{t.enabled ? "Live" : "Paused"}</Badge>
                </div>
                <div className={`flex gap-4 ${long ? "flex-col sm:flex-row" : ""}`}>
                  <video controls preload="none" poster={t.sampleThumbnailUrl || undefined} src={t.sampleVideoUrl || undefined} aria-label={`Sample video for ${t.name}`}
                    className={`${long ? "aspect-video w-full sm:w-44 md:w-52" : "aspect-[9/16] w-28 md:w-32"} shrink-0 border border-ring bg-black shadow-xs transition-[filter] ${t.enabled ? "" : "grayscale"} rounded-lg`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-[16px] font-semibold tracking-[-0.01em]">{t.name}</h2>
                        <p className="mt-1 text-xs font-medium text-muted">{t.id} · {long ? "long videos" : "Shorts"}</p>
                      </div>
                      <Toggle label={`Enable ${t.name}`} checked={t.enabled} disabled={patch.isPending}
                        onChange={(enabled) => patch.mutate({ id: t.id, enabled }, { onSuccess: () => toast(`${t.name} ${enabled ? "enabled" : "paused"}`), onError: fail })} />
                    </div>
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-ink2">{t.description}</p>
                    <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ring bg-line text-center">
                      <div className="bg-surface p-2.5"><dt className="text-[11.5px] text-muted">Avg views</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{t.avgViews === null ? "—" : fmtNum(t.avgViews)}</dd></div>
                      <div className="bg-surface p-2.5"><dt className="text-[11.5px] text-muted">Made</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{t.videoCount}</dd></div>
                      <div className="bg-surface p-2.5"><dt className="text-[11.5px] text-muted">Published</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{t.publishedCount}</dd></div>
                    </dl>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted">
                      <span>{t.lastUsedAt ? `Last used ${fmtRelative(t.lastUsedAt)}` : "Not used yet"}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card title="Average views per published video" icon={BarChart3} accent="sun" description="Lifetime views, live where available; retired templates included" className="mb-6">
        {ranked.length ? <BarList fmt={fmtNum} rows={ranked.map((t) => ({ key: t.id, label: t.name, value: t.avgViews!, sub: `${t.publishedCount} published` }))} />
          : <Empty icon={BarChart3}>Rankings appear once templates have published videos.</Empty>}
      </Card>

      {old.length > 0 && (
        <Card title="Retired" icon={LayoutTemplate} description="The first engine's templates, replaced on 2026-10-17. Kept because their videos point at them.">
          <ul className="divide-y divide-line text-[13px] font-semibold">
            {old.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate">{t.name}</span>
                <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted">{t.videoCount} made · {t.publishedCount} published{t.avgViews === null ? "" : ` · ${fmtNum(t.avgViews)} avg views`}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Stagger>
  );
}
