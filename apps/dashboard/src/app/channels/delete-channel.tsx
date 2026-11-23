"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useState } from "react";
import { z } from "zod";

import { useToast } from "@/components/toast";
import { Tip, buttonClass, fieldClass } from "@/components/ui";
import { type Channel, DEFAULT_CHANNEL, confirmsDelete } from "@/lib/channels";

/** POST /api/channels/[id]/delete's answer: the database part is done; the workflow may not have started. */
const DeleteResultSchema = z.object({
  ok: z.literal(true),
  dispatched: z.boolean(),
  error: z.string().optional(),
  removedUploads: z.number().optional(),
  rejectedVideos: z.number().optional(),
});
export type DeleteResult = z.infer<typeof DeleteResultSchema>;

async function deleteChannel({ id, confirm }: { id: string; confirm: string }): Promise<DeleteResult> {
  const res = await fetch(`/api/channels/${id}/delete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm }) });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : `${res.status} ${res.statusText}`;
    throw new Error(err);
  }
  return DeleteResultSchema.parse(body);
}

/** "Delete channel": a dialog that says what goes and what stays, and asks for the slug or name. */
export function DeleteChannel({ c }: { c: Channel }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const del = useMutation({ mutationFn: deleteChannel, onSettled: () => qc.invalidateQueries() });
  const ok = confirmsDelete(typed, c);
  const isDefault = c.id === DEFAULT_CHANNEL;

  const submit = () => del.mutate({ id: c.id, confirm: typed }, {
    onSuccess: (r) => {
      setOpen(false); setTyped("");
      if (r.dispatched) toast(`${c.name} is being deleted. Its rows, release videos and repo folder go in a few minutes.`);
      else toast(`${c.name}: the database part is done (nothing more uploads), but the cleanup didn't start: ${r.error ?? "unknown error"}. Run "Delete channel" from GitHub Actions with channel ${c.id}.`, "error");
    },
    onError: (e) => toast(e.message, "error"),
  });

  // the default channel can't be deleted (the API and delete-channel.yml refuse it): the button stays, disabled, saying why
  if (isDefault) {
    return (
      <Tip label="The default channel can't be deleted. Make another channel the default first.">
        <span className="inline-flex" tabIndex={0}>
          <button type="button" disabled aria-disabled className={buttonClass("ghost", false, "sm")}><Trash2 aria-hidden className="size-4" />Delete channel</button>
        </span>
      </Tip>
    );
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => { if (!o) setTyped(""); setOpen(o); }}>
      <AlertDialog.Trigger asChild>
        <button type="button" className={buttonClass("ghost", false, "sm")}><Trash2 aria-hidden className="size-4" />Delete channel</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 animate-fade bg-ink/50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[min(500px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto animate-pop rounded-lg border border-ring bg-surface p-5 shadow-xs">
          <AlertDialog.Title className="text-[16px] font-semibold">Delete {c.name}?</AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="mt-2 space-y-2 text-sm text-ink2">
              <p>This can&apos;t be undone.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>All its videos, stats, topics, settings, queue and uploads are removed from the database. Nothing more uploads from the moment you confirm.</li>
                <li>Its video files in GitHub Releases and its <code className="rounded bg-surface-3 px-1">channels/{c.id}/</code> folder are removed from the repo.</li>
                <li><b>Videos already on YouTube are not touched</b>: they stay on the YouTube channel.</li>
                <li>Its routines stop themselves at their next run. You can delete them at <a href="https://claude.ai/code/routines" target="_blank" rel="noreferrer" className="text-brand-text underline-offset-2 hover:underline">claude.ai/code/routines</a>.</li>
              </ul>
            </div>
          </AlertDialog.Description>
          <label htmlFor={`delete-${c.id}`} className="mt-4 block text-[12.5px] font-medium text-ink2">
            Type <code className="rounded bg-surface-3 px-1">{c.id}</code> or the channel&apos;s name to confirm
          </label>
          <input id={`delete-${c.id}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false}
            onKeyDown={(e) => { if (e.key === "Enter" && ok && !del.isPending) { e.preventDefault(); submit(); } }}
            className={`${fieldClass} mt-1.5`} />
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel className={buttonClass("default")}>Cancel</AlertDialog.Cancel>
            {/* not AlertDialog.Action: the dialog stays open until the request answers */}
            <button type="button" disabled={!ok || del.isPending} onClick={submit} className={buttonClass("danger")}>
              <Trash2 aria-hidden className="size-4" />{del.isPending ? "Deleting…" : "Delete channel"}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
