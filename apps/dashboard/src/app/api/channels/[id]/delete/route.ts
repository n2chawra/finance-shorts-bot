import { NextResponse } from "next/server";

import { ChannelDeleteSchema, SLUG, confirmsDelete } from "@/lib/channels";
import { forgetLiveChannels } from "@/lib/channel-scope";
import { dispatchWorkflow } from "@/lib/dispatch";
import { prismaAll as db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Video statuses that are not on YouTube yet: a deleted channel's are rejected so nothing more uploads. */
const UNPUBLISHED = ["planned", "scripted", "verified", "rendered", "qa_passed", "queued"] as const;

/**
 * "Delete channel" (owner, 2026-11-23). The owner typed the channel's slug or exact name. At once, in one
 * transaction: the channel is marked `deleting` (the publisher and routines only work on active channels;
 * the switcher hides it), its uploads that never reached YouTube leave the queue, and its unpublished
 * videos are rejected. Then delete-channel.yml purges every row with its channelId, the Channel row, its
 * GitHub release videos and its channels/<slug>/ folder. Videos already on YouTube are never touched.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = ChannelDeleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Type the channel's slug or name to confirm" }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Deleting a channel needs the database (this dashboard runs on sample data)" }, { status: 400 });

  const row = await db.channel.findUnique({ where: { id }, select: { id: true, name: true, status: true } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!confirmsDelete(parsed.data.confirm, row)) return NextResponse.json({ error: `Type "${row.id}" or "${row.name}" exactly to confirm` }, { status: 400 });

  const [, uploads, videos] = await db.$transaction([
    db.channel.update({ where: { id }, data: { status: "deleting" } }),
    // never uploaded: nothing on YouTube to keep (a scheduled or published upload has a youtubeId and stays)
    db.upload.deleteMany({ where: { youtubeId: null, state: { in: ["pending", "failed"] }, video: { channelId: id } } }),
    db.video.updateMany({ where: { channelId: id, status: { in: [...UNPUBLISHED] }, upload: { is: null } },
      data: { status: "rejected", failReason: "Channel deleted", queuePosition: null, pickedAt: null } }),
  ]);
  forgetLiveChannels();

  const d = await dispatchWorkflow("delete-channel.yml", { channel: id });
  const done = { ok: true, channel: id, removedUploads: uploads.count, rejectedVideos: videos.count };
  if (!d.dispatched) {
    console.warn(`delete-channel.yml not started for ${id}: ${d.why}`);
    return NextResponse.json({ ...done, dispatched: false, error: d.why });
  }
  return NextResponse.json({ ...done, dispatched: true });
}
