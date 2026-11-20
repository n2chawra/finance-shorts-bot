// "Yet {fact3} people live here, in one village squeezed under a volcano." Tristan seen from above, close: the
// island and its cone fill the frame on "Yet"; the village sign plants on the north-west shore with the head
// count on "live"; little houses pop along the flat strip on "village"; the surf presses in on "squeezed"; the
// volcano puffs a cloud on "volcano" as the camera eases out.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BigIsle, House, Patterns, SEA, Ship, Sign } from "./props";
import { INK } from "../../flat/kit";

type Params = { fig?: { people?: string } };

const SPOTS: [number, number][] = [[-0.78, -0.42], [-0.62, -0.58], [-0.48, -0.72], [-0.3, -0.84], [-0.7, -0.26], [-0.54, -0.44]];

const People: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const yt = m.at("yet", 2), lv = m.at("live", 22), vl = m.at("village", 40), sq = m.at("squeezed", 56), se = m.at("sea", 66), vo = m.at("volcano", 80), po = m.at("potatoes", 110), lo = m.at("lobster", 140);
  const out = m.lerp([vo - 6, vo + 18], [0, 1]);
  const X = 540, Y = 760, R = 300;
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.38}>
      <Patterns />
      <rect x={-200} y={-200} width={1480} height={2320} fill={SEA} />
      <View zoom={1.22 - 0.2 * out + m.wave(80, 0.01)} cx={500 + 40 * out} cy={720 + 120 * out}>
        <g transform={`translate(${X} ${Y}) scale(${0.92 + 0.08 * m.lerp([yt, yt + 14], [0, 1])}) translate(${-X} ${-Y})`}>
          <BigIsle x={X} y={Y} r={R * (1 - 0.04 * m.pulse(sq + 8, 10) - 0.03 * m.pulse(se + 6, 8))} t={m.t} smoke={m.lerp([vo, vo + 14], [0, 1])} />
          {[0, 1, 2, 3].map((i) => { const k = m.lerp([po + i * 3, po + i * 3 + 10], [0, 1]); return k > 0 ? <rect key={`pt${i}`} x={X - 0.42 * R + i * 34} y={Y - 0.58 * R + i * 10} width={26} height={110 * k} rx={8} fill="#7a5a2e" stroke={INK} strokeWidth={4} transform={`rotate(-40 ${X - 0.42 * R + i * 34} ${Y - 0.58 * R})`} /> : null; })}
          {m.t >= lo ? <g><Ship x={X - 1.25 * R + 60 * m.lerp([lo, m.end], [0, 1])} y={Y - 0.9 * R} s={90 * Math.min(1, m.pop(lo, 11))} kind="steam" t={m.t} crew={1} /><rect x={X - 1.25 * R + 60 * m.lerp([lo, m.end], [0, 1]) - 90} y={Y - 0.9 * R + 20} width={34} height={28} rx={6} fill="#f2b134" stroke={INK} strokeWidth={4} /></g> : null}
          {SPOTS.map(([u, v], i) => <House key={i} x={X + u * R} y={Y + v * R + 16} s={52} k={m.pop(vl + i * 3, 12)} roof={i % 2 ? "#d9483b" : "#3b6fb8"} />)}
        </g>
      </View>
      <Sign x={540} y={1330} w={500} text={`${fig.people ?? ""} PEOPLE`} k={m.pop(lv, 11)} size={70} />
    </Stage>
  );
};

export default People;
