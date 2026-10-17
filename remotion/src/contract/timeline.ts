/**
 * The timeline Python hands to Remotion (renderer/timeline/build.py writes it). Everything a frame
 * needs is in here already resolved: figures are display strings, series are numbers computed in
 * Python, events are frame numbers. Remotion never computes a figure or a moment of its own.
 */
import { z } from "zod";

export const Word = z.object({ w: z.string(), s: z.number(), e: z.number() });
export const Phoneme = z.object({ p: z.string(), s: z.number(), e: z.number() });

export const BeatVoice = z.object({
  start: z.number().int(),            // frame within the beat where speech begins
  speaker: z.string(),
  words: z.array(Word),
  phonemes: z.array(Phoneme),
  // caption tokens as written ("₹60,000"), timed by the words that speak them (Shorts show these)
  captions: z.array(z.object({ t: z.string(), s: z.number(), e: z.number() })).optional(),
});

export const Beat = z.object({
  id: z.string(),
  scene: z.string(),
  from: z.number().int().nonnegative(),
  frames: z.number().int().positive(),
  params: z.record(z.string(), z.unknown()),
  events: z.record(z.string(), z.number().int()),
  camera: z.string(),
  transition: z.string(),
  speaker: z.string(),
  chapter: z.string().nullable().optional(),
  say: z.string(),
  voice: BeatVoice.nullable(),
});

export const Palette = z.object({
  bg: z.string(), bgBottom: z.string(), text: z.string(), muted: z.string(), accent: z.string(),
  danger: z.string(), panel: z.string(), grid: z.string(), cast: z.array(z.string()).length(3),
});

export const Thumbnail = z.object({
  who: z.string(),
  pose: z.string().optional(),
  expression: z.string().optional(),
  prop: z.string().optional(),
  figure: z.string(),                 // one of `figures`, never typed
  words: z.string(),                  // four words at most
  sub: z.string().optional(),
});

export const Timeline = z.object({
  version: z.literal(1),
  id: z.string(),
  format: z.enum(["short", "long"]),
  fps: z.literal(30),
  width: z.number().int(),
  height: z.number().int(),
  durationInFrames: z.number().int().positive(),
  seed: z.number().int(),
  template: z.string().nullable().optional(),
  palette: Palette,
  figures: z.record(z.string(), z.string()),
  beats: z.array(Beat).min(1),
  voices: z.record(z.string(), z.string()),
  speed: z.number(),
  // the video plays this much faster than its story clock (renderer/timeline/build.py TEMPOS):
  // frames here are real frames; scenes animate on the story clock (StoryVideo converts)
  tempo: z.number().positive().default(1),
  music: z.object({ genre: z.string(), key: z.string(), bpm: z.number() }),
  audio: z.object({ file: z.string(), peak_db: z.number(), mean_db: z.number() }),
  disclaimer: z.literal("Illustrative only. Not financial advice."),
  voiceMode: z.enum(["kokoro", "estimate"]),
  thumbnail: Thumbnail.nullable().optional(),
});

export type Timeline = z.infer<typeof Timeline>;
export type Beat = z.infer<typeof Beat>;
export type PaletteT = z.infer<typeof Palette>;
export type ThumbnailT = z.infer<typeof Thumbnail>;
