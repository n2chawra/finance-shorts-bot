// Shelf: "Game makers chose triangles, and NVIDIA struggled to stay in business."
// The game shelf from the hook (wide): "makers" boxes light up cyan one after another; "went" triangle
// badges stamp on; "triangles" the shelf glows; "few"/"wrote"/"curves" one box with a curve badge glows
// amber (medium). "NVIDIA": cut to a card under one lamp (close); "struggling"/"stay"/"business": the lamp
// dims, the chip greys, the light gutters out.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, GPUBoard, Label3D, Place3D, Stage3D, TECH } from "../../three/index";
import { AMBER, GameShelf, Pool, k01 } from "./Parts";

const Shelf: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const makers = m.at("makers", 6);
  const went = m.at("chose", 12);
  const tri = m.at("triangles", 20);
  const few = m.at("triangles", 20) + 8;
  const wrote = few + 6;
  const curves = few + 4;
  const nvidia = m.at("nvidia", 54);
  const struggling = m.at("struggled", 62);
  const stay = m.at("stay", 72);
  const business = m.at("business", 80);
  const end = Math.max(m.end, business + 20);
  const card = f >= nvidia;
  const order = [0, 9, 1, 10, 2, 11, 3, 12, 4, 13, 6, 15, 7, 16, 8, 17, 14];
  const lit = (i: number) => {
    const n = order.indexOf(i);
    return n < 0 ? 0 : k01(f, makers + n * 1.2, 6) * (0.75 + 0.25 * k01(f, tri, 8));
  };
  const lamp = 1 - 0.45 * k01(f, struggling, 14) - 0.4 * k01(f, business, 12);
  const keys = card
    ? direct({}, [{ at: nvidia, move: "push", look: [0, 0.3, 0], dir: [0.2, 0.7, 1], from: 4.2, to: 3.4, dur: Math.max(10, end - nvidia), fov: 35 }])
    : direct({}, [
        { at: 0, move: "push", look: [0, 1.6, 0], dir: [0.05, 0.15, 1], from: 10, to: 9.2, dur: Math.max(8, few), fov: 35 },
        { at: few, move: "push", look: [0.5, 2.3, 0], dir: [0.1, 0.15, 1], to: 6.2, dur: Math.max(8, nvidia - few) },
      ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#141a2e", bottom: "#04050a", glow: "rgba(255,230,190,0.08)" }} floor="reflect" bloom={1} dof={0} blur={1}>
        <Camera3D keys={keys} seed="v2521-shelf" />
        {!card && (
          <group>
            <Place3D kind="studio" seed="v2521-shelf-studio" />
            <GameShelf lit={lit} badge={(i) => (i === 14 ? 0 : k01(f, went + (order.indexOf(i) % 6), 6))} curve={k01(f, few, 8) * (0.7 + 0.3 * m.pulse(wrote + 4, 8))} curveIdx={14} />
            <Label3D at={[0.67, 2.4, 0.5]} offset={[-0.6, 1.0, 0.3]} text="curves" start={curves} px={52} color={AMBER} align="center" />
            <pointLight position={[0, 3, 4]} intensity={10} color="#bfe9ff" distance={12} />
          </group>
        )}
        {card && (
          <group>
            <Pool r={1.8} k={lamp} />
            <spotLight position={[0, 5, 1.5]} angle={0.45} penumbra={0.7} intensity={Math.round(40 * lamp)} color="#ffe3b0" />
            <GPUBoard seed="nv1-alone" lit={Math.round(10 * (0.6 * lamp - 0.3 * k01(f, stay, 10))) / 10} rotation-y={0.3 + f * 0.003} />
            <Label3D at={[0, 0.3, 0]} offset={[0.2, 1.0, 0.2]} text="NVIDIA" start={nvidia + 2} end={business + 6} px={56} color={TECH.white} align="center" />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Shelf;
