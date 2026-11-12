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
              <Card key={t.id} className={t.enabled ? "" : "nb-stripes"}>
                <div className={`-mx-4 -mt-4 mb-4 flex items-center justify-between border-b-2 border-edge px-4 py-2 md:-mx-5 md:-mt-5 md:px-5 ${t.enabled ? (long ? "bg-sky" : "bg-pink") : "bg-surface-2"} on-accent`}>
                  <span className="nb-label">{long ? "Long · 16:9" : "Short · 9:16"}</span>
                  <span className="nb-label">{t.enabled ? "Live" : "Paused"}</span>
                </div>
                <div className={`flex gap-4 ${long ? "flex-col sm:flex-row" : ""}`}>
                  <video controls preload="none" poster={t.sampleThumbnailUrl || undefined} src={t.sampleVideoUrl || undefined} aria-label={`Sample video for ${t.name}`}
                    className={`${long ? "aspect-video w-full sm:w-44 md:w-52" : "aspect-[9/16] w-28 md:w-32"} shrink-0 border-2 border-edge bg-black shadow-[4px_4px_0_0_var(--hard)] transition-[filter] ${t.enabled ? "" : "grayscale"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-[22px] uppercase leading-tight">{t.name}</h2>
                        <p className="mt-1 font-mono text-[11px] font-bold uppercase text-muted">{t.id} · {long ? "long videos" : "Shorts"}</p>
                      </div>
                      <Toggle label={`Enable ${t.name}`} checked={t.enabled} disabled={patch.isPending}
                        onChange={(enabled) => patch.mutate({ id: t.id, enabled }, { onSuccess: () => toast(`${t.name} ${enabled ? "enabled" : "paused"}`), onError: fail })} />
                    </div>
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] font-medium leading-snug text-ink2">{t.description}</p>
                    <dl className="mt-4 grid grid-cols-3 border-2 border-edge text-center">
                      <div className="bg-lime p-2 on-accent"><dt className="nb-label !text-[9.5px]">Avg views</dt><dd className="mt-1 font-display text-[20px] tabular-nums">{t.avgViews === null ? "—" : fmtNum(t.avgViews)}</dd></div>
                      <div className="border-x-2 border-edge p-2"><dt className="nb-label !text-[9.5px] text-muted">Made</dt><dd className="mt-1 font-display text-[20px] tabular-nums">{t.videoCount}</dd></div>
                      <div className="p-2"><dt className="nb-label !text-[9.5px] text-muted">Published</dt><dd className="mt-1 font-display text-[20px] tabular-nums">{t.publishedCount}</dd></div>
                    </dl>
                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] font-bold uppercase text-muted">
                      <span>{t.lastUsedAt ? `Last used ${fmtRelative(t.lastUsedAt)}` : "Not used yet"}</span>
                      {!t.enabled && <Badge tone="neutral">Paused</Badge>}
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
          <ul className="divide-y-2 divide-line text-[13px] font-semibold">
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
