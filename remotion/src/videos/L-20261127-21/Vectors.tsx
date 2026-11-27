// Vectors: a vast archive table of glowing rows stretching into the dark (the model's lookup table). A tag
// arrives, one row slides out and stands up as a column of bars (the token's list of numbers); pages of
// training text stream past and nudge the bars; the column shrinks into a point among thousands in a space
// with many directions; labelled pairs sit close; a row of columns gets a position strip; the row lifts toward
// a dark tower. Actions: table, tag, rows, pull, column, settle, still, pages, nudge, fine, flood, shrink, point,
// cloud, axes, drift, clump, cat, dog, paris, london, pulse, row, strip, merge, slots, swap, shift, words, lift, tower, glow.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, glowTexture, mat, rnd, TECH, type V3 } from "../../three/index";
import { Beam, Column, FloorGrid, q, Shot, Tile, TOK, Q_TOKENS, useBeat, VIOLET, Words, type Anchor } from "./kit";

const CLOUD_N = 2400;
const PAIRS: Record<string, V3> = { cat: [-1.4, 2.4, 1], dog: [-0.9, 2.1, 1.2], paris: [1.4, 3.1, 0.4], london: [1.9, 2.8, 0.6] };

const Cloud: React.FC<{ k: number; clump: number; f: number }> = ({ k, clump, f }) => {
  const arr = React.useMemo(() => {
    const a = new Float32Array(CLOUD_N * 3);
    for (let i = 0; i < CLOUD_N; i++) {
      const c = i % 7;
      const cx = (rnd("cc", c) - 0.5) * 8, cy = 2.5 + (rnd("cc", c + 9) - 0.5) * 4, cz = (rnd("cc", c + 19) - 0.5) * 6;
      a[i * 3] = (rnd("cl", i * 3) - 0.5) * 12; a[i * 3 + 1] = 2.5 + (rnd("cl", i * 3 + 1) - 0.5) * 6; a[i * 3 + 2] = (rnd("cl", i * 3 + 2) - 0.5) * 9;
      a[i * 3] = a[i * 3]! + (cx - a[i * 3]!) * 0.55; a[i * 3 + 1] = a[i * 3 + 1]! + (cy - a[i * 3 + 1]!) * 0.55; a[i * 3 + 2] = a[i * 3 + 2]! + (cz - a[i * 3 + 2]!) * 0.55;
    }
    return a;
  }, []);
  if (k <= 0.02) return null;
  return (
    <group rotation-y={f * 0.002} scale={q(0.4 + 0.6 * k) * (1 - 0.12 * clump)}>
      <points userData={{ noClip: true, noFade: true }}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[arr, 3]} /></bufferGeometry>
        <pointsMaterial map={glowTexture()} size={0.16} sizeAttenuation transparent opacity={q(k) * 0.9} depthWrite={false} blending={2} color="#b9a4ff" toneMapped={false} />
      </points>
    </group>
  );
};

const Vectors: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const rows = Math.max(k("rows", 40), has("table") ? 0.25 : 0);
  const pull = k("pull", 16);
  const colK = Math.max(k("column", 14), has("column") && !has("pull") ? 1 : 0);
  const shrink = k("shrink", 18);
  const cloud = Math.max(k("cloud", 30), has("cloud") && !has("shrink") ? 1 : 0, has("pulse") || has("cat") ? 1 : 0);
  const nudge = has("nudge") && f >= at("nudge") ? 0.5 + 0.5 * Math.sin((f - at("nudge")) * 0.4) : 0;
  const isRow = has("row") || has("lift");
  const lift = k("lift", 30);
  const anchors: Record<string, Anchor> = {
    table: { look: [0, 1, -4], dir: [0.3, 0.6, 1], d: 12 },
    column: { look: [0, 2, 1.5], dir: [0.3, 0.25, 1], d: 6 },
    space: { look: [0, 2.6, 0], dir: [0.3, 0.3, 1], d: 12 },
    pair: { look: [-1.0, 2.6, 1.1], dir: [0.1, 0.15, 1], d: 6 },
    pair2: { look: [1.8, 3.3, 0.5], dir: [0.1, 0.15, 1], d: 6 },
    row: { look: [0, 1.8 + 2 * lift, 1.5], dir: [0.2, 0.3, 1], d: 9 },
  };
  const pos = (on: string): V3 => PAIRS[on] ?? (on === "column" ? [0.6, 3.5, 1.5] : on === "row" ? [-3, 3.2, 1.5] : [0, 3, -2]);
  return (
    <Shot p={p} b={b} anchors={anchors} seed="vectors" backdrop={VIOLET} floor="reflect" bloom={1.2} light={0.8} dust={{ c: [0, 2, 0], r0: 8, r1: 20, size: 0.3, color: "#c4b4ff" }}>
      <FloorGrid x0={-12} x1={12} z0={-18} z1={8} step={0.8} color="#3a2a70" />
      {/* the archive table: long rows of dim bars stretching into the dark */}
      {!isRow && Array.from({ length: 18 }, (_, r) => (
        <group key={r} position={[0, 0.5, -1.2 - r * 0.9]}>
          <Block size={[12, 0.08, 0.7]} radius={0.02} material={mat("clay", "#1a1530")} />
          {Array.from({ length: 16 }, (_, c) => (
            <mesh key={c} position={[-5.6 + c * 0.75, 0.12, 0]} material={glow(TOK[(r + c) % 6]!, q((rows * 18 > r ? 0.25 : 0.05) + 0.25 * rnd("tb", r * 16 + c)))}><boxGeometry args={[0.5, 0.06 + 0.12 * rnd("tbh", r * 16 + c), 0.4]} /></mesh>
          ))}
        </group>
      ))}
      {/* the tag that asks, and the row it pulls */}
      {has("tag") && <Block size={[0.9, 0.42, 0.06]} radius={0.04} preset="white" position={[-3 + 3 * k("tag", 16), 1.3, 1.2]} />}
      {has("pull") && <mesh position={[0, 0.6 + 0.2 * pull, -1.2 + 2.7 * pull]} material={glow(TECH.cyan, q(0.6 * (1 - colK)))}><boxGeometry args={[6, 0.1, 0.5]} /></mesh>}
      {(colK > 0.02 && shrink < 0.98) && <group position={[0, 1 + 1.2 * shrink, 1.5]} scale={q(1 - shrink)}>
        <Column seed="v-tok" n={12} color={TECH.cyan} k={colK} shift={nudge * 0.4 + 0.3 * k("fine", 10)} />
      </group>}
      {/* training text streaming past */}
      {has("pages") && Array.from({ length: 10 }, (_, i) => {
        const u = (((f - at("pages")) * (has("flood") && f >= at("flood") ? 0.09 : 0.03) + i / 10) % 1);
        return (
          <group key={i} position={[-7 + 14 * u, 2 + Math.sin(i * 2.1) * 1.4, -0.8 + (i % 3) * 0.6]} rotation-y={0.3}>
            <mesh material={mat("clay", "#efe9dc", { emissive: "#fff2d0", emissiveIntensity: 0.25 })}><planeGeometry args={[0.8, 1.1]} /></mesh>
            {[0, 1, 2, 3, 4].map((j) => <mesh key={j} position={[0, 0.35 - j * 0.16, 0.01]} material={mat("clay", "#8a8478")}><planeGeometry args={[0.6, 0.04]} /></mesh>)}
          </group>
        );
      })}
      {/* the space of meanings */}
      <Cloud k={cloud} clump={k("clump", 30)} f={f} />
      {has("point") && shrink > 0.9 && <mesh position={[0, 2.2, 1.5]} material={glow(TECH.white, 1)}><sphereGeometry args={[0.12, 12, 8]} /></mesh>}
      {has("axes") && [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.7, 0.7, 0], [-0.7, 0.3, 0.6]].map((d, i) => <Beam key={i} a={[0, 2.5, 0]} b={[d[0]! * 6 * k("axes", 20), 2.5 + d[1]! * 6 * k("axes", 20), d[2]! * 6 * k("axes", 20)]} r={0.015} color="#8f7aff" o={0.6} />)}
      {Object.entries(PAIRS).map(([name, v]) => has(name) ? (
        <mesh key={name} position={v} material={glow(name === "cat" || name === "dog" ? TECH.amber : TECH.cyan, q(0.5 + 0.5 * k(name, 10)))}><sphereGeometry args={[0.13 * (0.3 + 0.7 * k(name, 10)), 14, 10]} /></mesh>
      ) : null)}
      {has("pulse") && f >= at("pulse") && <><Beam a={PAIRS.cat!} b={PAIRS.dog!} r={0.02} color={TECH.amber} o={q(k("pulse", 10))} /><Beam a={PAIRS.paris!} b={PAIRS.london!} r={0.02} color={TECH.cyan} o={q(k("pulse", 10))} /></>}
      {/* the row of token columns, the position strip, the lift toward the tower */}
      {isRow && Q_TOKENS.map((t, i) => {
        const swap = k("swap", 18);
        const ix = has("swap") && (i === 3 || i === 4) ? (i === 3 ? 3 + swap : 4 - swap) : i;
        return (
          <group key={i} position={[-3.75 + ix * 1.5, 0.4 + 2 * lift, 1.5 + (has("swap") && (i === 3 || i === 4) ? Math.sin(swap * Math.PI) * (i === 3 ? 0.8 : -0.8) : 0)]}>
            <Tile text={t} color={TOK[i]!} w={1.2} position={[0, 0, 0.4]} scale={0.8} lit={0.6} />
            <Column seed={`row-${i}`} n={9} color={TOK[i]!} position={[0.2, 0.6, 0]} shift={0.6 * k("merge", 16) + (has("swap") && (i === 3 || i === 4) ? 0.4 * k("shift", 12) : 0)} />
            {has("strip") && <Column seed={`pos-${i}`} n={3} color={TECH.white} position={[0.2, -0.55, 0.2]} k={k("strip", 14) * (1 - 0.7 * k("merge", 16))} />}
            {has("slots") && <mesh position={[0, -0.35, 0.8]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(0.6 * k("slots", 12)))}><ringGeometry args={[0.3, 0.38, 24]} /></mesh>}
          </group>
        );
      })}
      {has("tower") && <group position={[0, 0, -9]} scale={q(k("tower", 20))}>
        {Array.from({ length: 20 }, (_, i) => <mesh key={i} position={[0, 0.5 + i * 0.5, 0]} material={mat("glass", "#86a8ff", { transparent: true, opacity: 0.3, emissive: TECH.cyan, emissiveIntensity: i === 0 ? q(0.2 + 0.8 * k("glow", 14)) : 0.05 })}><boxGeometry args={[7, 0.06, 4]} /></mesh>)}
      </group>}
      <Words b={b} pos={pos} signAt={() => [-4, 2.6, -0.6]} signH={0.6} />
    </Shot>
  );
};
export default Vectors;
