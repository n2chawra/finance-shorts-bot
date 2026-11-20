/**
 * A test reel for the marker-pen annotations (src/doc/Annotate.tsx) over a staged Commons photo. Not part of any video.
 *
 *   npx remotion still src/index.ts DocAnnotateDemo out.png --frame=40
 */
import React from "react";
import { AbsoluteFill, Composition, Img, staticFile, useCurrentFrame } from "remotion";
import { ArrowMark, CircleMark, DateSlam, StampMark } from "../Annotate";

const PHOTO = "media/business-documentaries-rise-and-fall-of/commons-photo-crocs-store-in-toronto-8fabf48d.jpg";

const Reel: React.FC = () => {
  const t = useCurrentFrame();
  const w = 1080, h = 1920;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile(PHOTO)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)" }} />
      <DateSlam t={t} inAt={0} outAt={50} w={w} h={h} date="2023-12-23" sub="Target · Los Angeles" />
      <CircleMark t={t} inAt={20} outAt={110} w={w} h={h} pos={[0.32, 0.36]} r={0.2} label="The store" />
      <ArrowMark t={t} inAt={60} outAt={110} w={w} h={h} from={[0.62, 0.62]} to={[0.42, 0.48]} label="Limit two" />
      <StampMark t={t} inAt={120} w={w} h={h} text="Sold out" pos={[0.5, 0.45]} />
    </AbsoluteFill>
  );
};

export const AnnotateDemos: React.FC = () => <Composition id="DocAnnotateDemo" component={Reel} durationInFrames={180} fps={30} width={1080} height={1920} />;
