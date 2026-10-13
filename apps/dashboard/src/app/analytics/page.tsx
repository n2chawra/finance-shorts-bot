"use client";

import { BarChart, BarList, DataTable, LineChart } from "@/components/charts";
import { CalendarDays, Eye, Film, Percent, ThumbsDown, Trophy, TrendingUp, UserPlus } from "lucide-react";

import { Card, ErrorNote, Loading, Num, PageHeader, Tile } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtNum, titleCase } from "@/lib/format";
import { useAnalytics } from "@/lib/queries";

export default function AnalyticsPage() {
  const { data, error, isLoading } = useAnalytics();
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const views = data.daily.map((d) => ({ label: fmtDayKey(d.day), value: d.views }));
  const subs = data.daily.map((d) => ({ label: fmtDayKey(d.day), value: d.subsGained }));
  const best = [...data.weekday].sort((a, b) => b.avgViews - a.avgViews)[0];

  return (
    <>
      <PageHeader title="Analytics" sub="Last 28 days" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Tile label="Views" icon={Eye} tone="info" value={<Num value={data.totals.views} fmt={fmtCompact} />} sub={fmtNum(data.totals.views)} />
        <Tile label="Subscribers gained" icon={UserPlus} tone="good" value={<Num value={data.totals.subsGained} fmt={(n) => `+${fmtNum(n)}`} />} />
        <Tile label="Videos published" icon={Film} value={<Num value={data.totals.videos} fmt={(n) => String(Math.round(n))} />} />
        <Tile label="Avg viewed" icon={Percent} tone="warning" value={<Num value={data.totals.avgViewPct} fmt={(n) => `${n.toFixed(1)}%`} />} sub="of each video" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Views per day" icon={TrendingUp}>
          <LineChart data={views} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} />
          <DataTable head={["Day", "Views"]} rows={views.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
        <Card title="Subscribers gained per day" icon={UserPlus}>
          <LineChart data={subs} fmt={fmtCompact} fmtFull={(n) => `+${fmtNum(n)} subscribers`} />
          <DataTable head={["Day", "Subscribers"]} rows={subs.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
      </div>

      <Card title={`Average views by upload day${best?.avgViews ? ` · best: ${best.weekday}` : ""}`} icon={CalendarDays} className="mt-4">
        <BarChart data={data.weekday.map((w) => ({ label: w.weekday, value: w.avgViews }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} avg views`} />
        <DataTable head={["Upload day", "Avg views (uploads)"]} rows={data.weekday.map((w) => [w.weekday, `${fmtNum(w.avgViews)} (${w.uploads})`])} />
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Best videos" icon={Trophy}>
          <BarList fmt={fmtNum} rows={data.top.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
        </Card>
        <Card title="Weakest videos (same scale)" icon={ThumbsDown}>
          <BarList fmt={fmtNum} scaleMax={data.top[0]?.views} rows={data.bottom.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
        </Card>
      </div>
    </>
  );
}
