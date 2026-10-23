/**
 * When a video run ended. The owner's dashboard actions (mark uploaded, edit, remove) also log an
 * AgentRun on the video, days later, and must not stretch the run's duration. Pure (no Prisma), so
 * workers can import and test it.
 */

/** AgentRun agents logged after the routine finished, not part of how long it ran. */
export const AFTER_RUN = ["manual_upload", "manual_edit", "manual_remove"];

export type SpanStep = { agent: string; startedAt: Date; finishedAt: Date | null };

/** The latest finish (or start) of the run's own steps, in ms; the first step's start if it has none. */
export function runEndMs(steps: SpanStep[]): number {
  const own = steps.filter((s) => !AFTER_RUN.includes(s.agent));
  if (!own.length) return Math.min(...steps.map((s) => s.startedAt.getTime()));
  return Math.max(...own.map((s) => (s.finishedAt ?? s.startedAt).getTime()));
}
