// Payoff: "All because the sea would stand about {fact1} higher than it does today, and their highest ground is nowhere
// near that." On the map of the Indian Ocean, Bangladesh drowned: on "All" a sea gauge post rises out of the sea where
// the Maldives were; on "sea" the water climbs the post; on "stand" the gauge's sign lands on the figure; on "higher"
// the camera pushes in on the gauge; on "highest" a tiny island stands at its foot, far below the line; on "nowhere"
// the camera pulls back over the world with the new coastlines: the Netherlands, Bangladesh and Florida under water.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Drown, FLORIDA, NEW_SEA, Ripples, Shape, Sign, Stars, World } from "./props";

type Params = { fig?: { rise?: string } };
const MALDIVES: [number, number] = [73.3, 3.5];

const Gauge: React.FC<{ k: number; water: number; isle: number; t: number; sign: number; value: string }> = ({ k, water, isle, t, sign, value }) => {
  const xy = useAt()(MALDIVES);
  if (!xy || k <= 0) return null;
  const [x, y] = xy;
  const H = 400 * Math.min(1, k);
  const lvl = y - 20 - 360 * water;
  return (
    <g>
      <Ripples at={MALDIVES} k={1} t={t} />
      {isle > 0 ? (
        <g transform={`translate(${x - 120} ${y - 10}) scale(${Math.min(1, isle)})`}>
          <path d="M -60 0 Q 0 -34 60 0 Z" fill="#e9d9a6" stroke={INK} strokeWidth={4} />
          <Limb a={[0, -20]} b={[4, -70]} w={6} color="#8a5a2e" sw={2} />
          <path d="M 4 -70 q -22 -4 -32 8 M 4 -70 q 20 -8 30 6" stroke="#3f8f4a" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      <rect x={x - 18} y={y - H} width={36} height={H} rx={10} fill="#f4e3bd" stroke={INK} strokeWidth={6} />
      {water > 0 ? <rect x={x - 12} y={lvl} width={24} height={Math.max(0, y - lvl)} rx={6} fill={NEW_SEA} /> : null}
      {Array.from({ length: 8 }, (_, i) => (y - 20 - i * 48 > y - H ? <line key={i} x1={x - 26} y1={y - 20 - i * 48} x2={x + 26} y2={y - 20 - i * 48} stroke={INK} strokeWidth={5} /> : null))}
      {water > 0 ? <path d={`M ${x - 60} ${lvl} q 15 -10 30 0 q 15 10 30 0 q 15 -10 30 0 q 15 10 30 0`} fill="none" stroke="#bfe6f0" strokeWidth={6} /> : null}
      <Sign x={x} y={y - H - 230} label="SEA RISES ABOUT" value={value} k={sign} w={560} />
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const rise = (p.beat.params as Params).fig?.rise ?? "";
  const al = m.at("all", 2), se = m.at("sea", 14), st = m.at("stand", 22), hi = m.at("higher", 50), hg = m.at("highest", 80), no = m.at("nowhere", 100);
  const back = m.lerp([no, no + 24], [0, 1]);
  const push = m.lerp([hi, hi + 14], [0, 1]) * (1 - back);
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.0 + 0.14 * push + m.wave(90, 0.01)} cy={960 - 120 * push}>
        <World center={[76 - 56 * back, 8 + 16 * back]} scale={1100 - 760 * back}
          colors={{ Netherlands: { fill: NEW_SEA, k: 1 }, Bangladesh: { fill: NEW_SEA, k: 1 }, Antarctica: { fill: "#9aa6ad", k: 1 } }}>
          <Drown name="Bangladesh" k={1} t={m.t} />
          <Shape pts={FLORIDA} fill={NEW_SEA} k={0.9} stroke="#9fd3e0" sw={3} />
          <g opacity={1 - 0.85 * back}><Gauge k={m.pop(al, 12)} water={m.lerp([se, st + 24], [0, 1])} isle={m.pop(hg, 12)} t={m.t} sign={m.pop(st - 4, 12)} value={countText(rise, m.lerp([st, st + 20], [0, 1]))} /></g>
        </World>
      </View>
    </Stage>
  );
};
export default Payoff;
