// "On this simplified map, everything to the east, Somalia, eastern Ethiopia and Kenya, and Tanzania's coast, breaks
// off as one giant island." The step sign turns to FINALLY; the land east of the new sea lights up piece by piece
// (Somalia with its flag, then Ethiopia's and Kenya's east, then Tanzania's coast), the whole piece slides away into
// the Indian Ocean and ISLAND writes on it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Flood, Island as Piece, Map, RiftSea, SeaMarks, mix, mixLL } from "./props";

const Island: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const si = m.at("simplified", 4), ea = m.at("east", 30), so = m.at("somalia", 44), et = m.at("ethiopia", 66), ke = m.at("kenya", 76), ta = m.at("tanzania's", 90), br = m.at("breaks", 112), is = m.at("island", 136), dr = m.at("drifting", 150), io = m.at("indian", 170);
  const drift = m.lerp([br, br + 40], [0, 150]) + m.lerp([dr, m.end], [0, 60]);
  const mid = m.lerp([br, br + 30], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 - 0.04 * m.lerp([si, si + 24], [0, 1]) + m.wave(80, 0.008)}>
        <Map center={mixLL([36.5, 3.0], [40.0, 2.0], mid)} scale={mix(1400, 1650, mid)}
          colors={{
            Somalia: { fill: "#4189dd", flag: "Somalia", k: m.lerp([so, so + 12], [0, 1]), trace: m.lerp([so, so + 26], [0, 1]) },
            Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 0.7 + 0.3 * m.pulse(et + 6, 12) },
            Kenya: { fill: "#c9604a", flag: "Kenya", k: 0.7 + 0.3 * m.pulse(ke + 6, 12) },
            Tanzania: { fill: "#7fb6d9", flag: "Tanzania", k: m.lerp([ta, ta + 12], [0.4, 1]) },
          }}>
          <SeaMarks t={m.t + 40 * m.lerp([io, io + 20], [0, 1])} />
          <Flood k={1} />
          <Piece tint={m.lerp([ea, ea + 14], [0, 1])} cover={m.lerp([br, br + 8], [0, 1])} drift={drift} label={m.pop(is)} />
          <RiftSea k={1} w={54 + 0.6 * drift} />
        </Map>
      </View>
    </Stage>
  );
};
export default Island;
