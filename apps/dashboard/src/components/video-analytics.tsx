"use client";

import { Activity, Compass, Globe2, MessageSquare, MonitorSmartphone, MousePointerClick, Radio, Search, Share2, Trophy, Users } from "lucide-react";

import { Donut, HourlyBars, RankList, RetentionChart } from "@/components/studio-charts";
import { AiVideoCard, MiniStat, Skeleton, Waiting } from "@/components/studio-parts";
import { Card } from "@/components/ui";
import { fmtNum, fmtRelative } from "@/lib/format";
import { useVideoStudio } from "@/lib/queries";

const pct = (x: number | null, d = 0) => (x === null ? "—" : `${(x * 100).toFixed(d)}%`);
const ratio = (a: number | null, b: number | null) => (a !== null && b ? a / b : null);

/** Everything Studio shows for one video, plus where viewers left matched to the script. */
export function VideoAnalytics({ id }: { id: string }) {
  const { data: d, isLoading } = useVideoStudio(id);
  if (isLoading) return <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-80" /></div>;
  if (!d || !d.published) return null;
  const t = d.totals;
  const b = d.breakdowns;
  const v48 = ratio(d.bench.views48, d.bench.median48);
  const vPct = ratio(d.bench.avgViewPct, d.bench.medianPct);
  return (
    <div className="flex flex-col gap-5">
      {d.ai && <AiVideoCard ai={d.ai} />}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MiniStat label="Rank by views" value={d.bench.rank ? <span>#{d.bench.rank}<span className="text-sm font-normal text-muted"> of {d.bench.of}</span></span> : "—"} />
        <MiniStat label="First 48 h vs typical" value={v48 === null ? "—" : `${v48.toFixed(1)}×`} hint={`median ${fmtNum(d.bench.median48 ?? 0)}`} />
        <MiniStat label="% viewed vs typical" value={vPct === null ? "—" : `${vPct.toFixed(2)}×`} />
        <MiniStat label="Hook hold" value={pct(d.hookHold)} hint={d.format === "long" ? "still watching at 30 s" : "still watching at 3 s"} />
        <MiniStat label="Engaged views" value={t.views ? pct(t.engagedViews / t.views) : "—"} hint="engaged ÷ views, the closest to stayed-to-watch" />
        <MiniStat label="Click-through" value={pct(t.ctr, 1)} hint={t.impressions ? `${fmtNum(t.impressions)} impressions` : "needs the Reporting API"} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MiniStat label="Watch time" value={`${t.watchHours.toFixed(1)} h`} />
        <MiniStat label="Average view" value={`${Math.floor(t.avgViewSec / 60)}:${String(Math.round(t.avgViewSec % 60)).padStart(2, "0")}`} />
        <MiniStat label="Still there at the end" value={pct(d.endHold)} />
        <MiniStat label="Shares" value={fmtNum(t.shares)} />
        <MiniStat label="Subscribers" value={`+${fmtNum(t.subsGained)} / −${fmtNum(t.subsLost)}`} />
        <MiniStat label="Likes per 1K views" value={t.views ? ((t.likes / t.views) * 1000).toFixed(1) : "—"} />
      </div>

      <Card title="Where viewers left" icon={Activity}
        description={d.curve.length ? "The share of viewers still watching at each moment, over the video's own frames. Dashed: the last 10 of its format. Red pins: the steepest drops and what was being said." : undefined}>
        {d.curve.length ? <RetentionChart curve={d.curve} typical={d.typical} drops={d.drops} duration={d.durationSec} previewUrl={d.previewUrl} format={d.format} />
          : <Waiting icon={Activity} title="No retention curve yet">YouTube draws it once the video has enough views, usually a day or two after it goes out.</Waiting>}
        {d.relative.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            Against YouTube&apos;s videos of the same length: {(() => { const avg = d.relative.reduce((a, p) => a + p[1], 0) / d.relative.length; return <b className={avg >= 0.5 ? "text-good-text" : "text-critical-text"}>{avg >= 0.5 ? "above" : "below"} typical ({Math.round(avg * 100)} of 100)</b>; })()}
          </p>
        )}
      </Card>

      <Card title="First 48 hours" icon={Radio} description="Views gained each hour after it went out; dashed is the median of the last 10 of its format">
        {d.hourly.some((x) => x > 0) ? <HourlyBars values={d.hourly} compare={d.typicalHourly} hours={d.hourly.map((_, i) => `hour ${i + 1}`)} height={170} />
          : <Waiting icon={Radio} title="Hourly snapshots start with new uploads">The watchdog records public counters every hour; videos published after that get this chart.</Waiting>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Traffic sources" icon={Compass}>{b.traffic.length ? <Donut slices={b.traffic} size={150} /> : <Waiting icon={Compass} title="Arrives with the daily deep stats">Sources, searches and countries refresh once a day.</Waiting>}</Card>
        <Card title="Countries" icon={Globe2}>{b.country.length ? <RankList slices={b.country} kind="country" max={8} /> : <Waiting icon={Globe2} title="Arrives with the daily deep stats">Countries refresh once a day.</Waiting>}</Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Search terms" icon={Search}>{b.search.length ? <RankList slices={b.search} max={10} /> : <p className="text-[13px] text-muted">No search views yet.</p>}</Card>
        <Card title="Devices" icon={MonitorSmartphone}>{b.device.length ? <RankList slices={b.device} max={5} /> : <p className="text-[13px] text-muted">—</p>}</Card>
        <Card title="Subscribers vs not" icon={Users}>{b.subscribed.length ? <RankList slices={b.subscribed} /> : <p className="text-[13px] text-muted">—</p>}</Card>
      </div>
      {(b.external.length > 0 || b.sharing.length > 0) && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="External sites" icon={MousePointerClick}>{b.external.length ? <RankList slices={b.external} max={8} /> : <p className="text-[13px] text-muted">None.</p>}</Card>
          <Card title="Shared through" icon={Share2}>{b.sharing.length ? <RankList slices={b.sharing} unit="shares" /> : <p className="text-[13px] text-muted">None.</p>}</Card>
        </div>
      )}
      <Card title="Comments" icon={MessageSquare} description="Top-level public comments, most liked first">
        {d.comments.length ? (
          <ul className="divide-y-2 divide-line">
            {d.comments.map((c) => (
              <li key={c.id} className="py-2.5 text-[13px] first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 text-xs text-muted"><span className="font-semibold text-ink2">{c.author}</span>· {fmtRelative(c.publishedAt)}{c.likes > 0 && <span>· {c.likes} likes</span>}{c.replies > 0 && <span>· {c.replies} replies</span>}</div>
                <p className="mt-0.5 whitespace-pre-line">{c.text}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-[13px] text-muted">No comments yet.</p>}
      </Card>
      <p className="text-center text-xs text-muted"><Trophy className="mr-1 inline size-3" />Exact stayed-to-watch for Shorts is only in YouTube Studio; engaged views is the closest the API gives.</p>
    </div>
  );
}
