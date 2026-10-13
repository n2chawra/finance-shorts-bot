/**
 * Empty the database of generated data: videos, topics, checks, uploads, stats and run logs.
 * Templates and settings are kept. This cannot be undone.
 *
 *   npm run reset-data            shows what would be deleted
 *   npm run reset-data -- --yes   deletes it
 *
 * Remove the videos/<id>/ folders from the repo first, or the next ingest adds them back.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const counts = {
    videos: await prisma.video.count(), topics: await prisma.topic.count(), checks: await prisma.qaCheck.count(),
    uploads: await prisma.upload.count(), stats: await prisma.videoStat.count(), runSteps: await prisma.agentRun.count(),
  };
  const kept = { templates: await prisma.template.count(), settings: await prisma.setting.count() };
  console.log("to delete:", counts);
  console.log("kept:", kept);
  if (!process.argv.includes("--yes")) {
    console.log("Nothing deleted. Run again with --yes to delete.");
  } else {
    await prisma.$transaction([
      prisma.videoStat.deleteMany(), prisma.upload.deleteMany(), prisma.qaCheck.deleteMany(), prisma.agentRun.deleteMany(),
      prisma.video.deleteMany(), prisma.topic.deleteMany(), prisma.template.updateMany({ data: { lastUsedAt: null } }),
    ]);
    console.log("Deleted. Videos now in database:", await prisma.video.count());
  }
} finally {
  await prisma.$disconnect();
}
