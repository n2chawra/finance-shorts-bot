/**
 * Where and when a story scene happens, so no two videos look alike (owner, 2026-10-19: "the
 * background, moving objects ... should be according to the script for every video, don't repeat").
 *
 * A writer picks these to fit the story (a late-night bill in a dark room, a sunny morning kitchen, a
 * snowy road for a long winter of debt). Anything left unset is chosen per video, deterministically
 * from the video's id, so a re-render looks the same, the beats of one video agree with each other,
 * and the next video gets something else.
 */
import { random } from "remotion";
import type { Timeline } from "../contract/timeline";

export const TIMES = ["dawn", "noon", "sunset", "night"] as const;
export const LANDS = ["fields", "desert", "snow", "city", "coast"] as const;
export const WEATHERS = ["clear", "clear", "rain", "snow", "leaves"] as const;
export const PLACES = ["home", "kitchen", "office", "cafe"] as const;
export type Time = (typeof TIMES)[number];
export type Land = (typeof LANDS)[number];
export type Weather = (typeof WEATHERS)[number];
export type Place = (typeof PLACES)[number];

/** The script's choice if it is one of `options`, else one picked per video (stable for the video). */
export function pick<T extends string>(tl: Pick<Timeline, "id" | "seed">, key: string, options: readonly T[], given?: unknown): T {
  if (typeof given === "string" && (options as readonly string[]).includes(given)) return given as T;
  return options[Math.floor(random(`${tl.id}:${tl.seed}:${key}`) * options.length) % options.length]!;
}

/** Weather that suits a land (no snow in the desert, no rain on a snowfield). */
export function weatherFor(tl: Pick<Timeline, "id" | "seed">, land: Land, given?: unknown): Weather {
  const fits: Record<Land, readonly Weather[]> = {
    fields: ["clear", "clear", "rain", "leaves"], desert: ["clear"], snow: ["clear", "snow", "snow"],
    city: ["clear", "rain", "rain"], coast: ["clear", "clear", "rain"],
  };
  return pick(tl, "weather", fits[land], given);
}

export interface Sky { top: string; mid: string; bottom: string; sun: string; sunUp: boolean; stars: boolean; cloud: string; cloudAlpha: number }
export const SKIES: Record<Time, Sky> = {
  dawn: { top: "#6d7fd1", mid: "#f6a9b5", bottom: "#ffe1c4", sun: "#fff1d6", sunUp: true, stars: false, cloud: "#ffe9ef", cloudAlpha: 0.7 },
  noon: { top: "#5fb2ee", mid: "#9dd3f6", bottom: "#e6f5fd", sun: "#fffbe8", sunUp: true, stars: false, cloud: "#ffffff", cloudAlpha: 0.9 },
  sunset: { top: "#f08a5d", mid: "#ffc489", bottom: "#fff0d8", sun: "#fff4cf", sunUp: true, stars: false, cloud: "#ffffff", cloudAlpha: 0.55 },
  night: { top: "#0d1233", mid: "#232a5e", bottom: "#3b3f78", sun: "#f3efd2", sunUp: false, stars: true, cloud: "#8890c4", cloudAlpha: 0.25 },
};

export interface LandLook { ground: string; near: string; far: string; far2: string; road: string; line: string }
export const LAND_LOOKS: Record<Land, LandLook> = {
  fields: { ground: "#8bbf6a", near: "#9fcb7e", far: "#a9775f", far2: "#c98f7b", road: "#5b5f6e", line: "#f4e6b8" },
  desert: { ground: "#e3b778", near: "#ecc690", far: "#c98a52", far2: "#d9a36b", road: "#6d5d52", line: "#fff3d6" },
  snow: { ground: "#eef3f8", near: "#ffffff", far: "#9fb2cc", far2: "#c3d0e2", road: "#5f6675", line: "#ffd34d" },
  city: { ground: "#9aa3ad", near: "#b3bbc4", far: "#5d6a85", far2: "#7d89a3", road: "#3f4350", line: "#ffffff" },
  coast: { ground: "#e8d4a2", near: "#f1e2b8", far: "#2f8fbf", far2: "#57b0d9", road: "#5b5f6e", line: "#ffffff" },
};

/** Night darkens everything on the ground a little. */
export function dim(hex: string, time: Time): string {
  if (time !== "night") return hex;
  const n = parseInt(hex.slice(1), 16), f = (c: number) => Math.round(c * 0.45);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
