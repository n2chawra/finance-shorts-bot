// Speed: "It was doing {fact2} miles an hour."
// Low beside the rails as the runaway's tank cars streak past: the speed dial sweeps up ("doing"), the
// needle swings into the red ("miles"), the figure lands on the dial as sparks fly off the wheels ("hour").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, ANTON, Consist, CREAM, Line, MONO, RED, Shot3D, TownLights, Trees } from "./World";
import { V, X0 } from "./Hook";

type Params = { fig?: { speed?: string } };

/** The speed dial over the shot: a needle sweeping to `value` of `max`, the figure big in Anton. */
const Dial: React.FC<{ k: number; value: number; text: string }> = ({ k, value, text }) => {
  const r = 170, cx = 270, cy = 760, max = 80;
  const a = (v: number) => (-225 + 270 * Math.max(0, Math.min(1, v / max))) * (Math.PI / 180);
  const v = value * k;
  const arc = (v0: number, v1: number, rr: number) => {
    const [x0, y0] = [cx + Math.cos(a(v0)) * rr, cy + Math.sin(a(v0)) * rr], [x1, y1] = [cx + Math.cos(a(v1)) * rr, cy + Math.sin(a(v1)) * rr];
    return `M${x0},${y0} A${rr},${rr} 0 ${(v1 - v0) / max * 270 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 }}>
      <circle cx={cx} cy={cy} r={r + 20} fill="rgba(8,10,14,0.78)" stroke="rgba(244,239,231,0.35)" strokeWidth={3} />
      <path d={arc(0, max, r - 10)} stroke="rgba(244,239,231,0.25)" strokeWidth={12} fill="none" />
      <path d={arc(0, Math.max(0.01, v), r - 10)} stroke={v > 55 ? RED : AMBER} strokeWidth={16} fill="none" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(a(v)) * (r - 34)} y2={cy + Math.sin(a(v)) * (r - 34)} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={14} fill={CREAM} />
      <text x={cx} y={cy + 112} textAnchor="middle" fontFamily={ANTON} fontSize={110} fill={CREAM}>{k >= 0.999 ? text : String(Math.round(v))}</text>
      <text x={cx} y={cy - r - 40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={48} letterSpacing={4} fill={CREAM}>MPH</text>
    </svg>
  );
};

const Speed: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const text = (p.beat.params as Params).fig?.speed ?? "";
  const speed = parseFloat(text) || 0;
  const doing = m.at("doing", 2), hour = m.at("hour", 40);
  const k = m.lerp([doing, hour], [0.05, 1]);
  const T0 = X0 + V * 60;
  const keys = direct({}, [
    { at: 0, move: "hold", pos: [2.6, 0.32, 1.25], look: [-6, 0.75, -0.1], fov: 40 },
    { at: hour, move: "pullback", look: [-6, 0.8, -0.1], dir: [0.8, 0.22, 0.4], from: 9.3, to: 11.5, dur: Math.max(10, m.end - hour) },
  ]);
  return (
    <Shot3D f={f} overlay={<Dial k={k} value={speed} text={text} />}>
      <Camera3D keys={keys} seed="lm-speed" drift={0.014} />
      <Focus at={[-4, 0.8, 0]} range={6} />
      <Line length={120} x={-20} />
      <Trees from={-70} to={50} seed="hook-trees" />
      <TownLights at={[40, 0, -14]} spread={[30, 10]} n={110} seed="hook-town" />
      <Consist cars={22} travelled={T0 + V * f} loco={{ lamp: 1, head: 1 }} />
      <pointLight position={[0.6, 0.25, 0.4]} intensity={1.2 + 1.2 * Math.abs(Math.sin(f * 1.7)) * k} distance={2.5} color="#ffb060" />
    </Shot3D>
  );
};
export default Speed;
