// Twist: "That morning, the deck stopped bouncing and began to twist. Why was that worse?"
// Grey morning light along the deck from beside the west tower, hangers and cable framing it ("morning"); the
// deck rides up and down evenly ("deck"); the bouncing dies away ("stopped"); the deck rolls, near edge up, far
// edge down, its centre line still ("twist"); the rolling edge flashes amber ("worse").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, Cam, CREAM, DECK_Y, Gertie, Narrows, PHASE, Shot3D, sm, SPAN, Tag } from "./World";

const Twist: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const stopped = m.at("stopped", 30), twistAt = m.at("twist", 55), worse = m.at("worse", 80);
  const bounce = 0.22 * (1 - sm((f - stopped) / 14));
  const twist = 0.8 * sm((f - twistAt) / 18);
  const hot = 0.7 * sm((f - worse) / 10);
  const close = f >= stopped && f < twistAt;
  const wide = f >= twistAt;
  const pos: [number, number, number] = wide
    ? [-SPAN / 2 - 2.5 + 0.02 * (f - twistAt), DECK_Y + 2.6, 4.2]
    : close ? [-SPAN / 2 + 4, DECK_Y - 0.25, 1.1] : [-SPAN / 2 + 1.2 + 0.01 * f, DECK_Y + 0.6, 0.9];
  const look: [number, number, number] = wide ? [-3, DECK_Y, 0] : close ? [-SPAN / 2 + 8, DECK_Y + 0.1, 0] : [-2, DECK_Y + 0.1, 0];
  return (
    <Shot3D f={f}
      overlay={
        <>
          <Tag t={f} at={0} top={360} text="THAT MORNING" color={CREAM} size={50} />
          {f >= stopped && f < twistAt ? <Tag t={f} at={stopped} top={460} text="BOUNCE STOPS" color={CREAM} size={50} /> : null}
          {wide ? <Tag t={f} at={twistAt} top={460} text="NOW IT TWISTS" color={AMBER} size={56} /> : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={wide ? 44 : 46} seed="tac-twist" range={wide ? 10 : 6} />
      <Narrows f={f} />
      <Gertie bounce={bounce} waves={3} twist={twist} phase={PHASE(f)} hot={hot} />
    </Shot3D>
  );
};
export default Twist;
