"use client";

import { Lightbulb } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui";
import { fmtCompact } from "@/lib/format";
import type { Origin } from "@/lib/schemas";

const LINK = "font-medium text-brand-text hover:underline";

/** "Inspired by “…” · 2.8M views": one line for the Videos list. */
export function originLine(o: Origin | null): string | null {
  if (!o?.demand) return null;
  return `Inspired by “${o.demand.title}”${o.demand.views !== null ? ` · ${fmtCompact(o.demand.views)} views` : ""}`;
}

/** Why the video was made, from its research feed topic: reason, angle, the proven video behind it and the pages read. */
export function OriginCard({ origin }: { origin: Origin | null }) {
  return (
    <Card title="Why this video" icon={Lightbulb} description="From the research feed topic it was made from">
      {!origin ? (
        <p className="text-[13px] text-muted">No research topic recorded: made before the feed existed, or the run chose it on its own.</p>
      ) : !origin.title && !origin.why && !origin.demand ? (
        <p className="text-[13px] text-muted">Made from feed topic <span className="font-mono text-xs">{origin.feedId}</span>, which has since left the feed.</p>
      ) : (
        <dl className="flex flex-col gap-3 text-[13px]" data-testid="video-origin">
          {origin.why && <div><dt className="text-xs text-muted">Why</dt><dd className="mt-0.5 text-ink">{origin.why}</dd></div>}
          {origin.angle && <div><dt className="text-xs text-muted">Angle</dt><dd className="mt-0.5 text-ink2">{origin.angle}</dd></div>}
          {origin.demand && (
            <div>
              <dt className="text-xs text-muted">Inspired by</dt>
              <dd className="mt-0.5 break-words">
                {origin.demand.url ? <a className={LINK} href={origin.demand.url} target="_blank" rel="noreferrer">{origin.demand.title} ↗</a> : <span className="font-medium">{origin.demand.title}</span>}
                {origin.demand.views !== null && <span className="block text-xs tabular-nums text-ink2">{fmtCompact(origin.demand.views)} views on YouTube: the proof people want this</span>}
              </dd>
            </div>
          )}
          {origin.fromShort && (
            <div>
              <dt className="text-xs text-muted">Retells our Short</dt>
              <dd className="mt-0.5"><Link className={`${LINK} font-mono text-xs`} href={`/videos/${origin.fromShort.id}`}>{origin.fromShort.id}</Link>
                {origin.fromShort.views !== null && <span className="text-xs text-ink2"> · {fmtCompact(origin.fromShort.views)} views</span>}</dd>
            </div>
          )}
          {origin.sources.length > 0 && (
            <div>
              <dt className="text-xs text-muted">Sources research read</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {origin.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" title={s.url}
                    className="max-w-full truncate rounded-md bg-wash-2 px-1.5 py-0.5 text-xs text-ink2 hover:text-ink">{s.label} ↗</a>
                ))}
              </dd>
            </div>
          )}
          <p className="text-[11px] text-muted">Feed topic <span className="break-all font-mono">{origin.feedId}</span></p>
        </dl>
      )}
    </Card>
  );
}
