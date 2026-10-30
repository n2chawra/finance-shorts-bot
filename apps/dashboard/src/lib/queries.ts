"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson, send } from "./api";
import { AgentsSchema, AnalyticsSchema, FeedbackSchema, NotificationsSchema, OverviewSchema, RunSchema, SettingsSchema, TemplateSchema, VideoDetailSchema, VideoSchema } from "./schemas";
import type { FeedbackCreate, ManualUpload, NotificationAction, Settings, VideoAction, VideoEdit } from "./schemas";

export const useOverview = () => useQuery({ queryKey: ["overview"], queryFn: () => getJson("/api/overview", OverviewSchema) });
export const useQueue = () => useQuery({ queryKey: ["queue"], queryFn: () => getJson("/api/queue", z.array(VideoSchema)) });
export const useTemplates = () => useQuery({ queryKey: ["templates"], queryFn: () => getJson("/api/templates", z.array(TemplateSchema)) });
export const useRuns = () => useQuery({ queryKey: ["runs"], queryFn: () => getJson("/api/runs", z.array(RunSchema)) });
export const useAnalytics = () => useQuery({ queryKey: ["analytics"], queryFn: () => getJson("/api/analytics", AnalyticsSchema) });
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
export const useAgents = () => useQuery({ queryKey: ["agents"], queryFn: () => getJson("/api/agents", AgentsSchema) });
export const useNotificationAction = () => useWrite((body: { ids: string[]; action: NotificationAction }) => send("PATCH", "/api/notifications", body));
