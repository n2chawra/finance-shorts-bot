// Loop: "Green Sahara or melted Antarctica: which what-if should we map next? Tell me in the comments. And picture
// it again:" Africa and Antarctica on one map: a pin glows on the Sahara and on Antarctica on their names, a
// question mark hops between them on "map", a comment bubble pops up on "Tell" and its words write on at
// "comments"; on "picture" the camera dives back to the Sahara and lands on the hook's first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Txt, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { HookMap } from "./Hook";
import { ANTARCTICA, Africa, GOLD, Name, saharaColors } from "./props";

const SAH: [number, number] = [12, 23];

const Hop: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at(SAH), b = at([20, -70]);
  if (!a || !b || k <= 0) return null;
  const u = (Math.sin(t / 9) + 1) / 2;
  return <Txt x={a[0] + 160} y={a[1] + (b[1] - a[1]) * u - Math.abs(Math.sin(t / 4.5)) * 60} size={150 * Math.min(1, k)} fill={GOLD} stroke="#1d1a2b">?</Txt>;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sa = m.at("sahara", 4), an = m.at("antarctica", 20), mp = m.at("map", 40), te = m.at("tell", 56), co = m.at("comments", 66), pic = m.at("picture", 84);
  if (m.t < pic) {
    const bub = m.pop(te, 11);
    const txt = "SAHARA OR ANTARCTICA?";
    const n = Math.round(txt.length * m.lerp([co, co + 12], [0.2, 1]));
    return (
      <Stage p={p} bg="#5f9fae" vignette={0.4}>
        <View zoom={1.02 + m.wave(80, 0.01)}>
          <Africa center={[18, -38]} scale={340} colors={saharaColors(m.lerp([sa, sa + 10], [0, 1]), 1, { Antarctica: { fill: "#f4f8fb", k: m.lerp([an, an + 10], [0.3, 1]) } })}>
            <MapPin at={SAH} k={m.pop(sa, 12)} r={30} />
            <MapPin at={[20, -72]} k={m.pop(an, 12)} r={30} color="#3b7dd8" />
            <Name at={[20, -63]} text="ANTARCTICA" k={m.lerp([an, an + 10], [0, 1])} size={54} />
            <Hop k={m.pop(mp, 10)} t={m.t} />
          </Africa>
          {bub > 0 ? (
            <g transform={`translate(540 360) scale(${bub})`}>
              <path d="M -380 -80 L 380 -80 Q 410 -80 410 -50 L 410 40 Q 410 70 380 70 L -40 70 L -90 120 L -80 70 L -380 70 Q -410 70 -410 40 L -410 -50 Q -410 -80 -380 -80 Z" fill="#ffffff" stroke="#1d1a2b" strokeWidth={6} />
              <Txt x={-360} y={-5} size={52} fill="#1d1a2b" anchor="start">{txt.slice(0, n)}<tspan opacity={0}>{txt.slice(n)}</tspan></Txt>
            </g>
          ) : null}
        </View>
      </Stage>
    );
  }
  const k = m.lerp([pic, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <HookMap t={m.t} green={0} flick={0} hippo={1} sprout={0} scale={700 + 600 * k} center={[14 - 3 * k, 8 + 12 * k]} />
      </View>
      <Flash k={m.pulse(pic, 6)} />
    </Stage>
  );
};

export default Loop;
