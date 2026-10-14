/**
 * Data access for route handlers. With DATABASE_URL set it reads and writes Postgres
 * (store.db.ts); without it, generated sample data held in memory (store.sample.ts), so the
 * dashboard can be run and reviewed with no database at all.
 */
import type { Analytics, ManualUpload, Overview, Run, Settings, Template, Video, VideoAction, VideoDetail } from "./schemas";
import * as db from "./store.db";
import * as sample from "./store.sample";

const useDb = Boolean(process.env.DATABASE_URL);

export const getSettings = async (): Promise<Settings> => (useDb ? db.getSettings() : sample.getSettings());
export const patchSettings = async (patch: Partial<Settings>): Promise<Settings> => (useDb ? db.patchSettings(patch) : sample.patchSettings(patch));
export const listVideos = async (f: { status?: string; template?: string; category?: string; q?: string }): Promise<Video[]> => (useDb ? db.listVideos(f) : sample.listVideos(f));
export const getVideo = async (id: string): Promise<VideoDetail | null> => (useDb ? db.getVideo(id) : sample.getVideo(id));
export const listQueue = async (): Promise<Video[]> => (useDb ? db.listQueue() : sample.listQueue());
export const getOverview = async (): Promise<Overview> => (useDb ? db.getOverview() : sample.getOverview());
export const listTemplates = async (): Promise<Template[]> => (useDb ? db.listTemplates() : sample.listTemplates());
export const patchTemplate = async (id: string, patch: { enabled?: boolean; weight?: number }): Promise<Template | null> => (useDb ? db.patchTemplate(id, patch) : sample.patchTemplate(id, patch));
export const listRuns = async (): Promise<Run[]> => (useDb ? db.listRuns() : sample.listRuns());
export const getAnalytics = async (): Promise<Analytics> => (useDb ? db.getAnalytics() : sample.getAnalytics());
export const reorderQueue = async (ids: string[]): Promise<Video[] | null> => (useDb ? db.reorderQueue(ids) : sample.reorderQueue(ids));
export const markUploaded = async (id: string, m: ManualUpload): Promise<{ ok: true } | { ok: false; error: string }> => (useDb ? db.markUploaded(id, m) : sample.markUploaded(id, m));
export const videoAction = async (id: string, action: VideoAction): Promise<{ ok: true } | { ok: false; error: string }> => (useDb ? db.videoAction(id, action) : sample.videoAction(id, action));
