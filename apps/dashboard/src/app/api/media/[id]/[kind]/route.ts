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

import { notifyOwner } from "@/lib/autopilot.db";

/** A rejected GitHub token breaks every thumbnail and video: tell the owner (once per instance). */
let warned = false;
async function tokenRejected(status: number): Promise<void> {
  if ((status !== 401 && status !== 403) || warned || !process.env.DATABASE_URL) return;
  warned = true;
  await notifyOwner({ key: "dashboard-github-token", severity: "critical", title: "Thumbnails and videos can't load on the dashboard",
    detail: `GitHub rejected the dashboard's read-only token (HTTP ${status}). It has probably expired.`,
    fix: "1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token.\n2. Repository access: only finance-shorts-bot. Permissions: Contents → Read-only.\n3. Netlify → Project configuration → Environment variables → replace GITHUB_TOKEN.\n4. Netlify → Deploys → Trigger deploy. Then mark this resolved." });
}

const FILES = { thumbnail: ["thumbnail.png", "image/png"], preview: ["preview.png", "image/png"], video: ["video.mp4", "video/mp4"] } as const;
const GH = "https://api.github.com";

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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await ctx.params;
  if (!/^v-\d{8}-\d{2,}$/.test(id) || !(kind in FILES)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [name, type] = FILES[kind as keyof typeof FILES];

  const file = path.join(process.cwd(), "..", "..", "videos", id, name);
  if (existsSync(file)) return local(file, type, req.headers.get("range"));

  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return NextResponse.json({ error: `${name} is not in the local checkout and no GitHub token is configured` }, { status: 404 });
  const auth = { authorization: `Bearer ${token}`, "x-github-api-version": "2022-11-28" };

  if (kind !== "video") {
    const res = await fetch(`${GH}/repos/${repo}/contents/videos/${id}/${name}?ref=main`, { headers: { ...auth, accept: "application/vnd.github.raw" } });
    if (!res.ok) { await tokenRejected(res.status); return NextResponse.json({ error: "Not found" }, { status: 404 }); }
    return new Response(res.body, { headers: { "content-type": type, "cache-control": "private, max-age=3600" } });
  }
  const release = await fetch(`${GH}/repos/${repo}/releases/tags/video-${id}`, { headers: { ...auth, accept: "application/vnd.github+json" } });
  if (!release.ok) await tokenRejected(release.status);
  const asset = release.ok ? ((await release.json()) as { assets?: { name: string; url: string }[] }).assets?.find((a) => a.name === name) : undefined;
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // GitHub answers with a redirect to a signed URL that needs no token; hand that to the browser
  const signed = await fetch(asset.url, { headers: { ...auth, accept: "application/octet-stream" }, redirect: "manual" });
  const location = signed.headers.get("location");
  return location ? NextResponse.redirect(location, 302) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
