// "Stranger still, most of it isn't green at all: {fact3} of the island lies under one giant sheet of ice."
// Close on Greenland: green grass sprouts along the coast on "Stranger" and flickers on "green"; the camera
// glides inland on "island"; white ice spreads from the middle on "lies" and covers almost all of it on
// "giant", where a sign with the share stands on the ice; snow drifts across on "ice".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, rng } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Atlantic, IceSheet, SNOW, Sign } from "./props";

type Params = { fig?: { share?: string } };
const FLAKES = (() => { const r = rng("v0219-snow"); return Array.from({ length: 40 }, () => [r() * 1080, r() * 1500, 4 + r() * 7, r() * 6.28] as const); })();

const ShareSign: React.FC<{ k: number; share: string }> = ({ k, share }) => {
  const xy = useAt()([-41, 73]);
  return xy ? <Sign x={xy[0]} y={xy[1] + 70} w={420} text={share} sub="UNDER ICE" k={k} size={96} bg="#ffffff" /> : null;
};

const Ice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.share ?? "";
  const str = m.at("stranger", 4), most = m.at("most", 12), all = m.at("all", 30), green = m.at("green", 22), isl = m.at("island", 40), lies = m.at("lies", 50), giant = m.at("giant", 66), ice = m.at("ice", 80);
  const glide = m.lerp([isl - 4, giant + 10], [0, 1]);
  const grass = m.lerp([str, str + 12], [0, 1]) * (1 - 0.25 * m.pulse(green + 4, 6));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.15 - 0.12 * m.lerp([giant - 4, giant + 18], [0, 1]) + m.wave(90, 0.008)}>
        <Atlantic center={[-42 + 2 * glide, 71 + 1 * glide - 1.2 * m.lerp([most, most + 14], [0, 1]) * (1 - glide)]} scale={880}
          colors={{ Greenland: { fill: m.t < all ? "#79b05a" : "#a08a55", k: Math.max(0.001, grass) } }}>
          <IceSheet k={m.lerp([lies, giant + 12], [0, 1])} inset={0.9} color={SNOW} />
          <ShareSign k={m.pop(giant, 12)} share={share} />
        </Atlantic>
        {m.t >= ice - 2 ? FLAKES.map(([x, y, r, ph], i) => (
          <circle key={i} cx={(x + m.t * 3 + Math.sin(m.t / 10 + ph) * 20) % 1080} cy={(y + (m.t - ice) * 6) % 1500 + 200} r={r} fill="#ffffff" opacity={0.85 * m.lerp([ice - 2, ice + 8], [0, 1])} />
        )) : null}
      </View>
    </Stage>
  );
};

export default Ice;
