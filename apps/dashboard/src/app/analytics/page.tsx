"use client";

import { BarChart, BarList, DataTable, LineChart } from "@/components/charts";
import { Card, ErrorNote, Loading, PageHeader, Tile } from "@/components/ui";
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
        <Tile label="Views" value={fmtCompact(data.totals.views)} sub={fmtNum(data.totals.views)} />
        <Tile label="Subscribers gained" value={`+${fmtNum(data.totals.subsGained)}`} />
        <Tile label="Videos published" value={String(data.totals.videos)} />
        <Tile label="Avg viewed" value={`${data.totals.avgViewPct}%`} sub="of each video" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Views per day">
          <LineChart data={views} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} views`} />
          <DataTable head={["Day", "Views"]} rows={views.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
        <Card title="Subscribers gained per day">
          <LineChart data={subs} fmt={fmtCompact} fmtFull={(n) => `+${fmtNum(n)} subscribers`} />
          <DataTable head={["Day", "Subscribers"]} rows={subs.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
      </div>

      <Card title={`Average views by upload day${best?.avgViews ? ` · best: ${best.weekday}` : ""}`} className="mt-4">
        <BarChart data={data.weekday.map((w) => ({ label: w.weekday, value: w.avgViews }))} fmt={fmtCompact} fmtFull={(n) => `${fmtNum(n)} avg views`} />
        <DataTable head={["Upload day", "Avg views (uploads)"]} rows={data.weekday.map((w) => [w.weekday, `${fmtNum(w.avgViews)} (${w.uploads})`])} />
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Best videos">
          <BarList fmt={fmtNum} rows={data.top.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
        </Card>
        <Card title="Weakest videos (same scale)">
          <BarList fmt={fmtNum} scaleMax={data.top[0]?.views} rows={data.bottom.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
        </Card>
      </div>
    </>
  );
}
