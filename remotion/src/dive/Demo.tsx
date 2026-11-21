/**
 * The dive kit's test reel: the Grand Central sample (E:/work/going-down-sample, owner-approved 2026-11-21)
 * rebuilt from params only. Seven directed beats, all drawn by dive/Dive.tsx, with the directed captions.
 * Not part of any video; the figures here stand in for what Python fills from the script's facts.
 *
 *   npx remotion still src/index.ts DiveKitDemo out.png --frame=300
 */
import React, { useMemo } from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import type { Timeline } from "../contract/timeline";
import { Captions, captionGroups, captionTokens } from "../fx/captions";
import Dive from "./Dive";
import { DEMO_WORDS } from "./demo.words";
import type { DiveParams } from "./world";

const FPS = 30, DUR = 660;

/** The example params (README "Example: Grand Central"); `fig` is what Python fills from the facts. */
export const DEMO_PARAMS: Record<string, { dive: DiveParams; fig?: Record<string, string>; place: string }> = {
  street: { place: "Grand Central's front on 42nd Street", dive: {
    move: "surface",
    world: { look: "dusk", note: "Depths: Wikipedia, ASCE, MTA · not to scale",
      strata: [{ kind: "soil", toFt: 60 }, { kind: "bedrock", toFt: 400, label: "Manhattan schist" }] },
    layer: { kind: "surface", preset: "station", label: "Grand Central Terminal", wall: "#ead8b4", trim: "#d8c296", glass: "#7cb6e0", vehicle: "#ffc43d" } } },
  shuttle: { place: "the shuttle tunnel", fig: { depth: "20 ft" }, dive: { move: "dive", on: "twenty", zoom: 1.15,
    layer: { kind: "tunnel", type: "subway", label: "shuttle", color: "#b9bcc4", stripe: "#6d6e76", bullets: [["S", "#808183"]], light: "#ffe7a8" } } },
  lex: { place: "the Lexington Avenue tunnel", fig: { depth: "50 ft" }, dive: { move: "dive", on: "fifty", zoom: 1.1,
    layer: { kind: "tunnel", type: "subway", dir: -1, color: "#c9ced8", stripe: "#00933c", bullets: [["4", "#00933c"], ["5", "#00933c"], ["6", "#00933c"]], light: "#d7ffe6" } } },
  seven: { place: "the Flushing line tunnel", fig: { depth: "80 ft" }, dive: { move: "dive", on: "eighty", zoom: 1.12,
    layer: { kind: "tunnel", type: "subway", label: "Flushing", color: "#c9ced8", stripe: "#b933ad", bullets: [["7", "#b933ad"]], light: "#f6d9ff" } } },
  m42: { place: "M42, the secret power room", fig: { depth: "105 ft" }, dive: { move: "dive", on: "hundred", zoom: 1.05,
    layer: { kind: "chamber", type: "secret", stamp: "M42", stampOn: "m42", plansOn: "blueprints", props: ["machines", "lamp", "blueprint"] } } },
  madison: { place: "the Grand Central Madison cavern", fig: { depth: "150 ft", ride: "90 s" }, dive: { move: "dive", on: "hundred", zoom: 0.95, pull: "escalators",
    layers: [
      { kind: "cavern", label: "Madison", levels: 2, trains: ["#d23b3b", "#1f5fbf"], stripe: "#d6dbe4", bullets: [["L", "#1f5fbf"]], counter: { fig: "ride", label: "RIDE UP", on: "ninety" } },
      { kind: "shaft", type: "escalator", fromFt: 62, toFt: 130, side: "right", glowOn: "escalators" },
    ] } },
  loop: { place: "back up to the street", dive: { move: "rideup" } },
};
// the words a figure is spoken as, merged into one caption token as it shows on screen
const MERGE: Record<string, [number, number, string][]> = {
  shuttle: [[0, 2, "20 ft"]], lex: [[0, 2, "50 ft"]], seven: [[0, 2, "80 ft"]], m42: [[0, 5, "105 ft"]],
  madison: [[1, 5, "150 ft"], [17, 2, "90 s"]], loop: [[0, 2, "90 s"]],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function demoTimeline(): Timeline {
  const starts = DEMO_WORDS.map((b, i) => (i === 0 ? 0 : Math.round(b.start * FPS)));
  const figures: Record<string, string> = {};
  const beats = DEMO_WORDS.map((b, i) => {
    const from = starts[i]!, frames = (starts[i + 1] ?? DUR) - from;
    const v0 = Math.round(b.start * FPS) - from;              // speech starts, frames into the beat
    const t0 = (from + v0) / FPS;
    const words = b.words.map(([w, s, e]) => ({ w, s: s - t0, e: e - t0 }));
    const events: Record<string, number> = {};
    for (const [w, s] of b.words) { const k = norm(w); if (!(k in events)) events[k] = Math.round(s * FPS) - from; }
    const merges = MERGE[b.id] ?? [];
    const captions: { t: string; s: number; e: number }[] = [];
    for (let j = 0; j < words.length;) {
      const m = merges.find(([at]) => at === j);
      if (m) { captions.push({ t: m[2], s: words[j]!.s, e: words[j + m[1] - 1]!.e }); figures[`${b.id}_${captions.length}`] = m[2]; j += m[1]; }
      else { captions.push({ t: words[j]!.w, s: words[j]!.s, e: words[j]!.e }); j++; }
    }
    const P = DEMO_PARAMS[b.id]!;
    return {
      id: b.id, scene: "directed", from, frames, events, camera: "", transition: "cut", speaker: "narrator", chapter: null,
      say: b.words.map((w) => w[0]).join(" "),
      params: { component: "Dive", place: P.place, dive: P.dive, fig: P.fig ?? {} },
      voice: { start: v0, speaker: "narrator", words, phonemes: [], captions },
    };
  });
  return {
    version: 1, id: "dive-kit-demo", format: "short", fps: 30, width: 1080, height: 1920, durationInFrames: DUR, seed: 1, template: null,
    palette: { bg: "#231d27", bgBottom: "#231d27", text: "#ffffff", muted: "#aaaaaa", accent: "#ffc43d", danger: "#ff5a5f", panel: "#202544", grid: "#32385c", cast: ["#3ddc97", "#ff9f43", "#78a0ff"] },
    figures, beats, voices: {}, speed: 1, tempo: 1, music: { genre: "cinematic", key: "C", bpm: 100 }, audio: { file: "", peak_db: -1, mean_db: -18 },
    disclaimer: "demo", logo: null, captions: true, voiceMode: "kokoro", sources: null, thumbnail: null, structure: null,
    thumbnailVariants: [], currency: "USD", experiments: {},
  } as Timeline;
}

const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useMemo(demoTimeline, []);
  const groups = useMemo(() => captionGroups(captionTokens(tl)), [tl]);
  const beat = tl.beats.find((b) => frame >= b.from && frame < b.from + b.frames) ?? tl.beats[tl.beats.length - 1]!;
  return (
    <AbsoluteFill style={{ background: "#231d27" }}>
      <Dive beat={beat} tl={tl} frame={frame - beat.from} fps={FPS} />
      <Captions tl={tl} frame={frame} groups={groups} scene="directed" />
    </AbsoluteFill>
  );
};

export const DiveKitDemo: React.FC = () => <Composition id="DiveKitDemo" component={Reel} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />;
