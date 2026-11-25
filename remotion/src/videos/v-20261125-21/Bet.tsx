// Bet: "Its chip packed about {fact1} transistors and bet everything on curves."
// The first chip's package on the dark stage (close); "Its": the lid lifts; "chip": the die lights;
// "about": the camera glides across; "packed": a wave over the die; "transistors": the count rolls up on a
// plate on the die's edge (extreme); "made": the camera rises; "bet": a smooth dome grows out of the die
// (medium); "build"/"shape": it ripples and rounds; "game": a game-pad outline draws; "curves": label.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, InstancedField, Label3D, Stage3D, TECH } from "../../three/index";
import { AMBER, OpenChip, Pool, SmoothDome, k01 } from "./Parts";

type Params = { fig?: { transistors?: string } };

const Bet: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const its = m.at("its", 2);
  const chip = m.at("chip", 8);
  const about = m.at("about", 20);
  const packed = m.at("packed", 14);
  const tr = m.at("transistors", 40);
  const bet = m.at("bet", 60);
  const made = bet;
  const game = m.at("everything", 70);
  const build = game;
  const shape = game + 6;
  const curves = m.at("curves", 86);
  const end = Math.max(m.end, curves + 20);
  const fig = (p.beat.params as Params).fig?.transistors ?? "";
  const open = k01(f, its - 2, 16);
  const rise = k01(f, bet, 20) * (1 + 0.06 * m.pulse(build + 4, 8)) * (0.85 + 0.15 * k01(f, shape, 12));
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.2, 0], dir: [0.25, 0.9, 0.7], from: 4.6, to: 4.0, dur: Math.max(8, about), fov: 35 },
    { at: about, move: "push", look: [0.3, 0.2, 0.2], dir: [0.5, 0.8, 0.6], to: 3.6, dur: Math.max(8, tr - about) },
    { at: tr, move: "push", look: [0.2, 0.25, 0.75], dir: [0.15, 0.55, 1], to: 2.4, dur: Math.max(8, made - tr) },
    { at: made, move: "pullback", look: [0, 1.0, 0], dir: [0.3, 0.45, 1], from: 4.5, to: 7, dur: Math.max(10, end - made) },
  ]);
  const lid = 0.35 + 0.5 * k01(f, chip, 10) + 0.3 * m.pulse(packed + 6, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#151b30", bottom: "#04050a", glow: "rgba(56,225,255,0.10)" }} floor="reflect" bloom={1.1} dof={0} blur={1}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2521-bet" />
        <Pool r={2.2} k={1} color="#bfe9ff" />
        <OpenChip size={2} open={open} lit={lid} seed="nv1-die" />
        {f >= packed && <InstancedField cols={14} rows={14} spacing={0.075} start={packed} reveal={14} wave={14} position={[0, 0.12, 0]} seed="nv1-field" />}
        <FigLabel3D fig={fig} caption="transistors" at={[f >= bet ? 0.9 : 0.2, f >= bet ? 1.35 : 0.25, f >= bet ? 0.6 : 1.05]} start={tr} count={20} px={f >= bet ? 92 : 112} />
        <SmoothDome r={0.95} rise={rise} lit={k01(f, curves, 8)} position={[0, 0.12, 0]} visible={f >= bet - 1} />
        {f >= game && (
          // a game-pad outline drawing round the dome
          <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} scale={[1.6 * k01(f, game, 10), 1.6 * k01(f, game, 10), 1]}>
            <torusGeometry args={[1.4, 0.03, 8, 6]} />
            <meshBasicMaterial color={TECH.cyan} toneMapped={false} />
          </mesh>
        )}
        <Label3D at={[0, 1.0, 0]} offset={[0.7, 0.9, 0]} text="curves" start={curves} px={60} color={AMBER} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Bet;
