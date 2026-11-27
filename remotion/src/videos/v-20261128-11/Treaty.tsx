// "So who wins? In 1959, twelve nations sign a treaty in Washington, and every line on this map freezes." On the
// peninsula the three flags tug and a question mark pops; the camera pulls back to the whole sliced continent, the
// slider lands on the year, the twelve signers' flags line up round the ocean, a pen signs the treaty scroll with the
// count on it, a seal stamps on "Washington", every slice line lights, and on "freezes" frost sweeps over the ice and
// the treaty's 60°S line draws round it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { LatRing } from "../../flat/polar";
import { ALL, AntMap, FlagRing, Floes, Frost, SEA, SIGNERS, Scroll, Slices, YearBar, between, mix } from "./props";

type Params = { fig?: { nations?: string; year?: string } };

const Treaty: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const year = Number(f.year ?? "0");
  const wh = m.at("who", 2), wi = m.at("wins", 10), yr = m.at("year", 22), na = m.at("nations", 40), si = m.at("sign", 50), tr = m.at("treaty", 60), wa = m.at("washington", 72), li = m.at("line", 90), fz = m.at("freezes", 104);
  const whole = { center: [0, -90] as [number, number], scale: 820 };
  const cam = between({ center: [-61.5, -68.5], scale: 2600 }, whole, m.lerp([wi + 6, yr + 30], [0, 1]));
  const frost = m.lerp([fz, fz + 26], [0, 1]);
  const q = m.pop(wi) * (1 - m.lerp([yr + 10, yr + 20], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={870}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={50} />
          <Slices s={ALL({ glow: m.pulse(li + 6, 12), frost })} />
          <Frost k={frost} t={m.t} n={90} />
          <LatRing lat={-60} k={m.lerp([fz, fz + 30], [0, 1])} />
          <FlagRing names={SIGNERS} k={m.lerp([na - 6, na + 16], [0, 1])} t={m.t} />
        </AntMap>
        {q > 0 ? <Txt x={540} y={760 + m.wave(20, 6)} size={150 * q} fill="#fff4d0" stroke={INK}>?</Txt> : null}
      </View>
      <YearBar year={mix(1943, year, m.lerp([yr - 4, yr + 10], [0, 1]))} flash={m.pulse(yr + 8, 8)} k={m.lerp([0, 6], [0.4, 1])} />
      <Scroll x={200} y={420} w={680} k={m.lerp([si - 6, tr + 8], [0, 1])} title="ANTARCTIC TREATY" figure={`${f.nations ?? ""} NATIONS`} sign={m.lerp([si, si + 20], [0, 1])} seal={m.pop(wa)} />
    </Stage>
  );
};
export default Treaty;
