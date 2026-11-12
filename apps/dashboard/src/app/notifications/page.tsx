"use client";

import { AlertOctagon, AlertTriangle, BellOff, Check, CheckCheck, CircleCheck, Info, RotateCcw, SlidersHorizontal, Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { type Accent, Badge, Button, Card, Empty, ErrorNote, IconTile, Loading, PageHeader, Stagger, type Tone } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { useNotificationAction, useNotifications } from "@/lib/queries";
import { splitSteps } from "@/lib/steps";
import type { Notification } from "@/lib/schemas";

const SEVERITY: Record<Notification["severity"], { tone: Tone; icon: typeof Info; label: string; bar: string; accent: Accent }> = {
  critical: { tone: "critical", icon: AlertOctagon, label: "Needs you now", bar: "bg-critical", accent: "red" },
  warning: { tone: "warning", icon: AlertTriangle, label: "Needs a look", bar: "bg-warning", accent: "sun" },
  info: { tone: "info", icon: Info, label: "For your information", bar: "bg-series", accent: "sky" },
};

function Steps({ text }: { text: string }) {
  // agents write "1. … 2. …" on one line (policy.md), so numbered steps aren't only split by newlines
  const { intro, steps } = splitSteps(text);
  if (!steps.length) return <p className="whitespace-pre-wrap">{text}</p>;
  return (
    <>
      {intro && <p className="mb-2 whitespace-pre-wrap">{intro}</p>}
      <ol className="flex flex-col gap-1.5">{steps.map((l, i) => (
        <li key={i} className="flex gap-2.5"><span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-ink2 ring-1 ring-ring">{i + 1}</span><span className="min-w-0 whitespace-pre-wrap break-words">{l}</span></li>
      ))}</ol>
    </>
  );
}

const show = (v: unknown): string => (Array.isArray(v) ? v.join(", ") : v === undefined ? "—" : String(v));

/** An agent's proposed setting change: the owner approves (the setting is written) or declines it. */
function Proposal({ p, fix, decision, onDecide, busy }: { p: NonNullable<Notification["proposal"]>; fix: string; decision: Notification["decision"]; onDecide?: (a: "approve" | "decline") => void; busy: boolean }) {
  return (
    <div className="mt-3.5 rounded-xl border border-violet/25 bg-violet-soft p-3.5 text-[13px]">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-violet-text"><SlidersHorizontal aria-hidden className="size-3.5" />Proposed setting change</div>
      <p className="text-xs font-medium tabular-nums"><span>{p.setting}</span>: <span className="text-muted line-through">{show(p.current)}</span> → <span className="font-semibold">{show(p.value)}</span></p>
      {fix && <p className="mt-1 whitespace-pre-wrap text-ink2">{fix}</p>}
      {decision ? <p className="mt-1 text-xs text-muted">{decision === "approved" ? "Approved: the setting was changed." : "Declined: nothing changed."}</p> : onDecide && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Button size="sm" tone="primary" icon={Check} disabled={busy} onClick={() => onDecide("approve")}>Approve</Button>
          <Button size="sm" tone="ghost" icon={X} disabled={busy} onClick={() => onDecide("decline")}>Decline</Button>
        </div>
      )}
    </div>
  );
}

function Item({ n, onResolve, onReopen, onDecide, busy }: { n: Notification; onResolve?: () => void; onReopen?: () => void; onDecide?: (a: "approve" | "decline") => void; busy: boolean }) {
  const s = SEVERITY[n.severity];
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`panel flex overflow-hidden bg-surface ${n.resolvedAt ? "opacity-60" : ""}`}>
      <span aria-hidden className={`w-1 shrink-0 ${s.bar}`} />
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-2 p-4 sm:flex-nowrap md:p-5">
        <IconTile icon={s.icon} accent={s.accent} />
        <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)] sm:basis-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-tight">{n.title}</h3>
            {!n.seenAt && !n.resolvedAt && <span role="img" className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" title="Unread" />}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <Badge tone={s.tone}>{s.label}</Badge>
            <span>from {titleCase(n.source)}</span><span aria-hidden>·</span>
            <span title={fmtDateTime(n.updatedAt)}>{n.resolvedAt ? `resolved ${fmtRelative(n.resolvedAt)}` : `updated ${fmtRelative(n.updatedAt)}`}</span>
          </div>
          <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink2">{n.detail}</p>
          {n.proposal && <Proposal p={n.proposal} fix={n.fix} decision={n.decision} onDecide={n.resolvedAt ? undefined : onDecide} busy={busy} />}
          {!n.resolvedAt && !n.proposal && (
            <div className="mt-3.5 rounded-xl border border-line bg-surface-2 p-3.5 text-[13px] leading-relaxed">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink"><Wrench aria-hidden className="size-3.5 text-muted" />How to fix</div>
              <Steps text={n.fix} />
            </div>
          )}
        </div>
        <div className="w-full shrink-0 pl-11 sm:w-auto sm:pl-0">
          {onResolve && !n.proposal && <Button size="sm" icon={CircleCheck} disabled={busy} onClick={onResolve} title="Close it. It stays closed for a week; if the problem clears and happens again later, it shows right away.">Mark resolved</Button>}
          {onReopen && <Button size="sm" tone="ghost" icon={RotateCcw} disabled={busy} onClick={onReopen}>Reopen</Button>}
        </div>
      </div>
    </motion.li>
  );
}

export default function NotificationsPage() {
  const { data, error, isLoading } = useNotifications();
  const act = useNotificationAction();
  const toast = useToast();
  const marked = useRef(false);

  // opening the page counts as reading what's on it
  useEffect(() => {
    if (!data || marked.current) return;
    const unseen = data.open.filter((n) => !n.seenAt).map((n) => n.id);
    marked.current = true;
    if (unseen.length) act.mutate({ ids: unseen, action: "seen" });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const run = (ids: string[], action: "resolve" | "reopen" | "approve" | "decline", done: string, undo?: () => void) =>
    act.mutate({ ids, action }, { onSuccess: () => toast(done, "ok", undo && { label: "Undo", onClick: undo }), onError: (e) => toast(e.message, "error") });
  // a mis-tap on "Resolve all" reopens exactly the items it resolved, not the older resolved ones
  const resolveAll = (ids: string[]) => run(ids, "resolve", `${ids.length} marked resolved`, () => run(ids, "reopen", `${ids.length} reopened`));
  const critical = data.open.filter((n) => n.severity === "critical").length;
  // proposals wait for Approve or Decline; resolving one would drop it with no decision
  const resolvable = data.open.filter((n) => !n.proposal).map((n) => n.id);

  return (
    <Stagger>
      <PageHeader title="Notifications" sub="Only things that need you: anything the automation can't fix by itself. Fixed problems clear themselves on the next check.">
        {resolvable.length > 1 && <Button icon={CheckCheck} disabled={act.isPending} onClick={() => resolveAll(resolvable)}>Resolve all</Button>}
      </PageHeader>

      {data.open.length === 0 ? (
        <Card><Empty icon={BellOff} title="All clear">Nothing needs you right now. The watchdog checks every hour.</Empty></Card>
      ) : (
        <>
          <p className="mb-4 text-[13px] text-ink2">
            {data.open.length} open{critical ? <>, <span className="font-semibold text-critical-text">{critical} critical</span></> : ""}
          </p>
          <ul className="flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {data.open.map((n) => <Item key={n.id} n={n} busy={act.isPending} onResolve={() => run([n.id], "resolve", "Marked resolved")}
                onDecide={(a) => run([n.id], a, a === "approve" ? "Approved: setting changed" : "Declined")} />)}
            </AnimatePresence>
          </ul>
        </>
      )}

      {data.resolved.length > 0 && (
        <details className="group mt-8">
          <summary className="panel-sm hover-raise inline-flex h-10 cursor-pointer list-none items-center gap-1 bg-surface px-3.5 text-[12.5px] font-semibold">
            <span className="group-open:hidden">Show</span><span className="hidden group-open:inline">Hide</span> recently resolved ({data.resolved.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {data.resolved.map((n) => <Item key={n.id} n={n} busy={act.isPending} onReopen={() => run([n.id], "reopen", "Reopened")} />)}
          </ul>
        </details>
      )}
    </Stagger>
  );
}
