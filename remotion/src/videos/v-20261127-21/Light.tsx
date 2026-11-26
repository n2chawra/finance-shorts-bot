// Light: "Your video races down one as flashes of light, bouncing off the glass walls from one continent
// to the next."
// Inside one glass fibre, a glowing glass tunnel (close). "video": a pulse of light forms at the tunnel's
// mouth; "races": it shoots in; "flashes": a train of flashes follows; "light": the walls light; "bouncing":
// the light zigzags off the walls (medium) and "walls" flash where it hits; "glass": the camera rides along;
// "continent": cut far out: the fibre is a thin glowing line across the seabed (wide); "next": it reaches a
// far shore with its lights on.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { CYAN, FibreTunnel, Seabed, k01, q, zig } from "./Parts";
import { SEA_BACK } from "./Hook";

const Shore: React.FC<{ x: number; lit: number }> = ({ x, lit }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[3, 0.6, 0]} material={glow("#0b2233", 1)}>
      <boxGeometry args={[6, 1.2, 30]} />
    </mesh>
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={i} position={[1.2 + (i % 4) * 0.8, 1.4 + (i % 3) * 0.5, -5 + i * 0.75]} material={glow("#ffd59a", q(0.3 + 0.7 * lit))}>
        <boxGeometry args={[0.3, 0.6 + (i % 3) * 0.4, 0.3]} />
      </mesh>
    ))}
  </group>
);

const Light: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const video = m.at("video", 2);
  const races = m.at("races", 10);
  const flashes = m.at("flashes", 24);
  const light = m.at("light", 34);
  const bouncing = m.at("bouncing", 44);
  const walls = m.at("walls", 56);
  const glassW = m.at("glass", 62);
  const continent = m.at("continent", 80);
  const next = m.at("next", 96);
  const end = Math.max(m.end, next + 20);
  const out = f >= continent;
  // the pulse's front: waits at the mouth, then races
  const head = -2 + 0.1 * Math.max(0, f - races) + 4 * cue(f, races, 10, Easing.out(Easing.cubic));
  const form = cue(f, video, 10, Easing.out(Easing.back(1.5)));
  // the fibre stands upright (its x axis turned to point down the frame): the light races downward and the
  // camera tracks it at one distance, so the picture stays readable
  const d = 5.2 + 1.2 * k01(f, bouncing, 14);
  const ly = -(Math.max(0, head) - 1.2);
  const keys = out
    ? direct({}, [
      { at: continent, move: "push", look: [6, 0.2, 0], dir: [-0.6, 0.55, 1], from: 22, to: 19, dur: Math.max(10, end - continent), fov: 38 },
    ])
    : direct({}, [
      { at: 0, move: "hold", pos: [0.15 * Math.sin(f * 0.02), ly + 0.5, d], look: [0, ly, 0], fov: 35 },
    ]);
  const flash = m.pulse(walls + 2, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={out ? SEA_BACK : { top: "#03121f", bottom: "#000308", glow: "rgba(60,200,255,0.14)" }} floor={false}
        fog={out ? { color: "#04182a", near: 14, far: 60 } : undefined} bloom={1.25} dof={0} blur={out ? 1 : 0} shadowBox={5}>
        <Camera3D keys={keys} seed="v2721-light" />
        {!out && (
          <group rotation-z={-Math.PI / 2}>
            <FibreTunnel f={f} head={f >= races ? head : -2} flashes={f >= flashes ? 1 : 0} wall={Math.min(1, k01(f, light, 10) + flash)} />
            {f < races + 4 && (
              <mesh position={[-2, zig(-2), 0]} scale={0.2 + 0.8 * form} material={glow("#ffffff", 1)}>
                <boxGeometry args={[0.42, 0.75, 0.04]} />
              </mesh>
            )}
            {f >= walls && <pointLight position={[head - 1.6, zig(head - 1.6), 0]} intensity={6 * flash} color="#ffffff" distance={3} />}
            {f >= bouncing && f < continent - 6 && <Label3D at={[head - 1, zig(head - 1), 0]} offset={[0.6, 0.9, 0]} text="light bounces" start={bouncing + 2} px={52} color={TECH.cyan} align="center" />}
          </group>
        )}
        {out && (
          <group>
            <Seabed size={120} />
            <mesh position={[-18 + 12 * k01(f, continent, 20), 0.05, 0]} material={glow(CYAN, 1)}>
              <boxGeometry args={[60, 0.06, 0.12]} />
            </mesh>
            <Shore x={22} lit={k01(f, next, 10)} />
            <directionalLight position={[2, 9, 4]} intensity={1.2} color="#9fd4ff" />
            {f >= next && <Label3D at={[22, 1.5, 0]} offset={[-1, 2.2, 0]} text="next continent" start={next + 2} px={52} color={TECH.white} align="center" />}
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Light;
