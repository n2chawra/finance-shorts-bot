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
  uploadTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24 h)"),
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
});
export type Settings = z.infer<typeof SettingsSchema>;
export const SettingsPatchSchema = SettingsSchema.partial();

export const OverviewSchema = z.object({
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
  last7: z.object({ views: z.number(), subsGained: z.number(), uploads: z.number() }),
  recent: z.array(VideoSchema),
});
export type Overview = z.infer<typeof OverviewSchema>;

const RankedSchema = z.object({ videoId: z.string(), title: z.string(), templateId: z.string(), views: z.number(), thumbnailUrl: z.string() });
export const AnalyticsSchema = z.object({
  daily: z.array(z.object({ day: z.string(), views: z.number(), subsGained: z.number() })),
  weekday: z.array(z.object({ weekday: z.string(), avgViews: z.number(), uploads: z.number() })),
  top: z.array(RankedSchema),
  bottom: z.array(RankedSchema),
  totals: z.object({ views: z.number(), subsGained: z.number(), videos: z.number(), avgViewPct: z.number() }),
});
export type Analytics = z.infer<typeof AnalyticsSchema>;

export const QueueOrderSchema = z.object({ ids: z.array(z.string()).min(1) });
export const VideoActionSchema = z.enum(["skip", "delete", "upload-now"]);
export type VideoAction = z.infer<typeof VideoActionSchema>;
