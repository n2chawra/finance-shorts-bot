// "Then the volcano erupted, and all {fact5} islanders were shipped to England." Tristan close: the island shakes on
// "volcano"; lava and a tall ash cloud burst out on "erupted"; a sign with the head count lifts off the village on
// "islanders"; on "shipped" the camera pulls far back to the whole Atlantic and a ship carries them north, landing
// at England, where a pin drops, on "England".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute } from "../../flat/map";
import { BigIsle, CAPE, ENGLAND, Folk, House, Isle, LAVA, Ocean, Patterns, SEA, Ship, Sign, TRISTAN } from "./props";
import { INK } from "../../flat/kit";

type Params = { fig?: { islanders?: string } };

const ROUTE: [number, number][] = [TRISTAN, [5, -35.5], CAPE, [8, -20], [-2, 0], [-18, 25], [-8, 46], ENGLAND];

const Erupt: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.islanders ?? "";
  const vo = m.at("volcano", 4), er = m.at("erupted", 14), bs = m.at("beside", 28), vi = m.at("village", 40), al = m.at("all", 50), is = m.at("islanders", 34), sh = m.at("shipped", 56), en = m.at("england", 80);
  const wide = m.t >= sh;
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.38}>
      <Patterns />
      {!wide ? (
        <g>
          <rect x={-200} y={-200} width={1480} height={2320} fill={SEA} />
          <View zoom={1.15 + 0.05 * m.lerp([0, sh], [0, 1])} cy={880}>
            <BigIsle x={540} y={860} r={300} t={m.t} shake={m.lerp([vo, er], [0.3, 1]) * (1 - m.lerp([er + 20, sh], [0, 0.7]))} erupt={m.lerp([er, er + 16], [0, 1])} />
            {[0, 1, 2, 3].map((i) => <House key={i} x={540 - 0.72 * 300 + i * 40 + 4 * m.pulse(vi + 4, 6) * Math.sin(m.t * 2 + i)} y={860 - 0.62 * 300 + i * 30} s={46} k={1} />)}
            {[0, 1, 2, 3, 4].map((i) => <Folk key={`f${i}`} x={540 - 0.95 * 300 + i * 34} y={860 - 0.2 * 300 + i * 8} s={44} k={m.pop(al + i * 2, 11)} coat={["#3b6fb8", "#6d9a4c", "#f2b134", "#d9483b", "#7d8db8"][i]!} t={m.t} />)}
            {m.t >= bs ? <path d={`M 540 860 Q 470 760 ${540 - 120 * m.lerp([bs, bs + 20], [0, 1])} ${860 - 150 * m.lerp([bs, bs + 20], [0, 1])}`} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" /> : null}
            {m.t >= bs ? <path d={`M 540 860 Q 470 760 ${540 - 120 * m.lerp([bs, bs + 20], [0, 1])} ${860 - 150 * m.lerp([bs, bs + 20], [0, 1])}`} fill="none" stroke={LAVA} strokeWidth={22} strokeLinecap="round" /> : null}
            <Sign x={540} y={1300 - 120 * m.lerp([is, is + 14], [0, 1])} w={560} text={`${n} ISLANDERS`} k={m.pop(is, 11)} size={66} />
          </View>
        </g>
      ) : (
        <View zoom={1 + m.wave(90, 0.01)}>
          <Ocean center={[0, -6.5]} scale={600}>
            <Isle at={TRISTAN} r={24} t={m.t} />
            <MapRoute via={ROUTE} k={m.lerp([sh, en + 4], [0.03, 1])} color="#f4efe4" width={8}
              mover={(x, y, a) => <Ship x={x} y={y - 12} s={100} angle={a} kind="steam" t={m.t} crew={1} />} />
            <MapPin at={ENGLAND} k={m.pop(en, 11)} r={30} />
            <MapLabel at={[ENGLAND[0] - 14, ENGLAND[1] + 4]} text="ENGLAND" size={56} type={m.lerp([en, en + 12], [0, 1])} />
            <MapLabel at={[TRISTAN[0] - 3, TRISTAN[1] - 6]} text="TRISTAN" size={50} />
          </Ocean>
          <Sign x={760} y={1320} w={500} text={`${n} ISLANDERS`} k={1} size={62} />
        </View>
      )}
      <Flash k={m.pulse(sh, 5) * 0.7} />
    </Stage>
  );
};

export default Erupt;
