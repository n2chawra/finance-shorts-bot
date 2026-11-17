import { NextResponse } from "next/server";

import { ChannelCreateSchema } from "@/lib/channels";
import { currentChannel } from "@/lib/channel-scope";
import { addChannel, listChannels } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Every channel, with the one the switcher has picked. */
export async function GET() {
  const [channels, current] = await Promise.all([listChannels(), currentChannel()]);
  return NextResponse.json({ channels, current: channels.some((c) => c.id === current) ? current : channels[0]?.id ?? current });
}

/** "Add channel": the owner's niche, a few lines and 1–3 reference channels. The channel starts in setup. */
export async function POST(req: Request) {
  const parsed = ChannelCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const row = await addChannel(parsed.data);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row, { status: 201 });
}
