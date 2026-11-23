/**
 * Delete one channel's rows from the database (the dashboard's "Delete channel", 2026-11-23):
 *
 *   npm run delete-channel -- <slug> <ids-file>
 *
 * Run by .github/workflows/delete-channel.yml, which then deletes the videos' GitHub releases and the channel's
 * files. Refuses unless the Channel row's status is "deleting" (the dashboard sets it), so a typo in the
 * workflow's input can't wipe a live channel. With no Channel row left (a re-run) it only lists nothing.
 *
 * Before deleting, it writes the channel's video ids, one a line, to <ids-file> (the workflow deletes the
 * `video-<id>` releases and the per-video code folders from it). Then in one transaction: the rows that name the
 * channel (feedback, studies, agent activity, notifications, breakdowns, channel days), its videos (their QA
 * checks, uploads with their stats, snapshots and comments, and agent runs go with them by ON DELETE CASCADE;
 * another channel's feedback or study that pointed at one keeps its row with the video unset), its topics, its
 * own RepoDoc and Setting keys, and last the Channel row. Platform-wide rows (channelId null) stay.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

import { newPrisma } from "./lib/db.ts";
import { DOCS, DOC_HASHES } from "./lib/agents-sync.ts";
import { refusal, repoDocKeysOf, safeIds, settingKeysOf } from "./lib/delete-channel.ts";

async function main(): Promise<void> {
  const [slug = "", out = "deleted-videos.txt"] = process.argv.slice(2);
  const prisma = newPrisma();
  try {
    const ch = await prisma.channel.findUnique({ where: { id: slug }, select: { id: true, name: true, status: true } }).catch(() => null);
    const why = refusal(slug, ch?.status ?? null);
    if (why) {
      console.error(`::error::${why}`);
      process.exitCode = 1;
      return;
    }
    const videos = await prisma.video.findMany({ where: { channelId: slug }, select: { id: true }, orderBy: { id: "asc" } });
    const ids = safeIds(videos.map((v) => v.id));
    writeFileSync(path.resolve(out), ids.map((id) => `${id}\n`).join(""));
    console.log(`${slug}: ${ids.length} videos in the database${ids.length ? `: ${ids.join(" ")}` : ""}`);
    if (!ch) {
      console.log(`::notice::No Channel row for ${slug}: the database is already clean.`);
      return;
    }
    const docKeys = repoDocKeysOf(slug, (await prisma.repoDoc.findMany({ select: { key: true } })).map((r) => r.key), [...Object.keys(DOCS), DOC_HASHES]);
    const settingKeys = settingKeysOf(slug, (await prisma.setting.findMany({ select: { key: true } })).map((r) => r.key));
    const counts = await prisma.$transaction(async (tx) => {
      const where = { channelId: slug };
      const n: Record<string, number> = {};
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
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
