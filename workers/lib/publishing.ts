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

/**
 * The next daily upload slot: `time` IST on the first day from today whose slot is at least
 * `leadMinutes` away and that has no upload yet. One upload a day, never more.
 */
export function nextSlot(now: Date, time: string, takenDays: Set<string>, leadMinutes = 30): Date {
  for (let i = 0; i < 400; i++) {
    const day = istDay(new Date(now.getTime() + i * DAY_MS));
    const slot = istSlot(day, time);
    if (slot.getTime() - now.getTime() >= leadMinutes * 60_000 && !takenDays.has(day)) return slot;
  }
  throw new Error("no free upload slot in the next 400 days");
}

const DISCLAIMER = "Illustrative only. Not financial advice.";

/** YouTube limits: title ≤100 characters, description ≤5000 bytes, tags ≤500 characters in total. */
export function youtubeMeta(v: { title: string; description: string; tags: string[] }, disclaimer = DISCLAIMER): { title: string; description: string; tags: string[] } {
  const clean = (s: string) => s.replace(/[<>]/g, "").trim();
  let title = clean(v.title);
  if (title.length > 100) title = `${title.slice(0, 99).trimEnd()}…`;

  const hashtags = [...new Set(["Shorts", ...v.tags].map((t) => t.replace(/^#/, "").replace(/\s+/g, "")).filter(Boolean))];
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
