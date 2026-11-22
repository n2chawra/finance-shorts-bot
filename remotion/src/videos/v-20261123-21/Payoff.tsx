// Payoff: "Getting that brick into a shop took over {fact4} of Motorola's money, and more than {fact3} years."
// A glowing timeline rail in the dark, prototype handsets standing along it: the camera flies along it
// ("Getting", medium), turning toward the far end ("into"); each prototype a little smaller and neater ("brick"); the shop counter at the far
// end, its window lighting ("shop"); the rail lights end to end ("took", wide); the wordmark glows over it ("of"); the
// money lands on the shop's sign board in amber ("over", close) and a ring of light runs back along the rail as the camera eases back to medium (3.2 s); the camera settles on the shop front ("and"); the years
// count up on its lit window ("more") as the prototypes light one by one ("years").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Handset, k01, q } from "./Models";

type Params = { fig?: { years?: string; money?: string } };
const N = 7, GAP = 4.2, L = (N - 1) * GAP;

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const into = m.at("into", 10);
  const shop = m.at("shop", 16);
  const took = m.at("took", 24);
  const moto = m.at("of", 32);
  const over = m.at("over", 40);
  const and = m.at("and", 54);
  const more = m.at("more", 60);
  const years = m.at("years", 72);
  const end = Math.max(m.end, years + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const lit = k01(f, took, 14);
  const ring = Math.round(3.2 * 30);
  const keys = direct({}, [
    { at: 0, move: "push", look: [-2, 3, -L * 0.8], dir: [1, 0.45, 0.55], from: 31, to: 26, dur: Math.max(16, over), fov: 40 },
    { at: over, move: "push", look: [-5.6, 4.2, -L - 3], dir: [0.72, 0.25, 0.7], to: 18, dur: Math.max(8, ring - over) },
    { at: ring, move: "pullback", look: [-4, 3.8, -L], dir: [0.75, 0.35, 0.65], to: 20, dur: Math.max(8, and - ring) },
    { at: and, move: "push", look: [-5.6, 3.4, -L - 3], dir: [0.72, 0.2, 0.7], to: 18, dur: Math.max(12, end - and) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1.2} dof={0} blur={1} shadowBox={16} fog={{ color: "#05070f", near: 14, far: 50 }}>
        <Camera3D keys={keys} seed="v2321-payoff" />
        {/* the rail */}
        <mesh position={[0, 0.05, -L / 2]} material={glow(TECH.cyan, q(0.25 + 0.75 * lit))}><boxGeometry args={[0.12, 0.06, L + 2]} /></mesh>
        <mesh position={[0, 0.03, -L / 2 - (L + 2) / 2 * (1 - lit)]} material={glow(TECH.white, q(lit > 0 && lit < 1 ? 1 : 0))}><sphereGeometry args={[0.2, 12, 8]} /></mesh>
        {Array.from({ length: N }, (_, i) => {
          const s = 1 - i * 0.06;
          const pop = k01(f, 2 + i * 3, 8);
          const on = k01(f, years + i * 2, 4);
          return (
            <group key={i} position={[1.2, 0, -i * GAP]} scale={s * (0.6 + 0.4 * pop)} rotation-y={-0.4 + 0.05 * Math.sin(f * 0.05 + i)}>
              <Handset keys={i / (N - 1)} lit={0.3 + 0.4 * lit + 0.3 * on} mark={i === N - 1 ? 1 : 0.3} />
            </group>
          );
        })}
        {/* a back wall of dark panels and year posts along the rail */}
        <mesh position={[-11, 6, -L / 2]} rotation-y={Math.PI / 2}><planeGeometry args={[L + 20, 14]} /><meshStandardMaterial color="#101727" roughness={0.9} /></mesh>
        {Array.from({ length: N }, (_, i) => (
          <mesh key={`post${i}`} position={[-1.2, 1.6, -i * GAP]} material={glow(TECH.cyan, q(0.2 + 0.7 * k01(f, took + i * 2, 6)))}><boxGeometry args={[0.1, 3.2, 0.1]} /></mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`pan${i}`} position={[-10.9, 5, 4 - i * 4.4]} rotation-y={Math.PI / 2} material={glow("#6f8cff", q(0.12 + 0.06 * Math.sin(f * 0.06 + i)))}><planeGeometry args={[2.6, 7]} /></mesh>
        ))}
        {/* a ring of light running out from the money figure along the rail */}
        {f >= ring && f < ring + 30 && (
          <mesh position={[0, 0.08, -L + 26 * k01(f, ring, 30)]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(1 - k01(f, ring, 30)))}>
            <ringGeometry args={[0.6, 0.9, 32]} />
          </mesh>
        )}
        {/* the shop at the far end: a storefront with a lit window and a sign board; the money is painted on the board */}
        <group position={[-5.6, 0, -L - 3]} rotation-y={0.8}>
          <Block size={[5, 3.6, 2]} radius={0.06} preset="white" color="#5a3f2c" position={[0, 1.8, 0]} />
          <mesh position={[0, 1.6, 1.01]} material={glow("#c98a3a", q(0.25 + 0.25 * k01(f, shop, 10)))}><planeGeometry args={[3.8, 2.2]} /></mesh>
          <Block size={[5.4, 2.2, 0.25]} radius={0.05} preset="glossy" color="#151a28" position={[0, 4.9, 0.6]} />
          <FigLabel3D fig={fig.money ?? ""} caption="spent" at={[0, 4.9, 0.76]} face="front" height={1.15} start={over} count={0} color={TECH.amber} />
          {/* the years, painted on the shop window */}
          <FigLabel3D fig={fig.years ?? ""} caption="years of work" at={[0, 1.6, 1.25]} face="front" height={0.85} start={more} count={20} color={TECH.white} plate />
        </group>
        <Label3D at={[-5.6, 3.6, -L - 3]} offset={[-1.2, -1.6, 0]} text="on sale" start={shop} end={and - 4} px={54} color={TECH.white} align="center" />

        <Label3D at={[1.2, 6.6, -L / 2]} offset={[0, 1.2, 0]} text="MOTOROLA" start={moto} end={and - 2} px={62} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Payoff;
