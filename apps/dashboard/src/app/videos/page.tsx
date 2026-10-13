"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Card, Empty, ErrorNote, Loading, PageHeader, SelectField, StatusBadge, Thumb, VideoLink } from "@/components/ui";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useTemplates, useVideos } from "@/lib/queries";
import { VIDEO_STATUSES } from "@/lib/schemas";

const CATEGORIES = ["compounding", "sip", "retirement", "nps", "ppf", "tax", "index_funds", "inflation", "fd", "credit_card", "gold", "insurance", "home_loan", "emi", "spending", "subscriptions", "emergency_fund"];

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
        <label className="relative col-span-2 md:col-span-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search title, topic, id"
            aria-label="Search videos" className="min-h-10 w-full rounded-lg border border-ring bg-surface pl-9 pr-3 text-sm shadow-card placeholder:text-muted" />
        </label>
        <SelectField label="Status" all="All statuses" value={filters.status} onChange={(v) => set("status", v)} options={VIDEO_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))} />
        <SelectField label="Template" all="All templates" value={filters.template} onChange={(v) => set("template", v)} options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
        <div className="col-span-2 md:col-span-1">
          <SelectField label="Topic" all="All topics" value={filters.category} onChange={(v) => set("category", v)} options={CATEGORIES.map((c) => ({ value: c, label: titleCase(c) }))} />
        </div>
      </form>

      {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0 ? <Card><Empty>No videos match these filters.</Empty></Card> : (
        <Card className="!p-0 overflow-hidden">
          <ul>
            {data.map((v, i) => (
              <motion.li key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i, 14) * 0.025 }}
                className="flex items-center gap-3 border-b border-line p-3 transition-colors last:border-0 hover:bg-wash md:px-4">
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
              </motion.li>
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
