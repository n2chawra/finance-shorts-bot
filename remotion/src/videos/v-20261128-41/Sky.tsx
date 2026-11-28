// Sky (3D, portrait, blueprint look): the airliner on the snowy night approach to Buffalo and the street where it came
// down. Modes (params.mode): approach (from below the approach path, looking up through the snow at the airliner over
// the approach lights; its radar-style data tag shows the airspeed, flips to SHAKER then PUSHER, the nose dips then
// rises), stall (silent: under the wing, its underside glowing red, then it drops away on the sub-boom), crash (over the
// rooftops of Clarence Center, a glow between the houses, fire engines and firefighters with lamps; the toll on plates).
// Figures only from params.fig.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, CloudDeck, cue, DisasterStage, Focus, glow, Rain, Rescuers, rnd, type CamKey, type V3 } from "../../three/index";
import { HonestyTag } from "../../disaster/index";
import { Q400, RunwayLights, Town } from "./q400";
import { AMBER, Chip, figOf, GREEN, ICE, kitClock, moments, Readout, RED, StampHtml } from "./ui";

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
  const mode = P.mode ?? "approach";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => (ev[n] !== undefined ? ev[n]! : 1e9);
  const end = Math.max(m.end, 30);
  const fig = (n: string) => figOf(p, n);
  const ground = mode === "crash" && t >= e("house");
  const air = mode === "hook" || mode === "how" || mode === "loop";

  // the airliner's attitude, on the words
  let pitch = 0.08, roll = 0, stall = 0, buffet = 0;
  if (mode === "hook") { stall = 0.45; pitch = 0.12 - 0.2 * cue(t, e("push"), 14) + 0.06 * cue(t, e("down"), 30); buffet = Math.sin(t * 2.5) * 0.008; }
  if (mode === "how") {
    stall = 0.3 + 0.4 * cue(t, e("wing"), 20); buffet = Math.sin(t * 3.1) * 0.012 * (cue(t, e("shakes"), 6) - cue(t, e("machine"), 6));
    pitch = 0.12 - 0.22 * cue(t, e("forward"), 14);
  }
  if (mode === "loop") { stall = 0.45 * cue(t, e("channel"), 20); pitch = 0.1 + 0.02 * Math.sin(t / 20); }
  if (mode === "crash" && !ground) { roll = 1.83 * cue(t, e("rolled"), 30); pitch = 0.05 - 0.45 * cue(t, e("dived"), 24); stall = 1; }
  if (mode === "approach") {
    const dip = cue(t, e("pusher"), 12), up = cue(t, e("nose"), 16);
    pitch = 0.1 + 0.04 * Math.sin(t / 3) * cue(t, e("Then"), 6) - 0.22 * dip * (1 - up) + 0.18 * up;
    stall = 0.5 * cue(t, e("Then"), 20); buffet = Math.sin(t * 2.3) * 0.012 * cue(t, e("shaker"), 6);
  }
  if (mode === "stall") { stall = 1; buffet = Math.sin(t * 2.9) * 0.02; pitch = 0.22; roll = -0.5 * cue(t, e("give"), 12, (x) => x * x); }
  if (mode === "roll") {
    const rose = cue(t, e("rose"), 24), left = cue(t, e("dropped"), 26), right = cue(t, e("whipped"), 34), nose = cue(t, e("right"), 30);
    pitch = 0.05 + 0.3 * rose - 0.25 * right - 0.35 * nose;
    roll = -0.785 * left * (1 - right) + 1.83 * right;
    stall = 0.6 + 0.4 * rose; buffet = Math.sin(t * 2.7) * 0.015;
  }
  pitch += buffet;
  const fallY = mode === "roll" ? -3 * cue(t, e("right"), 40, (x) => x * x) : 0;

  const S = mode === "approach" || air ? null : mode === "stall" ? SHOTS.wing! : mode === "roll" ? SHOTS.side! : SHOTS.far!;
  let keys: CamKey[];
  if (mode === "hook") { stall = 0.45; pitch = 0.12 - 0.2 * cue(t, e("push"), 14) + 0.06 * cue(t, e("down"), 30); buffet = Math.sin(t * 2.5) * 0.008; }
  if (mode === "how") {
    stall = 0.3 + 0.4 * cue(t, e("wing"), 20); buffet = Math.sin(t * 3.1) * 0.012 * (cue(t, e("shakes"), 6) - cue(t, e("machine"), 6));
    pitch = 0.12 - 0.22 * cue(t, e("forward"), 14);
  }
  if (mode === "loop") { stall = 0.45 * cue(t, e("channel"), 20); pitch = 0.1 + 0.02 * Math.sin(t / 20); }
  if (mode === "crash" && !ground) { roll = 1.83 * cue(t, e("rolled"), 30); pitch = 0.05 - 0.45 * cue(t, e("dived"), 24); stall = 1; }
  if (mode === "hook" || mode === "loop") {
    // beside the airliner in the snowy cloud; the hook pushes in to the nose as it dips, the loop drifts back to frame 1
    const at = mode === "hook" ? e("push") : e("channel");
    keys = mode === "hook" ? [
      { f: 0, pos: [6.2, 1.1, 7.4], look: [0.6, 0.2, 0], fov: 48 },
      { f: Math.max(1, at - 4), pos: [6.0, 1.05, 7.1], look: [0.7, 0.2, 0], fov: 48 },
      { f: at + 18, pos: [3.6, 0.7, 4.4], look: [1.6, 0.2, 0], fov: 46 },
      { f: end + 10, pos: [3.5, 0.7, 4.2], look: [1.7, 0.15, 0], fov: 46 },
    ] : [
      { f: 0, pos: [7.2, 1.4, 8.4], look: [0.2, 0.2, 0], fov: 50 },
      { f: Math.max(1, at - 4), pos: [6.4, 1.2, 7.6], look: [0.2, 0.2, 0], fov: 50 },
      { f: at + 18, pos: [5.3, 1.0, 6.5], look: [0.2, 0.2, 0], fov: 48 },
      { f: end + 10, pos: [5.2, 1.0, 6.4], look: [0.2, 0.2, 0], fov: 48 },
    ];
  } else if (mode === "how") {
    // along the fuselage at the lit cockpit, to the high wing on "wing", pulled out on "forward" as the nose goes down
    const a1 = e("wing"), a2 = e("forward");
    keys = [
      { f: 0, pos: [4.4, 1.0, 3.6], look: [2.4, 0.3, 0], fov: 46 },
      { f: Math.max(1, a1 - 4), pos: [3.8, 1.2, 3.9], look: [1.8, 0.3, 0.2], fov: 46 },
      { f: a1 + 20, pos: [2.4, 1.6, 4.6], look: [0.4, 0.3, 1.5], fov: 46 },
      { f: Math.max(a1 + 21, a2 - 4), pos: [2.2, 1.4, 4.2], look: [0.4, 0.25, 1.6], fov: 46 },
      { f: a2 + 22, pos: [7.2, 1.2, 8.4], look: [0, 0, 0], fov: 50 },
      { f: end + 10, pos: [7.6, 1.3, 8.8], look: [0, -0.1, 0], fov: 50 },
    ];
  } else if (mode === "approach") {
    // wide from below the approach path, tilt up to the airliner on "shaker", push in under its nose on "pusher"
    const a1 = e("shaker"), a2 = e("pusher");
    keys = [
      { f: 0, pos: [5.6, -5.2, 11.5], look: [0, -0.8, 0], fov: 50 },
      { f: Math.max(1, a1 - 4), pos: [5.3, -5.0, 11.0], look: [0, -0.5, 0], fov: 50 },
      { f: a1 + 22, pos: [4.6, -4.2, 9.5], look: [0, 0.2, 0], fov: 48 },
      { f: Math.max(a1 + 23, a2 - 4), pos: [4.3, -3.9, 9.0], look: [0, 0.2, 0], fov: 48 },
      { f: a2 + 20, pos: [3.6, -2.6, 7.0], look: [0.6, 0.2, 0], fov: 48 },
      { f: end + 10, pos: [3.4, -2.5, 6.7], look: [0.6, 0.3, 0], fov: 48 },
    ];
  } else if (mode === "stall") {
    // extreme under the wing, pulled wide on "wide"
    const at = e("wide");
    keys = [
      { f: 0, pos: [1.5, -0.9, 3.1], look: [0.4, 0.45, 1.8], fov: 44 },
      { f: Math.max(1, at - 2), pos: [1.4, -0.85, 2.95], look: [0.4, 0.45, 1.8], fov: 44 },
      { f: at + 24, pos: [7.5, 1.6, 8.8], look: [0, -0.2, 0], fov: 50 },
      { f: end + 10, pos: [8.2, 1.9, 9.4], look: [0, -0.3, 0], fov: 50 },
    ];
  } else if (mode === "crash") {
    // side-on as it rolls onto its side and dives, cut far above the town on "house", then down into the street on "killed"
    const f = SHOTS.far!, s = SHOTS.street!, sd = SHOTS.side!;
    const at = e("killed"), hs = e("house");
    keys = [
      { f: 0, pos: sd.a, look: sd.la, fov: sd.fov },
      { f: Math.max(1, hs - 1), pos: sd.b, look: [0, -1.2, 0], fov: sd.fov },
      { f: hs, pos: f.a, look: f.la, fov: f.fov },
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
    <DisasterStage look={ground ? "storm" : "blueprint"} floor={false} dof={ground ? 0.6 : 0.9} shadowBox={30} light={ground ? 0.45 : 0.7}
      backdrop={ground ? { top: "#0c1218", bottom: "#2a3440" } : { top: "#202933", bottom: "#4a545e" }}
      fog={ground ? { color: "#141b22", near: 12, far: 70 } : { color: "#3b444d", near: 7, far: 34 }} vignette={0.55} bloom={0.75}
      overlay={
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <HonestyTag t={t} tag={mode === "stall" ? "paused" : "reconstruction"} at={0} />
          {mode === "approach" && <Chip t={t} at={e("Buffalo")} text="NEAR BUFFALO · ON APPROACH" top={300} size={44} />}
          {mode === "approach" && <Chip t={t} at={e("February")} text={`FEB ${fig("year")} · NIGHT`} top={390} size={44} color={ICE} border={ICE} />}
          {mode === "approach" && <Readout x={70} y={500} label="SHAKER FIRED · KNOTS" k={cue(t, e("shaker"), 6)} value={countText(fig("speed"), 1)} color={AMBER} />}
          {mode === "approach" && <Chip t={t} at={e("pusher")} text="PUSHER FIRED: NOSE DOWN" top={720} size={46} color={GREEN} border={GREEN} />}
          {mode === "approach" && t >= e("nose") && <StampHtml t={t} at={e("nose")} text="NOSE UP?" x={110} y={830} size={80} />}
          {mode === "stall" && <Chip t={t} at={e("give")} text="THE WING STALLS" top={300} size={56} color={RED} border={RED} />}
          {mode === "roll" && <Readout x={70} y={300} label="LEFT WING DOWN · DEG" k={cue(t, e("dropped"), 12)} value={countText(fig("left"), cue(t, e("dropped"), 20))} color={AMBER} />}
          {mode === "roll" && <Readout x={70} y={540} label="RIGHT WING DOWN · DEG" k={cue(t, e("whipped"), 12)} value={countText(fig("right"), cue(t, e("whipped"), 24))} color={RED} />}
          {mode === "crash" && <Chip t={t} at={e("rolled")} text="ONTO ITS SIDE, DIVING" top={300} size={50} color={RED} border={RED} />}
          {mode === "hook" && <Chip t={t} at={-60} text={`FEB ${fig("day")}, ${fig("year")} · NEAR BUFFALO`} top={300} size={44} />}
          {mode === "hook" && <Chip t={t} at={e("Colgan")} text="COLGAN AIR" top={385} size={50} color={AMBER} border={AMBER} />}
          {mode === "hook" && <Readout x={70} y={480} label="AIRSPEED · KNOTS" k={1} value={countText(fig("speed"), 1)} color={AMBER} />}
          {mode === "hook" && <Chip t={t} at={e("push")} text="STICK PUSHER: NOSE DOWN" top={740} size={46} color={GREEN} border={GREEN} />}
          {mode === "how" && <Chip t={t} at={e("save")} text="WHY DIDN'T IT WORK?" top={300} size={48} color={AMBER} border={AMBER} />}
          {mode === "how" && <Chip t={t} at={e("shakes")} text="FIRST: COLUMN SHAKES" top={400} size={46} color={AMBER} border={AMBER} />}
          {mode === "how" && <Chip t={t} at={e("lift")} text="WING NEAR A STALL" top={490} size={46} color={RED} border={RED} />}
          {mode === "how" && <Chip t={t} at={e("machine")} text="THEN: PUSHER" top={580} size={46} color={GREEN} border={GREEN} />}
          {mode === "how" && <Chip t={t} at={e("forward")} text="NOSE DOWN" top={670} size={46} color={GREEN} border={GREEN} />}
          {mode === "loop" && <Chip t={t} at={e("Machine")} text="MACHINE" top={300} size={56} color={GREEN} border={GREEN} />}
          {mode === "loop" && <Chip t={t} at={e("pilot")} text="OR PILOT?" top={400} size={56} color={AMBER} border={AMBER} />}
          {mode === "loop" && <Chip t={t} at={e("channel")} text="FULL STORY ON THE CHANNEL" top={500} size={44} />}
          {ground && <Chip t={t} at={e("house")} text="CLARENCE CENTER, NEW YORK" top={400} size={44} color={ICE} border={ICE} />}
          {ground && <Readout x={70} y={540} label="ABOARD · KILLED" k={cue(t, e("aboard") - 10, 6)} value={countText(fig("aboard"), 1)} />}
          {ground && <Readout x={70} y={790} label="ON THE GROUND" k={cue(t, e("ground") - 8, 6)} value={countText(fig("ground"), 1)} />}
          {dark > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dark})` }} />}
          {silent > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.3 * silent})` }} />}
        </AbsoluteFill>
      }>
      <Camera3D keys={keys} frame={t} drift={0.025} />
      <Focus at={ground ? [30, 1, -1] : mode === "stall" ? [0.4, 0.2, 1.6] : mode === "approach" || air ? [-0.4, 0.2, 0] : [0, 0, 0]} range={ground ? 40 : 6} />
      <directionalLight position={[10, 30, 12]} intensity={ground ? 0.22 : 0.9} color="#d8e2ec" castShadow />
      <ambientLight intensity={ground ? 0.12 : 0.45} color={ground ? "#55657a" : "#8a99aa"} />
      {!ground && <Q400 position={[0, fallY, 0]} pitch={pitch} roll={roll} frame={t} prop={0.9} gear={1} ice={0.2} stall={stall} lights={0.8} flaps={1} />}
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
