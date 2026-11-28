/**
 * The agents' answers to one owner note, read back out of `Feedback.response`.
 *
 * Ingest (workers/lib/agents-sync.ts `ackState`) joins every agent's ack into one string:
 *   `<agent> <action>[ → <to>]: <note>[ (<sha>)]` joined by " · ", plus an optional trailing " · waiting for a, b".
 * The page showed that string as one paragraph, which was unreadable once several agents answered
 * (owner, 2026-11-28). This splits it into one reply per agent. A reply only starts at " · " followed by
 * `<agent> <known action>[ → <to>]: `, so a "·" inside an agent's own sentence never splits it; a string
 * that doesn't match at all (an older free-text answer) comes back as one reply from "the system".
 */

export const ACK_ACTIONS = ["fixed", "partly", "handed", "noted", "needs owner", "declined"] as const;
export type AckAction = (typeof ACK_ACTIONS)[number];

export type Ack = { action: AckAction; to: string | null; note: string; commit: string | null };
/** One agent's answers, oldest first; `latest` decides its status chip. */
export type AgentReply = { agent: string; acks: Ack[]; latest: Ack };
export type Replies = { agents: AgentReply[]; waiting: string[]; raw: string | null };

const ACTION = ACK_ACTIONS.map((a) => a.replace(" ", "\\s")).join("|");
const HEAD = `([a-z][a-z0-9_-]*) (${ACTION})(?: → ([a-z][a-z0-9_-]*))?: `;
const START = new RegExp(`(?:^| · )(?=${HEAD})`, "g");
const ONE = new RegExp(`^${HEAD}([\\s\\S]*)$`);
const WAITING = / · waiting for ([a-z0-9_, -]+)$/;
const COMMIT = /\s*\(([0-9a-f]{7,40})\)$/;

export function parseReplies(response: string | null | undefined): Replies {
  const text = (response ?? "").trim();
  if (!text) return { agents: [], waiting: [], raw: null };
  let body = text;
  let waiting: string[] = [];
  const w = WAITING.exec(body) ?? (/^waiting for ([a-z0-9_, -]+)$/.exec(body));
  if (w) {
    waiting = [...new Set(w[1]!.split(",").map((s) => s.trim()).filter(Boolean))];
    body = body.slice(0, w.index).trim();
  }
  const starts = [...body.matchAll(START)].map((m) => m.index! + (m[0].startsWith(" · ") ? 3 : 0));
  if (starts[0] !== 0) return { agents: [], waiting, raw: body || null };
  const byAgent = new Map<string, Ack[]>();
  starts.forEach((s, i) => {
    const seg = body.slice(s, i + 1 < starts.length ? starts[i + 1]! : undefined).replace(/ · $/, "").trim();
    const m = ONE.exec(seg);
    if (!m) return;
    let note = m[4]!.trim();
    const c = COMMIT.exec(note);
    if (c) note = note.slice(0, c.index).trim();
    const ack: Ack = { action: m[2]!.replace(/\s/, " ") as AckAction, to: m[3] ?? null, note, commit: c?.[1] ?? null };
    byAgent.set(m[1]!, [...(byAgent.get(m[1]!) ?? []), ack]);
  });
  const agents = [...byAgent].map(([agent, acks]) => ({ agent, acks, latest: acks[acks.length - 1]! }));
  return { agents, waiting, raw: null };
}

/** How each answer reads to the owner, for the chip and the one-line summary. */
export const ACTION_LABEL: Record<AckAction, { chip: string; summary: string }> = {
  fixed: { chip: "Fixed", summary: "fixed" },
  partly: { chip: "Did part", summary: "did part" },
  handed: { chip: "Not my lane", summary: "not in lane" },
  noted: { chip: "Noted", summary: "noted" },
  "needs owner": { chip: "Needs you", summary: "need you" },
  declined: { chip: "Declined", summary: "declined" },
};

/** "3 agents replied: 2 fixed, 1 not in lane" (by each agent's latest answer). */
export function summarize(r: Replies): string {
  const n = r.agents.length;
  if (!n) return "";
  const counts = new Map<AckAction, number>();
  for (const a of r.agents) counts.set(a.latest.action, (counts.get(a.latest.action) ?? 0) + 1);
  const parts = ACK_ACTIONS.filter((a) => counts.has(a)).map((a) => `${counts.get(a)} ${ACTION_LABEL[a].summary}`);
  return `${n} ${n === 1 ? "agent" : "agents"} replied: ${parts.join(", ")}`;
}
