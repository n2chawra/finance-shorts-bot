// Sky (3D, the shared world): every beat set around the airliner or the street where it came down. Params pick
// the camera move (`shot`: a start pose to an end pose across the beat) and the world (`phase`: night, cruise,
// gate, stall, ground), what happens on which word (gearAt, stallAt, pitchAt, rollAt, rollBackAt, rollRightAt,
// noseDownAt, dropAt, iceAt, glowWingAt, bootsAt, takeoffAt, propSlowAt, glowAt, rescueAt) and the plates that
// carry the beat's figures (`tag`, `tag2`, the date caption, the chapter card). Figures come only from params.fig.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, CloudDeck, cue, DisasterStage, Focus, glow, Label3D, Rain, Rescuers, rnd, type CamKey, type V3 } from "../../three/index";
import { Q400, RunwayLights, Ramp, Town } from "./q400";
import { ChapterCard, figOf, ICE, kitClock, MonoCaption, moments, Overlay, Readout, RED, Transcript } from "./ui";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov?: number };
const SHOTS: Record<string, Shot> = {
  hook: { a: [4.8, 0.5, 4.0], la: [0.4, 0.1, 0], b: [6.4, 1.4, 7.6], lb: [0, -0.4, 0], fov: 42 },
  approach: { a: [6.2, -0.6, 5.2], la: [0.4, 0, 0], b: [4.6, -0.4, 4.0], lb: [0.2, -0.1, 0], fov: 42 },
  roll: { a: [5.4, 1.1, 5.6], la: [0, 0, 0], b: [7, 3.5, 9], lb: [2, -6, -3], fov: 44 },
  gate: { a: [10, 3.2, 9], la: [0, 1, -1], b: [7.5, 2.4, 7], lb: [0.4, 0.9, -1], fov: 42 },
  takeoff: { a: [-4, 1.6, 12], la: [2, 1, 0], b: [4, 2.6, 13], lb: [12, 3, 0], fov: 44 },
  cruise: { a: [6, 1.8, 6.5], la: [0, 0, 0], b: [4.6, 1.2, 5.2], lb: [0.3, 0, 0], fov: 42 },
  wing: { a: [2.6, 1.4, 4.8], la: [0.5, 0.3, 1.4], b: [2.1, 1.2, 4.1], lb: [0.5, 0.3, 1.6], fov: 40 },
  nose: { a: [3.4, 0.45, 1.2], la: [2.3, 0.1, 0], b: [1.8, 1.0, 2.8], lb: [0.6, 0.3, 1.4], fov: 40 },
  level: { a: [1.2, 0.7, 7.5], la: [0, 0, 0], b: [-0.4, 0.5, 6.4], lb: [0, 0, 0], fov: 40 },
  stallside: { a: [0.6, 0.8, 7.4], la: [0, 0, 0], b: [-0.6, 0.9, 8.6], lb: [0, -0.3, 0], fov: 42 },
  over: { a: [5, 1.4, 5.5], la: [0, 0, 0], b: [8, 3.2, 9.5], lb: [0, -1.4, 0], fov: 42 },
  far: { a: [-34, 15, 24], la: [22, 0, -2], b: [-30, 12.5, 21], lb: [24, 0, -2], fov: 44 },
  street: { a: [14, 1.1, 0.5], la: [28, 0.8, 0], b: [16.5, 1.0, 0.4], lb: [29, 0.8, 0], fov: 44 },
  rise: { a: [9, 1.4, 6], la: [16, 0.6, 2.2], b: [4, 14, 20], lb: [30, 0, -2], fov: 46 },
  loop: { a: [9.5, 1.6, 9.5], la: [0, 0, 0], b: [5.2, 0.6, 4.4], lb: [0.4, 0.1, 0], fov: 42 },
  side: { a: [0.4, 0.3, 6.4], la: [0, 0, 0], b: [-0.3, 0.2, 5.8], lb: [0, 0, 0], fov: 40 },
  window: { a: [3.6, 0.55, 1.6], la: [2.3, 0.15, 0], b: [3.0, 0.5, 1.9], lb: [2.0, 0.15, 0], fov: 38 },
  pull: { a: [4.4, 0.2, 2.4], la: [2.0, 0.1, 0], b: [5.2, 0.4, 3.4], lb: [1.6, 0.4, 0], fov: 40 },
  flaps: { a: [-1.6, 0.9, 2.6], la: [0.1, 0.25, 1.1], b: [-1.3, 0.75, 2.1], lb: [0.1, 0.25, 1.2], fov: 40 },
  descent: { a: [-7, 2.6, 9], la: [0.5, -0.6, 0], b: [-4.5, 1.6, 10], lb: [1.5, -1.2, 0], fov: 46 },
  orbit: { a: [7, 1.2, 4], la: [0, 0, 0], b: [1.5, 1.6, 8.2], lb: [0, 0, 0], fov: 40 },
};

type Tag = { at: string; fig: string; label: string };
type Params = {
  shot?: string; phase?: string; caption?: string; chapter?: string; tag?: Tag; tag2?: Tag;
  gearAt?: string; stallAt?: string; pitchAt?: string; rollAt?: string; rollBackAt?: string; rollRightAt?: string; noseDownAt?: string; dropAt?: string;
  iceAt?: string; glowWingAt?: string; bootsAt?: string; takeoffAt?: string; propSlowAt?: string; glowAt?: string; rescueAt?: string;
  labels?: { at: string; text: string; sub?: string }[]; quote?: { at: string; text: string; who: string }; note?: { at: string; text: string };
  candles?: boolean; silence?: boolean; checks?: { at: string; text: string }[];
  inset?: string;
  chapters?: boolean; aoaLabel?: string; talkAt?: string; sterileAt?: string; noseCreepAt?: string; pullCard?: boolean; pusherAt?: string; pullbackAt?: string; againAt?: string; flapsAt?: string;
};

const Sky: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (name?: string) => (name && ev[name] !== undefined ? ev[name]! : 1e9);
  const fig = (n?: string) => figOf(p, n);
  const end = Math.max(m.end, 30);
  const S = SHOTS[P.shot ?? "level"] ?? SHOTS.level!;
  const phase = P.phase ?? "night";
  const ground = phase === "ground";
  const gate = phase === "gate";
  const cruise = phase === "cruise";
  const studio = phase === "studio";
  const air = !ground && !gate && !studio;

  // the airliner's attitude and place, all on the spoken words
  const pitchK = P.pitchAt ? cue(t, e(P.pitchAt), 26) : 0;
  const rollK = P.rollAt ? cue(t, e(P.rollAt), 30) : 0;
  const backK = P.rollBackAt ? cue(t, e(P.rollBackAt), 30) : 0;
  const rightK = P.rollRightAt ? cue(t, e(P.rollRightAt), 40) : 0;
  const downK = P.noseDownAt ? cue(t, e(P.noseDownAt), 30) : 0;
  const dropK = P.dropAt ? cue(t, e(P.dropAt), 34, (x) => x * x) : 0;
  // the stick pusher fights: down on the push, back up on the pull, twice more
  const pushK = P.pusherAt ? cue(t, e(P.pusherAt), 10) : 0;
  const backUpK = P.pullbackAt ? cue(t, e(P.pullbackAt), 12) : 0;
  const againK = P.againAt ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - e(P.againAt)) / 40)) * Math.PI * 2)) : 0;
  const creepK = P.noseCreepAt ? cue(t, e(P.noseCreepAt), 60, (x) => x) : 0;
  let pitch = (P.shot === "side" ? 0.22 : 0.32) * pitchK - 0.5 * downK - 0.6 * dropK - 0.35 * pushK * (1 - backUpK) + 0.25 * backUpK - 0.3 * againK + 0.12 * creepK;
  if (P.pusherAt) pitch += 0.2;
  let roll = -0.785 * rollK * (1 - backK) + 0.35 * backK + 1.83 * rightK;
  if (P.shot === "hook") roll = -0.5 * cue(t, e(P.stallAt) + 10, 30) * (1 - dropK) + 0.9 * dropK;
  if (P.shot === "over") pitch -= 0.15;
  const buffet = P.stallAt && t >= e(P.stallAt) && P.shot !== "loop" ? Math.sin(t * 2.7) * 0.012 : 0;
  pitch += buffet;
  if (cruise) pitch = 0.05 + 0.08 * (1 - cue(t, e("levelled"), 30));
  const gearK = gate ? 1 : P.gearAt ? cue(t, e(P.gearAt), 30) : phase === "stall" ? 1 : 0;
  const iceK = P.iceAt ? 0.15 + 0.85 * cue(t, e(P.iceAt), 60, (x) => x) : phase === "stall" || phase === "night" ? 0.35 : 0;
  const stallK = P.stallAt ? (P.shot === "loop" ? 0.7 * Math.max(0, Math.sin(Math.min(1, (t - e(P.stallAt)) / 30) * Math.PI)) * (t >= e(P.stallAt) ? 1 : 0) : cue(t, e(P.stallAt), 14)) : phase === "stall" ? 0.5 + 0.5 * pitchK : 0;
  const wingGlow = P.flapsAt ? 0.7 * cue(t, e("lift"), 16) : 0;
  const flapsK = P.flapsAt ? 1 - cue(t, e(P.flapsAt), Math.max(20, e("asked") - e(P.flapsAt) + 10)) : 0;
  const boots = P.bootsAt && t >= e(P.bootsAt) ? t - e(P.bootsAt) : -1;
  const propK = P.propSlowAt ? 0.9 - 0.45 * cue(t, e(P.propSlowAt), 30) : gate && P.shot === "gate" ? 0.25 + 0.6 * cue(t, e("turboprop"), 30) : 0.9;
  const takeK = P.takeoffAt ? cue(t, e(P.takeoffAt), Math.max(40, end - e(P.takeoffAt)), (x) => x * x) : 0;
  const planePos: V3 = gate
    ? (P.takeoffAt ? [-8 + 34 * takeK, 0.55 + 6 * Math.max(0, takeK - 0.45) ** 1.4, 0] : [0, 0.55, 0])
    : [0, -14 * dropK, -2 * dropK];
  const planePitch = gate ? (P.takeoffAt ? 0.16 * cue(t, e(P.takeoffAt) + 40, 20) : 0) : pitch;
  // the camera: a move from a to b; the takeoff follows the plane, the drop holds while the plane falls away
  const follow = P.takeoffAt ? planePos : ([0, 0, 0] as V3);
  const keys: CamKey[] = [
    { f: 0, pos: [S.a[0] + follow[0] * 0.6, S.a[1], S.a[2]], look: [S.la[0] + follow[0], S.la[1] + follow[1] * 0.5, S.la[2]], fov: S.fov ?? 42 },
    { f: end + 10, pos: [S.b[0] + follow[0] * 0.6, S.b[1], S.b[2]], look: [S.lb[0] + follow[0], S.lb[1] + follow[1] * 0.5, S.lb[2]], fov: S.fov ?? 42 },
  ];
  const glowK = P.glowAt ? cue(t, e(P.glowAt), 24) : ground ? 1 : 0;
  const rescueK = P.rescueAt ? cue(t, e(P.rescueAt), 40) : 0;
  const dark = dropK > 0.7 ? (dropK - 0.7) / 0.3 : 0;
  const bg = studio ? { top: "#1e252c", bottom: "#0b0f14" } : ground ? { top: "#0c1218", bottom: "#2a3440" } : gate ? { top: "#0e151d", bottom: "#29323c" } : cruise ? { top: "#06101e", bottom: "#24364c" } : { top: "#232b34", bottom: "#4a545e" };
  const fog = phase === "stall" ? { color: "#3b444d", near: 8, far: 70 } : studio ? { color: "#0b0f14", near: 12, far: 40 } : ground ? { color: "#1c242c", near: 30, far: 120 } : gate ? { color: "#222a32", near: 14, far: 70 } : cruise ? { color: "#1b2a3c", near: 20, far: 90 } : { color: "#3b444d", near: 5, far: 26 };
  const snowCenter: V3 = ground ? [20, 4, 0] : gate ? [planePos[0], 3, 3] : [2, 0.5, 2];
  return (
    <DisasterStage look="storm" floor={false} dof={air ? 0.9 : 0.6} shadowBox={30} light={ground ? 0.45 : gate ? 0.55 : cruise ? 0.6 : 0.7} backdrop={bg} fog={fog} vignette={0.55} bloom={0.75}
      overlay={
        <Overlay>
          {P.caption === "date" && <MonoCaption t={t} at={P.shot === "loop" ? e("comments") - 10 : -80} text={`FEB ${fig("day")}, ${fig("year")} · NEAR BUFFALO, NEW YORK`} size={34} />}
          {P.caption === "date" && <MonoCaption t={t} at={P.shot === "loop" ? e("comments") : 6} text="TWIN-TURBOPROP AIRLINER · ON APPROACH" top={164} size={30} color={ICE} />}
          {P.stallAt && P.shot === "hook" && t >= e(P.stallAt) && Math.floor(t / 6) % 2 === 0 && <div style={{ position: "absolute", left: 1320, top: 160, fontFamily: "Anton, Poppins, sans-serif", fontSize: 110, color: RED, letterSpacing: 8, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>STALL</div>}
          {P.shot === "roll" && t >= e("minute") && <MonoCaption t={t} at={e("minute")} text="UNDER HALF A MINUTE" top={170} left={1180} size={36} color="#ffd27a" />}
          {P.tag && <Readout x={1180} y={P.shot === "roll" ? 260 : 150} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} />}
          {P.tag2 && <Readout x={1180} y={420} label={P.tag2.label} k={cue(t, e(P.tag2.at), 12)} value={countText(fig(P.tag2.fig), cue(t, e(P.tag2.at), 20))} />}
          {P.chapter && <ChapterCard t={t} text={P.chapter} />}
          {P.quote && <Transcript t={t} at={e(P.quote.at)} text={P.quote.text} who={P.quote.who} x={1120} y={600} />}
          {P.note && <MonoCaption t={t} at={e(P.note.at)} text={P.note.text} top={170} left={1100} size={40} color="#ffd27a" />}
          {ground && P.shot === "far" && <MonoCaption t={t} at={e("Center")} text="CLARENCE CENTER, NEW YORK" top={170} left={246} size={38} color="#ffd27a" />}
          {P.inset && <Inset t={t} e={e} mode={P.inset} speed={fig("speed")} secs={fig("secs")} hh={fig("hh")} mm={fig("mm")} ss={fig("ss")} endS={fig("end")} end={end} />}
          {P.chapters && <ChapterLamps t={t} e={e} />}
          {P.aoaLabel && t >= e(P.aoaLabel) && <MonoCaption t={t} at={e("attack")} text="ANGLE OF ATTACK" top={200} left={1150} size={44} color="#ffd27a" />}
          {P.aoaLabel && t >= e(P.aoaLabel) && <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><path d={`M 1240 560 L 760 560 M 1240 560 L ${1240 - 480 * Math.cos(0.22 * pitchK)} ${560 - 480 * Math.sin(0.22 * pitchK)}`} stroke="#ffd27a" strokeWidth={6} strokeDasharray="18 12" fill="none" /><path d={`M 900 560 A 340 340 0 0 1 ${1240 - 340 * Math.cos(0.22 * pitchK)} ${560 - 340 * Math.sin(0.22 * pitchK)}`} stroke="#ffd27a" strokeWidth={9} fill="none" /></svg>}
          {P.talkAt && t >= e(P.talkAt) && <Bubbles t={t} at={e(P.talkAt)} />}
          {P.sterileAt && <div style={{ position: "absolute", left: 1150, top: 170, padding: "10px 26px", border: `5px solid ${t >= e(P.sterileAt) ? RED : ICE}`, background: t >= e(P.sterileAt) && Math.floor(t / 6) % 2 === 0 ? "rgba(90,20,16,0.9)" : "rgba(8,12,18,0.85)", fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 44, color: t >= e(P.sterileAt) ? RED : ICE }}>STERILE COCKPIT</div>}
          {P.pullCard && <BigCard t={t} at={e("pulled")} text="COLUMN BACK" color={RED} top={170} />}
          {P.pullCard && <BigCard t={t} at={e("power")} text="POWER UP" color="#ffd27a" top={330} />}
          {P.pullCard && t >= e("full") && <div style={{ position: "absolute", left: 1500, top: 330, transform: `rotate(-8deg) scale(${1.6 - 0.6 * Math.min(1, (t - e("full")) / 6)})`, border: `6px solid ${RED}`, color: RED, fontFamily: "Anton, Poppins, sans-serif", fontSize: 60, padding: "0 16px", background: "rgba(8,12,18,0.9)" }}>NOT FULL</div>}
          {P.pusherAt && <Tally t={t} ats={[e(P.pusherAt), e(P.againAt), e(P.againAt) + 22]} pullAt={e(P.pullbackAt)} />}
          {(P.checks ?? []).map((c, i) => t >= e(c.at) && <MonoCaption key={i} t={t} at={e(c.at)} text={`✓ ${c.text}`} top={200 + i * 70} left={1200} size={38} color="#5fd38a" />)}
          {dark > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.25 * dark})` }} />}
          {P.silence && t < e("house") && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.35 * (1 - cue(t, e("house") - 20, 20))})` }} />}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.025} />
      <Focus at={ground ? [28, 1, -1] : gate && P.takeoffAt ? planePos : [0, 0, 0]} range={ground ? 40 : 6} />
      <directionalLight position={[10, 30, 12]} intensity={ground ? 0.35 : cruise ? 0.7 : 0.9} color={cruise ? "#bcd2ff" : "#d8e2ec"} castShadow />
      <ambientLight intensity={ground ? 0.22 : cruise ? 0.3 : 0.45} color={ground ? "#55657a" : "#8a99aa"} />
      {/* the airliner */}
      {studio && <mesh rotation-x={-Math.PI / 2} position={[0, -1.4, 0]} material={glow("#2a3139", 0.6)}><circleGeometry args={[6, 48]} /></mesh>}
      {studio && <spotLight position={[0, 9, 3]} intensity={30} angle={0.5} penumbra={0.7} distance={25} color="#dfe8f2" />}
      {(air || gate || studio) && (
        <Q400 flaps={flapsK} position={planePos} pitch={planePitch} roll={roll} yaw={studio ? t * 0.004 : 0} frame={t} prop={studio ? 0.05 : propK} gear={gearK} ice={iceK} stall={Math.max(stallK, wingGlow)} boots={boots}
          lights={gate || P.shot === "approach" || P.shot === "level" || P.shot === "loop" ? 1 : 0.7} />
      )}
      {/* the sky: cloud, snow streaking past, the town's lights far below, a moon above the cloud */}
      {air && !cruise && <CloudDeck frame={t} y={-5 - 10 * dropK} size={140} cover={0.85} puffs={50} wind={[-0.25, 0.02]} />}
      {air && !cruise && P.shot !== "hook" && <CloudDeck frame={t + 400} y={7} size={140} cover={0.9} puffs={30} wind={[-0.2, 0.01]} seed="ceiling" />}
      {cruise && <CloudDeck frame={t} y={-3} size={160} cover={0.95} puffs={70} wind={[-0.3, 0.02]} seed="tops" />}
      {cruise && <mesh position={[-40, 26, -60]} material={glow("#f4f1e4", 1)}><sphereGeometry args={[2.2, 24, 16]} /></mesh>}
      {cruise && Array.from({ length: 90 }, (_, i) => <mesh key={i} position={[-90 + rnd("sx", i) * 180, 14 + rnd("sy", i) * 40, -80 - rnd("sz", i) * 30]} material={glow("#ffffff", 0.4 + 0.6 * rnd("sb", i))}><sphereGeometry args={[0.12, 5, 4]} /></mesh>)}
      {air && !cruise && <Rain frame={t} center={snowCenter} size={[16, 8, 14]} count={700} length={0.09} speed={0.06} wind={[-0.45, 0.03]} color="#f2f6fa" opacity={0.75} seed="snow" />}
      {air && !cruise && P.shot !== "nose" && P.shot !== "wing" && P.shot !== "window" && P.shot !== "flaps" && Array.from({ length: 160 }, (_, i) => (
        <mesh key={`g${i}`} position={[-70 + rnd("tx", i) * 140, -32 - 14 * dropK, -70 + rnd("tz", i) * 120]} material={glow(rnd("tc", i) > 0.8 ? "#fff2cf" : "#ffc46b", 0.5 + 0.5 * rnd("tb", i))}>
          <sphereGeometry args={[0.18, 5, 4]} />
        </mesh>
      ))}
      {air && P.glowAt && glowK > 0 && <mesh position={[3, -9, -4]} material={glow("#ff8a3a", 0.85 * glowK)}><sphereGeometry args={[1.6, 16, 12]} /></mesh>}
      {air && P.glowAt && glowK > 0 && <pointLight position={[3, -7, -4]} intensity={25 * glowK} distance={30} color="#ff7a2a" />}
      {air && P.glowAt && glowK > 0 && Array.from({ length: 30 }, (_, i) => <mesh key={`h${i}`} position={[-6 + (i % 10) * 1.6, -9.6, -8 + Math.floor(i / 10) * 2.4]} material={glow("#ffc46b", 0.7)}><boxGeometry args={[0.5, 0.25, 0.4]} /></mesh>)}
      {/* the ramp and the runway at Newark */}
      {gate && <Ramp frame={t} />}
      {gate && <Rain frame={t} center={[planePos[0] * 0.5, 3, 2]} size={[30, 8, 16]} count={900} length={0.12} speed={0.07} wind={[0.22, 0.02]} color="#f2f6fa" opacity={0.7} seed="ramp" />}
      {gate && P.takeoffAt && Array.from({ length: 40 }, (_, i) => [-1.4, 1.4].map((z) => <mesh key={`${i}${z}`} position={[-20 + i * 2, 0.04, z]} material={glow("#fff6dc", 1)}><sphereGeometry args={[0.07, 6, 4]} /></mesh>))}
      {gate && P.takeoffAt && [[-20, -16], [-28, -16], [-36, -16]].map(([x, z], i) => <mesh key={`w${i}`} position={[x!, 0.6, z!]} material={glow("#fff4d6", 0.8)}><sphereGeometry args={[0.12, 8, 6]} /></mesh>)}
      {/* the street in Clarence Center */}
      {ground && <Town frame={t} glowK={glowK} engines={P.rescueAt ? rescueK : P.shot === "far" ? 0 : 1} />}
      {ground && <Rain frame={t} center={P.shot === "far" ? [0, 8, 0] : [18, 3, 2]} size={P.shot === "far" ? [60, 16, 40] : [20, 8, 12]} count={900} length={0.1} speed={0.05} wind={[0.03, 0.01]} color="#f2f6fa" opacity={0.7} seed="town" />}
      {ground && <RunwayLights position={[78, 0, -40]} frame={t} rot={0.4} />}
      {ground && P.rescueAt && <Rescuers position={[24, 0, 0.6]} spots={[[-1.2, 0, 0.2], [-0.4, 0, -0.3], [0.5, 0, 0.3], [1.3, 0, -0.1]]} height={0.42} enterAt={K(e(P.rescueAt))} enterFrom={-4} lamps />}
      {ground && P.candles && Array.from({ length: 12 }, (_, i) => (
        <group key={`c${i}`} position={[11 + (i % 6) * 0.22, 0, 2.3 + Math.floor(i / 6) * 0.25]}>
          <mesh position={[0, 0.05, 0]} material={glow("#f6efe0", 0.9)}><cylinderGeometry args={[0.03, 0.03, 0.1, 8]} /></mesh>
          <mesh position={[0, 0.13 + 0.01 * Math.sin(t * 0.5 + i), 0]} material={glow("#ffb347", 0.75 + 0.25 * Math.sin(t * 0.7 + i * 1.7))}><sphereGeometry args={[0.025, 6, 4]} /></mesh>
        </group>
      ))}
      {ground && P.candles && <pointLight position={[11.5, 0.6, 2.5]} intensity={1.6} distance={4} color="#ffb347" />}
      {/* labels pinned on the model */}
      {(P.labels ?? []).map((l, i) => t >= e(l.at) && (
        <Label3D key={i} at={i === 0 ? [1.2, 0.85, 0.82] : i === 1 ? [-1, 0.3, 0.3] : [-3.2, 1.6, 0]} offset={i === 0 ? [1.4, 1.2, 0.4] : i === 1 ? [0.4, 1.6, 0.6] : [-0.4, 1.4, 0.6]}
          text={l.text} sub={l.sub} start={K(e(l.at))} color="#ffffff" px={42} />
      ))}
    </DisasterStage>
  );
};

/** The captain's airspeed display as an inset over the 3D: the tape with the red-and-black band (rising on
 * its word), the speed box (the beat's figure), the STALL flag and the flight clock (from the figures). */
const Inset: React.FC<{ t: number; e: (n?: string) => number; mode: string; speed: string; secs: string; hh: string; mm: string; ss: string; endS: string; end: number }> = ({ t, e, mode, speed, secs, hh, mm, ss, endS, end }) => {
  const num = (s: string) => { const v = parseFloat(s.replace(/,/g, "")); return Number.isFinite(v) ? v : 0; };
  const bandK = mode === "cue" ? cue(t, e("band"), Math.max(30, end - e("band") - 10)) : 1;
  const bandY = 470 - 300 * bandK;
  const stall = (mode === "shaker" && t >= e("shaker")) || mode === "clock";
  const base = num(hh) * 3600 + num(mm) * 60;
  const sec = mode === "clock" ? base + num(ss) + (num(endS) - num(ss)) * cue(t, e("shaker"), Math.max(10, e("end") - e("shaker")), (x) => x) : base + num(ss);
  const stopped = mode === "clock" && t >= e("end");
  const red = mode !== "cue" || t >= e("falling");
  const shake = mode === "shaker" && t >= e("shaker") ? Math.sin(t * 3.1) * 5 : 0;
  const clockText = (s: number) => { const v = Math.floor(s); return `${String(Math.floor(v / 3600) % 24).padStart(2, "0")}:${String(Math.floor(v / 60) % 60).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`; };
  return (
    <div style={{ position: "absolute", left: 1130 + shake, top: 150, width: 620, height: 560, background: "rgba(5,8,12,0.92)", border: "6px solid #59636d", borderRadius: 24 }}>
      <svg width={608} height={548} style={{ position: "absolute", inset: 0 }}>
        <text x={30} y={46} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={30} fill="#d6dde3">CAPTAIN'S AIRSPEED</text>
        <rect x={40} y={70} width={170} height={420} fill="#1a2027" stroke="#8b96a1" strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => { const y = 80 + ((i * 36 + t * (mode === "cue" ? -1.6 : -0.4)) % 432 + 432) % 432; return <line key={i} x1={150} y1={y} x2={208} y2={y} stroke="#e8edf2" strokeWidth={4} />; })}
        {Array.from({ length: 14 }, (_, i) => bandY + i * 28 < 490 && <rect key={i} x={182} y={bandY + i * 28} width={24} height={Math.min(28, 490 - bandY - i * 28)} fill={i % 2 ? "#0b0b0b" : "#ff3b30"} />)}
        <path d="M 30 240 L 200 240 L 226 280 L 200 320 L 30 320 Z" fill="#05080c" stroke={red ? "#ff3b30" : "#e8edf2"} strokeWidth={5} />
        {speed && <text x={112} y={302} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={64} fill={red ? "#ff3b30" : "#ffffff"}>{speed}</text>}
        {stall && (Math.floor(t / 5) % 2 === 0 || mode === "clock") && <g><rect x={270} y={80} width={300} height={96} rx={8} fill="#ff3b30" /><text x={420} y={150} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={70} fill="#fff">STALL</text></g>}
        {mode === "cue" && t >= e("seconds") - 6 && <g><text x={270} y={240} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={30} fill="#ff9d2e">BAND IN VIEW</text><text x={270} y={320} fontFamily="Anton, Poppins, sans-serif" fontSize={80} fill="#ffffff">{`${secs} S`}</text></g>}
        {mode === "cue" && t >= e("band") && <path d={`M 250 ${bandY + 60} l 0 -70 m -22 22 l 22 -22 l 22 22`} stroke="#ff3b30" strokeWidth={9} fill="none" />}
        {(mode === "shaker" || mode === "clock") && <g><text x={270} y={250} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={30} fill="#d6dde3">EST · COCKPIT RECORDER</text><text x={270} y={330} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={64} fill={stopped ? "#ff3b30" : "#ffffff"}>{clockText(sec)}</text></g>}
        {mode === "shaker" && t >= e("autopilot") && <g><rect x={270} y={380} width={160} height={66} rx={8} fill="#1c1c1c" stroke="#555" strokeWidth={4} /><text x={350} y={426} textAnchor="middle" fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={38} fill="#666">AP OFF</text></g>}
        {mode === "clock" && <path d={Array.from({ length: 50 }, (_, i) => `${i ? "L" : "M"} ${270 + i * 6} ${430 + (stopped ? 0 : Math.sin(i * 1.7 + t * 0.6) * 22)}`).join(" ")} stroke={stopped ? "#ff3b30" : "#9fd3ff"} strokeWidth={4} fill="none" />}
        {mode === "clock" && t >= e("minute") && <text x={270} y={500} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={32} fill="#ff9d2e">UNDER HALF A MINUTE</text>}
      </svg>
    </div>
  );
};

const LAMPS: [string, string][] = [["flight", "THE FLIGHT"], ["wing", "THE WING"], ["ice", "THE ICE"], ["cue", "THE CUE"], ["last", "THE LAST HALF MINUTE"], ["findings", "THE FINDINGS"], ["law", "THE LAW"]];
/** The chapter index over the studio shot: seven lamps light on their words (the last half minute red). */
const ChapterLamps: React.FC<{ t: number; e: (n?: string) => number }> = ({ t, e }) => (
  <div style={{ position: "absolute", left: 246, top: 150, display: "flex", flexDirection: "column", gap: 16, background: "rgba(8,12,18,0.7)", padding: "22px 30px", borderRadius: 10 }}>
    {LAMPS.map(([k, name]) => {
      const on = Math.min(1, Math.max(0, (t - e(k)) / 8));
      return (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, opacity: 0.4 + 0.6 * on }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: on > 0 ? (k === "last" ? RED : "#ff9d2e") : "#2a3139", boxShadow: on > 0 ? `0 0 14px ${k === "last" ? RED : "#ff9d2e"}` : "none" }} />
          <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 40, color: "#ffffff", letterSpacing: 3 }}>{name}</div>
        </div>
      );
    })}
    {t >= e("law") + 6 && <div style={{ fontFamily: "Anton, Poppins, sans-serif", fontSize: 64, color: "#ff9d2e", marginTop: 10 }}>COLGAN AIR · THE BUFFALO CRASH</div>}
  </div>
);
/** Speech marks bobbing (talk shown, never its words). */
const Bubbles: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: Math.min(1, (t - at) / 8) }}>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${760 + i * 150} ${300 + (i % 2) * 70 + Math.sin(t * 0.22 + i * 1.9) * 12})`}>
        <path d="M 0 0 h 120 a 20 20 0 0 1 20 20 v 50 a 20 20 0 0 1 -20 20 h -64 l -28 30 l 0 -30 h -28 a 20 20 0 0 1 -20 -20 v -50 a 20 20 0 0 1 20 -20 z" fill="rgba(8,12,18,0.75)" stroke="#ffffff" strokeWidth={5} />
        {[0, 1, 2].map((d) => <circle key={d} cx={34 + d * 36} cy={45} r={9} fill="#ffffff" opacity={(Math.floor(t / 5) + d) % 3 === 0 ? 1 : 0.35} />)}
      </g>
    ))}
  </svg>
);
/** A big card slamming on over the 3D (the hero moment's action). */
const BigCard: React.FC<{ t: number; at: number; text: string; color: string; top: number }> = ({ t, at, text, color, top }) => {
  if (t < at) return null;
  const k = Math.min(1, (t - at) / 6);
  return <div style={{ position: "absolute", left: 1120, top, transform: `scale(${1.5 - 0.5 * k})`, transformOrigin: "left center", opacity: k, background: "rgba(8,12,18,0.9)", border: `6px solid ${color}`, padding: "8px 26px", fontFamily: "Anton, Poppins, sans-serif", fontSize: 92, color, letterSpacing: 3 }}>{text}</div>;
};
/** The pusher's tally: a green mark for each push, a red one for the pull against it. */
const Tally: React.FC<{ t: number; ats: number[]; pullAt: number }> = ({ t, ats, pullAt }) => (
  <div style={{ position: "absolute", left: 1150, top: 170, background: "rgba(8,12,18,0.85)", padding: "14px 24px", borderRadius: 10, border: "4px solid #5fd38a" }}>
    <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 38, color: "#ffffff" }}>STICK PUSHER</div>
    <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
      {ats.map((a, i) => <div key={i} style={{ width: 34, height: 100, borderRadius: 6, background: t >= a ? "#5fd38a" : "#2a3139" }} />)}
      <div style={{ width: 34, height: 100, borderRadius: 6, marginLeft: 20, background: t >= pullAt ? RED : "#2a3139" }} />
    </div>
  </div>
);

export default Sky;
