// East: "बिहार गौरैया, झारखंड कोयल, बंगाल किलकिला। पर दक्षिण में ये क्या?" Bihar, Jharkhand and West Bengal paint in with
// their birds; on "दक्षिण" the camera swings south over the pale peninsula and on "क्या" question tags blink on three states.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { FillBeat } from "./Fill";
import { EAST, F, ROLLER, SPOT, StateTag, lerpFrame } from "./props";

const East: React.FC<SceneProps> = (p) => (
  <FillBeat p={p} id="east" names={EAST} events={["bihar", "jharkhand", "bangal"]} from={lerpFrame(F.west, F.east, 0.4)} to={F.east}
    drift={F.south} driftAt="dakshin"
    tagAt={{ Bihar: [85.8, 25.8], Jharkhand: [85.4, 23.6], "West Bengal": [88.0, 22.6] }}>
    {(m) => {
      const ky = m.at("kya", m.end - 20);
      return <g>{ROLLER.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text="?" k={m.pop(ky + i * 3, 9)} size={56} bg="#ffc43d" dy={-40} />)}</g>;
    }}
  </FillBeat>
);
export default East;
