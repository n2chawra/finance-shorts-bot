// Riva: "NVIDIA threw the curves away. Its next chip, RIVA, drew triangles fast: {fact4} transistors."
// The table relit (medium): "threw" the curved dome lifts; "curves" it cracks; "away" it shatters; "next"
// a new chip starts rising; "RIVA" it rises, labelled (close); "drew"/"triangles" triangles stream out and
// snap into a mesh; "fast" it spins; "with" the camera drops to the chip; "transistors" the count rolls up
// on its plate (extreme).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, ChipPackage, direct, FigLabel3D, Label3D, Stage3D, TECH } from "../../three/index";
import { LightTable, Shards, SmoothDome, TriDome, k01 } from "./Parts";

type Params = { fig?: { transistors?: string } };

const Riva: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const so = m.at("nvidia", 2);
  const threw = m.at("threw", 8);
  const curves = m.at("curves", 16);
  const away = m.at("away", 22);
  const next = m.at("next", 32);
  const riva = m.at("riva", 40);
  const drew = m.at("drew", 48);
  const tri = m.at("triangles", 54);
  const fast = m.at("fast", 62);
  const withW = m.at("fig1", 70);
  const fig2 = m.at("fig2", 80);
  const tr = m.at("transistors", 80);
  const end = Math.max(m.end, tr + 20);
  const fig = (p.beat.params as Params).fig?.transistors ?? "";
  const lift = k01(f, threw, 12);
  const shatter = k01(f, away, 22);
  const rise = k01(f, next, 18);
  const mesh = k01(f, tri, 10);
  const spin = f >= fast ? (f - fast) * 0.12 : 0;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.0, 0], dir: [0.25, 0.4, 1], from: 8, to: 7.2, dur: Math.max(8, riva), fov: 35 },
    { at: riva, move: "push", look: [0, 1.4, 0], dir: [0.3, 0.35, 1], to: 5, dur: Math.max(8, withW - riva) },
    { at: withW, move: "push", look: [0.3, 0.4, 0.8], dir: [0.2, 0.6, 1], from: 3.8, to: 2.8, dur: Math.max(10, end - withW) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#16203a", bottom: "#05070d", glow: "rgba(56,225,255,0.16)" }} floor={false} bloom={1.2} dof={0} blur={1}>
        <Camera3D keys={keys} seed="v2521-riva" />
        <LightTable lit={0.6 + 0.4 * k01(f, so, 6)} />
        {shatter < 0.05 && <SmoothDome r={1} rise={1} lit={0.5 + 0.5 * m.pulse(curves + 3, 6)} position={[0, 1.6 * lift + 0.05 * Math.sin(f * 1.7) * k01(f, curves, 4), 0]} />}
        <Shards at={[0, 1.6 + 0.6, 0]} k={shatter} />
        <group position={[0, -0.3 + 0.32 * rise, 0]} visible={rise > 0.02}>
          <ChipPackage size={1.4} lid seed="riva" lit={0.4 + 0.5 * k01(f, riva, 8) + 0.2 * m.pulse(fig2 + 3, 8)} />
          <FigLabel3D fig={fig} caption="transistors" at={[1.2, 0.9, 0.5]} start={Math.min(tr, withW)} count={30} px={112} />
        </group>
        <TriDome r={0.75} detail={0.5} cut={mesh} lit={mesh} position={[0, 1.4, 0]} rotation-y={spin} scale={Math.max(0.02, mesh)} visible={f >= drew} />
        <Label3D at={[0, 0.1, 0]} offset={[-0.9, 0.7, 0.3]} text="RIVA" start={riva} px={64} color={TECH.cyan} align="center" />
        <pointLight position={[2, 3.5, 3]} intensity={10} color="#dff6ff" distance={10} />
      </Stage3D>
    </Freeze>
  );
};
export default Riva;
