// Payoff: "So the pinion spins {gear_ratio} for each turn of the engine, trading speed for the force to drag the pistons round."
// The engine cut open, the starter meshed below it (medium). "So": the pinion whirls, a turn counter on the
// motor's case counting up; "each": a glowing marker on the flywheel creeps round; "turn" (close): the marker
// completes one full turn as the counter lands on the figure; "trading": a speed arrow on the pinion shrinks as a
// force arrow on the flywheel grows; "force" (wide): the crankshaft turns, the pistons slide; "pistons":
// labelled; "round": the pistons glow as the crank swings round.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, HC, Machine, PINION_TEETH, RING_R, RING_TEETH, STARTER_AT, k01, q } from "./Parts";

type Params = { fig?: { ratio?: string } };

const Arrow: React.FC<{ at: [number, number, number]; len: number; color: string; rot?: number }> = ({ at, len, color, rot = 0 }) => (
  <group position={at} rotation-x={rot}>
    <mesh position={[0, 0, len / 2]} rotation-x={Math.PI / 2} material={glow(color, 0.95)}>
      <cylinderGeometry args={[0.05, 0.05, Math.max(0.01, len), 10]} />
    </mesh>
    <mesh position={[0, 0, len + 0.12]} rotation-x={Math.PI / 2} material={glow(color, 1)}>
      <coneGeometry args={[0.13, 0.26, 14]} />
    </mesh>
  </group>
);

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const so = m.at("so", 2);
  const motor = m.at("pinion", 6);
  const spins = m.at("spins", 10);
  const each = m.at("each", 20);
  const turn = m.at("turn", 30);
  const trading = m.at("trading", 46);
  const force = m.at("force", 62);
  const pistons = m.at("pistons", 74);
  const round = m.at("round", 82);
  const end = Math.max(m.end, round + 18);
  // the flywheel makes exactly one turn from "so" to "turn"; the pinion makes RING/PINION turns in the same time
  const ringTurn = k01(f, so, Math.max(12, turn - so), (x) => x) + Math.max(0, f - turn) * 0.025;
  const crank = -ringTurn * Math.PI * 2;
  const pinion = (-crank * RING_TEETH) / PINION_TEETH;
  const [sx, sy, sz] = STARTER_AT;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.8, HC - 0.6, 0.6], dir: [-0.55, 0.25, 0.8], from: 5.6, to: 5.0, dur: Math.max(10, turn), fov: 40 },
    { at: turn, move: "push", look: [sx + 0.75, sy + 0.55, sz], dir: [0.5, 0.3, 0.81], to: 3.8, dur: Math.max(10, force - turn) },
    { at: force, move: "pullback", look: [2.2, HC + 0.7, 0.3], dir: [0.35, 0.3, 0.89], to: 10, dur: Math.max(12, end - force) },
  ]);
  const shrink = k01(f, trading, 16);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 14, far: 36 }}>
        <Camera3D keys={keys} seed="v2821-payoff" />
        <Machine pinion={pinion} crank={crank} engage={1} coil={0.7} contact={0.7} windings={0.5 + 0.5 * k01(f, motor, 8)} marker={k01(f, m.at("for", 16), 6)} pistons={0.8 * k01(f, round, 10)} />
        {/* the turn counter: a dark panel fixed beside the pinion, the figure painted on its face */}
        <group position={[sx + 0.82, sy + 1.0, sz + 0.1]} rotation-y={0.55}>
          <Block size={[1.15, 0.4, 0.06]} preset="glossy" radius={0.05} />
          {f >= spins && <FigLabel3D fig={fig.ratio ?? ""} caption="pinion turns per engine turn" at={[0, 0, 0.04]} face="front" height={0.12} start={spins} count={Math.max(12, turn - spins)} plate={false} />}
        </group>
        {f >= trading && f < force + 20 && (
          <group>
            <Arrow at={[sx - 0.2, sy - 0.3, sz]} len={q(1.1 * (1 - 0.75 * shrink))} color={TECH.cyan} rot={-0.4} />
            <Arrow at={[-0.2, HC + RING_R + 0.2, 0]} len={q(0.3 + 1.2 * shrink)} color={TECH.amber} rot={0} />
          </group>
        )}
        <Label3D at={[sx - 0.2, sy - 0.4, sz + 0.6]} offset={[-0.4, -0.55, 0.2]} text="speed" start={trading} end={force + 20} px={54} color={TECH.cyan} align="center" />
        <Label3D at={[-0.2, HC + RING_R + 0.4, 1.2]} offset={[-0.3, 0.5, 0.2]} text="force" start={trading + 6} end={force + 20} px={54} color={TECH.amber} align="center" />
        <Label3D at={[2.5, HC + 1.8, 0]} offset={[0.3, 1.1, 0.3]} text="pistons" start={pistons} px={58} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Payoff;
