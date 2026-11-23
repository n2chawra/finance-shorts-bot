// Bench: a workbench under one lamp with the flat dish laid on it and taken apart: the white cover lifts
// off, the flat board under it carries a grid of small metal antenna patches, the board flips to show the
// control chips on its back with light traces out to the patches; a see-through curved TV dish appears
// beside it for comparison. Actions: sign, dish, turn, face, stand, cable, open, board, ghost, ghostRay,
// ghostOut, grid, wave, patch, patchLabel, patchUp, ripple, ripIn, spread, cross, flip, chips, traces,
// timing, beamUp, beamTilt, rain, snow.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { BACK, Beam, Cone, DotGrid, Lines, OldDish, q, Ripples, Shot, useBeat, Words, type Anchor } from "./kit";

const TOP = 1.0;           // the bench top
const W = 2.2, L = 3.2;    // the dish panel (x, z)
const NX = 10, NZ = 14;
const patchAt = (i: number, j: number): V3 => [(i - (NX - 1) / 2) * (W * 0.088), 0, (j - (NZ - 1) / 2) * (L * 0.066)];
const PI_ = 4, PJ = 9;     // the patch the camera picks out
const GHOST: V3 = [3.9, TOP, 0.2];

const Bench: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const open = has("open") || has("board") || has("grid") || has("patchUp") || has("flip") || has("chips") || has("together") || has("beamUp") || has("rain");
  const lift = has("open") ? k("open", 22) : open ? 1 : 0;
  const flip = k("flip", 26);
  const turn = has("turn") ? Math.sin(Math.PI * k("turn", 40)) * 0.55 : 0;
  const grid = Math.max(k("grid", 20), has("patchUp") || has("cross") ? 0.25 : 0);
  const wave = has("wave") && f >= at("wave") ? ((f - at("wave")) / 30) % 1 : -1;
  const patch = Math.max(k("patch", 10), has("patchUp") ? 1 : 0);
  const pUp = k("patchUp", 14);
  const boardY = TOP + 0.14;
  const P = patchAt(PI_, PJ);
  const patchPos: V3 = [P[0], boardY + 0.04 + 0.5 * pUp, P[2]];
  const ghostO = (has("ghost") ? k("ghost", 14) : 0) * (1 - k("ghostOut", 16) * 0.85);
  const beamUp = k("beamUp", 16);
  const lean = k("beamTilt", 24) * 0.55;
  const coverY = boardY + 0.12 + 1.5 * lift;
  const anchors: Record<string, Anchor> = {
    bench: { look: [0.5, TOP + 0.5, 0], dir: [0.3, 0.75, 1], d: 7.5 },
    dish: { look: [0, TOP - 0.5, 0.6], dir: [0.3, 0.9, 1], d: 5.2 },
    board: { look: [0, boardY, 0], dir: [0.15, 1.3, 1], d: 3.8 },
    patch: { look: patchPos, dir: [0.35, 0.8, 1], d: 1.3 },
    chips: { look: [0, boardY + 0.1, 0], dir: [0.3, 1.0, 1], d: 2.6 },
    cable: { look: [-2.6, TOP + 0.1, 1.6], dir: [0.4, 0.7, 1], d: 2.4 },
    stand: { look: [-2.2, TOP + 0.15, -0.6], dir: [0.3, 0.8, 1], d: 2.6 },
    ghost: { look: [GHOST[0], GHOST[1] + 1, GHOST[2]], dir: [0.15, 0.3, 1], d: 4 },
  };
  const pos = (on: string): V3 => on === "patch" ? patchPos : on === "ghost" ? [GHOST[0] - 0.6, GHOST[1] + 1.8, GHOST[2]] : on === "chips" ? [0.8, boardY + 0.2, -0.4] : on === "cable" ? [-2.8, TOP + 0.1, 1.8] : on === "stand" ? [-2.2, TOP + 0.2, -0.6] : anchors[on]?.look ?? [0, TOP, 0];
  const lamp: V3 = [-1.6, 4.2, -1.6];
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 2, 0], r0: 7, r1: 26, size: 0.78 }} seed="bench" backdrop={BACK} floor="reflect" bloom={1.1} fov={38}>
      {/* the pegboard wall behind the bench, and a floor of tiles */}
      <mesh position={[0.6, 3.5, -2.6]}><planeGeometry args={[16, 7]} /><meshStandardMaterial color="#6b5a45" roughness={0.9} /></mesh>
      <DotGrid x0={-7} x1={8} y0={0.4} y1={6.8} z={-2.58} gap={0.28} size={0.09} color="#1a140e" />
      <mesh rotation-x={-Math.PI / 2} position={[0.6, 0.005, 0]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color="#2c313b" roughness={0.8} /></mesh>
      {Array.from({ length: 19 }, (_, i) => <mesh key={`t${i}`} position={[-10 + i * 1.2, 0.01, 0]}><boxGeometry args={[0.03, 0.005, 20]} /><meshStandardMaterial color="#151920" /></mesh>)}
      {Array.from({ length: 17 }, (_, i) => <mesh key={`u${i}`} position={[0.6, 0.01, -10 + i * 1.2]}><boxGeometry args={[30, 0.005, 0.03]} /><meshStandardMaterial color="#151920" /></mesh>)}
      {/* the bench and the lamp */}
      <Block size={[9, 0.16, 4.6]} radius={0.03} material={mat("clay", "#5a4330", { roughness: 0.7 })} position={[0.6, TOP - 0.08, 0]} />
      {Array.from({ length: 22 }, (_, i) => <mesh key={`gr${i}`} position={[0.6, TOP + 0.002, -2.2 + i * 0.21]}><boxGeometry args={[9, 0.003, 0.025]} /><meshStandardMaterial color="#3e2d20" /></mesh>)}
      {[[-3.6, -2], [4.8, -2], [-3.6, 2], [4.8, 2]].map(([x, z], i) => <mesh key={i} position={[x!, (TOP - 0.16) / 2, z!]} material={mat("aluminium", "#555b66")}><boxGeometry args={[0.12, TOP - 0.16, 0.12]} /></mesh>)}
      <mesh position={[lamp[0], lamp[1] + 1.5, lamp[2]]} material={mat("aluminium", "#666c78")}><cylinderGeometry args={[0.03, 0.03, 3, 6]} /></mesh>
      <mesh position={lamp} material={mat("glossy", "#20252f")}><cylinderGeometry args={[0.35, 0.8, 0.7, 20, 1, true]} /></mesh>
      <mesh position={[lamp[0], lamp[1] - 0.3, lamp[2]]} material={glow("#ffe3b0", 0.95)}><sphereGeometry args={[0.18, 10, 8]} /></mesh>
      <spotLight position={lamp} angle={0.8} penumbra={0.6} intensity={40} color="#ffe2b8" castShadow />
      <group rotation-x={turn} position={[0, 0, 0]}>
        {/* the back housing and the board */}
        <Block size={[W, 0.12, L]} radius={0.08} preset="blackPlastic" position={[0, TOP + 0.06, 0]} />
        <group position={[0, boardY, 0]} rotation-x={Math.PI * flip}>
          <Block size={[W * 0.96, 0.05, L * 0.96]} radius={0.03} preset="pcbDark" />
          {/* the patches on top */}
          {open && Array.from({ length: NX * NZ }, (_, n) => {
            const i = n % NX, j = Math.floor(n / NX);
            const c = patchAt(i, j);
            const wv = wave >= 0 ? Math.max(0, 1 - Math.abs(j / (NZ - 1) - wave) * 6) : 0;
            const pick = i === PI_ && j === PJ;
            return (
              <mesh key={n} position={[c[0], 0.03, c[2]]} rotation-x={-Math.PI / 2}
                material={pick && patch > 0 ? glow(TECH.amber, q(0.4 + 0.6 * patch)) : wv > 0.1 || grid > 0.05 ? glow(wv > 0.1 ? TECH.white : TECH.cyan, q(0.12 + 0.5 * grid + 0.4 * wv)) : mat("copper")}>
                <planeGeometry args={[W * 0.06, L * 0.042]} />
              </mesh>
            );
          })}
          {/* the board's back: copper traces and vias */}
          {Array.from({ length: 26 }, (_, i) => <mesh key={`bt${i}`} position={[0, -0.028, -L * 0.45 + i * (L * 0.9 / 25)]}><boxGeometry args={[W * 0.9, 0.003, 0.012]} /><meshStandardMaterial color="#b0703c" metalness={0.8} roughness={0.35} /></mesh>)}
          {Array.from({ length: 16 }, (_, i) => <mesh key={`bv${i}`} position={[-W * 0.45 + i * (W * 0.9 / 15), -0.029, 0]}><boxGeometry args={[0.012, 0.003, L * 0.9]} /><meshStandardMaterial color="#8c5a33" metalness={0.8} roughness={0.35} /></mesh>)}
          {/* the chips and traces on the back */}
          {(has("flip") || has("chips")) && [0, 1, 2, 3].map((i) => (
            <group key={i} position={[-0.75 + i * 0.5, -0.06, (i % 2 ? 0.3 : -0.3)]}>
              <Block size={[0.32, 0.05, 0.32]} radius={0.02} preset="ceramic" />
              <mesh position={[0, -0.03, 0]} rotation-x={Math.PI / 2} material={glow(TECH.violet, q(0.2 + 0.8 * k("chips", 12)))}><planeGeometry args={[0.2, 0.2]} /></mesh>
            </group>
          ))}
          {has("traces") && Array.from({ length: 12 }, (_, i) => {
            const c0: V3 = [-0.75 + (i % 4) * 0.5, -0.04, (i % 2 ? 0.3 : -0.3)];
            const c1: V3 = [((i * 7) % 10 - 4.5) * 0.19, -0.04, ((i * 5) % 14 - 6.5) * 0.21];
            const tm = has("timing") && f >= at("timing") ? 0.5 + 0.5 * Math.sin((f - at("timing")) * 0.35 - i * 0.7) : 0.6;
            return <Beam key={i} a={c0} b={c1} r={0.008} o={k("traces", 14) * tm} color={TECH.violet} />;
          })}
        </group>
        {/* the white cover */}
        <group position={[0, coverY, 0]} rotation-z={0.25 * lift}>
          <Block size={[W, 0.08, L]} radius={0.1} material={mat("white", "#aab0bb", { roughness: 0.75, transparent: true, opacity: 1 - 0.7 * (has("face") ? k("face", 10) * (has("open") ? 1 - k("ripple", 20) * 0 : 1) : 0) })} />
        </group>
      </group>
      {/* the stand and the one cable, lying beside it */}
      <group position={[-2.3, TOP + 0.1, -0.6]} rotation-z={Math.PI / 2}>
        <mesh material={has("stand") ? glow(TECH.cyan, q(0.2 + 0.6 * k("stand", 10))) : mat("aluminium", "#d7dbe3")}><cylinderGeometry args={[0.06, 0.08, 1.4, 12]} /></mesh>
      </group>
      <Beam a={[-2.3, TOP + 0.08, -0.6]} b={[-2.6, TOP + 0.05, 1.0]} r={0.025} color={has("cable") ? TECH.cyan : "#2c3039"} o={has("cable") ? 0.3 + 0.7 * k("cable", 12) : 1} />
      <Beam a={[-2.6, TOP + 0.05, 1.0]} b={[-3.4, TOP + 0.05, 2.1]} r={0.025} color={has("cable") ? TECH.cyan : "#2c3039"} o={has("cable") ? 0.3 + 0.7 * k("cable", 12) : 1} />
      {/* one patch, lifted, and its ripples */}
      {pUp > 0 && (
        <group position={patchPos}>
          <mesh rotation-x={-Math.PI / 2} material={glow(TECH.amber, 0.9)}><planeGeometry args={[W * 0.06, L * 0.042]} /></mesh>
        </group>
      )}
      {has("ripple") && <Ripples f={f} start={at("ripple")} position={has("open") && !has("patchUp") ? [0, coverY + 0.2, 0] : patchPos} n={3} reach={has("spread") && f > at("spread") ? 3.5 : 1.4} period={26} upright o={has("spread") ? 1 - 0.7 * k("spread", 30) : 1} color={TECH.cyan} />}
      {has("ripIn") && f >= at("ripIn") && (() => {
        const u = Math.min(1, (f - at("ripIn")) / 20);
        const c: V3 = has("open") && !has("patchUp") ? [0, coverY + 0.2, 0] : patchPos;
        return u < 1 ? <mesh position={c} material={glow(TECH.lime, q(0.9 * u))}><torusGeometry args={[0.05 + 1.4 * (1 - u), 0.012, 6, 40]} /></mesh> : null;
      })()}
      {has("cross") && k("cross") > 0 && (
        <group position={[patchPos[0] + 0.9, patchPos[1] + 0.5, patchPos[2]]}>
          <Beam a={[-0.15, -0.15, 0]} b={[0.15, 0.15, 0]} r={0.02} color={TECH.pink} o={k("cross", 8)} />
          <Beam a={[-0.15, 0.15, 0]} b={[0.15, -0.15, 0]} r={0.02} color={TECH.pink} o={k("cross", 8)} />
        </group>
      )}
      {/* the strong beam off the whole grid */}
      {beamUp > 0 && <Cone a={[0, boardY + 0.1, 0]} b={[Math.sin(lean) * 5, boardY + 5 * Math.cos(lean), 0]} r={1.2} o={0.3 * beamUp} />}
      {beamUp > 0 && <Beam a={[0, boardY + 0.1, 0]} b={[Math.sin(lean) * 6, boardY + 6 * Math.cos(lean), 0]} r={0.05} o={0.8 * beamUp} />}
      {/* the curved TV dish for comparison */}
      {ghostO > 0 && <OldDish position={GHOST} yaw={-0.35} pitch={0.15} o={0.55 * ghostO} />}
      {has("ghostRay") && ghostO > 0 && [-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
        <group key={i}>
          <Beam a={[GHOST[0] + x - 1.4, GHOST[1] + 0.85 + x * 0.3, GHOST[2] + 3]} b={[GHOST[0] + x * 0.9, GHOST[1] + 0.85 + x * 0.3, GHOST[2] + 0.1]} r={0.012} o={k("ghostRay", 14) * ghostO} color={TECH.amber} />
          <Beam a={[GHOST[0] + x * 0.9, GHOST[1] + 0.85 + x * 0.3, GHOST[2] + 0.1]} b={[GHOST[0] - 0.25, GHOST[1] + 0.9, GHOST[2] + 0.75]} r={0.012} o={k("ghostRay", 14) * ghostO} color={TECH.amber} />
        </group>
      ))}
      {has("ghostOut") && k("ghostOut") > 0 && (
        <group position={[GHOST[0], GHOST[1] + 1, GHOST[2] + 0.8]}>
          <Beam a={[-0.7, -0.7, 0]} b={[0.7, 0.7, 0]} r={0.05} color={TECH.pink} o={k("ghostOut", 10)} />
          <Beam a={[-0.7, 0.7, 0]} b={[0.7, -0.7, 0]} r={0.05} color={TECH.pink} o={k("ghostOut", 10)} />
        </group>
      )}
      {/* weather on the cover */}
      {has("rain") && f >= at("rain") && Array.from({ length: 40 }, (_, i) => {
        const u = ((f - at("rain")) / 16 + rnd("rain", i)) % 1;
        return <mesh key={i} position={[(rnd("rx", i) - 0.5) * W, coverY + 2.5 - 2.4 * u, (rnd("rz", i) - 0.5) * L]} material={glow("#9fc8ff", 0.6)}><boxGeometry args={[0.015, 0.16, 0.015]} /></mesh>;
      })}
      {has("snow") && f >= at("snow") && Array.from({ length: 24 }, (_, i) => {
        const u = ((f - at("snow")) / 40 + rnd("snow", i)) % 1;
        const onTop = u < 0.6;
        return <mesh key={i} position={[W / 2 * (onTop ? -1 + 2 * (u / 0.6) * rnd("sx", i) + rnd("sx", i) : 1.05), onTop ? coverY + 0.06 + 0.3 * rnd("sy", i) * (1 - u) : coverY - (u - 0.6) * 3, (rnd("sz", i) - 0.5) * L]} material={glow("#ffffff", 0.8)}><sphereGeometry args={[0.03, 6, 4]} /></mesh>;
      })}
      <Words b={b} pos={pos} signAt={() => [lamp[0], lamp[1] - 0.05, lamp[2] + 0.82]} signH={0.3} />
    </Shot>
  );
};
export default Bench;
