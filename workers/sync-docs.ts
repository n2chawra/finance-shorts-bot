/**
 * Copy the agents' repo files into RepoDoc again (the dashboard reads them there). Ingest runs it after
 * the Python steps that write new files, e.g. the weekly loop's scoreboard (improvement/cycle/status.json),
 * so the Growth loop page shows them in the same run instead of six hours later.
 *
 * Per live channel, like ingest: each channel's files under its own keys (lib/scoped.ts). A channel being
 * deleted (allChannels leaves it out; the database's "deleting" ones too) is skipped.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { newPrisma } from "./lib/db.ts";
import { snapshotDocs } from "./lib/agents-sync.ts";
import { allChannels, markDeleting } from "./lib/channels.ts";
import { scopedPrisma } from "./lib/scoped.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const prisma = newPrisma();
const before = process.env.CHANNEL;
try {
  markDeleting((await prisma.channel.findMany({ where: { status: "deleting" }, select: { id: true } })).map((c) => c.id));
  const known = new Set((await prisma.channel.findMany({ select: { id: true } })).map((c) => c.id));
  for (const slug of allChannels(ROOT)) {
    if (!known.has(slug) || !existsSync(path.join(ROOT, "channels", slug))) continue;
    process.env.CHANNEL = slug;
    const n = await snapshotDocs(scopedPrisma(prisma, slug), ROOT);
    console.log(`${slug}: ${n} agent docs synced`);
  }
} finally {
  if (before === undefined) delete process.env.CHANNEL; else process.env.CHANNEL = before;
  await prisma.$disconnect();
}
