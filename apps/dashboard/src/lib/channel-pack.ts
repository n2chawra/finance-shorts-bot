/**
 * The few fields of a channel's pack (`channels/<slug>/channel.json`) the dashboard shows. Server only.
 * Read from the local checkout (dev, sample data), else from the repo with the read-only GITHUB_TOKEN
 * (the deployed path, like /api/media). Cached per server instance for an hour.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { SLUG } from "./channels";

const PackSchema = z.looseObject({ uploadCategory: z.string().regex(/^\d+$/).optional(), language: z.string().optional() });
export type ChannelPack = { uploadCategory: string | null; categoryName: string | null; language: string | null };

/** YouTube's category ids (videoCategories.list, region US), the ones a channel here can name. */
export const YT_CATEGORIES: Record<string, string> = {
  "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music", "15": "Pets & Animals", "17": "Sports", "19": "Travel & Events",
  "20": "Gaming", "22": "People & Blogs", "23": "Comedy", "24": "Entertainment", "25": "News & Politics", "26": "Howto & Style",
  "27": "Education", "28": "Science & Technology", "29": "Nonprofits & Activism",
};

const cache = new Map<string, { at: number; pack: ChannelPack }>();
const TTL = 60 * 60_000;

async function raw(slug: string): Promise<string | null> {
  const file = path.join(process.cwd(), "..", "..", "channels", slug, "channel.json");
  const local = await readFile(file, "utf-8").catch(() => null);
  if (local !== null) return local;
  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return null;
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/channels/${slug}/channel.json?ref=main`, {
    headers: { authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28", accept: "application/vnd.github.raw" },
  }).catch(() => null);
  return res?.ok ? res.text() : null;
}

/** The channel's pack fields, or nulls when it can't be read (the page then names no category). */
export async function channelPack(slug: string): Promise<ChannelPack> {
  const none: ChannelPack = { uploadCategory: null, categoryName: null, language: null };
  if (!SLUG.test(slug)) return none;
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < TTL) return hit.pack;
  const text = await raw(slug);
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  const p = PackSchema.safeParse(json);
  const id = p.success ? p.data.uploadCategory ?? null : null;
  const pack: ChannelPack = { uploadCategory: id, categoryName: id ? YT_CATEGORIES[id] ?? `category ${id}` : null, language: p.success ? p.data.language ?? null : null };
  // only a successful read is kept, so a GitHub hiccup is retried on the next request
  if (text !== null) cache.set(slug, { at: Date.now(), pack });
  return pack;
}
