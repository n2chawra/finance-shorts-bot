// "But most of them chose to sail all the way back." The whole Atlantic: the ship turns round at England on "most";
// a row of grey houses in England stays dark on "chose"; on "sail" it sails the whole way south; on "back" the camera
// settles on Tristan and the village lights come on again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { ENGLAND, House, Isle, Ocean, Ship, TRISTAN } from "./props";

const ROUTE: [number, number][] = [ENGLAND, [-9, 45], [-20, 20], [-20, -10], [-13, -36.4]];

const Places: React.FC<{ grey: number; lit: number; rain: number; t: number }> = ({ grey, lit, rain, t }) => {
  const at = useAt();
  const tt = t;
  const e = at(ENGLAND), tr = at(TRISTAN);
  return (
    <g>
      {e ? [0, 1, 2].map((i) => <House key={i} x={e[0] + 50 + i * 48} y={e[1] + 40} s={44} k={grey} roof="#8d8a92" />) : null}
      {e && rain > 0 ? (
        <g opacity={Math.min(1, rain)}>
          {[0, 1, 2, 3].map((i) => <line key={`r${i}`} x1={e[0] + 70 + i * 34} y1={e[1] - 40 + ((tt * 4 + i * 13) % 40)} x2={e[0] + 62 + i * 34} y2={e[1] - 20 + ((tt * 4 + i * 13) % 40)} stroke="#7d8db8" strokeWidth={6} strokeLinecap="round" />)}
          <ellipse cx={e[0] + 120} cy={e[1] - 70} rx={110} ry={45} fill="#9a98a6" stroke="#1d1a2b" strokeWidth={5} />
        </g>
      ) : null}
      {tr ? [0, 1, 2, 3].map((i) => <House key={`t${i}`} x={tr[0] - 70 + i * 46} y={tr[1] - 40 - (i % 2) * 16} s={44} k={1} lit={lit} />) : null}
    </g>
  );
};

const Back: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mo = m.at("most", 4), mi = m.at("missed", 30), ho = m.at("home", 40), ch = m.at("chose", 54), bk = m.at("back", 80);
  const home = m.lerp([bk - 8, bk + 14], [0, 1]);
  const scale = 600 * Math.pow(2.6, home);
  const center: [number, number] = [0 - 12.3 * home, -6.5 - 28 * home];
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <Ocean center={center} scale={scale}>
          <Isle at={TRISTAN} r={24 + 20 * home} t={m.t} glow={Math.max(m.pulse(ho + 8, 12), m.lerp([bk, bk + 10], [0, 1]))} />
          <MapLabel at={[ENGLAND[0] - 14, ENGLAND[1] + 4]} text="ENGLAND" size={56} />
          <Places grey={m.pop(mo, 11)} lit={m.lerp([bk, bk + 10], [0, 1])} rain={m.lerp([mi, mi + 8], [0, 1])} t={m.t} />
          <MapRoute via={ROUTE} k={m.lerp([ch, bk], [0.03, 1])} color="#ffd84a" width={8}
            mover={(x, y, a) => <Ship x={x} y={y - 12} s={100} angle={a} kind="steam" t={m.t} crew={1} />} />
          <MapLabel at={[TRISTAN[0] + 1, TRISTAN[1] + 4 - 2.5 * home]} text="HOME" size={60} type={m.lerp([bk, bk + 10], [0, 1])} fill="#ffd84a" />
        </Ocean>
      </View>
    </Stage>
  );
};

export default Back;
