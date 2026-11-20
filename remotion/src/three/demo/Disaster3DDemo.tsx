// Disaster3DDemo: a 12 s Short showing the disaster kit (disasters channel), one look per scene
// (a real video uses one look throughout; the demo rotates to show them).
//   A  Night Grid: an MD-80-type jet (rear engines, T-tail) on a flight path over a cloud deck;
//      the path's curtain and callouts draw; the tailplane's stress climbs to red and it hinges
//   B  Chalk Site: a girder bridge; the middle span's stress climbs and it buckles, slow debris
//   C  Storm: a ro-ro ferry with its bow doors open, listing on a faceted sea in the rain
//   D  Clay Studio: a gravity dam, the reservoir rising to the crest and overtopping
// Labels are words, not figures (figures come from params.fig in real beats).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import * as THREE from "three";
import {
  Camera3D, CloudDeck, cue, Dam, DisasterStage, Failure3D, Focus, GirderBridge, Jet, jetTailplaneAt, Label3D, moves, Ocean,
  HonestyTag, oceanHeight, oceanTilt, Path3D, pathPose, buildPath, Rain, Ship, Smoke, type PathSample,
} from "../index";

export const DISASTER3D_DEMO = { fps: 30, durationInFrames: 360, width: 1080, height: 1920 } as const;
const S = { A: [0, 100], B: [100, 190], C: [190, 280], D: [280, 360] } as const;

// ---------------------------------------------------------------- A: the jet and its path

const JET = { length: 1.7, sweep: 25, engines: "rear", tail: "T", girth: 0.1, windows: 26 } as const;
const SAMPLES: PathSample[] = Array.from({ length: 13 }, (_, i) => {
  const t = i;
  const dive = Math.max(0, t - 8);
  return { t, x: -15 + t * 2.1, y: 8.4 - t * 0.08 - dive * dive * 0.3, z: Math.sin(t * 0.35) * 1.6, v: dive > 0 ? dive * 1.5 : t * 0.05 };
});
const PATH = buildPath(SAMPLES);
const PATH_DUR = 96;

const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const t = 12 * Math.min(1, frame / PATH_DUR);
  const head = pathPose(PATH, t, 0.6);
  const hp = new THREE.Vector3(...head.pos);
  const tailLocal = new THREE.Vector3(...jetTailplaneAt(JET));
  const tailW = tailLocal.clone().applyQuaternion(head.quat).add(hp);
  // wide chase → close on the tail
  const close = cue(frame, 34, 22);
  const offWide = new THREE.Vector3(-3.4, 1.6, 4.2).applyQuaternion(head.quat);
  const offClose = new THREE.Vector3(-1.05, 0.5, 1.55).applyQuaternion(head.quat);
  const off = offWide.lerp(offClose, close);
  const look = new THREE.Vector3().lerpVectors(hp, tailW, close);
  const camPos = look.clone().add(off);
  const stress = cue(frame, 46, 26, (x) => x);
  const hinge = cue(frame, 70, 26);
  return (
    <>
      <Camera3D keys={moves.hold(0, [camPos.x, camPos.y, camPos.z], [look.x, look.y, look.z], 38 - close * 6)} drift={0.01} />
      <Focus at={[look.x, look.y, look.z]} range={close > 0.5 ? 0.6 : 3} />
      <CloudDeck frame={frame} y={2.4} cover={0.62} size={90} puffs={80} />
      <Path3D samples={SAMPLES} t={t} radius={0.045} gap={1.1} ground={0} range={[0, 6]} bank={0.6}
        marker={
          <Jet {...JET} livery={{ tail: "#1d3a6e", stripe: "#1d3a6e" }}
            wrap={{
              tailplane: (el) => (
                <Failure3D stress={stress} frame={frame} hot={[-0.05, 0, 0]} hotRadius={0.35} mode="hinge" progress={hinge} axis={[0, 0, 1]} angle={0.3}
                  pivot={[-0.12, 0, 0]} debris={{ at: [-0.12, 0, 0], count: 10, size: 0.014, speed: 0.6, dir: [-1, 0.3, 0], start: 0.05, seconds: 1.6, slow: 0.5, gravity: 1.5, seed: "jackscrew" }}>
                  {el}
                </Failure3D>
              ),
            }} />
        }
        events={[]} />
      {stress > 0 && <Label3D at={[tailW.x, tailW.y, tailW.z]} offset={[0.25, 0.42, 0.1]} text="Horizontal stabiliser" sub="trim jackscrew" start={48} px={44} color="#ff9a3c" />}
    </>
  );
};

// ---------------------------------------------------------------- B: girder bridge buckling

const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  const stress = cue(frame, 8, 34, (x) => x);
  const buckle = cue(frame, 40, 42);
  return (
    <>
      <Camera3D keys={moves.orbit(0, 90, [0, 1.4, 0], 16, 3.2, -0.7, -0.4)} drift={0.01} />
      <Focus at={[0, 2, 0]} range={4} />
      <GirderBridge spans={3} spanLength={4} height={2.3} width={1.6} piers="columns"
        wrapSpan={{
          1: (el) => (
            <Failure3D stress={stress} frame={frame} hot={[2, -0.15, 0]} hotRadius={1.6} mode="buckle" progress={buckle} span={[0, 4]} sag={1.1} sharp={1.6}
              debris={{ at: [2, -0.25, 0], count: 40, size: 0.07, speed: 1.2, dir: [0, -0.4, 0], spread: 0.6, start: 0.15, seconds: 2.4, slow: 0.4, gravity: 3, floor: -2.25, seed: "girder", kind: "concrete" }}>
              {el}
            </Failure3D>
          ),
        }} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 6]} />
        <meshStandardMaterial color="#3d5966" roughness={0.3} />
      </mesh>
      {frame > 20 && <Label3D at={[0, 2.15, 0.8]} offset={[0.6, 1.2, 0.4]} text="Midspan girders" sub="stress over the limit" start={20} px={44} color="#ffd400" />}
    </>
  );
};

// ---------------------------------------------------------------- C: ferry listing, bow doors open

const WAVES = { amp: 0.16, length: 3.4, speed: 0.045, dir: 0.5 } as const;
const SceneC: React.FC = () => {
  const frame = useCurrentFrame();
  const doors = cue(frame, 0, 20);
  const list = cue(frame, 10, 80, (x) => x) * 0.32;
  const [roll, pitch] = oceanTilt(0, 0, frame, WAVES, 2.5);
  const y = oceanHeight(0, 0, frame, WAVES) - 0.05 - list * 0.6;
  return (
    <>
      {/* bow-quarter: the whole ship foreshortened into a 9:16 frame, the open bow nearest */}
      <Camera3D keys={moves.pushIn(0, 90, [0.9, 0.75, 0], [1, 0.36, 0.5], 19, 15.5)} drift={0.02} />
      <Focus at={[3.2, 0.6, 0]} range={5} />
      <Ocean frame={frame} size={70} segments={150} waves={WAVES} />
      <Rain frame={frame} center={[3, 3.5, 3]} size={[16, 8, 14]} count={1100} />
      <group position={[0, y, 0]} rotation={[roll * 0.6 + list, 0, pitch * 0.6 - list * 0.12]}>
        <Ship hull="ferry" length={8} bowDoors={doors} doorType="clamshell" livery={{ funnel: "#d62828", band: "#1d3557" }} />
      </group>
      <Smoke frame={frame + 200} at={[-1.6, 1.9, 0]} height={3.5} width={1.6} count={18} color="#5b6168" opacity={0.45} wind={[-1.2, 0, 0.2]} seed="funnel" />
      <Label3D at={[4, 0.5, 0]} offset={[-0.6, 2.4, 1.2]} text="Bow doors open" sub="sea reaches the car deck" start={14} px={44} color="#ff8a2a" />
    </>
  );
};

// ---------------------------------------------------------------- D: dam, water rising

const SceneD: React.FC = () => {
  const frame = useCurrentFrame();
  const level = 0.62 + cue(frame, 0, 52, (x) => x) * 0.5;
  return (
    <>
      {/* from downstream, high and oblique: river in front, the face and the pour, the reservoir behind */}
      <Camera3D keys={moves.pushIn(0, 80, [0.3, 1.0, 0], [1, 0.5, 0.58], 23, 20)} drift={0.01} />
      <Focus at={[1.2, 1.4, 0]} range={6} />
      <Dam kind="gravity" length={6} height={3} level={level} reach={9} frame={frame} />
      <Label3D at={[-2.2, Math.min(level, 1.04) * 3, -1.6]} offset={[-0.4, 0.5, -0.6]} text={level > 1 ? "Overtopping" : "Reservoir level"} sub={level > 1 ? "water over the crest" : "rising to the crest"} start={8} px={44} color="#2f7de1" />
    </>
  );
};

const tag = <AbsoluteFill style={{ pointerEvents: "none" }}><HonestyTag kind="reconstruction" /></AbsoluteFill>;

export const Disaster3DDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence from={S.A[0]} durationInFrames={S.A[1] - S.A[0]}>
      <DisasterStage look="nightGrid" floor={false} dof={2.5} shadowBox={4} fog={{ color: "#0a1522", near: 12, far: 60 }} overlay={tag}><SceneA /></DisasterStage>
    </Sequence>
    <Sequence from={S.B[0]} durationInFrames={S.B[1] - S.B[0]}>
      <DisasterStage look="chalk" dof={2} shadowBox={9} overlay={tag}><SceneB /></DisasterStage>
    </Sequence>
    <Sequence from={S.C[0]} durationInFrames={S.C[1] - S.C[0]}>
      <DisasterStage look="storm" dof={2} shadowBox={7} overlay={tag}><SceneC /></DisasterStage>
    </Sequence>
    <Sequence from={S.D[0]} durationInFrames={S.D[1] - S.D[0]}>
      <DisasterStage look="clay" dof={2} shadowBox={10} overlay={tag}><SceneD /></DisasterStage>
    </Sequence>
  </AbsoluteFill>
);
