/**
 * The story clock. A timeline's frames are real frames; `tempo` says how much faster than its
 * story clock the video plays (renderer/timeline/build.py TEMPOS). Scenes animate on the story
 * clock, so a beat is converted before its scene sees it.
 */
import type { Beat } from "./timeline";

/** A beat on the story clock: its length, events and voice timings scaled up by the tempo. */
export function onStoryClock(beat: Beat, tempo: number): Beat {
  if (tempo === 1) return beat;
  const events: Record<string, number> = {};
  for (const [k, f] of Object.entries(beat.events)) events[k] = f * tempo;
  const v = beat.voice;
  return {
    ...beat, frames: beat.frames * tempo, events,
    voice: v && {
      ...v, start: v.start * tempo,
      words: v.words.map((w) => ({ ...w, s: w.s * tempo, e: w.e * tempo })),
      phonemes: v.phonemes.map((ph) => ({ ...ph, s: ph.s * tempo, e: ph.e * tempo })),
      captions: v.captions?.map((c) => ({ ...c, s: c.s * tempo, e: c.e * tempo })),
    },
  };
}
