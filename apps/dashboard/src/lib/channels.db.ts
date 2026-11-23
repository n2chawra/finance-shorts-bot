import type { Prisma } from "@prisma/client";

import { type Channel, type ChannelCreate, type ChannelPatch, ChannelSchema, ChannelSettingsSchema, type ReviewAction, ReviewSchema, SetupSchema, slugify } from "./channels";
import { dispatchWorkflow } from "./dispatch";
import { type PlanChannel, type Slot, fitCheck, promptFor } from "./routine-plan";
import { prismaAll as db } from "./prisma";

/** Channel.settings holds the channel's own settings plus the owner's setup request (`request`). */
type Stored = Record<string, unknown> & { request?: Channel["request"]; setup?: unknown };

const DAY = 86_400_000;

export async function listChannels(): Promise<Channel[]> {
  const rows = await db.channel.findMany({ orderBy: { createdAt: "asc" } });
  const since = new Date(Date.now() - 7 * DAY);
  const [byStatus, views] = await Promise.all([
    db.video.groupBy({ by: ["channelId", "status"], where: { deletedAt: null, status: { in: ["queued", "published"] } }, _count: true }),
    db.$queryRaw<{ channelId: string; views: bigint }[]>`
      SELECT v."channelId", COALESCE(SUM(s.views), 0) AS views
      FROM "VideoStat" s JOIN "Upload" u ON u.id = s."uploadId" JOIN "Video" v ON v.id = u."videoId"
      WHERE s.day >= ${since} GROUP BY v."channelId"`,
  ]);
  return rows.map((r) => {
    const stored = (r.settings ?? {}) as Stored;
    const own = ChannelSettingsSchema.safeParse(stored);
    const count = (status: string) => byStatus.find((b) => b.channelId === r.id && b.status === status)?._count ?? 0;
    return {
      id: r.id, name: r.name, status: r.status, // channel #1 signs in with the YT_REFRESH_TOKEN secret until it is connected here
      connected: Boolean(r.refreshTokenEnc),
      youtubeChannelId: r.youtubeChannelId, connectedAt: r.connectedAt?.toISOString() ?? null,
      settings: own.success ? own.data : {}, request: stored.request ?? null,
      counts: { queued: count("queued"), published: count("published"), views7d: Number(views.find((v) => v.channelId === r.id)?.views ?? 0) },
      setup: stored.setup ? (SetupSchema.safeParse(stored.setup).data ?? null) : null,
      health: ChannelSchema.shape.health.safeParse(stored.health ?? null).data ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function getChannel(id: string): Promise<Channel | null> {
  return (await listChannels()).find((c) => c.id === id) ?? null;
}

export async function patchChannel(id: string, p: ChannelPatch): Promise<Channel | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  // a channel still in setup or review goes live only through its Launch review, never a pause toggle
  if (p.status && !["active", "paused"].includes(row.status)) return { error: `This channel is in ${row.status}; it starts with Launch, not Resume` };
  const stored = (row.settings ?? {}) as Stored;
  const settings = p.settings ? { ...stored, ...p.settings } : stored;
  await db.channel.update({ where: { id }, data: {
    ...(p.name ? { name: p.name } : {}), ...(p.status ? { status: p.status } : {}),
    settings: settings as Prisma.InputJsonValue,
  } });
  return (await getChannel(id))!;
}

export async function addChannel(c: ChannelCreate): Promise<Channel | { error: string }> {
  let id = slugify(c.name ?? c.niche);
  if (await db.channel.findUnique({ where: { id } })) id = `${id.slice(0, 34)}-${Date.now().toString(36).slice(-5)}`;
  await db.channel.create({ data: {
    id, name: c.name ?? c.niche, status: "setup",
    // a new channel starts lean: one Short a day until its research says otherwise
    settings: { dailyVideoTarget: 1, request: { niche: c.niche, description: c.description, references: c.references },
      setup: { stage: "scanning", verdict: null, decision: null, note: "Reading the niche on YouTube (about 10 minutes)", updatedAt: new Date().toISOString() } } as Prisma.InputJsonValue,
  } });
  // the niche scan the quick verdict stands on; without the Actions token the /new-channel skill starts it
  const d = await dispatchWorkflow("niche-scan.yml", { slug: id });
  if (!d.dispatched) console.warn(`niche scan not started for ${id}: ${d.why}`);
  return (await getChannel(id))!;
}

/** Remove a channel added by mistake: only while it is in setup, never connected and without videos. */
export async function removeChannel(id: string): Promise<{ ok: true } | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  if (row.status !== "setup" || row.youtubeChannelId || row.refreshTokenEnc) return { error: "Only a channel still in setup and not connected to YouTube can be removed" };
  if (await db.video.count({ where: { channelId: id } })) return { error: "This channel already has videos" };
  await db.channel.delete({ where: { id } });
  return { ok: true };
}

/** Store a "Connect YouTube" result; refuses a YouTube channel that another of ours already holds. */
export async function connectChannel(id: string, youtubeChannelId: string, sealed: string): Promise<{ ok: true } | { error: string }> {
  const other = await db.channel.findFirst({ where: { youtubeChannelId, NOT: { id } } });
  if (other) return { error: `That YouTube channel is already connected to "${other.name}"` };
  await db.channel.update({ where: { id }, data: { youtubeChannelId, refreshTokenEnc: sealed, connectedAt: new Date() } });
  return { ok: true };
}

/** The owner's Continue or Stop on the quick verdict. Continue starts the full research; Stop ends the setup. */
export async function decideChannel(id: string, choice: "continue" | "stop", note?: string): Promise<Channel | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  const stored = (row.settings ?? {}) as Stored;
  const setup = SetupSchema.safeParse(stored.setup);
  if (!setup.success || setup.data.stage !== "verdict") return { error: "There is no verdict waiting for a decision" };
  const now = new Date().toISOString();
  const next = { ...setup.data, stage: choice === "continue" ? "research" : "stopped", decision: { choice, at: now, ...(note ? { note } : {}) },
    note: choice === "continue" ? "Full research starts in the next free window on your PC" : "Stopped on the quick verdict", updatedAt: now };
  await db.channel.update({ where: { id }, data: { settings: { ...stored, setup: next } as Prisma.InputJsonValue } });
  return (await getChannel(id))!;
}

export type SampleVideo = { id: string; title: string; format: string; status: string; durationSec: number };

/** A channel's sample videos for its Launch review (every video a channel in setup has is a sample). */
export async function channelSamples(id: string): Promise<SampleVideo[]> {
  const rows = await db.video.findMany({ where: { channelId: id, deletedAt: null }, orderBy: { createdAt: "asc" },
    select: { id: true, title: true, format: true, status: true, durationSec: true } });
  return rows;
}

/** The owner's answer on the Launch review: I like it (with the video counts accepted), a note, or Stop. */
export async function reviewChannel(id: string, a: ReviewAction): Promise<Channel | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  const stored = (row.settings ?? {}) as Stored;
  const setup = SetupSchema.safeParse(stored.setup);
  if (!setup.success || !["samples", "review"].includes(setup.data.stage)) return { error: "This channel has no samples to review yet" };
  const now = new Date().toISOString();
  const review = ReviewSchema.parse(setup.data.review ?? {});
  let next = { ...setup.data, updatedAt: now };
  if (a.action === "stop") next = { ...next, stage: "stopped", note: "Stopped on the Launch review" };
  else if (a.action === "note") {
    if (review.notes.filter((n) => !n.done).length >= 10) return { error: "Ten notes are already waiting; let the fixes land first" };
    next = { ...next, review: { ...review, approved: null, notes: [...review.notes, { at: now, text: a.text, ...(a.videoId ? { videoId: a.videoId } : {}), done: false }] },
      note: "Your notes are being fixed; the samples come back re-rendered" };
  } else {
    if (setup.data.stage !== "review") return { error: "The samples are still being made" };
    next = { ...next, review: { ...review, approved: { at: now, shortsPerDay: a.shortsPerDay, longPerWeek: a.longPerWeek } },
      note: "Approved. Create the channel on YouTube from the branding kit, Connect YouTube, then Launch." };
  }
  await db.channel.update({ where: { id }, data: { settings: { ...stored, setup: next } as Prisma.InputJsonValue } });
  return (await getChannel(id))!;
}

/** Launch: an approved, connected channel goes live with the video counts the owner accepted. */
export async function launchChannel(id: string): Promise<Channel | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  const stored = (row.settings ?? {}) as Stored;
  const setup = SetupSchema.safeParse(stored.setup);
  const approved = setup.success ? setup.data.review?.approved : null;
  if (!setup.success || setup.data.stage !== "review" || !approved) return { error: "Approve the samples on the Launch review first" };
  if (!row.refreshTokenEnc) return { error: "Connect YouTube first: the channel has no sign-in yet" };
  const fit = await channelFit(id);
  if ("error" in fit) return fit;
  if (!fit.fits) return { error: `It doesn't fit the routine schedule: ${fit.problems.join("; ")}` };
  const now = new Date().toISOString();
  await db.channel.update({ where: { id }, data: { status: "active", settings: {
    ...stored, dailyVideoTarget: approved.shortsPerDay, longPerWeek: approved.longPerWeek, generationPaused: false, uploadsPaused: false,
    // its own trend slots, none by default: inheriting the platform's put the geography channel's trend
    // slots on the same minutes as the first channel's (2026-11-18)
    trendUploadTimes: (stored as Record<string, unknown>).trendUploadTimes ?? [],
    setup: { ...setup.data, stage: "launched", note: `Launched ${now.slice(0, 10)}: the approved samples go out first`, updatedAt: now },
  } as Prisma.InputJsonValue } });
  return (await getChannel(id))!;
}

/** A channel as the routine planner sees it: its own counts and slots over the platform's. */
async function planOf(rows: { id: string; name: string; settings: unknown }[], override?: { id: string; shortsPerDay: number; longPerWeek: number }): Promise<PlanChannel[]> {
  const platform = Object.fromEntries((await db.setting.findMany({ where: { key: { in: ["dailyVideoTarget", "longPerWeek", "uploadTimes", "longUploadTimes"] } } })).map((s) => [s.key, s.value]));
  return rows.map((r) => {
    const own = (r.settings ?? {}) as Record<string, unknown>;
    const pick = <T,>(k: string, d: T): T => (own[k] ?? platform[k] ?? d) as T;
    const o = override?.id === r.id ? override : null;
    return { id: r.id, name: r.name, shortsPerDay: o?.shortsPerDay ?? pick("dailyVideoTarget", 3), longPerWeek: o?.longPerWeek ?? pick("longPerWeek", 0),
      uploadTimes: pick<string[]>("uploadTimes", []), longUploadTimes: pick<string[]>("longUploadTimes", []) };
  });
}

export type ChannelFit = { fits: boolean; problems: string[]; slots: (Slot & { prompt: string })[] };

/** Whether a channel in review fits next to the live channels, with the routines it would get. */
export async function channelFit(id: string): Promise<ChannelFit | { error: string }> {
  const row = await db.channel.findUnique({ where: { id } });
  if (!row) return { error: "No such channel" };
  const setup = SetupSchema.safeParse(((row.settings ?? {}) as Stored).setup);
  const approved = setup.success ? setup.data.review?.approved : null;
  const counts = approved ?? (setup.success ? setup.data.review?.counts : null);
  const live = await db.channel.findMany({ where: { status: { in: ["active", "paused"] }, NOT: { id } }, orderBy: { createdAt: "asc" } });
  const [plan] = await Promise.all([planOf([...live, row], counts ? { id, shortsPerDay: counts.shortsPerDay, longPerWeek: counts.longPerWeek } : undefined)]);
  const f = fitCheck(plan.slice(0, -1), plan[plan.length - 1]!);
  return { fits: f.fits, problems: f.problems, slots: f.slots.map((s) => ({ ...s, prompt: promptFor(s) })) };
}
