/**
 * The dive's world model (README "How it works"): every beat of a dive video reads the whole timeline,
 * so each beat draws the same world and the camera eases from the previous beat's depth to its own.
 * Depths come from params.fig (sourced figures Python fills, "105 ft"); a layer's `ft` is placement only
 * and is never printed. The world is drawn on the story clock (frames); `g` is the frame since the video began.
 */
import { Easing } from "remotion";
import type { Timeline } from "../contract/timeline";
import { diveLook, type DiveLook } from "./looks";

// "counter": draws nothing in the world; it only holds a beat's on-screen counter (the payoff's figure)
export type LayerKind = "surface" | "tunnel" | "chamber" | "cavern" | "shaft" | "foundation" | "water" | "deepest" | "counter"
  // added 2026-11-22 (more.tsx, owner: "the kit improves itself when making a video"): carved rooms, a pillared
  // hall, a walkway or water passage, a pump room, water pouring in
  | "room" | "hall" | "passage" | "pumps" | "pour" | "well" | "dig" | "spiral" | "vent";

/** One piece of the world. Only the fields of its `kind` matter (README "Pieces"). */
export interface LayerSpec {
  kind: LayerKind;
  depth?: string;            // the params.fig key that holds this layer's depth (default "depth")
  ft?: number;               // placement only, when the layer has no depth figure (never printed)
  label?: string;            // the words on its sign ("SHUTTLE", "M42", "MADISON")
  on?: string;               // the event its moment lands on (default: the beat's `on`)
  // surface
  preset?: "station" | "tube" | "needle" | "stadium" | "tower" | "monument" | "bridge" | "dam" | "street"
    | "town" | "field" | "sea" | "mountain" | "pyramid" | "dome" | "arena";   // more.tsx, 2026-11-22
  plate?: boolean;           // a readable name plate over the landmark (default on for the more.tsx presets)
  people?: number;           // room / hall / passage: how many people move in it
  // a figure carved on a tablet in the piece, counting up on a word of this beat or a later one (the payoff said in
  // the next beat, QA 2026-11-22: "20,000 is a floating headline card"): {fig, label, beat?, on}
  tally?: { fig: string; label?: string; beat?: string; on?: string };
  stay?: boolean;            // tunnel: the train stays until the loop instead of leaving at its beat's end
  tallies?: { fig: string; label?: string; beat?: string; on?: string }[];
  wall?: string; trim?: string; glass?: string; vehicle?: string;
  // tunnel / cavern
  type?: string;             // tunnel: subway | rail | road | utility; chamber: secret | vault | bunker | machine;
                             // shaft: escalator | elevator | stairs | pipe; foundation: piles | raft | caissons; water: river | aquifer | sea
  color?: string; stripe?: string; light?: string;
  bullets?: [string, string][];
  dir?: 1 | -1;
  levels?: 1 | 2;
  trains?: string[];         // cavern: one stripe colour per level
  // chamber
  props?: string[];          // machines, crates, lamp, blueprint, safe, gold, bunks, pipes, desk
  stamp?: string;            // the stamped name ("M42"); the stamp lands on `stampOn`
  stampOn?: string; plansOn?: string;
  // shaft / water / foundation
  fromFt?: number; toFt?: number;   // placement only
  side?: "left" | "right";
  riders?: number;
  glowOn?: string;
  count?: number;
  // a counter on any layer: a display that counts params.fig[counter.fig] up on its word
  counter?: { fig: string; label?: string; on?: string; side?: "left" | "right"; y?: number };   // y: the display's top on screen (default 300), to keep it off a sign (2026-11-23)
  // deepest
  text?: string;
}

export interface DiveWorldCfg {
  look?: string;
  strata?: { kind: "soil" | "clay" | "sand" | "gravel" | "bedrock" | "chalk" | "water"; toFt: number; label?: string }[];
  unit?: "ft" | "m";
  note?: string;             // fine print under the source line, e.g. "not to scale"
}

export interface DiveParams {
  move?: "surface" | "dive" | "pullback" | "rideup" | "hold";
  on?: string;               // the word the camera lands on (dive) or pulls back on (pullback)
  pull?: string;             // a pull-back later in the same beat, on this word
  zoom?: number;             // the landing zoom (0.8..1.3, default 1.1)
  layer?: LayerSpec;
  layers?: LayerSpec[];
  world?: DiveWorldCfg;      // on the first dive beat
}

export interface Layer { spec: LayerSpec; ft: number; fig: Record<string, string>; land: number; at: (name?: string) => number; beat: number; until: number }
export interface Key { g: number; y: number; z: number; ft: number }

export interface DiveWorld {
  look: DiveLook; cfg: DiveWorldCfg;
  layers: Layer[]; maxFt: number; total: number;
  Y: (ft: number) => number;
  keys: Key[]; landings: number[];
  /** the story frame of a word in any beat (by beat id), NaN when there is none */
  ev: (beat: string, name?: string) => number;
  /** every beat's params.fig, by beat id */
  figs: Record<string, Record<string, string>>;
}

/** The first number in a figure string ("105 ft" → 105, "1,200 m" → 1200); NaN when there is none. */
export const figNumber = (s: string | undefined): number => {
  const m = (s ?? "").match(/\d[\d,]*(?:\.\d+)?/);
  return m ? parseFloat(m[0].replace(/,/g, "")) : NaN;
};
/** A depth figure in feet ("32 m" → 105 ft; a bare number is in the world's unit). */
export const figFeet = (s: string | undefined, unit: "ft" | "m" = "ft"): number => {
  const n = figNumber(s);
  const metres = /\d\s*(m|metres|meters)\b/i.test(s ?? "") || (unit === "m" && !/ft|feet/i.test(s ?? ""));
  return metres ? n / 0.3048 : n;
};
/** The words a sign prints for a depth figure: the figure as Python wrote it, upper-cased, with the unit if it had none. */
export const depthText = (s: string | undefined, unit: "ft" | "m" = "ft"): string => {
  if (!s) return "";
  return /[a-z]/i.test(s) ? s.toUpperCase() : `${s} ${unit.toUpperCase()}`;
};

export const TOP: Omit<Key, "g"> = { y: -520, z: 0.82, ft: 0 };
const GAP = 820;                  // world px between two layers at least (layers draw ~±260 px round their depth)
const FIRST = 600;                // from the street to the first layer at least
const LAND_IN = 12, LAND_OUT = 14; // a dive starts 12 frames before its word and lands 14 after
export const CAM_OFFSET = 60;     // the camera looks a little under a layer's depth line
export const ANCHOR_Y = 880;      // where the camera's point sits on screen (y)
export const EASE_CAM = Easing.bezier(0.6, 0, 0.25, 1);

const diveOf = (params: Record<string, unknown>): DiveParams | null => {
  const d = params.dive;
  return d && typeof d === "object" ? (d as DiveParams) : null;
};

const cache = new WeakMap<Timeline, DiveWorld>();

/** Build (once per timeline) the world every dive beat draws. */
export function diveWorld(tl: Timeline): DiveWorld {
  const hit = cache.get(tl);
  if (hit) return hit;
  const tempo = tl.tempo ?? 1;
  const beats = tl.beats.map((b, i) => ({ i, b, d: diveOf(b.params), g0: b.from * tempo, g1: (b.from + b.frames) * tempo }));
  const dives = beats.filter((x) => x.d);
  const cfg: DiveWorldCfg = dives.find((x) => x.d!.world)?.d!.world ?? {};
  const unit = cfg.unit ?? "ft";
  const total = (tl.durationInFrames) * tempo;

  const layers: Layer[] = [];
  const beatAt = new Map<number, { land: number; at: (n?: string) => number }>();
  for (const { i, b, d, g0, g1 } of dives) {
    const fig = (b.params.fig ?? {}) as Record<string, string>;
    const ev = (name?: string) => (name && name in b.events ? g0 + b.events[name]! * tempo : NaN);
    const land = Number.isFinite(ev(d!.on)) ? ev(d!.on) : g0 + 2;
    const at = (name?: string) => { const v = ev(name); return Number.isFinite(v) ? v : land; };
    beatAt.set(i, { land, at });
    for (const spec of [...(d!.layer ? [d!.layer] : []), ...(d!.layers ?? [])]) {
      // the depth: the named fig, else a placement (`ft`, a shaft's `toFt`), else fig.depth
      const named = spec.depth !== undefined ? figFeet(fig[spec.depth], unit) : NaN;
      const placed = spec.kind === "shaft" ? (spec.toFt ?? spec.ft) : spec.ft;
      const ft = spec.kind === "surface" ? 0 : Number.isFinite(named) ? named : placed !== undefined ? placed : (figFeet(fig.depth, unit) || 0);
      layers.push({ spec, ft, fig, land: spec.on ? at(spec.on) : land, at, beat: i, until: g1 });
    }
  }
  const maxFt = Math.max(1, ...layers.map((l) => l.ft));

  // depth → world y: true to scale where layers are far apart, opened up where they crowd (not to scale)
  const PX = Math.min(36, 5400 / maxFt);
  const depths = [...new Set(layers.filter((l) => !["surface", "shaft", "foundation", "counter"].includes(l.spec.kind)).map((l) => l.ft))].sort((a, b) => a - b);
  const anchors: [number, number][] = [[0, 0]];
  for (const d of depths) {
    if (d <= 0) continue;
    const prev = anchors[anchors.length - 1]!;
    // at least a gap apart, and at most 1.3 gaps (2026-11-22: a first layer placed deep left the pull-back mostly
    // empty rock between the street and the stack; the cutaway is "not to scale" anyway)
    const min = prev[1] + (prev[0] === 0 ? FIRST : GAP);
    anchors.push([d, Math.min(Math.max(d * PX, min), min + 0.3 * GAP)]);
  }
  const Y = (ft: number): number => {
    if (ft <= 0) return ft * PX;
    for (let k = 1; k < anchors.length; k++) {
      const [f1, y1] = anchors[k]!, [f0, y0] = anchors[k - 1]!;
      if (ft <= f1) return y0 + ((ft - f0) / (f1 - f0)) * (y1 - y0);
    }
    const [fl, yl] = anchors[anchors.length - 1]!;
    return yl + (ft - fl) * PX;
  };

  // the camera: keys on the story clock, eased between
  const maxZ = 1.3;
  const stackTop = -250, stackBottom = Y(maxFt) + 500;
  // the whole stack fits between the top of the frame and the captions (QA 2026-11-22: the pull-back cut the deepest
  // room at the bottom edge, its figure inside the Shorts UI zone)
  const stackZ = Math.min(0.85, 1400 / (stackBottom - stackTop));
  const stack = { y: stackTop + (ANCHOR_Y - 60) / stackZ, z: stackZ };
  const keys: Key[] = [{ g: 0, ...TOP }];
  const landings: number[] = [];
  const last = () => keys[keys.length - 1]!;
  const hold = (g: number) => { const l = last(); if (g > l.g) keys.push({ ...l, g }); };
  const pull = (w: number) => { hold(w - 3); keys.push({ g: Math.max(last().g + 1, w + 40), y: stack.y, z: stack.z, ft: last().ft }); };
  for (const { i, d, g0, g1 } of dives) {
    const { land, at } = beatAt.get(i)!;
    const mine = layers.filter((l) => l.beat === i && l.spec.kind !== "surface");
    const move = d!.move ?? (mine.length ? "dive" : "hold");
    if (move === "dive" && mine.length) {
      const target = mine[0]!.ft;
      hold(land - LAND_IN);
      keys.push({ g: Math.max(last().g + 1, land + LAND_OUT), y: Y(target) + CAM_OFFSET, z: Math.min(maxZ, Math.max(0.8, d!.zoom ?? 1.1)), ft: target });
      landings.push(land + LAND_OUT);
    } else if (move === "pullback") {
      pull(land);
    } else if (move === "rideup") {
      hold(g0 + 18);
      keys.push({ g: Math.max(last().g + 1, Math.min(total, g1) - 6), ...TOP });
    } else if (move === "surface") {
      hold(land);
      keys.push({ g: last().g + 30, ...TOP });
    }
    if (d!.pull) pull(at(d!.pull));
  }
  const figs: Record<string, Record<string, string>> = {};
  for (const { b } of beats) figs[b.id] = (b.params.fig ?? {}) as Record<string, string>;
  const ev = (beat: string, name?: string): number => {
    const x = beats.find((y) => y.b.id === beat);
    return x && name && name in x.b.events ? x.g0 + x.b.events[name]! * tempo : NaN;
  };
  const w: DiveWorld = { look: diveLook(cfg.look), cfg, layers, maxFt, total, Y, keys, landings, ev, figs };
  cache.set(tl, w);
  return w;
}

/** The camera (world y at the anchor, zoom) and the meter's depth at story frame g. */
export function cameraAt(w: DiveWorld, g: number): Omit<Key, "g"> {
  const k = w.keys;
  let i = 0;
  while (i < k.length - 1 && k[i + 1]!.g <= g) i++;
  const a = k[i]!, b = k[Math.min(i + 1, k.length - 1)]!;
  if (b.g <= a.g || g <= a.g) return { y: a.y, z: a.z, ft: a.ft };
  const e = EASE_CAM(Math.min(1, (g - a.g) / (b.g - a.g)));
  return { y: a.y + (b.y - a.y) * e, z: a.z + (b.z - a.z) * e, ft: a.ft + (b.ft - a.ft) * e };
}

/** 0..1 between frames a and b, clamped. */
export const ramp = (t: number, a: number, b: number): number => (b <= a ? (t >= b ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / (b - a))));
