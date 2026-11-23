// "And yet every day about {fact1} barrels of oil squeeze through it, {fact2} of all the oil that moves by sea."
// The strait's northern mouth: a day sign lights, tankers stream in, the barrels stack on a deck under the figure,
// the leader slips into the lane, oil drops flow along it and a buoy dial fills to the share.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { GOLD, LANE, Line, SEAsia, Tanker, tipOf } from "./props";

type Params = { fig?: { barrels?: string; share?: string } };

const Fleet: React.FC<{ t: number; go: number; n: number }> = ({ t, go, n }) => {
  const at = useAt();
  return <g>{Array.from({ length: n }, (_, i) => { const tip = tipOf(at, LANE, Math.max(0, go - i * 0.06)); return tip ? <Tanker key={i} x={tip[0]} y={tip[1]} s={i === 0 ? 95 : 70} rot={tip[2]} t={t + i * 5} /> : null; })}</g>;
};

const Barrels: React.FC<{ k: number; stamp: number; text: string; go: number }> = ({ k, stamp, text, go }) => {
  const at = useAt();
  const tip = tipOf(at, LANE, go);
  if (!tip || k <= 0) return null;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={tip[0] - 60 + (i % 3) * 40} y={tip[1] - 90 - Math.floor(i / 3) * 40} width={34} height={38} rx={6} fill="#2d2d3a" stroke={INK} strokeWidth={3} opacity={Math.min(1, k * 5 - i)} />)}
      {stamp > 0 ? <Tag x={tip[0] - 210} y={tip[1] - 300} w={420} h={110} text={`${text} BARRELS`} size={50} k={stamp} rot={-3} /> : null}
    </g>
  );
};

const Dial: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  if (k <= 0) return null;
  const a = Math.PI * 2 * 0.29 * Math.min(1, k);
  const [cx, cy, r] = [760, 360, 120];
  const d = `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${a > Math.PI ? 1 : 0} 1 ${cx + r * Math.sin(a)},${cy - r * Math.cos(a)} Z`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#f4f1ea" stroke={INK} strokeWidth={8} />
      <path d={d} fill="#2d2d3a" stroke={INK} strokeWidth={4} />
      <Txt x={cx} y={cy + r + 70} size={62} fill="#ffffff" stroke={INK}>{text}</Txt>
      <Txt x={cx} y={cy + r + 130} size={46} fill={GOLD} stroke={INK}>OF SEA OIL</Txt>
    </g>
  );
};

const FAR: [number, number][] = [[94.6, 3.2], [96.2, 8.4], [95.0, 5.4], [97.0, 2.0]];
const Far: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  return <g>{FAR.map((s, i) => { const xy = at(s); return xy && k > 0 ? <g key={i}><circle cx={xy[0]} cy={xy[1]} r={60} fill="#ffe08a" opacity={0.35 * k} /><Tanker x={xy[0]} y={xy[1]} s={55} rot={-30} k={k} t={t + i * 11} /></g> : null; })}</g>;
};

const Glint: React.FC<{ go: number; k: number }> = ({ go, k }) => {
  const tip = tipOf(useAt(), LANE, go);
  return tip && k > 0 ? <path d={`M${tip[0] + 40},${tip[1] - 70} q-16,24 0,34 q16,-10 0,-34 Z`} fill="#2d2d3a" stroke="#ffe08a" strokeWidth={4} transform={`scale(1)`} opacity={k} /> : null;
};

const Oil: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ye = m.at("yet", 2), ev = m.at("every", 8), da = m.at("day", 14), ab = m.at("about", 20), ba = m.at("barrels", 40), al = m.at("all", 96), sq = m.at("squeeze", 50), th = m.at("through", 58), oi = m.at("oil", 80), mv = m.at("moves", 100), se = m.at("sea", 110);
  const back = m.lerp([ye, ev + 10], [0, 1]);
  const go = m.lerp([da, m.end], [0.05, 0.42]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.05 * m.lerp([sq, th + 8], [0, 1]) + m.wave(80, 0.008)}>
        <SEAsia center={[98.6 - 1.2 * back, 4.2 + 0.6 * back]} scale={5200 - 1200 * back} colors={{ Malaysia: { fill: "#e0b46a" }, Indonesia: { fill: "#c9c27a" } }}>
          <Line via={LANE} k={m.lerp([al, al + 24], [0, 1])} color="#2d2d3a" w={10} dash ink={false} o={0.8} />
          <Fleet t={m.t} go={go} n={m.t < da ? 1 : 5} />
          {m.t >= oi ? <Glint go={go} k={m.pulse(oi + 6, 10)} /> : null}
          <Barrels k={m.lerp([ab, ba + 6], [0.2, 1])} stamp={m.pop(ba, 10)} text={f.barrels ?? ""} go={go} />
          <Far k={m.pop(mv, 10)} t={m.t} />
        </SEAsia>
      </View>
      {m.t >= ev ? <Tag x={110} y={240} w={330} h={100} text="EVERY DAY" size={52} k={m.pop(ev, 10)} rot={-4} /> : null}
      <Dial k={m.lerp([se - 2, se + 18], [0, 1])} text={f.share ?? ""} />
    </Stage>
  );
};

export default Oil;
