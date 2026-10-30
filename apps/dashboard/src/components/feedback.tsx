"use client";

/**
 * The owner decides (2026-10-30): the editor's rank on a video, a dialog that asks "why" for a pick or a
 * stale, and the feedback panel (notes on one video, or on the channel when no video is given). Every
 * note reaches the next video run and the improver through metrics/feedback.json.
 */
import { Award, CheckCircle2, MessageSquarePlus, Sparkles } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useState } from "react";

import { Badge, Button, Card, Empty, SelectField, Tip, buttonClass, fieldClass } from "@/components/ui";
import { useToast } from "@/components/toast";
import { fmtRelative, titleCase } from "@/lib/format";
import { useAddFeedback, useFeedback, usePatchFeedback } from "@/lib/queries";
import { FEEDBACK_AREAS, type Feedback, type Video } from "@/lib/schemas";

/** The editor's rank and score, with its reason on hover. */
export function EditorBadge({ v }: { v: Pick<Video, "editorRank" | "editorScore" | "editorNote" | "pickedAt"> }) {
  if (v.pickedAt) return <Badge tone="good" icon={Award}>Your pick</Badge>;
  if (v.editorRank === null) return null;
  const badge = <Badge tone={v.editorRank === 1 ? "brand" : "neutral"} icon={v.editorRank === 1 ? Sparkles : undefined}>
    {v.editorRank === 1 ? "Editor's pick" : `Editor #${v.editorRank}`}{v.editorScore !== null ? ` · ${v.editorScore.toFixed(1)}` : ""}</Badge>;
  return v.editorNote?.why ? <Tip label={v.editorNote.why}>{badge}</Tip> : badge;
}

/** The editor's full note: why, strengths, risks. */
export function EditorNote({ v }: { v: Pick<Video, "editorRank" | "editorScore" | "editorNote"> }) {
  if (!v.editorNote) return null;
  const n = v.editorNote;
  return (
    <div className="text-[13px] leading-relaxed">
      <p className="text-ink2">{n.why}</p>
      {n.strengths.length > 0 && <p className="mt-1.5"><span className="font-medium text-good-text">Strengths: </span>{n.strengths.join(" · ")}</p>}
      {n.risks.length > 0 && <p className="mt-1"><span className="font-medium text-warning-text">Risks: </span>{n.risks.join(" · ")}</p>}
    </div>
  );
}

/** A dialog that asks for a reason (a pick says why this one; a stale says why not). */
export function ReasonDialog({ open, onOpenChange, title, description, placeholder, confirmLabel, required, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; placeholder: string;
  confirmLabel: string; required?: boolean; onSubmit: (reason: string) => void;
}) {
  const [text, setText] = useState("");
  const ok = !required || text.trim().length >= 3;
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) setText(""); onOpenChange(o); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-black/40 backdrop-blur-[1px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop rounded-xl border border-ring bg-surface p-5 shadow-lift">
          <AlertDialog.Title className="text-[15px] font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-ink2">{description}</AlertDialog.Description>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={placeholder} aria-label="Reason"
            className={`${fieldClass} mt-3 h-auto py-2 leading-snug`} />
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("default")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action disabled={!ok} onClick={() => { onSubmit(text.trim()); setText(""); }}
              className={`${buttonClass("primary")} disabled:opacity-40`}>{confirmLabel}</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

const KIND_LABEL: Record<Feedback["kind"], string> = { choice: "Picked", improve: "Improve", wrong: "Wrong", stale: "Stale", general: "General" };
const KIND_TONE: Record<Feedback["kind"], "good" | "info" | "critical" | "warning" | "neutral"> = { choice: "good", improve: "info", wrong: "critical", stale: "warning", general: "neutral" };

function Note({ f, showVideo }: { f: Feedback; showVideo?: boolean }) {
  const patch = usePatchFeedback();
  const toast = useToast();
  return (
    <li className="border-b border-line px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Badge tone={KIND_TONE[f.kind]}>{KIND_LABEL[f.kind]}</Badge>
        {f.area && <Badge>{titleCase(f.area)}</Badge>}
        {showVideo && f.videoTitle && <a href={`/videos/${f.videoId}`} className="truncate font-medium text-ink2 underline-offset-2 hover:underline">{f.videoTitle}</a>}
        {showVideo && !f.videoId && <span>Channel</span>}
        <span>· {fmtRelative(f.createdAt)}</span>
        {f.status === "addressed" ? <Badge tone="good" icon={CheckCircle2}>Answered</Badge> : <Badge tone="brand">Open</Badge>}
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed">{f.text}</p>
      {f.response && <p className="mt-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-ink2"><span className="font-medium text-ink">The system: </span>{f.response}</p>}
      {(f.kind === "wrong" || f.kind === "improve" || f.kind === "general") && (
        <button type="button" disabled={patch.isPending} className="mt-1.5 text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
          onClick={() => patch.mutate({ id: f.id, status: f.status === "open" ? "addressed" : "open" }, { onSuccess: () => toast(f.status === "open" ? "Marked done" : "Reopened"), onError: (e) => toast(e.message, "error") })}>
          {f.status === "open" ? "Mark done" : "Reopen"}</button>
      )}
    </li>
  );
}

/** Notes on one video (videoId) or on the channel (none): the list and a form to add one. */
export function FeedbackPanel({ videoId, title = "Your feedback", showVideo = false, kinds = ["improve", "wrong", "general"] }: {
  videoId?: string; title?: string; showVideo?: boolean; kinds?: Feedback["kind"][];
}) {
  const list = useFeedback(videoId);
  const add = useAddFeedback();
  const toast = useToast();
  const [kind, setKind] = useState<Feedback["kind"]>(kinds[0]!);
  const [area, setArea] = useState("");
  const [text, setText] = useState("");
  const submit = () => add.mutate({ videoId: videoId ?? null, kind, area: (area || null) as Feedback["area"], text: text.trim() },
    { onSuccess: () => { setText(""); toast("Saved: the next videos and the improver will see it"); }, onError: (e) => toast(e.message, "error") });
  return (
    <Card title={title} icon={MessageSquarePlus} flush
      description="What's wrong, or what to do better next time. The video routine reads it before every video, and the improver answers each note.">
      <div className="flex flex-col gap-2 border-b border-line p-4">
        <div className="grid grid-cols-2 gap-2 sm:w-96">
          <SelectField label="Kind" value={kind} onChange={(v) => setKind((v || kinds[0]) as Feedback["kind"])} all={KIND_LABEL[kinds[0]!]}
            options={kinds.slice(1).map((k) => ({ value: k, label: KIND_LABEL[k] }))} />
          <SelectField label="Area" value={area} onChange={setArea} all="Any area" options={FEEDBACK_AREAS.map((a) => ({ value: a, label: titleCase(a) }))} />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Feedback"
          placeholder={videoId ? "e.g. The hook gives the answer away; the voice rushes the numbers" : "e.g. Fewer characters talking, more animation of the money"}
          className={`${fieldClass} h-auto py-2 leading-snug`} />
        <div><Button tone="primary" disabled={add.isPending || text.trim().length < 2} onClick={submit}>Save feedback</Button></div>
      </div>
      {list.data && list.data.length > 0 ? <ul>{list.data.map((f) => <Note key={f.id} f={f} showVideo={showVideo} />)}</ul>
        : <div className="p-4"><Empty title="No feedback yet">Notes you add here shape the next videos.</Empty></div>}
    </Card>
  );
}
