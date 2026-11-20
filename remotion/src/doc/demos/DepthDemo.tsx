/**
 * A test reel for the 2.5D depth layer (src/doc/Depth.tsx) in both formats. Placeholder material only: a
 * logged Commons photo and its cut-out (`python -m generator.media cutout`). Not part of any video.
 *
 *   npx remotion still src/index.ts DocDepthDemo out.png --frame=40
 *   npx remotion still src/index.ts DocDepthDemoLong out.png --frame=40
 */
import React from "react";
import { Composition, useCurrentFrame, useVideoConfig } from "remotion";
import { Depth } from "../Depth";

const SRC = "media/business-documentaries-rise-and-fall-of/commons-photo-james-dyson-1-bf19e29b.jpg";
const CUT = "media/business-documentaries-rise-and-fall-of/commons-photo-james-dyson-1-bf19e29b-cut.png";

const Reel: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const f = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  return (
    <Depth src={SRC} cut={CUT} title="James Dyson" sub="inventor · Wiltshire" titleAt={10} tone="gold" bgTreatment="bw" grade="doc"
      focus={[0.5, 0.35]} side={side} particles t={f} end={durationInFrames} w={width} h={height} />
  );
};

export const DepthDemos: React.FC = () => (
  <>
    <Composition id="DocDepthDemo" component={Reel} defaultProps={{ side: "left" as const }} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="DocDepthDemoLong" component={Reel} defaultProps={{ side: "right" as const }} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
