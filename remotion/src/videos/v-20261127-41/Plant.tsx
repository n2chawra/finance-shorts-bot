// Plant (3D, the shared refinery world): every beat set at the Texas City isomerization unit, drawn 9:16.
// params.shot picks the camera path (keys on the beat's moment words), and the phase what is happening:
//   valves  liquid runs down the overhead pipe on "pipe", the three relief valves open on "valves";
//   stack   the old blowdown drum fills and liquid erupts from its open stack on "erupts";
//   cloud   the vapour spreads over the ground toward the contractors' trailers (people by their doors) and the
//           idling pickup truck;
//   ignite  close on the idling truck in the cloud, the clock plate, a spark on "spark";
//   blast   silence, then the fireball and pressure ring on "give", pulled wide on "wide";
//   after   the crushed trailers burning, firefighters walking in with lamps, the toll plate.
// Figures come only from params.fig.
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, Crowd3D, cue, Debris, DisasterStage, Focus, Label3D, Rescuers, type CamKey, type V3 } from "../../three/index";
import { Aftermath, Blast, Blowdown, Column, DRUM, Geyser, Overhead, PIPE_X, Site, STACK_TOP, TRAILERS, TRUCK, Truck, Vapour, VALVE_Y } from "./refinery";
import { AMBER, Chip, figOf, INK, kitClock, moments, orbit, Overlay, RED, Readout } from "./ui";

type Pose = { pos: V3; look: V3; fov?: number };
type Key = { at: string | number; pose: Pose };
type Params = { shot?: string };

const P_: Record<string, Pose> = {
  pipeTop: { pos: [6.5, 15.5, 11], look: [PIPE_X, 13.5, 0], fov: 50 },
  pipeMid: { pos: [6, 5.5, 9.5], look: [PIPE_X + 1, 3.2, 0], fov: 50 },
  valves: { pos: [3.0, 3.0, 3.4], look: [1.35, VALVE_Y, 0], fov: 44 },
  valvesWide: { pos: [4.6, 4.2, 7.4], look: [2.6, 2.4, 0], fov: 48 },
  stackWide: { pos: [0.5, 5, 17], look: [8, 8.6, 0], fov: 52 },
  stackTop: { pos: [4.2, 12.6, 7.2], look: [8, 12.8, 0], fov: 46 },
  stackRain: { pos: [3.2, 7, 12], look: [8, 9, 0], fov: 52 },
  cloudHigh: { pos: [2, 19, 30], look: [9, 0, 7], fov: 50 },
  trailers: { pos: [6, 4.2, 22], look: [10, 0.8, 12], fov: 46 },
  truck: { pos: [12.6, 1.5, 5.8], look: [9.6, 0.6, 2.1], fov: 44 },
  truckClose: { pos: [11.2, 1.0, 3.8], look: [9.6, 0.55, 2.1], fov: 42 },
  blastWide: { pos: [8, 9, 36], look: [9, 3, 6], fov: 56 },
  after: { pos: [5, 3.2, 21], look: [10, 0.8, 12], fov: 48 },
  afterWide: { pos: [3, 5.4, 25], look: [10, 1.2, 11], fov: 50 },
};
const SHOTS: Record<string, Key[]> = {
  valves: [{ at: 0, pose: P_.pipeTop! }, { at: "pipe", pose: P_.pipeTop! }, { at: "relief", pose: P_.pipeMid! }, { at: "valves", pose: P_.valves! }, { at: "minutes", pose: P_.valvesWide! }],
  stack: [{ at: 0, pose: P_.stackWide! }, { at: "stack", pose: P_.stackWide! }, { at: "erupts", pose: P_.stackTop! }, { at: "geyser", pose: P_.stackRain! }],
  cloud: [{ at: 0, pose: P_.cloudHigh! }, { at: "trailers", pose: P_.trailers! }, { at: "pickup", pose: P_.truck! }],
  ignite: [{ at: 0, pose: P_.truck! }, { at: "past", pose: P_.truck! }, { at: "spark", pose: P_.truckClose! }],
  blast: [{ at: 0, pose: P_.truckClose! }, { at: "give", pose: P_.truckClose! }, { at: "wide", pose: P_.blastWide! }],
  after: [{ at: 0, pose: P_.afterWide! }, { at: "died", pose: P_.afterWide! }, { at: "trailers", pose: P_.after! }],
};

const Plant: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const shot = (p.beat.params as Params).shot ?? "cloud";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const end = Math.max(m.end, 30);
  const fig = (n: string) => figOf(p, n);
  const path = SHOTS[shot] ?? SHOTS.cloud!;
  const keys: CamKey[] = [];
  path.forEach((k, i) => {
    const fov = k.pose.fov ?? 46;
    if (i === 0) { keys.push({ f: 0, pos: k.pose.pos, look: k.pose.look, fov }); return; }
    const f = typeof k.at === "number" ? k.at : Math.min(e(k.at), end);
    const last = keys[keys.length - 1]!;
    keys.push({ f: Math.max(last.f + 1, f), pos: last.pos, look: last.look, fov: last.fov });
    keys.push({ f: Math.max(last.f + 2, f) + 18, pos: k.pose.pos, look: k.pose.look, fov });
  });
  { const last = keys[keys.length - 1]!; keys.push({ f: Math.max(last.f + 1, end + 10), pos: last.pos, look: last.look, fov: last.fov }); }
  const after = shot === "after";
  const pipeFill = shot === "valves" ? cue(t, e("pipe"), 30) : 1;
  const valves = shot === "valves" ? cue(t, e("valves"), 8) : 1;
  const flow = shot === "valves" ? cue(t, e("valves") + 6, 30) : 1;
  const geyser = shot === "stack" ? cue(t, e("erupts"), 16) : shot === "cloud" ? 1 : 0;
  const cloud = shot === "cloud" ? 0.35 + 0.65 * cue(t, 0, end, (x) => x) : shot === "ignite" ? 1 : shot === "blast" ? 1 - cue(t, e("give"), 6) : 0;
  const blastK = shot === "blast" ? cue(t, e("give"), 60, (x) => x) : 0;
  const spark = shot === "ignite" ? cue(t, e("spark"), 4) * (0.6 + 0.4 * Math.sin(t)) : 0;
  const flash = shot === "blast" ? Math.max(0, 1 - Math.abs(t - e("give") - 3) / 8) : 0;
  return (
    <DisasterStage look="storm" floor={false} dof={1.1} shadowBox={26} light={after ? 0.6 : 0.9} fog={{ color: after ? "#2a2a2c" : "#3a434d", near: 30, far: 110 }}
      overlay={
        <Overlay t={t}>
          {shot === "valves" && <Readout x={60} y={300} label="VALVES OPEN · MINUTES" value={countText(fig("minutes"), cue(t, e("minutes") - 10, 20))} k={cue(t, e("valves"), 10)} color={AMBER} size={110} />}
          {shot === "stack" && <Chip t={t} at={e("flare")} text="NO FLARE" top={300} size={60} border={RED} color={RED} />}
          {shot === "cloud" && <Chip t={t} at={e("Vapour")} text="FLAMMABLE VAPOUR" top={300} size={52} border={AMBER} />}
          {shot === "ignite" && <Readout x={60} y={300} label="TIME" value={`${fig("hour")}:${fig("minute")} PM`} k={cue(t, e("At"), 10)} color={INK} size={110} />}
          {shot === "blast" && <div style={{ position: "absolute", inset: 0, background: "#fff1c8", opacity: flash * 0.85 }} />}
          {after && <Readout x={60} y={300} label="PEOPLE DIED" value={fig("died")} k={cue(t, e("died") - 6, 10)} color={RED} size={120} />}
          {after && <Chip t={t} at={e("trailers")} text="IN OR NEAR THE TRAILERS" top={540} size={44} border={RED} />}
        </Overlay>
      }>
      <Camera3D keys={orbit(keys, 0.003, shot === "stack" || shot === "blast" ? -1 : 1)} frame={t} drift={0.05} />
      <Focus at={keys[keys.length - 1]!.look} range={12} />
      <directionalLight position={[-20, 30, 15]} intensity={after ? 0.8 : 1.4} color="#fff4e0" castShadow />
      <ambientLight intensity={0.27} color="#8fa0b4" />
      <Site trailers={1} crush={after ? 1 : 0} frame={t} />
      <Column />
      <Overhead fill={pipeFill} valves={valves} flow={flow} />
      <Blowdown fill={shot === "stack" ? Math.max(0.4, cue(t, 0, Math.max(20, e("erupts")))) : shot === "valves" ? 0 : 1} />
      {!after && <Truck frame={t} spark={spark} />}
      <Geyser frame={t} k={geyser} />
      <Vapour frame={t} k={cloud} />
      <Blast k={blastK} />
      {shot === "blast" && <Debris at={[DRUM[0] + 1, 1, 3]} count={60} spread={2} dir={[0, 1, 0]} speed={4} size={0.12} start={0.05} seconds={2} slow={0.6} gravity={4} floor={0} kind="metal" seed="tc-blast" progress={blastK} />}
      {(after || (shot === "blast" && blastK > 0.5)) && <Aftermath frame={t + 200} fire={1} />}
      {/* the contract workers by their trailers before the blast (small, no faces) */}
      {(shot === "cloud" || shot === "ignite") && TRAILERS.slice(0, 5).map((at, i) => (
        <Crowd3D key={i} position={[at[0] + 0.6, 0, at[2] + 1.3]} count={3} area={[0.9, 0.5]} height={0.34} seed={`tc-w${i}`} mood="stand" />
      ))}
      {after && <Rescuers position={[7.5, 0, 16.8]} spots={[[-1.4, 0, 0.2], [-0.4, 0, -0.1], [0.6, 0, 0.3], [1.6, 0, 0]]} height={0.38} enterAt={K(0)} enterFrom={-2} />}
      {after && <Rescuers position={[11.5, 0, 17.4]} spots={[[-0.5, 0, 0], [0.5, 0, 0.2]]} height={0.38} enterAt={K(e("trailers"))} enterFrom={2} />}
      {shot === "valves" && t >= e("valves") && <Label3D at={[1.35, VALVE_Y, 0]} offset={[-1.0, 0.7, 0.6]} text="RELIEF VALVES" start={K(e("valves"))} color="#ffd84a" px={48} />}
      {shot === "stack" && t >= e("stack") && <Label3D at={[DRUM[0], STACK_TOP - 1, 0]} offset={[-2.4, -1.2, 3.2]} text="VENT STACK" start={K(e("stack"))} color="#ffd84a" px={48} />}
      {shot === "cloud" && t >= e("trailers") && <Label3D at={[10, 1.4, 12]} offset={[-1.2, 1.4, 0.6]} text="TRAILERS" start={K(e("trailers"))} color="#ffd84a" px={48} />}
      {shot === "cloud" && t >= e("pickup") && <Label3D at={[TRUCK[0], 0.8, TRUCK[2]]} offset={[-0.6, 0.6, 0.4]} text="IDLING TRUCK" start={K(e("pickup"))} color="#ff8a7a" px={48} />}
    </DisasterStage>
  );
};

export default Plant;
