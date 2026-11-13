/** Sample notifications and agent activity, so the pages can be seen without a database. */
import { type Growth, nextReviewerRun } from "./growth";
import { isRecent } from "./recent";
import { listVideos } from "./store.sample";
import type { Activity, Agents, Notification, Notifications } from "./schemas";

const DAY_MS = 86_400_000;
const istDay = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10);

/** Sample run window: starts at hh:mm UTC on the evening/morning around IST `day`, lasts `min` minutes. */
function sampleTimes(day: string, hh: number, mm: number, min: number): { startedAt: string; finishedAt: string } {
  // evening agents (17-18 UTC) belong to the night before `day`
  const base = Date.parse(`${day}T00:00:00Z`) - (hh >= 12 ? DAY_MS : 0) + (hh * 60 + mm) * 60_000;
  return { startedAt: new Date(base).toISOString(), finishedAt: new Date(base + min * 60_000).toISOString() };
}

type State = { notifications: Notification[] };
const g = globalThis as unknown as { __fsbAutopilot?: State };

function state(): State {
  if (g.__fsbAutopilot) return g.__fsbAutopilot;
  const now = Date.now();
  const n = (id: string, severity: Notification["severity"], source: string, title: string, detail: string, fix: string, hoursAgo: number, extra: Partial<Notification> = {}): Notification => ({
    id, severity, source, title, detail, fix, createdAt: new Date(now - hoursAgo * 3_600_000).toISOString(), updatedAt: new Date(now - hoursAgo * 3_600_000).toISOString(),
    seenAt: null, resolvedAt: null, proposal: null, decision: null, ...extra,
  });
  g.__fsbAutopilot = {
    notifications: [
      n("n0", "info", "monthly", "Make long videos 8 minutes or more", "Long videos held 46% of viewers at 5 min and 44% at 8 min in the test month, and only videos of 8 minutes or more carry mid-roll ads.",
        "Approve to raise the minimum long-video length to 480 s. Studio aims for the new range from its next run.", 6,
        { proposal: { setting: "longLengthMinSec", value: 480, current: 180 } }),
      n("n1", "critical", "watchdog", "YouTube sign-in stopped working", "Google rejected the stored token: invalid_grant. Uploads and stats are stopped.",
        "1. On your PC, in the project folder: cd workers, then run: npm run auth\n2. Sign in with the channel's Google account and allow access.\n3. Save the new token: gh secret set YT_REFRESH_TOKEN (paste the value it printed).", 2),
      n("n2", "warning", "improver", "A new Claude model could make reviews sharper", "Research found a newer model for routines. Switching it is a routine setting only you can change.",
        "Open claude.ai → Code → Routines → each Finance Shorts routine → Model, and pick the newer model.", 9),
      n("n3", "info", "watchdog", "Uploads are paused (you post by hand)", "The bot uploads nothing while this is on.",
        "When Google approves the YouTube API audit: Settings → Uploads → turn off 'Pause all uploads'.", 30, { seenAt: new Date(now - DAY_MS).toISOString() }),
      n("n4", "warning", "watchdog", "GitHub Action \"Stats\" failed", "Its last run failed: a temporary YouTube Analytics error.", "Usually fixes itself on the next run.", 50,
        { resolvedAt: new Date(now - 40 * 3_600_000).toISOString(), seenAt: new Date(now - 45 * 3_600_000).toISOString() }),
    ],
  };
  return g.__fsbAutopilot;
}

export function listNotifications(): Notifications {
  const all = state().notifications.filter((n) => isRecent(n.resolvedAt ?? n.updatedAt));   // latest updates only
  const order = { critical: 0, warning: 1, info: 2 };
  const open = all.filter((n) => !n.resolvedAt).sort((a, b) => order[a.severity] - order[b.severity]);
  return { open, resolved: all.filter((n) => n.resolvedAt), unread: open.filter((n) => !n.seenAt).length };
}

export function getNotification(id: string): Notification | null {
  return state().notifications.find((n) => n.id === id) ?? null;
}

export function decideNotification(id: string, decision: "approved" | "declined"): void {
  const n = getNotification(id);
  if (!n) return;
  const now = new Date().toISOString();
  Object.assign(n, { decision, resolvedAt: now, seenAt: n.seenAt ?? now });
}

export function notificationAction(ids: string[], action: "seen" | "resolve" | "reopen"): void {
  const now = new Date().toISOString();
  for (const n of state().notifications) {
    if (!ids.includes(n.id)) continue;
    if (action === "seen") n.seenAt = now;
    if (action === "resolve") { n.resolvedAt = now; n.seenAt = n.seenAt ?? now; }
    if (action === "reopen") n.resolvedAt = null;
  }
}

export function getAgents(): Agents {
  const now = Date.now();
  const activity: Activity[] = [];
  for (let d = 0; d < 4; d++) {
    const day = istDay(now - d * DAY_MS);
    // the newest date holds only the night's first agents (auditor 23:00, research 23:47 write the
    // next day's date), as it does on the live site until the improver's 06:17 run
    const lateAgents = d === 0 ? new Set<string>(["improver", "dashboard"]) : new Set<string>();
    activity.push(...([
      {
        id: `${day}-research`, agent: "research", day, decision: "acted", ...sampleTimes(day, 18, 17, 38 + d * 3),
        summary: d === 0 ? "Studied 4 top finance Shorts and checked Claude updates. Added 3 proposals about hooks and sound." : "Looked at music and sound design in animated explainers; added 2 proposals.",
        why: "Top Shorts show the answer number within the first second and use a riser into each reveal; ours wait about 2 s.",
        findings: [
          { title: "Number in the first second", detail: "4 of 4 top videos show a big number before 1 s; ours average 1.8 s.", link: "https://www.youtube.com/shorts" },
          { title: "Riser before reveals", detail: "A short rising sweep into the reveal is common in high-retention explainers." },
          { title: "Claude Code: new subagent options", detail: "Could let QA review use a cheaper model; needs a routine change by the owner." },
        ],
        changes: [], nextCheck: null, links: [{ label: "Report", url: `improvement/research/${day}.md` }],
      },
      {
        id: `${day}-improver`, agent: "improver", day, decision: d === 1 ? "acted" : "waited", ...sampleTimes(day, 0, 47, 21 + d * 4),
        summary: d === 1 ? "Started experiment fast-hook: the answer number appears at 0.4 s in half of new videos." : "Waited: fast-hook has 5 of 8 videos per group with 48-hour data.",
        why: d === 1 ? "Highest-ranked proposal (hook), no other hook experiment running, QA passed both variants." : "Not enough data yet; judging early would be a coin flip.",
        findings: [{ title: "quiz_countdown is the strongest template", detail: "1.4× the median 48-hour views over 9 videos." }, { title: "lo-fi tracks hold attention best", detail: "avg viewed 68% vs 61% overall (n=7)." }],
        changes: d === 1 ? [{ title: "Hook number at 0.4 s (A/B)", detail: "renderer/templates/*: reveal timing behind flag fast-hook", experiment: "fast-hook", branch: `agent/improver/${day}` }] : [],
        nextCheck: istDay(now + 3 * DAY_MS), links: [],
      },
      {
        id: `${day}-dashboard`, agent: "dashboard", day, decision: d === 2 ? "acted" : "nothing", ...sampleTimes(day, 2, 7, 26 + d * 5),
        summary: d === 2 ? "Fixed the calendar cutting off long titles on phones and added a smoke test for it." : "Ran the bug hunt: build, lint and 12 smoke checks passed; no visual problems found.",
        why: d === 2 ? "Phone-width screenshot showed titles running past the side panel." : "Nothing broken, nothing in the backlog worth a change tonight.",
        findings: [], changes: d === 2 ? [{ title: "Calendar: wrap long titles on phones", branch: `agent/dashboard/${day}` }] : [], nextCheck: null, links: [],
      },
      {
        id: `${day}-auditor`, agent: "auditor", day, decision: d === 0 ? "acted" : "nothing", ...sampleTimes(day, 17, 33, 47 - d * 6),
        summary: d === 0 ? "Data audit found one video showing fewer views than YouTube right after a refresh; fixed the cause and added a test." : "Data audit clean (5 videos match YouTube); reviewed the renderer, no bugs; logged one duplicated helper for a later refactor.",
        why: d === 0 ? "The audit flagged behind_youtube on a fresh refresh: a real bug, not YouTube noise." : "Nothing wrong tonight; the refactor waits until tests cover that code.",
        findings: d === 0 ? [{ title: "Live counts read before the refresh finished", detail: "store.db.ts: one page skipped the wait for fresh counters." }] : [{ title: "Duplicated IST date helpers", detail: "Three copies of istDay(); one shared module would do." }],
        changes: d === 0 ? [{ title: "Wait for fresh counters on every page", branch: `agent/auditor/${day}` }] : [], nextCheck: null, links: [{ label: "Report", url: `improvement/auditor/${day}.md` }],
      },
    ] satisfies Activity[]).filter((a) => !lateAgents.has(a.agent)));
  }
  const videoRuns = Array.from({ length: 4 }, (_, d) => {
    const day = istDay(now - d * DAY_MS);
    const start = Date.parse(`${day}T22:37:00Z`) - DAY_MS + d * 60_000;
    return { day, start: new Date(start).toISOString(), end: new Date(start + (38 + d * 7) * 60_000).toISOString(), videos: 3 };
  });
  return {
    // the variant system's real first numbers (2026-11-04), so the sample page reads like the live one
    variants: [
      { dimension: "length", why: "seconds: the hits were 22-33 s; how short is best", default: "28-35", dropped: [],
        options: [{ option: "20-27", n: 4, median: 770 }, { option: "28-35", n: 7, median: 721 }] },
      { dimension: "topic", why: "big money vs personal budget", default: "big_money", dropped: ["budget"],
        options: [{ option: "big_money", n: 10, median: 907 }, { option: "budget", n: 10, median: 129 }] },
      { dimension: "hook", why: "the hook style", default: "question", dropped: ["shock_number"],
        options: [{ option: "question", n: 5, median: 423 }, { option: "shock_number", n: 4, median: 114 }, { option: "myth", n: 0, median: null }, { option: "secret", n: 5, median: 708 }] },
      { dimension: "style", why: "shot/build beats with the cast vs board cards", default: "shot", dropped: [],
        options: [{ option: "shot", n: 0, median: null }, { option: "board", n: 0, median: null }] },
    ],
    variantLog: [
      { at: new Date(now - 3_600_000).toISOString(), dimension: "topic", option: "budget", verdict: "drop" as const, ratio: 0.14, n: 10, confidence: 0.98 },
      { at: new Date(now - 3_600_000).toISOString(), dimension: "hook", option: "shock_number", verdict: "drop" as const, ratio: 0.27, n: 4, confidence: 0.86 },
    ],
    variantsAt: new Date(now - 3_600_000).toISOString(),
    activity,
    videoRuns,
    experiments: [
      { id: "fast-hook", area: "hook", status: "running", startedAt: istDay(now - 5 * DAY_MS), description: "Show the answer number at 0.4 s instead of 1.2 s", hypothesis: "+15% views in 48 h", templates: ["all"] },
      { id: "riser-reveal", area: "sound", status: "kept", startedAt: istDay(now - 20 * DAY_MS), description: "Riser into every reveal", result: { ratio: 1.18, confidence: 0.86, n: 9 } },
      { id: "bold-captions", area: "text", status: "reverted", startedAt: istDay(now - 30 * DAY_MS), description: "Heavier caption weight", result: { ratio: 0.88, confidence: 0.81, n: 8 } },
    ],
    proposals: [
      { id: "loop-ending", date: istDay(now), area: "ending", title: "End on a frame that loops into the hook", confidence: "medium", effort: "M", status: "new", evidence: ["https://www.youtube.com/shorts"] },
      { id: "fast-hook", date: istDay(now - 6 * DAY_MS), area: "hook", title: "Answer number within the first second", confidence: "high", effort: "S", status: "testing" },
    ],
    merges: [
      { at: new Date(now - DAY_MS).toISOString(), agent: "improver", branch: `agent/improver/${istDay(now - DAY_MS)}`, result: "merged", reasons: [] },
      { at: new Date(now - 2 * DAY_MS).toISOString(), agent: "dashboard", branch: `agent/dashboard/${istDay(now - 2 * DAY_MS)}`, result: "merged", reasons: [] },
      { at: new Date(now - 3 * DAY_MS).toISOString(), agent: "improver", branch: `agent/improver/${istDay(now - 3 * DAY_MS)}`, result: "blocked", reasons: ["generator/variety.py: protected file; no agent may change it"] },
    ],
    backlog: [{ id: "b1", kind: "idea", title: "Keyboard shortcut to mark the open video as uploaded", status: "open", page: "video" }],
    topics: [
      { id: `${istDay(now)}-rbi-repo-cut`, title: "RBI cuts the repo rate: what it does to your home-loan EMI", category: "home_loan", kind: "news", priority: "breaking",
        status: "new", found: istDay(now), expires: istDay(now + 12 * DAY_MS), templates: ["money_news"], angle: "Your EMI, not the economy", usedBy: null,
        facts: [{ label: "Repo rate", source: "RBI" }], sources: ["https://www.rbi.org.in/"] },
      { id: `${istDay(now - DAY_MS)}-sip-record-inflows`, title: "Indians put a record amount into SIPs in one month", category: "sip", kind: "news", priority: "high",
        status: "new", found: istDay(now - DAY_MS), expires: istDay(now + 10 * DAY_MS), templates: ["money_news"], usedBy: "v-sample-02",
        facts: [{ label: "SIP money in one month", source: "AMFI" }], sources: ["https://www.amfiindia.com/"] },
      { id: `${istDay(now - 3 * DAY_MS)}-itr-deadline`, title: "Missed the ITR deadline? What the late fee really costs", category: "tax", kind: "seasonal", priority: "normal",
        status: "expired", found: istDay(now - 3 * DAY_MS), expires: istDay(now - DAY_MS), templates: ["any"], usedBy: null },
    ],
    dataAudit: {
      generatedAt: new Date(now - 30 * 60_000).toISOString(), youtubeChecked: true,
      summary: { videos: 12, checked: 10, error: 0, warning: 1, info: 2, owner: 0 },
      issues: [{ kind: "ahead_of_youtube", severity: "warning", videoId: "v-sample-03", detail: "Dashboard shows 412 views, YouTube 398. Either YouTube removed invalid views or the dashboard over-counts." }],
    },
  };
}

// ---------------- the weekly loop (Growth loop page) ----------------

/** A cycle in progress after three finished ones, so every part of the Growth loop page has something to show. */
export function getGrowth(): Growth {
  const now = Date.now();
  const started = istDay(now - 4 * DAY_MS);
  const published = listVideos({ status: "published" }).sort((a, b) => (b.totals?.views ?? 0) - (a.totals?.views ?? 0)).slice(0, 3);
  return {
    source: "sample",
    running: "real-subject-first-frame",
    cycle: 4,
    status: {
      generatedAt: new Date(now - 2 * 3_600_000).toISOString(), cycle: 4, running: "real-subject-first-frame",
      thresholds: { keepPoints: 5, revertPoints: -5, confidence: 0.8 }, channelStayed14d: 0.431,
      experiment: {
        id: "real-subject-first-frame", kind: "first-second", area: "hook", startedAt: started, metric: "stayed", minPerArm: 8, maxDays: 7, extended: false,
        description: "Shorts: the real person's photo or the company's logo in the first frame, against a drawn subject",
        published: { on: 6, off: 6 }, counted: { on: 5, off: 4 }, value: { on: 0.486, off: 0.442 }, points: 4.4, pOnBetter: 0.74, days: 4,
        verdict: "wait", why: "4 of 8 Shorts a side have two days of data; day 4 of 7",
      },
    },
    challengers: [
      { id: "no-cast-unless-in-story", kind: "look", area: "scene", metric: "heldAfterHook", from: "auditor", test: "No cast on screen unless they are in the story, against the cast in every beat", why: "Beats with the cast reacting lost 9 points more viewers than beats showing the money (n=14)" },
      { id: "short-15-22s", kind: "first-second", area: "pacing", metric: "stayed", from: "review", test: "15-22 s Shorts (40-60 words) against the champion's 28-35 s", why: "the growing fact channel in our niche runs 15-20 s; our Shorts of 27 s or less had the best 48 h views (n=5)" },
      { id: "big-word-captions", kind: "look", area: "text", metric: "heldAfterHook", from: "research", test: "One big word at a time instead of sentence captions", why: "4 of the top 5 finance Shorts this week" },
      { id: "everyday-brands", kind: "first-second", area: "topic", metric: "stayed", from: "owner", test: "Brands people use daily (Netflix, Starbucks) against billionaires", why: "your note: more relatable stories" },
      { id: "parable-series", kind: "format", area: "format", metric: "stayed", from: "review", test: "A recurring two-character series", why: "the format change if three cycles stay under 45%" },
    ],
    history: [
      { cycle: 1, id: "name-in-title", kind: "first-second", started: istDay(now - 25 * DAY_MS), verdict: "keep", test: "The person's name and the figure in the title" },
      { cycle: 2, id: "slower-voice", kind: "look", started: istDay(now - 18 * DAY_MS), verdict: "revert", test: "The voice at 1.25 instead of 1.4" },
      { cycle: 3, id: "three-openings", kind: "look", started: istDay(now - 11 * DAY_MS), verdict: "abandon", test: "A darker look for every beat" },
      { cycle: 4, id: "real-subject-first-frame", kind: "first-second", started, verdict: null, test: "The real person's photo or logo in the first frame" },
    ],
    stayedByCycle: [
      { cycle: 1, champion: 0.392, challenger: 0.447, verdict: "keep" },
      { cycle: 2, champion: 0.431, challenger: 0.371, verdict: "revert" },
      { cycle: 3, champion: 0.428, challenger: 0.433, verdict: "abandon" },
    ],
    recipe: {
      updatedAt: istDay(now - 18 * DAY_MS),
      rules: [
        { id: "true-story", text: "One surprising true money fact about a real, named person or business", since: "2026-11-12", from: "owner review" },
        { id: "name-and-figure-up-front", text: "The title and the first sentence state it with the name and the figure", since: istDay(now - 18 * DAY_MS), from: "cycle 1" },
        { id: "three-openings", text: "Three openings drafted; a fresh reviewer picks the strongest", since: "2026-11-12", from: "owner review" },
        { id: "length", text: "28-35 seconds", since: "2026-11-12", from: "owner review" },
        { id: "one-narrator", text: "One narrator for every Short, the voice at 1.4", since: "2026-11-11", from: "owner review" },
      ],
      changes: [{ cycle: 1, date: istDay(now - 18 * DAY_MS), id: "name-in-title", verdict: "keep", change: "Name and figure in the title" }],
    },
    lessons: [
      { n: 1, title: "The first frame names nobody", date: istDay(now - 1 * DAY_MS), source: "reviewer", seen: "\"Your $20,000 savings\" (v-20261023-01) opened on a building labelled \"GYM\": 61% swiped away.", fix: "The first frame and first sentence name the real person or business and the figure." },
      { n: 2, title: "The real story arrives at 5 seconds", date: istDay(now - 5 * DAY_MS), source: "reviewer", seen: "Five Shorts lost 24-31% of their viewers at 5-6 s, on lines that counted what was coming.", fix: "The second sentence adds a bigger surprise, never a setup." },
      { n: 3, title: "Made-up examples", date: istDay(now - 9 * DAY_MS), source: "owner review", seen: "\"Say only 300 members ever walk through the door\": 4 shares on 14,500 views.", fix: "Tell what really happened, from sourced facts." },
    ],
    pictures: {
      writtenAt: istDay(now - 3 * DAY_MS),
      lossByPicture: [
        { kind: "cast reacting, no money on screen", drops: 11, shorts: 7, avgDrop: 0.19 },
        { kind: "text card with a sentence", drops: 8, shorts: 6, avgDrop: 0.14 },
        { kind: "money as a big object", drops: 3, shorts: 8, avgDrop: 0.06 },
      ],
      options: [], worst: "palette: dusk", reference: published.map((v) => v.id),
    },
    reference: published.map((v) => ({ id: v.id, title: v.title, thumbnailUrl: v.thumbnailUrl, views: v.totals?.views ?? null })),
    reviewer: { lastDay: istDay(now - 1 * DAY_MS), lastSummary: "Watched 6 Shorts next to their drop points; added 1 lesson (the first frame names nobody) and dropped none.", nextRunAt: nextReviewerRun(now).toISOString() },
  };
}
