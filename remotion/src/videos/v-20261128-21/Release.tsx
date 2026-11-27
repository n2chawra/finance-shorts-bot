// Release: "Once the engine fires and races ahead, a one-way clutch lets the pinion spin free. Let go of the key, and a spring pulls it back."
// "Let": cut to the starter's nose as the coil goes dark.
// Inside one cylinder (close): "fires": the spark plug fires, an amber flash, the piston slams down; "races" (wide):
// the whole engine, the flywheel suddenly spinning fast, the starter's case turning warning red; "one-way" (close):
// cut to the clutch inside the pinion, sliced open, its rollers labelled; "clutch": the rollers slip back in their
// ramps; "free": the outer ring spins free while the hub slows, the red fades; "spring" (medium): the starter's nose,
// the return spring labelled; "back": the pinion slides back out of the ring, a gap opening.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { BACK, Clutch, Flywheel, HC, Machine, PINION_TEETH, RING_TEETH, STARTER_AT, Starter, k01, q } from "./Parts";

const Cylinder: React.FC<{ y: number; flash: number }> = ({ y, flash }) => (
  <group>
    <mesh position={[0, 0.2, 0]} material={mat("glass", "#bfe8ff")}>
      <cylinderGeometry args={[1.0, 1.0, 3.4, 40, 1, true]} />
    </mesh>
    <mesh position={[0, 1.95, 0]} material={mat("brushed", "#5b616b")}>
      <cylinderGeometry args={[1.08, 1.08, 0.2, 40]} />
    </mesh>
    <mesh position={[0, 1.7, 0]} material={mat("ceramic", "#e8e8ee")}>
      <cylinderGeometry args={[0.12, 0.12, 0.5, 14]} />
    </mesh>
    <mesh position={[0, y, 0]} material={mat("aluminium", "#d2d7df")}>
      <cylinderGeometry args={[0.94, 0.94, 0.9, 40]} />
    </mesh>
    {[0.25, 0.1].map((d) => (
      <mesh key={d} position={[0, y + 0.45 - d, 0]} material={mat("brushed", "#8b929e")}>
        <cylinderGeometry args={[0.955, 0.955, 0.05, 40]} />
      </mesh>
    ))}
    {flash > 0.04 && (
      <mesh position={[0, 1.2, 0]} scale={[1, 0.6 + 0.4 * flash, 1]} material={glow(TECH.amber, q(flash))}>
        <sphereGeometry args={[0.85, 24, 16]} />
      </mesh>
    )}
  </group>
);

const Release: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fires = m.at("fires", 6);
  const races = m.at("fires", 6) + 14;
  const oneway = m.at("one-way", 30);
  const clutch = m.at("clutch", 40);
  const free = m.at("free", 54);
  const letgo = m.at("let", 64);
  const spring = m.at("spring", 74);
  const back = m.at("back", 84);
  const end = Math.max(m.end, back + 18);
  const shot = f < races ? 0 : f < oneway ? 1 : f < letgo ? 2 : 3;
  const fast = Math.max(0, f - races);
  const crank = -0.05 * f - 0.002 * fast * fast;
  const warn = shot === 1 ? k01(f, races + 4, 8) : 0;
  const slip = k01(f, clutch, 10);
  const keys =
    shot === 0 ? direct({}, [{ at: 0, move: "push", look: [0, 1.0, 0], dir: [0.2, 0.15, 0.97], from: 6.0, to: 5.2, dur: Math.max(8, races), fov: 40 }])
    : shot === 1 ? direct({}, [{ at: races, move: "push", look: [2.0, HC, 0.5], dir: [0.38, 0.28, 0.88], from: 10, to: 9.0, dur: Math.max(8, oneway - races), fov: 40 }])
    : shot === 2 ? direct({}, [{ at: oneway, move: "push", look: [0, 1.5, 0], dir: [0.85, 0.2, 0.48], from: 4.6, to: 4.0, dur: Math.max(10, letgo - oneway), fov: 40 }])
    : direct({}, [{ at: letgo, move: "push", look: [STARTER_AT[0] + 0.8, STARTER_AT[1] + 0.3, STARTER_AT[2]], dir: [0.3, 0.3, 0.9], from: 3.8, to: 3.3, dur: Math.max(10, end - letgo), fov: 40 }]);
  const pistonY = -0.2 - 0.9 * k01(f, fires + 2, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 12, far: 36 }}>
        <Camera3D keys={keys} seed={`v2821-release-${shot}`} />
        {shot === 0 && <Cylinder y={pistonY} flash={k01(f, fires, 3) * (1 - k01(f, fires + 6, 12))} />}
        {shot === 0 && <Label3D at={[0, 1.95, 0]} offset={[0.9, 0.5, 0.3]} text="spark plug" start={fires} px={56} color={TECH.white} align="center" />}
        {shot === 1 && <Machine pinion={(-crank * RING_TEETH) / PINION_TEETH} crank={crank} engage={1} fire={0.9} warn={warn} coil={0.7} windings={0.6} />}
        {shot === 2 && (
          <group>
            <Flywheel position={[1.8, HC - 0.3, -2.5]} angle={-0.3 * f} />
            <Clutch position={[0, 1.3, 0]} outer={-0.05 * f - 0.25 * Math.max(0, f - free)} inner={-0.05 * Math.min(f, free) - 0.02 * Math.max(0, f - free)} slip={slip} lit={slip} />
            <Label3D at={[0, 2.0, 0.1]} offset={[0.5, 0.5, 0.3]} text="one-way clutch" sub="inside the pinion" start={oneway} px={56} color={TECH.amber} align="center" />
          </group>
        )}
        {shot === 3 && (
          <group>
            <Flywheel position={[0, HC, 0]} angle={-0.3 * f} />
            <Starter position={STARTER_AT} engage={1 - 0.15 * k01(f, m.at("key", 70), 8) - 0.85 * k01(f, back, 12)} spin={-0.1 * f} coil={0.6 * (1 - k01(f, letgo + 2, 10))} see={1} />
            <Label3D at={[STARTER_AT[0] + 0.85, STARTER_AT[1] + 0.5, STARTER_AT[2]]} offset={[0.2, 0.75, 0.2]} text="return spring" start={spring + 2} px={56} color={TECH.white} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Release;
