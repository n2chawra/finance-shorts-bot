// Thumb3DDemos: one 1280×720 still per thumbnail pattern of the tech playbook
// (channels/how-tech-and-ai-actually-work-chips-ai-p/style-study/2026-11-20-thumbnails.md), drawn
// through the same Thumb3DFrame a video's Thumb3D.tsx goes through (compositions/LongThumb3D.tsx).
//   Thumb3DDemoInside  P1 INSIDE: a chip package with its lid cut away, the die lit like a city
//   Thumb3DDemoHero    P2 hero + verdict: a graphics card close, its die blooming, one verdict word
//   Thumb3DDemoScale   P3 scale: a wafer, one die glowing, a loupe on its transistors
//   npx remotion still src/index.ts Thumb3DDemoInside out.png --gl=angle
import React from "react";
import { Still } from "remotion";
import { Thumbnail } from "../../contract/timeline";
import { Thumb3DFrame } from "../../compositions/LongThumb3D";
import { Block, ChipPackage } from "../Proc";
import { Cutaway } from "../Cutaway";
import { GPUCard, Wafer, waferDieAt } from "../Hero";
import { fieldCellAt, InstancedField } from "../Field";
import { ThumbCamera } from "../Thumb3D";
import { TECH, type V3 } from "../core";

const W = 1280, H = 720;
const th = (spec: Record<string, unknown>) => Thumbnail.parse({ layout: "custom", engine: "3d", ...spec });

// P1: the lid's front-right half cut away (Cutaway frozen at its end), the die lit, warm light spilling out
const InsideScene: React.FC = () => {
  const s = 1.7;
  return (
    <>
      <ThumbCamera target={[0, 0.2, 0.05]} dist={3.7} yaw={0.55} pitch={0.6} fov={30} shift={0.4} range={0.9} />
      <group scale={s}>
        <ChipPackage size={1} lid={false} seed="thumb-inside" lit={1} />
        <Cutaway normal={[-0.72, 0, -0.69]} from={-0.16} to={-0.16} start={-10} dur={1} cap={TECH.amber}>
          <group position={[0, 0.15, 0]}>
            <Block size={[0.82, 0.06, 0.82]} radius={0.03} preset="brushed" />
            <Block size={[0.7, 0.012, 0.7]} radius={0.004} preset="brushed" color="#d0d5de" position={[0, 0.032, 0]} />
          </group>
        </Cutaway>
      </group>
      <pointLight position={[0.1, 0.9, 0.15]} intensity={2.5} distance={2} color="#ffb24a" />
    </>
  );
};

// P2: the card at a close 3/4, its die and accent glowing
const HeroScene: React.FC = () => (
  <>
    <ThumbCamera target={[0.15, 0.4, 0]} dist={5.2} yaw={0.75} pitch={0.36} fov={32} shift={0.3} range={1.6} />
    <group rotation-y={-0.25}>
      <GPUCard open={0.6} lit={1} accent={TECH.amber} rps={0} seed="thumb-gpu" />
    </group>
    <pointLight position={[0, 0.3, 0.1]} intensity={3} distance={2.2} color="#ffb24a" />
  </>
);

// P3: the wafer, one die lit; the loupe enlarges that die's transistors
const PICK = 300;
const pickAt = (waferDieAt(PICK) ?? [0, 0.012, 0]) as V3;
const ScaleScene: React.FC = () => (
  <>
    <ThumbCamera target={pickAt} dist={3.4} yaw={0.5} pitch={0.75} fov={30} shift={0.3} range={1.4} />
    <Wafer position={[0, 0.03, 0]} pick={PICK} seed="thumb-wafer" />
  </>
);
const F = { cols: 24, rows: 24, spacing: 0.12 } as const;
const MID = (F.rows / 2) * F.cols + F.cols / 2;
const cell = fieldCellAt(MID, F.cols, F.rows, F.spacing);
const LoupeScene: React.FC = () => (
  <>
    <ThumbCamera target={[cell[0], 0.05, cell[2]]} dist={1.3} yaw={0.5} pitch={0.7} fov={34} shift={0} aspect={1} range={0.5} />
    <InstancedField {...F} start={-90} reveal={10} wave={0} pick={[MID, MID + 1, MID - F.cols]} seed="thumb-field" />
  </>
);

const DEMOS = {
  Thumb3DDemoInside: { th: th({ words: "INSIDE ONE *CHIP*" }), scene: <InsideScene />, stage: { floor: "reflect" as const } },
  Thumb3DDemoHero: { th: th({ words: "*UNCOPYABLE?*" }), scene: <HeroScene /> },
  Thumb3DDemoScale: {
    th: th({ words: "BILLIONS IN *THIS?*", loupe: { component: "Loupe", at: [0.8, 0.32], r: 0.25, from: [0.65, 0.48] } }),
    scene: <ScaleScene />, loupe: <LoupeScene />,
  },
} as const;

export const Thumb3DDemos: React.FC = () => (
  <>
    {Object.entries(DEMOS).map(([id, d]) => (
      <Still key={id} id={id} width={W} height={H}
        component={() => <Thumb3DFrame th={d.th} w={W} h={H} scene={d.scene} loupe={"loupe" in d ? d.loupe : undefined} stage={"stage" in d ? d.stage : undefined} />} />
    ))}
  </>
);
