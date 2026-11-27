// Myth: "It isn't the reason you learned. Its wings span {fact3} metres. At school we learn air over the curved top must hurry to meet the air underneath."
// 1) The superjumbo from above on the apron (wide), the camera gliding over it. "reason": two chalk arrows sketch
//    over the left wing; "learned": they flicker and crack away; "wings": the wings' lights glow; "span": a bracket stretches
//    wingtip to wingtip; "metres": the figure lands on it.
// 2) "school": cut to a classroom blackboard with the textbook wing drawn in chalk (medium). "curved": its top
//    glows; "top": a chalk dot starts over the top; "hurry": it speeds, chalk streaks behind; "meet": both dots
//    meet at the back edge inside a chalk circle (close); "underneath": the bottom dot's path glows.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Bracket3D, Camera3D, direct, foilPoint, glow, GlowLine, Label3D, mat, Stage3D, TECH, type V3 } from "../../three/index";
import { Blackboard, GEAR_H, HALF_SPAN, SuperJumbo, k01, wingAt } from "./Parts";

type Params = { fig?: { span?: string } };
const CH = 4.0; // the chalk wing's chord on the board
const BY = 0.1; // its height on the board
const chalkFoil = (upper: boolean, n = 40): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = foilPoint(0.5 - 0.5 * Math.cos((Math.PI * i) / n), upper, { chord: CH, camber: 0.06, thick: 0.16 });
    return [x, y + BY, 0.05];
  });

const Myth: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const reason = m.at("reason", 8);
  const learned = m.at("learned", 18);
  const wingsW = m.at("wings", 34);
  const span = m.at("span", 40);
  const metres = m.at("metres", 34);
  const lands = m.at("lands", 116);
  const tipFlash = m.pulse(lands + 2, 10);
  const school = m.at("school", 50);
  const learn = m.at("learn", 58);
  const airW = m.at("air", 64);
  const curved = m.at("curved", 70);
  const top = m.at("top", 80);
  const hurry = m.at("hurry", 92);
  const meet = m.at("meet", 104);
  const under = m.at("underneath", 116);
  const end = Math.max(m.end, under + 20);
  const fig = (p.beat.params as Params).fig?.span ?? "";
  const board = f >= school;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, GEAR_H, 0], dir: [0.05, 1.6, 1], from: 10.6, to: 9.8, dur: Math.max(8, school), fov: 40 },
    { at: school, move: "push", look: [0, 0.2, 0], dir: [0.1, 0.05, 1], from: 5.4, to: 4.8, dur: Math.max(8, meet - school), fov: 38 },
    { at: meet, move: "push", look: [CH / 2 - 0.2, BY, 0], dir: [0.05, 0.03, 1], from: 3.8, to: 3.4, dur: Math.max(8, end - meet) },
  ]);
  const up = chalkFoil(true), lo = chalkFoil(false);
  // the textbook's two dots: they leave the front edge together on "top" and arrive together on "meet"
  const run = k01(f, top, Math.max(8, meet - top));
  const dot = (line: V3[], lift: number): V3 => {
    const i = Math.min(line.length - 1, Math.round(run * (line.length - 1)));
    const pt = line[i]!;
    return [pt[0], pt[1] + lift, pt[2] + 0.02];
  };
  const topDot = dot(up, 0.14), botDot = dot(lo, -0.14);
  const trail = (line: V3[], lift: number): V3[] => line.slice(0, Math.max(2, Math.round(run * (line.length - 1)) + 1)).map(([x, y, z]) => [x, y + lift, z]);
  const circle: V3[] = Array.from({ length: 33 }, (_, i) => [CH / 2 + 0.25 + 0.42 * Math.cos((i / 32) * Math.PI * 2), BY + 0.42 * Math.sin((i / 32) * Math.PI * 2), 0.06]);
  const tip = wingAt(1);
  const chalk = k01(f, reason, 10) * (1 - k01(f, learned + 8, 10));
  const flick = f > learned ? 0.35 + 0.65 * ((f >> 2) % 2) : 1;
  const arrowAt = (dz: number): V3[] => Array.from({ length: 14 }, (_, j) => {
    const a = wingAt(0.55);
    return [a[0] + 0.9 - j * 0.15, GEAR_H + 0.5, a[2] + dz];
  });
  const wl = k01(f, wingsW, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={board ? { top: "#2a2f3d", bottom: "#0d0f15" } : { top: "#2b3040", bottom: "#101219" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2621-myth" />
        {!board && (
          <group>
            <mesh rotation-x={-Math.PI / 2} receiveShadow material={mat("clay", "#3a3e46", { roughness: 0.95 })}><planeGeometry args={[40, 30]} /></mesh>
            {Array.from({ length: 9 }, (_, i) => (
              <mesh key={i} rotation-x={-Math.PI / 2} position={[-8 + i * 2, 0.005, 5.2]} material={mat("clay", "#d9b33a")}><planeGeometry args={[1.2, 0.08]} /></mesh>
            ))}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]} material={mat("clay", "#d9b33a")}><planeGeometry args={[14, 0.08]} /></mesh>
            <group position={[0, GEAR_H, 0]}><SuperJumbo /></group>
            {/* the stand: lead-in line, stop bar, a tug and two service trucks */}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} material={mat("clay", "#e8e3d0")}><planeGeometry args={[0.06, 0.06]} /></mesh>
            {[[-3.2, 4.4, "#e0b52a"], [2.6, -4.6, "#d24a3a"], [3.6, 4.2, "#e8e8e8"]].map(([x, z, c], i) => (
              <group key={`v${i}`} position={[x as number, 0.18, z as number]}>
                <mesh material={mat("glossy", c as string)}><boxGeometry args={[0.9, 0.32, 0.45]} /></mesh>
                <mesh position={[0.3, 0.26, 0]} material={mat("glass", "#9fc3e0")}><boxGeometry args={[0.28, 0.2, 0.42]} /></mesh>
              </group>
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={`r${i}`} rotation-x={-Math.PI / 2} position={[-6 + i * 2.4, 0.005, -5.2]} material={mat("clay", "#f0f0ea")}><planeGeometry args={[1.6, 0.1]} /></mesh>
            ))}
            <pointLight position={[0, 9, 3]} intensity={40} color="#fff1dc" distance={30} />
            <GlowLine points={arrowAt(0.35)} color="#f4f1e6" width={6} k={chalk > 0 ? 1 : 0} opacity={chalk * flick} dashed dash={0.12} gap={0.07} />
            <GlowLine points={arrowAt(-0.35)} color="#f4f1e6" width={6} k={chalk > 0 ? 1 : 0} opacity={chalk * flick} dashed dash={0.12} gap={0.07} />
            {wl > 0.02 && [1, -1].map((s) => (
              <GlowLine key={s} points={Array.from({ length: 10 }, (_, j) => { const a = wingAt(0.1 + j * 0.1); return [a[0], GEAR_H + 0.05, s * a[2]] as V3; })} color={TECH.cyan} width={5} k={wl} opacity={0.9} />
            ))}
            {tipFlash > 0.02 && [1, -1].map((s) => (
              <mesh key={`tf${s}`} position={[tip[0], GEAR_H + 0.4, s * HALF_SPAN]} material={glow(TECH.amber, Math.round(tipFlash * 10) / 10)}><sphereGeometry args={[0.35, 16, 12]} /></mesh>
            ))}
            <Bracket3D from={[tip[0], GEAR_H + 0.4, HALF_SPAN]} to={[tip[0], GEAR_H + 0.4, -HALF_SPAN]} side={[-1, 0, 0]} fig={fig} caption="metres, tip to tip"
              start={span} px={96} color={TECH.amber} />
          </group>
        )}
        {board && (
          <group>
            <Blackboard position={[0, 0, 0]} />
            <pointLight position={[0, 1.5, 4]} intensity={16} color="#fff4e0" distance={14} />
            <GlowLine points={up} color={k01(f, curved, 8) > 0.5 ? "#ffe9a8" : "#f1efe6"} width={k01(f, curved, 8) > 0.5 ? 7 : 5} k={k01(f, school - 2, 8)} />
            <GlowLine points={lo} color="#f1efe6" width={5} k={k01(f, school, 8)} />
            {[-0.5, 0.1, 0.7].map((y, i) => (
              <GlowLine key={`in${i}`} points={[[-CH / 2 - 1.4, BY + y, 0.05], [-CH / 2 - 0.35, BY + y * 0.6, 0.05]]} color="#e9e6da" width={4} k={k01(f, school + 2 * i, 8)} dashed dash={0.12} gap={0.07} />
            ))}
            {f >= top && <GlowLine points={trail(up, 0.14)} color="#f1efe6" width={f >= hurry ? 6 : 3} dashed dash={0.08} gap={0.06} />}
            {f >= top && <GlowLine points={trail(lo, -0.14)} color={f >= under ? "#ffe9a8" : "#f1efe6"} width={f >= under ? 6 : 3} dashed dash={0.08} gap={0.06} />}
            {f >= airW && [topDot, botDot].map((d, i) => (
              <mesh key={i} position={d} material={mat("clay", "#f6f4ec")}><sphereGeometry args={[0.09, 16, 12]} /></mesh>
            ))}
            {f >= hurry && f < meet && Array.from({ length: 4 }, (_, i) => (
              <mesh key={`s${i}`} position={[topDot[0] - 0.14 * (i + 1), topDot[1], topDot[2]]} material={mat("clay", "#f6f4ec", { transparent: true, opacity: 0.6 - 0.13 * i })}>
                <boxGeometry args={[0.1, 0.02, 0.01]} />
              </mesh>
            ))}
            <GlowLine points={circle} color="#f1efe6" width={5} k={k01(f, meet, 12)} />
            <Label3D at={[-0.6, BY + 0.55, 0.05]} offset={[0, 0.25, 0]} text="the textbook answer" start={learn} px={52} color="#f4f1e6" align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Myth;
