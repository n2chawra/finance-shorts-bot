"use client";

import { CalendarDays, Eye, Film, Heart, MessageCircle, Percent, ThumbsDown, Trophy, TrendingUp, UserPlus } from "lucide-react";
import { useState } from "react";

import { BarChart, BarList, DataTable, LineChart } from "@/components/charts";
import { Card, Delta, Empty, ErrorNote, Loading, Num, PageHeader, Segmented, Stagger, Stat } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtNum, titleCase } from "@/lib/format";
import { useAnalytics } from "@/lib/queries";
import { LOVED_MIN_VIEWS, perThousand } from "@/lib/schemas";

type Range = "7" | "14" | "28";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** % change of the last `n` days against the `n` before them; null when there is no earlier period. */
const change = (xs: number[], n: number) => {
  if (xs.length < n * 2) return null;
  const prev = sum(xs.slice(-2 * n, -n));
  return prev > 0 ? ((sum(xs.slice(-n)) - prev) / prev) * 100 : null;
};

export default function AnalyticsPage() {
  const { data, error, isLoading } = useAnalytics();
  const [range, setRange] = useState<Range>("28");
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const n = Number(range);
  const days = data.daily.slice(-n);
  const allViews = data.daily.map((d) => d.views);
  const allSubs = data.daily.map((d) => d.subsGained);
  const views = days.map((d) => ({ label: fmtDayKey(d.day), value: d.views, estimated: d.estimated }));
  const subs = days.map((d) => ({ label: fmtDayKey(d.day), value: d.subsGained, estimated: d.estimated }));
  const likes = days.map((d) => ({ label: fmtDayKey(d.day), value: d.likes, estimated: d.estimated }));
  const comments = days.map((d) => d.comments);
  const allLikes = data.daily.map((d) => d.likes);
  const allComments = data.daily.map((d) => d.comments);
  const loved = perThousand(data.totals);
  const anyEst = days.some((d) => d.estimated);
  const est = (p: { label: string; estimated?: boolean }) => (p.estimated ? `${p.label} (est.)` : p.label);
  const best = [...data.weekday].sort((a, b) => b.avgViews - a.avgViews)[0];

  return (
    <Stagger>
      <PageHeader title="Analytics" sub={anyEst
        ? "Shaded days are estimated from YouTube's live counts until YouTube Analytics catches up (it runs a few days behind)"
        : "YouTube Analytics daily numbers and live lifetime counts"}>
        <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "28", label: "28 days" }]} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label={`Views · ${n} days`} icon={Eye} value={<Num value={sum(views.map((p) => p.value))} fmt={fmtCompact} />}
          delta={<Delta value={change(allViews, n)} />} sub={n < 28 ? `vs previous ${n} days` : "last 28 days"} />
        <Stat label={`Subscribers · ${n} days`} icon={UserPlus} value={<Num value={sum(subs.map((p) => p.value))} fmt={(x) => `+${fmtNum(x)}`} />}
          delta={<Delta value={change(allSubs, n)} />} sub={n < 28 ? `vs previous ${n} days` : "last 28 days"} />
        <Stat label={`Likes · ${n} days`} icon={Heart} value={<Num value={sum(likes.map((p) => p.value))} fmt={fmtCompact} />}
          delta={<Delta value={change(allLikes, n)} />} sub={`${fmtNum(data.totals.likes)} lifetime`} />
        <Stat label={`Comments · ${n} days`} icon={MessageCircle} value={<Num value={sum(comments)} fmt={fmtCompact} />}
          delta={<Delta value={change(allComments, n)} />} sub={`${fmtNum(data.totals.comments)} lifetime`} />
        <Stat label="Lifetime views" icon={Film} value={<Num value={data.totals.views} fmt={fmtCompact} />}
          sub={`${data.totals.videos} published video${data.totals.videos === 1 ? "" : "s"} · ${loved.toFixed(1)} likes + comments per 1K views`} />
        <Stat label="Avg viewed" icon={Percent} value={<Num value={data.totals.avgViewPct} fmt={(x) => `${x.toFixed(1)}%`} />} sub="of each video, on average" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Views per day" icon={TrendingUp}>
          <LineChart data={views} fmt={fmtCompact} fmtFull={(x) => `${fmtNum(x)} views`} />
          <DataTable head={["Day", "Views"]} rows={views.map((p) => [est(p), fmtNum(p.value)])} />
        </Card>
        <Card title="Subscribers gained per day" icon={UserPlus}>
          <LineChart data={subs} fmt={fmtCompact} fmtFull={(x) => `+${fmtNum(x)} subscribers`} color="var(--good)" />
          <DataTable head={["Day", "Subscribers"]} rows={subs.map((p) => [est(p), fmtNum(p.value)])} />
        </Card>
      </div>

      <Card title="Likes and comments per day" icon={Heart} className="mt-3"
        description="The clearest sign that people love a video: they took a second to react.">
        <LineChart data={likes} fmt={fmtCompact} fmtFull={(x) => `${fmtNum(x)} likes`} color="var(--danger)" />
        <DataTable head={["Day", "Likes · comments"]} rows={likes.map((p, i) => [est(p), `${fmtNum(p.value)} · ${fmtNum(comments[i] ?? 0)}`])} />
      </Card>

      <Card title="Average views by upload day" icon={CalendarDays} className="mt-3"
        description={best?.avgViews ? `Best so far: ${best.weekday}. Lifetime views of each video, grouped by the weekday it went out.` : "Lifetime views of each video, grouped by the weekday it went out."}>
        <BarChart data={data.weekday.map((w) => ({ label: w.weekday, value: w.avgViews }))} fmt={fmtCompact} fmtFull={(x) => `${fmtNum(x)} avg views`} />
        <DataTable head={["Upload day", "Avg views (uploads)"]} rows={data.weekday.map((w) => [w.weekday, `${fmtNum(w.avgViews)} (${w.uploads})`])} />
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Best videos" icon={Trophy} description="Lifetime views">
          {data.top.length ? <BarList fmt={fmtNum} rows={data.top.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: `${titleCase(v.templateId)} · ${fmtNum(v.likes)} likes · ${fmtNum(v.comments)} comments`, href: `/videos/${v.videoId}` }))} />
            : <Empty icon={Trophy}>Nothing published yet.</Empty>}
        </Card>
        <Card title="Most loved videos" icon={Heart} className="lg:col-span-2"
          description={`Likes + comments per 1,000 views, for videos with at least ${LOVED_MIN_VIEWS} views: what viewers cared about, not just what the feed pushed`}>
          {data.loved.length ? <BarList fmt={(x) => x.toFixed(1)} rows={data.loved.map((v) => ({ key: v.videoId, label: v.title, value: perThousand(v), sub: `${fmtNum(v.likes)} likes · ${fmtNum(v.comments)} comments · ${fmtNum(v.views)} views`, href: `/videos/${v.videoId}` }))} />
            : <Empty icon={Heart}>{`Shown once a video passes ${LOVED_MIN_VIEWS} views.`}</Empty>}
        </Card>
        <Card title="Weakest videos" icon={ThumbsDown} description="Same scale as the best, so the gap is honest">
          {data.bottom.length ? <BarList fmt={fmtNum} scaleMax={data.top[0]?.views} rows={data.bottom.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
            : <Empty icon={ThumbsDown}>Shown once more than five videos are out.</Empty>}
        </Card>
      </div>
    </Stagger>
  );
}
