import { NextResponse } from "next/server";

import { NotificationActionSchema, PROPOSABLE_SETTINGS, SettingsPatchSchema, settingsProblem } from "@/lib/schemas";
import { decideNotification, getNotification, getSettings, listNotifications, notificationAction, patchSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listNotifications());
}

/** { ids, action: "seen" | "resolve" | "reopen" }, or { ids: [id], action: "approve" | "decline" } on a proposal */
export async function PATCH(req: Request) {
  const parsed = NotificationActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Expected { ids: string[], action }" }, { status: 400 });
  const { ids, action } = parsed.data;
  if (action === "approve" || action === "decline") {
    const n = await getNotification(ids[0]!);
    if (!n?.proposal) return NextResponse.json({ error: "This notification has no proposal" }, { status: 400 });
    if (n.decision) return NextResponse.json({ error: `Already ${n.decision}` }, { status: 409 });
    if (action === "approve") {
      const error = await applyProposal(n.proposal.setting, n.proposal.value);
      if (error) return NextResponse.json({ error }, { status: 400 });
    }
    await decideNotification(n.id, action === "approve" ? "approved" : "declined");
  } else {
    await notificationAction(ids, action);
  }
  return NextResponse.json(await listNotifications());
}

/** Writes an approved setting through the same checks as the Settings page. Returns an error or null. */
async function applyProposal(setting: string, value: unknown): Promise<string | null> {
  if (!(PROPOSABLE_SETTINGS as readonly string[]).includes(setting)) return `${setting} can't be changed by a proposal`;
  const patch = SettingsPatchSchema.safeParse({ [setting]: value });
  if (!patch.success) return `${setting}: ${patch.error.issues[0]?.message ?? "invalid value"}`;
  const problem = settingsProblem({ ...(await getSettings()), ...patch.data });
  if (problem) return problem;
  await patchSettings(patch.data);
  return null;
}
