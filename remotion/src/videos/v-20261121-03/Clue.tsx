// "So why here at all? The clue is on that neighbour to the north." A question mark hops off Tristan on "why"; on
// "all" the camera glides north over the ocean; a magnifying glass slides across the sea on "clue", Saint Helena
// comes into its lens on "neighbour" and glows under the glass on "north".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { HELENA, Isle, Ocean, QMark, TRISTAN } from "./props";

const Glass: React.FC<{ k: number; slide: number }> = ({ k, slide }) => {
  const h = useAt()(HELENA);
  if (!h || k <= 0) return null;
  const x = h[0] + 360 * (1 - slide), y = h[1] - 20 + 420 * (1 - slide);
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.08, k)})`}>
      <circle r={130} fill="#ffffff" opacity={0.12} />
      <circle r={130} fill="none" stroke={INK} strokeWidth={26} />
      <circle r={130} fill="none" stroke="#f2b134" strokeWidth={14} />
      <path d="M 92 92 L 210 210" stroke={INK} strokeWidth={46} strokeLinecap="round" />
      <path d="M 96 96 L 206 206" stroke="#7a4a26" strokeWidth={30} strokeLinecap="round" />
    </g>
  );
};

const Hop: React.FC<{ k: number; t: number; up: number }> = ({ k, t, up }) => {
  const xy = useAt()(TRISTAN);
  return xy ? <QMark x={xy[0] + 40} y={xy[1] - 130 - 220 * up} k={k} t={t} size={170} /> : null;
};

const Clue: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wh = m.at("why", 6), al = m.at("all", 16), cl = m.at("clue", 34), nb = m.at("neighbour", 52), no = m.at("north", 66);
  const go = m.lerp([al, nb + 6], [0, 1]);
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <Ocean center={[-12 + 6.4 * go, -35 + 18.5 * go]} scale={1700 - 300 * go}>
          <Isle at={TRISTAN} r={38} t={m.t} name="TRISTAN" nameK={1 - Math.min(1, go * 2.5)} size={54} />
          <Isle at={HELENA} r={34} t={m.t} glow={m.lerp([no, no + 10], [0, 1])} />
          <Hop k={m.pop(wh, 10) * (1 - m.lerp([cl, cl + 10], [0, 1]))} t={m.t} up={m.lerp([wh, cl], [0, 1])} />
          <Glass k={Math.max(0.85, m.pop(cl, 12))} slide={m.lerp([0, nb + 4], [0, 1])} />
          <MapLabel at={[HELENA[0], HELENA[1] + 7]} text="SAINT HELENA" size={58} type={m.lerp([nb, nb + 14], [0, 1])} />
        </Ocean>
      </View>
    </Stage>
  );
};

export default Clue;
