import { NextResponse } from "next/server";

import { NotificationActionSchema } from "@/lib/schemas";
import { listNotifications, notificationAction } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listNotifications());
}

/** { ids, action: "seen" | "resolve" | "reopen" } */
export async function PATCH(req: Request) {
  const parsed = NotificationActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Expected { ids: string[], action }" }, { status: 400 });
  await notificationAction(parsed.data.ids, parsed.data.action);
  return NextResponse.json(await listNotifications());
}
