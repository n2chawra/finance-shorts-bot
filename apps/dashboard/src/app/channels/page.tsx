"use client";

import { CirclePause, CirclePlay, Clapperboard, ExternalLink, KeyRound, MonitorPlay, Plus, Radio, Rocket, Tv } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useToast } from "@/components/toast";
import { Badge, Button, Card, ErrorNote, Loading, PageHeader, Segmented, Stagger, type Tone, buttonClass, fieldClass } from "@/components/ui";
import type { Channel, ChannelStatus, SetupStage, Verdict } from "@/lib/channels";
import { useAddChannel, useChannelFit, useChannelSamples, useChannels, useDecideChannel, useLaunchChannel, usePatchChannel, useReviewChannel, useSettings, useSwitchChannel } from "@/lib/queries";

/*
 * Channels (multi-channel plan, step 2): every YouTube channel the platform runs. Start, pause and
 * dial down each one; add a new one from a niche; connect its YouTube account in one click.
 */

/** A sample's contact sheet; until it can be fetched (not committed yet, or GitHub refused) a plain note, not a broken image. */
function ContactSheet({ id, title }: { id: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="flex aspect-[9/16] w-full items-center justify-center rounded-md border border-dashed border-ring bg-surface-3 p-3 text-center text-[12px] text-muted">Contact sheet not available yet</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/api/media/${id}/preview`} alt={`Contact sheet of ${title}`} onError={() => setFailed(true)} className="w-full rounded-md border border-ring bg-surface-3" loading="lazy" />;
}

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

const STAGES: { key: SetupStage; label: string }[] = [
  { key: "scanning", label: "Scan" }, { key: "verdict", label: "Verdict" }, { key: "research", label: "Research" },
  { key: "build", label: "Build" }, { key: "samples", label: "Samples" }, { key: "review", label: "Your review" },
];
const CALL: Record<Verdict["call"], { label: string; tone: Tone }> = {
  go: { label: "Go", tone: "good" }, "go-with-conditions": { label: "Go, with conditions", tone: "warning" }, dont: { label: "Don't", tone: "critical" },
};
const usd = (n: number) => `$${new Intl.NumberFormat("en", { notation: n >= 10_000 ? "compact" : "standard" }).format(n)}`;

/** A new channel's setup: where it is, and the quick verdict with Continue / Stop. */
function SetupPanel({ c }: { c: Channel }) {
  const setup = c.setup!;
  const decide = useDecideChannel();
  const toast = useToast();
  const at = STAGES.findIndex((s) => s.key === setup.stage);
  const v = setup.verdict;
  const choose = (choice: "continue" | "stop") => decide.mutate({ id: c.id, choice }, {
    onSuccess: () => toast(choice === "continue" ? "Continuing: the full research starts next" : "Stopped. Nothing more is spent on this niche."),
    onError: (e) => toast(e.message, "error"),
  });
  return (
    <div className="mb-5 flex flex-col gap-4">
      {setup.stage === "stopped"
        ? <Badge tone="neutral">Stopped{setup.decision ? ` on ${setup.decision.at.slice(0, 10)}` : ""}</Badge>
        : (
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px]" aria-label="Setup progress">
            {STAGES.map((s, i) => (
              <li key={s.key} className={`rounded-full px-2.5 py-1 font-medium ${i < at ? "bg-good-soft text-good-text" : i === at ? "bg-brand-soft text-brand-text" : "bg-surface-3 text-muted"}`}>
                {i < at ? "✓ " : ""}{s.label}
              </li>
            ))}
          </ol>
        )}
      {setup.note && <p className="text-[12.5px] text-ink2">{setup.note}</p>}
      {v && (
        <div className="rounded-xl border border-ring p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold">Quick verdict</span>
            <Badge tone={CALL[v.call].tone} dot>{CALL[v.call].label}</Badge>
          </div>
          <p className="mt-2 text-[13px] text-ink">{v.reason}</p>
          {v.conditions.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-[12.5px] text-ink2">{v.conditions.map((x) => <li key={x}>{x}</li>)}</ul>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div><div className="text-[12px] font-medium text-good-text">For</div><ul className="mt-1 space-y-1 text-[12.5px] text-ink2">{v.for.map((x) => <li key={x}>+ {x}</li>)}</ul></div>
            <div><div className="text-[12px] font-medium text-critical-text">Against</div><ul className="mt-1 space-y-1 text-[12.5px] text-ink2">{v.against.map((x) => <li key={x}>− {x}</li>)}</ul></div>
          </div>
          {v.earnings && (
            <div className="mt-3 rounded-lg bg-surface-2 p-3 text-[12.5px]">
              <div className="font-medium">Rough earnings a month (estimates)</div>
              <div className="mt-1 grid grid-cols-2 gap-2 tabular-nums">
                <span>At 6 months: {usd(v.earnings.m6.low)}–{usd(v.earnings.m6.high)}, likely <b>{usd(v.earnings.m6.likely)}</b></span>
                <span>At 12 months: {usd(v.earnings.m12.low)}–{usd(v.earnings.m12.high)}, likely <b>{usd(v.earnings.m12.likely)}</b></span>
              </div>
              <p className="mt-1 text-muted">{v.earnings.assumptions}</p>
            </div>
          )}
          {setup.stage === "verdict" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button tone="primary" icon={CirclePlay} disabled={decide.isPending} onClick={() => choose("continue")}>Continue to full research</Button>
              <Button icon={CirclePause} disabled={decide.isPending} onClick={() => choose("stop")}>Stop</Button>
            </div>
          )}
          {setup.decision && <p className="mt-3 text-[12px] text-muted">You chose {setup.decision.choice} on {setup.decision.at.slice(0, 10)}.</p>}
        </div>
      )}
    </div>
  );
}

/** A line of the advice: headings bold, the rest as written (advice.md is plain markdown from the research). */
function AdviceText({ text }: { text: string }) {
  return (
    <div className="space-y-1 text-[12.5px] leading-relaxed text-ink2">
      {text.split("\n").map((l, i) => {
        if (!l.trim()) return <div key={i} className="h-1.5" />;
        const h = /^#+\s*(.*)$/.exec(l);
        const t = (h ? h[1]! : l).replace(/\*\*(.+?)\*\*/g, "$1");
        return h ? <div key={i} className="pt-1 text-[13px] font-semibold text-ink">{t}</div> : <div key={i}>{t}</div>;
      })}
    </div>
  );
}

/**
 * The Launch review (step 3d): the samples next to the references' measures, the research's advice and
 * video counts, then I like it (with the counts), notes, or Stop; and Launch once approved and connected.
 */
function ReviewPanel({ c }: { c: Channel }) {
  const setup = c.setup!;
  const review = setup.review;
  const { data: samples } = useChannelSamples(c.id, true);
  const { data: fit } = useChannelFit(c.id, setup.stage === "review");
  const act = useReviewChannel();
  const launch = useLaunchChannel();
  const toast = useToast();
  const [perDay, setPerDay] = useState(String(review?.approved?.shortsPerDay ?? review?.counts?.shortsPerDay ?? 1));
  const [perWeek, setPerWeek] = useState(String(review?.approved?.longPerWeek ?? review?.counts?.longPerWeek ?? 0));
  const [note, setNote] = useState("");
  const done = (msg: string) => ({ onSuccess: () => toast(msg), onError: (e: Error) => toast(e.message, "error") });
  const open = review?.notes.filter((n) => !n.done) ?? [];
  const rounds = new Set(review?.notes.map((n) => n.at.slice(0, 10)) ?? []).size;

  return (
    <div className="mb-5 flex flex-col gap-4 rounded-xl border border-ring p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold">Launch review</span>
        {review?.approved ? <Badge tone="good" dot>Approved</Badge> : setup.stage === "samples" ? <Badge tone="info" dot>Samples being made</Badge> : <Badge tone="violet" dot>Waiting for you</Badge>}
      </div>

      <div className="flex flex-col gap-3">
        {(samples ?? []).map((v) => {
          const l = review?.likeness[v.id];
          return (
            <div key={v.id} className="grid gap-3 rounded-lg bg-surface-2 p-3 md:grid-cols-[180px_1fr]">
              <ContactSheet id={v.id} title={v.title} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">{v.title}<Badge tone="neutral">{v.format === "long" ? "Long" : "Short"} · {Math.round(v.durationSec)} s</Badge></div>
                <a href={`/api/media/${v.id}/video`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[12.5px] text-brand-text underline-offset-2 hover:underline">Watch the sample</a>
                {l ? (
                  <table className="mt-2 w-full text-[12px] tabular-nums">
                    <thead><tr className="text-left text-muted"><th className="font-medium">Measure</th><th className="font-medium">Ours</th><th className="font-medium">References ({l.references})</th><th /></tr></thead>
                    <tbody>{l.rows.map((r) => (
                      <tr key={r.measure}><td className="pr-2">{r.measure}</td><td>{r.ours ?? "–"}</td><td>{r.theirs ?? "–"}</td>
                        <td>{r.within == null ? "" : r.within ? <span className="text-good-text">within 25%</span> : <span className="text-warning-text">off</span>}</td></tr>
                    ))}</tbody>
                  </table>
                ) : <p className="mt-2 text-[12px] text-muted">Likeness not measured yet.</p>}
              </div>
            </div>
          );
        })}
        {samples && !samples.length && <p className="text-[12.5px] text-muted">The samples appear here once they are made.</p>}
      </div>

      {review?.advice && <div className="rounded-lg border border-line p-3"><AdviceText text={review.advice} /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium text-ink2">Shorts a day</span>
          <Segmented label={`Accepted Shorts a day for ${c.name}`} value={perDay} onChange={setPerDay} options={["0", "1", "2", "3"].map((v) => ({ value: v, label: v }))} />
          <span className="text-[12.5px] font-medium text-ink2">Long videos a week</span>
          <Segmented label={`Accepted long videos a week for ${c.name}`} value={perWeek} onChange={setPerWeek} options={["0", "1", "2"].map((v) => ({ value: v, label: v }))} />
          {review?.counts && <ul className="mt-1 space-y-0.5 text-[11.5px] text-muted">{review.counts.reasons.map((r) => <li key={r}>{r}</li>)}<li>Research advises {review.counts.shortsPerDay} a day and {review.counts.longPerWeek} a week.</li></ul>}
        </div>
        <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); act.mutate({ id: c.id, action: "note", text: note }, { ...done("Note sent: the samples come back fixed"), onSuccess: () => { setNote(""); toast("Note sent: the samples come back fixed"); } }); }}>
          <label htmlFor={`note-${c.id}`} className="text-[12.5px] font-medium text-ink2">Notes for the samples</label>
          <textarea id={`note-${c.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1500} placeholder="What to change (the look, the voice, the pace, the topics…)" className={`${fieldClass} h-auto py-2`} />
          <div><Button size="sm" type="submit" disabled={act.isPending || note.trim().length < 3}>Send notes</Button></div>
          {open.length > 0 && <ul className="space-y-0.5 text-[11.5px] text-muted">{open.map((n) => <li key={n.at}>Being fixed: {n.text}</li>)}</ul>}
          {rounds >= 3 && !review?.approved && <p className="text-[12px] text-warning-text">Three rounds of notes so far: would a different reference or niche fit better?</p>}
        </form>
      </div>

      {fit && (
        <div className="rounded-lg bg-surface-2 p-3 text-[12.5px]">
          <div className="font-medium">{fit.fits ? "Its routines (IST)" : "It doesn't fit the routine schedule"}</div>
          {fit.problems.map((p) => <p key={p} className="mt-1 text-critical-text">{p}</p>)}
          <ul className="mt-1 grid gap-x-4 text-ink2 sm:grid-cols-2">
            {fit.slots.filter((s) => s.routine !== "market").map((s) => <li key={`${s.routine}${s.days}`}>{s.ist} {s.routine} · {s.days === "daily" ? "every day" : s.days}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {!review?.approved && (
          <Button tone="primary" disabled={act.isPending || setup.stage !== "review"} onClick={() => act.mutate({ id: c.id, action: "approve", shortsPerDay: Number(perDay), longPerWeek: Number(perWeek) }, done("Approved"))}>I like it</Button>
        )}
        {review?.approved && (
          <Button tone="primary" icon={Rocket} disabled={launch.isPending || !c.connected || fit?.fits === false} onClick={() => launch.mutate(c.id, done(`${c.name} is live: the first upload is the next slot`))}>Launch</Button>
        )}
        {review?.approved && !c.connected && <span className="text-[12px] text-muted">Create the channel on YouTube from the branding kit, then Connect YouTube to launch.</span>}
        <Button disabled={act.isPending} onClick={() => act.mutate({ id: c.id, action: "stop" }, done("Stopped"))}>Stop</Button>
      </div>
    </div>
  );
}

// YouTube's separate daily buckets (2026-11-19): 100 upload calls, 100 search calls, and 10,000 units
// for everything else. Units: reads (2026-11-18 cuts: live counters <=300, comments <=30, stats ~70,
// market lookups) about 700 a day, plus a 50-unit cover per upload.
const DAILY_UPLOADS = 100, UPLOAD_STOP = 95, READ_UNITS = 700, COVER_UNITS = 50, DAILY_UNITS = 10_000;

/** YouTube quota a day across the live channels: upload calls on a peak day (Shorts + a long video) and the units pool. */
function QuotaLine({ channels, platform }: { channels: Channel[]; platform?: { dailyVideoTarget: number; longPerWeek: number } }) {
  const live = channels.filter((c) => c.status === "active");
  const perChannel = live.map((c) => ({ perDay: c.settings.dailyVideoTarget ?? platform?.dailyVideoTarget ?? 3, perWeek: c.settings.longPerWeek ?? platform?.longPerWeek ?? 0 }));
  const uploads = perChannel.reduce((a, c) => a + c.perDay + (c.perWeek > 0 ? 1 : 0), 0);
  const units = READ_UNITS + perChannel.reduce((a, c) => a + (c.perDay + c.perWeek / 7) * COVER_UNITS, 0);
  const over = uploads > UPLOAD_STOP || units > DAILY_UNITS;
  return (
    <p className={`mb-5 text-[12.5px] ${over ? "text-critical-text" : "text-muted"}`}>
      Uploads: {uploads} of {DAILY_UPLOADS} a day across {live.length} live channel{live.length === 1 ? "" : "s"}; other calls about {Math.round(units).toLocaleString("en")} of {DAILY_UNITS.toLocaleString("en")} units.
      {over && " Over the limit: lower a channel's videos, or apply for YouTube's quota increase."}
    </p>
  );
}

const HEALTH = { green: "bg-good", amber: "bg-warning", red: "bg-critical" } as const;
function HealthDot({ color }: { color: keyof typeof HEALTH }) {
  return <span aria-label={`Health: ${color}`} className={`inline-block size-2 shrink-0 rounded-full ${HEALTH[color]}`} />;
}

function ChannelCard({ c, current }: { c: Channel; current: boolean }) {
  const patch = usePatchChannel();
  const toast = useToast();
  const switchTo = useSwitchChannel();
  const { data: platform } = useSettings();
  const s = STATUS[c.status];
  const perDay = c.settings.dailyVideoTarget ?? platform?.dailyVideoTarget ?? 3;
  const perWeek = c.settings.longPerWeek ?? platform?.longPerWeek ?? 0;
  const [times, setTimes] = useState((c.settings.uploadTimes ?? platform?.uploadTimes ?? []).join(", "));
  const run = (body: Parameters<typeof patch.mutate>[0], ok: string) => patch.mutate(body, { onSuccess: () => toast(ok), onError: (e) => toast(e.message, "error") });
  const live = c.status === "active" || c.status === "paused";

  return (
    <Card icon={Tv} accent={current ? "lime" : "surface"} title={<span className="flex flex-wrap items-center gap-2">{c.name}<Badge tone={s.tone} dot>{s.label}</Badge>{current && <Badge tone="brand">Showing</Badge>}</span>}
      description={c.health && c.status !== "setup" ? <span className="flex items-center gap-1.5"><HealthDot color={c.health.color} />{c.health.reason}{c.health.usageShare != null ? ` · ${Math.round(c.health.usageShare * 100)}% of the week's routine time` : ""}</span> : s.why}
      action={!current && <Button size="sm" onClick={() => switchTo(c.id)}>Show this channel</Button>}>
      {c.setup && c.status === "setup" && <SetupPanel c={c} />}
      {c.setup && c.status === "setup" && ["samples", "review"].includes(c.setup.stage) && <ReviewPanel c={c} />}
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
          <span className="text-[11.5px] text-muted">Turn a channel down when Claude usage runs short.{perDay < 2 && perDay > 0 ? " Under 2 a day, each weekly-loop test takes about two weeks." : ""}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12.5px] font-medium text-ink2">Long videos a week</span>
          <Segmented label={`Long videos a week for ${c.name}`} value={String(perWeek)} onChange={(v) => run({ id: c.id, settings: { longPerWeek: Number(v) } }, `${c.name}: ${v} long video${v === "1" ? "" : "s"} a week`)}
            options={["0", "1", "2"].map((v) => ({ value: v, label: v }))} />
          <span className="text-[11.5px] text-muted">Each upload uses 1 of YouTube&apos;s 100 uploads a day (shared by all channels) and 50 of its 10,000 other units.</span>
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
  const { data: platform } = useSettings();
  return (
    <>
      <Suspense><Notice /></Suspense>
      <PageHeader title="Channels" sub="Every channel runs on the same platform. Pause, resume or turn one down here; the switcher at the top left picks which one the other pages show." />
      {isLoading && <Loading rows={3} />}
      {error && <ErrorNote error={error} />}
      {data && <QuotaLine channels={data.channels} platform={platform} />}
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
