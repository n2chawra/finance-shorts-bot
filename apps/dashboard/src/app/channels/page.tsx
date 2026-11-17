"use client";

import { CirclePause, CirclePlay, Clapperboard, ExternalLink, KeyRound, Plus, Radio, MonitorPlay, Tv } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useToast } from "@/components/toast";
import { Badge, Button, Card, ErrorNote, Loading, PageHeader, Segmented, Stagger, type Tone, buttonClass, fieldClass } from "@/components/ui";
import type { Channel, ChannelStatus } from "@/lib/channels";
import { useAddChannel, useChannels, usePatchChannel, useSettings, useSwitchChannel } from "@/lib/queries";

/*
 * Channels (multi-channel plan, step 2): every YouTube channel the platform runs. Start, pause and
 * dial down each one; add a new one from a niche; connect its YouTube account in one click.
 */

const STATUS: Record<ChannelStatus, { label: string; tone: Tone; why: string }> = {
  setup: { label: "Setting up", tone: "info", why: "Research and the channel pack are being built; nothing is made or uploaded yet." },
  review: { label: "Launch review", tone: "violet", why: "Three sample Shorts are ready for your review." },
  active: { label: "Live", tone: "good", why: "Making and uploading videos on its schedule." },
  paused: { label: "Paused", tone: "warning", why: "Nothing is made or uploaded; its routines exit in seconds. The queue is kept." },
};

const fmtN = (n: number) => new Intl.NumberFormat("en", { notation: n >= 10_000 ? "compact" : "standard" }).format(n);

function Notice() {
  const q = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    const error = q.get("error"), connected = q.get("connected");
    if (error) toast(error, "error");
    else if (connected) toast(`Connected YouTube channel "${q.get("yt") ?? ""}"`);
    if (error || connected) router.replace("/channels");
  }, [q, router, toast]);
  return null;
}

function ChannelCard({ c, current }: { c: Channel; current: boolean }) {
  const patch = usePatchChannel();
  const toast = useToast();
  const switchTo = useSwitchChannel();
  const { data: platform } = useSettings();
  const s = STATUS[c.status];
  const perDay = c.settings.dailyVideoTarget ?? platform?.dailyVideoTarget ?? 3;
  const [times, setTimes] = useState((c.settings.uploadTimes ?? platform?.uploadTimes ?? []).join(", "));
  const run = (body: Parameters<typeof patch.mutate>[0], ok: string) => patch.mutate(body, { onSuccess: () => toast(ok), onError: (e) => toast(e.message, "error") });
  const live = c.status === "active" || c.status === "paused";

  return (
    <Card icon={Tv} accent={current ? "lime" : "surface"} title={<span className="flex flex-wrap items-center gap-2">{c.name}<Badge tone={s.tone} dot>{s.label}</Badge>{current && <Badge tone="brand">Showing</Badge>}</span>}
      description={s.why}
      action={!current && <Button size="sm" onClick={() => switchTo(c.id)}>Show this channel</Button>}>
      <dl className="grid grid-cols-3 gap-3 text-[12.5px]">
        <div><dt className="text-muted">Ready to upload</dt><dd className="mt-0.5 text-[18px] font-semibold tabular-nums">{fmtN(c.counts.queued)}</dd></div>
        <div><dt className="text-muted">Published</dt><dd className="mt-0.5 text-[18px] font-semibold tabular-nums">{fmtN(c.counts.published)}</dd></div>
        <div><dt className="text-muted">Views, 7 days</dt><dd className="mt-0.5 text-[18px] font-semibold tabular-nums">{fmtN(c.counts.views7d)}</dd></div>
      </dl>

      <div className="mt-5 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium text-ink2">YouTube</span>
          <div className="flex flex-wrap items-center gap-2">
            {c.connected
              ? <Badge tone="good" icon={MonitorPlay}>{c.youtubeChannelId ? "Connected" : "Connected (sign-in secret)"}</Badge>
              : <Badge tone="neutral" icon={MonitorPlay}>Not connected</Badge>}
            <a href={`/api/channels/${c.id}/connect`} className={buttonClass(c.connected ? "ghost" : "primary", false, "sm")}>
              <KeyRound aria-hidden className="size-4" />{c.connected ? "Reconnect" : "Connect YouTube"}
            </a>
            {c.youtubeChannelId && (
              <a href={`https://www.youtube.com/channel/${c.youtubeChannelId}`} target="_blank" rel="noreferrer" className={buttonClass("ghost", false, "sm")}>
                <ExternalLink aria-hidden className="size-4" />Open
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium text-ink2">Running</span>
          <div className="flex flex-wrap items-center gap-2">
            {c.status === "active" && <Button size="sm" icon={CirclePause} disabled={patch.isPending} onClick={() => run({ id: c.id, status: "paused" }, `${c.name} paused`)}>Pause</Button>}
            {c.status === "paused" && <Button size="sm" tone="primary" icon={CirclePlay} disabled={patch.isPending} onClick={() => run({ id: c.id, status: "active" }, `${c.name} resumed`)}>Resume</Button>}
            {!live && <span className="text-[12.5px] text-muted">Starts with Launch, after its samples are reviewed.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium text-ink2">Shorts a day</span>
          <Segmented label={`Shorts a day for ${c.name}`} value={String(perDay)} onChange={(v) => run({ id: c.id, settings: { dailyVideoTarget: Number(v) } }, `${c.name}: ${v} Short${v === "1" ? "" : "s"} a day`)}
            options={["0", "1", "2", "3"].map((v) => ({ value: v, label: v }))} />
          <span className="text-[11.5px] text-muted">Turn a channel down when Claude usage runs short.</span>
        </div>

        <form className="flex flex-col gap-2" onSubmit={(e) => {
          e.preventDefault();
          const list = times.split(/[,\s]+/).filter(Boolean);
          run({ id: c.id, settings: { uploadTimes: list } }, `${c.name}: upload times saved`);
        }}>
          <label htmlFor={`times-${c.id}`} className="text-[12.5px] font-medium text-ink2">Upload times (IST)</label>
          <div className="flex gap-2">
            <input id={`times-${c.id}`} value={times} onChange={(e) => setTimes(e.target.value)} placeholder="07:07, 12:37, 19:07" className={fieldClass} />
            <Button size="sm" type="submit" disabled={patch.isPending}>Save</Button>
          </div>
          <span className="text-[11.5px] text-muted">Keep different channels at least 20 minutes apart.</span>
        </form>
      </div>

      {c.request && (
        <div className="mt-4 rounded-lg bg-surface-2 p-3 text-[12.5px] text-ink2">
          <div className="font-medium text-ink">Your request: {c.request.niche}</div>
          <p className="mt-1">{c.request.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {c.request.references.map((r) => <a key={r} href={r} target="_blank" rel="noreferrer" className="text-brand-text underline-offset-2 hover:underline">{r.replace(/^https?:\/\/(www\.)?/, "")}</a>)}
          </div>
        </div>
      )}
    </Card>
  );
}

function AddChannel() {
  const add = useAddChannel();
  const toast = useToast();
  const [niche, setNiche] = useState(""), [name, setName] = useState(""), [description, setDescription] = useState(""), [refs, setRefs] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const references = refs.split(/[\s,]+/).filter(Boolean).slice(0, 3);
    add.mutate({ niche, name: name || undefined, description, references }, {
      onSuccess: () => { setNiche(""); setName(""); setDescription(""); setRefs(""); toast("Channel added. Its setup research starts from here."); },
      onError: (err) => toast(err.message, "error"),
    });
  };
  return (
    <Card icon={Plus} accent="sky" title="Add a channel" description="Say the niche, a few lines about it and 1–3 channels you'd like it to learn from. Everything else is built for you.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ch-niche" className="text-[12.5px] font-medium text-ink2">Niche</label>
          <input id="ch-niche" required value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. true crime in 60 seconds" maxLength={120} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ch-name" className="text-[12.5px] font-medium text-ink2">Working name (optional)</label>
          <input id="ch-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="The system suggests names too" maxLength={60} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="ch-desc" className="text-[12.5px] font-medium text-ink2">A few lines about it</label>
          <textarea id="ch-desc" required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1500}
            placeholder="Who it's for, what it covers, the feel you want" className={`${fieldClass} h-auto py-2`} />
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="ch-refs" className="text-[12.5px] font-medium text-ink2">Reference channels (1–3 links)</label>
          <input id="ch-refs" required value={refs} onChange={(e) => setRefs(e.target.value)} placeholder="https://youtube.com/@one https://youtube.com/@two" className={fieldClass} />
        </div>
        <div className="md:col-span-2"><Button type="submit" tone="primary" icon={Plus} disabled={add.isPending}>Add channel</Button></div>
      </form>
    </Card>
  );
}

function OneTimeSetup() {
  return (
    <Card icon={Radio} accent="sun" title="Before the first Connect YouTube (once for all channels)"
      description="Connect YouTube signs in from this dashboard, which needs a web sign-in client in the same Google project.">
      <ol className="list-decimal space-y-1.5 pl-5 text-[13px] text-ink2">
        <li>Google Cloud console → APIs &amp; Services → Credentials → Create credentials → OAuth client ID → <b>Web application</b>.</li>
        <li>Authorised redirect URI: <code className="rounded bg-surface-3 px-1">{typeof window !== "undefined" ? window.location.origin : ""}/api/oauth/youtube</code></li>
        <li>Put its ID and secret in Netlify and in GitHub secrets as <code className="rounded bg-surface-3 px-1">YT_WEB_CLIENT_ID</code> and <code className="rounded bg-surface-3 px-1">YT_WEB_CLIENT_SECRET</code>.</li>
        <li>Add <code className="rounded bg-surface-3 px-1">SESSION_SECRET</code> (the same value as in Netlify) as a GitHub secret, so the uploader can read stored sign-ins.</li>
      </ol>
    </Card>
  );
}

export default function ChannelsPage() {
  const { data, isLoading, error } = useChannels();
  return (
    <>
      <Suspense><Notice /></Suspense>
      <PageHeader title="Channels" sub="Every channel runs on the same platform. Pause, resume or turn one down here; the switcher at the top left picks which one the other pages show." />
      {isLoading && <Loading rows={3} />}
      {error && <ErrorNote error={error} />}
      {data && (
        <Stagger className="flex flex-col gap-5">
          {data.channels.map((c) => <ChannelCard key={c.id} c={c} current={c.id === data.current} />)}
          <AddChannel />
          <OneTimeSetup />
        </Stagger>
      )}
      {data && !data.channels.length && <Card icon={Clapperboard}><p className="text-[13px] text-ink2">No channels yet.</p></Card>}
    </>
  );
}
