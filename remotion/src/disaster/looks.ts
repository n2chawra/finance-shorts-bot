/**
 * The disasters channel's look recipes (channel.json look.rotation; build spec
 * channels/disasters-and-engineering-failures-expla/style-study/2026-11-20-references.md §9).
 *
 * One recipe per video (`style.recipe`, chosen by the planner, gated by generator/looks.py
 * recipe_problems: never one of the last `avoidLast`). Every flat, doc and 3D piece reads the same
 * tokens, so the whole film is one look. Constant across recipes (the channel's identity): mono labels,
 * the honesty tags, and red only for the failure (`fail`).
 *
 * Fonts are the OFL faces already in public/fonts (loaded by ../doc/fonts): Courier Prime (mono labels),
 * Anton / Poppins Black (heavy values), Playfair Display (serif titles).
 */
import { createContext, useContext } from "react";
import "../doc/fonts";

export const RECIPES = [
  "night-grid", "blueprint", "clay-studio", "chalk-site", "investigators-desk",
  "instrument-panel", "storm-weather", "archive-rebuild", "satellite-atlas", "cross-section",
] as const;
export type RecipeId = (typeof RECIPES)[number];
export const isRecipe = (x: unknown): x is RecipeId => typeof x === "string" && (RECIPES as readonly string[]).includes(x);

/** Cheap deterministic overlays drawn by <Texture> (no images, seeded by the frame). */
export type TextureKind = "dust" | "paper" | "grid" | "chalk" | "scanline" | "grain" | "halftone" | "rain" | "haze" | "hatch" | "none";

export type FontRoles = { mono: string; value: string; title: string; body: string };

export type DisasterLook = {
  id: RecipeId;
  name: string;
  /** background (top → bottom), ink for lines, the warm label accent, secondary text, the one failure red */
  bg: [string, string];
  ink: string;
  line: string;
  accent: string;
  label: string;
  muted: string;
  /** the failure: always a red (the constant across recipes) */
  fail: string;
  /** "normal"/safe state (comparison bars, healthy parts) */
  ok: string;
  /** water / air / fluid fills in cross-sections */
  fluid: string;
  /** solid structure fill (concrete, steel, hull) and its shadow tone */
  solid: string;
  solidShade: string;
  /** a panel behind labels (callout boxes, tags) */
  panel: string;
  /** textures layered over the whole frame, in order, with strength 0..1 */
  textures: { kind: TextureKind; o: number }[];
  /** outlines on flat shapes: blueprint/cross-section use thin line, chalk none, clay soft */
  stroke: number;
  /** a slight hand wobble on drawn lines (chalk, desk): 0 = ruler-straight */
  wobble: number;
  fonts: FontRoles;
  /** how the camera moves in this look (the director's hint; the 3D kit and flat View read it) */
  camera: { moves: string[]; drift: number; note: string };
  /** share of the film per kit, in percent (3D / flat / doc / cards) */
  mix: { three: number; flat: number; doc: number; cards: number };
  /** the 3D kit's matching look (remotion/src/three/disaster/look.tsx DLookName) */
  three: "nightGrid" | "blueprint" | "clay" | "chalk" | "storm" | "crossSection";
  /** the doc kit's grade (remotion/src/doc/theme.tsx GradeName) and page surface */
  grade: "doc" | "cold" | "warm" | "night" | "bleach" | "archive" | "bw" | "none";
  surface: "desk" | "felt" | "dark" | "paper";
};

const MONO = "'Courier Prime', 'Courier New', monospace";
const SERIF = "'Playfair Display', Georgia, serif";
const ANTON = "Anton, Poppins, sans-serif";
const POPPINS = "Poppins, sans-serif";
const F: FontRoles = { mono: MONO, value: ANTON, title: SERIF, body: POPPINS };
const RED = "#ff3b30";

export const LOOKS: Record<RecipeId, DisasterLook> = {
  "night-grid": {
    id: "night-grid", name: "Night Grid", bg: ["#13263a", "#0d1b2a"], ink: "#e8f1fa", line: "#59c8ff", accent: "#f0a030",
    label: "#f0a030", muted: "rgba(232,241,250,0.62)", fail: RED, ok: "#3fa7ff", fluid: "#1f5f8f", solid: "#2a3e55", solidShade: "#1a2a3c",
    panel: "rgba(6,14,24,0.82)", textures: [{ kind: "grid", o: 0.18 }, { kind: "dust", o: 0.5 }], stroke: 2, wobble: 0, fonts: F,
    camera: { moves: ["slow orbit", "push-in to callout"], drift: 0.02, note: "slow orbits round the path, pushes into each callout" },
    mix: { three: 45, flat: 25, doc: 20, cards: 10 }, three: "nightGrid", grade: "night", surface: "dark",
  },
  blueprint: {
    id: "blueprint", name: "Blueprint", bg: ["#1d55b8", "#0f3a8a"], ink: "#f4f8ff", line: "#ffffff", accent: "#ffd84a",
    label: "#ffd84a", muted: "rgba(244,248,255,0.7)", fail: RED, ok: "#bfe0ff", fluid: "#7fb4ff", solid: "rgba(255,255,255,0.12)", solidShade: "rgba(255,255,255,0.05)",
    panel: "rgba(10,40,100,0.85)", textures: [{ kind: "grid", o: 0.35 }, { kind: "paper", o: 0.25 }], stroke: 2.5, wobble: 0, fonts: F,
    camera: { moves: ["locked elevation", "pan along structure"], drift: 0.01, note: "locked orthographic elevations, pans along the structure; 3D only at the failure" },
    mix: { three: 30, flat: 45, doc: 25, cards: 0 }, three: "blueprint", grade: "cold", surface: "dark",
  },
  "clay-studio": {
    id: "clay-studio", name: "Clay Studio", bg: ["#1c1c20", "#060607"], ink: "#f4efe7", line: "#e9e2d6", accent: "#2f7de1",
    label: "#2f7de1", muted: "rgba(244,239,231,0.6)", fail: RED, ok: "#2f7de1", fluid: "#9cc3e0", solid: "#e9e2d6", solidShade: "#bdb4a6",
    panel: "rgba(20,20,22,0.85)", textures: [{ kind: "grain", o: 0.12 }], stroke: 0, wobble: 0, fonts: F,
    camera: { moves: ["turntable", "cutaway dolly", "rack focus"], drift: 0.015, note: "turntable reveals, cutaway dollies, rack focus" },
    mix: { three: 50, flat: 20, doc: 20, cards: 10 }, three: "clay", grade: "doc", surface: "dark",
  },
  "chalk-site": {
    id: "chalk-site", name: "Chalk Site", bg: ["#33373b", "#1b1d1f"], ink: "#eceae4", line: "#eceae4", accent: "#ffd400",
    label: "#ffd400", muted: "rgba(236,234,228,0.6)", fail: RED, ok: "#9fd3ff", fluid: "#4d7487", solid: "#9fa2a3", solidShade: "#7b7e80",
    panel: "rgba(24,26,28,0.8)", textures: [{ kind: "chalk", o: 0.55 }, { kind: "grain", o: 0.2 }], stroke: 0, wobble: 1.6, fonts: F,
    camera: { moves: ["side-on tracking", "cut-in to joint"], drift: 0.02, note: "side-on tracking along the site, cut-in close-ups of the joint" },
    mix: { three: 25, flat: 50, doc: 25, cards: 0 }, three: "chalk", grade: "bleach", surface: "felt",
  },
  "investigators-desk": {
    id: "investigators-desk", name: "Investigator's Desk", bg: ["#c9a96e", "#9c7c47"], ink: "#1f1b16", line: "#1f1b16", accent: "#b3261e",
    label: "#1f1b16", muted: "rgba(31,27,22,0.65)", fail: "#d42a1f", ok: "#2c5aa0", fluid: "#6f9cc0", solid: "#f1ead9", solidShade: "#d8cdb2",
    panel: "rgba(241,234,217,0.94)", textures: [{ kind: "paper", o: 0.5 }, { kind: "grain", o: 0.2 }], stroke: 2.5, wobble: 0.8, fonts: F,
    camera: { moves: ["top-down over desk", "push into document"], drift: 0.012, note: "top-down over a desk; the 3D model sits on it as a scale model; push into documents" },
    mix: { three: 30, flat: 20, doc: 50, cards: 0 }, three: "clay", grade: "warm", surface: "desk",
  },
  "instrument-panel": {
    id: "instrument-panel", name: "Instrument Panel", bg: ["#0b0d0f", "#020303"], ink: "#d9ffe8", line: "#39ff9a", accent: "#ffb000",
    label: "#ffb000", muted: "rgba(217,255,232,0.55)", fail: RED, ok: "#39ff9a", fluid: "#1d4f6a", solid: "#1c2125", solidShade: "#121518",
    panel: "rgba(4,8,6,0.88)", textures: [{ kind: "scanline", o: 0.35 }, { kind: "haze", o: 0.25 }], stroke: 2, wobble: 0, fonts: F,
    camera: { moves: ["cockpit POV", "gauge close-up"], drift: 0.008, note: "cockpit/cab POV, gauges in close-up, the outside world through the window" },
    mix: { three: 40, flat: 25, doc: 25, cards: 10 }, three: "nightGrid", grade: "night", surface: "dark",
  },
  "storm-weather": {
    id: "storm-weather", name: "Storm Weather", bg: ["#4a5560", "#1e252c"], ink: "#f2f4f5", line: "#d6dde3", accent: "#ff9d2e",
    label: "#ff9d2e", muted: "rgba(242,244,245,0.6)", fail: RED, ok: "#9fd3ff", fluid: "#36566e", solid: "#6c7782", solidShade: "#4d5660",
    panel: "rgba(20,26,32,0.8)", textures: [{ kind: "rain", o: 0.4 }, { kind: "grain", o: 0.25 }], stroke: 1.5, wobble: 0.3, fonts: F,
    camera: { moves: ["handheld drift", "low angle", "long lens"], drift: 0.03, note: "handheld-feel drift, low angles, long-lens compression" },
    mix: { three: 50, flat: 20, doc: 20, cards: 10 }, three: "storm", grade: "cold", surface: "dark",
  },
  "archive-rebuild": {
    id: "archive-rebuild", name: "Archive Rebuild", bg: ["#3d3428", "#1f2b2b"], ink: "#f0e4c8", line: "#e6d6b0", accent: "#6fb3a8",
    label: "#f0e4c8", muted: "rgba(240,228,200,0.6)", fail: "#e0483e", ok: "#6fb3a8", fluid: "#3f6e6a", solid: "#a89878", solidShade: "#7f7158",
    panel: "rgba(30,26,20,0.82)", textures: [{ kind: "halftone", o: 0.25 }, { kind: "grain", o: 0.35 }], stroke: 2, wobble: 0.4, fonts: F,
    camera: { moves: ["Ken Burns", "dissolve to matching 3D angle"], drift: 0.02, note: "slow Ken Burns on photos that dissolve into the matching 3D angle" },
    mix: { three: 35, flat: 25, doc: 40, cards: 0 }, three: "chalk", grade: "archive", surface: "paper",
  },
  "satellite-atlas": {
    id: "satellite-atlas", name: "Satellite Atlas", bg: ["#2c3a2f", "#141c18"], ink: "#ffffff", line: "#ffffff", accent: "#ffe082",
    label: "#ffffff", muted: "rgba(255,255,255,0.65)", fail: RED, ok: "#7fd1ff", fluid: "#24506b", solid: "#6b7a5f", solidShade: "#4c5844",
    panel: "rgba(10,16,12,0.78)", textures: [{ kind: "haze", o: 0.35 }, { kind: "grain", o: 0.15 }], stroke: 2, wobble: 0, fonts: F,
    camera: { moves: ["top-down dive", "tilt-up reveal"], drift: 0.02, note: "top-down dives from orbit to street, tilt-up reveals" },
    mix: { three: 40, flat: 20, doc: 30, cards: 10 }, three: "nightGrid", grade: "doc", surface: "dark",
  },
  "cross-section": {
    id: "cross-section", name: "Engineer's Cross-Section", bg: ["#ffffff", "#eef1f4"], ink: "#111111", line: "#111111", accent: "#1f6fd1",
    label: "#111111", muted: "rgba(17,17,17,0.6)", fail: "#e0241b", ok: "#1f6fd1", fluid: "#bfe1f7", solid: "#e3e5e8", solidShade: "#c4c8cd",
    panel: "rgba(255,255,255,0.92)", textures: [{ kind: "hatch", o: 0.12 }], stroke: 2.5, wobble: 0, fonts: F,
    camera: { moves: ["slicing cutaway", "exploded view", "slow parallax"], drift: 0.01, note: "slicing cutaways, exploded views, slow parallax" },
    mix: { three: 25, flat: 55, doc: 20, cards: 0 }, three: "crossSection", grade: "bleach", surface: "paper",
  },
};

/** The video's look: provided once at the top of a video (`<DisasterLookProvider value="blueprint">`). */
export const DisasterLookCtx = createContext<RecipeId>("night-grid");
export const DisasterLookProvider = DisasterLookCtx.Provider;

/** A look by id, or the video's look from context. Every disaster piece calls this. */
export function useDisasterLook(id?: RecipeId | DisasterLook): DisasterLook {
  const ctx = useContext(DisasterLookCtx);
  return lookOf(id ?? ctx);
}

/** Non-hook form for pure helpers: a look object, an id, or the default. */
export function lookOf(x: RecipeId | DisasterLook | undefined): DisasterLook {
  if (x && typeof x === "object") return x;
  return LOOKS[isRecipe(x) ? x : "night-grid"];
}

export type LookProp = { look?: RecipeId | DisasterLook };
