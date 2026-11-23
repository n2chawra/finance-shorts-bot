// "It already has, more than {fact1} times in the last eight million years, desert to green and back again."
// A flip-counter board stands up on the Libyan sand on "already" and flips to the figure on "times"; the
// camera pulls back over all of Africa on "million"; the Sahara goes sand on "desert", washes green on "green"
// and back to sand on "back".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Africa, Board, Dunes, saharaColors } from "./props";

type Params = { fig?: { times?: string } };

const Counter: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()([17, 25]);
  return xy ? <Board x={xy[0]} y={xy[1] + 40} w={580} text={text} sub="GREEN SAHARAS" k={k} size={110} /> : null;
};

const Already: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const times = (p.beat.params as Params).fig?.times ?? "";
  const bg = m.at("biggest", 2), fp = m.at("flipping", 90), al = m.at("already", 20), tm = m.at("times", 30), mil = m.at("million", 52), de = m.at("desert", 66), gr = m.at("green", 76), back = m.at("back", 88);
  const pull = m.lerp([mil - 4, mil + 18], [0, 1]);
  const green = m.lerp([gr, gr + 8], [0, 1]) * (1 - m.lerp([back, back + 8], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <Africa center={[15, 22 - 10 * pull]} scale={1250 - 600 * pull} colors={saharaColors(green, m.lerp([de - 2, de + 6], [0.85, 1]))}>
          <Dunes k={(1 - green) * m.lerp([bg, bg + 8], [0.4, 1])} t={m.t} />
          <g transform={`translate(${m.t >= fp ? Math.sin(m.t * 2.2) * 5 * (1 - m.lerp([fp, fp + 14], [0, 1])) : 0} 0)`}><Counter k={m.pop(al, 12)} text={m.t < tm - 6 ? "- -" : countText(times, m.lerp([tm - 6, tm + 10], [0.1, 1]))} /></g>
        </Africa>
      </View>
    </Stage>
  );
};

export default Already;
