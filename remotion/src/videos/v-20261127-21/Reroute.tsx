// Reroute: "Roughly {fact3} times a year, a cable breaks somewhere. Yet your video keeps playing, because
// the data takes another cable."
// The globe at night, its cables lit (medium). "Roughly": a plate beside it counts up the breaks a year;
// "year": the figure lands; "cable": one Atlantic cable flashes red; "breaks": a red break mark pulses on
// it; "somewhere": red sparks flicker at breaks round the globe; "Yet" (wide): the camera pulls back;
// "video": a pulse of light sets off from the American coast; "keeps": it reaches the red break;
// "playing": it keeps glowing; "data": it turns off the broken cable; "takes" (medium): it races along a
// different cable; "another": it reaches Europe, the new path glowing gold.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, glow, Stage3D, TECH } from "../../three/index";
import { AMBER, CableRoute, Globe as Earth, ROUTES, k01, q, routeAt } from "./Parts";
import { SPACE_BACK, Stars } from "./Globe";

type Params = { fig?: { faults?: string } };
const BROKEN = ROUTES[0]!.route; // New York → Cornwall
const DETOUR = ROUTES[1]!.route; // Virginia → France
const SPARKS: [number, number][] = [[20, 150], [5, 70], [-10, 5], [30, -150], [15, -30]];
const BREAK_U = 0.5;

const Reroute: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const roughly = m.at("roughly", 2);
  const year = m.at("year", 28);
  const cable = m.at("cable", 36);
  const breaks = m.at("breaks", 42);
  const somewhere = m.at("somewhere", 50);
  const yet = m.at("yet", 64);
  const video = m.at("video", 76);
  const keeps = m.at("keeps", 84);
  const data = m.at("data", 104);
  const takes = m.at("takes", 112);
  const another = m.at("another", 124);
  const end = Math.max(m.end, another + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const red = f >= cable;
  // the pulse: along the broken cable up to the break, then (after "data") along the detour
  const u1 = Math.min(BREAK_U, BREAK_U * k01(f, video, Math.max(8, keeps - video)));
  const u2 = k01(f, takes, Math.max(10, another - takes + 6));
  const onDetour = f >= data;
  const pulseAt = onDetour ? routeAt(DETOUR, u2) : routeAt(BROKEN, u1);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.1, 0.35, 0], dir: [0.15, 0.3, 1], from: 4.2, to: 3.8, dur: Math.max(8, yet), fov: 35 },
    { at: yet, move: "pullback", look: [0, 0.2, 0], dir: [0.1, 0.25, 1], to: 5.0, dur: Math.max(8, takes - yet) },
    { at: takes, move: "push", look: [0.15, 0.45, 0], dir: [0.15, 0.3, 1], to: 3.9, dur: Math.max(10, end - takes) },
  ]);
  const spin = 0.55 + 0.002 * f;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SPACE_BACK} floor={false} bloom={1.2} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2721-reroute" />
        <Stars />
        <directionalLight position={[-4, 3, 5]} intensity={1.1} color="#9fb8ff" />
        <ambientLight intensity={0.2} />
        <group rotation-y={spin} rotation-x={0.3}>
          <Earth night />
          {ROUTES.slice(2).map((r) => <CableRoute key={r.name} route={r.route} opacity={0.75} />)}
          <CableRoute route={BROKEN} color={red ? "#ff4d4d" : TECH.cyan} opacity={red ? q(0.6 + 0.4 * m.pulse(cable + 2, 10)) : 0.75} />
          <CableRoute route={DETOUR} color={onDetour ? AMBER : TECH.cyan} width={onDetour ? 7 : 4} opacity={onDetour ? 1 : 0.75} />
          {f >= breaks && (
            <mesh position={routeAt(BROKEN, BREAK_U, 1.02)} scale={1 + 0.6 * m.pulse(breaks + 2, 10)} material={glow("#ff4d4d", 1)}>
              <sphereGeometry args={[0.03, 12, 8]} />
            </mesh>
          )}
          {f >= somewhere && SPARKS.map(([la, lo], i) => {
            const on = (Math.floor((f - somewhere) / 4) + i) % 3 === 0;
            const P = routeAt([[la, lo], [la + 0.1, lo + 0.1]], 0, 1.015);
            return <mesh key={i} position={P} material={glow("#ff4d4d", on ? 1 : 0.4)}><sphereGeometry args={[0.018, 8, 6]} /></mesh>;
          })}
          {f >= video && (
            <mesh position={pulseAt} scale={1 + 0.3 * m.pulse(keeps + 2, 10)} material={glow("#ffffff", 1)}>
              <sphereGeometry args={[0.028, 12, 8]} />
            </mesh>
          )}
        </group>
        {f >= roughly && <FigLabel3D fig={fig.faults ?? ""} caption="breaks a year" at={[0.6, 1.35, 0.4]} start={roughly + 2} count={Math.max(10, year - roughly)} px={110} color="#ff6b5a" />}
      </Stage3D>
    </Freeze>
  );
};
export default Reroute;
