// "It opened in {fact5}, built inside the rock, so the national park above still looks wild." By the dam,
// a ribbon is cut and a plaque shows the year; on "rock" the hall is covered over with rock; the camera
// pulls up to Snowdonia, where the park's boundary draws itself round the mountains and its name stamps on;
// on "wild" a hiker walks over the mountain and trees and goats pop up on its slopes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { Cavern, ELIDIR, HALL, Lake, MARCHLYN, Mountain, PERIS, Sign, Valley } from "./props";

type Params = { fig?: { year?: string } };

const Ribbon: React.FC<{ cut: number; year: string; k: number }> = ({ cut, year, k }) => {
  const xy = useAt()(HALL);
  if (!xy) return null;
  const x = Math.max(320, Math.min(700, xy[0])), y = Math.max(520, Math.min(700, xy[1] - 260));
  return (
    <g>
      <Sign x={x} y={y} w={400} label="OPENED" value={year} k={k} />
      {cut < 1 ? <path d={`M${x - 200},${y + 30} L${x + 200},${y + 30}`} stroke="#d9483b" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${200 - 200 * cut} ${400 * cut + 1}`} /> : null}
    </g>
  );
};

/** Grass closing over the hall: the opening shrinks under a green lid as `k` goes 0 -> 1. */
const GrassLid: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(HALL);
  if (!xy || k <= 0) return null;
  return <ellipse cx={xy[0]} cy={xy[1]} rx={260 * k + 1} ry={170 * k + 1} fill="#9cbf78" opacity={Math.min(1, k * 1.3)} />;
};

const Wild: React.FC<{ k: number; walk: number; t: number }> = ({ k, walk, t }) => {
  const at = useAt();
  const xy = at(ELIDIR);
  if (!xy || k <= 0) return null;
  const trees = [[-260, 120], [-200, 210], [220, 150], [270, 60], [-300, -40]];
  return (
    <g>
      {trees.map(([dx, dy], i) => {
        const s = Math.max(0, Math.min(1, k * 3 - i * 0.4));
        return s > 0 ? <g key={i}><Ball x={xy[0] + dx!} y={xy[1] + dy!} r={42 * s} fill="#3a7d44" sw={5} /></g> : null;
      })}
      {[[-150, -120], [160, -60]].map(([dx, dy], i) => <Ball key={`g${i}`} x={xy[0] + dx! + Math.sin(t / 15 + i) * 8} y={xy[1] + dy!} r={22 * Math.min(1, k * 2)} fill="#efe7da" sw={4} />)}
      <Char x={xy[0] - 220 + 360 * walk} y={xy[1] + 40 + Math.abs(Math.sin(t / 5)) * -6} s={70} face="happy" armL={[30 + 20 * Math.sin(t / 5), 10]} armR={[30 - 20 * Math.sin(t / 5), 10]} />
    </g>
  );
};

const Hidden: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const yr = (p.beat.params as Params).fig?.year ?? "";
  const bu = m.at("built", 30), ab = m.at("above", 100);
  const op = m.at("opened", 6), rk = m.at("rock", 40), na = m.at("national", 70), pk = m.at("park", 85), wi = m.at("wild", 115);
  const up = m.lerp([na - 4, na + 18], [0, 1]);
  const close = m.lerp([rk - 2, rk + 14], [0, 1]) * (1 - up);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <Valley center={[-4.095 + 0.02 * up, 53.126 + 0.004 * up]} scale={700000 * (1 + 0.3 * close) * (1 - 0.35 * up)}>
          <Mountain glow={0.8 * m.pulse(ab + 6, 10)} />
          <Lake at={MARCHLYN} rx={170} ry={100} level={1} seed={2} rot={-0.3} t={m.t} />
          <Lake at={PERIS} rx={240} ry={60} level={0.7} seed={5} rot={-0.65} t={m.t} />
          <Cavern open={1} n={6} spin={m.t * 2} lit={0.6 + m.pulse(bu + 4, 8)} />
          <GrassLid k={m.lerp([rk, rk + 14], [0, 1])} />
          {m.t > rk + 12 ? <Cavern open={1} n={6} spin={0} ghost={1} /> : null}
          <Ribbon cut={m.lerp([op + 6, op + 16], [0, 1])} year={yr} k={m.pop(op, 12)} />
          <Boundary k={m.lerp([na, na + 22], [0, 1])} />
          <Wild k={m.lerp([wi, wi + 20], [0, 1])} walk={m.lerp([wi, m.end], [0, 1])} t={m.t} />
        </Valley>
      </View>
      <Tag x={240} y={260} w={600} h={120} text="NATIONAL PARK" bg="#3a9d5d" fg="#ffffff" k={m.pop(pk, 12)} rot={-3} />
    </Stage>
  );
};

const Boundary: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(ELIDIR);
  if (!xy || k <= 0) return null;
  const pts = Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2;
    const r = 1 + 0.08 * Math.sin(a * 4) + 0.05 * Math.sin(a * 7);
    return `${(xy[0] - 30 + Math.cos(a) * 430 * r).toFixed(1)},${(xy[1] + Math.sin(a) * 520 * r).toFixed(1)}`;
  });
  return (
    <path d={`M${pts.join(" L")} Z`} fill="none" stroke="#2f7d3c" strokeWidth={14} strokeDasharray="34 18" strokeLinejoin="round"
      transform={`translate(${xy[0] - 30} ${xy[1]}) scale(${k}) translate(${-(xy[0] - 30)} ${-xy[1]})`} />
  );
};

export default Hidden;
