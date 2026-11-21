// Props for the GTA VI copies Short: the game shop at night (wall, shelves, neon), the drawn GTA VI box (our own
// art: a sunset, palms and the name in plain letters, never the game's cover), the gold Ultimate box, a gamer.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt, type Motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";

export const SHOPBG = "#1b1433";
export const NEON = "#ff4fa3";
export const GOLD = "#f5c542";

/** The game box, front on, `w` wide (its height 1.3 w), feet at (x, y). */
export const GameBox: React.FC<{ x: number; y: number; w: number; ultimate?: boolean; tilt?: number; label?: boolean }> = ({ x, y, w, ultimate, tilt = 0, label = true }) => {
  const h = w * 1.3;
  const id = `gb-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}${ultimate ? "u" : ""}`;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ultimate ? "#3a2a08" : "#2b1250"} />
          <stop offset="0.55" stopColor={ultimate ? "#c98a1a" : "#ff5f8f"} />
          <stop offset="1" stopColor={ultimate ? "#ffe08a" : "#ffb347"} />
        </linearGradient>
      </defs>
      <rect x={x - w / 2 + 10} y={y - h + 12} width={w} height={h} rx={w * 0.05} fill="#000" opacity={0.3} />
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.05} fill={`url(#${id})`} stroke={ultimate ? GOLD : INK} strokeWidth={ultimate ? STROKE + 4 : STROKE} />
      <circle cx={x} cy={y - h * 0.42} r={w * 0.22} fill={ultimate ? "#fff2b8" : "#ffd36b"} opacity={0.9} />
      {[-0.3, 0.28].map((dx, i) => (
        <g key={i}>
          <line x1={x + dx * w} y1={y - h * 0.08} x2={x + dx * w + w * 0.03} y2={y - h * 0.5} stroke="#1a0f2e" strokeWidth={w * 0.03} />
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx={x + dx * w + w * 0.03 + Math.cos(k * 1.6) * w * 0.07} cy={y - h * 0.5 + Math.sin(k * 1.6) * w * 0.02} rx={w * 0.09} ry={w * 0.025}
              transform={`rotate(${k * 45 - 60} ${x + dx * w + w * 0.03} ${y - h * 0.5})`} fill="#1a0f2e" />
          ))}
        </g>
      ))}
      <rect x={x - w / 2} y={y - h * 0.12} width={w} height={h * 0.12} fill="#1a0f2e" opacity={0.8} />
      {label ? (
        <>
          <Txt x={x} y={y - h * 0.8} size={w * 0.26} fill="#ffffff" stroke={INK} deco={w * 0.26 < 44}>GTA VI</Txt>
          {ultimate ? <Txt x={x} y={y - h * 0.06} size={w * 0.1} fill={GOLD} deco>ULTIMATE</Txt> : null}
        </>
      ) : null}
    </g>
  );
};

/** The back wall of the game shop: dark purple, shelves of other (unnamed) games, a pink neon strip. */
export const ShopWall: React.FC<{ m: Motion; lit?: number }> = ({ m, lit = 1 }) => {
  const r = rng("gta-shelf");
  const colors = ["#3fa7ff", "#7ad36b", "#ff8a3d", "#b07bff", "#ff5f6d", "#2fd3c4"];
  return (
    <g>
      <rect x={-700} y={-700} width={2480} height={3300} fill={SHOPBG} />
      <rect x={-700} y={1330} width={2480} height={1300} fill="#2a2140" />
      <rect x={-700} y={1320} width={2480} height={24} fill="#3a2f58" stroke={INK} strokeWidth={4} />
      <rect x={-700} y={150} width={2480} height={18} rx={9} fill={NEON} opacity={0.5 + 0.5 * lit} />
      <Glow x={540} y={160} r={900} ry={140} color={NEON} o={0.3 * lit} />
      {[440, 760, 1080].map((sy, row) => (
        <g key={sy}>
          {Array.from({ length: 18 }).map((_, i) => {
            const bx = -620 + i * 130 + (row % 2) * 40;
            const c = colors[Math.floor(r() * colors.length)]!;
            return <Block key={i} x={bx} y={sy - 170} w={96} h={160} r={6} fill={c} opacity={0.55 + 0.15 * Math.sin(m.t / 20 + i)} />;
          })}
          <Block x={-700} y={sy} w={2480} h={26} fill="#5a4a80" shadow="bottom" />
        </g>
      ))}
    </g>
  );
};

/** A gamer in a cap holding a box (the queue, the fan at the glass). */
export const Gamer: React.FC<{ x: number; y: number; s: number; m: Motion; i: number; face?: "happy" | "grin" | "shock" | "neutral" }> = ({ x, y, s, m, i, face = "happy" }) => {
  const tops = ["#3fa7ff", "#ff8a3d", "#7ad36b", "#b07bff", "#ff5f6d"];
  const skins = ["#c98652", "#f1c27d", "#8d5524", "#e0ac69", "#a86b3c"];
  return (
    <Char x={x} y={y + m.wave(50 + i * 3, 3, i)} s={s} top={tops[i % 5]} skin={skins[(i + 2) % 5]} hair={i % 2 ? "spiky" : "side"} face={face}
      armR={[40, 110]} holdR={([hx, hy]) => <GameBox x={hx} y={hy + s * 0.25} w={s * 0.32} label={false} />} />
  );
};

/** A small spinning gold star sparkle. */
export const Sparkle: React.FC<{ x: number; y: number; r: number; k: number }> = ({ x, y, r, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${k * 90})`}>
      <path d={`M 0 ${-r} L ${r * 0.25} ${-r * 0.25} L ${r} 0 L ${r * 0.25} ${r * 0.25} L 0 ${r} L ${-r * 0.25} ${r * 0.25} L ${-r} 0 L ${-r * 0.25} ${-r * 0.25} Z`} fill={GOLD} stroke={INK} strokeWidth={3} />
    </g>
  );

export const Coinish: React.FC<{ x: number; y: number }> = ({ x, y }) => <Ball x={x} y={y} r={20} fill={GOLD} />;

export default { GameBox, ShopWall, Gamer, Sparkle };
