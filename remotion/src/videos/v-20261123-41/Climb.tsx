// Climb: "He had climbed to get above the cloud, at {fact4} feet a minute, up to {fact3} feet."
// Wide over the hills: the helicopter noses up out of the valley toward the cloud deck, its climb path drawing
// behind it ("climbed"); the bright top of the deck shows above ("above"); it enters the cloud and the hills go
// grey ("cloud"); the climb-rate readout swings to its figure ("feet"); the altitude readout rolls up to its
// figure, close on the helicopter in the cloud ("up").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion, SourceLine } from "../../flat/kit";
import { CloudDeck } from "../../three/index";
import { AMBER, Cam, CLOUD_Y, Country, CREAM, HeliAt, k01, Readout, Shot3D, sm } from "./World";

type Params = { fig?: { rate?: string; alt?: string } };

/** the climb: x and height along the beat's 0..1 */
const climbAt = (u: number): [number, number, number] => [-7 + 11 * u, 3.6 + 4.4 * sm(u * 1.1), 0];

const Climb: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const cloud = m.at("cloud", 40), feet = m.at("feet", 70), minute = m.at("minute", 85), up = m.at("up", 110);
  const u = k01(f / Math.max(1, m.end));
  const P = climbAt(u);
  const inCloud = P[1] > CLOUD_Y - 0.2;
  const near = sm((f - cloud) / 25), close = sm((f - up) / 20);
  const pos: [number, number, number] = [P[0] - 3 + 2 * near + 1.5 * close, P[1] - 0.8 + 0.6 * near, 15 - 7 * near - 3 * close];
  const look: [number, number, number] = [P[0] + 0.6, P[1] - 0.5 * (1 - near), 0];
  const trail = Array.from({ length: 14 }, (_, i) => climbAt(Math.max(0, u - i * 0.03)));
  return (
    <Shot3D f={f} fog={inCloud ? { color: "#7d8690", near: 1.5, far: 16 } : { color: "#59626c", near: 10, far: 48 }}
      overlay={
        <>
          <Readout left={60} top={380} w={440} value={countText(fig.rate ?? "", k01((f - feet) / 18))} caption="FEET A MINUTE ↑" k={k01((f - feet + 4) / 8) * (f >= minute && f < minute + 8 ? 1.08 : 1)} color={AMBER} />
          <Readout left={580} top={380} w={440} value={countText(fig.alt ?? "", k01((f - up) / 20))} caption="FEET · ALTIMETER" k={k01((f - up + 4) / 8)} color={CREAM} />
          <SourceLine p={p} y={1300} />
        </>
      }>
      <Cam pos={pos} look={look} fov={42} seed="cal-climb" range={8} />
      <Country />
      <CloudDeck frame={f} y={CLOUD_Y + 0.4} size={80} cover={0.88} puffs={110} seed="cal-deck" wind={[0.04, 0.01]} />
      {trail.map((q, i) => (
        <mesh key={i} position={q}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color={f >= minute ? "#ffd84a" : AMBER} transparent opacity={0.9 - i * 0.06} /></mesh>
      ))}
      <HeliAt f={f} pos={P} pitch={0.14} />
    </Shot3D>
  );
};
export default Climb;
