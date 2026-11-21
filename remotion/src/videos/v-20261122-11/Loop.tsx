// Loop: "West side or east side: which half of your city is the rich one? Next time you're there, check the wind,
// and ask:" Back on the old city plan of the first frame: on "West" the west half pulses green; on "east" the east
// half pulses grey; on "half" a comment bubble pops over the river; on "city" the camera glides back to the first
// frame; on "check" the weathervane spins; on "wind" an arrow sweeps east across the city; on "ask" the question
// mark starts to drop onto the east, as in the first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Cartouche, CityPlan, QMark, WindArrow } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const we = m.at("west", 2), ea = m.at("east", 20), ha = m.at("half", 40), ci = m.at("city", 56), te = m.at("tell", 70), ne = m.at("next", 84), ch = m.at("check", 90), wi = m.at("wind", 104), as = m.at("ask", 120);
  const glide = m.lerp([ci, ci + 24], [0, 1]);
  const bub = m.pop(ha, 10) * (1 - m.lerp([ne, ne + 10], [0, 1]));
  const wob = Math.sin((m.t - te) / 2) * 6 * m.pulse(te + 8, 10);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.34}>
      <View zoom={0.94 + 0.08 * glide + m.wave(80, 0.008)} cx={540} cy={920 - 20 * glide}>
        <CityPlan t={m.t} west={0.6 + 0.4 * m.pulse(we + 6, 10)} east={0.6 + 0.4 * m.pulse(ea + 6, 10)} villas={1} terraces={1} line={1} labels={1}
          pennant={1} vane={m.t >= ch ? m.t * 3 : 0} wind={0.6}>
          {wi > 0 ? <WindArrow x={60 + 760 * m.lerp([wi, wi + 20], [0, 1])} y={880} len={260} k={m.lerp([wi, wi + 6], [0, 1])} color="#ffd84a" /> : null}
          {bub > 0 ? (
            <g transform={`translate(540 1000) rotate(${wob}) scale(${bub})`}>
              <rect x={-260} y={-90} width={520} height={150} rx={40} fill="#ffffff" stroke={INK} strokeWidth={7} />
              <path d="M -40 58 L -70 120 L 10 58 Z" fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <Txt x={0} y={-16} size={54} fill={INK}>WEST or EAST?</Txt>
            </g>
          ) : null}
          <QMark x={790} y={760} k={m.lerp([as, m.end], [0, 0.9])} t={m.t} size={240} />
        </CityPlan>
      </View>
      <Cartouche text="OLD ENGLISH CITY" k={glide} y={250} />
    </Stage>
  );
};
export default Loop;
