// Tower: a tall glass tower of thin floors (the model's layers) on a dark plaza. The row of token columns enters
// the first floor and climbs; on one floor (anchor "floor") glowing threads reach back from each column to the
// earlier ones (attention) and each column passes through a lit block of multiplications; the walls fill with
// tiny beads (the parameters); at the end the tower fades to an outline and sinks into a chip at its foot.
// Actions: tower, floors, question, count, fig, stack, base, rise, climb, floor, last, threads, all, flow, tint,
// blue, words, sky, mood, blocks, through, sparks, bars, settle, shift, top, fade, blend, glow, beads, shelves,
// label, grow, ghost, chip, light, drop.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { ChipPackage, FigLabel3D, glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { Ask, Beam, Column, DotGrid, q, Q_TOKENS, Shot, TEAL, Tile, TOK, useBeat, Words, type Anchor } from "./kit";

const FLOORS = 30, FH = 0.62, W = 9, DP = 3.4;
const FLOOR_Y = 2 * FH;   // the floor we look at up close
const CX = (i: number) => -3.75 + i * 1.5;

const Tower: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const floorsLit = Math.max(k("floors", 50), has("tower") ? 0.25 : 0, has("rise") || has("floor") || has("top") ? 1 : 0);
  const climbT = has("rise") ? Math.min(1, (f - at("rise")) / Math.max(30, b.end - at("rise"))) : has("top") ? 1 : 0;
  const rowY = has("floor") || has("blue") || has("blocks") || has("beads") ? FLOOR_Y : has("rise") ? climbT * (FLOORS - 1) * FH : -10;
  const showRow = rowY > -5 || has("base");
  const threads = Math.max(k("threads", 16), has("threads") || has("blue") ? 0 : 0);
  const allT = k("all", 16);
  const blocks = k("blocks", 14), through = k("through", 20);
  const beads = k("beads", 24);
  const ghost = k("ghost", 24), drop = k("drop", 30);
  const anchors: Record<string, Anchor> = {
    tower: { look: [0, 6, 0], dir: [0.5, 0.15, 1], d: 22 },
    base: { look: [0, 1.4, 0], dir: [0.45, 0.25, 1], d: 12 },
    floor: { look: [0, FLOOR_Y + 1, 0.3], dir: [0.15, 0.35, 1], d: 9 },
    blue: { look: [CX(4), FLOOR_Y + 1, 0.3], dir: [0.15, 0.3, 1], d: 5.5 },
    top: { look: [0, (FLOORS - 1) * FH + 1, 0], dir: [0.4, 0.3, 1], d: 10 },
  };
  const pos = (on: string): V3 => on === "blue" ? [CX(4), FLOOR_Y + 2.2, 0.6] : on === "sky" ? [CX(3), FLOOR_Y + 2.2, 0.6] : on === "wall" ? [-4.6, FLOOR_Y + 2.5, -1.6] : on === "floor" ? [-3, FLOOR_Y + 2.6, 0.6] : [-3.5, 3, 1.8];
  const sky = Q_TOKENS.length;
  return (
    <Shot p={p} b={b} anchors={anchors} seed="tower" backdrop={TEAL} floor="reflect" bloom={1.15} light={0.85} dust={{ c: [0, 6, 0], r0: 10, r1: 24, size: 0.4, color: "#9fffe0" }}>
      <DotGrid x0={-14} x1={14} y0={0.01} y1={0.02} z={5} gap={0.7} size={0.06} color="#123a36" glowing />
      {/* the floors */}
      <group position={[0, -drop * 12, 0]}>
        {Array.from({ length: FLOORS }, (_, i) => {
          const lit = floorsLit * FLOORS > i ? 1 : 0;
          const here = Math.abs(i * FH - rowY) < FH * 0.6 ? 1 : 0;
          const o = q((0.18 + 0.12 * lit) * (1 - 0.6 * ghost));
          return (
            <group key={i} position={[0, 0.1 + i * FH * (1 - 0.15 * k("stack", 14)), 0]}>
              <mesh material={mat("glass", "#8ff0e0", { transparent: true, opacity: o, emissive: TECH.cyan, emissiveIntensity: q(0.05 + 0.25 * lit + 0.8 * here) })}><boxGeometry args={[W, 0.05, DP]} /></mesh>
              {beads > 0 && Array.from({ length: 22 }, (_, j) => <mesh key={j} position={[-W / 2 + 0.2 + j * 0.41, 0.25, -DP / 2 + 0.05]} material={glow(TECH.amber, q(0.4 + 0.5 * rnd("bd", i * 22 + j)))}><sphereGeometry args={[0.06 * Math.min(1, beads * (has("grow") ? 1 : i < 6 ? 1 : 0) + k("grow", 30)), 6, 4]} /></mesh>)}
            </group>
          );
        })}
        {[[-W / 2, -DP / 2], [W / 2, -DP / 2], [-W / 2, DP / 2], [W / 2, DP / 2]].map(([x, z], i) => <mesh key={i} position={[x!, FLOORS * FH / 2, z!]} material={mat("brushed", "#4d6b68")}><boxGeometry args={[0.08, FLOORS * FH, 0.08]} /></mesh>)}
        {has("fig") && <FigLabel3D fig="GPT" caption="dozens of layers" at={[W / 2 + 0.6, 1.4, DP / 2]} start={at("fig")} count={0} face="front" height={0.6} color={TECH.amber} />}
      </group>
      {/* the row of token columns */}
      {showRow && Q_TOKENS.map((t, i) => {
        const tint = has("tint") ? k("tint", 18) : 0;
        const blend = k("blend", 20);
        const isBlue = i === 4;
        const col = isBlue && (has("sky") || has("tint")) && tint > 0.5 ? "#6ab8ff" : TOK[i]!;
        return (
          <group key={i} position={[CX(i), Math.max(0, rowY) + 0.2, 0.3 + (blocks > 0 ? -0.9 * through : 0)]}>
            <Column seed={`tw-${i}`} n={8} color={blend > 0.5 ? TECH.cyan : col} position={[0.2, 0.25, 0]} shift={(has("shift") ? 0.5 + 0.5 * Math.sin(f * 0.15) : 0) + 0.6 * k("bars", 14) + 0.3 * tint} />
            <Tile text={k("fade", 14) > 0.5 && i === sky - 1 ? "" : t} color={TOK[i]!} w={1.2} position={[0, -0.1, 0.5]} scale={0.7} lit={i === sky - 1 && has("last") ? 1 : 0.4} />
          </group>
        );
      })}
      {/* attention: threads back from each column to the earlier ones */}
      {(has("threads") || has("blue") || has("sky")) && Q_TOKENS.map((_, i) => Q_TOKENS.slice(0, i).map((__, j) => {
        const show = i === sky - 1 ? threads : allT;
        const strong = has("sky") && i === 4 && j === 3 ? k("sky", 12) : 0;
        const weak = has("blue") && i === 4 ? 1 : 0;
        const o = (has("blue") ? weak * (j === 3 ? 0.3 + 0.7 * strong : 0.25 * (1 - k("mood", 14))) : show * (0.25 + 0.5 * k("flow", 14)));
        if (o <= 0.02) return null;
        const a: V3 = [CX(i), FLOOR_Y + 1.6, 0.3], c: V3 = [CX(j), FLOOR_Y + 1.6, 0.3];
        const mid: V3 = [(a[0] + c[0]) / 2, FLOOR_Y + 1.9 + 0.25 * (i - j), 0.3];
        return <group key={`${i}-${j}`}><Beam a={a} b={mid} r={0.02 + 0.03 * strong} color={strong > 0.2 ? "#6ab8ff" : TECH.white} o={q(o)} /><Beam a={mid} b={c} r={0.02 + 0.03 * strong} color={strong > 0.2 ? "#6ab8ff" : TECH.white} o={q(o)} /></group>;
      }))}
      {has("mood") && <Tile text="sad" color={TECH.pink} w={1} position={[CX(5) + 1.5, FLOOR_Y + 2.4, 0.3]} scale={0.6} o={1 - k("mood", 14)} lit={0.2} />}
      {/* the multiplying blocks */}
      {blocks > 0 && Q_TOKENS.map((_, i) => (
        <group key={i} position={[CX(i), FLOOR_Y + 0.9, -0.45]} scale={q(blocks)}>
          <mesh material={mat("glass", "#ffd28a", { transparent: true, opacity: 0.45, emissive: TECH.amber, emissiveIntensity: q(0.3 + 0.5 * k("sparks", 10) * (0.5 + 0.5 * Math.sin(f * 0.6 + i))) })}><boxGeometry args={[1.1, 1.6, 0.6]} /></mesh>
        </group>
      ))}
      {has("top") && <mesh position={[0, (FLOORS - 1) * FH + 0.4, 0]} material={glow(TECH.white, q(0.2 + 0.5 * k("glow", 16)))}><boxGeometry args={[W * 0.9, 0.06, DP * 0.9]} /></mesh>}
      {/* the chip at the foot */}
      {has("chip") && <ChipPackage position={[6.5, 0.05, 2]} scale={2.4 * q(k("chip", 14))} lid={false} lit={0.3 + 0.7 * Math.max(k("light", 14), drop)} seed="tw-chip" />}
      <Ask b={b} at={[0, 5, 2]} px={150} />
      <Words b={b} pos={pos} signAt={() => [-3, 1, DP / 2 + 0.3]} signH={0.55} />
    </Shot>
  );
};
export default Tower;
