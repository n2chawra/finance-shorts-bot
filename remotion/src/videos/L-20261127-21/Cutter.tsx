// Cutter: a steel cutting bench under a work lamp. The question lies on it as a glowing strip of letter tiles;
// a hanging blade drops and slices it into token tiles; a ruler measures one; a wall of drawers behind holds
// the fixed list of chunks; tags with bar codes clip onto the tiles and slide away down a chute.
// Actions: strip, scan, letters, back, words, cut, tiles, glow, short, long, ruler, measure, fig, row, source,
// pair, fill, word, flood, common, one, rare, name, chop, drawers, lock, open, seal, repeat, match, check,
// tags, barcode, chute, away, tag, dim, empty, question.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, Lines, q, Q_TOKENS, r01, Shot, Tile, TOK, useBeat, WARM, Words, type Anchor } from "./kit";

const TX = (i: number) => -3.2 + i * 1.28;

const Cutter: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const cut = Math.max(k("cut", 8), k("tiles", 10), has("strip") && !has("cut") && !has("letters") && !has("scan") ? 1 : 0);
  const apart = Math.max(k("tiles", 16), has("cut") ? 0 : 1) * (has("strip") && (has("letters") || has("scan")) ? 0 : 1);
  const blade = has("cut") ? (f < at("cut") ? 0 : f < at("cut") + 6 ? (f - at("cut")) / 6 : Math.max(0, 1 - (f - at("cut") - 6) / 14)) : has("chop") ? Math.abs(Math.sin(Math.max(0, f - at("chop")) * 0.35)) * (f >= at("chop") ? 1 : 0) : 0;
  const lettersUp = k("letters", 16) * (1 - k("back", 12));
  const tagsOn = k("tags", 14);
  const barcode = k("barcode", 10);
  const wordsGone = k("words", 14) * (has("tags") ? 1 : 0);
  const chute = k("chute", 16), away = k("away", 30);
  const drawers = k("drawers", 20);
  const anchors: Record<string, Anchor> = {
    bench: { look: [0, 1.1, 0], dir: [0.2, 0.7, 1], d: 10 },
    strip: { look: [0, 1.1, 0.3], dir: [0.1, 0.6, 1], d: 7.5 },
    blade: { look: [0, 1.8, 0.3], dir: [0.35, 0.3, 1], d: 6 },
    tiles: { look: [0, 1.1, 0.6], dir: [0.2, 0.55, 1], d: 6.5 },
    list: { look: [0, 3, -2.5], dir: [0.15, 0.3, 1], d: 10 },
    chute: { look: [5.2, 0.8, 0.5], dir: [0.4, 0.5, 1], d: 6 },
    tag: { look: [0, 1.8, 0.6], dir: [0.1, 0.3, 1], d: 4 },
  };
  const pos = (on: string): V3 => on === "list" ? [-3, 5, -2.4] : on === "blade" ? [1.2, 3, 0.4] : on === "chute" ? [5.4, 2.2, 0.6] : [-2.6, 2.3, 0.6];
  const tokens = Q_TOKENS;
  const rare = has("rare") || has("common");
  return (
    <Shot p={p} b={b} anchors={anchors} seed="cutter" backdrop={WARM} floor={false} bloom={1.1} light={1} dust={{ c: [0, 2, 0], r0: 6, r1: 16, size: 0.35, color: "#ffd2a0" }}>
      {/* the workshop: a back wall of panels, the steel bench, a work lamp */}
      <mesh position={[0, 3, -3.4]} material={mat("clay", "#2c2219", { roughness: 0.9 })}><planeGeometry args={[30, 10]} /></mesh>
      <Lines from={-14} to={14} step={1.6} along="x" span={[-2, 8]} z={-3.38} color="#20180f" r={0.02} />
      <DotGrid x0={-14} x1={14} y0={-1} y1={8} z={-3.36} gap={0.35} size={0.06} color="#0e0a06" />
      <Block size={[11, 0.25, 3]} radius={0.04} preset="brushed" position={[0, 0.62, 0.4]} />
      <DotGrid x0={-5.4} x1={5.4} y0={0.76} y1={0.77} z={1.8} gap={0.3} size={0.05} color="#3b3f46" />
      {[-4.8, 4.8].map((x, i) => <Block key={i} size={[0.25, 0.6, 2.6]} radius={0.03} preset="blackPlastic" position={[x, 0.3, 0.4]} />)}
      <pointLight position={[0, 5, 2]} intensity={14} distance={14} color="#ffcf8a" />
      {/* the wall of drawers: the fixed list */}
      {(has("drawers") || has("lock")) && Array.from({ length: 36 }, (_, i) => {
        const c = i % 12, r = Math.floor(i / 12);
        const o = has("open") ? Math.max(0, Math.min(1, k("open", 40) * 3 - r01("dr", i) * 2)) : 0;
        return (
          <group key={i} position={[-5.5 + c, 2.4 + r * 0.9, -3.1 + 0.4 * o]} scale={q(drawers)}>
            <Block size={[0.9, 0.78, 0.5]} radius={0.04} material={mat("brushed", "#6b5a44")} />
            <mesh position={[0, 0, 0.26]} material={glow(TOK[i % 6]!, q(0.2 + 0.5 * o + 0.2 * k("seal", 14)))}><planeGeometry args={[0.5, 0.12]} /></mesh>
          </group>
        );
      })}
      {has("lock") && <Beam a={[-6, 3.3, -2.7]} b={[-6 + 12 * k("lock", 14), 3.3, -2.7]} r={0.05} color={TECH.amber} o={0.9} />}
      {/* the blade on its frame */}
      <group position={[0, 0, 0.3]}>
        <Block size={[0.14, 3.4, 0.14]} preset="brushed" position={[-0.9, 2.4, -1]} />
        <Block size={[0.14, 3.4, 0.14]} preset="brushed" position={[0.9, 2.4, -1]} />
        <mesh position={[0.64, 2.4 - 1.1 * blade, 0]} material={mat("brushed", "#d7dde8", { metalness: 1, roughness: 0.12 })}><boxGeometry args={[0.04, 1, 1.4]} /></mesh>
      </group>
      {/* the strip of the question, cut into token tiles */}
      {!rare && tokens.map((t, i) => {
        const x = TX(i) + (i - 2.5) * 0.25 * apart;
        const up = lettersUp * (0.3 + 0.2 * Math.sin(i + f * 0.2));
        const lit = has("glow") ? k("glow", 10) : 0.4 + 0.3 * cut;
        const slide = away > 0 ? Math.max(0, away * 9 - i * 0.6) : 0;
        return (
          <group key={i} position={[x + slide, 1.1 + up - (chute > 0 ? 0 : 0), 0.6]}>
            <Tile text={wordsGone > 0.5 ? "" : t} color={apart > 0.3 || has("tiles") ? TOK[i]! : TECH.cyan} w={apart > 0.3 ? 1.1 : 1.3} lit={lit} />
            {tagsOn > 0 && <group position={[0, 0.55, 0.1]} scale={q(tagsOn)}>
              <Block size={[0.8, 0.36, 0.05]} radius={0.04} preset="white" />
              {Array.from({ length: 9 }, (_, j) => <mesh key={j} position={[-0.3 + j * 0.075, 0, 0.03]} material={glow(TECH.ink, q(barcode))}><planeGeometry args={[0.03 + 0.03 * r01(t, j), 0.24]} /></mesh>)}
            </group>}
          </group>
        );
      })}
      {has("scan") && <mesh position={[TX(0) - 0.6 + 8 * ((f - at("scan")) / 40 % 1), 1.1, 0.75]} material={glow(TECH.white, 0.7)}><boxGeometry args={[0.05, 0.8, 0.02]} /></mesh>}
      {/* a rare word next to a common one */}
      {rare && <>
        <Tile text="sky" color={TOK[2]!} w={1.2} position={[-3, 1.1, 0.6]} scale={q(k("common", 12))} lit={0.6 + 0.4 * k("one", 10)} />
        {[0, 1, 2].map((i) => <Tile key={i} text={["Ray", "leigh", ""][i]!} color={TOK[i + 3]!} w={1.1} position={[0.2 + i * (1.2 + 0.5 * k("chop", 14)), 1.1, 0.6]} scale={q(k("rare", 12))} lit={0.6} />)}
        <Tile text="Kokoro" color={TOK[0]!} w={1.6} position={[3.6, 1.1 + 0.6 * (1 - k("chop", 14)), 0.6]} scale={q(k("name", 12) * (1 - k("chop", 14)))} />
        {has("chop") && ["Ko", "kor", "o"].map((t, i) => <Tile key={i} text={t} color={TOK[(i + 1) % 6]!} w={0.8} position={[3.0 + i * 1.0, 1.1, 0.6]} scale={q(k("chop", 14))} />)}
      </>}
      {/* the ruler for one token */}
      {has("ruler") && <group position={[TX(3), 1.55, 0.75]} scale={q(k("ruler", 12))}>
        <Block size={[1.2, 0.14, 0.04]} radius={0.02} material={mat("clay", "#e8d9a8")} />
        {Array.from({ length: 5 }, (_, j) => <mesh key={j} position={[-0.5 + j * 0.25, -0.02, 0.03]} material={glow(TECH.ink, q(k("measure", 20) * 1.2 > j / 5 ? 0.9 : 0.2))}><planeGeometry args={[0.02, 0.1]} /></mesh>)}
      </group>}
      {has("fig") && b.fig.chars && <FigLabel3D fig={b.fig.chars} caption="characters" at={[TX(3), 2.5, 0.8]} start={at("fig")} count={18} px={88} />}
      {/* a word tile beside a token tile, the share */}
      {has("pair") && <group position={[0, 0, 0]}>
        <Tile text="question" color={TOK[1]!} w={2.4} position={[-1.4, 2.2, 0.6]} scale={q(k("pair", 12))} lit={0.3} />
        <mesh position={[-1.4 - 1.2 + 0.9 * k("fill", 20), 2.2, 0.69]} material={glow(TECH.cyan, 0.6)}><boxGeometry args={[1.8 * k("fill", 20), 0.56, 0.02]} /></mesh>
        {b.fig.pct && <FigLabel3D fig={b.fig.pct} caption="of a word" at={[-1.4, 3.3, 0.6]} start={at("fig")} count={18} px={88} />}
      </group>}
      {has("flood") && Array.from({ length: 18 }, (_, i) => <Tile key={i} text="" color={TOK[i % 6]!} w={0.5} scale={0.6} position={[-5 + i * 0.6 + 4 * k("flood", 40), 1.0, 1.6]} lit={0.5 + 0.5 * k("glow", 10)} />)}
      {/* the chute the tags leave by */}
      <group position={[5.6, 0, 0.6]}>
        <mesh position={[0, 0.6, 0]} rotation-z={-0.5} material={mat("brushed", "#7b818c")}><boxGeometry args={[2.4, 0.06, 1.2]} /></mesh>
        <mesh position={[0.9, 0.2, 0]} material={glow(TECH.amber, q(0.1 + 0.5 * chute + (has("glow") && has("question") ? 0.4 * k("glow", 20) : 0)))}><circleGeometry args={[0.5, 24]} /></mesh>
      </group>
      {/* tease: one tag, alone */}
      {has("tag") && <group position={[0, 1.8 + 0.08 * Math.sin(f * 0.08), 0.6]}>
        <Block size={[1.6, 0.72, 0.08]} radius={0.06} preset="white" />
        {Array.from({ length: 14 }, (_, j) => <mesh key={j} position={[-0.65 + j * 0.1, 0, 0.05]} material={glow(TECH.ink, q(1 - 0.7 * k("dim", 14)))}><planeGeometry args={[0.04 + 0.04 * r01("tag", j), 0.5]} /></mesh>)}
      </group>}
      <Ask b={b} at={[1.4, 2.4, 0.6]} px={150} />
      <Words b={b} pos={pos} signAt={() => [-4, 2.2, 1.95]} signH={0.5} />
    </Shot>
  );
};
export default Cutter;
