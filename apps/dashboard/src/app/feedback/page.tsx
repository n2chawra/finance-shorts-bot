"use client";

import { Bot, CheckCircle2, CircleDot, Film, MessageSquarePlus, RotateCcw, Send, Tv } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { KIND_LABEL, KIND_TONE } from "@/components/feedback";
import { useToast } from "@/components/toast";
import { Badge, Button, Card, Empty, ErrorNote, IconTile, Loading, PageHeader, SelectField, Stagger, fieldClass } from "@/components/ui";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { useAddFeedback, useFeedback, usePatchFeedback } from "@/lib/queries";
import { isRecent } from "@/lib/recent";
import { FEEDBACK_AREAS, type Feedback } from "@/lib/schemas";

/*
 * The owner's feedback (2026-10-30; redesigned 2026-11-12 "it's very congested"): write a note at the
 * top; below, the last two days of notes, picks and stales, each with the system's answer as a reply.
 * Every note reaches the next video run and every agent that can fix it (metrics/feedback.json).
 */

const KINDS: Feedback["kind"][] = ["general", "improve", "wrong"];
type Filter = "open" | "answered" | "all";

function Composer() {
  const add = useAddFeedback();
  const toast = useToast();
  const [kind, setKind] = useState<Feedback["kind"]>("general");
  const [area, setArea] = useState("");
  const [text, setText] = useState("");
  const submit = () => add.mutate({ videoId: null, kind, area: (area || null) as Feedback["area"], text: text.trim() },
    { onSuccess: () => { setText(""); toast("Saved: the next videos and the agents will see it"); }, onError: (e) => toast(e.message, "error") });
  return (
    <Card title="Write a note" icon={MessageSquarePlus} accent="lime" description="About the channel as a whole. For one video, use the feedback box on that video's page.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Feedback"
        placeholder="e.g. Fewer characters talking, more animation of the money"
        className={`${fieldClass} h-auto resize-y py-2.5 text-[14px] leading-relaxed`} />
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <div className="w-36">
          {/* the first kind stands in as the select's "all" option, so it goes in as no value */}
          <SelectField label="Kind" value={kind === KINDS[0] ? "" : kind} onChange={(v) => setKind((v || KINDS[0]) as Feedback["kind"])} all={KIND_LABEL[KINDS[0]]}
            options={KINDS.slice(1).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
        </div>
        <div className="w-40">
          <SelectField label="Area" value={area} onChange={setArea} all="Any area" options={FEEDBACK_AREAS.map((a) => ({ value: a, label: titleCase(a) }))} />
        </div>
        <span className="ml-auto" />
        <Button tone="primary" icon={Send} disabled={add.isPending || text.trim().length < 2} onClick={submit}>Save note</Button>
      </div>
    </Card>
  );
}

function NoteCard({ f }: { f: Feedback }) {
  const patch = usePatchFeedback();
  const toast = useToast();
  const answered = f.status === "addressed";
  const canClose = f.kind === "wrong" || f.kind === "improve" || f.kind === "general";
  return (
    <li className="panel bg-surface">
      <div className="flex items-start gap-3.5 p-5">
        <IconTile icon={f.videoId ? Film : Tv} accent={f.videoId ? "sky" : "grape"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Badge tone={KIND_TONE[f.kind]}>{KIND_LABEL[f.kind]}</Badge>
            {f.area && <Badge>{titleCase(f.area)}</Badge>}
            <span className="text-[12.5px] text-muted" title={fmtDateTime(f.createdAt)}>{fmtRelative(f.createdAt)}</span>
            <span className="ml-auto">
              {answered ? <Badge tone="good" icon={CheckCircle2}>Answered</Badge> : f.response ? <Badge tone="info" dot>In progress</Badge> : <Badge tone="warning" dot>Open</Badge>}
            </span>
          </div>
          <div className="mt-1.5 text-[12.5px] text-muted">
            {f.videoId ? <>On <Link href={`/videos/${f.videoId}`} className="font-medium text-ink2 hover:text-brand-text">{f.videoTitle ?? f.videoId}</Link></> : "On the channel"}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{f.text}</p>
        </div>
      </div>
      {(f.response || canClose) && (
        <div className="flex items-start gap-3.5 rounded-b-[14px] border-t border-line bg-surface-2 px-5 py-4">
          {f.response ? (
            <>
              <IconTile icon={Bot} accent="lime" size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-ink2">The system replied{f.addressedAt ? ` · ${fmtRelative(f.addressedAt)}` : ""}</div>
                <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink2">{f.response}</p>
              </div>
            </>
          ) : <p className="flex-1 text-[13px] text-muted">No reply yet: the agent whose job this is answers after its next run.</p>}
          {canClose && (
            <Button size="sm" tone="ghost" icon={answered ? RotateCcw : CheckCircle2} disabled={patch.isPending}
              onClick={() => patch.mutate({ id: f.id, status: answered ? "open" : "addressed" }, { onSuccess: () => toast(answered ? "Reopened" : "Marked done"), onError: (e) => toast(e.message, "error") })}>
              {answered ? "Reopen" : "Mark done"}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export default function FeedbackPage() {
  const list = useFeedback();
  const [filter, setFilter] = useState<Filter>("open");
  // latest updates only (owner, 2026-11-12): notes written or answered in the last two days
  const recent = (list.data ?? []).filter((f) => isRecent(f.addressedAt ?? f.createdAt));
  const open = recent.filter((f) => f.status === "open");
  const answered = recent.filter((f) => f.status === "addressed");
  const shown = filter === "open" ? open : filter === "answered" ? answered : recent;
  const tabs: { value: Filter; label: string; n: number; icon: typeof CircleDot }[] = [
    { value: "open", label: "Open", n: open.length, icon: CircleDot },
    { value: "answered", label: "Answered", n: answered.length, icon: CheckCircle2 },
    { value: "all", label: "All", n: recent.length, icon: MessageSquarePlus },
  ];

  return (
    <Stagger>
      <PageHeader title="Feedback" sub="Tell the system what's wrong or what to do better. The next video run reads your open notes, and the agent whose job it is fixes it and replies here." />
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Composer />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Feedback filter" className="flex w-fit gap-1 rounded-xl bg-surface-3 p-1">
            {tabs.map((t) => (
              <button key={t.value} type="button" role="tab" aria-selected={filter === t.value} onClick={() => setFilter(t.value)}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${filter === t.value ? "bg-surface text-ink shadow-xs" : "text-ink2 hover:text-ink"}`}>
                <t.icon aria-hidden className="size-3.5" />{t.label}
                <span className={`rounded-md px-1.5 text-[11px] tabular-nums ${filter === t.value ? "bg-brand-soft text-brand-text" : "bg-wash-2 text-muted"}`}>{t.n}</span>
              </button>
            ))}
          </div>
          <span className="text-[12.5px] text-muted">Last 2 days</span>
        </div>

        {list.isLoading ? <Loading rows={2} /> : list.error ? <ErrorNote error={list.error} /> : shown.length === 0 ? (
          <Card><Empty icon={MessageSquarePlus} title={filter === "open" ? "Nothing open" : filter === "answered" ? "No answers in the last 2 days" : "No feedback in the last 2 days"}>
            {filter === "open" ? "Every note from the last two days has been answered." : "Notes you write here, and your picks and stales, show up for two days."}</Empty></Card>
        ) : (
          <ul className="flex flex-col gap-4">{shown.map((f) => <NoteCard key={f.id} f={f} />)}</ul>
        )}
      </div>
    </Stagger>
  );
}
