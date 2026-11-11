/** Pure helpers for the publisher: upload slots and YouTube metadata. No I/O, so they are tested directly. */

const IST_OFFSET_MIN = 330;
const DAY_MS = 86_400_000;

/** YYYY-MM-DD in IST. */
export function istDay(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

/** The instant `HH:MM` IST falls on the IST date `day`. */
export function istSlot(day: string, time: string): Date {
  return new Date(`${day}T${time}:00+05:30`);
}

/** HH:MM in IST. */
export function istTime(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MIN * 60_000).toISOString().slice(11, 16);
}

/** A video's style marks it breaking or trending until an IST day (set by ingest from the manifest's
 * priority); it may take a trend slot on or before that day. */
export function isUrgent(style: unknown, day: string): boolean {
  const urgent = (style as { source?: { urgent?: { until?: unknown } | null } } | null)?.source?.urgent;
  return typeof urgent?.until === "string" && urgent.until >= day;
}

/** Minute-precision key for an upload instant, so a slot and its upload compare equal. */
export const slotKey = (d: Date) => d.toISOString().slice(0, 16);

/**
 * The next free upload slot: one of `times` (IST, any order) on the first day from today that is at
 * least `leadMinutes` away, not already used (`taken` holds slot keys of existing uploads), and on
 * a day that has fewer uploads (`perDay`) than there are slots. So never more than `times.length`
 * uploads a day. `days`, when given, limits it to those IST weekdays (0 = Sunday), which is how
 * long videos go out on set days.
 */
export function nextSlot(now: Date, times: string[], taken: Set<string>, perDay: Map<string, number>,
                         leadMinutes = 30, days?: number[], everyDays = 1): Date {
  const sorted = [...new Set(times)].sort();
  for (let i = 0; i < 400; i++) {
    const day = istDay(new Date(now.getTime() + i * DAY_MS));
    if (days?.length && !days.includes(new Date(`${day}T00:00:00Z`).getUTCDay())) continue;
    if ((perDay.get(day) ?? 0) >= sorted.length) continue;
    if (restDay(day, perDay, everyDays)) continue;
    for (const time of sorted) {
      const slot = istSlot(day, time);
      if (slot.getTime() - now.getTime() >= leadMinutes * 60_000 && !taken.has(slotKey(slot))) return slot;
    }
  }
  throw new Error("no free upload slot in the next 400 days");
}

/** With one upload every `everyDays` days (the 48-hour test, owner 2026-10-30), a day within
 * `everyDays - 1` days after a day with an upload is a rest day. Manual uploads count too. */
export function restDay(day: string, perDay: Map<string, number>, everyDays = 1): boolean {
  for (let back = 1; back < everyDays; back++) {
    const before = istDay(new Date(Date.parse(`${day}T12:00:00+05:30`) - back * DAY_MS));
    if ((perDay.get(before) ?? 0) > 0) return true;
  }
  return false;
}

/**
 * How far ahead a slot is filled (the publish job's runs are in publish.yml): 12:37 is filled at
 * 10:07 and 19:07 at 16:07, so a trending video made at midday still gets an evening slot instead
 * of every slot being taken in the morning.
 */
export const UPLOAD_LOOKAHEAD_HOURS = 4.5;

/** The least time between an upload and its publish time (owner, 2026-11-09): an upload takes ~20 s,
 * and GitHub starts cron runs hours late, so 30 minutes made late runs skip slots they could still fill. */
export const MIN_LEAD_MINUTES = 10;

/** A slot that passed without an upload is caught up for this long after it (owner, 2026-11-09:
 * 9 Nov lost the 07:07 and 19:07 Shorts because the only runs near them came within the lead time). */
export const CATCH_UP_HOURS = 2;

/** How far after a slot an upload still counts as that slot's (the dashboard's posting plan uses 3 h too). */
export const FILLED_WITHIN_HOURS = 3;

/** The publish time for a video uploaded right now: a catch-up, or "Upload now". `i` spaces several apart. */
export function soonSlot(now: Date, i = 0): Date {
  return new Date(Math.ceil(now.getTime() / 60_000) * 60_000 + (15 + 5 * i) * 60_000);
}

/**
 * Today's slots (IST `times`) that passed in the last CATCH_UP_HOURS, or are closer than the lead
 * time, with no upload at or up to FILLED_WITHIN_HOURS after them (`uploads`: publish times of this
 * format), oldest first. The publisher fills each with a video that goes public in a few minutes.
 */
export function missedSlots(now: Date, times: string[], uploads: Date[], leadMinutes = MIN_LEAD_MINUTES,
                            catchUpHours = CATCH_UP_HOURS): Date[] {
  const day = istDay(now);
  const filled = (slot: Date) => uploads.some((u) => u.getTime() >= slot.getTime() && u.getTime() - slot.getTime() <= FILLED_WITHIN_HOURS * 3_600_000);
  return [...new Set(times)].sort().map((t) => istSlot(day, t)).filter((slot) => {
    const ahead = slot.getTime() - now.getTime();
    return ahead < leadMinutes * 60_000 && ahead >= -catchUpHours * 3_600_000 && !filled(slot);
  });
}

/** Whether a slot is close enough to fill now (see UPLOAD_LOOKAHEAD_HOURS). */
export function dueSoon(now: Date, slot: Date, hours = UPLOAD_LOOKAHEAD_HOURS): boolean {
  return slot.getTime() - now.getTime() <= hours * 3_600_000;
}

const DISCLAIMER = "Illustrative only. Not financial advice.";

/**
 * YouTube limits: title ≤100 characters, description ≤5000 bytes, tags ≤500 characters in total.
 * Only a Short gets the #Shorts tag; putting it on a landscape video would mislabel it.
 */
export function youtubeMeta(v: { title: string; description: string; tags: string[] }, disclaimer = DISCLAIMER,
                            format: "short" | "long" = "short"): { title: string; description: string; tags: string[] } {
  const clean = (s: string) => s.replace(/[<>]/g, "").trim();
  let title = clean(v.title);
  if (title.length > 100) title = `${title.slice(0, 99).trimEnd()}…`;

  const hashtags = [...new Set([...(format === "short" ? ["Shorts"] : []), ...v.tags].map((t) => t.replace(/^#/, "").replace(/\s+/g, "")).filter(Boolean))];
  let description = clean(v.description);
  if (!description.includes(disclaimer)) description = `${description}\n\n${disclaimer}`.trim();
  description = `${description}\n\n${hashtags.map((t) => `#${t}`).join(" ")}`;
  while (new TextEncoder().encode(description).length > 5000) description = description.slice(0, -50);

  const tags: string[] = [];
  let used = 0;
  // no country tag: most videos are global, and "india" on a dollar story told YouTube the wrong audience (2026-11-11)
  for (const t of [...hashtags, "personal finance", "money"]) {
    const cost = t.length + (t.includes(" ") ? 2 : 0) + (tags.length ? 1 : 0);
    if (used + cost > 500 || tags.includes(t)) continue;
    tags.push(t);
    used += cost;
  }
  return { title, description, tags };
}
