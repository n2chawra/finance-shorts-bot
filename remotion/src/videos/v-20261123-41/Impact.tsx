// Impact (no words): silence, time slowed. The hillside's scrub fills the frame and the helicopter's nose comes out
// of the cloud base above it ("near"); the sub-boom: a burst of dust and debris at the slope and the frame dips into
// the dust before anything else is seen ("hit"); wide: dust and smoke rising from the hillside into the cloud
// ("wide"). No people.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { cue, Debris, hillHeight, Smoke } from "../../three/index";
import { Cam, CLOUD_Y, Country, HeliAt, HILLS, k01, Shot3D } from "./World";
import { CloudDeck } from "../../three/index";

export const SITE: [number, number, number] = [6, hillHeight(6, 1.5, HILLS), 1.5];

const Impact: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const hit = m.at("hit", 30), wide = m.at("wide", 51);
  const u = k01(f / hit);
  const heli: [number, number, number] = [SITE[0] - 3 * (1 - u), SITE[1] + 0.5 + 3.6 * (1 - u), SITE[2]];
  const dust = f >= hit ? Math.max(0, 1 - (f - hit) / 18) : 0;
  const pos: [number, number, number] = f >= wide ? [SITE[0] - 9 - 0.02 * (f - wide), SITE[1] + 3.5, SITE[2] + 10] : [SITE[0] - 2.4, SITE[1] + 1.2, SITE[2] + 3.2];
  const look: [number, number, number] = f >= wide ? [SITE[0], SITE[1] + 1.4, SITE[2]] : [SITE[0] - 0.6, SITE[1] + 1.4, SITE[2]];
  return (
    <Shot3D f={f} fog={{ color: "#6b737c", near: 3, far: 30 }}
      overlay={<div style={{ position: "absolute", inset: 0, background: "#8a7d68", opacity: 0.85 * dust, pointerEvents: "none" }} />}>
      <Cam pos={pos} look={look} fov={f >= wide ? 46 : 40} seed="cal-impact" range={f >= wide ? 14 : 4} />
      <Country />
      <CloudDeck frame={f} y={SITE[1] + 4.6 > CLOUD_Y ? SITE[1] + 4.6 : CLOUD_Y} size={60} cover={0.9} puffs={70} seed="cal-base" />
      {f < hit ? <HeliAt f={f} pos={heli} bank={-0.6} pitch={-0.35} yaw={0.5} lights={1} /> : null}
      {f >= hit ? (
        <Debris at={SITE} count={50} spread={0.4} dir={[0, 1, 0.2]} speed={2.2} size={0.06} start={0} seconds={2} slow={0.45} gravity={4} floor={SITE[1]} kind="concrete" seed="cal-hit" progress={cue(f, hit, 50, (x) => x)} />
      ) : null}
      {f >= hit ? <Smoke frame={f - hit} at={SITE} height={5} width={2.6} count={36} life={90} wind={[0.4, 0, 0]} color="#5a5650" opacity={0.75} seed="cal-smoke" /> : null}
      <pointLight position={[SITE[0], SITE[1] + 1, SITE[2] + 1]} intensity={f >= hit ? 4 * Math.max(0, 1 - (f - hit) / 20) : 0} distance={6} color="#ffb060" />
    </Shot3D>
  );
};
export default Impact;
