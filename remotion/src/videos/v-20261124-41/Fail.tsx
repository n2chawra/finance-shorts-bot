// Fail (no words): silence, time slowed. The twisted mid-span fills the frame, hangers red ("near"); the sub-boom:
// the hangers snap in a ripple, the deck section tears free with sparks ("snap"); wide: the section drops into the
// grey water in a white splash ("wide"). No people.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { cue, Debris, Smoke } from "../../three/index";
import { Cam, DECK_Y, Gertie, k01, Narrows, Shot3D, SPAN } from "./World";

export const GAP: [number, number] = [0.4, 0.61];
const GX = -SPAN / 2 + SPAN * 0.5;

const Fail: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const snap = m.at("snap", 30), wide = m.at("wide", 54);
  const slow = f * 0.35;
  const phase = 0.5 * Math.PI + 0.3 * Math.sin(slow * 0.1);
  const fall = k01((f - snap) / 34);
  const edgeX = -SPAN / 2 + SPAN * GAP[0];
  const pos: [number, number, number] = f >= wide ? [GX + 9 + 0.03 * (f - wide), DECK_Y + 1.8, 12] : [edgeX - 1.4, DECK_Y + 0.5, 1.6];
  const look: [number, number, number] = f >= wide ? [GX, DECK_Y * 0.4, 0] : [edgeX + 0.6, DECK_Y, 0];
  const flash = f >= snap ? Math.max(0, 1 - (f - snap) / 10) : 0;
  const splashAt = snap + 30;
  return (
    <Shot3D f={f} overlay={<div style={{ position: "absolute", inset: 0, background: "#fff3dc", opacity: 0.6 * flash, pointerEvents: "none" }} />} tag="paused">
      <Cam pos={pos} look={look} fov={f >= wide ? 44 : 40} seed="tac-fail" range={f >= wide ? 16 : 3} />
      <Narrows f={f} />
      <Gertie twist={0.8} phase={phase} hot={1} gap={GAP} fall={fall} sway={0.2} />
      {f >= snap ? (
        <Debris at={[edgeX, DECK_Y, 0]} count={40} spread={0.3} dir={[0, 0.6, 0.4]} speed={2} size={0.04} start={0} seconds={2} slow={0.45} gravity={4} floor={0} kind="metal" seed="tac-snap" progress={cue(f, snap, 60, (x) => x)} />
      ) : null}
      {f >= splashAt ? <Smoke frame={f - splashAt} at={[GX, 0, 0]} height={2.4} width={5} count={30} life={60} wind={[0.2, 0, 0]} color="#e9eeec" opacity={0.85} seed="tac-splash" /> : null}
    </Shot3D>
  );
};
export default Fail;
