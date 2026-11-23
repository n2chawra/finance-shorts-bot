// Flat (payoff): "If a tyre goes flat, that wheel drops onto the rail and the train rolls on. A steel train,
// hiding inside a rubber one."
// Close on a front tyre and the steel wheel beside it. "If": a nail glints in the tread; "goes": air puffs
// out in rings; "flat": the tyre sags flat; "drops": the steel wheel drops onto the rail, sparks fly;
// "rail": the rail glows where it lands; "rolls": the track runs on under it, the steel wheel turning on the
// rail (medium). "steel": cut wide: the whole two-car train in the tunnel turns see-through, its steel wheels
// glowing; "hiding": they light up one bogie after another; "rubber": the rubber tyres glow back on around them.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { AXLES, Bogie, CAR_LEN, MetroCar, Rings, Sparks, STEEL_Z, TYRE_R, TYRE_Z, Track, k01, q } from "./Parts";

const Flat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const ifW = m.at("if", 2);
  const goes = m.at("goes", 14);
  const flat = m.at("flat", 22);
  const drops = m.at("drops", 44);
  const rail = m.at("rail", 66);
  const rolls = m.at("rolls", 92);
  const steel = m.at("steel", 130);
  const hiding = m.at("hiding", 150);
  const rubber = m.at("rubber", 180);
  const end = Math.max(m.end, rubber + 24);
  const ax = AXLES[1]!;
  const sag = k01(f, flat - 4, 22);
  const move = f > rolls ? (f - rolls) * 0.06 : 0;
  const wide = f >= steel;
  const keys = direct({}, [
    { at: 0, move: "push", look: [ax, 0.25, 0.62], dir: [0.75, 0.3, 1], from: 2.5, to: 2.1, dur: Math.max(8, rolls), fov: 35 },
    { at: rolls, move: "pullback", look: [0.2, 0.3, 0.4], dir: [0.7, 0.4, 1], to: 3.6, dur: Math.max(8, steel - rolls) },
    { at: steel, move: "push", look: [-3.2, 1.0, 0], dir: [0.55, 0.42, 1], from: 15, to: 13, dur: Math.max(10, end - steel) },
  ]);
  // the lit order of the four bogies, front first
  const litAt = (i: number) => k01(f, hiding + i * 8, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#131827", bottom: "#040509", glow: "rgba(255,179,64,0.10)" }} floor={false} bloom={1.15} dof={0} blur={1} shadowBox={wide ? 8 : 3}>
        <Camera3D keys={keys} seed="v2421-flat" />
        {!wide && (
          <group>
            <Track length={16} offset={-move} railLit={k01(f, rail, 8) * (1 - 0.5 * k01(f, rolls + 20, 20))} />
            <Bogie spin={(f * 0.03 + move) / TYRE_R} flat={k01(f, drops - 2, 8)} steelLit={0.3 + 0.7 * k01(f, drops, 6)} />
            {/* the flat tyre's own sag, ahead of the drop */}
            {f < drops && sag > 0.02 && <mesh position={[ax, 0.01, TYRE_Z]} material={glow("#ff6b5a", q(0.5 * sag))}><boxGeometry args={[0.3, 0.01, 0.22]} /></mesh>}
            {/* the nail in the tread */}
            <mesh position={[ax + 0.12, 0.08, TYRE_Z + 0.06]} rotation-z={0.6} material={glow("#e8edf5", q(0.4 + 0.6 * m.pulse(ifW + 4, 10)))}>
              <boxGeometry args={[0.012, 0.09, 0.012]} />
            </mesh>
            <Rings f={f} start={goes} every={5} life={16} reach={0.45} stop={flat + 14} position={[ax + 0.15, 0.12, TYRE_Z + 0.12]} color="#dfe8ff" />
            <Sparks f={f} start={drops} position={[ax, 0.0, STEEL_Z]} />
            <Sparks f={f} start={drops + 10} seed="spk2" n={10} position={[ax, 0.0, STEEL_Z]} />
            <pointLight position={[ax + 1.0, 1.4, 1.6]} intensity={14} color="#fff1d6" distance={6} />
            <Label3D at={[ax, 0.05, TYRE_Z + 0.1]} offset={[0.35, 0.7, 0.3]} text="flat tyre" start={flat + 4} end={rolls} px={56} color="#ff6b5a" align="center" />
          </group>
        )}
        {wide && (
          <group>
            <Track length={30} offset={-move} />
            {[0, 1].map((ci) => (
              <MetroCar key={ci} position={[-ci * (CAR_LEN + 0.3), 0, 0]} cab={ci === 0} see={0.9} spin={(f * 0.03 + move) / TYRE_R}
                bogie={{ tyreLit: 0.8 * k01(f, rubber, 10) }}
                bogieAt={{ 0: { steelLit: litAt(ci * 2 + 1) }, 1: { steelLit: litAt(ci * 2), flat: ci === 0 ? 1 : 0 } }} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} position={[-12 + i * 3.2, 2.9, -2.2]} material={glow("#ffd9a0", 0.6)}><boxGeometry args={[0.6, 0.06, 0.06]} /></mesh>
            ))}
            <pointLight position={[0, 4, 5]} intensity={20} color="#dfe8ff" distance={30} />
            <Label3D at={[-0.6, 0.9, 0]} offset={[0.4, 2.1, 0.5]} text="steel wheels" start={hiding + 2} px={58} color={TECH.amber} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Flat;
