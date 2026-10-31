import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { z } from "zod";

const Release = z.object({
  assets: z.array(z.object({ name: z.string(), url: z.string(), size: z.number(), state: z.string() })),
});

/** `owner/repo`, from GITHUB_REPOSITORY (set in Actions) or the local git remote. */
export function repoSlug(root: string): string {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const url = execFileSync("git", ["remote", "get-url", "origin"], { cwd: root, encoding: "utf8" }).trim();
  const m = /github\.com[:/](.+?)(?:\.git)?$/.exec(url);
  if (!m?.[1]) throw new Error(`cannot work out the GitHub repo from remote ${url}`);
  return m[1];
}

/** GET a GitHub REST path. Uses GITHUB_TOKEN/GH_TOKEN when set; otherwise the `gh` CLI's own
 * sign-in, so no token has to be copied around on a developer machine. Returns null on 404. */
async function api(path: string): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) {
    const res = await fetch(`https://api.github.com/${path}`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub ${path}: ${res.status} ${res.statusText}`);
    return res.json();
  }
  // on PATH, or the default Windows install location when PATH has not caught up yet
  for (const exe of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
    if (exe !== "gh" && !existsSync(exe)) continue;
    try {
      return JSON.parse(execFileSync(exe, ["api", path], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
    } catch (e) {
      const text = String((e as { stderr?: unknown }).stderr ?? e);
      if (text.includes("HTTP 404")) return null;
      if (!text.includes("ENOENT")) throw new Error(`gh api ${path} failed: ${text.trim()}`);
    }
  }
  throw new Error("no GITHUB_TOKEN and the gh CLI was not found; pass --no-release-check to skip");
}

/** Whether a release asset is the one asked for: "video.mp4" stands for the release's video, which is
 * named after its title since 2026-10-31 (release-video.yml), so any .mp4 matches it. */
export const assetMatches = (name: string, asked: string) => name === asked || (asked === "video.mp4" && name.toLowerCase().endsWith(".mp4"));

/** API URL of the uploaded video on Release `tag`, or null if the release or asset is not there yet. */
export async function releaseAssetUrl(repo: string, tag: string, asset: string): Promise<string | null> {
  const data = await api(`repos/${repo}/releases/tags/${tag}`);
  if (data === null) return null;
  const found = Release.parse(data).assets.find((a) => assetMatches(a.name, asset) && a.state === "uploaded" && a.size > 0);
  return found?.url ?? null;
}

/** Download the asset `asset` of Release `tag` to `dest`. Same auth rules as `api`. */
export async function downloadReleaseAsset(repo: string, tag: string, asset: string, dest: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    const dir = path.dirname(dest);
    for (const exe of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
      if (exe !== "gh" && !existsSync(exe)) continue;
      try {
        const pattern = asset === "video.mp4" ? "*.mp4" : asset;
        const before = new Set(readdirSync(dir));
        execFileSync(exe, ["release", "download", tag, "--pattern", pattern, "--dir", dir, "--clobber", "-R", repo], { stdio: ["ignore", "pipe", "pipe"] });
        const got = readdirSync(dir).find((f) => !before.has(f) && assetMatches(f, asset)) ?? asset;
        if (path.join(dir, got) !== dest) renameSync(path.join(dir, got), dest);
        return;
      } catch (e) {
        if (!String((e as { stderr?: unknown }).stderr ?? e).includes("ENOENT")) throw new Error(`gh release download ${tag} failed: ${String((e as { stderr?: unknown }).stderr ?? e).trim()}`);
      }
    }
    throw new Error("no GITHUB_TOKEN and the gh CLI was not found");
  }
  const url = await releaseAssetUrl(repo, tag, asset);
  if (!url) throw new Error(`release ${tag} has no ${asset}`);
  // GitHub redirects to signed storage; fetch drops the Authorization header on that cross-origin hop
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}`, accept: "application/octet-stream" } });
  if (!res.ok || !res.body) throw new Error(`downloading ${tag}/${asset} failed: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body as import("node:stream/web").ReadableStream), createWriteStream(dest));
}
