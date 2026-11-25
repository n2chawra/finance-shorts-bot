// Fab: a chip factory bay under yellow light. The EUV machine is a long white enclosure with panels,
// status lights, a screen and a loading port; a city bus draws itself beside it for size; wafer pods run
// on an overhead rail; more machines down the hall, the devices their chips go into. Actions
// (params.moments[].do): machine, bus, counter, flash, question, open, wafer, row, phones, laptops, racks.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, EUV, FAB, Lines, q, Screen, Shot, useBeat, Words, type Anchor } from "./kit";

const L = 10.5, H = 3.2, D = 3.4;
const BUS_Z = 5.2;
const SCREEN: V3 = [-2.2, 2.0, D / 2 + 0.02];
const DOOR: V3 = [1.6, 1.6, D / 2 + 0.02];

/** the outline of a city bus, its edges drawing on with k */
const BusOutline: React.FC<{ k: number }> = ({ k }) => {
  const x0 = -L / 2 - 0.4, x1 = x0 + 11.4, y0 = 0.3, y1 = 3.1, z0 = BUS_Z - 1.25, z1 = BUS_Z + 1.25;
  const edges: [V3, V3][] = [
    [[x0, y0, z1], [x1, y0, z1]], [[x0, y1, z1], [x1, y1, z1]], [[x0, y0, z1], [x0, y1, z1]], [[x1, y0, z1], [x1, y1, z1]],
    [[x0, y0, z0], [x1, y0, z0]], [[x0, y1, z0], [x1, y1, z0]], [[x0, y1, z0], [x0, y1, z1]], [[x1, y1, z0], [x1, y1, z1]],
    [[x0, y0, z0], [x0, y0, z1]], [[x1, y0, z0], [x1, y0, z1]], [[x0, y0, z0], [x0, y1, z0]], [[x1, y0, z0], [x1, y1, z0]],
  ];
  const n = edges.length;
  return (
    <group>
      {edges.map(([a, b], i) => {
        const t = Math.max(0, Math.min(1, k * n - i * 0.6));
        return t > 0 ? <Beam key={i} a={a} b={[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]} r={0.035} color={TECH.cyan} o={0.9} /> : null;
      })}
      {k > 0.6 && Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[x0 + 1.2 + i * 1.3, 2.1, z1 + 0.01]} material={glow(TECH.cyan, q(0.35 * (k - 0.6) / 0.4))}><planeGeometry args={[1.0, 0.9]} /></mesh>
      ))}
      {k > 0.8 && [x0 + 2, x1 - 2.2].map((x, i) => (
        <mesh key={i} position={[x, y0, z1 + 0.02]} material={glow(TECH.cyan, 0.8)}><torusGeometry args={[0.5, 0.03, 6, 28]} /></mesh>
      ))}
    </group>
  );
};

const Fab: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const hum = 0.5 + 0.5 * Math.sin(f * 0.15);
  const open = k("open", 18);
  const flash = has("flash") && f >= at("flash") ? Math.max(0, 1 - (((f - at("flash")) % 10) / 10) * 2) : 0;
  const violet = Math.max(flash, open * (0.6 + 0.4 * Math.abs(Math.sin(f * 0.6))));
  const wafer = k("wafer", 20);
  const anchors: Record<string, Anchor> = {
    all: { look: [0, 1.8, 2], dir: [0.55, 0.38, 1], d: 10 },
    machine: { look: [0, 1.7, 0], dir: [0.35, 0.25, 1], d: 10.5 },
    bus: { look: [0.3, 1.7, 2.6], dir: [0.5, 0.45, 1], d: 10 },
    screen: { look: SCREEN, dir: [0.1, 0.08, 1], d: 3.6 },
    door: { look: [DOOR[0] + 1, DOOR[1], DOOR[2]], dir: [0.4, 0.15, 1], d: 4.4 },
  };
  const pos = (on: string): V3 => on === "bus" ? [3.5, 3.4, BUS_Z + 1.2] : on === "screen" ? [SCREEN[0], SCREEN[1] + 0.9, SCREEN[2]] : on === "door" ? [DOOR[0], DOOR[1] + 1.2, DOOR[2]] : [0, H + 0.4, D / 2];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="fab" backdrop={FAB} floor="reflect" bloom={1.1} light={1.2} dust={{ c: [0, 3, 0], r0: 8, r1: 22, size: 0.5, color: "#ffe2a0" }} fog={{ color: "#1a1608", near: 18, far: 50 }}>
      {/* the bay: yellow ceiling lights, a back wall of panels, a perforated floor */}
      <mesh position={[0, 4, -5]} material={mat("clay", "#5a5236", { roughness: 0.9 })}><planeGeometry args={[60, 12]} /></mesh>
      <Lines from={-28} to={28} step={2.4} along="x" span={[-2, 10]} z={-4.95} color="#3e3824" r={0.03} />
      <DotGrid x0={-28} x1={28} y0={0.2} y1={0.21} z={8} gap={0.35} size={0.05} color="#201c10" />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-16 + i * 4, 7.2, 1]} material={glow("#ffd65a", 0.85)}><boxGeometry args={[2.6, 0.08, 0.5]} /></mesh>
      ))}
      <pointLight position={[0, 6.5, 3]} intensity={30} distance={30} color="#ffd36a" />
      {/* the overhead rail and wafer pods */}
      <mesh position={[0, 6.3, 0.4]} rotation-z={Math.PI / 2} material={mat("brushed", "#8d8f94")}><cylinderGeometry args={[0.07, 0.07, 40, 8]} /></mesh>
      {[0, 1, 2].map((i) => (
        <Block key={i} size={[0.6, 0.5, 0.6]} radius={0.08} preset="white" position={[-12 + ((f * 0.05 + i * 9) % 26), 5.9, 0.4]} />
      ))}
      {/* the machine */}
      <group>
        <Block size={[L, H, D]} radius={0.12} material={mat("white", "#eef0f4", { roughness: 0.35 })} position={[0, H / 2, 0]} />
        <Block size={[L * 0.35, 1.0, D * 0.8]} radius={0.1} material={mat("white", "#e2e5ec")} position={[-L * 0.28, H + 0.5, 0]} />
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[-L / 2 + 0.75 + i * 1.5, H / 2, D / 2 + 0.005]} material={mat("clay", "#c9cdd6")}><boxGeometry args={[0.03, H * 0.9, 0.01]} /></mesh>
        ))}
        {Array.from({ length: 4 }, (_, g) => Array.from({ length: 9 }, (_, i) => (
          <mesh key={`v${g}-${i}`} position={[-4.6 + g * 2.6 + (g > 1 ? 1.2 : 0), 0.7 + i * 0.09, D / 2 + 0.01]} material={mat("clay", "#9aa0ad")}><boxGeometry args={[1.1, 0.025, 0.01]} /></mesh>
        )))}
        {Array.from({ length: 14 }, (_, i) => <mesh key={`h${i}`} position={[-L / 2 + 0.4 + i * 0.75, H - 0.7, D / 2 + 0.01]} material={mat("clay", "#b9bec9")}><boxGeometry args={[0.5, 0.18, 0.01]} /></mesh>)}
        <mesh position={[0, 0.25, D / 2 + 0.01]} material={mat("clay", "#2b4a8c")}><boxGeometry args={[L * 0.98, 0.16, 0.01]} /></mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-L / 2 + 0.5 + i * 0.25, H - 0.35, D / 2 + 0.02]} material={glow(i % 3 ? TECH.lime : TECH.amber, q(0.3 + 0.7 * ((i * 7 + Math.floor(f / 6)) % 5 === 0 ? 1 : 0.4) * Math.max(0.4, k("machine", 10))))}><sphereGeometry args={[0.05, 6, 4]} /></mesh>
        ))}
        {/* the window with violet light, the side panel that slides open */}
        <mesh position={[-3.9, 1.6, D / 2 + 0.02]} material={glow(EUV, q(0.15 + 0.6 * violet + 0.1 * hum))}><planeGeometry args={[1.0, 0.6]} /></mesh>
        <Block size={[2.2, 2.2, 0.08]} radius={0.04} material={mat("white", "#dde0e8")} position={[DOOR[0] + 2.3 * open, DOOR[1], DOOR[2] + 0.06 + 0.2 * open]} />
        {open > 0.02 && <mesh position={[DOOR[0], DOOR[1], DOOR[2] + 0.01]} material={glow(EUV, q(0.3 + 0.6 * violet))}><planeGeometry args={[2.1, 2.1]} /></mesh>}
        {open > 0.02 && <pointLight position={[DOOR[0], DOOR[1], DOOR[2] + 1]} intensity={10 * open} distance={8} color={EUV} />}
        {/* the loading port and the wafer gliding out */}
        <Block size={[1.4, 1.2, 1.6]} radius={0.08} preset="aluminium" position={[L / 2 + 0.7, 1.2, 0.6]} />
        {has("wafer") && <mesh position={[L / 2 + 0.7 + 1.4 * wafer, 1.86, 0.6]} material={mat("silicon", "#3a3f7a", { iridescence: 1 })}><cylinderGeometry args={[0.6, 0.6, 0.03, 40]} /></mesh>}
        <group position={SCREEN}>
          <Screen b={b} fig={b.fig.rate} start={at("counter")} again={0} w={2.4} h={1.0} on={has("counter")} />
        </group>
      </group>
      {has("bus") && <BusOutline k={k("bus", 40)} />}
      {/* more machines down the hall */}
      {has("row") && [1, 2, 3].map((i) => (
        <group key={i} position={[-(L + 2.5) * i * 0.0 - 2 * i, 0, -6.5 * i]} scale={q(Math.min(1, k("row", 30) * 3 - (i - 1)))}>
          <Block size={[L, H, D]} radius={0.12} material={mat("white", "#e6e8ee", { roughness: 0.4 })} position={[0, H / 2, 0]} />
          <mesh position={[-3.9, 1.6, D / 2 + 0.02]} material={glow(EUV, q(0.3 + 0.6 * flash))}><planeGeometry args={[1.0, 0.6]} /></mesh>
        </group>
      ))}
      {/* what their chips go into */}
      {has("phones") && <group position={[L / 2 + 0.7, 2.0, 1.2]} scale={q(k("phones", 12))}>
        <Block size={[0.7, 1.4, 0.08]} radius={0.08} preset="glossy" />
        <mesh position={[0, 0, 0.045]} material={glow("#3a7bff", 0.75)}><planeGeometry args={[0.6, 1.25]} /></mesh>
      </group>}
      {has("laptops") && <group position={[L / 2 + 2.6, 0.9, 1.6]} scale={q(k("laptops", 12))}>
        <Block size={[1.8, 0.08, 1.2]} radius={0.04} preset="aluminium" />
        <group position={[0, 0.6, -0.6]} rotation-x={-0.2}>
          <Block size={[1.8, 1.15, 0.05]} radius={0.04} preset="aluminium" />
          <mesh position={[0, 0, 0.03]} material={glow("#3a7bff", 0.7)}><planeGeometry args={[1.6, 0.95]} /></mesh>
        </group>
      </group>}
      {has("racks") && [0, 1, 2, 3].map((i) => (
        <group key={i} position={[L / 2 + 4.6 + i * 1.1, 0, -2.2]} scale={q(Math.min(1, k("racks", 20) * 2 - i * 0.3))}>
          <Block size={[0.9, 3.4, 1.4]} radius={0.04} preset="blackPlastic" position={[0, 1.7, 0]} />
          {Array.from({ length: 8 }, (_, j) => <mesh key={j} position={[0, 0.4 + j * 0.38, 0.71]} material={glow(j % 3 ? TECH.cyan : TECH.lime, q(0.4 + 0.5 * Math.abs(Math.sin(f * 0.2 + i + j))))}><boxGeometry args={[0.7, 0.05, 0.01]} /></mesh>)}
        </group>
      ))}
      <Ask b={b} at={[0, H + 1.6, 1]} px={160} />
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Fab;
