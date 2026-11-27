// Window: a long conveyor belt of token tiles running through a lit frame (the context window) in a dark loading
// bay. Inside the frame: the question (cyan), the earlier chat (amber) and the answer so far (white); old tiles slide
// out of the back edge and drop into the dark; a few pages slide out beside it and a thick book won't fit; chat
// bubbles and an arrow copy old messages back in; the frame stretches longer for newer models.
// Actions: belt, frame, edges, move, shrink, slots, fill, q, earlier, answer, chars, pages, book, nofit, old, drop,
// dim, gone, gap, empty, two, arrow, copy, in, stretch, edge, outside, dark.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Beads, Beam, DotGrid, FloorGrid, Lines, q, Shot, Tile, useBeat, WARM, Words, type Anchor } from "./kit";

const N = 34, GAP = 1.15;

const Window: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const moving = has("move") || has("belt") || has("old");
  const run = moving ? (f - Math.min(at("move"), at("belt"), at("old"))) * 0.03 : 0;
  const frameK = Math.max(k("frame", 16), has("frame") ? 0 : 1);
  const halfW = 4.6 * (1 - 0.3 * k("shrink", 20)) * (1 + 1.6 * k("stretch", 30));
  const fill = Math.max(k("fill", 30), has("q") || has("earlier") || has("answer") ? 1 : 0);
  const anchors: Record<string, Anchor> = {
    belt: { look: [0, 0.8, 0], dir: [0.45, 0.45, 1], d: 16 },
    frame: { look: [0, 1, 0], dir: [0.2, 0.35, 1], d: 10 },
    off: { look: [-halfW - 0.6, 0.4, 0], dir: [0.3, 0.4, 1], d: 7 },
    book: { look: [halfW + 2.6, 1, 2.2], dir: [0.25, 0.35, 1], d: 5.5 },
    arrow: { look: [0, 2.6, 2.4], dir: [0.15, 0.35, 1], d: 6 },
  };
  const pos = (on: string): V3 => on === "q" ? [2.2, 2.2, 0] : on === "earlier" ? [-2.5, 2.2, 0] : on === "arrow" ? [-3.5, 3.8, 2.4] : on === "frame" ? [-halfW, 2.8, 0] : [0, 2.6, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="window" backdrop={WARM} floor="reflect" bloom={1.15} light={0.9} dust={{ c: [0, 1, 0], r0: 8, r1: 20, size: 0.35, color: "#ffd6a8" }}>
      {/* the loading bay: back wall with ribs, the belt's rollers */}
      <mesh position={[0, 3, -4]} material={mat("clay", "#241a12", { roughness: 0.9 })}><planeGeometry args={[60, 10]} /></mesh>
      <Lines from={-28} to={28} step={2} along="x" span={[-2, 8]} z={-3.98} color="#1a120b" r={0.03} />
      <DotGrid x0={-26} x1={26} y0={-1} y1={8} z={-3.95} gap={0.4} size={0.07} color="#8a6038" glowing />
      <FloorGrid x0={-22} x1={22} z0={-3.8} z1={6} step={0.6} color="#5a4026" />
      <Block size={[44, 0.2, 1.4]} radius={0.04} preset="blackPlastic" position={[0, 0.1, 0]} />
      <DotGrid x0={-22} x1={22} y0={0.21} y1={0.22} z={0.72} gap={0.4} size={0.06} color="#6b6f78" />
      {/* the tiles on the belt */}
      {Array.from({ length: N }, (_, i) => {
        let x = (i - N / 2) * GAP + ((run * 1.0) % GAP) + (moving ? Math.floor(run / GAP) * 0 : 0);
        x += moving ? (run % GAP) : 0;
        const inside = Math.abs(x) < halfW;
        const zone = x > halfW * 0.35 ? "a" : x > -halfW * 0.3 ? "q" : "e";
        const col = !inside ? "#3a3a44" : zone === "a" ? TECH.white : zone === "q" ? TECH.cyan : TECH.amber;
        const shown = zone === "q" ? k("q", 12) : zone === "e" ? k("earlier", 12) : k("answer", 12);
        const lit = inside ? 0.2 + 0.6 * fill * (has("q") ? shown : 1) : 0.05 * (1 - k("dark", 14));
        // old tiles at the back edge drop off into the dark
        const dropping = has("drop") && x < -halfW ? Math.min(1, (-halfW - x) / 2.5) * k("drop", 20) : 0;
        const gone = has("gone") && x < -halfW - 2 ? 1 - k("gone", 14) : 1;
        if (gone <= 0.02) return null;
        return <Tile key={i} text="" color={col} w={0.9} position={[x, 0.55 - 3 * dropping, 0.1]} rotation-z={dropping * 0.8} scale={0.8 * gone} lit={lit * (has("dim") && x < -halfW ? 1 - k("dim", 12) : 1)} />;
      })}
      {/* the frame */}
      <group scale={[1, q(frameK), 1]}>
        {[-1, 1].map((s) => <mesh key={s} position={[s * halfW, 1.3, 0]} material={glow(s < 0 && (has("edges") || has("old")) ? TECH.amber : TECH.white, q(0.5 + 0.4 * k("edges", 12) + 0.3 * k("edge", 12)))}><boxGeometry args={[0.08, 2.4, 1.6]} /></mesh>)}
        <mesh position={[0, 2.5, 0]} material={glow(TECH.white, 0.6)}><boxGeometry args={[halfW * 2, 0.06, 1.6]} /></mesh>
        <mesh position={[0, 1.2, -0.85]} material={glow("#ffcf8a", 0.08)}><planeGeometry args={[halfW * 2, 2.4]} /></mesh>
        {has("slots") && Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-halfW + (i + 0.5) * (halfW * 2 / 16), 2.56, 0.6]} material={glow(TECH.amber, q(k("slots", 20) * 16 > i ? 0.9 : 0.1))}><boxGeometry args={[0.12, 0.12, 0.05]} /></mesh>)}
      </group>
      {/* a token's characters, and a few pages next to a book that won't fit */}
      {has("chars") && b.fig.chars && <FigLabel3D fig={b.fig.chars} caption="characters a token" at={[0, 3.4, 0.4]} start={at("chars")} count={16} px={84} />}
      {has("pages") && [0, 1, 2].map((i) => (
        <group key={i} position={[halfW + 1.2 + i * 0.25 * k("pages", 14), 1.2 + i * 0.08, 2.2 - i * 0.1]} rotation-y={-0.2}>
          <mesh material={mat("clay", "#f2ece0", { emissive: "#fff1cf", emissiveIntensity: 0.3 })}><planeGeometry args={[1, 1.35]} /></mesh>
          {[0, 1, 2, 3, 4, 5].map((j) => <mesh key={j} position={[0, 0.45 - j * 0.16, 0.01]} material={mat("clay", "#8d857a")}><planeGeometry args={[0.75, 0.04]} /></mesh>)}
        </group>
      ))}
      {has("book") && <group position={[halfW + 3.4, 0.9 + 1.5 * (1 - k("book", 16)), 2.2]} rotation-y={-0.3}>
        <Block size={[1.4, 1.9, 0.9]} radius={0.06} material={mat("clay", "#7a2a2a", { emissive: "#ff3a3a", emissiveIntensity: q(0.4 * k("nofit", 12)) })} />
        <Block size={[1.3, 1.8, 0.82]} radius={0.04} material={mat("clay", "#eee6d6")} position={[0.06, 0, 0]} />
      </group>}
      {/* memory between chats: bubbles and the copy arrow */}
      {has("empty") && <group position={[-5.5, 3.2, 2.4]}>
        <Block size={[2.2, 1, 0.12]} radius={0.3} material={mat("glossy", "#26324d", { emissive: "#1d2a48", emissiveIntensity: 0.5 })} />
        {has("two") && <Block size={[2.2, 1, 0.12]} radius={0.3} material={mat("glossy", "#2d3b5a", { emissive: "#24365a", emissiveIntensity: 0.6 })} position={[2.8, 0.3, 0]} scale={q(k("two", 12))} />}
      </group>}
      {has("arrow") && <Beam a={[-5.5, 2.6, 2.4]} b={[-5.5 + 5.2 * k("arrow", 16), 2.6 - 1.4 * k("arrow", 16), 2.4 - 2.2 * k("arrow", 16)]} r={0.05} color={TECH.lime} o={0.9} />}
      {has("copy") && f >= at("copy") && <Beads a={[-5.5, 2.6, 2.4]} b={[-0.3, 1.2, 0.2]} t={f - at("copy")} n={5} color={TECH.amber} r={0.12} spread={0.05} />}
      <Words b={b} pos={pos} signAt={() => [-halfW + 0.2, 3.1, 0.8]} signH={0.5} />
    </Shot>
  );
};
export default Window;
