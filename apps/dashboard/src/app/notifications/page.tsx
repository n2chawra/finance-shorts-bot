"use client";

import { AlertOctagon, AlertTriangle, BellOff, Check, CheckCheck, CircleCheck, Info, RotateCcw, SlidersHorizontal, Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, Stagger, type Tone } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { useNotificationAction, useNotifications } from "@/lib/queries";
import type { Notification } from "@/lib/schemas";

const SEVERITY: Record<Notification["severity"], { tone: Tone; icon: typeof Info; label: string; ring: string }> = {
  critical: { tone: "critical", icon: AlertOctagon, label: "Needs you now", ring: "border-critical/30" },
  warning: { tone: "warning", icon: AlertTriangle, label: "Needs a look", ring: "border-warning/30" },
  info: { tone: "info", icon: Info, label: "For your information", ring: "border-ring" },
};

function Steps({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const numbered = lines.every((l) => /^\d+[.)]\s/.test(l));
  if (lines.length > 1 && numbered) {
    return <ol className="flex flex-col gap-1.5">{lines.map((l, i) => (
      <li key={i} className="flex gap-2.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold tabular-nums text-ink2">{i + 1}</span><span>{l.replace(/^\d+[.)]\s*/, "")}</span></li>
    ))}</ol>;
  }
  return <p className="whitespace-pre-wrap">{text}</p>;
}

const show = (v: unknown): string => (Array.isArray(v) ? v.join(", ") : v === undefined ? "—" : String(v));

/** An agent's proposed setting change: the owner approves (the setting is written) or declines it. */
function Proposal({ p, fix, decision, onDecide, busy }: { p: NonNullable<Notification["proposal"]>; fix: string; decision: Notification["decision"]; onDecide?: (a: "approve" | "decline") => void; busy: boolean }) {
  return (
    <div className="mt-3 rounded-lg border border-brand/25 bg-brand-soft/40 p-3 text-[13px]">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink"><SlidersHorizontal aria-hidden className="size-3.5" />Proposed setting change</div>
      <p className="tabular-nums"><span className="font-medium">{p.setting}</span>: <span className="text-muted line-through">{show(p.current)}</span> → <span className="font-medium">{show(p.value)}</span></p>
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
      className={`overflow-hidden rounded-xl border bg-surface shadow-card ${s.ring} ${n.resolvedAt ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2 p-4 sm:flex-nowrap">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${n.severity === "critical" ? "bg-critical-soft text-critical" : n.severity === "warning" ? "bg-warning-soft text-warning-text" : "bg-info-soft text-info-text"}`}>
          <s.icon aria-hidden className="size-4" />
        </span>
        <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)] sm:basis-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-medium">{n.title}</h3>
            {!n.seenAt && !n.resolvedAt && <span className="size-1.5 rounded-full bg-brand" aria-label="Unread" />}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
            <Badge tone={s.tone}>{s.label}</Badge>
            <span>from {titleCase(n.source)}</span><span aria-hidden>·</span>
            <span title={fmtDateTime(n.updatedAt)}>{n.resolvedAt ? `resolved ${fmtRelative(n.resolvedAt)}` : `updated ${fmtRelative(n.updatedAt)}`}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink2">{n.detail}</p>
          {n.proposal && <Proposal p={n.proposal} fix={n.fix} decision={n.decision} onDecide={n.resolvedAt ? undefined : onDecide} busy={busy} />}
          {!n.resolvedAt && !n.proposal && (
            <div className="mt-3 rounded-lg bg-surface-2 p-3 text-[13px] leading-relaxed">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink"><Wrench aria-hidden className="size-3.5" />How to fix</div>
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
  const run = (ids: string[], action: "resolve" | "reopen" | "approve" | "decline", done: string) => act.mutate({ ids, action }, { onSuccess: () => toast(done), onError: (e) => toast(e.message, "error") });
  const critical = data.open.filter((n) => n.severity === "critical").length;

  return (
    <Stagger>
      <PageHeader title="Notifications" sub="Only things that need you: anything the automation can't fix by itself. Fixed problems clear themselves on the next check.">
        {data.open.length > 1 && <Button icon={CheckCheck} disabled={act.isPending} onClick={() => run(data.open.map((n) => n.id), "resolve", "All marked resolved")}>Resolve all</Button>}
      </PageHeader>

      {data.open.length === 0 ? (
        <Card><Empty icon={BellOff} title="All clear">Nothing needs you right now. The watchdog checks every hour.</Empty></Card>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-ink2">
            {data.open.length} open{critical ? <>, <strong className="font-medium text-critical-text">{critical} critical</strong></> : ""}
          </p>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {data.open.map((n) => <Item key={n.id} n={n} busy={act.isPending} onResolve={() => run([n.id], "resolve", "Marked resolved")}
                onDecide={(a) => run([n.id], a, a === "approve" ? "Approved: setting changed" : "Declined")} />)}
            </AnimatePresence>
          </ul>
        </>
      )}

      {data.resolved.length > 0 && (
        <details className="group mt-8">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink2 hover:text-ink">
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
