// Release (no voice: the drop to silence, the failure): extreme close on a wheel of the parked train and
// its brake shoe, time slowed; the shoe goes amber to red as the air runs out ("strain"); on the groan it
// backs off the tread and the wheel creeps, then turns, rust flakes falling ("reveal"); cut wide on "wide":
// the whole train starts to move down the grade. No people.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, Focus } from "../../three/index";
import { Consist, Line, RampMat, Shot3D, Trees, useMats } from "./World";
import { GRADE } from "./Hill";

const WR = 1.0;

/** One wheel at a big scale: the disc, its flange, bolts and the axle, on its rail, with the shoe. */
const BigWheel: React.FC<{ turn: number; shoe: number; stress: number; flakes: number }> = ({ turn, shoe, stress, flakes }) => {
  const M = useMats();
  const steel = M.paint("metal", "#7d8188"), rust = M.paint("concrete", "#5a3d2c"), dark = M.paint("dark", "#1d1e21"), rail = M.paint("metal", "#9aa0a8");
  return (
    <group>
      {/* the rail and a sleeper */}
      <mesh position={[0, -0.06, 0]} material={rail}><boxGeometry args={[14, 0.12, 0.16]} /></mesh>
      <mesh position={[0, -0.2, 0.1]} material={rust}><boxGeometry args={[14, 0.16, 0.3]} /></mesh>
      {[-3, 0, 3].map((x) => <mesh key={x} position={[x, -0.34, 0]} material={dark}><boxGeometry args={[0.7, 0.14, 3]} /></mesh>)}
      {/* the wheel */}
      <group position={[0, WR, 0]} rotation-z={-turn}>
        <mesh rotation-x={Math.PI / 2} material={steel}><cylinderGeometry args={[WR, WR, 0.22, 48]} /></mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, -0.14]} material={dark}><cylinderGeometry args={[WR * 1.08, WR * 1.08, 0.06, 48]} /></mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, 0.12]} material={rust}><cylinderGeometry args={[WR * 0.82, WR * 0.82, 0.04, 40]} /></mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.32, Math.sin((i / 8) * Math.PI * 2) * 0.32, 0.16]} rotation-x={Math.PI / 2} material={steel}><cylinderGeometry args={[0.05, 0.05, 0.06, 6]} /></mesh>
        ))}
        <mesh position={[0, 0, 0.3]} rotation-x={Math.PI / 2} material={dark}><cylinderGeometry args={[0.18, 0.18, 0.4, 20]} /></mesh>
        {/* a chalk-white witness mark on the rim, so the turn reads */}
        <mesh position={[0, WR * 0.9, 0.13]} material={M.paint("concrete", "#e8e4da")}><boxGeometry args={[0.06, 0.16, 0.01]} /></mesh>
      </group>
      {/* the brake shoe on the tread, and its hanger */}
      <group position={[WR + 0.12 + shoe, WR, 0]}>
        <mesh><boxGeometry args={[0.2, 0.9, 0.26]} /><RampMat v={stress} /></mesh>
        <mesh position={[0.25, 0, 0]} material={dark}><boxGeometry args={[0.3, 0.2, 0.14]} /></mesh>
        <mesh position={[0.4, 0.7, 0]} rotation-z={0.15} material={dark}><boxGeometry args={[0.1, 1.6, 0.1]} /></mesh>
      </group>
      <Debris at={[WR + 0.05, WR - 0.3, 0.1]} count={22} size={0.035} speed={0.7} dir={[0.3, -0.4, 0.4]} spread={0.3} start={0.02} seconds={1.6} slow={0.5} gravity={2} floor={0}
        kind="metal" sparks={false} color="#6b4630" seed="lm-flakes" progress={flakes} />
    </group>
  );
};

const Release: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const strain = m.at("strain", 9), reveal = m.at("reveal", 27), wideAt = m.at("wide", 48);
  const wide = t >= wideAt;
  const stress = Math.min(1, 0.45 + cue(t, 0, Math.max(8, reveal), (x) => x) * 0.55 + 0.05 * m.pulse(strain + 4, 8));
  const shoe = cue(t, reveal, 14, Easing.out(Easing.cubic)) * 0.22;
  const roll = Math.max(0, t - reveal);
  const turn = 0.0009 * roll * roll;
  const travelled = 0.0012 * Math.max(0, t - wideAt + 30) ** 2;
  const keys = wide
    ? direct({}, [
        { at: 0, move: "hold", pos: [6, 2.4, 8], look: [-6, 0.6, 0], fov: 44 },
        { at: wideAt, move: "cut", pos: [6, 2.4, 8], look: [-6, 0.6, 0], fov: 44 },
        { at: wideAt + 1, move: "push", look: [-4, 0.6, 0], dir: [0.7, 0.2, 0.68], from: 13, to: 12, dur: Math.max(10, m.end - wideAt) },
      ])
    : direct({}, [
        { at: 0, move: "push", look: [WR * 0.7, WR, 0], dir: [0.35, 0.18, 0.92], from: 3.6, to: 3.2, dur: Math.max(8, reveal), fov: 46 },
        { at: reveal, move: "pullback", look: [WR * 0.5, WR * 0.9, 0], dir: [0.4, 0.2, 0.9], to: 4.0, dur: Math.max(10, wideAt - reveal) },
      ]);
  return (
    <Shot3D f={t} tag={wide ? "reconstruction" : "paused"}>
      <Camera3D keys={keys} seed="lm-release" drift={wide ? 0.01 : 0.003} />
      {wide ? (
        <>
          <Focus at={[-4, 0.6, 0]} range={8} />
          <group rotation-z={GRADE}>
            <Line length={90} x={-15} />
            <Trees from={-60} to={30} seed="hill-trees" />
            <Consist cars={12} travelled={travelled} loco={{ lamp: 0, head: 0 }} />
          </group>
        </>
      ) : (
        <>
          <Focus at={[WR, WR, 0]} range={1.2} />
          <pointLight position={[2.4, 2.6, 2.2]} intensity={3} distance={9} color="#ffcf9a" />
          <pointLight position={[-2, 1.6, 2.5]} intensity={1.2} distance={8} color="#7fb4ff" />
          <BigWheel turn={turn} shoe={shoe} stress={stress} flakes={cue(t, reveal, 40, (x) => x)} />
        </>
      )}
    </Shot3D>
  );
};
export default Release;
