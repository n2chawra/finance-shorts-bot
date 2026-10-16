/** Sample notifications and agent activity, so the pages can be seen without a database. */
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
    seenAt: null, resolvedAt: null, ...extra,
  });
  g.__fsbAutopilot = {
    notifications: [
      n("n1", "critical", "watchdog", "YouTube sign-in stopped working", "Google rejected the stored token: invalid_grant. Uploads and stats are stopped.",
        "1. On your PC, in the project folder: cd workers, then run: npm run auth\n2. Sign in with the Money in 60 Google account and allow access.\n3. Save the new token: gh secret set YT_REFRESH_TOKEN (paste the value it printed).", 2),
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
  const all = state().notifications;
  const order = { critical: 0, warning: 1, info: 2 };
  const open = all.filter((n) => !n.resolvedAt).sort((a, b) => order[a.severity] - order[b.severity]);
  return { open, resolved: all.filter((n) => n.resolvedAt), unread: open.filter((n) => !n.seenAt).length };
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
    activity.push(
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
    );
  }
  const videoRuns = Array.from({ length: 4 }, (_, d) => {
    const day = istDay(now - d * DAY_MS);
    const start = Date.parse(`${day}T22:37:00Z`) - DAY_MS + d * 60_000;
    return { day, start: new Date(start).toISOString(), end: new Date(start + (38 + d * 7) * 60_000).toISOString(), videos: 3 };
  });
  return {
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
