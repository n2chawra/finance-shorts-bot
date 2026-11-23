// Grip: "Why the trouble? Rubber grips better than steel, so the train speeds up and brakes harder, and runs quieter."
// Two halves of one test bench (wide): a steel wheel on a rail on the left, a rubber tyre on a flat track
// on the right, both lit from above. "trouble": both turn; "Rubber": the camera pushes in on the tyre;
// "grips": its contact patch glows wide and amber (close); "steel": the steel wheel's tiny contact point
// glows and it slips, spinning in place. "speeds": cut to a side view of a short tunnel between two lit
// platforms, the train shooting out of the left one with streaks (wide); "brakes": it brakes into the right
// one, its brakes glowing; "harder": it stops at the platform; "quieter": sound rings around its wheels
// shrink and fade (medium).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { AMBER, BOGIES, CAR_LEN, MetroCar, Rings, STEEL_R, SteelWheel, TYRE_R, Track, Tyre, k01, q } from "./Parts";

const ST_X = 7; // the platforms' centres at ±ST_X

const Grip: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const why = m.at("why", 2);
  const trouble = m.at("trouble", 14);
  const rubber = m.at("rubber", 26);
  const grips = m.at("grips", 38);
  const steel = m.at("steel", 60);
  const speeds = m.at("speeds", 90);
  const brakes = m.at("brakes", 112);
  const harder = m.at("harder", 124);
  const quieter = m.at("quieter", 150);
  const end = Math.max(m.end, quieter + 26);
  const run = f >= speeds;
  // the train's front goes from the left platform to the right one: a fast start, a hard stop
  const k = cue(f, speeds, Math.max(16, harder - speeds + 4), Easing.bezier(0.55, 0, 0.25, 1));
  const front = -ST_X + CAR_LEN / 2 + (2 * ST_X) * k;
  const spinRun = (2 * ST_X * k) / TYRE_R;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.15, 0], dir: [0.15, 0.4, 1], from: 4.6, to: 4.0, dur: Math.max(8, rubber), fov: 35 },
    { at: rubber, move: "push", look: [0.9, 0.05, 0], dir: [0.25, 0.25, 1], to: 2.4, dur: Math.max(8, steel - rubber) },
    { at: steel, move: "push", look: [-0.9, 0.05, 0], dir: [-0.15, 0.25, 1], from: 2.4, to: 2.2, dur: Math.max(8, speeds - steel) },
    { at: speeds, move: "push", look: [1.5, 1.0, 0], dir: [0.8, 0.38, 0.7], from: 24, to: 21, dur: Math.max(8, quieter - speeds) },
    { at: quieter, move: "push", look: [ST_X - 2.5, 0.8, 0], dir: [0.8, 0.38, 0.7], to: 10, dur: Math.max(10, end - quieter) },
  ]);
  const patch = k01(f, grips, 10);
  const slip = k01(f, steel, 6);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#151b2c", bottom: "#05060b", glow: "rgba(255,179,64,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={run ? 12 : 3}>
        <Camera3D keys={keys} seed="v2421-grip" />
        {!run && (
          <group>
            {/* the test bench and the wall behind */}
            <mesh position={[0, -0.4, 0]} material={mat("brushed", "#3b4250")}><boxGeometry args={[3.6, 0.7, 1.6]} /></mesh>
            <mesh position={[0, -0.04, 0.83]} material={glow(TECH.cyan, 0.6)}><boxGeometry args={[3.6, 0.02, 0.02]} /></mesh>
            <mesh position={[0, 1.2, -1.4]} material={mat("clay", "#2a3040")}><boxGeometry args={[6, 4, 0.1]} /></mesh>
            {[-2, -1, 0, 1, 2].map((x) => <mesh key={x} position={[x, 1.6, -1.34]} material={glow("#9fb4c8", 0.25)}><boxGeometry args={[0.04, 3, 0.02]} /></mesh>)}
            <mesh position={[-0.9, 1.1, -1.33]} material={mat("glossy", "#14213d")}><boxGeometry args={[1.4, 0.9, 0.03]} /></mesh>
            <mesh position={[0.9, 1.1, -1.33]} material={mat("glossy", "#3a2a10")}><boxGeometry args={[1.4, 0.9, 0.03]} /></mesh>
            {/* left: steel wheel on a rail */}
            <group position={[-0.9, 0, 0]}>
              <mesh position={[0, -0.03, 0]} material={mat("brushed", "#b9c0cb")}><boxGeometry args={[1.4, 0.06, 0.08]} /></mesh>
              <mesh position={[0, -0.12, 0]} material={mat("brushed", "#5c636d")}><boxGeometry args={[1.4, 0.12, 0.03]} /></mesh>
              <SteelWheel position={[0, STEEL_R, -0.02]} rotation-y={Math.PI / 2 - 0.25} spin={f * 0.05 + (f > steel ? (f - steel) * 0.35 * slip : 0)} flange={1} />
              {slip > 0.02 && <mesh position={[0, 0.006, 0]} material={glow(AMBER, q(0.5 + 0.5 * m.pulse(steel + 3, 8)))}><boxGeometry args={[0.06, 0.012, 0.06]} /></mesh>}
            </group>
            {/* right: rubber tyre on a flat track */}
            <group position={[0.9, 0, 0]}>
              <mesh position={[0, -0.03, 0]} material={mat("brushed", "#8c939d")}><boxGeometry args={[1.4, 0.06, 0.4]} /></mesh>
              <Tyre position={[0, TYRE_R, 0]} rotation-y={0.25} spin={f * 0.05} squash={0.12 * patch} />
              {patch > 0.02 && <mesh position={[0, 0.006, 0]} material={glow(AMBER, q(0.55 + 0.35 * patch))}><boxGeometry args={[0.36 * patch, 0.012, 0.22]} /></mesh>}
            </group>
            <spotLight position={[0, 3.5, 2.5]} angle={0.7} penumbra={0.6} intensity={30 + 6 * m.pulse(why + 3, 8)} color="#fff1d6" />
            <Label3D at={[0.9, 0.0, 0.1]} offset={[0.25, 0.95, 0.4]} text="grip" start={grips + 2} end={steel} px={60} color={TECH.amber} align="center" />
            <Label3D at={[-0.9, 0.0, 0.05]} offset={[-0.2, 0.95, 0.4]} text="slip" start={steel + 4} px={60} color="#ff6b5a" align="center" />
            {f >= trouble && <Label3D at={[0.9, TYRE_R * 2, 0]} offset={[0.1, 0.4, 0]} text="rubber" start={trouble} end={rubber + 30} px={48} color={TECH.white} align="center" />}
          </group>
        )}
        {run && (
          <group>
            <Track length={2 * ST_X + 14} />
            {[-ST_X, ST_X].map((x) => (
              <group key={x}>
                <mesh position={[x, 0.45, -2.6]} material={mat("clay", "#8c8780")}><boxGeometry args={[CAR_LEN + 1.2, 1.0, 2.6]} /></mesh>
                <mesh position={[x, 2.2, -4.2]} material={glow("#fff0cf", 0.7)}><boxGeometry args={[CAR_LEN + 1.2, 3.2, 0.1]} /></mesh>
              </group>
            ))}
            {/* the tunnel between them */}
            <mesh position={[0, 2.0, -4.3]} material={mat("clay", "#262a33")}><boxGeometry args={[2 * ST_X - CAR_LEN - 1.2, 4.6, 0.2]} /></mesh>
            <mesh position={[0, 4.4, -1.5]} material={mat("clay", "#262a33")}><boxGeometry args={[2 * ST_X + 8, 0.2, 6]} /></mesh>
            <MetroCar position={[front - CAR_LEN / 2, 0, 0]} spin={spinRun} />
            {/* speed streaks behind it while it accelerates */}
            {f < brakes && Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[front - CAR_LEN - 1.2 - i * 0.2, 0.9 + i * 0.32, 1.1]} material={glow("#bfe8ff", q(0.5 * k01(f, speeds, 6)))}>
                <boxGeometry args={[1.6 + 0.4 * i, 0.03, 0.03]} />
              </mesh>
            ))}
            {/* brakes glow at the bogies */}
            {f >= brakes && f < harder + 20 && BOGIES.map((bx) => (
              <mesh key={bx} position={[front - CAR_LEN / 2 + bx, TYRE_R, 1.1]} material={glow("#ff5a3d", q(0.9 * (1 - k01(f, harder + 6, 14))))}>
                <boxGeometry args={[0.5, 0.18, 0.04]} />
              </mesh>
            ))}
            {BOGIES.map((bx) => (
              <Rings key={bx} f={f} start={quieter} every={7} life={22} reach={0.7 * (1 - 0.6 * k01(f, quieter, 30))} position={[front - CAR_LEN / 2 + bx, TYRE_R, 1.15]} strength={1 - k01(f, quieter + 20, 20)} />
            ))}
            <Label3D at={[ST_X - 2.5, 2.6, 0]} offset={[0, 0.9, 0.3]} text="quieter" start={quieter + 4} px={60} color={TECH.cyan} align="center" />
            <pointLight position={[0, 3, 4]} intensity={20} color="#dfe8ff" distance={30} />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Grip;
