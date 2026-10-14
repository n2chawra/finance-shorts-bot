"use client";

import { CalendarDays, Eye, Film, Percent, ThumbsDown, Trophy, TrendingUp, UserPlus } from "lucide-react";
import { useState } from "react";

import { BarChart, BarList, DataTable, LineChart } from "@/components/charts";
import { Card, Delta, Empty, ErrorNote, Loading, Num, PageHeader, Segmented, Stagger, Stat } from "@/components/ui";
import { fmtCompact, fmtDayKey, fmtNum, titleCase } from "@/lib/format";
import { useAnalytics } from "@/lib/queries";

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
  const views = days.map((d) => ({ label: fmtDayKey(d.day), value: d.views }));
  const subs = days.map((d) => ({ label: fmtDayKey(d.day), value: d.subsGained }));
  const best = [...data.weekday].sort((a, b) => b.avgViews - a.avgViews)[0];

  return (
    <Stagger>
      <PageHeader title="Analytics" sub="YouTube Analytics daily numbers (1–2 days behind) and live lifetime counts">
        <Segmented label="Range" value={range} onChange={setRange} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "28", label: "28 days" }]} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={`Views · ${n} days`} icon={Eye} value={<Num value={sum(views.map((p) => p.value))} fmt={fmtCompact} />}
          delta={<Delta value={change(allViews, n)} />} sub={n < 28 ? `vs previous ${n} days` : "last 28 days"} />
        <Stat label={`Subscribers · ${n} days`} icon={UserPlus} value={<Num value={sum(subs.map((p) => p.value))} fmt={(x) => `+${fmtNum(x)}`} />}
          delta={<Delta value={change(allSubs, n)} />} sub={n < 28 ? `vs previous ${n} days` : "last 28 days"} />
        <Stat label="Lifetime views" icon={Film} value={<Num value={data.totals.views} fmt={fmtCompact} />} sub={`${data.totals.videos} published video${data.totals.videos === 1 ? "" : "s"} · live`} />
        <Stat label="Avg viewed" icon={Percent} value={<Num value={data.totals.avgViewPct} fmt={(x) => `${x.toFixed(1)}%`} />} sub="of each video, on average" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Views per day" icon={TrendingUp}>
          <LineChart data={views} fmt={fmtCompact} fmtFull={(x) => `${fmtNum(x)} views`} />
          <DataTable head={["Day", "Views"]} rows={views.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
        <Card title="Subscribers gained per day" icon={UserPlus}>
          <LineChart data={subs} fmt={fmtCompact} fmtFull={(x) => `+${fmtNum(x)} subscribers`} color="var(--good)" />
          <DataTable head={["Day", "Subscribers"]} rows={subs.map((p) => [p.label, fmtNum(p.value)])} />
        </Card>
      </div>

      <Card title="Average views by upload day" icon={CalendarDays} className="mt-3"
        description={best?.avgViews ? `Best so far: ${best.weekday}. Lifetime views of each video, grouped by the weekday it went out.` : "Lifetime views of each video, grouped by the weekday it went out."}>
        <BarChart data={data.weekday.map((w) => ({ label: w.weekday, value: w.avgViews }))} fmt={fmtCompact} fmtFull={(x) => `${fmtNum(x)} avg views`} />
        <DataTable head={["Upload day", "Avg views (uploads)"]} rows={data.weekday.map((w) => [w.weekday, `${fmtNum(w.avgViews)} (${w.uploads})`])} />
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Best videos" icon={Trophy} description="Lifetime views">
          {data.top.length ? <BarList fmt={fmtNum} rows={data.top.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
            : <Empty icon={Trophy}>Nothing published yet.</Empty>}
        </Card>
        <Card title="Weakest videos" icon={ThumbsDown} description="Same scale as the best, so the gap is honest">
          {data.bottom.length ? <BarList fmt={fmtNum} scaleMax={data.top[0]?.views} rows={data.bottom.map((v) => ({ key: v.videoId, label: v.title, value: v.views, sub: titleCase(v.templateId), href: `/videos/${v.videoId}` }))} />
            : <Empty icon={ThumbsDown}>Shown once more than five videos are out.</Empty>}
        </Card>
      </div>
    </Stagger>
  );
}
