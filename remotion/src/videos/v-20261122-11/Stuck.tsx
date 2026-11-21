// Stuck: "Rich streets kept pulling in rich families, and cheap streets kept pulling in the poor, long after the
// smoke was gone." The city plan today, no chimneys: on "Rich" a moving van drives into the green west; on
// "families" a family steps out at a villa; on "cheap" the camera pushes east as a second van drives into the grey
// east; on "poor" a family carries boxes into a terrace; on "long" cars and buses run the streets; on "gone" the
// camera pulls back over both halves.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { CityPlan, Walker } from "./props";

const Van: React.FC<{ x: number; y: number; color: string; flip?: boolean }> = ({ x, y, color, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-60} y={-56} width={84} height={56} rx={8} fill={color} stroke={INK} strokeWidth={5} />
    <path d="M 24 -40 L 52 -40 L 66 -18 L 66 0 L 24 0 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={32} y={-34} width={20} height={14} fill="#cfe6f0" stroke={INK} strokeWidth={3} />
    {[-36, 40].map((wx) => <circle key={wx} cx={wx} cy={2} r={14} fill="#2b2530" stroke={INK} strokeWidth={4} />)}
  </g>
);

const Box: React.FC<{ x: number; y: number }> = ({ x, y }) => <rect x={x} y={y} width={34} height={28} fill="#c9955a" stroke={INK} strokeWidth={3} />;

const Stuck: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ri = m.at("rich", 2), fa = m.at("families", 22), ch = m.at("cheap", 36), po = m.at("poor", 60), lo = m.at("long", 70), go = m.at("gone", 96), ge = m.at("generation", 112);
  const east = m.lerp([ch, ch + 16], [0, 1]);
  const back = m.lerp([go, go + 16], [0, 1]);
  const g2 = m.lerp([ge, ge + 22], [0, 1]);
  const v1 = m.lerp([ri, ri + 22], [0, 1]) * (1 - g2 * 0) , v2 = m.lerp([ch, ch + 22], [0, 1]);
  return (
    <Stage p={p} bg="#7cc0de" vignette={0.3}>
      <View zoom={1.3 - 0.32 * back + m.wave(80, 0.008)} cx={330 + 420 * east * (1 - back) + 210 * back} cy={1120 - 220 * back}>
        <CityPlan t={m.t} west={1} east={1} villas={1} terraces={1} chim={0} smoke={0} labels={0} line={1} traffic={m.lerp([lo, lo + 10], [0, 1])}>
          <g transform="translate(0 0)"><Van x={-80 + 380 * v1} y={1180} color="#3fae6a" /></g>
          {m.t >= fa ? <g opacity={m.pop(fa, 10)}><Walker x={330} y={1310} s={56} top="#3a3550" face="happy" t={m.t} /><Walker x={400} y={1310} s={48} top="#c9543f" face="happy" t={m.t} /></g> : null}
          <Van x={1160 - 380 * v2} y={1180} color="#8c8a90" flip />
          {ge > 0 && m.t >= ge ? <g><Van x={-80 + 380 * g2} y={1170} color="#3a78c9" /><Van x={1160 - 380 * g2} y={1170} color="#a07a5a" flip /></g> : null}
          {m.t >= po ? <g opacity={m.pop(po, 10)}><Walker x={760} y={1310} s={56} top="#6b5a4a" t={m.t} armR={[150, 170]} armL={[150, 170]} /><Box x={740} y={1080} /><Walker x={850} y={1310} s={50} top="#4a5a6b" t={m.t} /></g> : null}
        </CityPlan>
      </View>
    </Stage>
  );
};
export default Stuck;
