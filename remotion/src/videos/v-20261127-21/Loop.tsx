// Loop: "Right now, your next video is racing under the sea, inside this cable."
// Just under the waves at night, light rippling down (wide). "now": a pulse of light drops into the water;
// "next": the camera dives after it; "video": marine snow streaks past; "racing": the pulse streaks down;
// "under" (medium): the seabed comes up out of the dark; "sea": the cable appears on the sand; "inside": the
// pulse enters the cable; "this": the camera settles on the hook's first framing, so the Short runs
// straight back into it.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Stage3D } from "../../three/index";
import { HOOK_DIR, HOOK_FROM, HOOK_LOOK, R, k01 } from "./Parts";
import { SEA_BACK, SEA_FOG, SeabedShot } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const now = m.at("now", 8);
  const next = m.at("next", 16);
  const racing = m.at("racing", 30);
  const under = m.at("racing", 30) + 6;
  const sea = m.at("through", 40);
  const inside = sea + 6;
  const thisW = m.at("this", 66);
  const end = Math.max(m.end, thisW + 16);
  // the pulse falls from the surface (y=12) to the cable
  const fall = cue(f, now, Math.max(16, inside - now), Easing.in(Easing.quad));
  const py = 9 - (9 - R * 2) * fall;
  const px = 3 - 2.4 * fall;
  const keys = direct({}, [
    { at: 0, move: "push", look: [1.5, 3, 0], dir: [0.4, 0.9, 1], from: 10, to: 9, dur: Math.max(8, next), fov: 38 },
    { at: next, move: "push", look: [1.2, 1.2, 0], dir: [0.45, 0.6, 1], to: 7.0, dur: Math.max(10, under - next) },
    { at: under, move: "push", look: HOOK_LOOK, dir: HOOK_DIR, from: 6.4, to: HOOK_FROM, dur: Math.max(10, end - under), ease: Easing.out(Easing.cubic), fov: 35 },
  ]);
  // the hook's clock: this beat's last frame meets the hook's frame 0
  const tf = f - end;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SEA_BACK} floor={false} fog={SEA_FOG} bloom={1.15} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2721-loop" />
        <SeabedShot f={tf} pulse={0.35 + 0.65 * k01(f, sea, 10)} />
        {/* the surface far above: a bright rippling sheet */}
        <mesh position={[0, 13, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial color="#5fb4e6" transparent opacity={0.35} toneMapped={false} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-6 + i * 2.6, 12.9, -2 + Math.sin(f * 0.05 + i) * 0.6]} rotation-x={Math.PI / 2} material={glow("#bfe8ff", 0.4)}>
            <planeGeometry args={[1.6, 0.12]} />
          </mesh>
        ))}
        {f >= now && f < inside + 6 && (
          <group position={[px, py, 0]}>
            <mesh material={glow("#ffffff", 1)}><sphereGeometry args={[0.12, 14, 10]} /></mesh>
            <mesh position={[0, 0.6, 0]} material={glow("#38e1ff", 0.6)}><boxGeometry args={[0.05, 1.2, 0.05]} /></mesh>
            <pointLight intensity={8} color="#38e1ff" distance={5} />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
