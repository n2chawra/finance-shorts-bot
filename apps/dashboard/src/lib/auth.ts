/**
 * Single-owner sign-in. The session cookie holds an expiry time and an HMAC of it, keyed with
 * SESSION_SECRET. Web Crypto only, so the same code runs in middleware and route handlers.
 *
 *   DASHBOARD_PASSWORD  the password (set in Netlify)
 *   SESSION_SECRET      random string used to sign the cookie (set in Netlify)
 *
 * In development with no DASHBOARD_PASSWORD the dashboard is open. In production it fails closed.
 */
export const COOKIE = "fsb_session";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

export function authConfigured(): boolean {
  return Boolean(process.env.DASHBOARD_PASSWORD && process.env.SESSION_SECRET);
}

/** True when requests may skip sign-in: local development without a password configured. */
export function authDisabled(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.DASHBOARD_PASSWORD;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(process.env.SESSION_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function createSession(now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_DAYS * 86_400_000);
  return `${expires}.${await hmac(`owner:${expires}`)}`;
}

export async function verifySession(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !authConfigured()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return safeEqual(sig, await hmac(`owner:${expires}`));
}
