import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

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

/** API URL of the uploaded video.mp4 on Release `tag`, or null if the release or asset is not there yet. */
export async function releaseAssetUrl(repo: string, tag: string, asset: string): Promise<string | null> {
  const data = await api(`repos/${repo}/releases/tags/${tag}`);
  if (data === null) return null;
  const found = Release.parse(data).assets.find((a) => a.name === asset && a.state === "uploaded" && a.size > 0);
  return found?.url ?? null;
}
