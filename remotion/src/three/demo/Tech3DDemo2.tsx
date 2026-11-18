// Tech3DDemo2: a 15 s Short using the sample-1 kit. Every camera move is written against named
// moments (demo2-params.json `events`, standing in for a beat's word timings) and every figure comes
// from `fig` (standing in for p.beat.params.fig).
//   A  studio, reflective floor: a graphics card morphs textured → wireframe → clay → textured, opens,
//      a pointer lands on the GPU die, its figure counts up (bloom, depth of field)
//   B  a wafer: push, a 1 s dive with motion blur into one die, cut to a field of 6,400 transistors
//      with a wave, a scan dome, a dimension bracket, the scale badge
//   C  a server hall: fly down the aisle (fog, DOF), a highlighted rack, a lower-third figure
//   D  a list read out as fast cuts: a fab clean room, a desk at night, a phone logic board; then a
//      die beside a coin at true relative size
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  Bracket3D, Camera3D, cue, Die, direct, FigLabel3D, fieldCellAt, Focus, GPUCard, Highlight, InstancedField, LogicBoard,
  LookMorph, Place3D, Pointer3D, ScaleBadge, ScaleCompare, ScanDome, ServerRack, Stage3D, Tag, TECH, TopPill, LowerThird,
  Wafer, waferDieAt, type V3,
} from "../index";
import params from "./demo2-params.json";

export const TECH3D_DEMO2 = { fps: 30, durationInFrames: 450, width: 1080, height: 1920 } as const;

const ev = params.events as Record<string, number>;
const fig = params.fig as Record<string, string>;
const S = { A: [0, ev.wafer!], B: [ev.wafer!, ev.hall!], C: [ev.hall!, ev.list1!], D: [ev.list1!, 450] } as const;
/** the events of one scene, in that scene's own frames */
const local = (from: number) => Object.fromEntries(Object.entries(ev).map(([k, v]) => [k, v - from]));

const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const e = local(S.A[0]);
  const keys = direct(e, [
    { at: 0, move: "orbit", center: [0, 0.35, 0], radius: 6.6, height: 3.1, from: 0.55, to: -0.25, dur: e.wafer! },
  ]);
  const open = cue(frame, e.open!, 16);
  return (
    <>
      <Camera3D keys={keys} />
      <Focus at={[0, 0.4, 0]} range={2.2} />
      <group rotation-y={0.75}>
        <LookMorph cues={[{ f: 0, look: "textured" }, { f: e.wire!, look: "wire" }, { f: e.clay!, look: "clay" }, { f: e.back!, look: "textured" }]} dur={16}>
          <GPUCard open={open} lit={0.4 + open * 0.6} rps={0.9} accent={TECH.cyan} />
        </LookMorph>
        <Pointer3D at={[-0.2, 0.17, 0]} from={[0.15, 1, 0.3]} size={0.42} start={e.cores! - 6} />
      </group>
      <FigLabel3D fig={fig.cores!} caption="cores (demo figure)" at={[0.9, 1.25, 1.0]} start={e.cores!} count={20} px={96} />
    </>
  );
};

const FIELD = { cols: 80, rows: 80, spacing: 0.12 } as const;
const CENTER = (FIELD.rows / 2) * FIELD.cols + FIELD.cols / 2;

const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  const e = local(S.B[0]);
  const pick = 212;
  const dieAt = waferDieAt(pick) ?? [0, 0.012, 0];
  const cell = fieldCellAt(CENTER, FIELD.cols, FIELD.rows, FIELD.spacing);
  const keys = direct(e, [
    { at: 0, move: "hold", pos: [0, 4.4, 4.8], look: [0, 0, 0] },
    { at: "closer", move: "push", look: dieAt as V3, dir: [0, 0.75, 0.66], to: 2.4, dur: 18 },
    { at: "dive", move: "dive", look: dieAt as V3, dir: [0, 1, 0.3], to: 0.22, dur: 18 },
    { at: "field", move: "cut", pos: [0, 2.6, 3.0], look: [cell[0], 0.05, cell[2]] },
    { at: "field", move: "push", look: [cell[0], 0.05, cell[2]], dir: [0, 0.8, 1], from: 3.9, to: 1.25, dur: 50 },
  ]);
  const inField = frame >= e.field!;
  return (
    <>
      <Camera3D keys={keys} />
      {!inField && (
        <>
          <Focus at={dieAt as V3} range={1.2} />
          <Wafer position={[0, 0.03, 0]} pick={pick} />
        </>
      )}
      {inField && (
        <>
          <Focus at={[cell[0], 0.05, cell[2]]} range={0.8} />
          <InstancedField {...FIELD} start={e.field!} reveal={22} wave={18} pick={[CENTER]} seed="demo-field" />
          <ScanDome at={[cell[0], 0, cell[2]]} radius={0.55} start={e.scan!} end={e.gate! + 4} />
          <Bracket3D from={[cell[0] - 0.036, 0.13, cell[2] + 0.02]} to={[cell[0] + 0.036, 0.13, cell[2] + 0.02]} side={[0, 0, 1]}
            fig={fig.gate} caption="gate (demo)" start={e.gate!} px={70} />
        </>
      )}
    </>
  );
};

const HALL_RACK: V3 = [-1.35, 0, 0.5 - 6 * 0.77];

const SceneC: React.FC = () => {
  const e = local(S.C[0]);
  const rackFront: V3 = [HALL_RACK[0] + 0.56, 1.15, HALL_RACK[2]];
  const keys = direct(e, [
    { at: 0, move: "fly", path: [[0.1, 1.75, 4.2], [0, 1.6, 1.2], [-0.05, 1.5, -1.8]], dur: e.rack! - 4, fov: 40 },
    { at: "rack", move: "push", look: rackFront, dir: [1, 0.1, 0.7], to: 1.9, dur: 14, fov: 36 },
  ]);
  return (
    <>
      <Camera3D keys={keys} />
      <Focus at={rackFront} range={1.6} />
      <Place3D kind="serverHall" length={5} seed="demo-hall" />
      <Highlight start={e.rack! + 4} color={TECH.amber} strength={1}>
        <ServerRack position={HALL_RACK} rotation-y={Math.PI / 2} seed="demo-hot" units={12} />
      </Highlight>
    </>
  );
};

const SceneD: React.FC = () => {
  const e = local(S.D[0]);
  const keys = direct(e, [
    { at: ["list1", "list2", "list3", "compare"], move: "cuts", poses: [
      { pos: [0.3, 1.6, 3.6], look: [0, 1.15, -3], fov: 42 },
      { pos: [0.5, 1.5, 1.4], look: [0, 1.0, -0.8], fov: 38 },
      { pos: [0.9, 2.2, 1.9], look: [0, 0.1, 0], fov: 34 },
      { pos: [0, 1.5, 8.2], look: [0, 0.45, 0], fov: 32 },
    ] },
    { at: "compare", move: "push", look: [0, 0.45, 0], dir: [0, 0.14, 1], to: 6.6, dur: 30 },
  ]);
  const seg = (a: string, b: string | null) => [e[a]!, (b ? e[b]! : S.D[1] - S.D[0]) - e[a]!] as const;
  const [c1, d1] = seg("list1", "list2"), [c2, d2] = seg("list2", "list3"), [c3, d3] = seg("list3", "compare"), [c4, d4] = seg("compare", null);
  return (
    <>
      <Camera3D keys={keys} />
      <Sequence layout="none" from={c1} durationInFrames={d1}><Place3D kind="cleanRoom" seed="demo-fab" length={9} /></Sequence>
      <Sequence layout="none" from={c2} durationInFrames={d2}><Place3D kind="desk" seed="demo-desk" /></Sequence>
      <Sequence layout="none" from={c3} durationInFrames={d3}><LogicBoard seed="demo-logic" lit={0.8} scale={1.4} /></Sequence>
      <Sequence layout="none" from={c4} durationInFrames={d4}>
        <ScaleCompare thing={<Die size={1} seed="cmp-die" lit={0.7} thick={0.08} />} thingSize={0.01} thingName="a chip's die" thingTop={0.08} familiar="coin" fit={1.2} gap={0.3} start={0} />
      </Sequence>
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Sequence from={S.A[0]} durationInFrames={S.A[1] - S.A[0]}>
      <TopPill text="Inside a graphics card" at={4} hold={60} />
      <Tag kind="recreation" />
    </Sequence>
    <Sequence from={S.B[0]} durationInFrames={S.B[1] - S.B[0]}>
      <Tag kind="illustration" />
      <ScaleBadge text={fig.scale!} at={ev.field! - S.B[0]} />
    </Sequence>
    <Sequence from={S.C[0]} durationInFrames={S.C[1] - S.C[0]}>
      <LowerThird fig={fig.hallPower!} label="one hall, demo figure" source="Data: illustration only" at={ev.rack! - S.C[0] + 6} hold={80} />
    </Sequence>
    <Sequence from={S.D[0]} durationInFrames={S.D[1] - S.D[0]}>
      <Tag kind="illustration" />
    </Sequence>
  </AbsoluteFill>
);

export const Tech3DDemo2: React.FC = () => (
  <Stage3D backdrop="void" floor="reflect" bloom={0.9} dof={3} blur={1} shadowBox={4} fog={{ near: 7, far: 26 }} overlay={<Overlay />}>
    <Sequence layout="none" from={S.A[0]} durationInFrames={S.A[1] - S.A[0]}><SceneA /></Sequence>
    <Sequence layout="none" from={S.B[0]} durationInFrames={S.B[1] - S.B[0]}><SceneB /></Sequence>
    <Sequence layout="none" from={S.C[0]} durationInFrames={S.C[1] - S.C[0]}><SceneC /></Sequence>
    <Sequence layout="none" from={S.D[0]} durationInFrames={S.D[1] - S.D[0]}><SceneD /></Sequence>
  </Stage3D>
);
