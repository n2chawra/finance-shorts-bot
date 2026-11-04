/**
 * What a queue action writes on a video. The queue sorts the owner's pick first (pickedAt), then by
 * queuePosition, so an action that moves a video out of first place must drop its pick as well:
 * otherwise "Skip to end" on the picked video left it at the front (2026-11-02 audit).
 */
export const NO_PICK = { pickedAt: null, pickReason: null } as const;

/** "Skip to end": after the last queued video, and no longer the owner's pick. */
export function skipToEnd(lastPosition: number | null | undefined) {
  return { queuePosition: (lastPosition ?? 0) + 1, ...NO_PICK };
}

/** "Upload now": out of the queue for the next publish run; the pick is used up, as when the publisher schedules it. */
export function uploadNow() {
  return { status: "scheduled" as const, queuePosition: null, ...NO_PICK };
}

/** Statuses the owner may mark stale: anything ready or nearly ready that has not been scheduled. One rule for the database and the sample store. */
export const STALE_STATUSES: readonly string[] = ["queued", "qa_passed", "rendered"];

export function canMarkStale(status: string): boolean {
  return STALE_STATUSES.includes(status);
}
