// Promise (2D blueprint): the engineer's sheet unrolls on "why" with the hanger detail drawing on; "WEAK
// STEEL?" types beside it on "weak" and is struck through in red on "steel"; on "change" the camera pushes in
// as the one rod splits into two; a revision cloud draws round the split on "agreed"; the telephone in the
// corner rings on "phone".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { MonoLabel, useDisasterLook } from "../../disaster/index";
import { Elev, Phone, ramp, Sheet, UB_Y } from "./elev";

const Cloud: React.FC<{ x: number; y: number; r: number; k: number; color: string }> = ({ x, y, r, k, color }) => {
  if (k <= 0) return null;
  const n = 14;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r * 0.8], p1 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r * 0.8];
    d += `${i ? "" : `M ${p0[0]} ${p0[1]} `}A ${r * 0.24} ${r * 0.24} 0 0 1 ${p1[0]} ${p1[1]} `;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />;
};

const Inner: React.FC<{ t: number; ev: Record<string, number> }> = ({ t, ev }) => {
  const L = useDisasterLook();
  const strike = ramp(t, ev.steel!, 10);
  return (
    <g>
      <g>
        <Elev t={t} cx={620} at={{ roof: ev.why! - 30, upper: ev.why! - 22, lower: ev.why! - 14, rod: ev.why! - 6, nuts: ev.why! + 4 }} split={ramp(t, ev.change!, 24)} />
        <Cloud x={620} y={UB_Y + 30} r={190} k={ramp(t, ev.agreed!, 18)} color={L.label} />
      </g>
      <MonoLabel x={1170} y={330} t={t} at={ev.weak} text="weak steel?" size={64} color={L.ink} />
      {strike > 0 && <line x1={1150} y1={308} x2={1150 + 640 * strike} y2={308} stroke={L.fail} strokeWidth={10} strokeLinecap="round" />}
      <MonoLabel x={1170} y={480} t={t} at={ev.change} text="one change" sub="two rods, not one" size={56} />
      <Phone x={1480} y={740} t={t} k={ramp(t, ev.agreed! - 10, 10)} ring={ev.phone} s={1.5} />
      
      
    </g>
  );
};

const Promise: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ev = { why: m.at("why", 4), weak: m.at("weak", 40), steel: m.at("steel", 52), change: m.at("change", 80), agreed: m.at("agreed", 100), phone: m.at("phone", 130) };
  const zoom = 1 + 0.06 * ramp(m.t, ev.change, 30) + 0.03 * (m.t / Math.max(1, m.end));
  return (
    <Sheet t={m.t} zoom={zoom} cx={960 - 60 * ramp(m.t, ev.change, 30)} cy={540}>
      <Inner t={m.t} ev={ev} />
    </Sheet>
  );
};

export default Promise;
