// Tech3DDemo: a 12 s Short that uses every piece of the 3D kit once.
//   0–4.5 s  ScaleZoom  phone → board → chip → core → transistor, a label at each level, signals on the board and die
//   4.5–7.5  Explode    the phone comes apart, each part labelled, the camera orbits
//   7.5–9.7  Cutaway    a chip sliced open to its die, power flowing in
//   9.7–12   Character3D "Byte" is surprised, then points at a transistor with a signal through it
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  Board, Camera3D, Character3D, ChipPackage, Cutaway, Die, Explode, FinFET, Label3D, moves, Phone, PHONE, PHONE_STACK,
  PhonePartModel, ScaleZoom, SignalPath, Stage3D, TECH, type CamKey, type PhonePart, type V3,
} from "../index";

export const TECH3D_DEMO = { fps: 30, durationInFrames: 360, width: 1080, height: 1920 } as const;

const A = { from: 0, dur: 135 }, B = { from: 135, dur: 90 }, C = { from: 225, dur: 66 }, D = { from: 291, dur: 69 };

const ZOOM_AT = [22, 48, 74, 100, 124];

const ZoomScene: React.FC = () => {
  const cam: CamKey[] = [
    ...moves.orbit(0, A.dur, [0, 0.25, 0], 5.6, 5.0, -0.45, 0.35, 34, (t) => t),
  ];
  const lbl = (i: number, text: string, at: V3, offset: V3, sub?: string) => (
    <Label3D at={at} offset={offset} text={text} sub={sub} start={ZOOM_AT[i]! - 6} end={ZOOM_AT[i]! + 22} px={50} />
  );
  return (
    <>
      <Camera3D keys={cam} />
      <ScaleZoom at={ZOOM_AT} fadeIn={[-0.6, -0.25]} fadeOut={[0.2, 0.5]} levels={[
        { key: "phone", ratio: 7, focus: [0.12, 0.22, -0.84], node: (
          <group><Phone />{lbl(0, "Your phone", [0.5, 0.2, 0.6], [0.3, 0.9, 0.2])}</group>
        ) },
        { key: "board", ratio: 4.5, focus: [0.3, 0.12, 0], node: (
          <group>
            <Board size={[3.4, 2.2]} seed="demo-board" traces={34} dark />
            <ChipPackage size={0.9} position={[0.3, 0.04, 0]} seed="demo-soc" />
            <SignalPath points={[[-1.5, 0.07, -0.8], [-0.6, 0.07, -0.8], [-0.6, 0.07, 0], [-0.2, 0.07, 0]]} straight start={ZOOM_AT[1]! - 14} draw={14} radius={0.018} size={0.12} />
            <SignalPath points={[[1.6, 0.07, 0.9], [0.9, 0.07, 0.9], [0.9, 0.07, 0.2], [0.78, 0.07, 0.2]]} straight start={ZOOM_AT[1]! - 10} draw={14} radius={0.018} size={0.12} color={TECH.lime} />
            {lbl(1, "Logic board", [-1.2, 0.06, 0.6], [-0.2, 0.7, 0.4])}
          </group>
        ) },
        { key: "chip", ratio: 2.4, focus: [0, 0.1, 0], node: (
          <group>
            <ChipPackage size={2.2} lid={false} seed="demo-soc" />
            {lbl(2, "The chip", [0.95, 0.12, 0.9], [0.2, 0.75, 0.4], "lid off")}
          </group>
        ) },
        { key: "die", ratio: 9, focus: [-0.25, 0.08, -0.25], node: (
          <group>
            <Die size={2.4} cores={[2, 4]} lit={0.75} seed="demo-die" thick={0.12} />
            <SignalPath points={[[-1.0, 0.09, -0.9], [-0.25, 0.09, -0.6], [0.4, 0.09, -0.75], [0.9, 0.09, 0.2], [0.2, 0.09, 0.8]]} start={ZOOM_AT[3]! - 12} draw={16} radius={0.02} size={0.13} color={TECH.violet} pulses={4} />
            {lbl(3, "One CPU core", [-0.25, 0.08, -0.25], [-0.4, 0.8, 0.4])}
          </group>
        ) },
        { key: "fet", node: (
          <group scale={0.62}>
            <FinFET n={3} gateOn={1} />
            <SignalPath points={[[0, 0.62, 1.5], [0, 0.62, 0.5], [0, 0.62, -0.5], [0, 0.62, -1.5]]} start={ZOOM_AT[4]! - 6} draw={10} radius={0.02} size={0.16} color={TECH.cyan} pulses={3} speed={1} />
            {lbl(4, "A transistor", [0, 1.05, 0], [0.5, 0.9, 0.3], "a switch: on or off")}
          </group>
        ) },
      ]} />
    </>
  );
};

const ExplodeScene: React.FC = () => {
  const parts: { part: PhonePart; to: number; label: string; sub?: string }[] = [
    { part: "back", to: -1.3, label: "Back glass" },
    { part: "battery", to: -0.62, label: "Battery" },
    { part: "board", to: 0.05, label: "Logic board", sub: "the chip lives here" },
    { part: "frame", to: 0.7, label: "Frame" },
    { part: "screen", to: 1.4, label: "Screen" },
  ];
  const cam: CamKey[] = [...moves.orbit(0, B.dur, [0, 1.55, 0], 7.6, 3.4, 0.75, 0.25, 34)];
  return (
    <>
      <Camera3D keys={cam} />
      {/* the phone lies screen-up; its layers rise apart, a tall stack for a tall frame */}
      <group position={[0, 1.45, 0]}>
        <Explode start={8} stagger={5} px={44} parts={parts.map((p, i) => {
          const left = i % 2 === 1;
          return {
            key: p.part,
            node: <PhonePartModel part={p.part} />,
            at: [0, PHONE_STACK[p.part], p.part === "battery" ? PHONE.d * 0.18 : 0] as V3,
            to: [0, p.to, 0] as V3,
            label: p.label, sub: p.sub,
            labelAt: [left ? -PHONE.w / 2 : PHONE.w / 2, 0, 0.4] as V3,
            labelOffset: [left ? -0.4 : 0.4, 0.12, 0] as V3,
            align: left ? "right" : "left",
          };
        })} />
      </group>
    </>
  );
};

const CutScene: React.FC = () => {
  const cam: CamKey[] = [...moves.pushIn(0, C.dur, [0, 0.2, 0], [1.1, 1.0, 1.25], 8.4, 7.0, 32)];
  return (
    <>
      <Camera3D keys={cam} />
      <group position={[0, 0.02, 0]}>
        <Cutaway normal={[-1, 0, 0]} from={1.4} to={0.0} start={6} dur={32} cap="#ff9a3c" sheet={1.6}>
          <ChipPackage size={2.2} seed="demo-cut" />
        </Cutaway>
        <SignalPath points={[[-1.4, 0.05, 1.3], [-0.9, 0.05, 0.4], [-0.4, 0.16, 0.2], [0, 0.18, 0]]} start={34} draw={12} color={TECH.amber} radius={0.02} size={0.14} />
        <Label3D at={[-0.4, 0.33, -0.5]} offset={[0, 1.0, 0]} text="Heat spreader" start={18} px={48} align="center" />
        <Label3D at={[-0.05, 0.13, 0.3]} offset={[0.2, -0.9, 0.6]} text="Silicon die" start={36} px={48} color={TECH.amber} align="center" />
      </group>
    </>
  );
};

const CharScene: React.FC = () => {
  const cam: CamKey[] = [...moves.pushIn(0, D.dur, [0, 1.75, 0], [0.1, 0.1, 1], 8.6, 7.4, 34)];
  return (
    <>
      <Camera3D keys={cam} />
      {/* tall frame: Byte below, the transistor floating above and to the side */}
      <Character3D position={[-0.25, 0, 0]} rotation-y={0.3} seed="byte-demo"
        cues={[{ f: 0, pose: "idle", face: "neutral", look: 0.4 }, { f: 6, pose: "surprised", face: "surprised", look: 0.5 },
          { f: 32, pose: "point", face: "happy", look: 0.35 }]}
        talk={[[38, 64]]} />
      <group position={[0.45, 3.0, -0.3]} rotation={[0.5, -0.6, 0]} scale={0.42}>
        <FinFET n={3} gateOn={1} />
        <SignalPath points={[[0, 0.62, 1.5], [0, 0.62, -1.5]]} start={10} draw={8} radius={0.03} size={0.22} speed={1.2} />
      </group>
      <Label3D at={[0.45, 3.35, -0.3]} offset={[0, 0.55, 0]} text="Billions of these" sub="in one chip" start={40} px={52} color={TECH.lime} align="center" />
    </>
  );
};

export const Tech3DDemo: React.FC = () => {
  const frame = useCurrentFrame();
  // a short white dip on each cut
  const cuts = [B.from, C.from, D.from];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(frame - c) / 3)) * 0.35;
  return (
    <AbsoluteFill>
      <Stage3D shadowBox={4} vignette={0.5}>
        <Sequence layout="none" from={A.from} durationInFrames={A.dur}><ZoomScene /></Sequence>
        <Sequence layout="none" from={B.from} durationInFrames={B.dur}><ExplodeScene /></Sequence>
        <Sequence layout="none" from={C.from} durationInFrames={C.dur}><CutScene /></Sequence>
        <Sequence layout="none" from={D.from} durationInFrames={D.dur}><CharScene /></Sequence>
      </Stage3D>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
