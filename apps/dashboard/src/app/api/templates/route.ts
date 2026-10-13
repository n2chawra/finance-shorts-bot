import { NextResponse } from "next/server";

import { TemplatePatchSchema } from "@/lib/schemas";
import { listTemplates, patchTemplate } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listTemplates());
}

export async function PATCH(req: Request) {
  const parsed = TemplatePatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { id, ...patch } = parsed.data;
  const template = await patchTemplate(id, patch);
  return template ? NextResponse.json(template) : NextResponse.json({ error: "Template not found" }, { status: 404 });
}