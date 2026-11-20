// "Overnight, all {fact1} members of the United Nations become one, and every flag comes down for a single
// new one." The map at dusk: a moon crosses the sky; flags spring up on country after country and a board
// counts the members; UNITED NATIONS stamps on it; the flags lean in on "one", slide down on "flag", and a
// single new flag rises in the middle of the Atlantic on "single".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Limb, SourceLine, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { GOLD, PoleFlag, Sign, World } from "./props";
import { FLAGS } from "./Hook";

type Params = { fig?: { members?: string } };
const MORE: { name: string; at: [number, number] }[] = [
  { name: "Egypt", at: [30, 26] }, { name: "Germany", at: [10, 51] }, { name: "Indonesia", at: [117, -1] }, { name: "Peru", at: [-75, -9] },
  { name: "Sudan", at: [30, 15] }, { name: "Spain", at: [-3.7, 40] }, { name: "Mali", at: [-2, 17] }, { name: "Russia", at: [60, 58] },
];

const NewFlag: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-35, 25]);
  if (!xy || k <= 0) return null;
  const h = 300, up = Math.min(1, k);
  return (
    <g>
      <Limb a={[xy[0], xy[1]]} b={[xy[0], xy[1] - h]} w={12} color="#7a5230" sw={4} />
      <g transform={`translate(${xy[0]} ${xy[1] - 120 - (h - 120) * up}) skewY(${Math.sin(t / 6) * 4})`}>
        <rect x={0} y={0} width={190} height={126} fill="#ffffff" stroke={INK} strokeWidth={5} />
        <circle cx={95} cy={63} r={40} fill="none" stroke={GOLD} strokeWidth={8} />
        <path d="M 55 63 L 135 63 M 95 23 Q 120 63 95 103 Q 70 63 95 23" fill="none" stroke={GOLD} strokeWidth={6} />
      </g>
    </g>
  );
};

const OneFlag: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.members ?? "";
  const fy = m.at("flying", 140), pt = m.at("planet", 155);
  const ov = m.at("overnight", 2), me = m.at("members", 25), un = m.at("united", 45), on = m.at("one", 70), fl = m.at("flag", 95), si = m.at("single", 120);
  const all = [...FLAGS, ...MORE];
  const push = m.lerp([on - 4, on + 14], [0, 1]) * (1 - m.lerp([si - 4, si + 12], [0, 1]));
  return (
    <Stage p={p} bg="#3f6f86" vignette={0.38}>
      <View zoom={1.02 + 0.12 * push - 0.06 * m.lerp([pt - 2, pt + 16], [0, 1]) + m.wave(70, 0.012)}>
        <World center={[15, 22]} scale={330}>
          {all.map((f, i) => <PoleFlag key={f.name} at={f.at} name={f.name} k={i < 8 ? 1 : m.pop(me + (i - 8) * 3, 12)} down={m.lerp([fl + i, fl + i + 14], [0, 1])} s={0.85} t={m.t + i * 3} />)}
          <NewFlag k={m.lerp([si, si + 22], [0, 1])} t={m.t * (1 + 2 * m.lerp([fy, fy + 6], [0, 1]))} />
        </World>
        <Ball x={m.lerp([ov, m.end], [140, 940], (x) => x)} y={300 - 80 * Math.sin(m.lerp([ov, m.end], [0, Math.PI], (x) => x))} r={56} fill="#f4efd0" shadow={false} sw={5} />
      </View>
      <Sign x={540} y={1290} w={480} label="UN MEMBERS" value={countText(n, m.lerp([me, me + 24], [0, 1]))} k={m.pop(me, 12)} />
      <Tag x={250} y={330} w={580} h={96} text="UNITED NATIONS" bg="#4b92db" fg="#ffffff" k={m.pop(un, 12)} rot={-3} />
      <SourceLine p={p} />
    </Stage>
  );
};

export default OneFlag;
