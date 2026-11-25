// Hook: "The Tacoma Narrows Bridge tore itself apart in a {fact2} mile-an-hour wind. How does wind do that?"
// Frame 0: beside the green suspension bridge over grey water, its deck already rolling one edge up and one down,
// the quarter-span amber, the date caption and the reconstruction tag ("Tacoma"); the twist deepens and the
// stress climbs ("tore"); wind streaks cross the frame and a readout swings to the figure ("wind"); pull wide
// along the whole span rolling between its towers ("How").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, Cam, DateCaption, DECK_Y, Gertie, Narrows, PHASE, RED, Shot3D, WindGauge, sm, Tag, WindStreaks, k01 } from "./World";

type Params = { fig?: { wind?: string; year?: string } };

/** The hook's camera at frame f (the loop ends on it). */
export const hookPose = (f: number) => ({
  cam: [-12.6 + 0.006 * f, DECK_Y + 0.95, 1.5 - 0.003 * f] as [number, number, number],
  look: [-6, DECK_Y + 0.35, 0] as [number, number, number],
});

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const tore = m.at("tore", 30), wind = m.at("wind", 20), how = m.at("bridge", 90);
  const wide = f >= how;
  const twist = 0.62 + 0.18 * sm((f - tore) / 30);
  const hot = 0.55 + 0.35 * sm((f - tore) / 30);
  const H = hookPose(f);
  const push = sm((f - wind) / 24);
  const pos: [number, number, number] = wide
    ? [-16 + 0.03 * (f - how), 4.2, 6.5 - 0.01 * (f - how)]
    : [H.cam[0] + 1.4 * push, H.cam[1] - 0.15 * push, H.cam[2] - 0.5 * push];
  const look: [number, number, number] = wide ? [-2, 2.6, 0] : H.look;
  const rd = k01((f - wind) / 10);
  return (
    <Shot3D f={f}
      overlay={
        <>
          <WindStreaks f={f} k={0.4 + 0.6 * k01((f - wind) / 8)} />
          <DateCaption t={f} at={0} line={`NOV ${fig.year ?? ""} · TACOMA NARROWS`} />
          {!wide ? <Tag t={f} at={-40} top={450} text="TACOMA NARROWS BRIDGE" color="#f0e4c8" size={48} /> : null}
          {!wide ? <WindGauge value={fig.wind ?? ""} k={Math.max(0.5, rd)} x={760} y={760} to={[640, 1050]} t={f} /> : null}
          {wide ? <Tag t={f} at={how} top={1180} text="THE DECK IS TWISTING" color={RED} size={50} /> : null}
        </>
      }>
      <Cam pos={pos} look={look} fov={wide ? 42 : 40} seed="tac-hook" range={wide ? 20 : 6} />
      <Narrows f={f} />
      <Gertie twist={twist} phase={PHASE(f)} hot={hot} />
    </Shot3D>
  );
};
export default Hook;
