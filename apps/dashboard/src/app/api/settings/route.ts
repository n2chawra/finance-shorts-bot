import { NextResponse } from "next/server";

import { SettingsPatchSchema, settingsProblem } from "@/lib/schemas";
import { getSettings, patchSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PATCH(req: Request) {
  const parsed = SettingsPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
  }
  const problem = settingsProblem({ ...(await getSettings()), ...parsed.data });
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  return NextResponse.json(await patchSettings(parsed.data));
}