// History: "Cadillac ordered {fact4} of Kettering's electric starters for its cars. Before, you cranked engines by hand."
// A dim old garage (wide). "Cadillac": an early open car with brass lamps rolls into a pool of light; "ordered":
// an order plate pops up over the running board, its count counting up; "electric": a glowing starter appears
// under the bonnet; "Before": the light turns sepia; "cranked" (close): the crank handle at the radiator swings
// round; "hand": it swings round once more.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { k01, q } from "./Parts";

type Params = { fig?: { order?: string } };
const BRASS = "#d9a441";
const BODY = "#2c3b2f";

const Wheel: React.FC<{ at: [number, number, number]; spin: number }> = ({ at, spin }) => (
  <group position={at} rotation-z={spin}>
    <mesh material={mat("rubber", "#18191d")}>
      <torusGeometry args={[0.55, 0.09, 12, 36]} />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} rotation-z={(i / 10) * Math.PI} material={mat("clay", "#b78a4a")}>
        <boxGeometry args={[1.0, 0.05, 0.05]} />
      </mesh>
    ))}
    <mesh rotation-x={Math.PI / 2} material={mat("brushed", BRASS)}>
      <cylinderGeometry args={[0.1, 0.1, 0.14, 14]} />
    </mesh>
  </group>
);

/** An early open motor car, its nose (radiator, crank handle) toward +x. */
const OldCar: React.FC<{ roll: number; crank: number; starter: number }> = ({ roll, crank, starter }) => (
  <group position={[roll, 0, 0]}>
    {[[-1.5, 0.6], [1.4, 0.6]].map(([x, y]) => [0.75, -0.75].map((z) => <Wheel key={`${x}${z}`} at={[x!, y!, z]} spin={-roll / 0.55} />))}
    <Block size={[3.6, 0.5, 1.3]} preset="glossy" color={BODY} position={[0, 1.05, 0]} radius={0.12} />
    <Block size={[1.3, 0.7, 1.25]} preset="glossy" color={BODY} position={[-1.0, 1.55, 0]} radius={0.15} />
    <Block size={[1.4, 0.55, 1.1]} preset="glossy" color={BODY} position={[1.0, 1.45, 0]} radius={0.12} />
    <Block size={[0.18, 0.95, 1.05]} preset="brushed" color={BRASS} position={[1.8, 1.4, 0]} radius={0.05} />
    <Block size={[3.4, 0.06, 0.25]} preset="blackPlastic" position={[0, 0.82, 0.78]} />
    {[0.45, -0.45].map((z) => (
      <mesh key={z} position={[1.95, 1.75, z]} material={mat("brushed", BRASS)}>
        <sphereGeometry args={[0.16, 18, 14]} />
      </mesh>
    ))}
    {[0.45, -0.45].map((z) => (
      <mesh key={`g${z}`} position={[2.08, 1.75, z]} material={glow("#ffe9b0", 0.9)}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>
    ))}
    {/* the crank handle under the radiator */}
    <group position={[2.0, 0.95, 0]} rotation-x={crank}>
      <mesh rotation-z={Math.PI / 2} position={[0.12, 0, 0]} material={mat("brushed", "#8b929e")}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 10]} />
      </mesh>
      <mesh position={[0.26, -0.18, 0]} material={mat("brushed", "#8b929e")}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} position={[0.36, -0.36, 0]} material={mat("clay", "#6b4a2a")}>
        <cylinderGeometry args={[0.05, 0.05, 0.22, 10]} />
      </mesh>
    </group>
    {starter > 0.02 && (
      <mesh rotation-z={Math.PI / 2} position={[1.1, 0.95, 0.35]} material={glow(TECH.cyan, q(starter))}>
        <cylinderGeometry args={[0.16, 0.16, 0.55, 20]} />
      </mesh>
    )}
  </group>
);

const History: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const cadillac = m.at("cadillac", 2);
  const ordered = m.at("ordered", 12);
  const electric = m.at("electric", 30);
  const before = m.at("before", 54);
  const cranked = m.at("cranked", 66);
  const hand = m.at("hand", 80);
  const end = Math.max(m.end, hand + 16);
  const roll = -3.2 * (1 - k01(f, cadillac, 26));
  const crank = -Math.PI * 2 * (k01(f, cranked, 14) + k01(f, hand, 14));
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.9, 1.3, 0], dir: [0.78, 0.3, 0.55], from: 7.4, to: 6.6, dur: Math.max(10, cranked), fov: 40 },
    { at: cranked, move: "push", look: [2.2, 0.9, 0], dir: [0.7, 0.2, 0.69], to: 2.6, dur: Math.max(10, end - cranked) },
  ]);
  const sepia = k01(f, before, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#1a140d", bottom: "#050403", glow: "rgba(255,190,110,0.12)" }} floor={{ y: 0, reflect: false, grid: false, color: "#5a4630" }} light={1.5}
        bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#080604", near: 12, far: 30 }}
        overlay={<>
          <SourceLine p={p} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(120,80,30,1)", mixBlendMode: "color", opacity: 0.55 * sepia, pointerEvents: "none" }} />
        </>}>
        <Camera3D keys={keys} seed="v2821-history" />
        <OldCar roll={roll} crank={crank} starter={k01(f, electric, 8) * (1 - sepia)} />
        <mesh position={[3, 6, 2]} material={glow("#ffd9a0", 0.6)}>
          <sphereGeometry args={[0.25, 12, 10]} />
        </mesh>
        <Label3D at={[0.4, 2.0, 0]} offset={[-0.4, 0.9, 0.3]} text="Cadillac" start={cadillac + 8} end={ordered + 2} px={60} color={TECH.white} align="center" />
        {/* the order slip, standing on the running board, the figure written on it */}
        {f >= ordered && f < before + 8 && (
          <group position={[1.3, 2.7, 0.2]} rotation-y={0.95}>
            <Block size={[1.5, 0.95, 0.03]} preset="clay" color="#2e2419" radius={0.02} />
            <FigLabel3D fig={fig.order ?? ""} caption="starters ordered" at={[0, 0, 0.03]} face="front" height={0.36} start={ordered + 2} count={Math.max(12, electric - ordered)} plate={false} />
          </group>
        )}
        <Label3D at={[2.3, 0.6, 0]} offset={[0.2, -0.6, 0.4]} text="crank handle" start={cranked + 2} px={56} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default History;
