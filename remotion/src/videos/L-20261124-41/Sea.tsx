// Sea (3D, the shared world): every beat set around Titan. Params pick the camera move (`shot`: a start pose
// to an end pose across the beat) and the world (`phase`: surface, tow, release, descent, cycle, cutaway,
// ascent, implode, after, search, debris), what happens on which word (stressAt, implodeAt, cutAt, boltsAt,
// releaseAt, soundAt, peopleAt, fairingOffAt, lampsOutAt…), and the plates carrying the beat's figures
// (`tag`, the date caption, the chapter card). Figures come only from params.fig.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, cue, DisasterStage, Focus, Label3D, Ocean, type CamKey, type V3 } from "../../three/index";
import { Boat, DebrisField, Diver, Folk, Implosion, Plane, Platform, Robot, Seabed, Ship, Snow, SurfaceFromBelow, Titan, Wreck } from "./deep";
import { ANTON, ChapterCard, figOf, ICE, kitClock, MONO, MonoCaption, moments, Overlay, Readout, RED, StampHtml } from "./ui";

type Shot = { a: V3; la: V3; b: V3; lb: V3; fov?: number };
const SHOTS: Record<string, Shot> = {
  hookclose: { a: [4.6, 1.2, 4.2], la: [1.2, 0, 0], b: [3.4, 0.6, 3.4], lb: [0.4, -0.2, 0], fov: 44 },
  hookfail: { a: [3.6, 0.8, 3.6], la: [0.4, 0, 0], b: [6.5, 1.5, 9], lb: [0, 0, 0], fov: 44 },
  surface: { a: [22, 9, 26], la: [-3, 1, -6], b: [17, 6.5, 21], lb: [-2, 0.5, -4], fov: 42 },
  platform: { a: [7.5, 3.2, 8], la: [0, 1.4, 0], b: [5.5, 2.6, 6.8], lb: [0.6, 1.3, 0], fov: 42 },
  board: { a: [9, 4.2, 9], la: [0.8, 1.2, 0], b: [7.5, 3.4, 7.6], lb: [1.6, 1.3, 0], fov: 42 },
  dome: { a: [5.2, 2.3, 2.8], la: [2.2, 1.3, 0], b: [4.4, 1.8, 2.1], lb: [2.3, 1.3, 0], fov: 40 },
  release: { a: [9, -9, 12], la: [0, -5, 0], b: [8, -12, 10], lb: [0, -8, 0], fov: 46 },
  side: { a: [0.5, 0.6, 9], la: [0, 0, 0], b: [-0.6, 0.3, 7.6], lb: [0, 0, 0], fov: 42 },
  cutaway: { a: [6, 2.6, 7.5], la: [-0.2, 0, 0], b: [4.6, 1.6, 6.4], lb: [0, 0, 0], fov: 42 },
  ascent: { a: [6, -5, 8], la: [0, 0, 0], b: [5, -4, 7], lb: [0, 1, 0], fov: 46 },
  ascentboat: { a: [7, -7, 9], la: [0, 2, 0], b: [5.5, -6, 7.5], lb: [0, 4, 0], fov: 50 },
  tow: { a: [24, 7, 22], la: [-8, 0, 0], b: [18, 5.5, 18], lb: [-6, 0, 0], fov: 44 },
  arrive: { a: [30, 9, 30], la: [-10, 2, -6], b: [24, 7, 25], lb: [-8, 2, -5], fov: 42 },
  dark: { a: [9, 3, 10], la: [0, -1, 0], b: [7, 1, 8], lb: [0, -2, 0], fov: 44 },
  orbit: { a: [7, 1.5, 5], la: [0, 0, 0], b: [2, 1, 8], lb: [0, 0, 0], fov: 42 },
  fail: { a: [4.2, 1, 5.2], la: [0, 0, 0], b: [9, 2.5, 13], lb: [0, 1, 0], fov: 44 },
  far: { a: [26, -4, 30], la: [0, 2, 0], b: [24, 4, 28], lb: [0, 6, 0], fov: 40 },
  fleet: { a: [36, 10, 40], la: [0, 3, -20], b: [28, 8, 34], lb: [-6, 3, -22], fov: 44 },
  search: { a: [40, 22, 40], la: [0, 2, 0], b: [34, 18, 34], lb: [0, 3, 0], fov: 44 },
  seabed: { a: [-14, 5, 14], la: [0, 0.5, 0], b: [-11, 4, 11], lb: [1, 0.5, 0], fov: 46 },
  seabedclose: { a: [-7, 3, 7], la: [0, 0.5, 0.5], b: [-6, 6, 8], lb: [0, 1.5, 0.5], fov: 44 },
  joint: { a: [3.2, 1.4, 3.4], la: [1.3, 0, 0], b: [2.4, 1.0, 2.8], lb: [1.2, 0, 0], fov: 40 },
  domeside: { a: [4.2, 0.9, 2.6], la: [2.1, 0, 0], b: [3.6, 0.7, 2.0], lb: [2.2, 0, 0], fov: 40 },
  float: { a: [12, 4, 13], la: [0, 1.2, 0], b: [10, 3, 11], lb: [0, 1.2, 0], fov: 42 },
  plane: { a: [30, 12, 34], la: [0, 20, 0], b: [26, 10, 30], lb: [10, 18, 0], fov: 46 },
  lot: { a: [10, 7, 18], la: [0, 1, -6], b: [8, 5.5, 15], lb: [0, 1, -6], fov: 46 },
  lotclose: { a: [5.5, 3.2, 8], la: [-0.5, 1.4, -2], b: [4.5, 2.6, 7], lb: [-0.5, 1.4, -2], fov: 46 },
  loop: { a: [6, 1.5, 7], la: [0.5, 0, 0], b: [4.6, 1.2, 4.2], lb: [1.2, 0, 0], fov: 44 },
};

type Tag = { at: string; fig: string; label: string };
type Params = {
  shot?: string; phase?: string; caption?: string; tag?: Tag; chapter?: string; stamp?: { at: string; text: string };
  stressAt?: string; crackAt?: string; dimAt?: string; implodeAt?: string; rewindAt?: string; ringAt?: string; cutAt?: string; domesAt?: string;
  boltsAt?: string; releaseAt?: string; soundAt?: string; shakeAt?: string; peopleAt?: string; people?: number; crew?: boolean; closeAt?: string;
  fairingOffAt?: string; divers?: string; boat?: boolean; robot?: boolean; lamps?: number; lampsOutAt?: string; sinkAt?: string; riseAt?: string;
  cycleAt?: string; grid?: string; carAt?: string; fade?: boolean; rough?: boolean; slow?: boolean;
  causeTags?: { at: string; text?: string; fig?: string; prefix?: string; red?: boolean }[]; finding?: { at: string; text: string; verdict: string };
  note?: { at: string; text: string }; tag2?: Tag; fleet?: boolean;
  reuseAt?: string; night?: string; noPlatformAt?: string; batteriesAt?: string; planeBig?: boolean;
};

const UNDER = { top: "#0f3a5c", bottom: "#020812" };
const DEEPBG = { top: "#04182b", bottom: "#000206" };

const Sea: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (name?: string) => (name && ev[name] !== undefined ? ev[name]! : 1e9);
  const fig = (n?: string) => figOf(p, n);
  const end = Math.max(m.end, 30);
  const S = SHOTS[P.shot ?? "side"] ?? SHOTS.side!;
  const keys: CamKey[] = [{ f: 0, pos: S.a, look: S.la, fov: S.fov ?? 42 }, { f: end + 10, pos: S.b, look: S.lb, fov: S.fov ?? 42 }];
  const phase = P.phase ?? "descent";
  const surface = phase === "surface" || phase === "tow" || phase === "search";
  const lot = phase === "lot";
  const deep = phase === "descent" || phase === "cycle" || phase === "implode" || phase === "after" || phase === "cutaway";
  // the hull's state
  const stress = phase === "cycle"
    ? (t >= e(P.cycleAt) ? 0.5 * (0.5 - 0.5 * Math.cos(((t - e(P.cycleAt)) / Math.max(12, 30 - (t - e(P.cycleAt)) * 0.08)) * Math.PI * 2)) : 0)
    : P.stressAt ? cue(t, e(P.stressAt), 40, (x) => x) * (P.implodeAt ? 1 : 0.55) : 0;
  const crushK = phase === "implode" ? cue(t, e(P.implodeAt), P.slow ? 10 : 5, (x) => x) : 0;
  const boom = phase === "implode" ? cue(t, e(P.implodeAt), P.slow ? 90 : 60, (x) => x) : 0;
  const rewound = P.rewindAt !== undefined && t >= e(P.rewindAt);
  const gone = crushK >= 0.98 && !rewound;
  const crack = P.crackAt ? cue(t, e(P.crackAt), 10) * (0.6 + 0.4 * Math.sin(t * 0.8)) : 0;
  const ringK = P.ringAt ? cue(t, e(P.ringAt), 8) : 0;
  const sound = P.soundAt && t >= e(P.soundAt) ? (t - e(P.soundAt)) / 30 : -1;
  const shake = P.shakeAt ? Math.max(0, 1 - (t - e(P.shakeAt)) / 14) * (t >= e(P.shakeAt) ? 1 : 0) : 0;
  // the sub's place in the world
  const release = P.releaseAt ? cue(t, e(P.releaseAt), 60, (x) => x * x) : 0;
  const subY = surface ? 1.3 : phase === "release" ? -2.6 - 7 * release : phase === "ascent" ? -1 + t * 0.012 : 0;
  const sink = phase === "descent" || phase === "cycle" ? t * 0.03 : phase === "ascent" ? -t * 0.03 : 0;
  const domeOpen = P.people ? 1 - cue(t, e(P.closeAt), 20) : 0;
  const bolts = P.boltsAt ? Math.min(18, Math.max(0, (t - e(P.boltsAt)) * 0.5)) : P.people ? 0 : 18;
  const nightK = P.night && P.phase !== "lot" ? cue(t, e(P.night), 30) : 0;
  const bg = lot ? { top: "#8e9aa6", bottom: "#d9dee3" } : P.fleet ? { top: "#6fa3d0", bottom: "#d5e4ef" } : phase === "search" ? { top: "#3d4b59", bottom: "#7d8a97" } : nightK > 0 ? { top: "#0a1424", bottom: "#24364a" } : surface ? { top: phase === "search" ? "#7b8794" : "#9fb3c6", bottom: "#d5dde5" } : phase === "debris" ? DEEPBG : deep ? DEEPBG : UNDER;
  const fog = lot ? { color: "#b9c2cb", near: 25, far: 90 } : surface ? { color: P.fleet ? "#bcd3e4" : phase === "search" ? "#8994a0" : "#b5c3d0", near: 40, far: 170 } : phase === "debris" ? { color: "#01050b", near: 10, far: 55 } : { color: deep ? "#020a14" : "#0b2c47", near: 8, far: deep ? 40 : 60 };
  const dim = P.dimAt ? cue(t, e(P.dimAt), 14) : 0;
  const fadeDark = P.sinkAt ? cue(t, e(P.sinkAt), 20) : P.fade ? cue(t, 0, end, (x) => x) * 0.4 : 0;
  const lampsOut = P.lampsOutAt ? e(P.lampsOutAt) : 1e9;
  const people = P.people ?? 0;
  const walk = P.peopleAt ? cue(t, e(P.peopleAt), 70, (x) => x) : 0;
  const shakeOff: V3 = [Math.sin(t * 3.1) * 0.15 * shake, Math.cos(t * 2.7) * 0.1 * shake, 0];
  const keysShaken = shake > 0 ? keys.map((k) => ({ ...k, pos: [k.pos[0] + shakeOff[0], k.pos[1] + shakeOff[1], k.pos[2]] as V3 })) : keys;
  const riseK = P.riseAt ? cue(t, e(P.riseAt), 40) : 0;
  const keysFinal = riseK > 0 ? keysShaken.map((k) => ({ ...k, pos: [k.pos[0], k.pos[1] + 6 * riseK, k.pos[2]] as V3 })) : keysShaken;
  const shipX = phase === "tow" && P.shot === "arrive" ? -20 + 10 * cue(t, 0, end, (x) => x) : -16;
  return (
    <DisasterStage look="crossSection" floor={false} dof={1.0} shadowBox={30} light={surface || lot ? 0.95 - 0.6 * nightK : 0.55} backdrop={bg} fog={fog} vignette={deep ? 0.6 : 0.35} bloom={0.6}
      overlay={
        <Overlay text={phase === "debris" ? "3D reconstruction · the debris as found" : undefined}>
          {P.caption === "date" && <MonoCaption t={t} at={P.shot === "loop" ? e("comments") - 10 : -80} text={`JUNE ${fig("day")}, ${fig("year")} · NORTH ATLANTIC`} size={34} />}
          {P.caption === "date" && <MonoCaption t={t} at={P.shot === "loop" ? e("comments") : 10} text="TITAN · BOUND FOR THE TITANIC" top={164} size={30} color={ICE} />}
          {P.note && <MonoCaption t={t} at={e(P.note.at)} text={P.note.text} top={170} left={150} size={40} color="#ffd27a" />}
          {P.tag2 && <Readout x={1180} y={420} label={P.tag2.label} k={cue(t, e(P.tag2.at), 12)} value={countText(fig(P.tag2.fig), cue(t, e(P.tag2.at), 20))} />}
          {P.tag && <Readout x={1180} y={150} label={P.tag.label} k={cue(t, e(P.tag.at), 12)} value={countText(fig(P.tag.fig), cue(t, e(P.tag.at), 20))} />}
          {P.chapter && <ChapterCard t={t} text={P.chapter} />}
          {P.stamp && <StampHtml t={t} at={e(P.stamp.at)} text={P.stamp.text} x={1180} y={220} />}
          {P.grid === "square" && <InchGrid t={t} at={e("square")} carAt={e(P.carAt)} />}
          {P.lamps && <LampRow n={P.lamps} t={t} outAt={lampsOut} />}
          {P.shot === "hookclose" && <LampRow n={5} t={t} outAt={e(P.dimAt)} small />}
          {P.causeTags && <CauseTags t={t} tags={P.causeTags.map((c) => ({ at: e(c.at), text: c.text ?? `${c.prefix ?? ""}${fig(c.fig)}`, red: c.red }))} />}
          {P.finding && <FindingCard t={t} at={e(P.finding.at)} text={P.finding.text} verdict={P.finding.verdict} />}
          {P.reuseAt && t >= e(P.reuseAt) && <MonoCaption t={t} at={e(P.reuseAt)} text="FROM THE FIRST HULL" top={170} left={1180} size={36} color="#ffd27a" />}
          {P.planeBig && t >= e("depth") && <MonoCaption t={t} at={e("depth")} text="ROBOTS RATED FOR THE WRECK: FEW" top={170} left={1000} size={32} />}
          {sound >= 0 && sound < 1.4 && <SoundText t={t} at={e(P.soundAt)} />}
          {gone && boom > 0.15 && <AbsoluteFill style={{ background: `rgba(0,0,0,${Math.min(0.5, (boom - 0.15) * 0.8)})` }} />}
          {dim > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.45 * dim})` }} />}
          {fadeDark > 0 && <AbsoluteFill style={{ background: `rgba(2,8,18,${0.85 * fadeDark})` }} />}
          {crushK > 0 && crushK < 1 && <AbsoluteFill style={{ background: `rgba(232,246,255,${0.8 * (1 - crushK)})` }} />}
        </Overlay>
      }>
      <Camera3D keys={keysFinal} frame={t} drift={0.02} />
      <Focus at={S.lb} range={surface ? 30 : 10} />
      <directionalLight position={[10, 30, 12]} intensity={surface || lot ? 1.5 : 0.35} color={surface ? "#fff4e0" : "#7fb6ff"} castShadow />
      <ambientLight intensity={surface || lot ? 0.5 : 0.18} color={surface ? "#c9d6e2" : "#3a6a9a"} />
      {/* the surface world */}
      {surface && <Ocean frame={t} size={260} segments={180} color={phase === "search" ? "#3b4e5e" : "#2f5f80"} waves={{ amp: P.rough ? 0.45 : 0.18, length: P.rough ? 6 : 4, speed: 0.05 }} />}
      {surface && phase !== "search" && P.shot !== "float" && <Ship position={phase === "tow" ? [shipX, 0.2, 0] : [-14, 0.2, -46]} frame={t} scale={1.2} />}
      {phase === "tow" && <mesh position={[(shipX + 17 - 4) / 2 - 2, 0.5, 0]} rotation-z={Math.PI / 2} material={undefined}><cylinderGeometry args={[0.05, 0.05, Math.abs(shipX + 17 - 4) + 6, 6]} /><meshStandardMaterial color="#e8e1c8" /></mesh>}
      {P.shot === "float" && (
        <group rotation={[Math.sin(t * 0.06) * 0.05, 0, Math.sin(t * 0.045) * 0.05]}>
          <Titan position={[0, 0.9, 0]} frame={t} lights={1 - (P.batteriesAt ? cue(t, e(P.batteriesAt), 10) : 0)} />
          {nightK > 0 && Array.from({ length: 40 }, (_, i) => <mesh key={i} position={[(i * 37 % 160) - 80, 30 + (i * 13 % 30), -90 + (i * 7 % 20)]}><sphereGeometry args={[0.18, 6, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={nightK} /></mesh>)}
          <Platform position={[-6 - 10 * (P.noPlatformAt ? cue(t, e(P.noPlatformAt), 60) : 0), 0, -5]} y={-0.4} />
        </group>
      )}
      {(surface && phase !== "search" && P.shot !== "float") && (
        <group position={[phase === "tow" ? 4 : 0, 0, 0]} rotation={[Math.sin(t * 0.06) * (P.rough ? 0.08 : 0.03), 0, Math.sin(t * 0.045) * (P.rough ? 0.06 : 0.02)]}>
          <Platform y={-0.1} />
          <Titan position={[0.2, subY, 0]} frame={t} domeOpen={domeOpen} bolts={bolts} lights={0.4} fairingOff={P.fairingOffAt ? cue(t, e(P.fairingOffAt), 24) : 0} />
          {people > 0 && Array.from({ length: people }, (_, i) => {
            const go = Math.max(0, Math.min(1, walk * people - i * 0.6));
            const inside = go >= 0.999;
            return inside ? null : <Folk key={i} position={[-3.2 + i * 0.5 + 6.4 * go * 0.9, 0.05, 1.3 - 1.1 * go]} h={1.7} color={["#3e5a78", "#7a5a3a", "#5b6b82", "#8a7a68", "#4f6b5c"][i]} yaw={-0.4} />;
          })}
        </group>
      )}
      {P.crew && surface && Array.from({ length: 6 }, (_, i) => <Folk key={i} position={[-20 + i * 1.3, 3.2, -43.6]} h={1.7} color={i % 2 ? "#e8b21c" : "#c84a2a"} />)}
      {P.divers && surface && [0, 1].map((i) => <Diver key={i} position={[-2 + i * 4, -0.7, 2.4 - i * 4.6]} frame={t + i * 17} yaw={i * 3.1} />)}
      {phase === "search" && <group scale={P.planeBig ? 1.8 : 1}><Plane position={[P.planeBig ? -20 + t * 0.12 : -60 + t * 0.35, P.planeBig ? 11 : 26, -10]} /></group>}
      {phase === "search" && !P.fleet && [[-40, -60], [30, -70], [70, -30], [-70, 20]].map(([x, z], i) => <Ship key={i} position={[x!, 0.2, z!]} frame={t + i * 30} scale={0.8} />)}
      {P.fleet && [[-40, -30], [-12, -26], [16, -30], [44, -24], [-26, -55], [4, -58], [32, -54]].map(([x, z], i) => (
        <group key={i}>
          <Ship position={[x!, 0.2, z!]} frame={t + i * 30} scale={0.7} />
          <mesh position={[x! + 3.6, 11.5, z!]}><boxGeometry args={[2.4, 1.5, 0.08]} /><meshStandardMaterial color={["#d52b1e", "#1f6fd1", "#ffffff", "#f2c500", "#2f8f4e", "#e8702a", "#7a2a8c"][i]} /></mesh>
        </group>
      ))}
      {/* under the surface */}
      {phase === "release" && <SurfaceFromBelow y={2} frame={t} />}
      {phase === "release" && <Platform position={[0, -3.6 - 2 * cue(t, 0, 40), 0]} />}
      {phase === "release" && <Titan position={[0.2, subY, 0]} frame={t} lights={1} />}
      {phase === "release" && P.divers && [0, 1].map((i) => <Diver key={i} position={[-3 + i * 5, -2.4 + i * 0.4, 3 - i * 6]} frame={t + i * 17} yaw={i * 3.1} />)}
      {phase === "release" && <Snow frame={t} sink={-release * 7} count={260} />}
      {phase === "ascent" && <SurfaceFromBelow y={P.boat ? 14 : 22} frame={t} k={0.8} />}
      {phase === "ascent" && P.boat && <group position={[2, 14.3, -2]}><Boat frame={t} turn={sound >= 0 ? Math.min(1, sound * 3) : 0} /></group>}
      {phase === "ascent" && <Titan position={[0, subY, 0]} rotation={[0, 0, 0.12]} frame={t} lights={1} />}
      {phase === "ascent" && <Snow frame={t} sink={sink} count={300} />}
      {phase === "ascent" && sound >= 0 && sound < 1.2 && <SoundRing at={[0, subY, 0]} k={sound} />}
      {/* the deep */}
      {deep && !gone && phase !== "after" && (
        <Titan position={[0, 0, 0]} frame={t} stress={rewound ? 0.35 : Math.max(stress, crack * 0.6)} crush={rewound ? 0 : crushK} ring={Math.max(ringK * (0.6 + 0.4 * Math.sin(t * 0.9)), crack)}
          cut={P.cutAt ? cue(t, e(P.cutAt), 24) : 0} domesOut={P.domesAt ? Math.sin(Math.PI * Math.min(1, Math.max(0, (t - e(P.domesAt)) / 30))) : 0}
          lights={(1 - dim) * (phase === "implode" && crushK > 0 ? 0 : 1)} />
      )}
      {deep && P.soundAt && sound >= 0 && sound < 1.2 && <SoundRing at={[0, 0, 0]} k={sound} />}
      {deep && P.ringAt && phase === "implode" && t >= e("message") && t < e("message") + 40 && <SoundRing at={[0, 0, 0]} k={(t - e("message")) / 40} />}
      {(deep || phase === "after") && <Snow frame={t} sink={sink} count={P.shot === "far" ? 200 : 420} />}
      {phase === "implode" && !rewound && <Implosion k={boom} frame={t} />}
      {phase === "after" && <Implosion k={0.35 + 0.65 * cue(t, 0, end * 1.4, (x) => x)} frame={t} />}
      {phase === "after" && <SurfaceFromBelow y={40} frame={t} k={0.45} />}
      {lot && <LotWorld t={t} snowK={P.night ? 1 : 0.2 + 0.8 * cue(t, e("winter"), 40)} />}
      {phase === "debris" && <Seabed />}
      {phase === "debris" && <DebrisField />}
      {phase === "debris" && <Wreck position={[48, 0, -46]} rotation={[0, -0.9, 0]} />}
      {phase === "debris" && P.robot && <Robot position={[-4 + Math.sin(t * 0.02) * 1.5, 3, 5 - t * 0.01]} frame={t} yaw={-0.7} />}
      {phase === "debris" && <pointLight position={[0, 6, 0]} intensity={18} distance={22} color="#bcd8ff" />}
      {phase === "debris" && ringK > 0 && <mesh position={[0, 0.15, 0.5]} rotation-x={-Math.PI / 2}><ringGeometry args={[5.6, 5.9, 64]} /><meshBasicMaterial color={RED} transparent opacity={ringK} /></mesh>}
      {/* labels pinned on the model */}
      {P.shot === "surface" && t >= e("OceanGate") && <Label3D at={[0.2, 2.6, 0]} offset={[1.6, 1.8, 0.6]} text="TITAN" sub="OceanGate" start={K(e("OceanGate"))} color="#ffffff" px={44} />}
      {P.shot === "arrive" && t >= e("Prince") && <Label3D at={[shipX, 8, 0]} offset={[2, 2.4, 0.5]} text="POLAR PRINCE" start={K(e("Prince"))} color="#ffffff" px={44} />}
      {phase === "debris" && P.robot && t >= e("tail") && P.shot === "seabed" && <Label3D at={[0, 1.2, 0]} offset={[1.2, 1.6, 0.4]} text="TAIL CONE" start={K(e("tail"))} color="#ffffff" px={40} />}
      {phase === "debris" && P.robot && t >= e("domes") && P.shot === "seabed" && <Label3D at={[4, 0.9, 2.5]} offset={[1.2, 1.4, 0.4]} text="BOTH DOMES" start={K(e("domes"))} color="#ffffff" px={40} />}
    </DisasterStage>
  );
};

/** The parking lot in St. John's in winter: asphalt, white bays, Titan on its rails between two containers,
 * a few parked cars, the harbour behind, snow falling and settling on the hull (`snowK`). */
const LotWorld: React.FC<{ t: number; snowK: number }> = ({ t, snowK }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#4a4f55" roughness={1} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.45 * snowK} /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-16 + i * 3, 0.02, 7]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.15, 5]} /><meshBasicMaterial color="#e8e8e8" /></mesh>)}
    <Titan position={[0, 1.15, 0]} frame={0} lights={0} />
    {/* a thin layer of snow along the top of the fairing */}
    <mesh position={[-0.6, 2.2, 0]}><boxGeometry args={[5.2, 0.08 + 0.1 * snowK, 1.1]} /><meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={Math.min(1, snowK * 1.5)} /></mesh>
    {/* two shipping containers with ribs and doors */}
    {[[-7.5, "#a2241d"], [7.5, "#1f6fd1"]].map(([x, c], k) => (
      <group key={k} position={[x as number, 0, -1]}>
        <mesh position={[0, 1.3, 0]} castShadow><boxGeometry args={[6, 2.6, 2.4]} /><meshStandardMaterial color={c as string} roughness={0.75} /></mesh>
        {Array.from({ length: 11 }, (_, i) => <mesh key={i} position={[-2.75 + i * 0.55, 1.3, 1.22]}><boxGeometry args={[0.12, 2.5, 0.06]} /><meshStandardMaterial color={c as string} roughness={0.5} /></mesh>)}
        <mesh position={[3.02, 1.3, 0]}><boxGeometry args={[0.06, 2.5, 2.3]} /><meshStandardMaterial color="#2b2b2b" /></mesh>
        {[-0.5, 0.5].map((z) => <mesh key={z} position={[3.06, 1.3, z]}><boxGeometry args={[0.05, 2.3, 0.06]} /><meshStandardMaterial color="#c9c9c9" /></mesh>)}
        <mesh position={[0, 2.63, 0]}><boxGeometry args={[6, 0.06 + 0.08 * snowK, 2.4]} /><meshStandardMaterial color="#ffffff" transparent opacity={snowK} /></mesh>
      </group>
    ))}
    {/* parked cars: body, cabin with windows, wheels */}
    {[[-13, 7, "#d9d9d9"], [-10, 7, "#2f3f55"], [10, 7, "#8a1c1c"], [13, 7, "#cfcfcf"]].map(([x, z, c], i) => (
      <group key={i} position={[x as number, 0, z as number]}>
        <mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[1.8, 0.55, 4.2]} /><meshStandardMaterial color={c as string} roughness={0.4} metalness={0.3} /></mesh>
        <mesh position={[0, 1.05, -0.2]} castShadow><boxGeometry args={[1.6, 0.5, 2.1]} /><meshStandardMaterial color={c as string} roughness={0.4} metalness={0.3} /></mesh>
        <mesh position={[0, 1.05, -0.2]}><boxGeometry args={[1.64, 0.36, 1.9]} /><meshStandardMaterial color="#1c2733" roughness={0.1} /></mesh>
        {[[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]].map(([wx, wz], j) => <mesh key={j} position={[wx!, 0.33, wz!]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.33, 0.33, 0.25, 16]} /><meshStandardMaterial color="#111" /></mesh>)}
        <mesh position={[0, 1.32, -0.2]}><boxGeometry args={[1.6, 0.05 * snowK + 0.01, 2.1]} /><meshStandardMaterial color="#ffffff" transparent opacity={snowK} /></mesh>
      </group>
    ))}
    {/* the quay and the harbour behind */}
    <mesh position={[0, 0.3, -9]}><boxGeometry args={[80, 0.6, 0.6]} /><meshStandardMaterial color="#8d949b" /></mesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[-28 + i * 8, 0.8, -9]}><cylinderGeometry args={[0.25, 0.3, 0.6, 10]} /><meshStandardMaterial color="#2b2b2b" /></mesh>)}
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, -40]}><planeGeometry args={[200, 62]} /><meshStandardMaterial color="#2f5f80" roughness={0.25} metalness={0.2} /></mesh>
    <mesh position={[0, 6, -75]}><boxGeometry args={[200, 14, 4]} /><meshStandardMaterial color="#5b6670" /></mesh>
    <Ship position={[-18, 0, -26]} frame={t} scale={0.9} />
    {Array.from({ length: 140 }, (_, i) => {
      const x = ((i * 7.3) % 40) - 20, z = ((i * 3.7) % 30) - 15;
      const y = 14 - (((t * 0.08) + i * 0.37) % 14);
      return <mesh key={i} position={[x + Math.sin(t * 0.03 + i) * 0.3, y, z]}><sphereGeometry args={[0.06, 5, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.9 * snowK} /></mesh>;
    })}
  </group>
);

/** Cause tags along the right edge, each typing on its word (the promise: the chain in three links). */
const CauseTags: React.FC<{ t: number; tags: { at: number; text: string; red?: boolean }[] }> = ({ t, tags }) => (
  <div style={{ position: "absolute", left: 1180, top: 160, display: "flex", flexDirection: "column", gap: 22 }}>
    {tags.map((g, i) => {
      if (t < g.at) return null;
      const k = Math.min(1, (t - g.at) / 8);
      return (
        <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * 40}px)`, display: "flex", alignItems: "center", gap: 16, background: "rgba(4,12,22,0.86)", border: `4px solid ${g.red ? RED : "#ffd27a"}`, padding: "10px 22px", borderRadius: 8, maxWidth: 680 }}>
          <div style={{ fontFamily: ANTON, fontSize: 52, color: g.red ? RED : "#ffd27a" }}>{i + 1}</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: "#ffffff", letterSpacing: 2, whiteSpace: "nowrap" }}>{g.text}</div>
        </div>
      );
    })}
  </div>
);

/** A finding pinned over a 3D shot: the text types on, then its verdict stamps. */
const FindingCard: React.FC<{ t: number; at: number; text: string; verdict: string }> = ({ t, at, text, verdict }) => {
  const k = Math.min(1, Math.max(0, (t + 30 - at) / 10));
  if (k <= 0) return null;
  const s = t >= at ? Math.min(1, (t - at) / 6) : 0;
  const col = verdict === "FACTOR" ? "#f2a33a" : RED;
  return (
    <div style={{ position: "absolute", left: 1060, top: 160, opacity: k, background: "rgba(255,255,255,0.95)", borderLeft: `12px solid ${col}`, padding: "16px 26px", maxWidth: 800 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#1f6fd1", letterSpacing: 2 }}>WHAT THE SAFETY BOARD FOUND</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: "#111", marginTop: 8 }}>{text}</div>
      {s > 0 && <div style={{ display: "inline-block", marginTop: 12, border: `6px solid ${col}`, color: col, fontFamily: ANTON, fontSize: 52, padding: "0 16px", transform: `rotate(-6deg) scale(${1.6 - 0.6 * s})`, opacity: s }}>{verdict}</div>}
    </div>
  );
};

/** A sound ring leaving the hull (a bang, a last ping). */
const SoundRing: React.FC<{ at: V3; k: number }> = ({ at, k }) => (
  <mesh position={at} rotation-y={Math.PI / 2}>
    <torusGeometry args={[1 + k * 7, 0.05 + 0.1 * (1 - k), 8, 64]} />
    <meshBasicMaterial color="#ffd27a" transparent opacity={Math.max(0, 0.9 - k * 0.8)} />
  </mesh>
);

/** "BANG" in mono over the frame for a moment after the sound. */
const SoundText: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = Math.min(1, (t - at) / 5);
  const o = Math.max(0, 1 - Math.max(0, t - at - 24) / 14);
  return (
    <div style={{ position: "absolute", left: 1180, top: 330, transform: `scale(${1.5 - 0.5 * k})`, opacity: o, fontFamily: ANTON, fontSize: 110, color: "#ffd27a", letterSpacing: 8, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
      BANG
    </div>
  );
};

/** Small lit figures along the top, one per person aboard, dimming one by one at `outAt`. */
const LampRow: React.FC<{ n: number; t: number; outAt: number; small?: boolean }> = ({ n, t, outAt, small }) => {
  const s = small ? 0.6 : 1;
  return (
    <svg width={n * 70 * s + 40} height={130 * s + 20} style={{ position: "absolute", left: small ? 1880 - n * 70 * s - 40 : 80, top: small ? 40 : 560 }}>
      {Array.from({ length: n }, (_, i) => {
        const off = t >= outAt + i * 6;
        const c = off ? "#3a4654" : "#ffe7a8";
        return (
          <g key={i} transform={`translate(${30 + i * 70 * s} ${10}) scale(${s})`} style={{ filter: off ? "none" : "drop-shadow(0 0 8px #ffcf6a)" }}>
            <circle cx={20} cy={18} r={15} fill={c} />
            <path d="M 2 120 L 4 52 Q 20 36 36 52 L 38 120 Z" fill={c} />
          </g>
        );
      })}
    </svg>
  );
};

/** The inch grid over the hull with the car load symbol (p-car). */
const InchGrid: React.FC<{ t: number; at: number; carAt: number }> = ({ t, at, carAt }) => {
  const k = Math.min(1, Math.max(0, (t - at) / 14));
  const c = Math.min(1, Math.max(0, (t - carAt) / 10));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 5 }, (_, i) => Array.from({ length: 3 }, (_, j) => {
        const idx = i * 3 + j;
        const o = Math.max(0, Math.min(1, k * 15 - idx));
        return <rect key={idx} x={700 + i * 104} y={420 + j * 104} width={84} height={84} fill="none" stroke={RED} strokeWidth={5} opacity={o} />;
      }))}
      <g opacity={c} transform={`translate(1260 ${190 + (1 - c) * -40})`}>
        <rect x={0} y={0} width={520} height={200} rx={12} fill="rgba(4,12,22,0.86)" stroke={RED} strokeWidth={4} />
        <path d="M 60 120 L 90 80 L 200 80 L 240 120 L 290 125 L 290 150 L 40 150 L 40 125 Z" fill="#ffffff" />
        <circle cx={95} cy={152} r={20} fill="#111" stroke="#fff" strokeWidth={4} />
        <circle cx={240} cy={152} r={20} fill="#111" stroke="#fff" strokeWidth={4} />
        <path d="M 400 40 L 400 140 M 375 115 L 400 140 L 425 115" stroke={RED} strokeWidth={10} fill="none" />
        <rect x={360} y={150} width={80} height={30} fill="none" stroke="#fff" strokeWidth={4} />
        <text x={30} y={48} fontFamily={MONO} fontWeight={700} fontSize={32} fill="#ffffff">ON EACH SQUARE INCH</text>
      </g>
    </svg>
  );
};

export default Sea;
