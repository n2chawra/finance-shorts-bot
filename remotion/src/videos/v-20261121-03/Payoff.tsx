// "So {fact3} people live on the loneliest island on Earth because one prisoner was once locked up next door." The
// South Atlantic: the islanders line Tristan's shore with their head count on "people"; the village glows on
// "loneliest"; the camera rises on "Earth"; Napoleon lights up on Saint Helena on "prisoner"; a bright line ties
// the two islands on "locked"; a NEXT DOOR sign stamps on the line on "door" as the camera pulls wide.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Folk, HELENA, Isle, Napoleon, Ocean, Ruler, Sign, TRISTAN } from "./props";

type Params = { fig?: { people?: string } };

const Figures: React.FC<{ t: number; folk: number; nap: number; n: string; sign: number; door: number }> = ({ t, folk, nap, n, sign, door }) => {
  const at = useAt();
  const h = at(HELENA), tr = at(TRISTAN);
  if (!h || !tr) return null;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => <Folk key={i} x={tr[0] - 100 + i * 50} y={tr[1] - 50} s={52} k={folk} coat={["#3b6fb8", "#6d9a4c", "#f2b134", "#d9483b", "#7d8db8"][i]!} t={t} />)}
      {nap > 0 ? <Glow x={h[0] - 270} y={h[1] - 60} r={170} color="#ffd84a" o={0.6 * nap} /> : null}
      {nap > 0 ? <g opacity={Math.min(1, nap * 2)}><Napoleon x={h[0] - 270} y={h[1] + 10} s={80 * Math.min(1, nap)} face="sad" /></g> : null}
      <Sign x={Math.max(250, tr[0] - 40)} y={Math.min(1335, tr[1] + 200)} w={480} text={`${n} PEOPLE`} k={sign} size={64} />
      <Sign x={Math.min(700, (h[0] + tr[0]) / 2 + 230)} y={(h[1] + tr[1]) / 2 + 30} w={420} text="NEXT DOOR?" k={door} size={64} bg="#ffe6a8" />
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.people ?? "";
  const pe = m.at("people", 6), lo = m.at("loneliest", 24), ea = m.at("earth", 40), pr = m.at("prisoner", 56), lk = m.at("locked", 74), dr = m.at("door", 90);
  const rise = m.lerp([ea - 4, pr + 10], [0, 1]);
  const wide = m.lerp([dr - 6, dr + 16], [0, 1]);
  const scale = 1500 - 150 * rise - 150 * wide;
  const center: [number, number] = [-9 + 1 * rise, -31 + 1 * rise];
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <Ocean center={center} scale={scale}>
          <MapRoute via={[TRISTAN, HELENA]} k={1} color="#f4efe4" width={6} />
          <Ruler from={TRISTAN} to={HELENA} k={m.lerp([lk, lk + 18], [0, 1])} color="#ffd84a" />
          <Isle at={TRISTAN} r={40} t={m.t} glow={m.lerp([lo, lo + 10], [0, 1])} name="TRISTAN" size={54} below />
          <Isle at={HELENA} r={30} t={m.t} name="SAINT HELENA" nameK={m.lerp([pr - 10, pr + 4], [0, 1])} size={54} />
          <Figures t={m.t} folk={Math.max(0.6, m.pop(pe, 11))} nap={m.pop(pr, 11)} n={n} sign={m.pop(pe + 4, 11) * (1 - m.lerp([ea, ea + 10], [0, 1]))} door={m.pop(dr, 10)} />
        </Ocean>
      </View>
    </Stage>
  );
};

export default Payoff;
