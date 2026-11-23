// "In the end it became the independent Kingdom of Lesotho, a country of mountains with South Africa on every
// side." Back over the land: a crown drops on it, the British flag lifts away, Lesotho's flag fills it, peaks rise
// across it, South Africa glows round it and arrows point in from every side as the border flashes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BLUE, Crown, LESOTHO_C, LesothoEdge, Map, Peaks, Planted } from "./props";

const DIRS = [0, 60, 120, 180, 240, 300];

const Arrows: React.FC<{ k: number[] }> = ({ k }) => {
  const c = useAt()(LESOTHO_C);
  if (!c) return null;
  return (
    <g>
      {DIRS.map((d, i) => {
        const q = k[i] ?? 0;
        if (q <= 0) return null;
        const a = (d * Math.PI) / 180;
        const r0 = 520 - 60 * Math.min(1, q), r1 = 380;
        const [x0, y0] = [c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0 * 0.85];
        const [x1, y1] = [c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1 * 0.85];
        const ang = Math.atan2(y1 - y0, x1 - x0);
        return (
          <g key={i} opacity={Math.min(1, q * 2)}>
            <Limb a={[x0, y0]} b={[x1, y1]} w={16} color="#e03c31" />
            <path d={`M${x1 + Math.cos(ang) * 30},${y1 + Math.sin(ang) * 30} L${x1 + Math.cos(ang + 2.4) * 30},${y1 + Math.sin(ang + 2.4) * 30} L${x1 + Math.cos(ang - 2.4) * 30},${y1 + Math.sin(ang - 2.4) * 30} Z`} fill="#e03c31" stroke="#1d1a2b" strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

const Things: React.FC<{ crown: number; uk: number; t: number }> = ({ crown, uk, t }) => {
  const at = useAt();
  const c = at([LESOTHO_C[0] - 0.2, LESOTHO_C[1] + 0.35]), f = at([LESOTHO_C[0] + 0.45, LESOTHO_C[1] + 0.1]);
  return (
    <g>
      {f && uk < 1 ? <g transform={`translate(0,${-900 * uk})`} opacity={1 - uk}><Planted x={f[0]} y={f[1]} s={110} k={1} name="United Kingdom" wave={Math.sin(t / 7)} /></g> : null}
      {c && crown > 0 ? <g transform={`translate(0,${-200 * (1 - Math.min(1, crown))})`} opacity={Math.min(1, crown * 2)}><Crown x={c[0]} y={c[1]} s={120} /></g> : null}
    </g>
  );
};

const Kingdom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const en = m.at("end", 4), be = m.at("became", 12), ind = m.at("independent", 22), le = m.at("lesotho", 44), mo = m.at("mountains", 62), so = m.at("south", 76), ev = m.at("every", 88), si = m.at("side", 96);
  const wide = m.lerp([ev - 6, ev + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.08 * m.lerp([en, le], [0, 1]) * (1 - wide) + m.wave(80, 0.008)}>
        <Map center={[LESOTHO_C[0], LESOTHO_C[1] - 0.35]} scale={11000 - 2500 * wide} colors={{
          Lesotho: { fill: BLUE, k: 0.85, flag: m.t >= le ? "Lesotho" : undefined },
          "South Africa": { fill: "#e0a060", k: 0.3 + 0.7 * m.lerp([so, so + 14], [0, 1]) },
        }}>
          <Peaks k={m.lerp([mo, mo + 20], [0, 1])} s={60} />
          <Things crown={m.pop(be, 12)} uk={m.lerp([ind, ind + 20], [0, 1])} t={m.t} />
          <Arrows k={DIRS.map((_, i) => m.pop(ev + i * 2, 12))} />
          <LesothoEdge k={1} w={10 + 8 * m.pulse(si + 6, 12)} color={m.t >= si ? "#ffffff" : "#ffe08a"} />
          <MapLabel at={[LESOTHO_C[0], LESOTHO_C[1] - 1.15]} text="LESOTHO" size={60} k={m.pop(le, 12)} />
        </Map>
      </View>
    </Stage>
  );
};

export default Kingdom;
