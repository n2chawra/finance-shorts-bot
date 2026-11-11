/**
 * Why a video was made (owner, 2026-11-11: "give me reason of why that video and how many views this
 * topic is getting, and from where u got this inspiration"). Read from the research feed topic the
 * video was made from (improvement/research/topics.json or improvement/longform/topics.json, kept in
 * RepoDoc by ingest): the feed's reason, the angle, the reference video that proves the demand with
 * its views, and the pages research read.
 */
import type { Origin } from "./schemas";

type Row = Record<string, unknown>;
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Every topic in the given feed documents ({ topics: [...] }), by id. */
export function feedIndex(...docs: unknown[]): Map<string, Row> {
  const out = new Map<string, Row>();
  for (const doc of docs) {
    const topics = doc && typeof doc === "object" ? (doc as { topics?: unknown }).topics : null;
    if (!Array.isArray(topics)) continue;
    for (const t of topics) if (t && typeof t === "object" && typeof (t as Row).id === "string") out.set((t as Row).id as string, t as Row);
  }
  return out;
}

/** "kqed.org" from "https://www.kqed.org/news/…"; the url itself when it isn't one. */
export function siteOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

/** The feed topic ingest saved with the video (Video.style.source.topic), for when it has left the feed. */
export function snapshotOf(source: unknown): Row | undefined {
  const t = source && typeof source === "object" ? (source as { topic?: unknown }).topic : undefined;
  return t && typeof t === "object" ? (t as Row) : undefined;
}

/** The origin of a video made from feed topic `t`; null when the video has no feed topic. */
export function originOf(feedId: string | null | undefined, t: Row | undefined): Origin | null {
  if (!feedId) return null;
  if (!t) return { feedId, title: null, why: null, angle: null, demand: null, fromShort: null, sources: [] };
  const d = t.demand && typeof t.demand === "object" ? (t.demand as Row) : null;
  const demand = d && str(d.title) ? { title: str(d.title)!, views: typeof d.views === "number" ? d.views : null, url: str(d.url) } : null;
  const shortId = str(t.from_short);
  const urls = new Map<string, string>();   // url → label, the facts' named sources first
  for (const f of Array.isArray(t.facts) ? (t.facts as Row[]) : []) {
    const u = str(f?.url);
    if (u && !urls.has(u)) urls.set(u, str(f.source) ?? siteOf(u));
  }
  for (const s of Array.isArray(t.sources) ? t.sources : []) {
    const u = str(s);
    if (u && /^https?:\/\//.test(u) && !urls.has(u) && u !== demand?.url) urls.set(u, siteOf(u));
  }
  return {
    feedId, title: str(t.title), why: str(t.why_now) ?? str(t.reason), angle: str(t.angle), demand,
    fromShort: shortId ? { id: shortId, views: typeof t.from_short_views === "number" ? t.from_short_views : null } : null,
    sources: [...urls].slice(0, 6).map(([url, label]) => ({ url, label })),
  };
}
