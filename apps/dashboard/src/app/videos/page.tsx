/* eslint-disable @next/next/no-img-element */
"use client";

import { Film, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, SelectField, StatusBadge, fieldClass } from "@/components/ui";
import { originLine } from "@/components/origin";
import { fmtCompact, fmtDateTime, titleCase } from "@/lib/format";
import { useOverview, useTemplates, useVideos } from "@/lib/queries";

const TAB_FILL: Record<string, string> = { "": "bg-lime", queued: "bg-grape", scheduled: "bg-sky", published: "bg-mint", failed: "bg-red" };

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

      <div className="no-scrollbar scroll-fade-x -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1.5 md:mx-0 md:px-0" role="tablist" aria-label="Status">
        {TABS.map((t) => {
          const on = filters.status === t.value;
          const n = t.value ? counts?.[t.value] : total;
          return (
            <button key={t.label} type="button" role="tab" aria-selected={on} onClick={() => set("status", t.value)}
              className={`flex h-10 shrink-0 items-center gap-2 border-2 border-edge px-3 text-[12.5px] font-bold uppercase tracking-wide transition-transform ${on ? `${TAB_FILL[t.value]} text-on-accent shadow-[3px_3px_0_0_var(--hard)]` : "bg-surface text-ink2 hover:-translate-y-0.5 hover:text-ink"}`}>
              {t.label}
              {n !== undefined && <span className="border-2 border-edge bg-surface px-1 font-mono text-[11px] tabular-nums text-ink">{n}</span>}
            </button>
          );
        })}
      </div>

      <form className="nb mb-6 grid grid-cols-2 gap-3 bg-surface-2 p-3 md:grid-cols-[1fr_220px_220px]" onSubmit={(e) => { e.preventDefault(); set("q", q.trim()); }}>
        <label className="relative col-span-2 md:col-span-1">
          <Search aria-hidden strokeWidth={3} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set("q", q.trim())} placeholder="Search by title, topic or id"
            aria-label="Search videos" className={`${fieldClass} pl-9`} />
        </label>
        <SelectField label="Template" all="All templates" value={filters.template} onChange={(v) => set("template", v)} options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
        <SelectField label="Topic" all="All topics" value={filters.category} onChange={(v) => set("category", v)} options={categories.map((c) => ({ value: c, label: everything.data ? `${titleCase(c)} (${perCategory.get(c) ?? 0})` : titleCase(c) }))} />
      </form>

      {isLoading ? <Loading /> : error || !data ? <ErrorNote error={error} /> : data.length === 0 ? <Card><Empty icon={Film} title="No videos match">Try another status, template or search.</Empty></Card> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {data.map((v, i) => (
            <motion.li key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 18) * 0.02 }}
              className="nb nb-press group relative flex flex-col bg-surface">
              <div className={`relative border-b-2 border-edge ${v.format === "long" ? "bg-ink" : "bg-surface-2"}`}>
                <img src={v.thumbnailUrl} alt="" loading="lazy" className={`aspect-[4/5] w-full ${v.format === "long" ? "object-contain" : "object-cover object-top"}`} />
                <span className="absolute left-0 top-0 border-b-2 border-r-2 border-edge bg-surface"><StatusBadge status={v.status} /></span>
                {v.format === "long" && <span className="absolute right-0 top-0 border-b-2 border-l-2 border-edge"><Badge tone="info">Long</Badge></span>}
                {v.totals && (
                  <span className="absolute bottom-0 right-0 border-l-2 border-t-2 border-edge bg-lime px-2 py-1 text-on-accent">
                    <span className="font-display text-[17px] tabular-nums">{fmtCompact(v.totals.views)}</span><span className="nb-label ml-1 !text-[9px]">views</span>
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                {/* the whole card opens the video; the title is the link */}
                <Link href={`/videos/${v.id}`} className="line-clamp-2 text-[13.5px] font-bold leading-snug after:absolute after:inset-0">{v.title}</Link>
                {originLine(v.origin) && <span className="mt-1 line-clamp-2 text-[11.5px] font-medium text-ink2" title={v.origin?.why ?? undefined}>{originLine(v.origin)}</span>}
                <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-2.5 font-mono text-[10.5px] font-bold uppercase text-muted">
                  <span>{v.id}</span><span>·</span><span>{titleCase(v.topic.category)}</span>
                </span>
                <span className="font-mono text-[10.5px] font-bold uppercase text-muted">{fmtDateTime(v.upload?.publishAt ?? v.createdAt)}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      {data && data.length > 0 && <p className="nb-label mt-5 text-muted">{data.length} shown</p>}
    </>
  );
}

export default function VideosPage() {
  return <Suspense fallback={<Loading />}><Videos /></Suspense>;
}
