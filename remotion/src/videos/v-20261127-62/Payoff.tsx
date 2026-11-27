// Payoff: "हाँ में पड़े {fact2} वोट, यानी {fact4}, लगभग सारे वोट।" The green pile shoots up past the board on "हाँ", slips
// burst off it on "वोट", the board writes the yes count and a share bar fills almost all green with the share stamped on
// "यानी", the camera pulls back to the whole valley on "लगभग" and the share punches with a low hit on "सारे".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Tag, View, motion } from "../../flat/kit";
import { Board, F, GOLD, MapView, Pile, lerpFrame } from "./props";

type Params = { fig?: { yes?: string; no?: string; share?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ha = m.at("haan", 2), pd = m.at("pade", 12), vt = m.at("vote", 24), ya = m.at("yani", 30), la = m.at("lagbhag", 40), sa = m.at("saare", 52);
  const u1 = Math.round((pd + vt) / 2), u2 = Math.round((ya + la) / 2);
  const wide = m.lerp([la - 2, la + 18], [0, 1]);
  const frame = lerpFrame(F.plains, F.region, wide);
  const bar = m.lerp([ya, ya + 20], [0, 0.9755]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.04 - 0.02 * wide + m.wave(80, 0.01) + 0.04 * m.pulse(sa + 2, 7)}>
        <MapView t={m.t} frame={frame} states={{ Sikkim: { fill: GOLD, lift: 0.3 + 0.5 * m.pulse(sa + 4, 10) } }} dim={0.45} />
        <g transform={`translate(${-60 * wide} ${0}) scale(${1 - 0.25 * wide}) translate(${135 * wide} ${300 * wide})`}>
          <Pile x={300} y={1180} w={200} level={0.22} full={300} color="#e8453c" t={m.t} />
          <Pile x={760} y={1180} w={260} level={m.lerp([ha, pd + 24], [1.1, 2.4])} full={300} color="#3a9d5d" t={m.t} />
        </g>
        <g transform="translate(540 1270)">
          <rect x={-420} y={-34} width={840} height={68} rx={34} fill="#e8453c" stroke="#1d1a2b" strokeWidth={6} opacity={m.lerp([ya - 4, ya + 4], [0, 1])} />
          <rect x={-420} y={-34} width={840 * bar} height={68} rx={34} fill="#3a9d5d" stroke="#1d1a2b" strokeWidth={6} />
        </g>
      </View>
      <Board x={540 + 8 * Math.sin(m.t * 1.7) * m.pulse(pd + 6, 10)} y={420} w={640} h={400} k={1} title="गिनती" rows={[
        { text: "ना", value: f.no ?? "", color: "#ff8a7a", k: 1 },
        { text: "हाँ", value: f.yes ?? "", color: "#8cf0aa", k: m.pop(ya, 10) },
      ]} />
      <Tag x={540} y={700} w={420} h={130} text={f.share ?? ""} size={84} bg="#3a9d5d" fg="#ffffff" k={m.pop(ya + 6, 10) * (1 + 0.15 * m.pulse(sa + 2, 6))} />
      {Array.from({ length: 10 }, (_, i) => {
        const q = m.lerp([vt + i, vt + 18 + i], [0, 1]);
        return q > 0 && q < 1 ? <rect key={i} x={760 + (i - 5) * 40 * q} y={520 - q * 260 + q * q * 200} width={50} height={64} rx={4} fill="#ffffff" stroke="#1d1a2b" strokeWidth={3}
          transform={`rotate(${q * 260 + i * 30} ${785 + (i - 5) * 40 * q} ${552 - q * 260})`} /> : null;
      })}
      <line x1={260} y1={392} x2={260 + 560 * m.lerp([u1, u1 + 10], [0, 1])} y2={392} stroke="#ff8a7a" strokeWidth={8} strokeLinecap="round" />
      {m.t >= u2 ? <path d={`M 770 ${690} l 22 26 l 44 -60`} fill="none" stroke="#8cf0aa" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
        opacity={m.lerp([u2, u2 + 6], [0, 1])} /> : null}
      <Flash k={0.45 * m.pulse(sa, 4)} />
    </Stage>
  );
};
export default Payoff;
