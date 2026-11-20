/**
 * A test reel for the montage layer (src/doc/Montage.tsx): punch (0-89), stack (90-209), grid (210-329).
 * Placeholder material: staged Commons photos. Not part of any video.
 *
 *   npx remotion still src/index.ts DocMontageDemo out.png --frame=40
 */
import React from "react";
import { AbsoluteFill, Composition, Sequence, useCurrentFrame } from "remotion";
import "../fonts";
import { Montage, type MontageItem, type MontageMode } from "../Montage";

const M = "media/business-documentaries-rise-and-fall-of/";
const ITEMS: MontageItem[] = [
  { src: `${M}commons-photo-crocs-store-in-toronto-8fabf48d.jpg`, aspect: 1.5, caption: "Toronto" },
  { src: `${M}commons-photo-dyson-demo-store-london-f407e6df.jpg`, aspect: 1.5, caption: "London" },
  { src: `${M}commons-photo-crocs-store-at-suzhou-center-20220709-c38bd5d0.jpg`, aspect: 1.5, caption: "Suzhou" },
  { src: `${M}commons-photo-james-dyson-1-bf19e29b.jpg`, aspect: 0.75, focus: [0.5, 0.3], caption: "The founder" },
  { src: `${M}commons-photo-crocs-shoes-on-sandy-point-beach-9717478835-5a1c4991.jpg`, aspect: 1.5, caption: "The beach" },
  { src: `${M}commons-photo-dyson-dc01-01-ec7cd1bd.jpg`, aspect: 0.75, caption: "DC01" },
];

const Part: React.FC<{ mode: MontageMode; end: number; every: number }> = ({ mode, end, every }) => {
  const t = useCurrentFrame();
  return <AbsoluteFill><Montage items={ITEMS} mode={mode} every={every} grade="doc" t={t} end={end} w={1080} h={1920} /></AbsoluteFill>;
};

const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence from={0} durationInFrames={90}><Part mode="punch" end={90} every={12} /></Sequence>
    <Sequence from={90} durationInFrames={120}><Part mode="stack" end={120} every={14} /></Sequence>
    <Sequence from={210} durationInFrames={120}><Part mode="grid" end={120} every={10} /></Sequence>
  </AbsoluteFill>
);

export const MontageDemos: React.FC = () => (
  <Composition id="DocMontageDemo" component={Reel} durationInFrames={330} fps={30} width={1080} height={1920} />
);
