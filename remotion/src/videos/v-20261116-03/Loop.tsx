// Loop: "Would you check your attic now?"
// Back in the bare storeroom: a dusty sheet slides off a stack of old frames on "check", the camera drifts back
// to the painting on "attic", and on "now" the camera settles into the hook's first framing.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BackRoom } from "./Hook";

type Params = { fig?: { old?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const old = (p.beat.params as Params).fig?.old ?? "";
  const check = m.at("check", 6), attic = m.at("attic", 16), now = m.at("now", 26);
  const k = m.lerp([attic, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 0.98 + 0.1 * k, cx = 610 - 80 * k, cy = 820 - 60 * k;
  const sheet = m.lerp([check - 2, check + 12], [0, 1], Easing.out(Easing.cubic));
  return (
    <Stage p={p} bg="#2e241c" vignette={0.5}>
      <View zoom={zoom} cx={cx + m.wave(70, 4)} cy={cy}>
        <BackRoom m={m} old={old} tag={1} stamp={0} plate={now} />
        {/* the dusty sheet over the frames, pulled away */}
        <path d={`M ${850 + sheet * 300} ${740 - sheet * 200} Q ${1000 + sheet * 300} ${700 - sheet * 260} ${1150 + sheet * 300} ${760 - sheet * 200} L ${1150 + sheet * 300} ${1080 - sheet * 300} L ${850 + sheet * 300} ${1080 - sheet * 300} Z`}
          fill="#d9d0bc" stroke="#1d1a2b" strokeWidth={5} opacity={1 - sheet * 0.9} />
      </View>
    </Stage>
  );
};

export default Loop;
