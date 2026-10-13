import { NextResponse } from "next/server";

import { QueueOrderSchema } from "@/lib/schemas";
import { reorderQueue } from "@/lib/store";

export async function PATCH(req: Request) {
  const parsed = QueueOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Body must be { ids: string[] }" }, { status: 400 });
  const queue = await reorderQueue(parsed.data.ids);
  return queue ? NextResponse.json(queue) : NextResponse.json({ error: "ids must list every queued video exactly once" }, { status: 409 });
}