// "What flips it? Earth wobbles slowly on its axis, and when the wobble tilts more summer sun onto North
// Africa, the monsoon rains push north, deep into the sand." A small globe rises over the Mediterranean on
// "flips"; its axis traces a slow circle on "wobbles" and glows on "axis"; a sun swings round on "summer" and its
// rays land on North Africa on "Africa"; rain clouds gather over the Gulf of Guinea on "monsoon", slide north on
// "north", and rain darkens the dunes on "sand".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Glow, INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Africa, Dunes, GOLD, saharaColors } from "./props";

const Globe: React.FC<{ x: number; y: number; k: number; ang: number; glow: number }> = ({ x, y, k, ang, glow }) => {
  if (k <= 0) return null;
  const tip = [Math.sin(ang) * 40, -150] as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k)})`}>
      <ellipse cx={0} cy={-150} rx={44} ry={12} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="10 8" opacity={0.8} />
      <Ball x={0} y={0} r={110} fill="#4a8fc4" shadow sw={6} />
      <path d="M -60 -40 Q -20 -70 20 -40 Q 40 0 0 30 Q -50 40 -60 -40 Z" fill="#7cb35a" stroke={INK} strokeWidth={4} />
      <path d="M 30 50 Q 60 30 80 60 Q 60 90 30 80 Z" fill="#7cb35a" stroke={INK} strokeWidth={4} />
      <line x1={-tip[0]} y1={150} x2={tip[0]} y2={tip[1]} stroke={glow > 0 ? GOLD : INK} strokeWidth={8 + 6 * glow} strokeLinecap="round" />
    </g>
  );
};

const Rain: React.FC<{ lat: number; k: number; t: number; fall: number }> = ({ lat, k, t, fall }) => {
  const at = useAt();
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {[-12, -4, 4, 12, 20, 28].map((lon, i) => {
        const xy = at([lon, lat + Math.sin(i) * 1.2]);
        if (!xy) return null;
        return (
          <g key={i} transform={`translate(${xy[0] + Math.sin(t / 12 + i) * 6} ${xy[1] - 60})`}>
            {fall > 0 ? [0, 1, 2].map((d) => <line key={d} x1={-24 + d * 24} y1={30 + ((t * 6 + d * 20) % 50)} x2={-30 + d * 24} y2={50 + ((t * 6 + d * 20) % 50)} stroke="#cfe7f7" strokeWidth={5} opacity={fall} />) : null}
            <Ball x={-26} y={0} r={30} fill="#e8eef4" shadow={false} sw={4} />
            <Ball x={14} y={-10} r={40} fill="#e8eef4" shadow={false} sw={4} />
            <Ball x={48} y={4} r={26} fill="#e8eef4" shadow={false} sw={4} />
          </g>
        );
      })}
    </g>
  );
};

const Rays: React.FC<{ k: number; sx: number; sy: number }> = ({ k, sx, sy }) => {
  const xy = useAt()([10, 21]);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {[-120, -40, 40, 120].map((dx, i) => (
        <line key={i} x1={sx} y1={sy} x2={sx + (xy[0] + dx - sx) * Math.min(1, k)} y2={sy + (xy[1] - sy) * Math.min(1, k)} stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
      ))}
      <Glow x={xy[0]} y={xy[1]} r={260 * Math.min(1, k)} color={GOLD} o={0.45} />
    </g>
  );
};

const Wobble: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fl = m.at("flips", 4), wo = m.at("wobbles", 22), ax = m.at("axis", 36), su = m.at("summer", 64), af = m.at("africa", 80), mo = m.at("monsoon", 98), no = m.at("north", 112), sa = m.at("sand", 126);
  const ti = m.at("tilts", 56), sl = m.at("slowly", 28), dp = m.at("deep", 120);
  const ang = (m.t < sl ? 0 : (m.t - sl) / 14) + (m.t < wo ? 0 : 0.2) + 0.5 * m.lerp([ti, ti + 10], [0, 1]);
  const sunA = m.lerp([su - 6, su + 12], [0, 1]);
  const sx = 900 - 120 * sunA, sy = 300 + 40 * (1 - sunA);
  const wet = m.lerp([sa, sa + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.05 - 0.05 * m.lerp([mo - 4, mo + 16], [0, 1]) + m.wave(80, 0.008)}>
        <Africa center={[8, 20]} scale={1150} colors={saharaColors(0.0, 1, {})}>
          <Dunes k={1} t={m.t} />
          {wet > 0 ? <g opacity={0.55 * wet}>{[[0, 21], [10, 19], [-6, 20], [18, 20], [4, 23]].map((c, i) => <Spot key={i} at={c as [number, number]} r={60 + 40 * wet} />)}</g> : null}
          <Rays k={m.lerp([af - 4, af + 8], [0, 1])} sx={sx} sy={sy} />
          <Rain lat={m.lerp([no, no + 24], [8, 19]) + m.lerp([dp, dp + 12], [0, 3])} k={m.lerp([mo, mo + 10], [0, 1])} t={m.t} fall={m.lerp([m.at("rains", 104), m.at("rains", 104) + 6], [0, 1])} />
        </Africa>
        <Globe x={300} y={420} k={m.pop(fl, 12)} ang={ang} glow={m.pulse(ax + 6, 10)} />
        {sunA > 0 ? <g><Glow x={sx} y={sy} r={140} color={GOLD} o={0.7} /><Ball x={sx} y={sy} r={70 * Math.min(1, sunA)} fill={GOLD} shadow={false} sw={5} /></g> : null}
      </View>
    </Stage>
  );
};

const Spot: React.FC<{ at: [number, number]; r: number }> = ({ at, r }) => {
  const xy = useAt()(at);
  return xy ? <ellipse cx={xy[0]} cy={xy[1]} rx={r} ry={r * 0.6} fill="#5a8f3e" /> : null;
};

export default Wobble;
