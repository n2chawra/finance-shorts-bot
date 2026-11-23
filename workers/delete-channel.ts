/**
 * Delete one channel (the dashboard's "Delete channel", 2026-11-23), in two steps of .github/workflows/delete-channel.yml:
 *
 *   npm run delete-channel -- mark  <slug> <confirm>    what the dashboard's Delete button does, for a run started
 *                                                       without the dashboard: <confirm> must be the slug or exact name
 *   npm run delete-channel -- list  <slug> <ids-file>   which videos go: writes their ids, one a line, and prints them
 *   npm run delete-channel -- purge <slug>              the channel's database rows, then its Channel row
 *
 * The workflow deletes the videos' `video-<id>` releases and per-video code between the two, so the id list never
 * depends on rows that are already gone. Both refuse unless the Channel row's status is "deleting" (the dashboard
 * sets it), so a typo in the workflow's input can't wipe a live channel; the default channel is never deleted; with
 * no Channel row left (a re-run) they only clean up a channel whose folder is gone and that config/channels.json
 * doesn't list as live. A database error fails the job.
 *
 * The ids are the channel's videos in the database plus its folder's history and videos/, minus any id another
 * channel's folder records. The purge, in one transaction: the rows that name the channel (feedback, studies, agent
 * activity, notifications, breakdowns, channel days), its videos (their QA checks, uploads with their stats,
 * snapshots and comments, and agent runs go with them by ON DELETE CASCADE; another channel's feedback or study that
 * pointed at one keeps its row with the video unset), its topics, its own RepoDoc and Setting keys, and last the
 * Channel row. Platform-wide rows (channelId null) stay; channel #1's shared-agent activity and platform
 * notifications, which took it as the column default, become platform-wide (null) instead of being deleted.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import type { PrismaClient } from "@prisma/client";

import { newPrisma } from "./lib/db.ts";
import { DOCS, DOC_HASHES, SHARED_AGENTS } from "./lib/agents-sync.ts";
import { CHANNEL_ONE, layout } from "./lib/channels.ts";
import { idsOfOtherChannels, idsToDelete, isPlatformNotice, refusal, repoDocKeysOf, repoState, repoVideoIds, settingKeysOf } from "./lib/delete-channel.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

type Row = { id: string; name: string; status: string } | null;

/** The Channel row, or null when there is none; a database error throws (never read as "no row"). */
async function channelRow(prisma: PrismaClient, slug: string): Promise<Row> {
  return prisma.channel.findUnique({ where: { id: slug }, select: { id: true, name: true, status: true } });
}

function refuse(slug: string, ch: Row): boolean {
  const why = refusal(slug, ch?.status ?? null, repoState(ROOT, slug, layout(ROOT).default));
  if (!why) return false;
  console.error(`::error::${why}`);
  process.exitCode = 1;
  return true;
}

async function list(prisma: PrismaClient, slug: string, out: string): Promise<void> {
  const ch = await channelRow(prisma, slug);
  if (refuse(slug, ch)) return;
  const db = (await prisma.video.findMany({ where: { channelId: slug }, select: { id: true }, orderBy: { id: "asc" } })).map((v) => v.id);
  const { ids, kept } = idsToDelete(db, repoVideoIds(ROOT, slug), idsOfOtherChannels(ROOT, slug));
  writeFileSync(path.resolve(out), ids.map((id) => `${id}\n`).join(""));
  console.log(`${slug}: ${ids.length} videos to remove (${db.length} in the database)${ids.length ? `: ${ids.join(" ")}` : ""}`);
  if (kept.length) console.log(`::warning::kept ${kept.length} ids another channel's folder records: ${kept.join(" ")}`);
}

async function purge(prisma: PrismaClient, slug: string): Promise<void> {
  const ch = await channelRow(prisma, slug);
  if (refuse(slug, ch)) return;
  if (!ch) {
    console.log(`::notice::No Channel row for ${slug}: the database is already clean.`);
    return;
  }
  const docKeys = repoDocKeysOf(slug, (await prisma.repoDoc.findMany({ select: { key: true } })).map((r) => r.key), [...Object.keys(DOCS), DOC_HASHES]);
  const settingKeys = settingKeysOf(slug, (await prisma.setting.findMany({ select: { key: true } })).map((r) => r.key));
  const counts = await prisma.$transaction(async (tx) => {
    const where = { channelId: slug };
    const n: Record<string, number> = {};
    if (slug === CHANNEL_ONE) {
      // the platform's rows that took channel #1 as the column default: kept, for every channel
      n.sharedActivityKept = (await tx.agentActivity.updateMany({ where: { ...where, agent: { in: [...SHARED_AGENTS] } }, data: { channelId: null } })).count;
      const platform = (await tx.notification.findMany({ where, select: { id: true, dedupeKey: true } })).filter((x) => isPlatformNotice(x.dedupeKey)).map((x) => x.id);
      n.platformNoticesKept = platform.length ? (await tx.notification.updateMany({ where: { id: { in: platform } }, data: { channelId: null } })).count : 0;
    }
    n.feedback = (await tx.feedback.deleteMany({ where })).count;
    n.study = (await tx.study.deleteMany({ where })).count;
    n.agentActivity = (await tx.agentActivity.deleteMany({ where })).count;
    n.notification = (await tx.notification.deleteMany({ where })).count;
    n.breakdown = (await tx.breakdown.deleteMany({ where })).count;
    n.channelDay = (await tx.channelDay.deleteMany({ where })).count;
    n.uploads = await tx.upload.count({ where: { video: where } });
    n.video = (await tx.video.deleteMany({ where })).count;   // QaCheck, Upload (VideoStat, LiveSnapshot, Comment), AgentRun cascade
    // a topic another channel's video still uses moves to that channel instead of breaking its video
    for (const t of await tx.topic.findMany({ where: { ...where, videos: { some: {} } }, select: { id: true, videos: { select: { channelId: true }, take: 1 } } })) {
      await tx.topic.update({ where: { id: t.id }, data: { channelId: t.videos[0]!.channelId } });
    }
    n.topic = (await tx.topic.deleteMany({ where })).count;
    n.repoDoc = (await tx.repoDoc.deleteMany({ where: { key: { in: docKeys } } })).count;
    n.setting = (await tx.setting.deleteMany({ where: { key: { in: settingKeys } } })).count;
    await tx.channel.delete({ where: { id: slug } });
    return n;
  }, { timeout: 300_000, maxWait: 30_000 });
  console.log(JSON.stringify({ channel: slug, name: ch.name, deleted: counts }, null, 2));
}

/** Video statuses that are not on YouTube yet (the dashboard route's UNPUBLISHED). */
const UNPUBLISHED = ["planned", "scripted", "verified", "rendered", "qa_passed", "queued"];

/** The dashboard's Delete button without the dashboard: the typed confirmation must name the channel exactly. */
async function mark(prisma: PrismaClient, slug: string, confirm: string): Promise<void> {
  const ch = await channelRow(prisma, slug);
  const why = !ch ? `no channel ${slug}`
    : slug === layout(ROOT).default ? `${slug} is the default channel (config/channel-layout.json): make another channel the default first`
    : confirm.trim() !== ch.id && confirm.trim() !== ch.name ? `the confirmation must be "${ch.id}" or "${ch.name}" exactly`
    : null;
  if (why) {
    console.error(`::error::${why}`);
    process.exitCode = 1;
    return;
  }
  if (ch!.status === "deleting") return void console.log(`${slug} is already marked deleting`);
  const [, uploads, videos] = await prisma.$transaction([
    prisma.channel.update({ where: { id: slug }, data: { status: "deleting" } }),
    prisma.upload.deleteMany({ where: { youtubeId: null, state: { in: ["pending", "failed"] }, video: { channelId: slug } } }),
    prisma.video.updateMany({ where: { channelId: slug, status: { in: UNPUBLISHED as never }, upload: { is: null } },
      data: { status: "rejected", failReason: "Channel deleted", queuePosition: null, pickedAt: null } }),
  ]);
  console.log(`${slug}: marked deleting; ${uploads.count} unsent uploads removed, ${videos.count} unpublished videos rejected`);
}

async function main(): Promise<void> {
  const [mode = "", slug = "", out = "deleted-videos.txt"] = process.argv.slice(2);
  if (mode !== "list" && mode !== "purge" && mode !== "mark") {
    console.error("::error::usage: delete-channel mark <slug> <confirm> | delete-channel list <slug> <ids-file> | delete-channel purge <slug>");
    process.exitCode = 1;
    return;
  }
  const prisma = newPrisma();
  try {
    if (mode === "mark") await mark(prisma, slug, out);
    else if (mode === "list") await list(prisma, slug, out);
    else await purge(prisma, slug);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
