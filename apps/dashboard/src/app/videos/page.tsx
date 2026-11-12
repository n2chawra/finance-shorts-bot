/* eslint-disable @next/next/no-img-element */
"use client";

import { Eye, Film, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Card, Empty, ErrorNote, Loading, PageHeader, SelectField, StatusBadge, fieldClass } from "@/components/ui";
import { originLine } from "@/components/origin";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useOverview, useTemplates, useVideos } from "@/lib/queries";

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
  const urlQ = params.get("q") ?? "";
  useEffect(() => setQ(urlQ), [urlQ]);   // Back/Forward change the URL: keep the box in step with the list it filters
  const filters = { status: params.get("status") ?? "", template: params.get("template") ?? "", category: params.get("category") ?? "", q: params.get("q") ?? "" };
  const { data, error, isLoading } = useVideos(filters);
  const templates = useTemplates();
  const counts = useOverview().data?.counts;
  // topic options come from the videos themselves: a fixed list missed every category added since
  const everything = useVideos({});
  const categories = [...new Set([...(everything.data ?? []).map((v) => v.topic.category), ...(filters.category ? [filters.category] : [])])].sort();
  // a count beside each topic says which ones the channel leans on and never offers an empty result unawares
  const perCategory = new Map<string, number>();
  for (const v of everything.data ?? []) perCategory.set(v.topic.category, (perCategory.get(v.topic.category) ?? 0) + 1);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/videos${next.size ? `?${next}` : ""}`);
  };
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;

  return (
    <>
      <PageHeader title="Videos" sub="Everything the routines have made, newest first" />

      <div className="no-scrollbar scroll-fade-x mb-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-3 p-1" role="tablist" aria-label="Status">
        {TABS.map((t) => {
          const on = filters.status === t.value;
          const n = t.value ? counts?.[t.value] : total;
          return (
            <button key={t.label} type="button" role="tab" aria-selected={on} onClick={() => set("status", t.value)}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${on ? "bg-surface text-ink shadow-xs" : "text-ink2 hover:text-ink"}`}>
              {t.label}
              {n !== undefined && <span className={`rounded-md px-1.5 text-[11px] tabular-nums ${on ? "bg-brand-soft text-brand-text" : "bg-wash-2 text-muted"}`}>{n}</span>}
            </button>
          );
        })}
      </div>

      <form className="mb-6 grid grid-cols-2 gap-2.5 md:grid-cols-[1fr_220px_220px]" onSubmit={(e) => { e.preventDefault(); set("q", q.trim()); }}>
        <label className="relative col-span-2 md:col-span-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search by title, topic or id"
            aria-label="Search videos" className={`${fieldClass} pl-9`} />
        </label>
        <SelectField label="Template" all="All templates" value={filters.template} onChange={(v) => set("template", v)} options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
        <SelectField label="Topic" all="All topics" value={filters.category} onChange={(v) => set("category", v)} options={categories.map((c) => ({ value: c, label: everything.data ? `${titleCase(c)} (${perCategory.get(c) ?? 0})` : titleCase(c) }))} />
      </form>

      {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0 ? <Card><Empty icon={Film} title="No videos match">Try another status, template or search.</Empty></Card> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {data.map((v, i) => (
            <motion.li key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i, 18) * 0.02 }}
              className="panel hover-raise group relative flex flex-col overflow-hidden bg-surface">
              <div className={`relative ${v.format === "long" ? "bg-[#0a0d13]" : "bg-surface-3"}`}>
                <img src={v.thumbnailUrl} alt="" loading="lazy" className={`aspect-[4/5] w-full ${v.format === "long" ? "object-contain" : "object-cover object-top"}`} />
                <span className="absolute left-2 top-2"><StatusBadge status={v.status} /></span>
                {v.format === "long" && <span className="absolute right-2 top-2 rounded-full bg-[#0a0d13]/75 px-2 py-0.5 text-[11.5px] font-medium text-white backdrop-blur">Long</span>}
                {v.totals && (
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#0a0d13]/75 px-2 py-0.5 text-[11.5px] font-medium text-white backdrop-blur">
                    <Eye aria-hidden className="size-3" />{fmtCompact(v.totals.views)}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                {/* the whole card opens the video; the title is the link */}
                <Link href={`/videos/${v.id}`} className="line-clamp-2 text-[13.5px] font-medium leading-snug after:absolute after:inset-0">{v.title}</Link>
                {originLine(v.origin) && <span className="mt-1 line-clamp-2 text-[12px] text-ink2" title={v.origin?.why ?? undefined}>{originLine(v.origin)}</span>}
                <span className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-3 text-[11.5px] text-muted">
                  <span className="font-mono">{v.id}</span><span aria-hidden>·</span><span>{titleCase(v.topic.category)}</span><span aria-hidden>·</span><span>{fmtDateTime(v.upload?.publishAt ?? v.createdAt)}</span>
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      {data && data.length > 0 && <p className="mt-5 text-xs text-muted">{data.length} shown</p>}
    </>
  );
}

export default function VideosPage() {
  return <Suspense fallback={<Loading />}><Videos /></Suspense>;
}
