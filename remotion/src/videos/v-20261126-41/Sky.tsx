// Sky (3D, portrait): the airliner in the snowy night cloud near Buffalo, and the street where it came down. Modes
// (params.mode): wing (the whole airliner, then a push to its wing as the stall glow climbs), stall (silent: the wing
// top fills the frame glowing red, the buffet, then the wing drops on the sub-boom), roll (side-on: the nose rises,
// the left wing drops, then it whips over to the right), crash (far above the snowy town: a glow between the
// houses, fire engines and firefighters with lamps arriving; the toll on plates). Figures only from params.fig.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, CloudDeck, cue, DisasterStage, Focus, glow, Label3D, Rain, Rescuers, rnd, type CamKey, type V3 } from "../../three/index";
import { HonestyTag } from "../../disaster/index";
import { Q400, RunwayLights, Town } from "./q400";
import { AMBER, Chip, figOf, ICE, kitClock, moments, Readout, RED } from "./ui";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov: number };
const SHOTS: Record<string, Shot> = {
  wide: { a: [8.4, 1.0, 9.6], la: [0, 0.2, 0], b: [7.6, 0.9, 8.8], lb: [0, 0.1, 0], fov: 50 },
  wing: { a: [2.4, 1.6, 4.6], la: [0.4, 0.3, 1.5], b: [2.1, 1.3, 4.0], lb: [0.4, 0.25, 1.7], fov: 46 },
  side: { a: [-8.5, 1.8, 7.5], la: [0, 0, 0], b: [-9.8, 2.6, 8.8], lb: [0, -0.6, 0], fov: 50 },
  far: { a: [8, 10, 20], la: [32, 0, -2], b: [12, 8, 17], lb: [33, 0, -2], fov: 50 },
  street: { a: [21, 3.4, 6.5], la: [31, 0.6, -1], b: [22.5, 3.0, 6.0], lb: [32, 0.6, -1.2], fov: 50 },
};

type Params = { mode?: string };

const Sky: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const mode = P.mode ?? "wing";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const end = Math.max(m.end, 30);
  const fig = (n: string) => figOf(p, n);
  const ground = mode === "crash";

  // the airliner's attitude, on the words
  let pitch = 0.08, roll = 0, stall = 0, buffet = 0;
  if (mode === "wing") { stall = 0; buffet = 0; }
  if (mode === "stall") { stall = 1; buffet = Math.sin(t * 2.9) * 0.02; pitch = 0.22; roll = -0.5 * cue(t, e("give"), 12, (x) => x * x); }
  if (mode === "roll") {
    const rose = cue(t, e("rose"), 24), left = cue(t, e("dropped"), 26), right = cue(t, e("whipped"), 34), nose = cue(t, e("right"), 30);
    pitch = 0.05 + 0.3 * rose - 0.25 * right - 0.35 * nose;
    roll = -0.785 * left * (1 - right) + 1.83 * right;
    stall = 0.6 + 0.4 * rose; buffet = Math.sin(t * 2.7) * 0.015;
  }
  pitch += buffet;
  const fallY = mode === "roll" ? -3 * cue(t, e("right"), 40, (x) => x * x) : 0;

  const S = mode === "wing" ? null : mode === "stall" ? SHOTS.wing! : mode === "roll" ? SHOTS.side! : SHOTS.far!;
  let keys: CamKey[];
  if (mode === "wing") {
    // medium on the whole airliner, then a push to the wing on "wings"
    const w = SHOTS.wide!, g = SHOTS.wing!;
    const at = e("fires");
    keys = [
      { f: 0, pos: w.a, look: w.la, fov: w.fov },
      { f: Math.max(1, at - 4), pos: w.b, look: w.lb, fov: w.fov },
      { f: at + 22, pos: g.a, look: g.la, fov: g.fov },
      { f: end + 10, pos: g.b, look: g.lb, fov: g.fov },
    ];
  } else if (mode === "stall") {
    // extreme on the wing top, pulled wide on "wide"
    const at = e("wide");
    keys = [
      { f: 0, pos: [1.6, 1.25, 3.2], look: [0.4, 0.2, 1.8], fov: 44 },
      { f: Math.max(1, at - 2), pos: [1.5, 1.2, 3.0], look: [0.4, 0.2, 1.8], fov: 44 },
      { f: at + 24, pos: [7.5, 1.6, 8.8], look: [0, -0.2, 0], fov: 50 },
      { f: end + 10, pos: [8.2, 1.9, 9.4], look: [0, -0.3, 0], fov: 50 },
    ];
  } else if (mode === "crash") {
    // far above the town, then down into the street with the firefighters on "killed"
    const f = SHOTS.far!, s = SHOTS.street!;
    const at = e("killed");
    keys = [
      { f: 0, pos: f.a, look: f.la, fov: f.fov },
      { f: Math.max(1, at - 4), pos: f.b, look: f.lb, fov: f.fov },
      { f: at + 20, pos: s.a, look: s.la, fov: s.fov },
      { f: end + 10, pos: s.b, look: s.lb, fov: s.fov },
    ];
  } else {
    keys = [
      { f: 0, pos: S!.a, look: S!.la, fov: S!.fov },
      { f: end + 10, pos: S!.b, look: [S!.lb[0], S!.lb[1] + fallY * 0.6, S!.lb[2]], fov: S!.fov },
    ];
  }
  const glowK = ground ? cue(t, e("house"), 24) : 0;
  const rescueAt = ground ? e("killed") : 1e9;
  const dark = mode === "roll" ? 0.4 * cue(t, e("right"), 40) : 0;
  const silent = mode === "stall" ? 1 - cue(t, e("near") + 2, 10) : 0;
  return (
    <DisasterStage look="storm" floor={false} dof={ground ? 0.6 : 0.9} shadowBox={30} light={ground ? 0.45 : 0.7}
      backdrop={ground ? { top: "#0c1218", bottom: "#2a3440" } : { top: "#202933", bottom: "#4a545e" }}
      fog={ground ? { color: "#141b22", near: 12, far: 70 } : { color: "#3b444d", near: 7, far: 34 }} vignette={0.55} bloom={0.75}
      overlay={
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <HonestyTag t={t} tag={mode === "stall" ? "paused" : "reconstruction"} at={0} />
          {mode === "wing" && <Chip t={t} at={e("Buffalo")} text="COLGAN AIR · NEAR BUFFALO" top={300} size={44} />}
          {mode === "wing" && <Chip t={t} at={e("warning")} text="STALL WARNING" top={390} size={54} color={AMBER} border={AMBER} />}
          {mode === "wing" && <Chip t={t} at={e("before")} text="WARNS BEFORE A STALL" top={480} size={48} color={ICE} border={ICE} />}
          {mode === "stall" && <Chip t={t} at={e("give")} text="THE WING STALLS" top={300} size={56} color={RED} border={RED} />}
          {mode === "roll" && <Readout x={70} y={300} label="LEFT WING DOWN · DEG" k={cue(t, e("dropped"), 12)} value={countText(fig("left"), cue(t, e("dropped"), 20))} color={AMBER} />}
          {mode === "roll" && <Readout x={70} y={540} label="RIGHT WING DOWN · DEG" k={cue(t, e("whipped"), 12)} value={countText(fig("right"), cue(t, e("whipped"), 24))} color={RED} />}
          {ground && <Chip t={t} at={e("half")} text="UNDER HALF A MINUTE" top={300} size={50} color={AMBER} border={AMBER} />}
          {ground && <Chip t={t} at={e("house")} text="CLARENCE CENTER, NEW YORK" top={400} size={44} color={ICE} border={ICE} />}
          {ground && <Readout x={70} y={540} label="ABOARD · KILLED" k={cue(t, e("aboard"), 12)} value={countText(fig("aboard"), cue(t, e("aboard"), 20))} />}
          {ground && <Readout x={70} y={790} label="ON THE GROUND" k={cue(t, e("ground"), 12)} value={countText(fig("ground"), cue(t, e("ground"), 10))} />}
          {dark > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dark})` }} />}
          {silent > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.3 * silent})` }} />}
        </AbsoluteFill>
      }>
      <Camera3D keys={keys} frame={t} drift={0.025} />
      <Focus at={ground ? [30, 1, -1] : mode === "stall" || mode === "wing" ? [0.4, 0.2, 1.6] : [0, 0, 0]} range={ground ? 40 : 6} />
      <directionalLight position={[10, 30, 12]} intensity={ground ? 0.35 : 0.9} color="#d8e2ec" castShadow />
      <ambientLight intensity={ground ? 0.22 : 0.45} color={ground ? "#55657a" : "#8a99aa"} />
      {!ground && <Q400 position={[0, fallY, 0]} pitch={pitch} roll={roll} frame={t} prop={0.9} gear={1} ice={mode === "wing" ? 0 : 0.2} stall={stall} lights={0.8} flaps={1} />}
      {mode === "wing" && <Label3D at={[-1.6, 0.35, 0.3]} offset={[-0.6, 1.1, 0.6]} text="COLGAN AIR" start={K(e("Buffalo"))} color="#ffffff" px={44} />}
      {!ground && <CloudDeck frame={t} y={-5 + fallY} size={140} cover={0.85} puffs={50} wind={[-0.25, 0.02]} />}
      {!ground && <CloudDeck frame={t + 400} y={7} size={140} cover={0.9} puffs={30} wind={[-0.2, 0.01]} seed="ceiling" />}
      {!ground && <Rain frame={t} center={[2, 0.5, 2]} size={[16, 8, 14]} count={700} length={0.09} speed={0.06} wind={[-0.45, 0.03]} color="#f2f6fa" opacity={0.75} seed="snow" />}
      {!ground && mode !== "stall" && Array.from({ length: 140 }, (_, i) => (
        <mesh key={`g${i}`} position={[-70 + rnd("tx", i) * 140, -32, -70 + rnd("tz", i) * 120]} material={glow(rnd("tc", i) > 0.8 ? "#fff2cf" : "#ffc46b", 0.5 + 0.5 * rnd("tb", i))}>
          <sphereGeometry args={[0.18, 5, 4]} />
        </mesh>
      ))}
      {ground && <Town frame={t} glowK={glowK} engines={cue(t, rescueAt, 30)} />}
      {ground && <Rain frame={t} center={[22, 6, 0]} size={[50, 14, 30]} count={900} length={0.1} speed={0.05} wind={[0.03, 0.01]} color="#f2f6fa" opacity={0.7} seed="town" />}
      {ground && <RunwayLights position={[78, 0, -40]} frame={t} rot={0.4} />}
      {ground && <Rescuers position={[28, 0, 0.6]} spots={[[-1.2, 0, 0.2], [-0.4, 0, -0.3], [0.5, 0, 0.3], [1.3, 0, -0.1]]} height={0.42} enterAt={K(rescueAt)} enterFrom={-4} lamps />}
    </DisasterStage>
  );
};
export default Sky;
