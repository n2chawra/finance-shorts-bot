"use client";

import { Radio } from "lucide-react";
import Link from "next/link";

import { fmtNum, fmtRelative } from "@/lib/format";
import { useStudio } from "@/lib/queries";

/**
 * Views in the last hour and last 24 h from the hourly public-counter snapshots (LiveSnapshot, via the
 * Studio realtime block), with a pulsing live dot. The Studio query refetches every 60 s.
 */
export function LiveViews() {
  const { data } = useStudio("7", "all");
  const rt = data?.realtime;
  if (!rt) return null;
  const last24 = rt.hours.slice(-24).reduce((a, h) => a + h.views, 0);
  const bars = rt.hours.slice(-24).map((h) => h.views);
  const peak = Math.max(1, ...bars);
  return (
    <Link href="/analytics" data-testid="live-views"
      className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-ring bg-surface px-4 py-3 shadow-xs transition-colors hover:border-ink/20">
      <span className="flex items-center gap-2 text-[12.5px] font-medium text-ink2">
        <span className="relative flex size-2.5"><span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-good opacity-60 motion-reduce:hidden" /><span className="relative size-2.5 rounded-full bg-good" /></span>
        <Radio aria-hidden className="size-3.5" />Live
      </span>
      <span><span className="text-[20px] font-semibold tabular-nums">{fmtNum(rt.last1)}</span><span className="ml-1.5 text-[12.5px] text-muted">views last hour</span></span>
      <span><span className="text-[20px] font-semibold tabular-nums">{fmtNum(last24)}</span><span className="ml-1.5 text-[12.5px] text-muted">views last 24 h</span></span>
      <span aria-hidden className="hidden h-7 flex-1 items-end gap-[2px] sm:flex">
        {bars.map((v, i) => <span key={i} className={`min-h-[2px] flex-1 rounded-[2px] ${i === bars.length - 1 ? "bg-good" : "bg-series/50"}`} style={{ height: `${(v / peak) * 100}%` }} />)}
      </span>
      <span className="text-[11.5px] text-muted">{rt.snapshotAt ? `updated ${fmtRelative(rt.snapshotAt)}` : "no snapshot yet"}</span>
    </Link>
  );
}
