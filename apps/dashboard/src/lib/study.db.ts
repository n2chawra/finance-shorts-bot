import { dispatchWorkflow } from "./dispatch";
import { prisma } from "./prisma";
import { type Study, type StudyCreate, StudyReportSchema, bestMatch } from "./study";
import { youtubeIdFrom } from "./youtube-link";

type Row = Awaited<ReturnType<typeof prisma.study.findFirstOrThrow<{ include: { video: { select: { title: true } } } }>>>;

const toStudy = (r: Row): Study => {
  const report = StudyReportSchema.safeParse(r.report);
  return {
    id: r.id, url: r.url, youtubeId: r.youtubeId, title: r.title, channel: r.channel, note: r.note,
    videoId: r.videoId, videoTitle: r.video?.title ?? null, matchedBy: r.matchedBy,
    status: (["queued", "watching", "done", "failed"].includes(r.status) ? r.status : "queued") as Study["status"],
    error: r.error, report: report.success ? report.data : null,
    createdAt: r.createdAt.toISOString(), doneAt: r.doneAt?.toISOString() ?? null,
  };
};

export async function listStudies(): Promise<Study[]> {
  const rows = await prisma.study.findMany({ include: { video: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return rows.map(toStudy);
}

/** Title and channel from YouTube's public oEmbed (no key, no quota); null when YouTube doesn't answer. */
async function oembed(youtubeId: string): Promise<{ title: string; channel: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}`, { signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as { title?: string; author_name?: string };
    return j.title ? { title: j.title, channel: j.author_name ?? "" } : null;
  } catch {
    return null;
  }
}

export async function addStudy(s: StudyCreate): Promise<Study | { error: string }> {
  const youtubeId = youtubeIdFrom(s.url);
  if (!youtubeId) return { error: "That isn't a YouTube video link" };
  const meta = await oembed(youtubeId);
  let videoId = s.videoId ?? null, matchedBy: string | null = videoId ? "owner" : null;
  if (videoId && !(await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } }))) return { error: "That video of ours wasn't found" };
  if (!videoId && meta) {
    // the closest of our published videos by title and topic
    const ours = await prisma.video.findMany({ where: { status: "published", deletedAt: null, upload: { youtubeId: { not: null } } },
      select: { id: true, title: true, topic: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 300 });
    videoId = bestMatch(meta.title, ours.map((v) => ({ id: v.id, title: v.title, topic: v.topic.title })));
    matchedBy = videoId ? "auto" : null;
  }
  const row = await prisma.study.create({
    data: { url: s.url, youtubeId, title: meta?.title ?? null, channel: meta?.channel ?? null, note: s.note ?? null, videoId, matchedBy },
    include: { video: { select: { title: true } } },
  });
  // watch it now rather than at the next scheduled run; without the token the schedule picks it up
  await dispatchWorkflow("study.yml").catch(() => null);
  return toStudy(row);
}
