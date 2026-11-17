import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/*
 * A channel's YouTube refresh token, sealed for Channel.refreshTokenEnc. The format and key must match
 * workers/lib/channel-auth.ts exactly: "v1.<iv>.<tag>.<data>", AES-256-GCM, key = scrypt(SESSION_SECRET).
 * The sealed text is JSON { rt, client }: `client: "web"` means the dashboard's web OAuth client issued
 * it (YT_WEB_CLIENT_ID), which is the one that must refresh it.
 */

const SALT = "finance-shorts-bot:youtube-refresh-token:v1";

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET is not set");
  return scryptSync(secret, SALT, 32);
}

export function sealToken(refreshToken: string, client: "web" | "desktop" = "web"): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ rt: refreshToken, client }), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function openToken(sealed: string): { rt: string; client: string } {
  const [v, iv, tag, data] = sealed.split(".");
  if (v !== "v1" || !iv || !tag || !data) throw new Error("unknown token format");
  const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  const text = Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
  try {
    const j = JSON.parse(text) as { rt?: string; client?: string };
    if (j.rt) return { rt: j.rt, client: j.client ?? "desktop" };
  } catch { /* a bare token */ }
  return { rt: text, client: "desktop" };
}

/** OAuth `state`: the channel id and a time, signed, so a callback can't be pointed at another channel. */
export function signState(channelId: string, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ c: channelId, t: now })).toString("base64url");
  const mac = createHmac("sha256", key()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyState(state: string | null, now = Date.now(), maxAgeMs = 15 * 60_000): string | null {
  if (!state) return null;
  const [body, mac] = state.split(".");
  if (!body || !mac) return null;
  const want = createHmac("sha256", key()).update(body).digest();
  const got = Buffer.from(mac, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const { c, t } = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { c: string; t: number };
    return typeof c === "string" && now - t < maxAgeMs && t <= now + 60_000 ? c : null;
  } catch {
    return null;
  }
}
