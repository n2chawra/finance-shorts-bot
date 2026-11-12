"use client";

import { Crown, Shuffle, XCircle } from "lucide-react";
import { motion } from "motion/react";

import { Card } from "@/components/ui";
import { fmtNum, fmtRelative, titleCase } from "@/lib/format";
import type { Agents } from "@/lib/schemas";

const EASE = [0.16, 1, 0.3, 1] as const;
const label = (s: string) => titleCase(s.replace(/_/g, " "));

/** The variant system (improvement/arms.py): what each dimension's options get in 48-hour views, which
 * is the default, which were dropped, and the latest verdicts. */
export function VariantsCard({ data }: { data: Agents }) {
  if (!data.variants.length) return null;
  return (
    <Card title="What's winning" icon={Shuffle} accent="lime" className="mt-5"
      description={`Every Short tries the best options; some test others. Median views 48 h after publishing.${data.variantsAt ? ` Judged ${fmtRelative(data.variantsAt)}.` : ""}`}>
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {data.variants.map((v) => {
          const max = Math.max(1, ...v.options.map((o) => o.median ?? 0));
          return (
            <div key={v.dimension}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="font-display text-[14px] uppercase">{label(v.dimension)}</span>
                <span className="truncate text-[11px] text-muted">{v.why}</span>
              </div>
              <ul className="space-y-1.5">
                {v.options.map((o, i) => {
                  const isDefault = o.option === v.default, dropped = v.dropped.includes(o.option);
                  return (
                    <li key={o.option} className={`relative flex items-center gap-2 overflow-hidden border-2 border-edge bg-surface px-2 py-1.5 text-[13px] font-semibold ${dropped ? "nb-stripes opacity-60" : ""}`}>
                      <motion.span aria-hidden className={`absolute inset-y-0 left-0 border-r-2 border-edge ${isDefault ? "bg-lime" : dropped ? "bg-surface-2" : "bg-sky/60"}`}
                        initial={{ width: 0 }} animate={{ width: `${Math.max(((o.median ?? 0) / max) * 100, 2)}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }} />
                      <span className="relative flex min-w-0 flex-1 items-center gap-1.5 truncate">
                        {isDefault && <Crown aria-label="Default" className="size-3.5 shrink-0 text-good-text" />}
                        {dropped && <XCircle aria-label="Dropped" className="size-3.5 shrink-0 text-critical-text" />}
                        <span className={dropped ? "line-through" : ""}>{label(o.option)}</span>
                      </span>
                      <span className="relative text-[11px] tabular-nums text-muted">n={o.n}</span>
                      <span className="relative w-12 text-right font-display tabular-nums">{o.median === null ? "—" : fmtNum(o.median)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      {data.variantLog.length > 0 && (
        <div className="mt-5 border-t-2 border-line pt-3">
          <h3 className="nb-label mb-2 text-muted">Latest verdicts</h3>
          <ul className="space-y-1 text-[13px]">
            {data.variantLog.slice(0, 6).map((e, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-2">
                <span className={`border-2 border-edge px-1.5 text-[11px] font-bold uppercase text-on-accent ${e.verdict === "promote" ? "bg-mint" : "bg-red"}`}>{e.verdict === "promote" ? "Promoted" : "Dropped"}</span>
                <span>{label(e.dimension)}: {label(e.option)}</span>
                <span className="text-xs tabular-nums text-muted">{e.ratio}× · {e.n} videos · {Math.round(e.confidence * 100)}% sure · {fmtRelative(e.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
