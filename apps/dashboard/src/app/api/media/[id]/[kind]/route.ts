/**
 * Thumbnail, contact sheet and video for a real (ingested) video. The repo is private, so the
 * browser cannot load these from GitHub directly.
 *
 *   1. If the file is in the local checkout (videos/<id>/…), serve it. This is the dev path.
 *   2. Otherwise, with GITHUB_TOKEN and GITHUB_REPOSITORY set (the deployed path): images are
 *      fetched from the repo, and the video redirects to the Release asset's short-lived URL.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { notifyOwner } from "@/lib/autopilot.db";
import { prismaAll } from "@/lib/prisma";

/** A rejected GitHub token breaks every thumbnail and video: tell the owner (once per instance). */
let warned = false;
async function tokenRejected(status: number): Promise<void> {
  if ((status !== 401 && status !== 403) || warned || !process.env.DATABASE_URL) return;
  warned = true;
  await notifyOwner({ key: "dashboard-github-token", severity: "critical", title: "Thumbnails and videos can't load on the dashboard",
    detail: `GitHub rejected the dashboard's read-only token (HTTP ${status}). It has probably expired.`,
    fix: "1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token.\n2. Repository access: only finance-shorts-bot. Permissions: Contents → Read-only.\n3. Netlify → Project configuration → Environment variables → replace GITHUB_TOKEN.\n4. Netlify → Deploys → Trigger deploy. Then mark this resolved." });
}

const FILES = {
  thumbnail: ["thumbnail.png", "image/png"], preview: ["preview.png", "image/png"], video: ["video.mp4", "video/mp4"],
  // a long video's extra thumbnails for YouTube's Test & Compare
  "thumbnail-b": ["thumbnail-b.png", "image/png"], "thumbnail-c": ["thumbnail-c.png", "image/png"],
} as const;
const GH = "https://api.github.com";
const Release = z.object({ assets: z.array(z.object({ name: z.string(), url: z.string().url(), state: z.string() })) });

function local(file: string, type: string, range: string | null): Response {
  const size = statSync(file).size;
  const m = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, {
      status: 206, headers: { "content-type": type, "content-length": String(end - start + 1), "content-range": `bytes ${start}-${end}/${size}`, "accept-ranges": "bytes" },
    });
  }
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, {
    headers: { "content-type": type, "content-length": String(size), "accept-ranges": "bytes", "cache-control": "private, max-age=3600" },
  });
}

/** Channel folders to look in (channel #1 first). Grows with the Channel table in the next step. */
const CHANNEL_DIRS = (process.env.CHANNELS ?? "paisa-panchayat").split(",").map((c) => c.trim()).filter((c) => /^[a-z0-9][a-z0-9-]{1,40}$/.test(c));

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await ctx.params;
  if (!/^(v|L)-\d{8}-\d{2,}$/.test(id) || !(kind in FILES)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [name, type] = FILES[kind as keyof typeof FILES];

  // a video lives in channels/<slug>/videos/ once its channel has a folder (multi-channel refactor), else videos/
  const own = process.env.DATABASE_URL ? (await prismaAll.video.findUnique({ where: { id }, select: { channelId: true } }).catch(() => null))?.channelId : null;
  const dirs = [...new Set([...(own ? [own] : []), ...CHANNEL_DIRS].map((c) => `channels/${c}/videos`)), "videos"];
  const repoRoot = path.join(process.cwd(), "..", "..");
  const file = dirs.map((d) => path.join(repoRoot, d, id, name)).find((f) => existsSync(f));
  if (file) return local(file, type, req.headers.get("range"));

  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return NextResponse.json({ error: `${name} is not in the local checkout and no GitHub token is configured` }, { status: 404 });
  const auth = { authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28" };

  if (kind !== "video") {
    let res: Response | null = null;
    for (const d of dirs) {
      res = await fetch(`${GH}/repos/${repo}/contents/${d}/${id}/${name}?ref=main`, { headers: { ...auth, accept: "application/vnd.github.raw" } });
      if (res.ok || res.status !== 404) break;
    }
    if (!res || !res.ok) { if (res) await tokenRejected(res.status); return NextResponse.json({ error: "Not found" }, { status: 404 }); }
    return new Response(res.body, { headers: { "content-type": type, "cache-control": "private, max-age=3600" } });
  }
  // ids are unique across channels (generator/history.py next_id), so the tag is video-<id> for every channel
  const release = await fetch(`${GH}/repos/${repo}/releases/tags/video-${id}`, { headers: { ...auth, accept: "application/vnd.github+json" } });
  if (!release.ok) {
    await tokenRejected(release.status);
    const error = release.status === 404 ? `No GitHub Release video-${id} yet: the video may still be uploading.` : `GitHub answered ${release.status} for Release video-${id}.`;
    return NextResponse.json({ error }, { status: release.status === 404 ? 404 : 502 });
  }
  const parsed = Release.safeParse(await release.json());
  if (!parsed.success) return NextResponse.json({ error: `Release video-${id} came back in an unexpected shape.` }, { status: 502 });
  // the video is named after its title since 2026-10-31 (release-video.yml): any uploaded .mp4 is it
  const asset = parsed.data.assets.find((a) => a.state === "uploaded" && (a.name === name || a.name.toLowerCase().endsWith(".mp4")));
  if (!asset) return NextResponse.json({ error: `Release video-${id} has no uploaded mp4.` }, { status: 404 });
  // GitHub answers with a redirect to a signed URL that needs no token; hand that to the browser. The URL
  // carries Content-Disposition: attachment with the asset's own name, so a phone saves it as <title>.mp4
  const signed = await fetch(asset.url, { headers: { ...auth, accept: "application/octet-stream" }, redirect: "manual" });
  const location = signed.headers.get("location");
  if (location) return NextResponse.redirect(location, 302);
  await tokenRejected(signed.status);
  return NextResponse.json({ error: `GitHub gave no download link for ${asset.name} (HTTP ${signed.status}).` }, { status: 502 });
}
