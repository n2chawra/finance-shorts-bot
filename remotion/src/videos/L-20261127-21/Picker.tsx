// Picker: a dark stage holding a field of token tiles on glowing stalks: each stalk rises to its token's score.
// A few tower over the rest (Sunlight, Because), banana sits low in the dark; a pointer spins and lands on one;
// the picked tile flies to the end of the sentence strip in front, which grows tile by tile inside a phone frame.
// Also: the special stop tile, an empty bookshelf and a search magnifier at the edge, a likely tile turning red.
// Actions: field, light, question, bars, rise, spread, tall, glow, sun, because, banana, dim, spin, slow, jitter,
// land, again, winner, fly, click, words, new, back, pulse, grid, flyb, flyc, strip, frame, grow, cursor, pop,
// popb, stop, flash, close, shelf, dark, tool, red, same, tick.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { A_TOKENS, Ask, Beam, DotGrid, FloorGrid, NIGHT, q, Q_TOKENS, Shot, Tile, TOK, useBeat, Words, type Anchor } from "./kit";

const COLS = 13, ROWS = 6;
const WIN: V3 = [0, 0, 0];   // the winning stalk's foot (centre front)
const STRIP_Y = 0.5, STRIP_Z = 4.2;
const SX = (i: number) => -6.6 + i * 1.2;

const Picker: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const rise = Math.max(k("rise", 26), k("bars", 26), has("tall") || has("sun") || has("winner") || has("same") || has("stop") ? 1 : 0);
  const lightF = Math.max(k("light", 30), has("field") ? 0.5 : 0, rise > 0 ? 1 : 0);
  const spread = k("spread", 30);
  // the pointer: spins from "spin", slows, lands on "land"
  const spinning = has("spin") && f >= at("spin");
  const landed = has("land") && f >= at("land");
  const ang = spinning ? (landed ? 0 : ((f - at("spin")) * (has("slow") && f >= at("slow") ? 0.08 : 0.3)) % (Math.PI * 2)) : 0;
  const pointer = spinning || landed || has("tick");
  // the sentence strip in front, the picked tile flying into it
  const strip = has("fly") || has("click") || has("strip") || has("grow") || has("close") || has("back");
  const fly = k("fly", 18);
  const extra = (has("flyb") ? k("flyb", 12) : 0) + (has("flyc") ? k("flyc", 10) : 0) + (has("pop") ? k("pop", 8) : 0) + (has("popb") ? k("popb", 8) : 0) + (has("grow") ? Math.floor(k("grow", 30) * 2) : 0);
  const nAns = Math.min(A_TOKENS.length, (has("grow") || has("strip") ? 2 : 0) + Math.round(extra));
  const back = k("back", 30);
  const anchors: Record<string, Anchor> = {
    field: { look: [0, 1.2, -3], dir: [0.2, 0.55, 1], d: 14 },
    bars: { look: [0, 2, -0.5], dir: [0.15, 0.3, 1], d: 8 },
    winner: { look: [0, 2.6, 0], dir: [0.1, 0.2, 1], d: 4.6 },
    banana: { look: [3.6, 0.6, -1.2], dir: [0.2, 0.3, 1], d: 4.4 },
    text: { look: [-1.2, STRIP_Y + 0.4, STRIP_Z], dir: [0, 0.35, 1], d: 7.5 },
  };
  const H: Record<string, number> = { the: 3.4, sun: 3.9, because: 3.2 };
  const pos = (on: string): V3 => on === "sun" ? [0, 4.6, 0] : on === "because" ? [-1.4, 4.0, 0] : on === "banana" ? [3.6, 1.6, -1.2] : on === "winner" ? [0.9, 4.4, 0] : on === "text" ? [-4, STRIP_Y + 1.4, STRIP_Z] : [-4.5, 3.4, -1];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="picker" backdrop={NIGHT} floor="reflect" bloom={1.2} light={0.85} dust={{ c: [0, 2, 0], r0: 8, r1: 20, size: 0.35, color: "#b0c8ff" }}>
      <DotGrid x0={-14} x1={14} y0={0.01} y1={0.02} z={-8} gap={0.6} size={0.05} color="#1a2550" glowing />
      <FloorGrid x0={-14} x1={14} z0={-12} z1={8} step={0.7} color="#22356a" />
      <DotGrid x0={-20} x1={20} y0={-1} y1={10} z={-13} gap={0.6} size={0.08} color="#3a5aa0" glowing />
      {/* the field of stalks */}
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const x = (c - (COLS - 1) / 2) * 1.0 * (1 + 0.4 * spread), z = -1.2 - r * 1.3 * (1 + 0.6 * spread);
        const isWin = c === 6 && r === 0, isB = c === 5 && r === 0, isBan = c === 10 && r === 0;
        if (isWin || isB || isBan) return null;
        const h0 = 0.2 + 1.2 * Math.pow(rnd("st", i), 3);
        const h = 0.15 + h0 * rise;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} material={glow(TECH.cyan, q(0.12 + 0.3 * lightF * (h0 > 0.9 ? 1 : 0.5)))}><boxGeometry args={[0.08, h, 0.08]} /></mesh>
            <Tile text="" color={TOK[i % 6]!} w={0.55} position={[0, h + 0.2, 0]} scale={0.55} lit={0.2 + 0.4 * lightF} />
          </group>
        );
      })}
      {/* the tall ones and banana */}
      {[["sun", 0, "Sunlight", TECH.amber], ["because", -1.0 * (1 + 0.4 * spread), "Because", TECH.cyan]].map(([name, x, t, c]) => {
        const hh = (H[name as string] ?? 3) * rise * (has("sun") ? (name === "sun" ? k("sun", 16) : k("because", 16)) || 0.05 : 1);
        const red = name === "because" && has("red") ? k("red", 12) : 0;
        return (
          <group key={name as string} position={[x as number, 0, 0]}>
            <mesh position={[0, hh / 2, 0]} material={glow(red > 0.5 ? "#ff4d4d" : (c as string), q(0.5 + 0.3 * k("glow", 12)))}><boxGeometry args={[0.14, Math.max(0.05, hh), 0.14]} /></mesh>
            <Tile text={has("stop") && name === "sun" ? "" : (t as string)} color={red > 0.5 ? "#ff4d4d" : (c as string)} w={1.6} position={[0, Math.max(0.05, hh) + 0.4, 0]} scale={0.75} lit={0.7} />
          </group>
        );
      })}
      <group position={[3.6, 0, -1.2]}>
        <mesh position={[0, 0.15, 0]} material={glow(TECH.cyan, q(0.3 * (1 - k("dim", 14))))}><boxGeometry args={[0.08, 0.3, 0.08]} /></mesh>
        <Tile text="banana" color="#ffe066" w={1.4} position={[0, 0.6, 0]} scale={0.6} lit={0.4 * (1 - 0.8 * k("dim", 14))} />
      </group>
      {/* the stop tile */}
      {has("stop") && <group position={[1.2, 0, 0]}>
        <mesh position={[0, 2.2 * k("stop", 20), 0]} material={glow("#ff5a5a", q(0.5 + 0.5 * k("flash", 8)))}><boxGeometry args={[0.14, 4.4 * k("stop", 20) + 0.01, 0.14]} /></mesh>
        <Block size={[1.3, 0.6, 0.14]} radius={0.06} material={mat("glossy", "#300", { emissive: "#ff3030", emissiveIntensity: q(0.4 + 0.6 * k("flash", 8)) })} position={[0, 4.4 * k("stop", 20) + 0.45, 0]} />
      </group>}
      {/* the pointer */}
      {pointer && <group position={[has("stop") ? 1.2 : 0, 5.6, 0.2]} rotation-z={ang + (has("jitter") && !landed ? 0.4 * Math.sin(f * 0.5) : 0)}>
        <mesh position={[0, -0.4, 0]} rotation-z={Math.PI} material={glow(TECH.white, 0.95)}><coneGeometry args={[0.18, 0.6, 4]} /></mesh>
        <mesh material={glow(TECH.amber, 0.9)}><torusGeometry args={[0.3, 0.04, 6, 24]} /></mesh>
      </group>}
      {has("again") && <mesh position={[-1.0, 5.2, 0.2]} rotation-z={Math.PI} material={glow(TECH.cyan, q(0.4 * k("again", 12)))}><coneGeometry args={[0.18, 0.6, 4]} /></mesh>}
      {has("tick") && <mesh position={[0.9, 4.9, 0.2]} material={glow(TECH.lime, q(k("tick", 10)))}><torusGeometry args={[0.32, 0.06, 6, 24]} /></mesh>}
      {/* the sentence strip: the question, then the answer so far */}
      {strip && <group position={[0, 0, STRIP_Z + 2 * back]}>
        {[...Q_TOKENS.slice(0, 4), ...A_TOKENS.slice(0, Math.max(nAns, fly > 0.95 ? 1 : 0))].map((t, i) => (
          <Tile key={i} text={t} color={i < 4 ? TECH.cyan : TECH.amber} w={1.1} position={[SX(i), STRIP_Y, 0]} scale={0.85} lit={i < 4 ? 0.35 + 0.4 * k("words", 12) : 0.7} />
        ))}
        {has("frame") && <mesh position={[0, STRIP_Y, -0.1]} material={glow("#2e4f8a", q(0.35 * k("frame", 14)))}><planeGeometry args={[16, 2]} /></mesh>}
        {has("cursor") && Math.floor(f / 10) % 2 === 0 && <mesh position={[SX(4 + nAns) - 0.4, STRIP_Y, 0.1]} material={glow(TECH.white, 0.9)}><boxGeometry args={[0.06, 0.5, 0.02]} /></mesh>}
        {has("close") && <mesh position={[SX(4 + nAns) - 0.3, STRIP_Y, 0.1]} material={glow("#ff5a5a", q(k("close", 8)))}><boxGeometry args={[0.12, 0.7, 0.05]} /></mesh>}
      </group>}
      {has("fly") && fly < 0.98 && f >= at("fly") && <Tile text={A_TOKENS[0]!} color={TECH.amber} w={1.4} position={[WIN[0] + (SX(4) - WIN[0]) * fly, 4.3 + (STRIP_Y - 4.3) * fly, STRIP_Z * fly]} lit={1} />}
      {(has("flyb") || has("flyc")) && [at("fly"), at("flyb"), at("flyc")].map((s, i) => {
        const u = Math.max(0, Math.min(1, (f - s) / 14));
        return u > 0 && u < 1 ? <Tile key={i} text="" color={TECH.amber} w={1} position={[SX(5 + i) * u, 4 - 3.5 * u, STRIP_Z * u]} lit={1} /> : null;
      })}
      {has("pulse") && f >= at("pulse") && <Beam a={[0, 0.1, -12]} b={[0, 0.1 + 4 * k("pulse", 14), -12]} r={0.06} color={TECH.cyan} o={0.8} />}
      {/* the turn: an empty bookshelf, a search tool that slides in and out */}
      {has("shelf") && <group position={[-7.5, 0, -1]} scale={q(k("shelf", 14))}>
        <Block size={[2, 3.6, 0.6]} radius={0.04} material={mat("clay", "#2a2018")} position={[0, 1.8, 0]} />
        {[0.6, 1.5, 2.4, 3.2].map((y, i) => <mesh key={i} position={[0, y, 0.32]} material={mat("clay", "#3d2e22")}><boxGeometry args={[1.8, 0.06, 0.04]} /></mesh>)}
      </group>}
      {has("tool") && <group position={[-7.5 + 2.4 * Math.sin(Math.min(Math.PI, k("tool", 40) * Math.PI)), 2.4, 0.6]}>
        <mesh material={glow(TECH.cyan, 0.8)}><torusGeometry args={[0.4, 0.06, 8, 30]} /></mesh>
        <mesh position={[0.4, -0.45, 0]} rotation-z={0.7} material={mat("brushed", "#9aa3b0")}><cylinderGeometry args={[0.06, 0.06, 0.6, 8]} /></mesh>
      </group>}
      <Ask b={b} at={[-2.5, 4.5, 0]} px={150} />
      <Words b={b} pos={pos} signAt={() => [-5.5, 2.6, 1]} signH={0.55} />
    </Shot>
  );
};
export default Picker;
