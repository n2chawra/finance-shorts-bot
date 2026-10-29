import { z } from "zod";

export const VIDEO_STATUSES = [
  "planned", "scripted", "verified", "rendered", "qa_passed", "queued", "scheduled", "published", "failed",
] as const;
export const VideoStatusSchema = z.enum(VIDEO_STATUSES);
export type VideoStatus = z.infer<typeof VideoStatusSchema>;

export const StyleSchema = z.object({
  palette: z.string(),
  genre: z.string(),
  key: z.string(),
  bpm: z.number(),
  voice: z.string().nullish(),   // Kokoro voice name for a narrated video
  /** where the video came from (workers/lib/origin.ts): its feed topic and urgency */
  source: z.object({
    feedId: z.string().nullable(), kind: z.string().nullable(), feedPriority: z.string().nullable(),
    urgent: z.object({ level: z.enum(["breaking", "trending"]), until: z.string() }).nullable(),
  }).nullish(),
  /** three thumbnails for YouTube's Test & Compare (long videos), each with the angle it leads with */
  thumbs: z.array(z.object({ file: z.string(), angle: z.string().nullable() })).nullish(),
  /** the thumbnail YouTube's test picked, logged by the owner */
  thumbTest: z.object({ winner: z.string(), at: z.string() }).nullish(),
});

export const QaCheckSchema = z.object({
  checker: z.enum(["number_check", "fact_review", "qa_review"]),
  passed: z.boolean(),
  notes: z.array(z.string()),
});

export const UploadSchema = z.object({
  youtubeId: z.string().nullable(),
  publishAt: z.string(),
  state: z.enum(["pending", "uploaded", "scheduled", "published", "failed"]),
  error: z.string().nullable(),
  attempts: z.number().int(),
});

export const StatSchema = z.object({
  day: z.string(),
  views: z.number(),
  likes: z.number(),
  comments: z.number(),
  subsGained: z.number(),
  avgViewPct: z.number(),
});

export const TotalsSchema = z.object({
  views: z.number(),
  likes: z.number(),
  comments: z.number(),
  subsGained: z.number(),
  avgViewPct: z.number(),
  liveAt: z.string().nullable().default(null), // when YouTube's live counters were last read; null = Analytics only
});

export const AgentStepSchema = z.object({
  agent: z.string(),
  status: z.enum(["ok", "failed", "skipped"]),
  durationSec: z.number(),
  note: z.string().nullable(),
});

export const VideoSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  topic: z.object({ title: z.string(), category: z.string() }),
  status: VideoStatusSchema,
  format: z.enum(["short", "long"]).default("short"),
  failReason: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  durationSec: z.number(),
  style: StyleSchema,
  thumbnailUrl: z.string(),
  previewUrl: z.string(),
  fileUrl: z.string(),
  createdAt: z.string(),
  queuePosition: z.number().int().nullable(),
  upload: UploadSchema.nullable(),
  totals: TotalsSchema.nullable(),
});
export type Video = z.infer<typeof VideoSchema>;

export const VideoDetailSchema = VideoSchema.extend({
  script: z.unknown(),
  qaChecks: z.array(QaCheckSchema),
  steps: z.array(AgentStepSchema),
  stats: z.array(StatSchema),
});
export type VideoDetail = z.infer<typeof VideoDetailSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.number().int(),
  weight: z.number(),
  enabled: z.boolean(),
  lastUsedAt: z.string().nullable(),
  videoCount: z.number().int(),
  publishedCount: z.number().int(),
  avgViews: z.number().nullable(),
  sampleThumbnailUrl: z.string(),
  sampleVideoUrl: z.string(),
});
export type Template = z.infer<typeof TemplateSchema>;

export const TemplatePatchSchema = z.object({
  id: z.string(),
  enabled: z.boolean().optional(),
  weight: z.number().min(0).max(3).optional(),
});

export const RunSchema = z.object({
  id: z.string(),
  kind: z.enum(["video", "template_work"]),
  videoId: z.string().nullable(),
  format: z.enum(["short", "long"]).optional(), // video runs only; a long video doesn't count toward the daily Shorts target
  title: z.string(),
  status: z.enum(["ok", "failed"]),
  startedAt: z.string(),
  durationSec: z.number(),
  error: z.string().nullable(),
  sessionUrl: z.string().nullable(),
  steps: z.array(AgentStepSchema),
});
export type Run = z.infer<typeof RunSchema>;

export const SettingsSchema = z.object({
  uploadTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24 h)")).min(1).max(4),
  /** Extra Short slots only a breaking or trending video may take; empty on quiet days. */
  trendUploadTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24 h)")).max(3).default(["16:07", "22:07"]),
  longUploadTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24 h)")).max(2).default(["20:07"]),
  longUploadDays: z.array(z.number().int().min(0).max(6)).max(7).default([2, 4, 6]),   // 0 = Sunday
  longLengthMinSec: z.number().int().min(60).max(3600).default(180),
  longLengthMaxSec: z.number().int().min(60).max(3600).default(900),
  longPerWeek: z.number().int().min(0).max(7).default(2),
  longBacklogCap: z.number().int().min(1).max(20).default(4),
  backlogCap: z.number().int().min(1).max(100),
  lengthMinSec: z.number().int().min(15).max(180),
  lengthMaxSec: z.number().int().min(15).max(180),
  disclaimer: z.string().min(5).max(120),
  uploadsPaused: z.boolean(),
  generationPaused: z.boolean(),
  templateWork: z.object({
    maxPerDay: z.number().int().min(0).max(4),
    maxTemplates: z.number().int().min(1).max(50),
  }),
  alerts: z.object({
    failedRun: z.boolean(),
    failedUpload: z.boolean(),
    tokenErrors: z.boolean(),
    lowBacklog: z.boolean(),
    lowBacklogThreshold: z.number().int().min(0).max(30),
  }),
  agents: z.object({
    paused: z.boolean(),
    research: z.boolean(),
    improver: z.boolean(),
    dashboard: z.boolean(),
    auditor: z.boolean().default(true),
    scout: z.boolean().default(true),
    studio: z.boolean().default(true),
    monthly: z.boolean().default(true),
    maxActiveExperiments: z.number().int().min(0).max(6),
  }),
});
export type Settings = z.infer<typeof SettingsSchema>;
export const SettingsPatchSchema = SettingsSchema.partial();

/** What a whole set of settings may not be, whoever changes it (Settings page or an approved proposal). */
export function settingsProblem(s: Settings): string | null {
  if (s.lengthMinSec > s.lengthMaxSec) return "Minimum length must not exceed maximum";
  if (s.longLengthMinSec > s.longLengthMaxSec) return "Minimum long-video length must not exceed maximum";
  return null;
}

/** The strategy settings an agent may propose and the owner approve with one click. Pauses, the
 * disclaimer, alerts and the agents' own switches are never proposed. */
export const PROPOSABLE_SETTINGS = ["uploadTimes", "trendUploadTimes", "longUploadTimes", "longUploadDays", "longPerWeek", "longBacklogCap",
  "longLengthMinSec", "longLengthMaxSec", "lengthMinSec", "lengthMaxSec", "backlogCap"] as const satisfies readonly (keyof Settings)[];

export const OverviewSchema = z.object({
  source: z.enum(["sample", "database"]),
  counts: z.record(z.string(), z.number()),
  backlog: z.number(),
  backlogCap: z.number(),
  uploadsPaused: z.boolean(),
  generation: z.object({
    mode: z.enum(["video", "template_work", "idle", "paused"]),
    reason: z.string(),
    templateRunsToday: z.number(),
    maxTemplateRunsPerDay: z.number(),
    templates: z.number(),
    maxTemplates: z.number(),
    lastRunAt: z.string().nullable(),
  }),
  nextUpload: z.object({ videoId: z.string(), title: z.string(), publishAt: z.string(), thumbnailUrl: z.string() }).nullable(),
  recentFailures: z.array(z.object({ videoId: z.string(), title: z.string(), reason: z.string(), at: z.string() })),
  last7: z.object({ views: z.number(), subsGained: z.number(), uploads: z.number(), likes: z.number(), comments: z.number() }),
  allTime: z.object({ views: z.number(), likes: z.number(), comments: z.number(), liveAt: z.string().nullable() }),
  recent: z.array(VideoSchema),
});
export type Overview = z.infer<typeof OverviewSchema>;

const RankedSchema = z.object({ videoId: z.string(), title: z.string(), templateId: z.string(), views: z.number(), likes: z.number(), comments: z.number(), thumbnailUrl: z.string() });
export const AnalyticsSchema = z.object({
  daily: z.array(z.object({ day: z.string(), views: z.number(), subsGained: z.number(), likes: z.number(), comments: z.number(),
    estimated: z.boolean().default(false) })), // a day YouTube Analytics hasn't reached: from the live counters
  weekday: z.array(z.object({ weekday: z.string(), avgViews: z.number(), uploads: z.number() })),
  top: z.array(RankedSchema),
  bottom: z.array(RankedSchema),
  loved: z.array(RankedSchema),   // most likes + comments per 1,000 views (videos with at least LOVED_MIN_VIEWS)
  totals: z.object({ views: z.number(), subsGained: z.number(), videos: z.number(), avgViewPct: z.number(), likes: z.number(), comments: z.number() }),
  statsThrough: z.string().nullable().default(null), // newest day YouTube Analytics has sent (YYYY-MM-DD); null = none in the last 28 days
});
export type Analytics = z.infer<typeof AnalyticsSchema>;

/** A video needs this many views before its likes-per-view rate means anything. */
export const LOVED_MIN_VIEWS = 100;

/** Likes and comments per 1,000 views: how much the people who watched cared. */
export const perThousand = (r: { views: number; likes: number; comments: number }) => (r.views > 0 ? ((r.likes + r.comments) / r.views) * 1000 : 0);

export function mostLoved<T extends { views: number; likes: number; comments: number }>(rows: T[], n = 5): T[] {
  return rows.filter((r) => r.views >= LOVED_MIN_VIEWS).sort((a, b) => perThousand(b) - perThousand(a)).slice(0, n);
}

export const QueueOrderSchema = z.object({ ids: z.array(z.string()).min(1) });
export const VideoActionSchema = z.enum(["skip", "delete", "upload-now"]);

/** "I uploaded this one myself": the YouTube video id (from the pasted link) and when it went live. */
export const ManualUploadSchema = z.object({
  youtubeId: z.string().regex(/^[\w-]{11}$/).nullable(),
  publishedAt: z.string().datetime({ offset: true }),
});
export type ManualUpload = z.infer<typeof ManualUploadSchema>;

/** Owner edits from the video page: any field left out stays as it is. */
export const VideoEditSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(40).optional(),
  youtubeId: z.string().regex(/^[\w-]{11}$/).nullable().optional(),   // a corrected link (uploaded videos)
  publishAt: z.string().datetime({ offset: true }).optional(),
}).refine((e) => Object.values(e).some((x) => x !== undefined), "Nothing to change");
export type VideoEdit = z.infer<typeof VideoEditSchema>;

export const THUMB_FILES = ["thumbnail.png", "thumbnail-b.png", "thumbnail-c.png"] as const;
/** The thumbnail that won YouTube's Test & Compare (null clears it). */
export const ThumbWinnerSchema = z.object({ winner: z.enum(THUMB_FILES).nullable() });
export type VideoAction = z.infer<typeof VideoActionSchema>;

// ---------------- autopilot: notifications and self-improving agents ----------------

export const SEVERITIES = ["critical", "warning", "info"] as const;
export const NotificationSchema = z.object({
  id: z.string(),
  source: z.string(),
  severity: z.enum(SEVERITIES),
  title: z.string(),
  detail: z.string(),
  fix: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  seenAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  /** a setting change an agent proposes (monthly review); approving it writes the setting */
  proposal: z.object({ setting: z.string(), value: z.unknown(), current: z.unknown().optional() }).nullable().default(null),
  decision: z.enum(["approved", "declined"]).nullable().default(null),
});
export type Notification = z.infer<typeof NotificationSchema>;
export const NotificationsSchema = z.object({ open: z.array(NotificationSchema), resolved: z.array(NotificationSchema), unread: z.number() });
export type Notifications = z.infer<typeof NotificationsSchema>;
export const NotificationActionSchema = z.union([
  z.object({ ids: z.array(z.string()).min(1).max(200), action: z.enum(["seen", "resolve", "reopen"]) }),
  z.object({ ids: z.array(z.string()).length(1), action: z.enum(["approve", "decline"]) }),
]);
export type NotificationAction = z.infer<typeof NotificationActionSchema>["action"];

export const AGENTS = ["auditor", "research", "improver", "dashboard", "scout", "studio", "monthly"] as const;
export const ActivitySchema = z.object({
  id: z.string(),
  agent: z.enum(AGENTS),
  day: z.string(),
  startedAt: z.string().nullish(),
  finishedAt: z.string().nullish(),
  summary: z.string(),
  decision: z.enum(["acted", "waited", "blocked", "nothing"]),
  why: z.string(),
  findings: z.array(z.object({ title: z.string(), detail: z.string().nullish(), link: z.string().nullish() })),
  changes: z.array(z.object({ title: z.string(), detail: z.string().nullish(), branch: z.string().nullish(), experiment: z.string().nullish() })),
  nextCheck: z.string().nullable(),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});
export type Activity = z.infer<typeof ActivitySchema>;

/** Agent-written JSON files: validated loosely so a new field never breaks the page. */
const ExperimentRowSchema = z.looseObject({
  id: z.string(), area: z.string().optional(), status: z.string().optional(), startedAt: z.string().optional(),
  description: z.string().optional(), hypothesis: z.string().optional(), templates: z.array(z.string()).optional(), result: z.unknown().optional(),
});
const ProposalRowSchema = z.looseObject({
  id: z.string(), date: z.string().optional(), area: z.string().optional(), title: z.string(), change: z.string().optional(),
  evidence: z.array(z.string()).optional(), confidence: z.string().optional(), effort: z.string().optional(), status: z.string().optional(),
  route: z.string().optional(), priority: z.string().optional(),
});
const MergeRowSchema = z.looseObject({
  at: z.string(), agent: z.string(), branch: z.string(), result: z.enum(["merged", "blocked"]), reasons: z.array(z.string()), runUrl: z.string().optional(),
});
const BacklogRowSchema = z.looseObject({ id: z.string(), kind: z.string().optional(), title: z.string(), status: z.string().optional(), page: z.string().optional(), found: z.string().optional(), agent: z.string().optional() });
/** metrics/data-audit.json: what the dashboard shows vs YouTube vs the database, every night at 18:37 IST */
const DataAuditSchema = z.looseObject({
  generatedAt: z.string(),
  youtubeChecked: z.boolean(),
  summary: z.object({ videos: z.number(), checked: z.number(), error: z.number(), warning: z.number(), info: z.number(), owner: z.number() }),
  issues: z.array(z.object({ kind: z.string(), severity: z.enum(["error", "warning", "info", "owner"]), videoId: z.string().optional(), detail: z.string() })),
});
/** One video run (the 04:07 main run or the 09:07 spare): first step start to last step end, from AgentRun rows */
export const VideoRunSchema = z.object({ day: z.string(), start: z.string(), end: z.string(), videos: z.number() });
export type VideoRun = z.infer<typeof VideoRunSchema>;
const TopicRowSchema = z.looseObject({
  id: z.string(), title: z.string(), category: z.string().optional(), kind: z.string().optional(), priority: z.string().optional(),
  status: z.string().optional(), found: z.string().optional(), expires: z.string().optional(), angle: z.string().optional(),
  templates: z.array(z.string()).optional(), sources: z.array(z.string()).optional(), usedBy: z.string().nullish(),
  facts: z.array(z.looseObject({ label: z.string(), source: z.string().optional() })).optional(),
});
export const AgentsSchema = z.object({
  activity: z.array(ActivitySchema),
  videoRuns: z.array(VideoRunSchema).default([]),
  experiments: z.array(ExperimentRowSchema),
  proposals: z.array(ProposalRowSchema),
  merges: z.array(MergeRowSchema),
  backlog: z.array(BacklogRowSchema),
  dataAudit: DataAuditSchema.nullable(),
  topics: z.array(TopicRowSchema).default([]),
});
export type Agents = z.infer<typeof AgentsSchema>;
