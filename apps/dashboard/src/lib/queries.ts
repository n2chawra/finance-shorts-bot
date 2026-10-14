"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson, send } from "./api";
import { AnalyticsSchema, OverviewSchema, RunSchema, SettingsSchema, TemplateSchema, VideoDetailSchema, VideoSchema } from "./schemas";
import type { ManualUpload, Settings, VideoAction } from "./schemas";

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

export const useVideoAction = () => useWrite(({ id, action }: { id: string; action: VideoAction }) => send("POST", `/api/videos/${id}/${action}`));
export const useManualUpload = () => useWrite(({ id, ...body }: ManualUpload & { id: string }) => send("POST", `/api/videos/${id}/manual-upload`, body));
export const useReorder = () => useWrite((ids: string[]) => send("PATCH", "/api/queue/order", { ids }));
export const usePatchTemplate = () => useWrite((patch: { id: string; enabled?: boolean; weight?: number }) => send("PATCH", "/api/templates", patch));
export const usePatchSettings = () => useWrite((patch: Partial<Settings>) => send("PATCH", "/api/settings", patch));
