/**
 * Studio-grade analytics (owner, 2026-11-03): the payloads of /api/analytics/studio and
 * /api/videos/[id]/studio. Everything YouTube's APIs give, plus our own numbers (drop points matched
 * to the script, what works, benchmarks) and the auditor's AI analysis.
 */
import { z } from "zod";

export const RANGES = ["7", "28", "90", "365"] as const;
export type Range = (typeof RANGES)[number];
export const FORMATS = ["all", "short", "long"] as const;
export type Fmt = (typeof FORMATS)[number];

const Curve = z.array(z.tuple([z.number(), z.number()]));

export const DaySchema = z.object({
  day: z.string(), views: z.number(), engagedViews: z.number(), watchMinutes: z.number(), avgViewPct: z.number(), avgViewSec: z.number(),
  likes: z.number(), comments: z.number(), shares: z.number(), subsGained: z.number(), subsLost: z.number(),
});
export type Day = z.infer<typeof DaySchema>;

export const TotalsSchema = z.object({
  views: z.number(), engagedViews: z.number(), watchHours: z.number(), avgViewPct: z.number(), avgViewSec: z.number(),
  likes: z.number(), comments: z.number(), shares: z.number(), subsGained: z.number(), subsLost: z.number(),
  impressions: z.number().nullable(), ctr: z.number().nullable(),
});
export type Totals = z.infer<typeof TotalsSchema>;

export const SliceSchema = z.object({ key: z.string(), label: z.string(), views: z.number(), share: z.number(), watchMinutes: z.number(), avgViewPct: z.number().nullable() });
export type Slice = z.infer<typeof SliceSchema>;
export const BREAKDOWNS = ["traffic", "search", "suggested", "external", "country", "ageGender", "device", "os", "subscribed", "sharing"] as const;
export type BreakdownKind = (typeof BREAKDOWNS)[number];
const Breakdowns = z.object(Object.fromEntries(BREAKDOWNS.map((k) => [k, z.array(SliceSchema)])) as Record<BreakdownKind, z.ZodArray<typeof SliceSchema>>);

export const DropSchema = z.object({ at: z.number(), drop: z.number(), from: z.number(), to: z.number(), beat: z.string(), scene: z.string(), line: z.string(), near: z.string() });
export type Drop = z.infer<typeof DropSchema>;

export const ContentRowSchema = z.object({
  videoId: z.string(), title: z.string(), thumbnailUrl: z.string(), format: z.enum(["short", "long"]), publishAt: z.string(), youtubeId: z.string().nullable(),
  durationSec: z.number(), views: z.number(), engagedRatio: z.number().nullable(), avgViewPct: z.number().nullable(), avgViewSec: z.number().nullable(),
  hookHold: z.number().nullable(), endHold: z.number().nullable(), likes: z.number(), comments: z.number(), shares: z.number(), subsNet: z.number(),
  impressions: z.number().nullable(), ctr: z.number().nullable(), first7: z.array(z.number()),
  views48: z.number().nullable(), vs48: z.number().nullable(), vsPct: z.number().nullable(),   // ratio to the format's median (1 = typical)
  verdict: z.enum(["hit", "okay", "miss"]).nullable(),
});
export type ContentRow = z.infer<typeof ContentRowSchema>;

export const GroupSchema = z.object({ value: z.string(), n: z.number(), avgViewPct: z.number().nullable(), views48: z.number().nullable(), engagedRatio: z.number().nullable(), hookHold: z.number().nullable() });
export const AttributeSchema = z.object({ attribute: z.string(), label: z.string(), groups: z.array(GroupSchema) });
export type Attribute = z.infer<typeof AttributeSchema>;

export const Evidence = z.object({ text: z.string(), metric: z.string().nullable().default(null), tab: z.string().nullable().default(null) });
export const AiVideoSchema = z.object({
  videoId: z.string(), verdict: z.enum(["hit", "okay", "miss"]), headline: z.string(), why: z.array(Evidence).default([]),
  viewersSaid: z.array(z.string()).default([]), next: z.string().default(""), writtenAt: z.string(),
});
export type AiVideo = z.infer<typeof AiVideoSchema>;
export const AiChannelSchema = z.object({
  headline: z.string(), working: z.array(Evidence).default([]), notWorking: z.array(Evidence).default([]), audience: z.array(Evidence).default([]),
  recommendations: z.array(z.object({ do: z.string(), because: z.string() })).default([]), writtenAt: z.string(),
});
export type AiChannel = z.infer<typeof AiChannelSchema>;

export const HourSchema = z.object({ hour: z.string(), views: z.number() });
export const RealtimeSchema = z.object({
  hours: z.array(HourSchema),             // 48 hourly view gains, oldest first
  last48: z.number(), last1: z.number(), totalNow: z.number(),
  top: z.array(z.object({ videoId: z.string(), title: z.string(), thumbnailUrl: z.string(), views48: z.number(), hours: z.array(z.number()) })),
  snapshotAt: z.string().nullable(),
});
export type Realtime = z.infer<typeof RealtimeSchema>;

export const StudioSchema = z.object({
  range: z.enum(RANGES), format: z.enum(FORMATS),
  totals: TotalsSchema, previous: TotalsSchema.nullable(),
  daily: z.array(DaySchema),
  breakdowns: Breakdowns, breakdownScope: z.string().nullable(),   // which stored range the breakdowns came from
  realtime: RealtimeSchema,
  content: z.array(ContentRowSchema),
  typicalCurve: z.object({ short: Curve, long: Curve }),
  hookTrend: z.array(z.object({ videoId: z.string(), title: z.string(), publishAt: z.string(), hookHold: z.number().nullable(), engagedRatio: z.number().nullable(), avgViewPct: z.number().nullable() })),
  whatWorks: z.array(AttributeSchema),
  ai: z.object({ channel: AiChannelSchema.nullable(), videos: z.array(AiVideoSchema.extend({ title: z.string(), thumbnailUrl: z.string() })) }),
  refreshed: z.object({ daily: z.string().nullable(), deep: z.string().nullable(), through: z.string().nullable() }),
  missing: z.array(z.string()),   // what isn't arriving yet and why (e.g. the Reporting API is off)
});
export type Studio = z.infer<typeof StudioSchema>;

export const VideoStudioSchema = z.object({
  videoId: z.string(), format: z.enum(["short", "long"]), durationSec: z.number(), previewUrl: z.string(), published: z.boolean(),
  totals: TotalsSchema, daily: z.array(DaySchema),
  curve: Curve, relative: Curve, typical: Curve, drops: z.array(DropSchema), hookHold: z.number().nullable(), endHold: z.number().nullable(),
  breakdowns: Breakdowns,
  hourly: z.array(z.number()), typicalHourly: z.array(z.number()),    // views gained per hour since publish (first 48 h) vs the last 10 of its format
  bench: z.object({ views48: z.number().nullable(), median48: z.number().nullable(), avgViewPct: z.number().nullable(), medianPct: z.number().nullable(), rank: z.number().nullable(), of: z.number() }),
  comments: z.array(z.object({ id: z.string(), author: z.string(), text: z.string(), likes: z.number(), replies: z.number(), publishedAt: z.string() })),
  ai: AiVideoSchema.nullable(),
});
export type VideoStudio = z.infer<typeof VideoStudioSchema>;

// ---- labels ----

export const TRAFFIC_LABELS: Record<string, string> = {
  SHORTS: "Shorts feed", YT_SEARCH: "YouTube search", RELATED_VIDEO: "Suggested videos", YT_CHANNEL: "Channel pages", SUBSCRIBER: "Subscriptions",
  YT_OTHER_PAGE: "Other YouTube pages", EXT_URL: "External sites", NO_LINK_OTHER: "Direct or unknown", PLAYLIST: "Playlists", YT_PLAYLIST_PAGE: "Playlist pages",
  NOTIFICATION: "Notifications", END_SCREEN: "End screens", ANNOTATION: "Cards and annotations", HASHTAGS: "Hashtag pages", SOUND_PAGE: "Sound pages",
  SHORTS_CONTENT_LINKS: "Links in Shorts", RELATED_VIDEO_SHORTS: "Related to Shorts", CAMPAIGN_CARD: "Campaign cards", ADVERTISING: "Ads", LIVE_REDIRECT: "Live redirect",
  PRODUCT_PAGE: "Product pages", VIDEO_REMIXES: "Remixes", IMMERSIVE_LIVE: "Immersive live", NO_LINK_EMBEDDED: "Embedded players",
};
export const DEVICE_LABELS: Record<string, string> = { MOBILE: "Phone", TABLET: "Tablet", DESKTOP: "Computer", TV: "TV", GAME_CONSOLE: "Game console", UNKNOWN_PLATFORM: "Unknown" };
export const OS_LABELS: Record<string, string> = { ANDROID: "Android", IOS: "iOS", WINDOWS: "Windows", MACINTOSH: "macOS", LINUX: "Linux", SMART_TV: "Smart TV", CHROMECAST: "Chromecast", PLAYSTATION: "PlayStation", XBOX: "Xbox", KAIOS: "KaiOS", ROKU: "Roku", TIZEN: "Tizen", WEBOS: "webOS" };
export const SUBSCRIBED_LABELS: Record<string, string> = { SUBSCRIBED: "Subscribers", UNSUBSCRIBED: "Not subscribed" };

export const titleish = (s: string) => s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** "age25-34|male" → "25–34 · Male". */
export function ageLabel(key: string): string {
  const [age = "", gender = ""] = key.split("|");
  return `${age.replace("age", "").replace("-", "–")} · ${titleish(gender.replace("user_specified", "other"))}`;
}

/** Country name in English from an ISO alpha-2 code. */
export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** The flag emoji for an ISO alpha-2 code. */
export const flag = (code: string) => (/^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌐");

export function sliceLabel(kind: BreakdownKind, key: string): string {
  if (kind === "traffic") return TRAFFIC_LABELS[key] ?? titleish(key);
  if (kind === "device") return DEVICE_LABELS[key] ?? titleish(key);
  if (kind === "subscribed") return SUBSCRIBED_LABELS[key] ?? titleish(key);
  if (kind === "country") return countryName(key);
  if (kind === "ageGender") return ageLabel(key);
  if (kind === "os") return OS_LABELS[key] ?? titleish(key);
  if (kind === "sharing") return titleish(key).replace("Whats App", "WhatsApp");
  return key;
}

// studio-types.ts mirrors these shapes without zod; these lines fail the typecheck if the two drift apart
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const sameDay: Same<Day, import("./studio-types").Day> = true;
const sameTotals: Same<Totals, import("./studio-types").Totals> = true;
const sameAttribute: Same<Attribute, import("./studio-types").Attribute> = true;
void sameDay; void sameTotals; void sameAttribute;
