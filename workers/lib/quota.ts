/**
 * The quota keeper: every channel shares one Google project and its YouTube Data API quota, reset at
 * midnight Pacific. Google keeps three separate daily buckets (determine_quota_cost, checked on the
 * project's Quotas page 2026-11-19):
 *   uploads   "Video Uploads per day"  100 calls  videos.insert, 1 a call
 *   searches  "Search Queries per day" 100 calls  search.list, 1 a call
 *   units     "Queries per day"     10,000 units  everything else (thumbnails.set 50, lists 1)
 * Uploads stop a few calls short of their limit; in the units pool covers come first, then stats and
 * the live counters: a lower-priority call is refused when it would eat into the covers today's
 * remaining uploads need. Usage is kept in the Setting row "quotaUsage" so every worker run adds to
 * the same day. Limits can be raised with YT_QUOTA_UNITS, YT_QUOTA_UPLOADS and YT_QUOTA_SEARCHES.
 */
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const DAILY_UNITS = Number(process.env.YT_QUOTA_UNITS) || 10_000;
export const DAILY_UPLOADS = Number(process.env.YT_QUOTA_UPLOADS) || 100;
export const DAILY_SEARCHES = Number(process.env.YT_QUOTA_SEARCHES) || 100;
export type Limits = { units: number; uploads: number; searches: number };
export const LIMITS: Limits = { units: DAILY_UNITS, uploads: DAILY_UPLOADS, searches: DAILY_SEARCHES };

/** upload and search are calls in their own buckets; thumbnail and list are units in the shared pool. */
export const COST = { upload: 1, thumbnail: 50, list: 1, search: 1 } as const;
/** Calls kept back in the upload and search buckets (uploads stop at 95 of 100). */
export const MARGIN = { uploads: 5, searches: 5 } as const;
/** What one upload costs in the units pool (its cover). */
export const UNITS_PER_UPLOAD = COST.thumbnail;

/** Lower number = more important. */
export const PRIORITY = { upload: 0, thumbnail: 1, stats: 2, search: 2, counters: 3 } as const;
export type Kind = keyof typeof PRIORITY;
export type Bucket = "uploads" | "searches" | "units";
export const bucketOf = (kind: Kind): Bucket => (kind === "upload" ? "uploads" : kind === "search" ? "searches" : "units");

const Usage = z.object({
  day: z.string(),
  /** units-pool usage only */
  units: z.number(),
  uploads: z.number().optional(),
  searches: z.number().optional(),
  byKind: z.record(z.string(), z.number()).default({}),
  warned: z.boolean().default(false),
});
export type Usage = { day: string; units: number; uploads: number; searches: number; byKind: Record<string, number>; warned: boolean };

/** A row saved before the buckets split (2026-11-19) charged 1,600 units an upload and 100 a search: move them to their buckets. */
export function migrate(u: z.infer<typeof Usage>): Usage {
  if (u.uploads != null && u.searches != null) return { ...u, uploads: u.uploads, searches: u.searches };
  const byKind = { ...u.byKind };
  const oldUpload = byKind.upload ?? 0;
  const uploads = Math.round(oldUpload / 1_600);
  if (oldUpload) byKind.upload = uploads;
  return { day: u.day, units: Math.max(0, u.units - oldUpload), uploads, searches: 0, byKind, warned: u.warned };
}

/**
 * Several workers keep a QuotaKeeper at once (publish hourly, the data audit, stats-deep, the
 * market scan), each loaded at its start. Saving a run's whole tally would undo what the others saved
 * meanwhile, so save() adds only what this run spent since it loaded (`current` minus `base`) to the
 * row as it is now (`stored`). A stored row of an older quota day is replaced; null means "don't write"
 * (the stored row is already a newer day than this run's).
 */
export function mergeUsage(stored: Usage | null, base: Usage, current: Usage): Usage | null {
  if (!stored || stored.day < current.day) return snapshotOf(current);
  if (stored.day > current.day) return null;
  const sameDay = base.day === current.day;
  const delta = (cur: number, was: number) => Math.max(0, cur - (sameDay ? was : 0));
  const byKind = { ...stored.byKind };
  for (const [k, v] of Object.entries(current.byKind)) {
    const d = delta(v, base.byKind[k] ?? 0);
    if (d) byKind[k] = (byKind[k] ?? 0) + d;
  }
  return {
    day: current.day,
    units: stored.units + delta(current.units, base.units),
    uploads: stored.uploads + delta(current.uploads, base.uploads),
    searches: stored.searches + delta(current.searches, base.searches),
    byKind,
    warned: stored.warned || current.warned,
  };
}

const snapshotOf = (u: Usage): Usage => ({ ...u, byKind: { ...u.byKind } });

/** The quota day: YouTube resets it at midnight in America/Los_Angeles. */
export function quotaDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * May a call of `kind` costing `amount` run, with `used` already spent from its bucket? Uploads and
 * searches keep MARGIN calls back; a cover may use what isn't reserved for the covers of the uploads
 * still due today; stats and counters also leave a 5% margin of the units pool.
 */
export function allowed(kind: Kind, amount: number, used: number, uploadsLeftToday: number, limits: Partial<Limits> = {}): boolean {
  const l = { ...LIMITS, ...limits };
  if (kind === "upload") return amount <= l.uploads - MARGIN.uploads - used;
  if (kind === "search") return amount <= l.searches - MARGIN.searches - used;
  const reserve = uploadsLeftToday * COST.thumbnail;
  const margin = kind === "thumbnail" ? 0 : Math.round(l.units * 0.05);
  return amount <= l.units - used - reserve - margin;
}

export class QuotaKeeper {
  private usage: Usage;
  /** The usage as last read from or written to the row: save() adds only what was spent since. */
  private base: Usage;
  private limits: Limits;
  constructor(private prisma: PrismaClient | null, usage: Omit<Usage, "uploads" | "searches"> & Partial<Usage>, public uploadsLeftToday = 0, limits: Partial<Limits> = {}) {
    this.usage = { ...usage, uploads: usage.uploads ?? 0, searches: usage.searches ?? 0, byKind: { ...usage.byKind } };
    this.base = snapshotOf(this.usage);
    this.limits = { ...LIMITS, ...limits };
  }

  /** The stored usage row, moved to the buckets; null when it is missing or unreadable. */
  private static async read(prisma: PrismaClient): Promise<Usage | null> {
    const row = await prisma.setting.findUnique({ where: { key: "quotaUsage" } });
    const parsed = Usage.safeParse(row?.value);
    return parsed.success ? migrate(parsed.data) : null;
  }

  static async load(prisma: PrismaClient, uploadsLeftToday = 0, now = new Date()): Promise<QuotaKeeper> {
    const stored = await QuotaKeeper.read(prisma);
    const day = quotaDay(now);
    const usage = stored && stored.day === day ? stored : { day, units: 0, uploads: 0, searches: 0, byKind: {}, warned: false };
    return new QuotaKeeper(prisma, usage, uploadsLeftToday);
  }

  /** Units-pool usage (thumbnails, lists, comments); uploads and searches have their own counts. */
  get used(): number { return this.usage.units; }
  get left(): number { return this.limits.units - this.usage.units; }
  get uploadsUsed(): number { return this.usage.uploads; }
  /** Uploads that may still go today (the margin kept back). */
  get uploadsLeft(): number { return Math.max(0, this.limits.uploads - MARGIN.uploads - this.usage.uploads); }
  get searchesUsed(): number { return this.usage.searches; }
  get searchesLeft(): number { return Math.max(0, this.limits.searches - MARGIN.searches - this.usage.searches); }
  get limit(): Limits { return { ...this.limits }; }

  private add(kind: Kind, amount: number): void {
    const b = bucketOf(kind);
    this.usage[b] += amount;
    this.usage.byKind[kind] = (this.usage.byKind[kind] ?? 0) + amount;
  }

  /** Reserve `amount` (calls for upload/search, units otherwise); false (and nothing recorded) when the budget says no. */
  take(kind: Kind, amount: number): boolean {
    if (!allowed(kind, amount, this.usage[bucketOf(kind)], this.uploadsLeftToday, this.limits)) return false;
    this.add(kind, amount);
    if (kind === "upload" && this.uploadsLeftToday > 0) this.uploadsLeftToday--;
    return true;
  }

  /** Adds what was already spent (a job that can't stop half-way, like the market scan) without asking. */
  record(kind: Kind, amount: number): void { this.add(kind, amount); }

  /** True once, the first time a day's usage passes 80% of any bucket: the caller raises a notification. */
  shouldWarn(): boolean {
    const high = this.usage.units >= this.limits.units * 0.8 || this.usage.uploads >= this.limits.uploads * 0.8 || this.usage.searches >= this.limits.searches * 0.8;
    if (this.usage.warned || !high) return false;
    this.usage.warned = true;
    return true;
  }

  /** One line for logs and notifications. */
  summary(): string {
    return `uploads ${this.usage.uploads} of ${this.limits.uploads}, searches ${this.usage.searches} of ${this.limits.searches}, other calls ${this.usage.units.toLocaleString("en-US")} of ${this.limits.units.toLocaleString("en-US")} units`;
  }

  snapshot(): Usage { return { ...this.usage, byKind: { ...this.usage.byKind } }; }

  /** Adds this run's spending to the row as it is now (other workers may have saved since we loaded). */
  async save(): Promise<void> {
    if (!this.prisma) return;
    const merged = mergeUsage(await QuotaKeeper.read(this.prisma), this.base, this.usage);
    if (!merged) return;
    await this.prisma.setting.upsert({ where: { key: "quotaUsage" }, update: { value: merged }, create: { key: "quotaUsage", value: merged } });
    this.usage = merged;
    this.base = snapshotOf(merged);
  }
}
