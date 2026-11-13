/**
 * The flat kit: directed 2D shots (owner, 2026-11-13, after the Netflix remake: "I absolutely loved
 * this… now new videos are made like this").
 *
 * A directed beat is one SVG drawing per frame: a place built for the line being said, the cast acting
 * in it, the figure written on a thing in that place, a camera that moves through it, and every change
 * timed to a spoken word. Everything here is flat vector art in one house style: an ink outline on every
 * shape, one painted shadow tone per shape, gradient glows for light, Poppins for words.
 *
 *   const Shot: React.FC<SceneProps> = (p) => {
 *     const m = motion(p);                       // m.t: story frames into the beat; m.at("year"): when "year" is said
 *     return (
 *       <Stage p={p} bg="#2f3378">
 *         <View zoom={m.lerp([0, m.end], [1, 1.1])} cx={540} cy={820}> …the place, the cast, the things… </View>
 *       </Stage>
 *     );
 *   };
 *
 * Coordinates are frame pixels (1080×1920 in a Short, 1920×1080 in a long video). Rules for using it:
 * remotion/src/flat/README.md and generator/prompts/director.md.
 */
import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import type { SceneProps } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { showsSource } from "../studio/source";

export const INK = "#1d1a2b";
export const STROKE = 6;

// ------------------------------------------------------------------ colour and randomness

/** Darken (amt < 0) or lighten (amt > 0) a hex colour. */
export const shade = (hex: string, amt: number): string => {
  const n = parseInt(hex.replace("#", "").slice(0, 6).padEnd(6, "0"), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/** A seeded random stream (renders must be deterministic): rng("skyline")() → 0..1. */
export const rng = (seed: string | number) => {
  let s = typeof seed === "number" ? Math.floor(Math.abs(seed)) % 2147483647 : [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);
  if (s === 0) s = 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

// ------------------------------------------------------------------ timing

export const EASE = Easing.bezier(0.33, 0, 0.2, 1);

/** Timing helpers for one beat, on the story clock (frames since the beat began; events in the same frames). */
export function motion(p: SceneProps) {
  const t = p.frame;
  const fps = p.fps;
  const ev = p.beat.events;
  const end = p.beat.frames;
  /** The frame an event (a spoken word named in the script's `events`) happens; `dflt` when it has none. */
  const at = (name: string, dflt = 0): number => (name in ev ? ev[name]! : dflt);
  const lerp = (range: [number, number], out: [number, number], easing: (x: number) => number = EASE): number =>
    range[1] <= range[0] ? (t >= range[1] ? out[1] : out[0])
      : interpolate(t, range, out, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
  /** A 0..1 spring that starts at frame `from` (0 before it). */
  const pop = (from: number, damping = 11, stiffness = 170): number =>
    t < from ? 0 : spring({ frame: t - from, fps, config: { damping, stiffness, mass: 0.6 } });
  /** 1 at frame `c`, falling to 0 `w` frames either side (flashes, squashes). */
  const pulse = (c: number, w: number): number => Math.max(0, 1 - Math.abs(t - c) / w);
  /** A slow wave for idle life: breathing, bobbing, flicker. */
  const wave = (period: number, amp = 1, phase = 0): number => Math.sin((t / period) * Math.PI * 2 + phase) * amp;
  return { t, fps, end, at, lerp, pop, pulse, wave, after: (name: string) => t >= at(name, Infinity) };
}
export type Motion = ReturnType<typeof motion>;

/** Count a code-computed figure up on screen: "$11B" at k=0.5 → "$6B" (same prefix, suffix and decimals). */
export function countText(final: string, k: number): string {
  const m = final.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!m || m.index === undefined) return final;
  const raw = m[1]!;
  const value = parseFloat(raw.replace(/,/g, ""));
  const decimals = raw.includes(".") ? raw.split(".")[1]!.length : 0;
  const v = value * Math.max(0, Math.min(1, k));
  const shown = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
  return final.slice(0, m.index) + (raw.includes(",") || decimals ? shown : shown.replace(/,/g, "")) + final.slice(m.index + raw.length);
}

// ------------------------------------------------------------------ the frame and the camera

const FrameCtx = createContext({ w: 1080, h: 1920 });
export const useFrameSize = () => useContext(FrameCtx);

/** The drawing surface for one directed shot: an SVG the size of the frame, a lens vignette over it. */
export const Stage: React.FC<{ p: SceneProps; bg: string; defs?: React.ReactNode; vignette?: number; children: React.ReactNode }> = ({
  p, bg, defs, vignette = 0.32, children,
}) => {
  const w = p.tl.width, h = p.tl.height;
  return (
    <FrameCtx.Provider value={{ w, h }}>
      <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          {defs ? <defs>{defs}</defs> : null}
          {children}
        </svg>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,6,30,${vignette}) 100%)` }} />
      </AbsoluteFill>
    </FrameCtx.Provider>
  );
};

/** The camera: look at (cx, cy) in frame pixels with a zoom (1 = the whole frame) and a roll in degrees.
 * Push in on the thing being said, pull out for a reveal, dive into a window between shots. */
export const View: React.FC<{ zoom?: number; cx?: number; cy?: number; rot?: number; children: React.ReactNode }> = ({ zoom = 1, cx, cy, rot = 0, children }) => {
  const { w, h } = useFrameSize();
  return <g transform={`translate(${w / 2} ${h / 2}) rotate(${rot}) scale(${zoom}) translate(${-(cx ?? w / 2)} ${-(cy ?? h / 2)})`}>{children}</g>;
};

/** Parallax: a layer that moves `depth` times as much as the camera's pan (0 = sky, 1 = the action). */
export const Layer: React.FC<{ dx?: number; dy?: number; depth: number; children: React.ReactNode }> = ({ dx = 0, dy = 0, depth, children }) => (
  <g transform={`translate(${dx * (1 - depth)} ${dy * (1 - depth)})`}>{children}</g>
);

/** A flash between two shots inside one beat (a cut on a word): white, or the colour of the light. */
export const Flash: React.FC<{ k: number; color?: string }> = ({ k, color = "#ffffff" }) => {
  const { w, h } = useFrameSize();
  return k > 0.001 ? <rect x={0} y={0} width={w} height={h} fill={color} opacity={Math.min(1, k)} /> : null;
};

// ------------------------------------------------------------------ shapes

/** A soft light (a lamp, a screen's glow, a window at night, a spotlight): screen-blended. */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; o?: number; ry?: number }> = ({ x, y, r, color, o = 0.7, ry }) => {
  const id = `fglow-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="0.35" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#${id})`} opacity={Math.max(0, o)} style={{ mixBlendMode: "screen" }} />
    </>
  );
};

/** A rectangle with an ink outline and a painted shadow strip on one side (walls, boxes, counters, signs). */
export const Block: React.FC<{ x: number; y: number; w: number; h: number; fill: string; r?: number; shadow?: "right" | "bottom" | "left" | false; sw?: number; depth?: number; opacity?: number }> = ({
  x, y, w, h, fill, r = 0, shadow = "right", sw = STROKE, depth = 0.22, opacity,
}) => {
  const id = `fblk-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}-${Math.round(h)}-${Math.round(r)}`;
  return (
    <g opacity={opacity}>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={r} /></clipPath></defs>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />
      {shadow ? (
        <g clipPath={`url(#${id})`}>
          {shadow === "right" ? <rect x={x + w * (1 - depth)} y={y} width={w * depth} height={h} fill={shade(fill, -0.18)} /> : null}
          {shadow === "left" ? <rect x={x} y={y} width={w * depth} height={h} fill={shade(fill, -0.18)} /> : null}
          {shadow === "bottom" ? <rect x={x} y={y + h * (1 - depth)} width={w} height={h * depth} fill={shade(fill, -0.18)} /> : null}
        </g>
      ) : null}
      {sw ? <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={INK} strokeWidth={sw} /> : null}
    </g>
  );
};

/** A thick line with an ink edge (limbs, poles, rails, cables). */
export const Limb: React.FC<{ a: [number, number]; b: [number, number]; w: number; color: string; sw?: number }> = ({ a, b, w, color, sw = STROKE }) => (
  <g>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={w + sw * 2} strokeLinecap="round" />
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  </g>
);

/** A round thing with a painted shadow crescent (heads, hands, coins, plants, wheels). */
export const Ball: React.FC<{ x: number; y: number; r: number; fill: string; sw?: number; shadow?: boolean; ry?: number }> = ({ x, y, r, fill, sw = STROKE, shadow = true, ry }) => {
  const id = `fball-${Math.round(x)}-${Math.round(y)}-${Math.round(r)}-${Math.round(ry ?? r)}`;
  const rr = ry ?? r;
  return (
    <g>
      <defs><clipPath id={id}><ellipse cx={x} cy={y} rx={r} ry={rr} /></clipPath></defs>
      <ellipse cx={x} cy={y} rx={r} ry={rr} fill={shadow ? shade(fill, -0.16) : fill} />
      {shadow ? <ellipse cx={x - r * 0.12} cy={y - rr * 0.12} rx={r * 0.96} ry={rr * 0.96} fill={fill} clipPath={`url(#${id})`} /> : null}
      {sw ? <ellipse cx={x} cy={y} rx={r} ry={rr} fill="none" stroke={INK} strokeWidth={sw} /> : null}
    </g>
  );
};

/** Words drawn in the scene (on a sign, a screen, a slate). Figures and labels a viewer must read are at
 * least the frame's minimum size (44 px in a Short, 30 in a long video); small print on a prop is `deco`
 * (the layout probe skips it, nobody has to read it). */
export const Txt: React.FC<{ x: number; y: number; size: number; fill: string; children: React.ReactNode; weight?: number; anchor?: "start" | "middle" | "end"; rotate?: number; glow?: string; stroke?: string; deco?: boolean }> = ({
  x, y, size, fill, children, weight = 800, anchor = "middle", rotate, glow, stroke, deco,
}) => (
  <g data-probe={deco ? "skip" : undefined}>
    <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={size} fill={fill} textAnchor={anchor} dominantBaseline="central"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={glow ? { filter: `drop-shadow(0 0 ${size * 0.25}px ${glow})` } : undefined}
      stroke={stroke} strokeWidth={stroke ? size * 0.08 : undefined} paintOrder="stroke fill">
      {children}
    </text>
  </g>
);

// ------------------------------------------------------------------ things that carry figures

/** A label on a thing (a price tag, a stamp, "$139 / YEAR"): bold text on a coloured tab with a drop shadow.
 * `k` (0..1) stamps it in: it lands from big to its size. */
export const Tag: React.FC<{ x: number; y: number; w: number; h: number; text: string; rot?: number; size?: number; bg?: string; fg?: string; k?: number }> = ({
  x, y, w, h, text, rot = 0, size, bg = "#ffc43d", fg = INK, k = 1,
}) => {
  if (k <= 0) return null;
  const s = 1 + (1 - Math.min(1, k)) * 1.3;
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) rotate(${rot}) translate(${-cx} ${-cy})`}>
      <rect x={x + 8} y={y + 10} width={w} height={h} rx={12} fill={shade(bg, -0.35)} />
      <rect x={x} y={y} width={w} height={h} rx={12} fill={bg} stroke={INK} strokeWidth={STROKE} />
      <Txt x={cx} y={cy + 2} size={size ?? h * 0.6} fill={fg}>{text}</Txt>
    </g>
  );
};

/** A coin; `spin` (0..1, e.g. |cos(t/4)|) squashes it as it turns. */
export const Coin: React.FC<{ x: number; y: number; r?: number; tilt?: number; spin?: number }> = ({ x, y, r = 34, tilt = 0, spin = 0.85 }) => {
  const sq = Math.max(0.12, spin);
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <ellipse cx={x + r * 0.12 * sq} cy={y} rx={r * sq} ry={r} fill="#c9952a" stroke={INK} strokeWidth={4} />
      <ellipse cx={x} cy={y} rx={r * sq} ry={r} fill="#f5c542" stroke={INK} strokeWidth={4} />
      <ellipse cx={x} cy={y} rx={r * 0.62 * sq} ry={r * 0.62} fill="none" stroke="#ffe08a" strokeWidth={5} />
    </g>
  );
};

/** A bundle of notes. */
export const Cash: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({ x, y, w = 64, color = "#3a9d5d" }) => (
  <g>
    <rect x={x} y={y} width={w} height={w * 0.32} rx={3} fill={color} stroke={INK} strokeWidth={3} />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={w * 0.32} fill="#f4f1e8" />
  </g>
);

/** A phone notification / receipt line card: an icon square, a title, a small line, an amount. */
export const Card: React.FC<{ x: number; y: number; w?: number; h?: number; title: string; sub?: string; amount?: string; icon?: string; rot?: number }> = ({
  x, y, w = 400, h = 92, title, sub, amount, icon = "#e50914", rot = 0,
}) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 6} y={y + 8} width={w} height={h} rx={16} fill="#000" opacity={0.25} />
    <rect x={x} y={y} width={w} height={h} rx={16} fill="#ffffff" stroke={INK} strokeWidth={5} />
    <rect x={x + h * 0.17} y={y + h * 0.17} width={h * 0.66} height={h * 0.66} rx={h * 0.15} fill={icon} />
    <rect x={x + h * 0.3} y={y + h * 0.35} width={h * 0.4} height={h * 0.28} rx={4} fill="#ffffff" />
    <Txt x={x + h} y={y + h * 0.37} size={h * 0.33} fill={INK} anchor="start" deco>{title}</Txt>
    {sub ? <Txt x={x + h} y={y + h * 0.72} size={h * 0.22} fill="#6b6880" weight={600} anchor="start" deco>{sub}</Txt> : null}
    {amount ? <Txt x={x + w - h * 0.18} y={y + h * 0.52} size={h * 0.35} fill={icon} anchor="end" deco>{amount}</Txt> : null}
  </g>
);

/** A glowing display (an LED counter, a billboard, a scoreboard): a label line and a big figure. */
export const Display: React.FC<{ x: number; y: number; w: number; h: number; label?: string; value: string; color?: string; bg?: string; k?: number }> = ({
  x, y, w, h, label, value, color = "#4dff9a", bg = "#0b0f14", k = 1,
}) => (
  <g opacity={Math.min(1, Math.max(0, k))}>
    <Glow x={x + w / 2} y={y + h / 2} r={w * 0.7} color={color} o={0.25 * k} />
    <Block x={x} y={y} w={w} h={h} fill={bg} r={10} shadow={false} />
    {label ? <Txt x={x + w / 2} y={y + h * 0.25} size={h * 0.18} fill={color} weight={700} glow={color} deco>{label}</Txt> : null}
    <Txt x={x + w / 2} y={label ? y + h * 0.63 : y + h / 2} size={h * (label ? 0.52 : 0.62)} fill={color} glow={color}>{value}</Txt>
  </g>
);

/** A window onto a city (night: lit windows, moon; day: sky). A cheap way to say "in a city" inside a room. */
export const CityWindow: React.FC<{ x: number; y: number; w: number; h: number; night?: boolean; seed?: string }> = ({ x, y, w, h, night = true, seed = "win" }) => {
  const r = rng(seed);
  const id = `fwin-${Math.round(x)}-${Math.round(y)}`;
  const sky: [string, string] = night ? ["#0d1240", "#3a2b78"] : ["#7cc4ff", "#d8f0ff"];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
      </defs>
      {night ? <Glow x={x + w / 2} y={y + h / 2} r={w * 0.9} color="#6f8cff" o={0.35} /> : null}
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={6} fill="#e8e1d4" stroke={INK} strokeWidth={STROKE} />
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-g)`} />
        <circle cx={x + w * 0.75} cy={y + h * 0.2} r={w * 0.08} fill={night ? "#fff3c4" : "#ffe58a"} />
        {Array.from({ length: 7 }).map((_, i) => {
          const bw = w / 6, bh = h * (0.3 + r() * 0.45), bx = x + i * bw - bw * 0.3;
          return (
            <g key={i}>
              <rect x={bx} y={y + h - bh} width={bw * 0.9} height={bh} fill={night ? (i % 2 ? "#1c1846" : "#251f58") : (i % 2 ? "#8aa3c7" : "#a3b8d6")} />
              {Array.from({ length: Math.floor(bh / 26) }).map((__, k) =>
                [0, 1].map((c) => {
                  const v = r();
                  const lit = night ? (v < 0.4 ? "#8fd0ff" : v < 0.65 ? "#ffd27a" : "#141238") : "#dfe9f5";
                  return <rect key={`${k}-${c}`} x={bx + 8 + c * bw * 0.4} y={y + h - bh + 12 + k * 26} width={bw * 0.2} height={12} fill={lit} />;
                }),
              )}
            </g>
          );
        })}
      </g>
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#e8e1d4" strokeWidth={10} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

// ------------------------------------------------------------------ isometric blocks (a city from above, a warehouse, a stack of floors)

/** An isometric projection centred on (cx, cy) with `k` pixels per unit: iso(x, y, z) → [px, py]. */
export const isoProjector = (cx: number, cy: number, k: number) => (x: number, y: number, z: number): [number, number] =>
  [cx + (x - y) * 0.866 * k, cy + (x + y) * 0.5 * k - z * k];
export const pts = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");

/** One isometric building: front-left and front-right walls with windows, a roof. `lit(i)` says whether
 * window i is on (light waves across a city, a building switching off). Draw back to front (sort by x0+y0). */
export const IsoBlock: React.FC<{
  iso: (x: number, y: number, z: number) => [number, number];
  x0: number; y0: number; w: number; d: number; h: number; color: string; roof?: string; seed: string;
  cols?: number; lit?: (i: number) => boolean;
}> = ({ iso, x0, y0, w, d, h, color, roof = "#2c2a52", seed, cols = 3, lit }) => {
  const x1 = x0 + w, y1 = y0 + d;
  const r = rng(seed);
  const rows = Math.max(2, Math.floor(h * 1.1));
  const quads: React.ReactNode[] = [];
  let i = 0;
  for (let rI = 0; rI < rows; rI++)
    for (let cI = 0; cI < cols; cI++)
      for (const face of [0, 1]) {
        const v = r();
        const on = lit ? lit(i) : true;
        i++;
        const col = on ? (v < 0.42 ? "#9fdcff" : v < 0.68 ? "#ffd27a" : "#1a1838") : "#1a1838";
        const u0 = (cI + 0.25) / cols, u1 = (cI + 0.75) / cols, v0 = (rI + 0.25) / rows, v1 = (rI + 0.7) / rows;
        const q: [number, number][] = face === 0
          ? [iso(x0 + u0 * w, y1, v0 * h), iso(x0 + u1 * w, y1, v0 * h), iso(x0 + u1 * w, y1, v1 * h), iso(x0 + u0 * w, y1, v1 * h)]
          : [iso(x1, y0 + u0 * d, v0 * h), iso(x1, y0 + u1 * d, v0 * h), iso(x1, y0 + u1 * d, v1 * h), iso(x1, y0 + u0 * d, v1 * h)];
        quads.push(<polygon key={`${rI}-${cI}-${face}`} points={pts(q)} fill={col} />);
      }
  return (
    <g>
      <polygon points={pts([iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h)])} fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <polygon points={pts([iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h)])} fill={shade(color, -0.3)} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {quads}
      <polygon points={pts([iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h)])} fill={roof} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

// ------------------------------------------------------------------ the source line

/** "Data: <source> · <month>" (a hard rule for sourced facts), drawn once a video: only on the beat
 * `showsSource(p)` picks. Small, top of the frame under the logo row, never in the caption zone. */
export const SourceLine: React.FC<{ p: SceneProps; y?: number }> = ({ p, y }) => {
  const { w, h } = { w: p.tl.width, h: p.tl.height };
  const line = useMemo(() => (showsSource(p) ? p.tl.sources : undefined), [p]);
  if (!line) return null;
  const v = h > w;
  const size = v ? 44 : 30;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y ?? (v ? 190 : 70), display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color: "#fff", background: "rgba(10,12,24,0.62)", padding: "6px 22px", borderRadius: 999, whiteSpace: "nowrap" }}>{line}</div>
    </div>
  );
};
