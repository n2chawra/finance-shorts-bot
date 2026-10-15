/** Upload slots: the daily IST times from settings, turned into instants. */

const DAY_MS = 86_400_000;
const istDayOf = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10);

/** The next `n` slot instants (ms) strictly after `after`, in order, one video per slot. */
export function upcomingSlots(after: number, times: string[], n: number): number[] {
  const sorted = [...new Set(times)].sort();
  const out: number[] = [];
  for (let d = 0; out.length < n && d < 400; d++) {
    const day = istDayOf(after + d * DAY_MS);
    for (const t of sorted) {
      const at = Date.parse(`${day}T${t}:00+05:30`);
      if (at > after && out.length < n) out.push(at);
    }
  }
  return out;
}

/** "12:37 and 19:07 IST" */
export const describeTimes = (times: string[]) => {
  const s = [...times].sort();
  return `${s.length > 1 ? `${s.slice(0, -1).join(", ")} and ${s[s.length - 1]}` : s[0]} IST`;
};
