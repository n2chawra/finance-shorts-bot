import { type Channel, type ChannelCreate, type ChannelPatch, DEFAULT_CHANNEL, slugify } from "./channels";

/** Sample channels for running the dashboard with no database (store.ts's sample mode). */
const now = new Date().toISOString();
const channels: Channel[] = [
  { id: DEFAULT_CHANNEL, name: "Paisa Panchayat", status: "active", connected: true, youtubeChannelId: "UC-sample-1", connectedAt: now,
    settings: {}, request: null, counts: { queued: 6, published: 64, views7d: 4210 }, setup: null,
    health: { color: "amber", reason: "stayed to watch fell to 37% from 44%: diagnosis tonight", bufferDays: 2, stayed: 0.37, usageShare: 1 }, createdAt: "2026-10-13T00:00:00.000Z" },
  { id: "space-facts-daily", name: "Space Facts Daily", status: "setup", connected: false, youtubeChannelId: null, connectedAt: null,
    settings: { dailyVideoTarget: 1 }, request: { niche: "Space facts", description: "Short true facts about space and missions.", references: ["https://www.youtube.com/@example"] },
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: now, health: null,
    setup: { stage: "verdict", review: null, decision: null, note: "Waiting for your decision", updatedAt: now, verdict: {
      call: "go-with-conditions", reason: "Steady demand and small channels break out; the look needs NASA images, which are public domain.",
      conditions: ["Use NASA public-domain images, never footage from other channels", "Shorts first; long videos only after a Short passes 5K"],
      for: ["7 of 19 small channels had a 5x hit in 6 months", "Shorts median 14K views", "Rising: views a day 1.3x six months ago"],
      against: ["Long videos rarely beat their channel median", "Crowded: 31 channels posted this month", "Low RPM band for science Shorts"],
      earnings: { m6: { low: 0, likely: 40, high: 300 }, m12: { low: 20, likely: 250, high: 1500 }, assumptions: "1 to 3 Shorts a day; Shorts RPM $0.03 to $0.08; partner programme around month 4 to 6" },
      demand: { shortsMedianViews90d: 14200, smallChannelsWithHit: "7/19", direction: 1.3 }, doable: { look: "yes", voice: "yes", policy: "fine" } } } },
  { id: "space-facts-daily-review", name: "Space Facts Daily (review)", status: "setup", connected: true, youtubeChannelId: "UC-sample-2", connectedAt: now,
    settings: { dailyVideoTarget: 1 }, request: null, counts: { queued: 2, published: 0, views7d: 0 }, createdAt: now, health: null,
    setup: { stage: "review", verdict: null, decision: { choice: "continue", at: now }, note: "Samples ready for your review", updatedAt: now, review: {
      advice: [
        "## Topic kinds to make", "1. **Real objects in space and what they cost** (core, 2.1x): 2 in 3 Shorts.",
        "2. **Missions that went wrong** (core, 1.7x): 1 in 3.", "", "## Avoid", "- Space news (0.6x).", "",
        "## How many", "2 Shorts a day; no long videos until a Short passes 5K.",
      ].join("\n"),
      counts: { shortsPerDay: 2, longPerWeek: 0, reasons: ["Channels with a Shorts hit post about 1.6 a day.", "No long videos at first: 1 small channel had a long hit."] },
      likeness: { "v-20261120-01": { format: "short", references: 12, within: 4, of: 5, pass: true, rows: [
        { measure: "seconds per shot", ours: 1.9, theirs: 2.1, within: true }, { measure: "shots in the first 3 s", ours: 2, theirs: 2, within: true },
        { measure: "spoken words a minute", ours: 205, theirs: 178, within: true }, { measure: "seconds to the first figure", ours: 4.2, theirs: 2.5, within: false },
        { measure: "length (s)", ours: 31, theirs: 33, within: true }] } },
      approved: null, notes: [] } } },
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
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: new Date().toISOString(), health: null,
    setup: { stage: "scanning", review: null, verdict: null, decision: null, note: "Reading the niche on YouTube (about 10 minutes)", updatedAt: new Date().toISOString() } };
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

export async function channelSamples(id: string) {
  return id === "space-facts-daily-review" ? [
    { id: "v-20261120-01", title: "Why is there a car orbiting the Sun right now?", format: "short", status: "queued", durationSec: 31 },
    { id: "v-20261120-02", title: "How much did one Apollo moonwalk cost?", format: "short", status: "queued", durationSec: 29 },
  ] : [];
}

export async function reviewChannel(id: string, a: import("./channels").ReviewAction): Promise<Channel | { error: string }> {
  const c = channels.find((x) => x.id === id);
  if (!c?.setup || !["samples", "review"].includes(c.setup.stage)) return { error: "This channel has no samples to review yet" };
  const at = new Date().toISOString();
  const review = c.setup.review ?? { advice: null, counts: null, likeness: {}, approved: null, notes: [] };
  if (a.action === "stop") c.setup = { ...c.setup, stage: "stopped", note: "Stopped on the Launch review" };
  else if (a.action === "note") c.setup = { ...c.setup, review: { ...review, approved: null, notes: [...review.notes, { at, text: a.text, videoId: a.videoId, done: false }] } };
  else c.setup = { ...c.setup, review: { ...review, approved: { at, shortsPerDay: a.shortsPerDay, longPerWeek: a.longPerWeek } } };
  return { ...c };
}

export async function launchChannel(id: string): Promise<Channel | { error: string }> {
  const c = channels.find((x) => x.id === id);
  if (!c?.setup?.review?.approved) return { error: "Approve the samples on the Launch review first" };
  if (!c.connected) return { error: "Connect YouTube first: the channel has no sign-in yet" };
  c.status = "active";
  c.setup = { ...c.setup, stage: "launched" };
  return { ...c };
}

export async function channelFit(id: string) {
  const { fitCheck, promptFor } = await import("./routine-plan");
  const live = [{ id: DEFAULT_CHANNEL, name: "Paisa Panchayat", shortsPerDay: 3, longPerWeek: 2, uploadTimes: ["07:07", "12:37", "19:07"], longUploadTimes: ["20:07"] }];
  const f = fitCheck(live, { id, name: id, shortsPerDay: 2, longPerWeek: 0, uploadTimes: ["08:07", "14:07"] });
  return { fits: f.fits, problems: f.problems, slots: f.slots.map((s) => ({ ...s, prompt: promptFor(s) })) };
}
