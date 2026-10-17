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
                         leadMinutes = 30, days?: number[]): Date {
  const sorted = [...new Set(times)].sort();
  for (let i = 0; i < 400; i++) {
    const day = istDay(new Date(now.getTime() + i * DAY_MS));
    if (days?.length && !days.includes(new Date(`${day}T00:00:00Z`).getUTCDay())) continue;
    if ((perDay.get(day) ?? 0) >= sorted.length) continue;
    for (const time of sorted) {
      const slot = istSlot(day, time);
      if (slot.getTime() - now.getTime() >= leadMinutes * 60_000 && !taken.has(slotKey(slot))) return slot;
    }
  }
  throw new Error("no free upload slot in the next 400 days");
}

/**
 * How far ahead a slot is filled. The publish job runs at 10:07, 13:07, 16:07 and 17:37 IST: 12:37
 * is filled at 10:07 and 19:07 at 16:07 (17:37 retries), so a trending video made at midday still
 * gets the evening slot instead of both slots being taken at 10:07.
 */
export const UPLOAD_LOOKAHEAD_HOURS = 4.5;

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
  for (const t of [...hashtags, "personal finance", "money", "india"]) {
    const cost = t.length + (t.includes(" ") ? 2 : 0) + (tags.length ? 1 : 0);
    if (used + cost > 500 || tags.includes(t)) continue;
    tags.push(t);
    used += cost;
  }
  return { title, description, tags };
}
