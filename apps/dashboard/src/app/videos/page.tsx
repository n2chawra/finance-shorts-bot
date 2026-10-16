"use client";

import { Film, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, SelectField, StatusBadge, Thumb, fieldClass } from "@/components/ui";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useOverview, useTemplates, useVideos } from "@/lib/queries";

const CATEGORIES = ["compounding", "sip", "retirement", "nps", "ppf", "tax", "index_funds", "inflation", "fd", "credit_card", "gold", "insurance", "home_loan", "emi", "spending", "subscriptions", "emergency_fund"];
const TABS = [
  { value: "", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

function Videos() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const filters = { status: params.get("status") ?? "", template: params.get("template") ?? "", category: params.get("category") ?? "", q: params.get("q") ?? "" };
  const { data, error, isLoading } = useVideos(filters);
  const templates = useTemplates();
  const counts = useOverview().data?.counts;

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/videos${next.size ? `?${next}` : ""}`);
  };
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;

  return (
    <>
      <PageHeader title="Videos" sub="Everything the routines have made, newest first" />

      <div className="no-scrollbar -mx-4 mb-3 flex gap-1 overflow-x-auto border-b border-ring px-4 md:mx-0 md:px-0" role="tablist" aria-label="Status">
        {TABS.map((t) => {
          const on = filters.status === t.value;
          const n = t.value ? counts?.[t.value] : total;
          return (
            <button key={t.label} type="button" role="tab" aria-selected={on} onClick={() => set("status", t.value)}
              className={`relative flex h-9 shrink-0 items-center gap-1.5 px-2.5 text-[13px] transition-colors ${on ? "font-medium text-ink" : "text-ink2 hover:text-ink"}`}>
              {t.label}
              {n !== undefined && <span className="rounded-md bg-wash-2 px-1.5 text-[11px] tabular-nums text-ink2">{n}</span>}
              {on && <motion.span layoutId="video-tab" className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-ink" />}
            </button>
          );
        })}
      </div>

      <form className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-[1fr_200px_200px]" onSubmit={(e) => { e.preventDefault(); set("q", q.trim()); }}>
        <label className="relative col-span-2 md:col-span-1">
          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search by title, topic or id"
            aria-label="Search videos" className={`${fieldClass} pl-8`} />
        </label>
        <SelectField label="Template" all="All templates" value={filters.template} onChange={(v) => set("template", v)} options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
        <SelectField label="Topic" all="All topics" value={filters.category} onChange={(v) => set("category", v)} options={CATEGORIES.map((c) => ({ value: c, label: titleCase(c) }))} />
      </form>

      {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0 ? <Card><Empty icon={Film} title="No videos match">Try another status, template or search.</Empty></Card> : (
        <Card flush>
          <table className="w-full text-left text-[13px]">
            <thead className="hidden border-b border-line bg-surface-2 text-xs text-muted md:table-header-group">
              <tr>
                <th className="px-4 py-2 font-medium">Video</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="hidden px-3 py-2 font-medium lg:table-cell">Template</th>
                <th className="hidden px-3 py-2 font-medium xl:table-cell">Topic</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-4 py-2 text-right font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: Math.min(i, 16) * 0.015 }}
                  onClick={() => router.push(`/videos/${v.id}`)}
                  className="group flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-3 py-2.5 transition-colors last:border-0 hover:bg-wash md:table-row md:px-0 md:py-0">
                  <td className="flex min-w-0 flex-1 items-center gap-3 md:px-4 md:py-2.5">
                    <Thumb src={v.thumbnailUrl} alt="" className="w-8" />
                    <div className="min-w-0">
                      <Link href={`/videos/${v.id}`} onClick={(e) => e.stopPropagation()} className="block max-w-[46ch] truncate font-medium group-hover:text-brand-text">{v.title}</Link>
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted">{v.id}</span>
                        {v.format === "long" && <Badge tone="brand">Long</Badge>}
                      </span>
                    </div>
                  </td>
                  <td className="md:px-3 md:py-2.5"><StatusBadge status={v.status} /></td>
                  <td className="hidden text-ink2 md:px-3 md:py-2.5 lg:table-cell">{titleCase(v.templateId)}</td>
                  <td className="hidden text-ink2 md:px-3 md:py-2.5 xl:table-cell">{titleCase(v.topic.category)}</td>
                  <td className="whitespace-nowrap text-xs text-muted md:px-3 md:py-2.5 md:text-[13px] md:text-ink2">{fmtDateTime(v.upload?.publishAt ?? v.createdAt)}</td>
                  <td className="ml-auto whitespace-nowrap text-right tabular-nums md:px-4 md:py-2.5">{v.totals ? <span className="font-medium">{fmtCompact(v.totals.views)}</span> : <span className="text-muted">—</span>}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {data && data.length > 0 && <p className="mt-3 text-xs text-muted">{data.length} shown</p>}
    </>
  );
}

export default function VideosPage() {
  return <Suspense fallback={<Loading />}><Videos /></Suspense>;
}
