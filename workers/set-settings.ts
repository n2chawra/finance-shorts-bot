/**
 * Set dashboard settings from the command line, for when the owner asks Claude to change one instead
 * of using the Settings page. Run by .github/workflows/set-settings.yml (it holds DATABASE_URL):
 *
 *   gh workflow run set-settings.yml -f patch='{"uploadTimes": ["05:37", "12:37"], "agents": {"maxActiveExperiments": 5}}'
 *
 * The patch is merged over the stored settings (one level deep for objects such as `agents`), the
 * result must pass the same schema as everything else, and only the patched keys are written.
 */
import { PrismaClient } from "@prisma/client";

import { DEFAULT_SETTINGS, type Settings, SettingsSchema } from "./lib/settings.ts";

type Patch = Partial<Record<keyof Settings, unknown>>;

/** The stored settings with `patch` applied, validated. Throws on an unknown key or an invalid value. */
export function applyPatch(stored: Record<string, unknown>, patch: Patch): { next: Settings; changed: (keyof Settings)[] } {
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS, ...stored };
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in DEFAULT_SETTINGS)) throw new Error(`unknown setting ${key}`);
    const old = merged[key];
    const isObject = (x: unknown) => typeof x === "object" && x !== null && !Array.isArray(x);
    merged[key] = isObject(old) && isObject(value) ? { ...(old as object), ...(value as object) } : value;
  }
  const next = SettingsSchema.parse(merged);
  return { next, changed: Object.keys(patch) as (keyof Settings)[] };
}

async function main(): Promise<void> {
  const raw = process.env.SETTINGS_PATCH ?? process.argv[2];
  if (!raw) throw new Error("pass the patch as SETTINGS_PATCH or the first argument (JSON)");
  const patch = JSON.parse(raw) as Patch;
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.setting.findMany();
    const stored = Object.fromEntries(rows.filter((r) => r.key in DEFAULT_SETTINGS).map((r) => [r.key, r.value]));
    const { next, changed } = applyPatch(stored, patch);
    await prisma.$transaction(changed.map((key) => prisma.setting.upsert({
      where: { key }, update: { value: next[key] as object }, create: { key, value: next[key] as object },
    })));
    for (const key of changed) console.log(`${key}: ${JSON.stringify(stored[key] ?? null)} -> ${JSON.stringify(next[key])}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("set-settings.ts")) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
}
