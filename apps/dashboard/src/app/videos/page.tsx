"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Card, Empty, ErrorNote, Loading, PageHeader, StatusBadge, Thumb, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useTemplates, useVideos } from "@/lib/queries";
import { VIDEO_STATUSES } from "@/lib/schemas";

const CATEGORIES = ["compounding", "sip", "retirement", "nps", "ppf", "tax", "index_funds", "inflation", "fd", "credit_card", "gold", "insurance", "home_loan", "emi", "spending", "subscriptions", "emergency_fund"];
const field = "min-h-10 rounded-lg border border-ring bg-surface px-3 text-sm";

function Videos() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const filters = { status: params.get("status") ?? "", template: params.get("template") ?? "", category: params.get("category") ?? "", q: params.get("q") ?? "" };
  const { data, error, isLoading } = useVideos(filters);
  const templates = useTemplates();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/videos${next.size ? `?${next}` : ""}`);
  };

  return (
    <>
      <PageHeader title="Videos" sub={data ? `${data.length} shown` : undefined} />
      <form className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); set("q", q.trim()); }}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search title, topic, id"
          aria-label="Search videos" className={`${field} col-span-2 md:col-span-1`} />
        <select aria-label="Status" className={field} value={filters.status} onChange={(e) => set("status", e.target.value)}>
          <option value="">All statuses</option>
          {VIDEO_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <select aria-label="Template" className={field} value={filters.template} onChange={(e) => set("template", e.target.value)}>
          <option value="">All templates</option>
          {templates.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select aria-label="Topic" className={`${field} col-span-2 md:col-span-1`} value={filters.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">All topics</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </select>
      </form>

      {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0 ? <Card><Empty>No videos match these filters.</Empty></Card> : (
        <Card className="!p-0">
          <ul>
            {data.map((v) => (
              <li key={v.id} className="flex items-center gap-3 border-b border-line p-3 last:border-0">
                <Thumb src={v.thumbnailUrl} alt="" className="w-11" />
                <div className="min-w-0 flex-1">
                  <VideoLink id={v.id} className="block truncate text-sm font-medium">{v.title}</VideoLink>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <StatusBadge status={v.status} />
                    <span>{titleCase(v.templateId)}</span>
                    <span>· {titleCase(v.topic.category)}</span>
                    <span>· {fmtDateTime(v.upload?.publishAt ?? v.createdAt)}</span>
                  </div>
                </div>
                {v.totals && (
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">{fmtCompact(v.totals.views)}</div>
                    <div className="text-xs text-muted">views</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

export default function VideosPage() {
  return <Suspense fallback={<Loading />}><Videos /></Suspense>;
}
