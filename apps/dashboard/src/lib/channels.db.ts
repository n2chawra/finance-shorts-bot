import type { Prisma } from "@prisma/client";

import { type Channel, type ChannelCreate, type ChannelPatch, ChannelSettingsSchema, DEFAULT_CHANNEL, SetupSchema, slugify } from "./channels";
import { dispatchWorkflow } from "./dispatch";
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
      connected: Boolean(r.refreshTokenEnc) || r.id === DEFAULT_CHANNEL,
      youtubeChannelId: r.youtubeChannelId, connectedAt: r.connectedAt?.toISOString() ?? null,
      settings: own.success ? own.data : {}, request: stored.request ?? null,
      counts: { queued: count("queued"), published: count("published"), views7d: Number(views.find((v) => v.channelId === r.id)?.views ?? 0) },
      setup: stored.setup ? (SetupSchema.safeParse(stored.setup).data ?? null) : null,
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
