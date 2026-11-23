// "Last time, grass covered the dunes and lakes filled the basins. Hippos, crocodiles and giraffes lived where
// camels walk today." The camera glides south over the desert on "Last"; green paints across from the south on
// "grass" and the dune marks fade on "dunes"; a great lake fills at Chad on "lakes"; a hippo pops up in it on
// "Hippos", a crocodile slides along the shore on "crocodiles", a giraffe stands up on "giraffes"; on "camels"
// the green drains back to sand and a camel walks where the giraffe stood.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Africa, CHAD_LAKE, Camel, Croc, Dunes, Giraffe, Hippo, LAKE, Name, saharaColors } from "./props";

const Lake: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(CHAD_LAKE);
  if (!xy || k <= 0) return null;
  const r = 190 * Math.min(1, k);
  return (
    <g>
      <path d={`M ${xy[0] - r} ${xy[1]} Q ${xy[0] - r * 0.8} ${xy[1] - r * 0.7} ${xy[0]} ${xy[1] - r * 0.62} Q ${xy[0] + r * 1.1} ${xy[1] - r * 0.6} ${xy[0] + r} ${xy[1] + r * 0.1} Q ${xy[0] + r * 0.7} ${xy[1] + r * 0.7} ${xy[0]} ${xy[1] + r * 0.6} Q ${xy[0] - r * 1.05} ${xy[1] + r * 0.55} ${xy[0] - r} ${xy[1]} Z`}
        fill={LAKE} stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${xy[0] - 80 + i * 60} ${xy[1] - 10 + i * 30 + Math.sin(t / 8 + i) * 4} q 15 -10 30 0`} fill="none" stroke="#cfe7f7" strokeWidth={5} opacity={Math.min(1, k)} />)}
    </g>
  );
};

const Animals: React.FC<{ hip: number; cro: number; gir: number; cam: number; t: number }> = ({ hip, cro, gir, cam, t }) => {
  const at = useAt();
  const l = at(CHAD_LAKE), g = at([9, 19.5]);
  if (!l || !g) return null;
  return (
    <g>
      <Hippo x={l[0] - 20} y={l[1] + 20 + Math.sin(t / 9) * 3} s={190} k={hip} />
      <Croc x={l[0] - 60 + 60 * Math.min(1, cro)} y={l[1] + 150} s={190} k={cro} />
      <g opacity={1 - Math.min(1, cam)}><Giraffe x={g[0]} y={g[1]} s={190} k={gir} /></g>
      <Camel x={g[0]} y={g[1]} s={190} k={cam} />
    </g>
  );
};

const Last: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const la = m.at("last", 2), gr = m.at("grass", 14), du = m.at("dunes", 26), lk = m.at("lakes", 38), hi = m.at("hippos", 62), cr = m.at("crocodiles", 74), gi = m.at("giraffes", 84), ca = m.at("camels", 104);
  const glide = m.lerp([la, gr + 20], [0, 1]);
  const close = m.lerp([hi - 4, hi + 14], [0, 1]);
  const green = m.lerp([gr, du + 14], [0, 1]) * (1 - 0.9 * m.lerp([ca, ca + 12], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <Africa center={[13 + 2 * close, 24 - 6 * glide - 2 * close]} scale={1200 + 500 * close} colors={saharaColors(green)}>
          <Dunes k={1 - m.lerp([du, du + 10], [0, 1]) + m.lerp([ca, ca + 12], [0, 1])} t={m.t} />
          <Lake k={m.lerp([lk, lk + 16], [0, 1]) * (1 - 0.6 * m.lerp([ca, ca + 12], [0, 1]))} t={m.t} />
          <Name at={[17, 18.6]} text="LAKE" k={m.lerp([lk + 6, lk + 14], [0, 1]) * (1 - close)} size={56} />
          <Animals hip={m.pop(hi, 12)} cro={m.lerp([cr, cr + 14], [0, 1])} gir={m.pop(gi, 12)} cam={m.lerp([ca, ca + 12], [0, 1])} t={m.t} />
        </Africa>
      </View>
    </Stage>
  );
};

export default Last;
