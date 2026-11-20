/**
 * A test reel for the doc entrances (src/doc/Transitions.tsx): each enter kind in turn, 30 frames apiece,
 * over staged Commons photos, the previous picture under it, with the light leak on top. Not part of any video.
 *
 *   npx remotion still src/index.ts DocTransitionsDemo out.png --frame=94
 */
import React from "react";
import { AbsoluteFill, Composition, Img, staticFile, useCurrentFrame } from "remotion";
import { ENTERS, EnterFx, LightLeak } from "../Transitions";

const DIR = "media/business-documentaries-rise-and-fall-of/";
const PICS = [
  "commons-photo-crocs-store-in-toronto-8fabf48d.jpg",
  "commons-photo-dyson-dc01-01-ec7cd1bd.jpg",
  "commons-photo-crocs-shoes-on-sandy-point-beach-9717478835-5a1c4991.jpg",
  "commons-photo-dyson-demo-store-london-f407e6df.jpg",
  "commons-photo-crocs-synthetic-clogs-712e2467.jpg",
  "commons-photo-dyson-store-at-suzhou-center-20220709-9ea58567.jpg",
];
const SLOT = 30;
const W = 1080, H = 1920;

const Pic: React.FC<{ i: number; label: string }> = ({ i, label }) => (
  <AbsoluteFill style={{ background: "#111" }}>
    <Img src={staticFile(DIR + PICS[i % PICS.length])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", fontFamily: "Anton, sans-serif", fontSize: 90, color: "#fff", textShadow: "0 4px 16px #000" }}>{label}</div>
  </AbsoluteFill>
);

const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(ENTERS.length - 1, Math.floor(f / SLOT));
  const kind = ENTERS[i] ?? "cut", prev = ENTERS[i - 1] ?? "cut";
  const t = f - i * SLOT;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {i > 0 ? <Pic i={i - 1} label={prev} /> : null}
      <EnterFx kind={kind} t={t} w={W} h={H}><Pic i={i} label={kind} /></EnterFx>
      <LightLeak t={f} seed="demo" />
    </AbsoluteFill>
  );
};

export const TransitionsDemo: React.FC = () => (
  <Composition id="DocTransitionsDemo" component={Reel} durationInFrames={SLOT * ENTERS.length} fps={30} width={W} height={H} />
);
