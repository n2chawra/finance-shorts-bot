// Globe: "And it is not alone. Over {fact1} kilometres of cable already cross the seabed, with more than
// {fact2} cables working or planned."
// The Earth from space (wide), one cable glowing across the Atlantic. "Over": more Atlantic cables draw on;
// "kilometres": a plate beside the globe counts up the kilometres (medium); "cable": Pacific cables draw on;
// "cross": the globe turns; "seabed": landing points light on the coasts; "more" (wide): the cables figure
// writes on a second plate; "cables": routes round Africa and Asia draw on; "working": the lit cables pulse;
// "planned": dashed planned routes draw on.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, Stage3D } from "../../three/index";
import { CableRoute, Globe as Earth, Landing, PLANNED, ROUTES, k01, q } from "./Parts";

type Params = { fig?: { km?: string; cables?: string } };
export const SPACE_BACK = { top: "#050a18", bottom: "#000000", glow: "rgba(80,140,255,0.10)" };

export const Stars: React.FC = () => (
  <group>
    {Array.from({ length: 90 }, (_, i) => {
      const a = i * 2.399, r = 9 + (i % 7);
      return (
        <mesh key={i} position={[Math.cos(a) * r, ((i * 37) % 23) - 11, -8 - (i % 5) * 2 + Math.sin(a) * 2]}>
          <sphereGeometry args={[0.025 + (i % 3) * 0.01, 6, 4]} />
          <meshBasicMaterial color="#cfd8ff" toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

const GlobeBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const over = m.at("over", 30);
  const km = m.at("kilometres", 54);
  const cable = m.at("cable", 64);
  const cross = m.at("cross", 72);
  const seabed = m.at("seabed", 84);
  const more = m.at("more", 92);
  const withW = m.at("with", 88);
  const cables = m.at("cables", 112);
  const working = m.at("working", 120);
  const planned = m.at("planned", 132);
  const end = Math.max(m.end, planned + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  // the globe turns: the Atlantic first, then round toward Africa and Asia
  const spin = -0.25 + 0.003 * f + 0.9 * k01(f, cross, 40);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.15, 0], dir: [0, 0.2, 1], from: 5.6, to: 5.0, dur: Math.max(8, km), fov: 35 },
    { at: km, move: "push", look: [0.35, 0.3, 0], dir: [0.1, 0.25, 1], to: 3.6, dur: Math.max(8, more - km) },
    { at: more, move: "pullback", look: [0, 0.1, 0], dir: [0, 0.15, 1], to: 5.2, dur: Math.max(10, end - more) },
  ]);
  const pulse = 1 - 0.35 * m.pulse(working + 3, 12);
  const atl = ROUTES.slice(0, 3), pac = ROUTES.slice(3, 6), rest = ROUTES.slice(6);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SPACE_BACK} floor={false} bloom={1.15} dof={0} blur={1} shadowBox={3}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2721-globe" />
        <Stars />
        <directionalLight position={[-4, 3, 5]} intensity={2.2} color="#ffffff" />
        <ambientLight intensity={0.25} />
        <group rotation-y={spin} rotation-x={0.25}>
          <Earth />
          {atl.map((r, i) => <CableRoute key={r.name} route={r.route} k={i === 0 ? 1 : k01(f, over + i * 5, 18)} opacity={pulse} />)}
          {pac.map((r, i) => <CableRoute key={r.name} route={r.route} k={k01(f, cable + i * 4, 18)} opacity={pulse} />)}
          {rest.map((r, i) => <CableRoute key={r.name} route={r.route} k={k01(f, cables + i * 3, 16)} opacity={pulse} />)}
          {PLANNED.map((r, i) => <CableRoute key={i} route={r} k={k01(f, planned + i * 4, 16)} dash color="#ffd27a" />)}
          {[...atl, ...pac, ...rest].flatMap((r, i) => {
            const a = r.route[0]!, b = r.route[r.route.length - 1]!;
            const k = q(k01(f, seabed + (i % 5) * 2, 8) * (1 + 0.8 * m.pulse(withW + 2, 10)));
            return [<Landing key={`${i}a`} lat={a[0]} lon={a[1]} k={k} />, <Landing key={`${i}b`} lat={b[0]} lon={b[1]} k={k} />];
          })}
        </group>
        {f >= over + 28 && <FigLabel3D fig={fig.km ?? ""} caption="km of cable" at={[0.45, 0.95, 0.6]} start={over + 30} count={Math.max(10, km - over - 30)} px={110} />}
        {f >= more - 2 && <FigLabel3D fig={fig.cables ?? ""} caption="cables" at={[-0.5, -1.35, 0.4]} start={more} count={14} px={100} />}
      </Stage3D>
    </Freeze>
  );
};
export default GlobeBeat;
