import { listVideos } from "./store.sample";
import type { Study, StudyCreate } from "./study";
import { youtubeIdFrom } from "./youtube-link";

const DAY_MS = 86_400_000;
let studies: Study[] | null = null;

function seed(): Study[] {
  const ours = listVideos({ status: "published" });
  const now = Date.now();
  const v = ours[0];
  return [
    {
      id: "study-1", url: "https://www.youtube.com/shorts/sample00001", youtubeId: "sample00001",
      title: "Why billionaires never sell their stock", channel: "Money Doodles", note: "Look at how fast the pictures change",
      videoId: v?.id ?? null, videoTitle: v?.title ?? null, matchedBy: "auto", status: "done", error: null,
      createdAt: new Date(now - 2 * DAY_MS).toISOString(), doneAt: new Date(now - 2 * DAY_MS + 9 * 60_000).toISOString(),
      report: {
        theirs: {
          artStyle: "flat vector animation", durationSec: 31,
          measures: { secPerShot: 1.6, firstFigureSec: 0, characterShare: 0.8, figureShare: 0.45, wordsPerMin: 196, motion: 2.2 },
          hook: { firstFrame: "A billionaire cut-out on top of a stock certificate stamped NEVER SOLD", firstLine: "Elon Musk has never sold most of his Tesla stock" },
          techniques: ["The figure is on screen in the first frame, before a word is said", "Every sentence gets a new picture; nothing stays more than 2 seconds", "The loan is drawn as a pipe that pumps cash out of the stock pile"],
          shots: [
            { start: 0, end: 1.4, picture: "Billionaire cut-out on a stock certificate stamped NEVER SOLD" },
            { start: 1.4, end: 3.1, picture: "The certificate slides into a bank vault; a loan form pops out" },
            { start: 3.1, end: 4.6, picture: "A pipe pumps cash from the vault to a yacht" },
          ],
        },
        ours: { videoId: v?.id ?? "v", title: v?.title ?? "", measures: { secPerShot: 4.6, firstFigureSec: 2.4, characterShare: 0.35, figureShare: 0.3, wordsPerMin: 178, motion: 1.3 } },
        gaps: [
          { key: "secPerShot", label: "seconds per picture", ours: "4.6 s", twins: "1.6 s", direction: "less" },
          { key: "firstFigureSec", label: "seconds until the first money figure", ours: "2.4 s", twins: "0 s", direction: "less" },
          { key: "characterShare", label: "time with a character on screen", ours: "35%", twins: "80%", direction: "more" },
        ],
        applied: {
          writer: ["The figure is on screen in the first frame, before a word is said", "Every sentence gets a new picture; nothing stays more than 2 seconds"],
          challenger: { id: "study-sec-per-shot", test: "A new picture every 1.6 s (studied) against our 4.6 s", why: "Study of \"Why billionaires never sell their stock\" (Money Doodles)" },
        },
      },
    },
    {
      id: "study-2", url: "https://www.youtube.com/watch?v=sample00002", youtubeId: "sample00002", title: "How Costco really makes money", channel: "Explained in 30",
      note: null, videoId: null, videoTitle: null, matchedBy: null, status: "watching", error: null,
      createdAt: new Date(now - 20 * 60_000).toISOString(), doneAt: null, report: null,
    },
  ];
}

export function listStudies(): Study[] {
  studies ??= seed();
  return studies;
}

export function addStudy(s: StudyCreate): Study | { error: string } {
  studies ??= seed();
  const youtubeId = youtubeIdFrom(s.url);
  if (!youtubeId) return { error: "That isn't a YouTube video link" };
  const ours = listVideos({ status: "published" });
  const videoId = s.videoId ?? null;   // no titles offline: sample data matches only what the owner picks
  const v = ours.find((x) => x.id === videoId);
  const row: Study = { id: `study-${studies.length + 1}`, url: s.url, youtubeId, title: null, channel: null, note: s.note ?? null, videoId, videoTitle: v?.title ?? null,
    matchedBy: s.videoId ? "owner" : null, status: "queued", error: null, report: null, createdAt: new Date().toISOString(), doneAt: null };
  studies.unshift(row);
  return row;
}
