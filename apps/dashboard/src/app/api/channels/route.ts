import { NextResponse } from "next/server";

import { ChannelCreateSchema, DEFAULT_CHANNEL, isLiveChannel } from "@/lib/channels";
import { currentChannel } from "@/lib/channel-scope";
import { addChannel, listChannels } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Every channel (one being deleted too: the Channels page shows it as "Deleting…"), with the one the
 * switcher has picked; a pick that is gone or being deleted falls back to the default channel. */
export async function GET() {
  const [channels, current] = await Promise.all([listChannels(), currentChannel()]);
  const live = channels.filter(isLiveChannel);
  const pick = [current, DEFAULT_CHANNEL].find((id) => live.some((c) => c.id === id)) ?? live[0]?.id ?? current;
  return NextResponse.json({ channels, current: pick });
}

/** "Add channel": the owner's niche, a few lines and 1–3 reference channels. The channel starts in setup. */
export async function POST(req: Request) {
  const parsed = ChannelCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const row = await addChannel(parsed.data);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row, { status: 201 });
}
