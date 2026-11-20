"use client";

import { AlertTriangle, Download, Film, Hand, ImageDown, Smartphone } from "lucide-react";

import { CopyButton, MarkUploaded, uploadText } from "@/app/videos/[id]/publish-tools";
import { Badge, Card, Thumb, VideoLink, buttonClass } from "@/components/ui";
import { fileSlug, fmtDateTime, fmtRelative } from "@/lib/format";
import type { HandUpload } from "@/lib/hand-uploads";
import { useHandUploads } from "@/lib/queries";

function Item({ h }: { h: HandUpload }) {
  const v = h.video;
  const { description, hashtags } = uploadText(v);
  const long = v.format === "long";
  return (
    <li className="border-b border-line py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Thumb src={v.thumbnailUrl} alt="" className={long ? "w-32 aspect-video" : "w-20"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{h.channelName}</Badge>
            <Badge tone={long ? "info" : "violet"} icon={long ? Film : Smartphone}>{long ? "Long video" : "Short"}</Badge>
            {h.reason === "quota" ? <Badge tone="critical" icon={AlertTriangle}>Quota ran out</Badge> : <Badge tone="warning" icon={AlertTriangle}>Missed its slot</Badge>}
          </div>
          <VideoLink id={v.id} className="mt-1.5 block text-[15px] font-semibold leading-snug">{v.title}</VideoLink>
          <p className="mt-1 text-xs tabular-nums text-muted">
            Meant for <span className="font-semibold text-ink">{fmtDateTime(h.slotAt)} IST</span> · {fmtRelative(h.slotAt)} · {v.id}
          </p>
          {h.reason === "missed" && h.error && <p className="mt-1 line-clamp-2 text-xs text-critical-text">Last error: {h.error}</p>}
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-ink2">Description and tags</summary>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{description}</p>
            {v.tags.length > 0 && <p className="mt-2 text-xs text-ink2">Tags: {v.tags.join(", ")}</p>}
          </details>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={v.fileUrl} download={`${fileSlug(v)}.mp4`} className={buttonClass("default", false, "tap")}><Download aria-hidden className="size-4" />Download video</a>
            <a href={v.thumbnailUrl} download={`${fileSlug(v)}-thumbnail.png`} className={buttonClass("default")}><ImageDown aria-hidden className="size-4" />Thumbnail</a>
            <CopyButton text={v.title} label="Copy title" />
            <CopyButton text={description} label="Copy description" />
            <CopyButton text={v.tags.join(", ")} label="Copy tags" />
            {hashtags && <CopyButton text={hashtags} label="Copy hashtags" />}
            <MarkUploaded v={v} />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * "Upload by hand": every channel's ready videos whose slot the publisher couldn't fill, mostly because
 * the day's YouTube API quota ran out, oldest slot first. Hidden when there are none.
 */
export function HandUploads() {
  const { data } = useHandUploads();
  if (!data?.length) return null;
  const quota = data.some((h) => h.reason === "quota");
  return (
    <section id="by-hand" className="mb-8 scroll-mt-20">
      <Card accent="sun" icon={Hand} title={`Upload by hand · ${data.length}`}
        description={`${quota ? "The day's YouTube API quota ran out, so the bot couldn't upload these. " : ""}All channels, oldest slot first. Upload each in YouTube Studio (schedule it for its slot or later), then press Mark as uploaded and paste the link so the bot never uploads it again. One you leave goes up by itself after the quota resets (13:30 IST).`}>
        <ul>{data.map((h) => <Item key={h.video.id} h={h} />)}</ul>
      </Card>
    </section>
  );
}

/** How many videos wait to be uploaded by hand, and whether any is a quota miss (for the sidebar and Overview). */
export function useHandUploadCount(): { n: number; quota: boolean } {
  const { data } = useHandUploads();
  return { n: data?.length ?? 0, quota: (data ?? []).some((h) => h.reason === "quota") };
}
