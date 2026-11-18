"use client";


import { GrowthSchema } from "./growth";
import { ScorecardSchema } from "./scorecard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson, send } from "./api";
import { StudySchema } from "./study";
import { CHANNEL_COOKIE, ChannelSchema, DEFAULT_CHANNEL, type ChannelCreate, type ChannelPatch } from "./channels";
import { AgentsSchema, AnalyticsSchema, FeedbackSchema, NotificationsSchema, OverviewSchema, RunSchema, SettingsSchema, TemplateSchema, VideoDetailSchema, VideoSchema } from "./schemas";
import { ImpactSchema } from "./impact";
import { StudioSchema, VideoStudioSchema, type Fmt, type Range } from "./studio-schema";
import type { FeedbackCreate, ManualUpload, NotificationAction, Settings, VideoAction, VideoEdit } from "./schemas";

export const useOverview = () => useQuery({ queryKey: ["overview"], queryFn: () => getJson("/api/overview", OverviewSchema) });
export const useQueue = () => useQuery({ queryKey: ["queue"], queryFn: () => getJson("/api/queue", z.array(VideoSchema)) });
export const useTemplates = () => useQuery({ queryKey: ["templates"], queryFn: () => getJson("/api/templates", z.array(TemplateSchema)) });
export const useImpact = () => useQuery({ queryKey: ["impact"], queryFn: () => getJson("/api/impact", ImpactSchema) });
export const useRuns = () => useQuery({ queryKey: ["runs"], queryFn: () => getJson("/api/runs", z.array(RunSchema)) });
export const useAnalytics = () => useQuery({ queryKey: ["analytics"], queryFn: () => getJson("/api/analytics", AnalyticsSchema) });
/** Studio-grade analytics; refetched every minute so the realtime card ticks. */
export const useStudio = (range: Range, format: Fmt) => useQuery({ queryKey: ["studio", range, format], queryFn: () => getJson(`/api/analytics/studio?range=${range}&format=${format}`, StudioSchema),
  refetchInterval: 60_000, placeholderData: (prev) => prev });
export const useVideoStudio = (id: string) => useQuery({ queryKey: ["video-studio", id], queryFn: () => getJson(`/api/videos/${id}/studio`, VideoStudioSchema) });
export const useSettings = () => useQuery({ queryKey: ["settings"], queryFn: () => getJson("/api/settings", SettingsSchema) });
export const useVideo = (id: string) => useQuery({ queryKey: ["video", id], queryFn: () => getJson(`/api/videos/${id}`, VideoDetailSchema) });

export function useVideos(filters: Record<string, string>) {
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  return useQuery({ queryKey: ["videos", qs], queryFn: () => getJson(`/api/videos${qs ? `?${qs}` : ""}`, z.array(VideoSchema)) });
}

/** A write to the API; every cached query is refreshed afterwards. */
function useWrite<T>(fn: (arg: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSettled: () => qc.invalidateQueries() });
}

export const useVideoAction = () => useWrite(({ id, action, reason }: { id: string; action: VideoAction; reason?: string }) =>
  send("POST", `/api/videos/${id}/${action}`, reason ? { reason } : undefined));
export const useEditorOrder = () => useWrite(() => send("POST", "/api/queue/editor-order"));
export const useStudies = () => useQuery({ queryKey: ["studies"], queryFn: () => getJson("/api/study", z.array(StudySchema)),
  // while a study is being watched, look again every 20 s
  refetchInterval: (q) => (q.state.data?.some((s) => s.status === "queued" || s.status === "watching") ? 20_000 : false) });
export const useAddStudy = () => useWrite((s: { url: string; videoId?: string; note?: string }) => send("POST", "/api/study", s));
export const useFeedback = (videoId?: string) => useQuery({ queryKey: ["feedback", videoId ?? "all"],
  queryFn: () => getJson(`/api/feedback${videoId ? `?videoId=${encodeURIComponent(videoId)}` : ""}`, z.array(FeedbackSchema)) });
export const useAddFeedback = () => useWrite((f: Partial<FeedbackCreate> & Pick<FeedbackCreate, "kind" | "text">) => send("POST", "/api/feedback", f));
export const usePatchFeedback = () => useWrite((p: { id: string; status: "open" | "addressed" }) => send("PATCH", "/api/feedback", p));
export const useEditVideo = () => useWrite(({ id, ...body }: VideoEdit & { id: string }) => send("PATCH", `/api/videos/${id}`, body));
export const useManualUpload = () => useWrite(({ id, ...body }: ManualUpload & { id: string }) => send("POST", `/api/videos/${id}/manual-upload`, body));
export const useThumbWinner = () => useWrite(({ id, winner }: { id: string; winner: string | null }) => send("POST", `/api/videos/${id}/thumb-test`, { winner }));
export const useReorder = () => useWrite((ids: string[]) => send("PATCH", "/api/queue/order", { ids }));
export const usePatchTemplate = () => useWrite((patch: { id: string; enabled?: boolean; weight?: number }) => send("PATCH", "/api/templates", patch));
export const usePatchSettings = () => useWrite((patch: Partial<Settings>) => send("PATCH", "/api/settings", patch));

export const useNotifications = () => useQuery({ queryKey: ["notifications"], queryFn: () => getJson("/api/notifications", NotificationsSchema) });
export const useScorecard = () => useQuery({ queryKey: ["scorecard"], queryFn: () => getJson("/api/scorecard", ScorecardSchema) });
export const useGrowth = () => useQuery({ queryKey: ["growth"], queryFn: () => getJson("/api/growth", GrowthSchema) });
export const useAgents = () => useQuery({ queryKey: ["agents"], queryFn: () => getJson("/api/agents", AgentsSchema) });
export const useNotificationAction = () => useWrite((body: { ids: string[]; action: NotificationAction }) => send("PATCH", "/api/notifications", body));

// ---------------- channels (docs/plans/multi-channel.md) ----------------

const ChannelsResponse = z.object({ channels: z.array(ChannelSchema), current: z.string() });
export const useChannels = () => useQuery({ queryKey: ["channels"], queryFn: () => getJson("/api/channels", ChannelsResponse), staleTime: 60_000 });
export const usePatchChannel = () => useWrite(({ id, ...body }: ChannelPatch & { id: string }) => send("PATCH", `/api/channels/${id}`, body));
export const useAddChannel = () => useWrite((c: ChannelCreate) => send("POST", "/api/channels", c));

/** Switch the dashboard to another channel: the cookie the server scopes every query by, then a full refresh. */
export function useSwitchChannel() {
  const qc = useQueryClient();
  return (id: string) => {
    document.cookie = `${CHANNEL_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // every page's data belongs to the old channel: drop it and refetch what's on screen
    void qc.resetQueries();
  };
}
export const useDecideChannel = () => useWrite(({ id, ...body }: { id: string; choice: "continue" | "stop"; note?: string }) => send("POST", `/api/channels/${id}/decision`, body));
const SampleSchema = z.object({ id: z.string(), title: z.string(), format: z.string(), status: z.string(), durationSec: z.number() });
export const useChannelSamples = (id: string, enabled: boolean) => useQuery({ queryKey: ["channel-samples", id], queryFn: () => getJson(`/api/channels/${id}/review`, z.array(SampleSchema)), enabled });
export const useReviewChannel = () => useWrite(({ id, ...body }: { id: string } & import("./channels").ReviewAction) => send("POST", `/api/channels/${id}/review`, body));
export const useLaunchChannel = () => useWrite((id: string) => send("POST", `/api/channels/${id}/launch`));
const FitSchema = z.object({ fits: z.boolean(), problems: z.array(z.string()), slots: z.array(z.object({ routine: z.string(), ist: z.string(), days: z.string(), window: z.string(), cron: z.string(), prompt: z.string() })) });
export const useChannelFit = (id: string, enabled: boolean) => useQuery({ queryKey: ["channel-fit", id], queryFn: () => getJson(`/api/channels/${id}/launch`, FitSchema), enabled });

/** Whether the channel on screen is Paisa Panchayat: its own history (the 1.2K ceiling, the 16 Nov
 * content reset) is shown only there. `undefined` while the channel list loads. */
export function useIsFirstChannel(): boolean | undefined {
  const { data } = useChannels();
  return data ? data.current === DEFAULT_CHANNEL : undefined;
}
