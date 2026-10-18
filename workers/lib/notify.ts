import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Owner notifications: things that need a human (a key, a token, a setting, a broken job). Shown on
 * the dashboard's Notifications page. One row per `key`: raising it again updates the row (and
 * reopens it if it was resolved), `resolve` closes it when the condition clears.
 */
export type Notice = {
  key: string;
  source: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  /** What the owner should do, step by step. */
  fix: string;
  /** A setting change the owner can approve with one click (the monthly review's proposals). */
  proposal?: { setting: string; value?: unknown; current?: unknown };
};

/** How long a notification the owner marked resolved stays closed while its check still fails. */
export const DISMISS_MS = 7 * 86_400_000;

/** Whether a resolved notification is still inside the owner's dismissal (see DISMISS_MS). */
export const stillDismissed = (n: { resolvedAt: Date | null; dismissedAt: Date | null }, now = new Date()) =>
  Boolean(n.resolvedAt && n.dismissedAt && now.getTime() - n.dismissedAt.getTime() < DISMISS_MS);

export async function notify(prisma: PrismaClient, n: Notice): Promise<void> {
  const data = { source: n.source, severity: n.severity, title: n.title, detail: n.detail, fix: n.fix,
    ...(n.proposal ? { proposal: n.proposal as Prisma.InputJsonValue } : {}) };
  const existing = await prisma.notification.findUnique({ where: { dedupeKey: n.key } });
  if (existing?.decidedAt) return;   // the owner approved or declined it: never raised again
  if (!existing) {
    await prisma.notification.create({ data: { dedupeKey: n.key, ...data } });
  } else if (existing.resolvedAt && stillDismissed(existing)) {
    await prisma.notification.update({ where: { dedupeKey: n.key }, data });   // keep it current, but closed
  } else if (existing.resolvedAt) {
    await prisma.notification.update({ where: { dedupeKey: n.key }, data: { ...data, resolvedAt: null, seenAt: null } });
  } else {
    await prisma.notification.update({ where: { dedupeKey: n.key }, data });
  }
}

/** The condition cleared: close it, and forget an owner dismissal so a later recurrence shows at once. */
export async function resolve(prisma: PrismaClient, key: string): Promise<void> {
  await prisma.notification.updateMany({ where: { dedupeKey: key, resolvedAt: null }, data: { resolvedAt: new Date() } });
  await prisma.notification.updateMany({ where: { dedupeKey: key, dismissedAt: { not: null } }, data: { dismissedAt: null } });
}

/** Resolve every open notification whose key starts with `prefix` and isn't in `keep`. */
export async function resolveOthers(prisma: PrismaClient, prefix: string, keep: Set<string>): Promise<void> {
  const live = await prisma.notification.findMany({
    where: { dedupeKey: { startsWith: prefix }, OR: [{ resolvedAt: null }, { dismissedAt: { not: null } }] }, select: { dedupeKey: true } });
  for (const o of live) if (!keep.has(o.dedupeKey)) await resolve(prisma, o.dedupeKey);
}

export const TOKEN_FIX = [
  "1. On your PC, in the project folder: cd workers, then run: npm run auth",
  "2. Sign in with the Money in 60 Google account and allow access.",
  "3. Save the new token: gh secret set YT_REFRESH_TOKEN (paste the value it printed).",
  "4. Check the OAuth consent screen is still in Production (Google Cloud → APIs & Services → OAuth consent screen).",
].join("\n");
