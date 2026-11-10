/** India's wall clock (IST = UTC+5:30, no daylight saving), for checks that run "after 11:00 IST" or "on Wednesdays". */
const IST_MS = 330 * 60_000;

/** The hour (0-23) a clock in India shows at `now`. */
export const istHour = (now: Date): number => new Date(now.getTime() + IST_MS).getUTCHours();

/** The weekday (0 = Sunday) in India at `now`. */
export const istWeekday = (now: Date): number => new Date(now.getTime() + IST_MS).getUTCDay();
