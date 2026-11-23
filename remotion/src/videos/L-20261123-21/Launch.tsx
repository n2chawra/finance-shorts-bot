// Launch: space above the Earth's curve, a rocket's upper stage with its nose cone splitting open on a
// tall stack of flat satellites (as many as params.fig.count), which drift apart, fan out into a long line
// like beads on a string and climb. Actions: sign, fairing, stack, count, year, release, spread, train,
// beads, climb, spaced.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { BACK, lerpV, q, Shot, Stars, useBeat, Words, type Anchor } from "./kit";

const RE = 70;

const Launch: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, has } = b;
  const n = Math.max(10, Math.min(80, parseInt(b.fig.count ?? "", 10) || 60));
  const open = has("fairing") ? k("fairing", 30) : has("release") || has("spread") || has("train") ? 1 : 0;
  const rel = k("release", 50), spr = k("spread", 50), trn = k("train", 50), clb = k("climb", 50), spc = k("spaced", 40);
  const H = 0.07;
  const satPos = (i: number): V3 => {
    const s0: V3 = [0, 0.6 + i * H, 0];
    const s1: V3 = [s0[0] + (rnd("rx", i) - 0.5) * 0.8, s0[1] + i * 0.02, s0[2] + (rnd("rz", i) - 0.5) * 0.8];
    const s2: V3 = [-(i / n) * 9 + (rnd("fx", i) - 0.5) * 2, 3 + (rnd("fy", i) - 0.5) * 2.5, -(i / n) * 6 + (rnd("fz", i) - 0.5) * 2];
    const u = i / (n - 1);
    const gap = 1 - 0.25 * spc;
    const s3: V3 = [-u * 22 * gap + 2, 4 + 1.2 * Math.sin(u * 3) + clb * 3 * (1 - u), -u * 14 * gap];
    let pnt = lerpV(s0, s1, rel);
    pnt = lerpV(pnt, s2, spr);
    pnt = lerpV(pnt, s3, trn);
    return pnt;
  };
  const glint = has("beads") ? (i: number) => Math.max(0, 1 - Math.abs(((f - (b.at("beads"))) / 40) % 1 - i / n) * 18) : () => 0;
  const anchors: Record<string, Anchor> = {
    stack: { look: [0, 2.6, 0], dir: [0.6, 0.25, 1], d: 7.5 },
    train: { look: [-7, 4, -5], dir: [0.35, 0.3, 1], d: 13 },
  };
  const pos = (on: string): V3 => on === "plate" ? [1.4, 0.5, 0.9] : on === "year" ? [-1.6, 0.5, 0.9] : on === "stack" ? [0.9, 4.4, 0] : on === "train" ? [-6, 6, -4] : anchors[on]?.look ?? [0, 2, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 2, 0], r0: 14, r1: 90, size: 2.34 }} seed="launch" backdrop={BACK} floor={false} bloom={1.15} fov={40}>
      <Stars f={f} n={170} r={110} bright={0.6} seed="launchstars" />
      <directionalLight position={[-12, 8, 10]} intensity={2.3} />
      <mesh position={[0, -RE - 9, -10]} material={mat("glossy", "#1a3f78", { roughness: 0.4 })}><sphereGeometry args={[RE, 96, 64]} /></mesh>
      <mesh position={[0, -RE - 9, -10]} scale={1.012} material={glow("#5aa8ff", 0.12)}><sphereGeometry args={[RE, 64, 40]} /></mesh>
      {/* the upper stage, drifting away once the stack is released */}
      <group position={[0, -2.6 * rel, 0]}>
        <mesh position={[0, -1.6, 0]} material={mat("white", "#e4e7ee")}><cylinderGeometry args={[1.05, 1.05, 3.6, 32]} /></mesh>
        <mesh position={[0, -3.7, 0]} material={mat("aluminium", "#6c7280")}><coneGeometry args={[0.6, 0.8, 20]} /></mesh>
        <mesh position={[0, -4.3, 0]} material={glow(TECH.amber, q(0.4 * (1 - rel)))}><sphereGeometry args={[0.35, 10, 8]} /></mesh>
        <Block size={[2.0, 0.12, 2.0]} radius={0.04} preset="aluminium" position={[0, 0.35, 0]} />
        {/* the nose cone halves, swinging open */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.05, 0.3, 0]} rotation-z={-s * 1.3 * open}>
            <mesh position={[-s * 1.05, 3.2, 0]} material={mat("white", "#f1f2f6")}>
              <cylinderGeometry args={[0.25, 1.08, 5.6, 24, 1, true, s > 0 ? 0 : Math.PI, Math.PI]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* the satellites */}
      {Array.from({ length: n }, (_, i) => {
        const pnt = satPos(i);
        const g = glint(i);
        return (
          <group key={i} position={pnt} rotation={[0.05 * rnd("tr", i) * rel, rnd("ty", i) * 2 * spr, 0]}>
            <Block size={[1.3, 0.05, 0.62]} radius={0.01} material={g > 0.1 ? glow(TECH.white, q(0.4 + 0.6 * g)) : mat("brushed", "#bcc3cf")} />
            <mesh position={[0, -0.028, 0]} rotation-x={Math.PI / 2} material={glow(TECH.cyan, q(0.15 + 0.6 * k("stack", 14)))}><planeGeometry args={[1.2, 0.5]} /></mesh>
          </group>
        );
      })}
      <Words b={b} pos={pos} signAt={() => [0, -1.4 - 2.6 * rel, 1.07]} signH={0.4} />
    </Shot>
  );
};
export default Launch;
