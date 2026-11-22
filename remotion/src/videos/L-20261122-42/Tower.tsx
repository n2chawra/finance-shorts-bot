// Tower (3D cutaway): inside the raffinate splitter. The shell turns to glass; trays every few feet; the
// liquid (amber) at its level; the level transmitter at the base with a bracket showing the short span it
// could read; the sight glass; the overhead pipe at the top. Modes (params.mode): hookfull (the liquid
// surges almost to the top), trays (trays light, vapour rises), normal (the normal band at the bottom), span
// (the transmitter and its range, tag), blind (above the range goes dark), fillnight / fillday (the level
// climbing), calib (the transmitter's calibration tag struck red), glass (the sight glass, dark with
// residue, in a torch beam), spill (liquid over the top tray into the pipe), payoff (the board's low
// reading beside the real level near the top, from the figures).
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, DisasterStage, Focus, glow, Label3D, Smoke, type CamKey, type V3 } from "../../three/index";
import { Column, Overhead, Site, TOWER_H, TOWER_R } from "./refinery";
import { AMBER, figOf, GREEN, kitClock, MonoCaption, moments, Overlay, Readout, RED } from "./ui";

type Tag = { at: string; fig: string; label: string };
type Params = { mode?: string; tag?: Tag };
const BAND = 0.06;            // the bottom of the tower the gauge could read, as a share of the height (drawn)

const Liquid: React.FC<{ level: number; hot?: boolean }> = ({ level, hot }) => level <= 0 ? null : (
  <mesh position={[0, (TOWER_H * level) / 2 + 0.05, 0]}>
    <cylinderGeometry args={[TOWER_R - 0.03, TOWER_R - 0.03, TOWER_H * level, 32]} />
    <meshPhysicalMaterial color={hot ? "#ff9a3c" : "#d9a441"} transparent opacity={0.75} roughness={0.2} emissive={hot ? "#ff6a1a" : "#7a4a10"} emissiveIntensity={hot ? 0.6 : 0.3} />
  </mesh>
);

const Trays: React.FC<{ lit: number }> = ({ lit }) => (
  <group>
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={i} position={[0, 0.7 + i * 0.68, 0]}>
        <cylinderGeometry args={[TOWER_R - 0.05, TOWER_R - 0.05, 0.03, 24]} />
        <meshStandardMaterial color="#8d949b" emissive="#39ff9a" emissiveIntensity={lit > i / 24 ? 0.35 : 0} />
      </mesh>
    ))}
  </group>
);

const Tower: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "normal";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  const ratio = (Number(figOf(p, "actual")) || 0) / (Number(figOf(p, "tower")) || 1);
  const level =
    mode === "hookfull" ? 0.2 + 0.73 * cue(t, e("almost") - 6, 40) :
    mode === "trays" || mode === "normal" || mode === "span" || mode === "calib" || mode === "glass" ? 0.04 :
    mode === "blind" ? 0.045 :
    mode === "fillnight" ? 0.01 + 0.05 * cue(t, e("filling"), 60) :
    mode === "fillday" ? 0.06 + 0.4 * cue(t, e("filled") - 20, Math.max(40, end - e("filled") + 10), (x) => x) :
    mode === "spill" ? 0.97 :
    mode === "payoff" ? 0.15 + (ratio - 0.15) * cue(t, e("tower"), 40) : 0.05;
  const base: V3 = [0, 0.6, 0];
  const pose = (a: V3, la: V3, b: V3, lb: V3, fov = 40): CamKey[] => [{ f: 0, pos: a, look: la, fov }, { f: end + 10, pos: b, look: lb, fov }];
  const keys =
    mode === "hookfull" || mode === "fillday" || mode === "payoff" ? pose([7, 7, 13], [0, 8, 0], [6, 8.5, 11], [0, 9, 0], 48) :
    mode === "trays" ? pose([3.4, 5, 4.4], [0, 5, 0], [2.8, 6.4, 3.8], [0, 6.5, 0]) :
    mode === "blind" ? pose([3.2, 1.2, 4], [0, 1, 0], [3.6, 3, 4.6], [0, 12, 0], 52) :
    mode === "spill" ? pose([3, 17.4, 3.6], [0.4, 17, 0], [2.6, 17.8, 3], [0.6, 17.2, 0]) :
    mode === "glass" ? pose([1.6, 1.4, 1.8], [0, 1.1, 0.6], [1.2, 1.25, 1.4], [0, 1.1, 0.6], 34) :
    pose([3, 1.6, 3.8], [0, 0.8, 0], [2.4, 1.3, 3], [0, 0.8, 0], 38);
  const glass = cue(t, Math.min(e("fact"), e("inside"), e("last"), mode === "hookfull" || mode === "trays" || mode === "payoff" ? 1e9 : 0), 14);
  const bracket = mode === "span" ? cue(t, e("see"), 12) : ["blind", "calib", "fillnight", "fillday", "payoff"].includes(mode) ? 1 : 0;
  const dark = mode === "blind" ? cue(t, e("blind"), 20) : 0;
  const rangeTop = TOWER_H * BAND + 0.3;
  const fig = (n?: string) => figOf(p, n);
  return (
    <DisasterStage look="storm" floor={false} dof={1} shadowBox={14} light={0.85} fog={{ color: "#3a434d", near: 20, far: 80 }}
      overlay={
        <Overlay t={t} marks={Object.values(ev)} text="3D reconstruction · cutaway">
          {P.tag && <Readout x={1240} y={170} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} />}
          {mode === "calib" && <MonoCaption t={t} at={e("calibrated")} text="CALIBRATED FOR A DIFFERENT DENSITY" top={170} color={RED} />}
          {mode === "glass" && <MonoCaption t={t} at={e("years")} text="SIGHT GLASS · NONFUNCTIONAL FOR YEARS" top={170} color={AMBER} />}
          {mode === "payoff" && (
            <>
              <Readout x={140} y={300} label="THE BOARD SHOWED" value={`LOW ${t >= e("falling") ? "▼" : ""}`} k={cue(t, e("gauge"), 12)} color={GREEN} />
              <Readout x={1300} y={170} label="IN THE TOWER · FEET" value={countText(fig("actual"), cue(t, e("liquid"), 20))} k={cue(t, e("liquid"), 12)} color={RED} />
            </>
          )}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.01} />
      <Focus at={mode === "glass" ? [0, 1.1, 0.6] : keys[1]!.look} range={mode === "glass" ? 1 : 8} />
      <directionalLight position={[-12, 20, 10]} intensity={1.2} color="#fff4e0" castShadow />
      <ambientLight intensity={0.3} color="#8fa0b4" />
      <Site trailers={0} frame={t} />
      <Column glass={glass} />
      <Overhead fill={mode === "spill" ? cue(t, e("top") , 30) : 0} />
      {glass > 0 && <Trays lit={mode === "trays" ? cue(t, e("trays"), 40, (x) => x) : 0} />}
      <Liquid level={level} hot={mode === "spill" || (mode === "payoff" && t >= e("tower")) || (mode === "hookfull" && t >= e("top"))} />
      {mode === "trays" && t >= e("light") && <Smoke frame={t} at={[0, 1.2, 0]} height={10} width={0.8} count={14} life={70} color="#7fb6ff" opacity={0.35} wind={[0, 0.5, 0]} seed="vap" />}
      {mode === "normal" && <mesh position={[0, TOWER_H * 0.04, 0]}><cylinderGeometry args={[TOWER_R + 0.06, TOWER_R + 0.06, 0.25, 32, 1, true]} /><meshBasicMaterial color={GREEN} transparent opacity={0.5 * cue(t, e("bottom"), 10)} side={2} /></mesh>}
      {/* the level transmitter and its span */}
      <group position={[TOWER_R + 0.18, 0, 0.3]}>
        <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.22, 0.3, 0.2]} /><meshStandardMaterial color="#c9a46a" emissive={mode === "calib" && t >= e("calibrated") ? "#ff3b30" : "#000"} emissiveIntensity={0.6} /></mesh>
        {[0.35, rangeTop - 0.1].map((y) => <mesh key={y} position={[-0.09, y, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.02, 0.02, 0.18, 6]} /><meshStandardMaterial color="#8d949b" /></mesh>)}
        {bracket > 0 && <mesh position={[0.2, (0.35 + rangeTop) / 2, 0]} scale={[1, bracket, 1]}><boxGeometry args={[0.04, rangeTop - 0.35, 0.04]} /><meshBasicMaterial color={GREEN} /></mesh>}
      </group>
      {dark > 0 && <mesh position={[0, (rangeTop + TOWER_H) / 2, 0]}><cylinderGeometry args={[TOWER_R + 0.03, TOWER_R + 0.03, TOWER_H - rangeTop, 32, 1, true]} /><meshBasicMaterial color="#050607" transparent opacity={0.75 * dark} side={2} /></mesh>}
      {/* the sight glass */}
      <group position={[0, 1.1, TOWER_R + 0.02]}>
        <mesh><boxGeometry args={[0.14, 0.5, 0.06]} /><meshStandardMaterial color="#5c636b" /></mesh>
        <mesh position={[0, 0, 0.035]}><planeGeometry args={[0.08, 0.42]} /><meshBasicMaterial color={mode === "glass" && t >= e("unreadable") ? "#120d08" : "#3a4a52"} /></mesh>
      </group>
      {mode === "glass" && t >= e("glass") && <spotLight position={[1.2, 1.5, 1.6]} target-position={[0, 1.1, 0.6]} intensity={30} distance={5} angle={0.25} penumbra={0.4} color="#fff6d8" />}
      {mode === "span" && t >= e("transmitter") && <Label3D at={[TOWER_R + 0.2, 0.9, 0.3]} offset={[0.6, 0.6, 0.4]} text="LEVEL TRANSMITTER" start={K(e("transmitter"))} color="#ffd84a" px={44} />}
      {mode === "blind" && t >= e("blind") && <Label3D at={[0, TOWER_H * 0.5, TOWER_R]} offset={[1.2, 0, 0.5]} text="NOT MEASURED" start={K(e("blind"))} color="#ff6a5c" px={44} />}
      {mode === "spill" && t >= e("top") && <Label3D at={[0.5, TOWER_H + 0.3, 0]} offset={[0.6, 0.5, 0.5]} text="INTO THE OVERHEAD PIPE" start={K(e("top"))} color="#ff6a5c" px={44} />}
      {mode === "spill" && <mesh position={[0, TOWER_H * 0.97, 0]} material={glow("#ffb000", 0.5)}><cylinderGeometry args={[TOWER_R + 0.02, TOWER_R + 0.02, 0.08, 32]} /></mesh>}
    </DisasterStage>
  );
};

export default Tower;
