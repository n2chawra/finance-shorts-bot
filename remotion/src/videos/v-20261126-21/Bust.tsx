// Bust: "Now follow two puffs of air through a wind tunnel. The top one reaches the back first. They never meet again."
// A dark wind-tunnel test section, a wing slice on its mount, glowing streamlines flowing past (wide).
// "two": two bright puffs side by side ahead of the wing; "puffs": they split at the front edge; "tunnel": the
// ribs and fan glow; "top": the camera tracks the top puff over the wing (medium); "reaches": it shoots past the
// back edge; "first": a flash there and a "first" tag; "never": close on the back edge, the bottom puff still
// under the wing; "meet": a red cross on the meeting point.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { alongLine, Camera3D, direct, foilSurface, glow, GlowLine, Label3D, lineU, Stage3D, streamlines, TECH, type V3 } from "../../three/index";
import { CHORD, CYAN, TunnelSection, k01, q } from "./Parts";

const AOA = 0.06;
const YS = [-1.7, -1.15, -0.7, -0.34, -0.16, 0.16, 0.34, 0.7, 1.15, 1.7];
export const tunnelLines = (aoa: number, lift = 1) => streamlines(YS, { chord: CHORD, aoa, lift, camber: 0.04, thick: 0.12 });

/** the streamlines drawn as flowing dashes */
export const Flow: React.FC<{ lines: [number, number][][]; f: number; k?: number; bright?: number; z?: number }> = ({ lines, f, k = 1, bright = 0.7, z = 0.81 }) => (
  <group>
    {lines.map((l, i) => {
      const pts: V3[] = l.map(([x, y]) => [x, y, z]);
      return (
        <group key={i}>
          <GlowLine points={pts} color={CYAN} width={2} k={k} opacity={0.25 * bright} />
          <GlowLine points={pts} color={CYAN} width={4} k={k} opacity={bright} dashed dash={0.3} gap={0.32} flow={f * 0.07 + i * 0.13} />
        </group>
      );
    })}
  </group>
);

const Bust: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const two = m.at("two", 12);
  const puffs = m.at("puffs", 20);
  const tunnel = m.at("tunnel", 40);
  const top = m.at("top", 56);
  const reaches = m.at("reaches", 66);
  const first = m.at("first", 80);
  const never = m.at("never", 96);
  const meet = m.at("meet", 116);
  const again = m.at("again", 124);
  const airW = m.at("air", 30);
  const end = Math.max(m.end, again + 16);
  const lines = tunnelLines(AOA);
  const upL = lines[5]!, loL = lines[4]!;
  const te = foilSurface(1, true, AOA, { chord: CHORD });
  const startX = -2.6;
  const u0t = lineU(upL, startX), u1t = lineU(upL, te[0]);
  const u0b = lineU(loL, startX), u1b = lineU(loL, te[0]);
  // the top puff reaches the back edge on "first"; the bottom one is only part way under the wing by the end
  const tt = Math.max(0, f - two) / Math.max(8, first - two);
  const tb = Math.max(0, f - two) / Math.max(8, (first - two) * 1.9);
  const topU = f < puffs ? u0t + (lineU(upL, -1.3) - u0t) * Math.min(1, tt * 1.5) : u0t + (u1t - u0t) * tt;
  const botU = u0b + (u1b - u0b) * tb;
  const topP = alongLine(upL, topU, 0.82), botP = alongLine(loL, botU, 0.82);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.1, 0], dir: [0.12, 0.12, 1], from: 9.2, to: 8.6, dur: Math.max(8, top), fov: 38 },
    { at: top, move: "push", look: [0.2, 0.35, 0.4], dir: [0.1, 0.12, 1], from: 6.0, to: 5.4, dur: Math.max(8, never - top) },
    { at: never, move: "push", look: [te[0] - 0.4, te[1], 0.5], dir: [0.15, 0.05, 1], from: 3.8, to: 3.3, dur: Math.max(8, end - never) },
  ]);
  const flash = m.pulse(first + 2, 10);
  const cross = k01(f, meet, 8) * (1 + 0.3 * m.pulse(again + 2, 10));
  const cx = te[0] + 0.05, cy = te[1];
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0c1424", bottom: "#030409", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1.2} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2621-bust" />
        <TunnelSection f={f} aoa={AOA} lit={k01(f, tunnel, 10)} />
        <pointLight position={[0, 2.0, 1]} intensity={6 * k01(f, 0, Math.max(4, m.at("now", 2) + 4))} color="#cfe6ff" distance={8} />
        <Flow lines={lines} f={f} k={k01(f, 0, 10)} bright={0.4 + 0.15 * k01(f, airW, 8) + 0.3 * k01(f, tunnel, 10)} />
        {f >= two && [topP, botP].map((pt, i) => (
          <group key={i} position={pt}>
            <mesh material={glow(i === 0 ? TECH.amber : "#ffffff")}><sphereGeometry args={[0.11, 18, 14]} /></mesh>
            <pointLight intensity={2} color={i === 0 ? TECH.amber : "#ffffff"} distance={1.5} />
          </group>
        ))}
        {flash > 0.02 && <mesh position={[te[0], te[1], 0.82]} material={glow("#ffffff", q(flash))}><sphereGeometry args={[0.3, 16, 12]} /></mesh>}
        {cross > 0.02 && (
          <group>
            <GlowLine points={[[cx - 0.25, cy - 0.25, 0.85], [cx + 0.25, cy + 0.25, 0.85]]} color="#ff3b3b" width={9} k={1} opacity={cross} />
            <GlowLine points={[[cx - 0.25, cy + 0.25, 0.85], [cx + 0.25, cy - 0.25, 0.85]]} color="#ff3b3b" width={9} k={1} opacity={cross} />
          </group>
        )}
        <Label3D at={[topP[0], topP[1], topP[2]]} offset={[0.2, 0.55, 0]} text="first" start={first} px={56} color={TECH.amber} align="center" />
        <Label3D at={[-2.2, 1.3, 0.8]} offset={[0, 0.3, 0]} text="illustration" start={2} end={top} px={46} color="#c9d3e6" align="center" />
        <Label3D at={[cx, cy, 0.85]} offset={[0.3, -0.6, 0]} text="no meeting" start={again} px={52} color="#ff6b6b" align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Bust;
