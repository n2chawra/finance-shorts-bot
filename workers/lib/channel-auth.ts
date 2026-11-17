/**
 * The channels the workers serve, each with its own YouTube refresh token and settings
 * (docs/plans/multi-channel.md). Tokens are stored AES-256-GCM encrypted in Channel.refreshTokenEnc
 * with a key derived from SESSION_SECRET (the dashboard's "Connect YouTube" writes them). Channel #1
 * falls back to the YT_REFRESH_TOKEN secret until its token is moved into the database.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

import type { Channel, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { layout } from "./channels.ts";
import { SettingsSchema, type Settings } from "./settings.ts";

const SALT = "finance-shorts-bot:youtube-refresh-token:v1";

function key(secret: string | undefined = process.env.SESSION_SECRET): Buffer {
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET is not set (needed to read and store channel tokens)");
  return scryptSync(secret, SALT, 32);
}

/** "v1.<iv>.<tag>.<ciphertext>", base64url parts. */
export function encryptToken(token: string, secret?: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return ["v1", iv, cipher.getAuthTag(), data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decryptToken(sealed: string, secret?: string): string {
  const [v, iv, tag, data] = sealed.split(".");
  if (v !== "v1" || !iv || !tag || !data) throw new Error("unknown token format");
  const decipher = createDecipheriv("aes-256-gcm", key(secret), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

/** The refresh token for a channel, or null when it isn't connected yet. */
export function refreshTokenOf(ch: Pick<Channel, "id" | "refreshTokenEnc">, env: NodeJS.ProcessEnv = process.env): string | null {
  if (ch.refreshTokenEnc) return decryptToken(ch.refreshTokenEnc, env.SESSION_SECRET);
  if (ch.id === layout().default && env.YT_REFRESH_TOKEN) return env.YT_REFRESH_TOKEN;
  return null;
}

/** Settings a channel may set for itself (Channel.settings); everything else is platform-wide. */
export const CHANNEL_KEYS = [
  "uploadTimes", "trendUploadTimes", "shortEveryDays", "dailyVideoTarget", "longUploadTimes", "longUploadDays",
  "longPerWeek", "longBacklogCap", "backlogCap", "lengthMinSec", "lengthMaxSec", "disclaimer", "uploadsPaused", "generationPaused",
] as const satisfies readonly (keyof Settings)[];

/** The platform settings with the channel's own values over them. Invalid channel values are ignored. */
export function channelSettings(base: Settings, own: unknown): Settings {
  const parsed = z.record(z.string(), z.unknown()).safeParse(own);
  if (!parsed.success) return base;
  const merged: Record<string, unknown> = { ...base };
  for (const k of CHANNEL_KEYS) if (k in parsed.data) merged[k] = parsed.data[k];
  const out = SettingsSchema.safeParse(merged);
  return out.success ? out.data : base;
}

/** Channels the uploader and stats serve: active ones (paused ones keep their stats, see `withStats`). */
export async function activeChannels(prisma: PrismaClient, withStats = false): Promise<Channel[]> {
  const status = withStats ? { in: ["active" as const, "paused" as const] } : "active" as const;
  return prisma.channel.findMany({ where: { status }, orderBy: { createdAt: "asc" } });
}
