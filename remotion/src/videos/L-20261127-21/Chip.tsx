// Chip: a data-centre graphics chip on its board, close: the big die opens into a grid of tiny maths units,
// tall memory stacks either side, streams of beads (parameters) running across; one unit in close-up takes two
// beads and adds; waves sweep the grid; several chips in a row with glowing links; a tray of saved notes.
// Actions: board, plate, fig, beads, grid, token, flash, mem, book, gone, settle, die, units, two, join, add,
// total, all, wave, again, blur, glow, stack, link, stream, full, split, row, pass, links, strip, clock, notes,
// tray, skip, new, field, count, pulse.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { A_TOKENS, Beads, Beam, BigChip, DotGrid, HALL, q, Shot, Tile, TOK, useBeat, Words, type Anchor } from "./kit";

const UNIT: V3 = [0.6, 0.12, 0.35];

const Chip: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const grid = Math.max(k("grid", 30), k("units", 40), has("die") || has("all") || has("wave") ? 1 : 0);
  const wave = has("wave") && f >= at("wave") ? (((f - at("wave")) / (has("blur") && f >= at("blur") ? 8 : 24)) % 1) : -1;
  const all = has("all") && f >= at("all") && f < at("wave", Infinity) ? 1 : 0;
  const lit = Math.min(1, 0.3 + 0.7 * all + 0.4 * k("glow", 16) + 0.3 * k("flash", 6) + (has("pulse") ? 0.3 * Math.abs(Math.sin(f * 0.2)) : 0));
  const memLit = Math.max(0.3, k("mem", 12), k("stack", 12), k("stream", 10));
  const split = k("split", 24);
  const many = has("split") || has("row") || has("links");
  const anchors: Record<string, Anchor> = {
    board: { look: [0, 0.3, 0], dir: [0.3, 1.0, 1], d: 8 },
    die: { look: [0, 0.1, 0], dir: [0.15, 1.3, 0.8], d: 5 },
    unit: { look: [UNIT[0], UNIT[1] - 0.2, UNIT[2] + 0.9], dir: [0.1, 1.6, 1], d: 3.8 },
    mem: { look: [2.05, 0.4, 0], dir: [0.6, 0.8, 1], d: 5 },
    links: { look: [6, 0.3, 0], dir: [0.15, 0.9, 1], d: 12 },
    text: { look: [0, 1.6, 2.6], dir: [0, 0.4, 1], d: 7 },
  };
  const pos = (on: string): V3 => on === "mem" || on === "tray" ? [2.05, 1.4, 0.5] : on === "die" ? [-1.4, 0.9, 1.2] : on === "links" ? [6, 1.5, 1.4] : [0, 1.5, 1.8];
  const memA: V3 = [2.05, 0.5, 0], memB: V3 = [-2.05, 0.5, 0];
  const two = k("two", 12), join = k("join", 10);
  return (
    <Shot p={p} b={b} anchors={anchors} seed="chip" backdrop={HALL} floor={false} bloom={1.25} light={0.85} dust={{ c: [0, 1, 0], r0: 6, r1: 16, size: 0.3, color: "#9fe8ff" }}>
      <mesh position={[0, -0.2, 0]} rotation-x={-Math.PI / 2} material={mat("clay", "#0a1418")}><planeGeometry args={[60, 30]} /></mesh>
      <DotGrid x0={-14} x1={22} y0={-0.18} y1={-0.17} z={3} gap={0.5} size={0.05} color="#16323c" glowing />
      <DotGrid x0={-16} x1={26} y0={-1} y1={8} z={-6} gap={0.5} size={0.08} color="#2a6a80" glowing />
      <BigChip f={f} grid={grid} wave={wave} lit={lit} mem={memLit} hot={has("unit") || has("two") ? 7 * 14 + 9 : -1} />
      {/* the parameter count on a plate by the chip */}
      {(has("plate") || has("fig") || has("count")) && <group position={[0, 0.05, -2.7]}>
        <Block size={[3.4, 0.9, 0.12]} radius={0.03} preset="brushed" position={[0, 0.45, 0]} />
        {b.fig.params && <FigLabel3D fig={b.fig.params} caption="parameters" at={[0, 1.4, 0.2]} start={at("fig", at("count", 0))} count={has("field") ? 0 : 20} px={100} />}
      </group>}
      {/* parameter beads streaming from memory into the chip */}
      {(has("beads") || has("stream")) && f >= Math.min(at("beads"), at("stream")) && <>
        <Beads a={memA} b={[0.3, 0.2, 0]} t={(f - Math.min(at("beads"), at("stream"))) * (has("again") ? 1.6 : 1)} n={16} color={TECH.amber} r={0.05} spread={0.4} />
        <Beads a={memB} b={[-0.3, 0.2, 0]} t={(f - Math.min(at("beads"), at("stream"))) * 1.2} n={16} color={TECH.amber} r={0.05} spread={0.4} />
      </>}
      {has("link") && [[1.3, 1.75], [-1.75, -1.3]].map(([a, c], i) => <mesh key={i} position={[(a! + c!) / 2, 0.06, 0]} material={glow(TECH.amber, q(0.3 + 0.6 * k("link", 12)))}><boxGeometry args={[Math.abs(c! - a!), 0.02, 1.6]} /></mesh>)}
      {/* a token tile the work is for */}
      {(has("token") || has("new")) && <Tile text={A_TOKENS[0]!} color={TECH.amber} w={1.4} position={[-3.4, 1.2, 1.4]} lit={0.4 + 0.6 * Math.abs(Math.sin(f * 0.1))} scale={q(Math.max(k("token", 10), k("new", 10)))} />}
      {/* "no list of facts": a book outline that dissolves */}
      {has("book") && <group position={[0, 1.6, 0.5]} scale={q(k("book", 12) * (1 - k("gone", 20)))}>
        <Block size={[1.4, 1.8, 0.3]} radius={0.05} material={mat("glass", "#ffe0a0", { transparent: true, opacity: 0.4, emissive: TECH.amber, emissiveIntensity: 0.4 })} />
      </group>}
      {/* one maths unit in close-up: two numbers in, the sum bar grows */}
      {has("two") && <group position={UNIT}>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.25 * (1 - join), 0.3 * (1 - two) + 0.12, -0.25]} material={glow(s < 0 ? TECH.cyan : TECH.lime, 0.8)}><sphereGeometry args={[0.035, 12, 8]} /></mesh>)}
        {has("add") && <mesh position={[0, 0.1, -0.25]} material={glow(TECH.white, q(Math.max(0, 1 - (f - at("add")) / 14)))}><sphereGeometry args={[0.07, 12, 8]} /></mesh>}
        {has("total") && <mesh position={[0.32, 0.03 + 0.15 * k("total", 20), 0]} material={glow(TECH.amber, 0.9)}><boxGeometry args={[0.05, 0.3 * k("total", 20) + 0.01, 0.05]} /></mesh>}
      </group>}
      {/* more chips, and the links between them */}
      {many && [1, 2, 3].map((i) => (
        <group key={i} position={[i * 6.2 * Math.max(split, has("row") ? 1 : 0), 0, 0]} scale={q(Math.max(split, has("links") ? 1 : 0))}>
          <BigChip f={f} grid={1} lit={0.3 + 0.4 * k("pass", 10)} mem={0.6} cols={8} />
        </group>
      ))}
      {many && has("pass") && f >= at("pass") && [0, 1, 2].map((i) => <Beads key={i} a={[i * 6.2 + 2.8, 0.15, 1.2]} b={[(i + 1) * 6.2 - 2.8, 0.15, 1.2]} t={(f - at("pass")) * 1.5 + i * 7} n={4} color={TECH.cyan} r={0.07} spread={0.02} />)}
      {many && has("links") && [0, 1, 2].map((i) => <Beam key={i} a={[i * 6.2 + 2.8, 0.12, 1.2]} b={[(i + 1) * 6.2 - 2.8, 0.12, 1.2]} r={0.04} color={TECH.cyan} o={q(0.4 + 0.6 * k("links", 10))} />)}
      {has("full") && <mesh position={[2.05, 0.9, 0]} material={glow(TECH.amber, q(0.3 * k("full", 12)))}><sphereGeometry args={[0.9, 16, 10]} /></mesh>}
      {/* k_cache: the answer strip above, notes dropping into a tray in memory */}
      {has("notes") && <>
        {A_TOKENS.slice(0, 5).map((t, i) => <Tile key={i} text={t} color={TOK[i]!} w={1.3} position={[-3 + i * 1.5, 1.7, -1.6]} scale={0.6} lit={i === 4 && has("new") ? 1 : 0.6 - 0.5 * k("skip", 14)} />)}
        {A_TOKENS.slice(0, 4).map((_, i) => {
          const u = Math.max(0, Math.min(1, k("notes", 30) * 2 - i * 0.25));
          return <mesh key={i} position={[-3 + i * 1.5 + (2.05 + 3 - i * 1.5) * u, 1.5 - 0.9 * u, -1.6 + 1.6 * u]} material={glow(TECH.lime, 0.9)}><boxGeometry args={[0.3, 0.06, 0.2]} /></mesh>;
        })}
        <mesh position={[2.05, 0.62, 0]} material={glow(TECH.lime, q(0.2 + 0.5 * k("tray", 12)))}><boxGeometry args={[0.9, 0.04, 1.2]} /></mesh>
        {has("clock") && <mesh position={[-4.6, 1.7, -1.6]} rotation-z={-(f - at("clock")) * 0.2} material={glow(TECH.white, 0.8)}><torusGeometry args={[0.3, 0.03, 6, 30, Math.PI * 1.6]} /></mesh>}
      </>}
      {/* payoff: a ghost field of choices over the chip */}
      {has("field") && Array.from({ length: 24 }, (_, i) => {
        const h = 0.3 + 1.4 * (i === 11 ? 1 : ((i * 53) % 17) / 17 * 0.5);
        return <mesh key={i} position={[-3 + (i % 12) * 0.55, 1.4 + h / 2 * k("field", 20), -0.6 - Math.floor(i / 12) * 0.6]} material={glow(i === 11 ? TECH.amber : TECH.cyan, q(0.25 + (i === 11 ? 0.5 : 0)))}><boxGeometry args={[0.18, h * k("field", 20) + 0.01, 0.18]} /></mesh>;
      })}
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Chip;
