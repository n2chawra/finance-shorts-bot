// Loop: "One cheque each, or the pile stays with them: which would you pick? So"
// Back at the rocket launch pad at dusk: Rohan holds up his cheque on "cheque", the gold mountain beside the rocket
// glows behind him on "pile", he looks from one to the other on "pick", and on "So" the camera settles on the rocket
// and the coin mountain under ALL BILLIONAIRES, the hook's first frame.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Pad } from "./Hook";
import { Cheque } from "./props";

type Params = { fig?: { each?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const each = (p.beat.params as Params).fig?.each ?? "";
  const cheque = m.at("cheque", 4), pile = m.at("pile", 20), pick = m.at("pick", 40), so = m.at("so", 55);
  const lift = m.lerp([cheque - 2, cheque + 8], [0, 1], Easing.out(Easing.back(1.4)));
  const glow = m.pulse(pile + 4, 14);
  const settle = m.lerp([so - 6, so + 4], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([pile - 4, pile + 12], [0, 1], Easing.inOut(Easing.cubic));
  const lookAt: [number, number] = m.t >= pick ? (Math.floor((m.t - pick) / 10) % 2 ? [1, -0.4] : [-1, -0.4]) : [0, 0];
  // the end frame matches the hook's opening framing (zoom 1.12, centre 560/880)
  const zoom = 1.06 - 0.06 * wide + (1.12 - 1.0) * settle;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2b2350" vignette={0.38}>
        <View zoom={zoom} cx={560 + m.wave(50, 10)} cy={940 - 60 * settle + m.wave(64, 8)}>
          <Pad m={m} swell={0} flag={0} others={0}>
            <Glow x={730} y={1050} r={380} color="#ffd34a" o={0.5 * glow} />
            <g>
              <Char x={480} y={1340 + m.wave(50, 3)} s={150} who="rohan" face={m.t >= pick ? "worried" : "happy"} look={lookAt}
                armR={[60 + 100 * lift, 50 + 100 * lift]} armL={[25, 15]} />
            </g>
            {/* the cheque, held out in front of him */}
            <g transform={`translate(${300 + 40 * lift} ${640 - 60 * lift}) rotate(${-6 * lift})`} opacity={Math.min(1, lift * 1.5)}>
              <Cheque x={0} y={0} w={420} amount={each} k={lift} />
            </g>
          </Pad>
        </View>
      </Stage>
      {settle > 0 ? (
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: settle }}>
          <Txt x={540} y={330} size={64} fill="#ffffff" stroke="#1d1a2b">ALL BILLIONAIRES</Txt>
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export default Loop;
