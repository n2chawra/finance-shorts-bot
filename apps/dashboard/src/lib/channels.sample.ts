import { type Channel, type ChannelCreate, type ChannelPatch, DEFAULT_CHANNEL, slugify } from "./channels";

/** Sample channels for running the dashboard with no database (store.ts's sample mode). */
const now = new Date().toISOString();
const channels: Channel[] = [
  { id: DEFAULT_CHANNEL, name: "Paisa Panchayat", status: "active", connected: true, youtubeChannelId: "UC-sample-1", connectedAt: now,
    settings: {}, request: null, counts: { queued: 6, published: 64, views7d: 4210 }, setup: null, createdAt: "2026-10-13T00:00:00.000Z" },
  { id: "space-facts-daily", name: "Space Facts Daily", status: "setup", connected: false, youtubeChannelId: null, connectedAt: null,
    settings: { dailyVideoTarget: 1 }, request: { niche: "Space facts", description: "Short true facts about space and missions.", references: ["https://www.youtube.com/@example"] },
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: now,
    setup: { stage: "verdict", decision: null, note: "Waiting for your decision", updatedAt: now, verdict: {
      call: "go-with-conditions", reason: "Steady demand and small channels break out; the look needs NASA images, which are public domain.",
      conditions: ["Use NASA public-domain images, never footage from other channels", "Shorts first; long videos only after a Short passes 5K"],
      for: ["7 of 19 small channels had a 5x hit in 6 months", "Shorts median 14K views", "Rising: views a day 1.3x six months ago"],
      against: ["Long videos rarely beat their channel median", "Crowded: 31 channels posted this month", "Low RPM band for science Shorts"],
      earnings: { m6: { low: 0, likely: 40, high: 300 }, m12: { low: 20, likely: 250, high: 1500 }, assumptions: "1 to 3 Shorts a day; Shorts RPM $0.03 to $0.08; partner programme around month 4 to 6" },
      demand: { shortsMedianViews90d: 14200, smallChannelsWithHit: "7/19", direction: 1.3 }, doable: { look: "yes", voice: "yes", policy: "fine" } } } },
];

export async function listChannels(): Promise<Channel[]> {
  return channels.map((c) => ({ ...c }));
}

export async function getChannel(id: string): Promise<Channel | null> {
  return channels.find((c) => c.id === id) ?? null;
}

export async function patchChannel(id: string, p: ChannelPatch): Promise<Channel | { error: string }> {
  const c = channels.find((x) => x.id === id);
  if (!c) return { error: "No such channel" };
  if (p.status && !["active", "paused"].includes(c.status)) return { error: `This channel is in ${c.status}; it starts with Launch, not Resume` };
  if (p.name) c.name = p.name;
  if (p.status) c.status = p.status;
  if (p.settings) c.settings = { ...c.settings, ...p.settings };
  return { ...c };
}

export async function addChannel(n: ChannelCreate): Promise<Channel | { error: string }> {
  const c: Channel = { id: slugify(n.name ?? n.niche), name: n.name ?? n.niche, status: "setup", connected: false, youtubeChannelId: null, connectedAt: null,
    settings: { dailyVideoTarget: 1 }, request: { niche: n.niche, description: n.description, references: n.references },
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: new Date().toISOString(),
    setup: { stage: "scanning", verdict: null, decision: null, note: "Reading the niche on YouTube (about 10 minutes)", updatedAt: new Date().toISOString() } };
  if (channels.some((x) => x.id === c.id)) c.id = `${c.id}-${Date.now().toString(36).slice(-5)}`;
  channels.push(c);
  return { ...c };
}

export async function connectChannel(): Promise<{ error: string }> {
  return { error: "Connect YouTube needs the real database (sample mode)" };
}

export async function decideChannel(id: string, choice: "continue" | "stop", note?: string): Promise<Channel | { error: string }> {
  const c = channels.find((x) => x.id === id);
  if (!c?.setup || c.setup.stage !== "verdict") return { error: "There is no verdict waiting for a decision" };
  const at = new Date().toISOString();
  c.setup = { ...c.setup, stage: choice === "continue" ? "research" : "stopped", decision: { choice, at, ...(note ? { note } : {}) },
    note: choice === "continue" ? "Full research starts in the next free window on your PC" : "Stopped on the quick verdict", updatedAt: at };
  return { ...c };
}
