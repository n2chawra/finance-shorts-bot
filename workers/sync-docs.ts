/**
 * Copy the agents' repo files into RepoDoc again (the dashboard reads them there). Ingest runs it after
 * the Python steps that write new files, e.g. the weekly loop's scoreboard (improvement/cycle/status.json),
 * so the Growth loop page shows them in the same run instead of six hours later.
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { snapshotDocs } from "./lib/agents-sync.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const prisma = new PrismaClient();
try {
  await snapshotDocs(prisma, ROOT);
  console.log("agent docs synced");
} finally {
  await prisma.$disconnect();
}
