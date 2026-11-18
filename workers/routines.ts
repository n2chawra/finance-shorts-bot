/**
 * The routine schedule for every channel (apps/dashboard/src/lib/routine-plan.ts), from the repo's
 * config/channels.json and config/settings.json, for the /new-channel skill's launch phase:
 *
 *   npm run routines                       every routine, all live channels
 *   npm run routines -- --add <slug>       the routines a channel being launched gets, its prompts, and
 *                                          whether it fits (exit 1 when it doesn't)
 *
 * The routines themselves live at claude.ai → Code → Routines; the skill creates the new channel's
 * there (with the owner's yes) from this output. Keep workers/lib/schedule.ts's SCHEDULE in step.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { type PlanChannel, fitCheck, planRoutines, promptFor } from "../apps/dashboard/src/lib/routine-plan.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (f: string) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {}) as Record<string, unknown>;

/** Whether a channel draws in 3D (channels/<id>/channel.json look.engine "three"). */
const is3D = (id: string): boolean =>
  ((read(path.join(ROOT, "channels", id, "channel.json")).look ?? {}) as { engine?: string }).engine === "three";

type Entry = { name: string; status: string; settings?: Record<string, unknown>; setup?: { stage?: string } };

export function planChannels(channels: Record<string, Entry>, platform: Record<string, unknown>, counts: Record<string, { shortsPerDay: number; longPerWeek: number }> = {}): { live: PlanChannel[]; all: Record<string, PlanChannel> } {
  const all: Record<string, PlanChannel> = {};
  for (const [id, c] of Object.entries(channels)) {
    const own = c.settings ?? {};
    const pick = <T,>(k: string, d: T): T => (own[k] ?? platform[k] ?? d) as T;
    all[id] = { id, name: c.name, shortsPerDay: counts[id]?.shortsPerDay ?? pick("dailyVideoTarget", 3), longPerWeek: counts[id]?.longPerWeek ?? pick("longPerWeek", 0),
      uploadTimes: pick<string[]>("uploadTimes", []), longUploadTimes: pick<string[]>("longUploadTimes", []),
      // a 3D channel's cloud renders have no GPU: its video run starts 4.5 h before its first Short
      ...(is3D(id) ? { videoLeadMin: 270 } : {}) };
  }
  const live = Object.entries(channels).filter(([, c]) => c.status === "active" || c.status === "paused").map(([id]) => all[id]!);
  return { live, all };
}

function main(): void {
  const args = process.argv.slice(2);
  const adding = args.includes("--add");
  const add = adding ? args[args.indexOf("--add") + 1] : undefined;
  const channels = (read(path.join(ROOT, "config", "channels.json")).channels ?? {}) as Record<string, Entry>;
  const platform = read(path.join(ROOT, "config", "settings.json"));
  const counts: Record<string, { shortsPerDay: number; longPerWeek: number }> = {};
  if (add) {
    const c = read(path.join(ROOT, "channels", add, "research", "counts.json")) as { shortsPerDay?: number; longPerWeek?: number };
    const n = (flag: string, d?: number) => (args.includes(flag) ? Number(args[args.indexOf(flag) + 1]) : d);
    counts[add] = { shortsPerDay: n("--shorts", c.shortsPerDay) ?? 1, longPerWeek: n("--long", c.longPerWeek) ?? 0 };
  }
  const { live, all } = planChannels(channels, platform, counts);
  if (add) {
    const next = all[add] ?? { id: add, name: add, uploadTimes: [], ...counts[add]! };
    const f = fitCheck(live, next);
    console.log(f.fits ? `${add} fits. Its routines:` : `${add} does NOT fit:\n  ${f.problems.join("\n  ")}`);
    for (const m of f.moved) console.log(`Also move the shared ${m.routine} routine: ${m.from} → ${m.to} IST, cron (UTC) "${m.cron}"`);
    for (const s of f.slots) console.log(`\n${s.routine} · ${s.ist} IST · ${s.days} · window ${s.window} · cron (UTC) "${s.cron}"\n  ${promptFor(s).replace(/\n+/g, "\n  ")}`);
    process.exitCode = f.fits ? 0 : 1;
    return;
  }
  const p = planRoutines(live);
  for (const s of p.slots) console.log(`${s.ist}  ${s.days.padEnd(8)} ${s.window.padEnd(6)} ${s.routine.padEnd(9)} ${s.channel ?? "(shared)"}`);
  if (p.problems.length) console.log(`\nProblems:\n  ${p.problems.join("\n  ")}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) main();
