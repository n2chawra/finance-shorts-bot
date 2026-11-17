/**
 * The quota keeper: every channel shares one Google project and its YouTube Data API quota (10,000
 * units a day, reset at midnight Pacific). Uploads come first, then covers, then stats and the live
 * counters: a lower-priority call is refused when it would eat into what today's remaining uploads
 * need. Usage is kept in the Setting row "quotaUsage" so every worker run adds to the same day.
 */
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const DAILY_UNITS = Number(process.env.YT_QUOTA_UNITS) || 10_000;
export const COST = { upload: 1_600, thumbnail: 50, list: 1, search: 100 } as const;

/** Lower number = more important. */
export const PRIORITY = { upload: 0, thumbnail: 1, stats: 2, counters: 3 } as const;
export type Kind = keyof typeof PRIORITY;

const Usage = z.object({ day: z.string(), units: z.number(), byKind: z.record(z.string(), z.number()).default({}), warned: z.boolean().default(false) });
export type Usage = z.infer<typeof Usage>;

/** The quota day: YouTube resets it at midnight in America/Los_Angeles. */
export function quotaDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * May a call of `kind` costing `units` run? Uploads may use the whole budget; a cover may use what
 * isn't reserved for the uploads still due today; stats and counters also leave a 5% margin.
 */
export function allowed(kind: Kind, units: number, used: number, uploadsLeftToday: number, limit = DAILY_UNITS): boolean {
  const free = limit - used;
  if (kind === "upload") return units <= free;
  const reserve = uploadsLeftToday * (COST.upload + COST.thumbnail);
  const margin = kind === "thumbnail" ? 0 : Math.round(limit * 0.05);
  return units <= free - reserve - margin;
}

export class QuotaKeeper {
  private usage: Usage;
  constructor(private prisma: PrismaClient | null, usage: Usage, public uploadsLeftToday = 0, private limit = DAILY_UNITS) {
    this.usage = usage;
  }

  static async load(prisma: PrismaClient, uploadsLeftToday = 0, now = new Date()): Promise<QuotaKeeper> {
    const row = await prisma.setting.findUnique({ where: { key: "quotaUsage" } });
    const parsed = Usage.safeParse(row?.value);
    const day = quotaDay(now);
    const usage = parsed.success && parsed.data.day === day ? parsed.data : { day, units: 0, byKind: {}, warned: false };
    return new QuotaKeeper(prisma, usage, uploadsLeftToday);
  }

  get used(): number { return this.usage.units; }
  get left(): number { return this.limit - this.usage.units; }

  /** Reserve `units` for a call; false (and nothing recorded) when the budget says no. */
  take(kind: Kind, units: number): boolean {
    if (!allowed(kind, units, this.usage.units, this.uploadsLeftToday, this.limit)) return false;
    this.usage.units += units;
    this.usage.byKind[kind] = (this.usage.byKind[kind] ?? 0) + units;
    if (kind === "upload" && this.uploadsLeftToday > 0) this.uploadsLeftToday--;
    return true;
  }

  /** True once, the first time a day's usage passes 80%: the caller raises a notification. */
  shouldWarn(): boolean {
    if (this.usage.warned || this.usage.units < this.limit * 0.8) return false;
    this.usage.warned = true;
    return true;
  }

  snapshot(): Usage { return { ...this.usage, byKind: { ...this.usage.byKind } }; }

  async save(): Promise<void> {
    if (!this.prisma) return;
    const value = this.snapshot();
    await this.prisma.setting.upsert({ where: { key: "quotaUsage" }, update: { value }, create: { key: "quotaUsage", value } });
  }
}
