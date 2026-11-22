// Beam (3D cutaway): the box beam that carried each walkway, close up. Modes (params.mode):
//   deck  — a walkway section from below: the deck goes ghost and the three box beams light, camera ducks under;
//   build — two steel channels slide together and a weld bead runs along the seam with sparks (size tag);
//   rod   — the hanger rod lowers and threads through the holes;   nut — washer and nut under the beam;
//   weak  — the flange round the washer warms amber and flexes, the seam line goes red;
//   bend  — the failure starting: amber → red, the flange folds up, the seam tears;
//   built — as built: the roof rod's nut carries the upper walkway, the lower walkway's rod joins it.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, DisasterStage, Focus, glow, Label3D, type CamKey, type V3 } from "../../three/index";
import { BeamCutaway, HH, NUT, UZ, LZ } from "./cutaway";
import { Walkway } from "./world";
import { figOf, kitClock, MonoCaption, moments, Overlay, Readout } from "./ui";
import { useMats } from "./world";

type Params = { mode?: string };

const Channel: React.FC<{ side: -1 | 1; x: number }> = ({ side, x }) => {
  const M = useMats();
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[side * 0.3, 0, 0]} material={M.beam} castShadow receiveShadow><boxGeometry args={[0.035, 0.8, 3]} /></mesh>
      {[0.38, -0.38].map((y) => <mesh key={y} position={[side * 0.15, y, 0]} material={M.beam} castShadow receiveShadow><boxGeometry args={[0.3, 0.035, 3]} /></mesh>)}
    </group>
  );
};

const Beam: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "nut";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  const pose = (a: V3, la: V3, b: V3, lb: V3, fov = 38): CamKey[] => [{ f: 0, pos: a, look: la, fov }, { f: end + 10, pos: b, look: lb, fov }];

  if (mode === "deck") {
    const under = cue(t, e("underneath"), 30);
    const keys = pose([4, 1.6, 4.2], [0, 0, 0], [3, -1.3, 3.0], [0, -0.1, 0]);
    return (
      <DisasterStage look="nightGrid" floor={false} dof={0.8} shadowBox={7} fog={{ color: "#05080a", near: 8, far: 30 }}
        overlay={<Overlay t={t} marks={Object.values(ev)} text="3D reconstruction · cutaway"><MonoCaption t={t} at={e("box")} text="THREE BOX BEAMS UNDER EACH WALKWAY" /></Overlay>}>
        <Camera3D keys={keys} frame={t} drift={0.006} />
        <Focus at={[0, -0.2, 0]} range={3} />
        <pointLight position={[0, -2, 2]} intensity={4} distance={10} color="#ffe2b8" />
        <group scale={0.55}><Walkway y={0} lit={cue(t, e("walkway"), 10) * (1 - under)} hot={[0, 1, 2].map(() => cue(t, e("box"), 12) * 0.35)} /></group>
      </DisasterStage>
    );
  }
  if (mode === "build") {
    const slide = 1 - cue(t, e("two"), 22, Easing.out(Easing.cubic));
    const weld = cue(t, e("welded"), 30, (x) => x);
    const keys = pose([3.6, 1.8, 3.2], [0, 0, 0], [1.6, 0.6, 3.4], [0, 0, 0.6]);
    return (
      <DisasterStage look="nightGrid" floor={false} dof={0.9} shadowBox={4} fog={{ color: "#05080a", near: 6, far: 25 }}
        overlay={<Overlay t={t} marks={Object.values(ev)} text="3D reconstruction · general principle"><Readout x={1300} y={150} label="EACH CHANNEL" value={`${figOf(p, "inch")} IN DEEP`} k={cue(t, e("two"), 12)} /></Overlay>}>
        <Camera3D keys={keys} frame={t} drift={0.006} />
        <Focus at={[0, 0, 0]} range={2} />
        <Channel side={-1} x={-1.2 * slide} />
        <Channel side={1} x={1.2 * slide} />
        {weld > 0 && [0.38, -0.38].map((y) => (
          <mesh key={y} position={[0, y, -1.5 + 1.5 * weld]}><boxGeometry args={[0.03, 0.03, 3 * weld]} /><primitive object={glow("#ffb23e", 0.9)} attach="material" /></mesh>
        ))}
        {weld > 0 && weld < 1 && <pointLight position={[0, 0.4, -1.5 + 3 * weld]} intensity={5} distance={2} color="#ffd08a" />}
        <Debris at={[0, 0.38, 0]} count={30} spread={0.1} dir={[0, 0.8, 0]} speed={1} size={0.015} start={0} seconds={1.5} slow={0.5} gravity={3} kind="metal" seed="weld" progress={weld} />
      </DisasterStage>
    );
  }
  // the cutaway modes
  const stress = mode === "weak" ? cue(t, e("where"), 20) * 0.45 + cue(t, e("split"), 10) * 0.25
    : mode === "bend" ? cue(t, e("lower"), 30) * 0.7 + cue(t, e("split"), 10) * 0.3
    : mode === "built" ? cue(t, e("lower"), 20) * 0.3 : 0;
  const fold = mode === "weak" ? cue(t, e("bend"), 16) * 0.12 * (0.6 + 0.4 * Math.sin(t / 4)) : mode === "bend" ? cue(t, e("bent"), 20) * 0.5 + cue(t, e("split"), 12) * 0.2 : 0;
  const rodDrop = mode === "rod" ? (1 - cue(t, e("rod"), 30)) * 3 : 0;
  const nutIn = mode === "nut" ? cue(t, e("washer"), 14) : 1;
  const keys = mode === "rod" ? pose([3.2, 1.2, 2.6], [0, 0.2, 0], [2.4, 0.2, 2.2], [0, -0.1, 0])
    : mode === "nut" || mode === "weak" ? pose([2.2, -0.9, 1.6], [0, -0.35, UZ], [1.4, -0.75, 1.2], NUT, 34)
    : mode === "bend" ? pose([1.9, -0.8, 1.5], [0, -0.4, UZ], [1.3, -0.7, 1.1], NUT, 34)
    : pose([3, 0.6, 2.6], [0, -0.1, 0], [2.2, -0.2, 2], [0, -0.3, 0]);
  const rested = cue(t, e("rested"), 12);
  return (
    <DisasterStage look="nightGrid" floor={false} dof={0.9} shadowBox={3} fog={{ color: "#05080a", near: 6, far: 20 }}
      overlay={<Overlay t={t} marks={Object.values(ev)} text="3D reconstruction · cutaway">
        {mode === "built" && <MonoCaption t={t} at={e("nut")} text="FOURTH-FLOOR BOX BEAM · AS BUILT" />}
        {mode === "bend" && <MonoCaption t={t} at={0} text="EAST END · MIDDLE BOX BEAM · SLOWED" />}
      </Overlay>}>
      <Camera3D keys={keys} frame={t} drift={0.005} />
      <Focus at={mode === "rod" ? [0, 0, 0] : NUT} range={mode === "rod" ? 1.6 : 0.6} />
      <pointLight position={[1.5, 1.2, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
      <pointLight position={[-1.5, -1.5, 1]} intensity={1.4} distance={6} color="#59c8ff" />
      <group position={[0, rodDrop, 0]} scale={[1, 1, 1]}>
        <group scale={[nutIn, nutIn, nutIn]}>
          <BeamCutaway t={t} stress={stress} fold={fold} drop={0} debris={mode === "bend" ? cue(t, e("split"), 40, (x) => x) : 0} lowerRod={mode === "built"} />
        </group>
      </group>
      {mode === "rod" && t >= e("rod") && <Label3D at={[0, 1.2, UZ]} offset={[0.4, 0.4, 0.3]} text="HANGER ROD" start={K(e("rod"))} color="#ffd84a" px={44} />}
      {mode === "rod" && t >= e("holes") && <Label3D at={[0, HH, UZ]} offset={[0.6, 0.3, 0.6]} text="THROUGH BOTH FLANGES" start={K(e("holes"))} color="#ffd84a" px={44} />}
      {mode === "nut" && t >= e("nut") && <Label3D at={NUT} offset={[-0.5, -0.35, 0.4]} text="WASHER AND NUT" start={K(e("nut"))} color="#ffd84a" px={44} />}
      {mode === "nut" && rested > 0 && <mesh position={[0, HH + 0.35 - 0.1 * rested, UZ]}><coneGeometry args={[0.08, 0.2, 16]} /><meshBasicMaterial color="#ffb000" /></mesh>}
      {mode === "nut" && t >= e("rested") && <Label3D at={[0, -HH, UZ]} offset={[0.5, 0.5, 0.5]} text="THE BEAM RESTS ON IT" start={K(e("rested"))} color="#ffb000" px={44} />}
      {mode === "weak" && t >= e("split") && <Label3D at={[0, -HH, 0]} offset={[0.4, -0.3, 0.6]} text="WELD SEAM" sub="the weak line" start={K(e("split"))} color="#ff6a5c" px={44} />}
      {mode === "built" && t >= e("upper") && <Label3D at={[0, -HH, UZ]} offset={[-0.7, -0.4, 0.4]} text="UPPER WALKWAY" start={K(e("upper"))} color="#ffd84a" px={44} />}
      {mode === "built" && t >= e("lower") && <Label3D at={[0, HH, LZ]} offset={[0.5, 0.5, 0.4]} text="+ LOWER WALKWAY" start={K(e("lower"))} color="#ff6a5c" px={44} />}
      {mode === "built" && t >= e("nut") && <mesh position={NUT} rotation-x={Math.PI / 2}><torusGeometry args={[0.16 + 0.015 * Math.sin(t / 4), 0.012, 8, 40]} /><meshBasicMaterial color="#ffb000" /></mesh>}
    </DisasterStage>
  );
};

export default Beam;
