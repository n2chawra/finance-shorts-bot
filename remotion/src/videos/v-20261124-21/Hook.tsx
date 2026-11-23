// Hook: "This Paris Metro train runs on rubber tyres."
// Frame 0: a Paris Metro train already roaring out of a dark tunnel toward the camera, headlights on
// (wide). "Paris": the headlights flare; "Metro": the yellow M sign over the tunnel mouth lights up;
// "train": the cab front fills more of the frame, tunnel lamps streaking; "rubber": cut low under the car
// to a fat black tyre spinning on its flat track, a label writes on (close); "tyres": the tread blurs, the
// tyre behind spins too.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { AXLES, BOGIES, CAR_LEN, MetroCar, TYRE_R, TYRE_Z, Track, Tunnel, k01 } from "./Parts";

/** where the train's front is at frame f of the tunnel shot (it comes toward +x) */
export const trainX = (f: number) => -13 + 0.085 * f;
export const TUNNEL_LOOK: [number, number, number] = [-3.5, 1.3, 0];
export const TUNNEL_DIR: [number, number, number] = [1, 0.16, 0.22];

export const TunnelShot: React.FC<{ f: number; m: ReturnType<typeof motion>; flare: number; sign: number }> = ({ f, flare, sign }) => {
  const x = trainX(f);
  return (
    <group>
      <Tunnel f={f} sign={sign} position={[0, 0, 0]} />
      <Track length={46} position={[-17, 0, 0]} />
      <MetroCar position={[x - CAR_LEN / 2, 0, 0]} spin={(x * 1) / TYRE_R} lights={0.7 + 0.3 * flare} />
      <MetroCar position={[x - CAR_LEN * 1.5 - 0.3, 0, 0]} spin={(x * 1) / TYRE_R} cab={false} />
      {/* headlight beams onto the track */}
      <pointLight position={[x + 0.8, 0.6, 0]} intensity={14 + 30 * flare} color="#fff4d6" distance={9} />
      <pointLight position={[2, 3.5, 3]} intensity={6} color="#9fb8ff" distance={12} />
    </group>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const paris = m.at("paris", 6);
  const metro = m.at("metro", 18);
  const train = m.at("train", 30);
  const rubber = m.at("rubber", 66);
  const tyres = m.at("tyres", 78);
  const end = Math.max(m.end, tyres + 24);
  const under = f >= rubber;
  const fx = BOGIES[1]! + AXLES[1]!;
  const keys = direct({}, [
    { at: 0, move: "push", look: TUNNEL_LOOK, dir: TUNNEL_DIR, from: 13.5, to: 11.5, dur: Math.max(8, train), fov: 35 },
    { at: train, move: "push", look: [-2.6, 1.2, 0], dir: TUNNEL_DIR, to: 9.5, dur: Math.max(8, rubber - train) },
    { at: rubber, move: "push", look: [fx, TYRE_R, TYRE_Z], dir: [0.55, 0.2, 1], from: 2.8, to: 2.2, dur: Math.max(8, end - rubber), fov: 35 },
  ]);
  const flare = m.pulse(paris + 3, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0b1226", bottom: "#030409", glow: "rgba(120,160,255,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2421-hook" />
        {!under && <TunnelShot f={f} m={m} flare={flare} sign={k01(f, metro, 8)} />}
        {under && (
          <group>
            <Track length={30} offset={-f * 0.12} />
            <MetroCar spin={(f * 0.12) / TYRE_R + (f >= tyres ? (f - tyres) * 0.08 : 0)} />
            {/* tunnel lamps streaking past behind */}
            {Array.from({ length: 8 }, (_, i) => {
              const lx = ((i * 4 - f * 0.12 * 3) % 32 + 32) % 32 - 16;
              return (
                <mesh key={i} position={[lx, 1.4, -2.4]}>
                  <boxGeometry args={[1.4, 0.06, 0.06]} />
                  <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
                </mesh>
              );
            })}
            <pointLight position={[fx + 1.5, 1.0, 2.5]} intensity={10} color="#dfe8ff" distance={8} />
            <Label3D at={[fx, TYRE_R + 0.2, TYRE_Z + 0.1]} offset={[0.3, 0.75, 0.2]} text="rubber tyre" start={rubber + 4} px={56} color={TECH.cyan} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
