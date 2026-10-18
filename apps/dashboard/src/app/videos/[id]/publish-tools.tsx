"use client";

import { AlignLeft, Check, CircleCheckBig, Copy, Link2, MonitorPlay, Tags, Type } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button, Card, buttonClass } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useManualUpload } from "@/lib/queries";
import type { Video } from "@/lib/schemas";
import { youtubeIdFrom } from "@/lib/youtube-link";

// ---------------- copy helpers ----------------

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      toast("Copy failed. Select the text and copy it by hand.", "error");
    }
  };
  return (
    <button type="button" onClick={copy} aria-label={`${label} to clipboard`}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${done ? "border-transparent bg-good-soft text-good-text" : "border-ring bg-surface text-ink2 hover:bg-wash hover:text-ink"}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={done ? "done" : "idle"} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.12 }}>
          {done ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        </motion.span>
      </AnimatePresence>
      {done ? "Copied" : label}
    </button>
  );
}

function Field({ icon: Icon, label, count, max, actions, children }: {
  icon: typeof Type; label: string; count?: number; max?: number; actions: React.ReactNode; children: React.ReactNode;
}) {
  const over = count !== undefined && max !== undefined && count > max;
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink2">
          <Icon aria-hidden className="size-3.5" />{label}
          {count !== undefined && <span className={`tabular-nums ${over ? "text-critical-text" : "text-muted"}`}>· {count}{max ? `/${max}` : ""}</span>}
        </span>
        <div className="flex gap-1.5">{actions}</div>
      </div>
      {children}
    </div>
  );
}

/** What to paste into YouTube Studio: the description plus only the hashtags it doesn't already contain. */
export function uploadText(v: Pick<Video, "description" | "tags">) {
  const hashtags = v.tags.map((t) => `#${t}`).join(" ");
  const missing = v.tags.filter((t) => !v.description.toLowerCase().includes(`#${t.toLowerCase()}`)).map((t) => `#${t}`).join(" ");
  return { hashtags, missing, description: missing ? `${v.description}\n\n${missing}` : v.description };
}

/** Title, description and tags laid out the way YouTube Studio asks for them, each one click to copy. */
export function YouTubeDetails({ v }: { v: Video }) {
  const { hashtags, missing, description } = uploadText(v);
  return (
    <Card title="Copy into YouTube Studio" icon={MonitorPlay} description="Title, description and tags, ready to paste when you upload by hand">
      <div className="flex flex-col gap-3">
        <Field icon={Type} label="Title" count={v.title.length} max={100} actions={<CopyButton text={v.title} />}>
          <p className="text-base font-semibold leading-snug">{v.title}</p>
        </Field>
        <Field icon={AlignLeft} label="Description" count={description.length} max={5000} actions={<CopyButton text={description} />}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{v.description}</p>
          {missing && (
            <>
              <p className="mt-2 text-sm text-brand-text">{missing}</p>
              <p className="mt-2 text-[11px] text-muted">Copy includes the hashtags at the end.</p>
            </>
          )}
        </Field>
        <Field icon={Tags} label="Tags" count={v.tags.length} actions={<><CopyButton text={v.tags.join(", ")} label="Copy for Tags box" /><CopyButton text={hashtags} label="Copy hashtags" /></>}>
          {v.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {v.tags.map((t) => <span key={t} className="rounded-full border border-ring bg-surface px-2.5 py-1 text-xs font-medium text-ink2">#{t}</span>)}
            </div>
          ) : <p className="text-sm text-muted">No tags.</p>}
        </Field>
        <div className="rounded-xl bg-brand-soft px-3 py-2.5 text-xs leading-relaxed text-ink2">
          <strong className="text-ink">In YouTube Studio pick:</strong> Audience → No, it&apos;s not made for kids · Category → Education ·
          Altered or synthetic content → No · Visibility → Public
        </div>
      </div>
    </Card>
  );
}

// ---------------- mark as uploaded ----------------

const localNow = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** "I uploaded this myself": takes the YouTube link so views and likes are tracked like any other upload. */
export function MarkUploaded({ v }: { v: Pick<Video, "id" | "status"> }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [when, setWhen] = useState(localNow);
  const mark = useManualUpload();
  const toast = useToast();
  const id = youtubeIdFrom(link);
  const bad = link.trim() !== "" && !id;
  const relink = v.status === "published";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bad) return;
    mark.mutate({ id: v.id, youtubeId: id, publishedAt: new Date(when).toISOString() }, {
      onSuccess: () => { toast(relink ? "YouTube link saved" : "Marked as uploaded"); setOpen(false); },
      onError: (err) => toast(err.message, "error"),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (o) { setLink(""); setWhen(localNow()); } }}>
      <Dialog.Trigger className={buttonClass(relink ? "default" : "primary")}>
        {relink ? <Link2 aria-hidden className="size-4" /> : <CircleCheckBig aria-hidden className="size-4" />}
        {relink ? "Add YouTube link" : "Mark as uploaded"}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-fade bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(460px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-pop rounded-2xl border border-ring bg-surface p-5 shadow-lift">
          <form onSubmit={submit}>
            <Dialog.Title className="text-base font-semibold">{relink ? "Link the YouTube video" : "Mark as uploaded by hand"}</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-ink2">
              {relink ? "Paste the link so views and likes are tracked."
                : "The video leaves the queue and is marked published. The bot will never upload it. Paste the link so its views and likes are tracked."}
            </Dialog.Description>

            <label htmlFor="yt-link" className="mt-4 block text-sm font-medium">YouTube link</label>
            <input id="yt-link" autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtube.com/shorts/…" inputMode="url"
              aria-invalid={bad} aria-describedby="yt-link-hint"
              className={`mt-1.5 min-h-11 w-full rounded-lg border bg-surface px-3 text-sm shadow-card ${bad ? "border-critical" : "border-ring"}`} />
            <p id="yt-link-hint" className={`mt-1 text-xs ${bad ? "text-critical-text" : "text-muted"}`}>
              {bad ? "That doesn't look like a YouTube video link." : id ? `Video id ${id}` : "Optional. You can add it later from this page."}
            </p>

            <label htmlFor="yt-when" className="mt-3 block text-sm font-medium">Published at</label>
            <input id="yt-when" type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-ring bg-surface px-3 text-sm shadow-card" />

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close className={buttonClass("default")}>Cancel</Dialog.Close>
              <Button type="submit" tone="primary" disabled={bad || !when || mark.isPending}>{mark.isPending ? "Saving…" : relink ? "Save link" : "Mark uploaded"}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
