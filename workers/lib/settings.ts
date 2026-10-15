import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

/** Every setting, one row per key in the Setting table. Missing rows fall back to these defaults. */
export const SettingsSchema = z.object({
  uploadTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).min(1).max(4),
  backlogCap: z.number().int().min(1).max(100),
  lengthMinSec: z.number().int(),
  lengthMaxSec: z.number().int(),
  disclaimer: z.string(),
  uploadsPaused: z.boolean(),
  generationPaused: z.boolean(),
  templateWork: z.object({ maxPerDay: z.number().int().min(0), maxTemplates: z.number().int().min(1) }),
  alerts: z.object({
    failedRun: z.boolean(), failedUpload: z.boolean(), tokenErrors: z.boolean(), lowBacklog: z.boolean(),
    lowBacklogThreshold: z.number().int(),
  }),
  /** Self-improving agents: master switch, one switch each, and how many A/B tests may run at once. */
  agents: z.object({
    paused: z.boolean(), research: z.boolean(), improver: z.boolean(), dashboard: z.boolean(), auditor: z.boolean().default(true),
    maxActiveExperiments: z.number().int().min(0).max(6),
  }),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  uploadTimes: ["12:37", "19:07"],
  backlogCap: 30,
  lengthMinSec: 45,
  lengthMaxSec: 60,
  disclaimer: "Illustrative only. Not financial advice.",
  uploadsPaused: false,
  generationPaused: false,
  templateWork: { maxPerDay: 1, maxTemplates: 10 },
  alerts: { failedRun: true, failedUpload: true, tokenErrors: true, lowBacklog: true, lowBacklogThreshold: 5 },
  agents: { paused: false, research: true, improver: true, dashboard: true, auditor: true, maxActiveExperiments: 3 },
};

/** Settings from the database over the defaults. Rows that fail validation are ignored. */
export async function loadSettings(prisma: PrismaClient): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  const parsed = SettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

/** Insert a row for every setting that has none, so the dashboard and SQL editor show them all. */
export async function seedSettings(prisma: PrismaClient): Promise<void> {
  const have = new Set((await prisma.setting.findMany({ select: { key: true } })).map((r) => r.key));
  const missing = Object.entries(DEFAULT_SETTINGS).filter(([key]) => !have.has(key));
  if (missing.length) await prisma.setting.createMany({ data: missing.map(([key, value]) => ({ key, value })) });
}
