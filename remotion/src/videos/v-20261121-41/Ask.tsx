// Ask: "The change was never fully checked. So whose job was it?"
// The investigator's cause chain writes on down the board ("change"); the link into FULL CHECK snaps red
// ("checked"); a question mark stamps over the broken link ("whose"); the chain pulses ("job").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { CauseChain } from "../../disaster/index";
import { ANTON, Flat } from "./World";

const Ask: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const change = m.at("change", 2), checked = m.at("checked", 30), whose = m.at("whose", 44), job = m.at("engineers", 70);
  const q = m.pop(whose, 9, 200);
  const zoom = m.lerp([0, checked], [1.0, 1.06]) + m.lerp([checked, checked + 10], [0, 0.1]) - m.lerp([whose, whose + 10], [0, 0.12]) + 0.02 * m.pulse(job + 4, 10);
  return (
    <Flat t={m.t} tag="as reported">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={zoom} cx={540} cy={m.lerp([checked, checked + 10], [820, 900])}>
          <CauseChain t={m.t} x={150} y={330} w={780} size={50} vertical
            links={[
              { label: "one long rod", at: change },
              { label: "a phone call", at: change + 6 },
              { label: "two short rods", at: change + 12 },
              { label: "a full check", at: change + 18 },
              { label: "walkways fall", at: change + 24 },
            ]}
            broken={3} breakAt={checked} />
          {q > 0 && (
            <g transform={`translate(860 ${330 + 3 * (46 * 2.4 + 46 * 1.6) - 40}) scale(${1.6 - 0.6 * q})`} opacity={Math.min(1, q * 1.5)}>
              <circle cx={0} cy={-70} r={110} fill="#ff3b30" />
              <text x={0} y={0} textAnchor="middle" fontFamily={ANTON} fontSize={200} fill="#f4efe7">?</text>
            </g>
          )}
        </View>
      </svg>
    </Flat>
  );
};
export default Ask;
