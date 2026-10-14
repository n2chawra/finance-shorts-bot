/**
 * One-time YouTube sign-in. Run it yourself:   npm --prefix workers run auth
 *
 * Opens Google's consent page in your browser, receives the answer on a local port, and stores
 * the long-lived refresh token in apps/dashboard/.env and in the YT_REFRESH_TOKEN GitHub secret.
 * The token is never printed. Needs YT_CLIENT_ID and YT_CLIENT_SECRET (a "Desktop app" OAuth
 * client) in apps/dashboard/.env.
 */
import { execFileSync, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";

import { z } from "zod";

import { SCOPES, myChannel } from "./lib/youtube.ts";

const ENV_FILE = path.resolve(import.meta.dirname, "..", "apps", "dashboard", ".env");
const Tokens = z.object({ access_token: z.string(), refresh_token: z.string().optional() });

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing from apps/dashboard/.env`);
  return v;
}

/** Replace or add KEY="value" in the env file without touching other lines. */
function saveToEnvFile(key: string, value: string): void {
  const lines = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8").split(/\r?\n/) : [];
  const line = `${key}="${value}"`;
  const i = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (i >= 0) lines[i] = line;
  else lines.splice(lines.at(-1) === "" ? lines.length - 1 : lines.length, 0, line);
  writeFileSync(ENV_FILE, lines.join("\n").replace(/\n*$/, "\n"));
}

function saveToGitHub(key: string, value: string): boolean {
  for (const gh of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
    if (gh !== "gh" && !existsSync(gh)) continue;
    try {
      execFileSync(gh, ["secret", "set", key], { input: value, stdio: ["pipe", "ignore", "pipe"], cwd: path.dirname(ENV_FILE) });
      return true;
    } catch (e) {
      if (!String((e as { stderr?: unknown }).stderr ?? e).includes("ENOENT")) return false;
    }
  }
  return false;
}

function openBrowser(url: string): void {
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", '""', `"${url}"`]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(cmd, args, { stdio: "ignore", detached: true, windowsVerbatimArguments: true }).unref();
}

async function main(): Promise<void> {
  const clientId = need("YT_CLIENT_ID"), clientSecret = need("YT_CLIENT_SECRET");
  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(16).toString("hex");

  const code = await new Promise<{ code: string; redirect: string }>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      if (url.pathname !== "/callback") return void res.writeHead(404).end();
      const ok = url.searchParams.get("state") === state && url.searchParams.get("code");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(ok
        ? "<h2>Signed in. You can close this tab and go back to the terminal.</h2>"
        : `<h2>Sign-in failed: ${url.searchParams.get("error") ?? "unexpected response"}</h2>`);
      server.close();
      if (ok) resolve({ code: url.searchParams.get("code")!, redirect });
      else reject(new Error(`sign-in failed: ${url.searchParams.get("error") ?? "state mismatch"}`));
    });
    let redirect = "";
    server.listen(0, "127.0.0.1", () => {
      redirect = `http://127.0.0.1:${(server.address() as AddressInfo).port}/callback`;
      const consent = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      consent.search = new URLSearchParams({
        client_id: clientId, redirect_uri: redirect, response_type: "code", scope: SCOPES.join(" "), access_type: "offline",
        prompt: "consent", state, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256",
      }).toString();
      console.log("Opening Google sign-in in your browser. Choose the account (and channel) the videos should go to.");
      console.log(`If no browser opens, visit:\n${consent}\n`);
      openBrowser(consent.toString());
    });
    setTimeout(() => { server.close(); reject(new Error("timed out after 5 minutes waiting for sign-in")); }, 300_000).unref();
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code: code.code, code_verifier: verifier, redirect_uri: code.redirect, grant_type: "authorization_code" }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const tokens = Tokens.parse(await res.json());
  if (!tokens.refresh_token) throw new Error("Google returned no refresh token. Remove the app's access at myaccount.google.com/permissions and run this again.");

  const channel = await myChannel(tokens.access_token);
  saveToEnvFile("YT_REFRESH_TOKEN", tokens.refresh_token);
  const github = saveToGitHub("YT_REFRESH_TOKEN", tokens.refresh_token);
  console.log(`\nConnected to YouTube channel: ${channel ? `${channel.title} (${channel.id})` : "NONE FOUND - this account has no channel"}`);
  console.log(`Refresh token saved to apps/dashboard/.env${github ? " and to the YT_REFRESH_TOKEN GitHub secret" : ". Saving the GitHub secret FAILED: run  gh secret set -f apps/dashboard/.env"}.`);
}

try {
  await main();
} catch (e) {
  console.error(`\nError: ${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
}
