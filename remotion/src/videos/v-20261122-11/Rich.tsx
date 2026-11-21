// Rich: "Families who could pay moved upwind, into big houses with gardens on the clean west side." On the west of the
// city plan: on "Families" a family in top hats stands on the map; on "pay" the father lifts a bag of coins; on
// "upwind" a carriage rolls west against the wind; on "houses" villas pop up; on "gardens" the gardens fill in green;
// on "clean" the sky over the west brightens; on "west" the west half turns green.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Coin, Glow, INK, Stage, View, motion } from "../../flat/kit";
import { CityPlan, Walker } from "./props";

const Carriage: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={-70} cy={-28} rx={34} ry={20} fill="#7a5230" stroke={INK} strokeWidth={4} />
    <rect x={-90} y={-60} width={20} height={34} rx={8} fill="#7a5230" stroke={INK} strokeWidth={4} />
    <rect x={-20} y={-70} width={90} height={56} rx={10} fill="#2f4f7f" stroke={INK} strokeWidth={5} />
    <rect x={0} y={-60} width={30} height={22} fill="#cfe6f0" stroke={INK} strokeWidth={3} />
    {[-6, 56].map((wx) => <g key={wx} transform={`rotate(${-t * 8} ${wx} -8)`}><circle cx={wx} cy={-8} r={18} fill="#f2b134" stroke={INK} strokeWidth={4} /><line x1={wx - 16} y1={-8} x2={wx + 16} y2={-8} stroke={INK} strokeWidth={3} /></g>)}
  </g>
);

const Rich: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fa = m.at("families", 4), pa = m.at("pay", 18), up = m.at("upwind", 30), ho = m.at("houses", 50), ga = m.at("gardens", 64), cl = m.at("clean", 78), we = m.at("west", 92);
  const push = m.lerp([ho, ho + 14], [0, 1]);
  const roll = m.lerp([up, up + 40], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={1.12 + 0.12 * push - 0.08 * m.lerp([we, we + 12], [0, 1]) + m.wave(80, 0.008)} cx={420 - 40 * push} cy={880}>
        <CityPlan t={m.t} west={0.35 + 0.65 * m.lerp([we, we + 12], [0, 1])} east={1} chim={1} smoke={1} cloud={1} wind={0.8} labels={1} only="west"
          villas={0.15 + 0.45 * m.lerp([ho, ho + 14], [0, 1]) + 0.4 * m.lerp([ga, ga + 14], [0, 1])} terraces={0.3}>
          {cl > 0 ? <Glow x={290} y={800} r={360} color="#fff6c8" o={0.5 * m.lerp([cl, cl + 12], [0, 1])} /> : null}
          <Carriage x={560 - 380 * roll} y={1060} t={m.t * (roll > 0 && roll < 1 ? 1 : 0)} />
          <g opacity={Math.min(1, m.pop(fa, 12) * 2)}>
            <Walker x={330} y={1300} s={64} top="#3a3550" hat face="smirk" t={m.t} armR={[90, 150 + 10 * m.pop(pa, 10)]}
              hold={([hx, hy]) => m.t >= pa ? <g><Ball x={hx + 10} y={hy - 30 - 20 * m.pop(pa, 10)} r={26} fill="#b8935a" sw={4} />{[0, 1].map((i) => <Coin key={i} x={hx - 10 + i * 34} y={hy - 70 - 20 * m.pop(pa, 10) + Math.sin(m.t / 6 + i) * 6} r={14} />)}</g> : null} />
            <Walker x={420} y={1300} s={56} top="#8c3a5a" face="happy" t={m.t} />
          </g>
        </CityPlan>
      </View>
    </Stage>
  );
};
export default Rich;
