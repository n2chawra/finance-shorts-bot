import { z } from "zod";

/*
 * "Connect YouTube" (multi-channel plan, step 5): Google's sign-in run from the dashboard with the
 * shared Google project's *web* OAuth client (YT_WEB_CLIENT_ID / YT_WEB_CLIENT_SECRET in Netlify and in
 * GitHub, so the workers can refresh the token it issues). Same scopes as workers/auth.ts.
 */

export const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export const CALLBACK_PATH = "/api/oauth/youtube";

export function webClient(): { id: string; secret: string } | null {
  const id = process.env.YT_WEB_CLIENT_ID, secret = process.env.YT_WEB_CLIENT_SECRET;
  return id && secret ? { id, secret } : null;
}

/** The public origin Google sends the owner back to (Netlify's URL, else the request's own). */
export function origin(req: Request): string {
  return (process.env.URL ?? new URL(req.url).origin).replace(/\/$/, "");
}

export function authUrl(clientId: string, redirectUri: string, state: string): string {
  const q = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: SCOPES.join(" "), state,
    // a refresh token every time, and the account and channel picker even if already signed in
    access_type: "offline", prompt: "consent select_account", include_granted_scopes: "true",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

const Tokens = z.object({ access_token: z.string(), refresh_token: z.string().optional(), scope: z.string().optional() });

export async function exchangeCode(code: string, redirectUri: string, c: { id: string; secret: string }): Promise<z.infer<typeof Tokens>> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: c.id, client_secret: c.secret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  if (!res.ok) throw new Error(`Google refused the sign-in (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return Tokens.parse(await res.json());
}

const Mine = z.object({ items: z.array(z.object({ id: z.string(), snippet: z.object({ title: z.string() }) })).optional() });

/** The YouTube channel the token belongs to (channels.list mine=true, 1 quota unit). */
export async function myChannel(accessToken: string): Promise<{ id: string; title: string } | null> {
  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`YouTube didn't say which channel this is (${res.status})`);
  const item = Mine.parse(await res.json()).items?.[0];
  return item ? { id: item.id, title: item.snippet.title } : null;
}
