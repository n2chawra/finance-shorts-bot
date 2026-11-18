// Loop: "Iceland or the Faroes: which island should we explain next? Tell me in the comments. And look again at
// that map:" A pin glows on Iceland and on the Faroes on their names, a question mark hops between them on
// "island", a comment bubble pops up on "comments"; on "look" the camera pulls back to the North Atlantic and
// lands on the hook's first frame (Greenland's outline a third drawn), so the Short plays on into its start.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, Txt, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { HookMap } from "./Hook";
import { Atlantic, FAROES, GOLD, ICELAND, Spot } from "./props";

const Hop: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const a = at(ICELAND), b = at(FAROES);
  if (!a || !b || k <= 0) return null;
  const u = (Math.sin(t / 9) + 1) / 2;
  return <Txt x={a[0] + (b[0] - a[0]) * u} y={(a[1] + b[1]) / 2 - 160 - Math.abs(Math.sin(t / 4.5)) * 90} size={150 * Math.min(1, k)} fill={GOLD} stroke="#1d1a2b">?</Txt>;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ic = m.at("iceland", 4), fa = m.at("faroes", 22), isl = m.at("island", 40), com = m.at("comments", 66), exp = m.at("explain", 52), tell = m.at("tell", 60), look = m.at("look", 84);
  if (m.t < look) {
    const bub = m.pop(tell, 11);
    const txt = "ICELAND OR FAROES?";
    const n = Math.round(txt.length * m.lerp([com, com + 12], [0.15, 1]));
    const up = m.lerp([exp, exp + 10], [0, 1]);
    return (
      <Stage p={p} bg="#5f9fae" vignette={0.4}>
        <View zoom={1.02 + m.wave(80, 0.01)}>
          <Atlantic near center={[-12, 63.5]} scale={2600}
            colors={{ Iceland: { fill: "#e9a07e", k: m.lerp([ic, ic + 8], [0, 1]), lift: up }, "Faeroe Is.": { fill: "#e9a07e", k: m.lerp([fa, fa + 8], [0, 1]), lift: up } }}>
            <MapPin at={ICELAND} k={m.pop(ic, 12)} r={30} />
            <Spot at={[-18.6, 63.2]} name="ICELAND" k={m.lerp([ic, ic + 10], [0, 1])} size={52} />
            <MapPin at={FAROES} k={m.pop(fa, 12)} r={30} color="#3b7dd8" />
            <Spot at={[-6.9, 61.2]} name="FAROES" k={m.lerp([fa, fa + 10], [0, 1])} size={52} left />
            <Hop k={m.pop(isl, 10)} t={m.t} />
          </Atlantic>
          {bub > 0 ? (
            <g transform={`translate(540 520) scale(${bub})`}>
              <path d="M -330 -80 L 330 -80 Q 360 -80 360 -50 L 360 40 Q 360 70 330 70 L -40 70 L -90 120 L -80 70 L -330 70 Q -360 70 -360 40 L -360 -50 Q -360 -80 -330 -80 Z" fill="#ffffff" stroke="#1d1a2b" strokeWidth={6} />
              <Txt x={-300} y={-5} size={52} fill="#1d1a2b" anchor="start">{txt.slice(0, n)}<tspan opacity={0}>{txt.slice(n)}</tspan></Txt>
            </g>
          ) : null}
        </View>
      </Stage>
    );
  }
  const k = m.lerp([look, m.end], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <HookMap t={m.t} draw={1 - 0.65 * k} label={1} canada={1 - k} europe={1 - k} line={1 - k} dk={1 - k} q={0}
          scale={630 + 250 * k} center={[-28 - 14 * k, 64 + 6 * k]} />
      </View>
      <Flash k={m.pulse(look, 6)} />
    </Stage>
  );
};

export default Loop;
