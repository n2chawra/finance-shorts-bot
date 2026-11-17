import { type Channel, type ChannelCreate, type ChannelPatch, DEFAULT_CHANNEL, slugify } from "./channels";

/** Sample channels for running the dashboard with no database (store.ts's sample mode). */
const now = new Date().toISOString();
const channels: Channel[] = [
  { id: DEFAULT_CHANNEL, name: "Paisa Panchayat", status: "active", connected: true, youtubeChannelId: "UC-sample-1", connectedAt: now,
    settings: {}, request: null, counts: { queued: 6, published: 64, views7d: 4210 }, createdAt: "2026-10-13T00:00:00.000Z" },
  { id: "space-facts-daily", name: "Space Facts Daily", status: "setup", connected: false, youtubeChannelId: null, connectedAt: null,
    settings: { dailyVideoTarget: 1 }, request: { niche: "Space facts", description: "Short true facts about space and missions.", references: ["https://www.youtube.com/@example"] },
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: now },
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
    counts: { queued: 0, published: 0, views7d: 0 }, createdAt: new Date().toISOString() };
  if (channels.some((x) => x.id === c.id)) c.id = `${c.id}-${Date.now().toString(36).slice(-5)}`;
  channels.push(c);
  return { ...c };
}

export async function connectChannel(): Promise<{ error: string }> {
  return { error: "Connect YouTube needs the real database (sample mode)" };
}
