// "And {fact2} people still live on this lonely piece of Russia, cut off from home." The city's board counts up the
// people; tiny people fill the piece; windows light across the land; the neighbours dim as the camera pushes in; the
// piece's border lights up in Russia's flag; a dashed line reaches east towards Russia and fades.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Display, Glow, Stage, View, countText, motion, rng } from "../../flat/kit";
import { MapRoute } from "../../flat/map";
import { Map, On, Piece, Walker } from "./props";

type Params = { fig?: { people?: string } };

const SPOTS = (() => { const r = rng("kal-people"); return Array.from({ length: 16 }).map(() => [20.0 + r() * 2.4, 54.45 + r() * 0.6] as [number, number]); })();

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const people = (p.beat.params as Params).fig?.people ?? "";
  const an = m.at("and", 0), pe = m.at("people", 60), sl = m.at("still", 70), li = m.at("live", 26), lo = m.at("lonely", 44), ru = m.at("russia", 60), ho = m.at("home", 80);
  const close = m.lerp([lo - 4, lo + 18], [0, 1]);
  const dim = m.lerp([lo, lo + 16], [0, 1]);
  const fill = m.lerp([pe, sl + 30], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35 + 0.15 * dim}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.1, 54.45 + 0.1 * close]} scale={11000 + 2200 * close} colors={{
          Poland: { fill: "#7a6a58", k: 0.6 * dim }, Lithuania: { fill: "#7a6a58", k: 0.6 * dim }, Russia: { fill: "#e8d4a2", k: 0 },
        }}>
          <Piece k={1} fill="#e05a4a" flagK={m.lerp([ru, ru + 14], [0, 1])} trace={m.lerp([ru, ru + 24], [0, 1])} glow={0.4 + 0.4 * Math.sin(m.t / 8)} />
          {SPOTS.map((s, i) => <On key={i} at={s} draw={(x, y) => (
            <g>
              {m.lerp([li, li + 20], [0, 1]) * 16 > i ? <Glow x={x + 20} y={y - 30} r={26} color="#ffe08a" o={0.85} /> : null}
              {fill * 16 > i ? <Walker x={x} y={y} s={52} color={i % 3 ? "#3f6fb0" : "#c8102e"} step={m.t / 4 + i} /> : null}
            </g>
          )} />)}
          <MapRoute via={[[22.9, 54.9], [24.8, 55.1]]} k={m.lerp([ho, ho + 14], [0, 1])} color="#ffe08a" width={10} />
        </Map>
        <Display x={250} y={330} w={580} h={210} label="PEOPLE LIVE HERE" value={countText(people, m.lerp([an + 4, pe], [0, 1]))} k={m.pop(an, 10)} />
      </View>
    </Stage>
  );
};
export default Payoff;
