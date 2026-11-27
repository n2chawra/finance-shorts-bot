// Tower (3D cutaway): BP Texas City's raffinate splitter tower in the grey refinery light, its shell turned to
// glass so the liquid inside shows. Modes (params.mode):
//   hook   the liquid already amber near the top while the board's readout says LOW in green (the contradiction);
//   inside the level climbs to its real height and a red plate counts it in feet, then the tower's height plate;
//   loop   the question tags over the quiet tower, then back to the hook's framing.
// Figures come only from params.fig (actual, tower, day, year).
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, DisasterStage, Focus, Label3D, type CamKey, type V3 } from "../../three/index";
import { Column, Overhead, Site, TOWER_H, TOWER_R } from "./refinery";
import { AMBER, Chip, figOf, GREEN, INK, kitClock, moments, orbit, Overlay, RED, Readout } from "./ui";

type Params = { mode?: string };
type Pose = { pos: V3; look: V3; fov: number };
const WIDE: Pose = { pos: [10, 9, 25], look: [1, 8.6, 0], fov: 50 };
const WIDE2: Pose = { pos: [8.6, 9.6, 23], look: [0.8, 9, 0], fov: 50 };
const MED: Pose = { pos: [5.6, 6.4, 11.5], look: [0.6, 5.2, 0], fov: 46 };
const TOP: Pose = { pos: [3.4, 16.4, 5.2], look: [0, 15.2, 0], fov: 44 };

const Liquid: React.FC<{ level: number; frame: number }> = ({ level, frame }) => level <= 0 ? null : (
  <group>
    <mesh position={[0, (TOWER_H * level) / 2 + 0.05, 0]}>
      <cylinderGeometry args={[TOWER_R - 0.03, TOWER_R - 0.03, TOWER_H * level, 32]} />
      <meshPhysicalMaterial color="#ffa53a" transparent opacity={0.8} roughness={0.2} emissive="#ff7a1a" emissiveIntensity={0.45 + 0.1 * Math.sin(frame / 9)} />
    </mesh>
    {/* the surface, rippling */}
    <mesh position={[0, TOWER_H * level + 0.06 + 0.02 * Math.sin(frame / 6), 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[TOWER_R - 0.03, 32]} />
      <meshBasicMaterial color="#ffd27a" transparent opacity={0.9} />
    </mesh>
  </group>
);

const Tower: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "hook";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  const fig = (n: string) => figOf(p, n);
  const ratio = Math.min(0.97, (Number(fig("actual")) || 158) / (Number(fig("tower")) || 170));
  const level =
    mode === "inside" ? 0.35 + (ratio - 0.35) * cue(t, e("liquid"), 40) :
    0.9 + 0.02 * Math.sin(t / 25);
  const k = (a: Pose, f: number): CamKey => ({ f, pos: a.pos, look: a.look, fov: a.fov });
  const keys: CamKey[] =
    mode === "hook" ? [k(WIDE, 0), k(WIDE2, e("gauge")), k(MED, e("gauge") + 14), k(MED, e("empty")), k(TOP, e("empty") + 16), k(TOP, end + 10)] :
    mode === "inside" ? [k(MED, 0), k(MED, e("liquid") - 4), k(TOP, e("liquid") + 14), k(TOP, e("tall") - 4), k(WIDE, e("tall") + 18), k(WIDE2, end + 10)] :
    [k(TOP, 0), k(TOP, e("story")), k(WIDE2, e("story") + 20), k(WIDE, end + 10)];
  const low = mode === "hook" ? cue(t, e("gauge"), 10) : 0;
  const blink = Math.floor(t / 10) % 2 === 0;
  return (
    <DisasterStage look="storm" floor={false} dof={1} shadowBox={16} light={0.9} fog={{ color: "#3a434d", near: 26, far: 90 }}
      overlay={
        <Overlay t={t}>
          {mode === "hook" && <Chip t={t} at={-60} text={`MARCH ${fig("day")}, ${fig("year")} · TEXAS CITY`} top={200} size={46} color="#ffd84a" border="rgba(255,216,74,0.6)" />}
          {mode === "hook" && <Chip t={t} at={Math.min(e("refinery"), 8)} text="BP REFINERY" top={280} size={50} />}
          {mode === "hook" && <Readout x={60} y={720} label="THE GAUGE SAYS" value={`FALLING ${blink ? "▼" : "▽"}`} k={low} color={GREEN} size={110} />}
          {mode === "hook" && t >= e("empty") && <Readout x={60} y={960} label="INSIDE" value="?" k={cue(t, e("empty"), 10)} color={AMBER} size={110} />}
          {mode === "inside" && <Readout x={60} y={820} label="LIQUID · FEET" value={countText(fig("actual"), cue(t, e("high"), 24))} k={cue(t, e("liquid"), 10)} color={RED} size={120} />}
          {mode === "inside" && <Readout x={60} y={1040} label="TOWER · FEET" value={countText(fig("tower"), cue(t, e("tall"), 20))} k={cue(t, e("tower"), 10)} color={INK} size={120} />}
          {mode === "loop" && <Chip t={t} at={e("Gauge")} text="THE GAUGE?" top={330} size={60} border={GREEN} />}
          {mode === "loop" && <Chip t={t} at={e("trailers")} text="OR THE TRAILERS?" top={430} size={60} border={RED} />}
          {mode === "loop" && <Chip t={t} at={e("story")} text="FULL STORY ON THE CHANNEL" top={560} size={46} />}
        </Overlay>
      }>
      <Camera3D keys={orbit(keys, 0.0035, mode === "inside" ? -1 : 1)} frame={t} drift={0.04} />
      <Focus at={[0, 9, 0]} range={10} />
      <directionalLight position={[-12, 22, 12]} intensity={1.3} color="#fff4e0" castShadow />
      <ambientLight intensity={0.32} color="#8fa0b4" />
      <pointLight position={[0, TOWER_H * level, 1.6]} intensity={6} distance={6} color="#ffa040" />
      <Site trailers={1} frame={t} />
      <Column glass={1} />
      <Overhead />
      <Liquid level={level} frame={t} />
      {/* the level transmitter at the base, glowing green: the board's only eye */}
      <group position={[TOWER_R + 0.18, 0, 0.3]}>
        <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.22, 0.3, 0.2]} /><meshStandardMaterial color="#c9a46a" emissive={GREEN} emissiveIntensity={0.25 + 0.25 * (blink ? 1 : 0)} /></mesh>
      </group>
      {mode === "hook" && t >= e("gauge") && <Label3D at={[TOWER_R + 0.2, 0.9, 0.3]} offset={[0.8, 0.9, 0.6]} text="LEVEL GAUGE" start={K(e("gauge"))} color="#7dffb8" px={56} />}
      {mode === "inside" && t >= e("liquid") && <Label3D at={[0, TOWER_H * level, TOWER_R]} offset={[1.6, 0.3, 0.8]} text="REAL LEVEL" start={K(e("liquid"))} color="#ff8a7a" px={58} />}
    </DisasterStage>
  );
};

export default Tower;
