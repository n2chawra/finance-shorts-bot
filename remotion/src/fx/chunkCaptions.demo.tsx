/** DocDemoShortCaptions: the DocDemoShort reel (no voice) with a fixture of word timings, to look at the
 * business-docs Shorts captions (fx/chunkCaptions.tsx). Placeholder words, not facts. */
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { DOC_DEMO_FRAMES, DocDemo } from "../doc/Demo";
import { ChunkCaptions, chunkTokens, type ChunkToken } from "./chunkCaptions";

const LINE = "In 1985 a garage startup sold one product. By 2000 it was worth $638B, the most valuable company in its field. A year later it filed for bankruptcy.";
const TOKENS: ChunkToken[] = (() => {
  let s = 0.15;
  return LINE.split(" ").map((t) => {
    const d = 0.18 + 0.035 * t.length, tok = { t, s, e: s + d };
    s += d + (/[.,]$/.test(t) ? 0.3 : 0.04);
    return tok;
  });
})();
const CHUNKS = chunkTokens(TOKENS);
const FIGS = new Set(["$638B"]);

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DocDemo width={1080} height={1920} />
      <ChunkCaptions chunks={CHUNKS} t={frame / 30} width={1080} height={1920} figures={FIGS} />
    </AbsoluteFill>
  );
};

export const DocCaptionDemo: React.FC = () => (
  <Composition id="DocDemoShortCaptions" component={Demo} fps={30} width={1080} height={1920} durationInFrames={DOC_DEMO_FRAMES} />
);
