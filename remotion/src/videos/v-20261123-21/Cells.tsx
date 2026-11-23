// Cells: "Each tower covers one small patch, a cell. That's the cell in cell phone."
// High above the city at night: towers light one after another ("Each"); a hexagon spreads round each
// ("covers"); one lifts and glows amber ("patch", medium) and is labelled ("cell"); the handset's dot
// crosses into the next hexagon and its call line jumps to that tower ("That's"); the camera dives
// onto the dot ("phone", close).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { BACK, CityGrid, Hex, k01, q, Tower } from "./Models";

const R = 4.2;
const CENTRES: V3[] = (() => {
  const out: V3[] = [];
  for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
    const x = (c + (Math.abs(r) % 2 ? 0.5 : 0)) * Math.sqrt(3) * R, z = r * 1.5 * R;
    if (Math.hypot(x, z) < 14) out.push([x, 0.06, z]);
  }
  return out;
})();
const A = CENTRES.findIndex((c) => Math.abs(c[0]) < 0.1 && Math.abs(c[2]) < 0.1);
const B = CENTRES.findIndex((c) => c[2] === 0 && c[0] > 1 && c[0] < 9);

const Cells: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const each = m.at("each", 2);
  const covers = m.at("covers", 12);
  const patch = m.at("patch", 22);
  const cell = m.at("cell", 30);
  const thats = m.at("that's", 44);
  const phone = m.at("phone", 62);
  const end = Math.max(m.end, phone + 18);
  const a = CENTRES[A]!, b = CENTRES[B]!;
  const move = k01(f, thats, Math.max(12, phone - thats));
  const dot: V3 = [a[0] + (b[0] - a[0]) * (0.25 + 0.6 * move), 0.3, 1.2];
  const inB = dot[0] > (a[0] + b[0]) / 2;
  const tw = inB ? b : a;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0, 0], dir: [0.25, 1.6, 1], from: 40, to: 36, dur: Math.max(8, patch), fov: 40 },
    { at: patch, move: "push", look: [2, 0, 0.5], dir: [0.25, 1.4, 1], to: 24, dur: Math.max(8, phone - patch) },
    { at: phone, move: "dive", look: dot, dir: [0.3, 1.2, 1], to: 8, dur: Math.max(12, end - phone) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={16} fog={{ color: "#05070f", near: 20, far: 70 }}>
        <Camera3D keys={keys} seed="v2321-cells" />
        <CityGrid n={11} lights={0.7} seed="cells" />
        {CENTRES.map((c, i) => {
          const on = k01(f, each + i * 1.5, 6);
          const grow = k01(f, covers + i, 12);
          const hot = i === A ? k01(f, patch, 8) : 0;
          return (
            <group key={i} position={c}>
              <Tower h={2.6} lit={on} f={f + i * 7} />
              {grow > 0 && <Hex r={R * grow} line={0.35 + 0.4 * on} fill={hot} color={hot > 0.3 ? TECH.amber : TECH.cyan} position={[0, 0.2 + 0.8 * hot, 0]} />}
            </group>
          );
        })}
        {/* the handset as a dot, its call line to the tower it is in */}
        <mesh position={dot} material={glow(TECH.white)}><sphereGeometry args={[0.35 + 0.1 * Math.sin(f * 0.3), 16, 10]} /></mesh>
        <mesh position={[(dot[0] + tw[0]) / 2, 1.5, (dot[2] + tw[2]) / 2]}
          rotation-z={Math.atan2(2.4, tw[0] - dot[0])} material={glow(TECH.cyan, q(0.8))}>
          <boxGeometry args={[Math.hypot(tw[0] - dot[0], tw[2] - dot[2], 2.4), 0.08, 0.08]} />
        </mesh>
        <Label3D at={[a[0], 1.2, a[2] - 1]} offset={[-1.5, 3.5, 0]} text="cell" start={cell} px={66} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Cells;
