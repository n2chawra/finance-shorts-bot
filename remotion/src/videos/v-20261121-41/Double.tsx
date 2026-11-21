// Double: "That's {fact3} times the load. How long could it hold?"
// The two arrows merge into one fat red arrow on the upper nut ("That's"); the figure stamps onto it and
// the load gauge swings past the design line ("load"); the bottom flange bows round the nut ("long") and
// turns red, the camera in close on it ("hold").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { ANTON, Flat } from "./World";
import { BEAM, JointSvg, UPPER_X } from "./JointSvg";

type Params = { fig?: { times?: string } };

const Double: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const times = (p.beat.params as Params).fig?.times ?? "";
  const n = parseFloat(times) || 1;
  const thats = m.at("that's", 3), load = m.at("load", 18), long = m.at("long", 36), hold = m.at("hold", 50);
  const merge = m.lerp([thats, thats + 10], [0, 1]);
  const stampK = m.pop(load, 9, 220);
  const bend = m.lerp([long, hold + 10], [0, 1]);
  const stress = m.lerp([long, hold + 6], [0.3, 1]);
  const zoom = m.lerp([0, load], [1.0, 1.02]) + m.lerp([hold - 6, hold + 10], [0, 0.22]);
  const cy = m.lerp([hold - 6, hold + 10], [900, BEAM.y + BEAM.h + 120]);
  const shake = m.pulse(hold + 4, 8) * 6 * Math.sin(m.t * 3);
  const by = BEAM.y + BEAM.h + BEAM.t;
  const gaugeK = 1 + (n - 1) * m.lerp([load, load + 16], [0, 1]);
  return (
    <Flat t={m.t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540 + shake} cy={cy}>
          <JointSvg t={m.t} open={1} labels={false} bend={bend} stress={stress}
            arrows={{ own: 1 - merge, below: 1 - merge, merged: merge }} />
          {stampK > 0 && (
            <g transform={`translate(${UPPER_X + 150} ${by + 250}) rotate(-6) scale(${1.5 - 0.5 * stampK})`} opacity={Math.min(1, stampK * 1.5)}>
              <text x={0} y={0} fontFamily={ANTON} fontSize={180} fill="#ff3b30" stroke="#1c1c20" strokeWidth={6} paintOrder="stroke">{`×${times}`}</text>
              <text x={6} y={64} fontFamily="'Courier Prime', monospace" fontWeight={700} fontSize={46} fill="#f4efe7" letterSpacing={3}>THE LOAD</text>
            </g>
          )}
          {/* the load on one nut against its design load (the line at one), filling past it to red */}
          <g transform="translate(160 300)">
            <MonoLabel t={m.t} at={-60} x={0} y={-24} text="LOAD ON ONE NUT" size={46} color="#f4f8ff" />
            <rect x={0} y={0} width={760} height={110} fill="rgba(10,30,80,0.7)" stroke="#f4f8ff" strokeWidth={5} rx={8} />
            <rect x={6} y={6} width={748 * gaugeK / n} height={98} fill={gaugeK > 1.02 ? "#ff3b30" : "#ffd84a"} rx={5} />
            <line x1={760 / n} y1={-14} x2={760 / n} y2={124} stroke="#f4f8ff" strokeWidth={8} />
            <MonoLabel t={m.t} at={-60} x={760 / n} y={176} text="DESIGN LOAD" size={46} color="#f4f8ff" anchor="middle" />
          </g>
        </View>
      </svg>
    </Flat>
  );
};
export default Double;
