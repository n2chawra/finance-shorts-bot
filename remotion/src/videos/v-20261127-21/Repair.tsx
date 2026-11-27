// Repair: "So a repair ship sails out, lifts the broken ends onto its deck, and joins the glass back
// together."
// The open ocean at dusk, a cable repair ship riding the swell (wide). "ship": its deck lights come on;
// "sails": it pushes on through the waves; "lifts" (medium): a line from its bow hauls the cable up out of
// the water; "broken": the dark broken end dangles; "ends": the second end comes up beside it; "deck": both
// land on the lit deck; "joins" (close): cut to the splice table where two glass fibres meet; "glass": a
// spark flashes as they fuse; "together": light runs through the joined fibre again.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, cue, direct, glow, Label3D, mat, Ocean, oceanHeight, Ship, Stage3D, TECH } from "../../three/index";
import { CYAN, FIBRE_R, R, k01, q } from "./Parts";

const DUSK = { top: "#2a3a63", bottom: "#e08a5a", glow: "rgba(255,190,140,0.25)" };
const WAVES = { amp: 0.18, length: 4, speed: 0.05 };

/** the ship's bow, in world space (the ship sits at x=sx, bow toward +x) */
const SHIP_L = 8;

/** A hanging cable end from the bow sheave down into the water: a sagging line of short segments. */
const Hanging: React.FC<{ from: [number, number, number]; k: number; sway: number; dark?: boolean }> = ({ from, k, sway, dark = true }) => {
  const n = 10;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = i / n;
        const y = from[1] - u * 3.2 * k;
        const x = from[0] + Math.sin(u * 2 + sway) * 0.15 * u + 0.5 * u;
        return (
          <mesh key={i} position={[x, y, from[2]]} material={mat("glossy", "#15171c", { roughness: 0.35 })}>
            <cylinderGeometry args={[R * 0.5, R * 0.5, 0.34 * k + 0.01, 16, 1]} />
          </mesh>
        );
      })}
      {!dark && <mesh position={[from[0] + 0.5, from[1] - 3.2 * k, from[2]]} material={glow(CYAN, 1)}><sphereGeometry args={[0.08, 10, 8]} /></mesh>}
    </group>
  );
};

const Repair: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const ship = m.at("ship", 10);
  const sails = m.at("ship", 18);
  const lifts = m.at("lifts", 30);
  const broken = m.at("broken", 40);
  const ends = m.at("ends", 46);
  const deck = m.at("deck", 58);
  const joins = m.at("joins", 70);
  const glassW = m.at("glass", 86);
  const together = m.at("together", 94);
  const end = Math.max(m.end, together + 20);
  const splice = f >= joins;
  const sx = -3 + 0.03 * f + 1.2 * k01(f, sails, 30);
  const bob = oceanHeight(sx, 0, f, WAVES);
  const bow: [number, number, number] = [sx + SHIP_L / 2 - 0.4, 1.0 + bob, 0];
  const up1 = cue(f, lifts, Math.max(10, deck - lifts), Easing.inOut(Easing.quad));
  const up2 = cue(f, ends, Math.max(10, deck - ends + 4), Easing.inOut(Easing.quad));
  const landed = k01(f, deck, 10);
  const keys = splice
    ? direct({}, [
      { at: joins, move: "push", look: [0, 0.82, 0], dir: [0.2, 0.75, 1], from: 1.3, to: 0.95, dur: Math.max(10, end - joins), fov: 35 },
    ])
    : direct({}, [
      { at: 0, move: "push", look: [sx + 1, 1.2, 0], dir: [0.6, 0.3, 1], from: 17, to: 15.5, dur: Math.max(8, lifts), fov: 35 },
      { at: lifts, move: "push", look: [bow[0] - 1.2, bow[1] - 0.6, 0], dir: [0.7, 0.25, 1], to: 12, dur: Math.max(8, joins - lifts) },
    ]);
  const spark = m.pulse(glassW + 2, 8);
  const run = k01(f, together, 18);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={splice ? { top: "#1a1f2b", bottom: "#07080c", glow: "rgba(255,220,180,0.10)" } : DUSK}
        floor={false} fog={splice ? undefined : { color: "#c9846a", near: 22, far: 70 }} bloom={1.1} dof={0} blur={1} shadowBox={splice ? 2 : 8}>
        <Camera3D keys={keys} seed="v2721-repair" />
        {!splice && (
          <group>
            <Ocean frame={f} size={160} segments={150} color="#29506d" waves={WAVES} />
            <group position={[sx, 0.2 + bob, 0]}>
              <Ship hull="ferry" length={SHIP_L} decks={2} funnels={1} livery={{ hull: "#e9edf2", band: "#c0392b", funnel: "#f4a261" }} seed="repair" />
            </group>
            {/* the bow sheave and the deck lights */}
            <mesh position={bow} rotation-x={Math.PI / 2} material={mat("brushed", "#c9ced6")}><torusGeometry args={[0.28, 0.07, 8, 20]} /></mesh>
            {f >= ship && Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[sx - 2 + i * 1.1, 1.8 + bob, 0.55]} material={glow("#ffe2a8", q(k01(f, ship, 8)))}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
            ))}
            {f >= ship && <pointLight position={[sx + 1, 2.6 + bob, 1]} intensity={10 * k01(f, ship, 8)} color="#ffe2a8" distance={8} />}
            {f >= lifts && <Hanging from={[bow[0], bow[1] - 3.2 * (1 - up1) * (1 - landed), 0.15]} k={1 - 0.7 * landed} sway={f * 0.05} />}
            {f >= ends && <Hanging from={[bow[0] - 0.2, bow[1] - 3.2 * (1 - up2) * (1 - landed), -0.2]} k={1 - 0.7 * landed} sway={f * 0.05 + 1} />}
            <directionalLight position={[-6, 5, 6]} intensity={1.6} color="#ffd2b0" />
            {f >= broken && f < joins && <Label3D at={[bow[0] + 0.3, bow[1] - 1.6, 0.15]} offset={[1.0, 0.6, 0]} text="broken ends" start={broken} px={54} color={TECH.white} align="center" />}
          </group>
        )}
        {splice && (
          <group>
            {/* the splice table on the deck */}
            <Block size={[2.4, 0.08, 1.2]} radius={0.02} material={mat("brushed", "#7d848f")} position={[0, 0.7, 0]} />
            <Block size={[0.5, 0.16, 0.3]} radius={0.03} material={mat("blackPlastic")} position={[0, 0.82, 0]} />
            {[-1, 1].map((s) => {
              const gapX = 0.12 * (1 - k01(f, joins + 4, 12));
              return (
                <group key={s}>
                  <mesh position={[s * (0.55 + gapX / 2), 0.86, 0]} rotation-z={Math.PI / 2} material={mat("glass", "#bfe8ff", { opacity: 0.6 })}>
                    <cylinderGeometry args={[FIBRE_R * 1.6, FIBRE_R * 1.6, 1.0, 12, 1]} />
                  </mesh>
                  <mesh position={[s * (1.2 + gapX / 2), 0.86, 0]} rotation-z={Math.PI / 2} material={mat("glossy", "#15171c")}>
                    <cylinderGeometry args={[0.07, 0.07, 0.4, 16, 1]} />
                  </mesh>
                </group>
              );
            })}
            {/* light coming through: lit on the left, then along the whole joined fibre */}
            <mesh position={[-0.55 + 0.55 * run, 0.86, 0]} rotation-z={Math.PI / 2} material={glow(CYAN, 1)}>
              <cylinderGeometry args={[FIBRE_R * 0.6, FIBRE_R * 0.6, 1.0 + 1.1 * run, 8, 1]} />
            </mesh>
            {spark > 0.05 && (
              <group position={[0, 0.86, 0]}>
                <mesh material={glow("#ffffff", 1)} scale={0.5 + spark}><sphereGeometry args={[0.04, 12, 8]} /></mesh>
                <pointLight intensity={12 * spark} color="#bfe8ff" distance={2} />
              </group>
            )}
            <pointLight position={[0.3, 1.8, 1]} intensity={6} color="#ffffff" distance={5} />
            <Label3D at={[0, 0.86, 0]} offset={[0, 0.3, 0]} text="splice" start={joins + 6} px={54} color={TECH.cyan} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Repair;
