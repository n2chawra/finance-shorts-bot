/**
 * A test reel for the polaroid row and the product stage (src/doc), played through the real StoryVideo
 * with `"scene": "doc"` beats. Placeholder material only: Commons photos and logos in public/real (credits
 * in credits.json); the unit count is a demo fig value, as Python would fill it. Not part of any video.
 *
 *   npx remotion still src/index.ts StageDemo out.png --frame=100
 */
import React from "react";
import { Composition } from "remotion";
import type { Beat, Timeline } from "../../contract/timeline";
import sample from "../../fixtures/sample-timeline.json";
import { StoryVideo } from "../../compositions/StoryVideo";

type B = { id: string; frames: number; params: Record<string, unknown>; events?: Record<string, number> };
const PLAN: B[] = [
  {
    id: "faces", frames: 150, params: {
      place: "the founders' table", camera: [{ sec: 0, size: "wide" }, { at: "p2", size: "medium" }],
      moments: [{ at: "p0", what: "the first print lifts" }, { at: "p1", what: "the second lifts, the first dims" }, { at: "p2", what: "the third lifts" }],
      layers: [{ kind: "polaroids", surface: "desk", items: [
        { src: "real/bezos.jpg", aspect: 0.687, caption: "The founder", at: "p0" },
        { src: "real/swift.jpg", aspect: 0.78, caption: "The star", at: "p1", bw: true },
        { src: "real/mrbeast.jpg", aspect: 0.75, caption: "The creator", at: "p2" },
        { src: "real/ronaldo.jpg", aspect: 0.666, caption: "The athlete", at: "p3", bw: true },
      ] }],
    }, events: { p0: 10, p1: 45, p2: 80, p3: 115 },
  },
  {
    id: "lineup", frames: 120, params: {
      place: "the product table", camera: [{ sec: 0, size: "wide" }],
      moments: [{ at: "a", what: "the first product slides in" }, { at: "b", what: "the second slides in" }],
      layers: [{ kind: "products", mode: "stage", backdrop: "charcoal", items: [
        { src: "real/treasury-cut.png", aspect: 1, label: "The bond", at: "a" },
        { src: "real/amazon-cut.png", aspect: 2.96, label: "The store", at: "b" },
        { src: "real/netflix-cut.png", aspect: 3.27, label: "The screen", at: "c" },
      ] }],
    }, events: { a: 6, b: 30, c: 54 },
  },
  {
    id: "pallet", frames: 120, params: {
      place: "the warehouse pallet", camera: [{ sec: 0, size: "medium" }],
      moments: [{ at: "fill", what: "the pallet fills unit by unit" }],
      fig: { units: "96" },
      layers: [{ kind: "products", mode: "pallet", backdrop: "paper", items: [{ src: "real/treasury-cut.png", aspect: 1 }], count: "units", countLabel: "units on one pallet", fillAt: "fill" }],
    }, events: { fill: 8 },
  },
  {
    id: "wall", frames: 120, params: {
      place: "the shelf wall", camera: [{ sec: 0, size: "wide" }],
      moments: [{ at: "fill", what: "the wall fills" }],
      fig: { units: "1,200" },
      layers: [{ kind: "products", mode: "wall", backdrop: "charcoal", items: [{ src: "real/powerball-cut.png", aspect: 4.73 }], count: "units", countLabel: "tickets a minute", fillAt: "fill" }],
    }, events: { fill: 8 },
  },
];

const BEATS: Beat[] = (() => {
  let from = 0;
  return PLAN.map((b) => {
    const beat: Beat = {
      id: b.id, scene: "doc", from, frames: b.frames, params: b.params, events: { start: 0, speech: 0, end: b.frames, ...(b.events ?? {}) },
      camera: "still", transition: "cut", speaker: "narrator", chapter: null, say: "", voice: null,
    };
    from += b.frames;
    return beat;
  });
})();
export const STAGE_DEMO_FRAMES = BEATS.reduce((a, b) => a + b.frames, 0);

const timeline = (width: number, height: number): Timeline => ({
  ...(sample as unknown as Timeline), id: "stage-demo", format: width < height ? "short" : "long", width, height, tempo: 1,
  durationInFrames: STAGE_DEMO_FRAMES, beats: BEATS, captions: false, sources: null, logo: null, currency: "USD",
  disclaimer: "Placeholder material for the documentary kit demo.",
});

export const StageDemo: React.FC<{ width: number; height: number }> = ({ width, height }) => <StoryVideo timeline={timeline(width, height)} />;

export const StageDemos: React.FC = () => (
  <>
    <Composition id="StageDemo" component={StageDemo} fps={30} width={1920} height={1080} durationInFrames={STAGE_DEMO_FRAMES} defaultProps={{ width: 1920, height: 1080 }} />
    <Composition id="StageDemoShort" component={StageDemo} fps={30} width={1080} height={1920} durationInFrames={STAGE_DEMO_FRAMES} defaultProps={{ width: 1080, height: 1920 }} />
  </>
);
