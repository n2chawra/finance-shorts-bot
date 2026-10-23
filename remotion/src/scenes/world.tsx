/**
 * World scenes (the visual kit of 2026-10-18, after studying the top animated finance channels):
 *
 *   prop      a money prop carrying the figure, in a place (a cheque in front of the bank, an anvil
 *             stamped with the rate crushing a card in the kitchen, a price tag in the shop)
 *   screen    a chart that draws itself on a wall screen in the office, led by a dot, with labelled
 *             callouts and a source credit
 *   equation  icons with operators between them: a house plus cash "<" one person
 *   kinetic   a short phrase typed in letter by letter on a brand card, or a statement box over a place
 *   source    the evidence: a drawn document card (publisher, title, the sourced sentences), the
 *             spoken sentence highlighted as it is read, marker marks (`pen`) on top (2026-10-19, after
 *             studying Casual Finance). Our own drawing of the fact, never a copy of the page.
 *
 * Every scene takes an optional `presenter` (a cast member): in a Short it stands in the bottom
 * part of the frame and talks (lip-sync when the beat's speaker is them) while the graphic plays
 * above; in a long video they stand at the side. Figures are Python's strings; count-ups only fill
 * the frames before they land.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { evolvePath } from "@remotion/paths";
import { FONT } from "../design/fonts";
import { Pattern, type PatternKind } from "../design/texture";
import { type Box, Marks, type MarkSpec } from "../fx/marks";
import { MONEY_PROPS, type MoneyPropName, WallScreen } from "../props/money";
import { WORLDS, type SkylineName, type WorldName } from "../worlds/worlds";
import { Actor, type ActorSpec, at, clamp, counted, ease, easeOut, pop, type SceneProps, sec } from "./kit";

// ---------------- layout ----------------

interface Area { x: number; y: number; w: number; h: number }

/** Where the graphic goes: a Short with a presenter keeps the bottom part for them. */
function area(p: SceneProps, presenter: boolean): Area {
  const { width: w, height: h } = p.tl;
  if (h > w) return presenter ? { x: 0, y: 160, w, h: 1020 } : { x: 0, y: 200, w, h: 1300 };
  return presenter ? { x: 0, y: 0, w: w * 0.7, h } : { x: 0, y: 0, w, h };
}

/** The presenter: a cast member at the bottom of a Short (waist up) or the side of a long video. */
const Presenter: React.FC<{ p: SceneProps; spec: ActorSpec }> = ({ p, spec }) => {
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const s: ActorSpec = v ? { scale: 1.9, ...spec, x: spec.x ?? 0.5 } : { scale: 1.25, ...spec, x: spec.x ?? 0.84 };
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      {v && <rect x={0} y={1180} width={w} height={h - 1180} fill="rgba(0,0,0,0.12)" />}
      <Actor p={p} spec={s} ground={v ? h + 470 : h * 0.97} index={0} />
    </svg>
  );
};

const World: React.FC<{ p: SceneProps; name?: string; city?: string; night?: boolean; pattern?: string }> = ({ p, name, city, night, pattern }) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const W = name ? WORLDS[name as WorldName] : undefined;
  if (!W) return <Pattern kind={(pattern ?? "grid") as PatternKind} pal={pal} w={w} h={h} t={sec(p)} id={p.beat.id} />;
  const v = h > w;
  return <W w={w} h={h} ground={v ? h * 0.68 : h * 0.86} t={sec(p)} night={night} seed={p.beat.id} city={city as SkylineName | undefined} />;
};

const Caption: React.FC<{ text: string; p: SceneProps; start: number; x: number; y: number; width: number; size: number; color: string; bg?: string; weight?: number }> =
  ({ text, p, start, x, y, width, size, color, bg, weight = 800 }) => {
    const k = p.beat.from === 0 && start < 0.05 ? 1 : pop(p, start, 12, 160);
    return (
      <div style={{ position: "absolute", left: x, top: y, width, textAlign: "center", opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})` }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.1, color,
          background: bg, padding: bg ? `${size * 0.22}px ${size * 0.5}px` : undefined, borderRadius: bg ? size * 0.4 : undefined,
          boxShadow: bg ? "0 14px 36px rgba(0,0,0,0.22)" : undefined, textShadow: bg ? undefined : "0 4px 18px rgba(0,0,0,0.35)" }}>{text}</span>
      </div>
    );
  };

// ---------------- prop ----------------

interface PropParams {
  world?: string; city?: string; night?: boolean; pattern?: string; prop: MoneyPropName;
  text?: string; value?: number; label?: string; kicker?: string; sub?: string; at?: string; fill?: number; level?: number;
  presenter?: ActorSpec;
}

export const PropScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as PropParams;
  const v = h > w, A = area(p, !!P.presenter);
  // the prop arrives with the beat; its action (a coin dropping, an anvil landing, pages flipping,
  // the figure counting up) lands on `at`
  const start = at(p, P.at, 0.35);
  const k = p.beat.from === 0 ? 1 : pop(p, 0.1, 11, 120);
  const Prop = MONEY_PROPS[P.prop] ?? MONEY_PROPS.cheque;
  // a counted figure is hidden until `at`, never a "0" sitting there while the voice says the number
  // (L-20261021-01); on the video's first frame it shows in full, the hook's stake
  const text = P.text !== undefined && P.value !== undefined
    ? (p.beat.from === 0 && start <= 0.35 ? P.text : sec(p) < start ? undefined : counted(p, P.value, P.text, start, start + 0.9))
    : P.text;
  const s = v ? (P.presenter ? 700 : 820) : 520, fs = v ? 112 : 84;
  const cx = A.x + A.w / 2, cy = A.y + A.h * (P.kicker ? (v ? 0.56 : 0.6) : 0.5) + (1 - easeOut(k)) * 160;
  const kick = v ? 64 : 56;
  return (
    <AbsoluteFill>
      <World p={p} name={P.world} city={P.city} night={P.night} pattern={P.pattern} />
      {P.kicker && <Caption text={P.kicker} p={p} start={0} x={A.x + 60} y={A.y + (v ? 10 : 60)} width={A.w - 120} size={kick} color={pal.text} bg={pal.panel} weight={800} />}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${cx},${cy})`} opacity={Math.min(1, k * 3)}>
          <ellipse cx={0} cy={s * 0.48} rx={s * 0.42} ry={s * 0.06} fill="rgba(0,0,0,0.18)" opacity={k} />
          <Prop s={s} k={k} t={sec(p) - start + 0.6} pal={pal} text={text} label={P.label} fs={fs} hit={0.6} fill={P.fill} level={P.level} />
        </g>
      </svg>
      {P.sub && <Caption text={P.sub} p={p} start={start + 0.6} x={A.x + 60} y={A.y + A.h - (v ? 150 : 170)} width={A.w - 120} size={v ? 56 : 46} color={pal.text} bg={pal.panel} weight={700} />}
      {P.presenter && <Presenter p={p} spec={P.presenter} />}
    </AbsoluteFill>
  );
};

// ---------------- screen ----------------

interface Series { x: number[]; y: number[] }
interface ScreenParams {
  world?: string; city?: string; night?: boolean; series: Series; series2?: Series; label1?: string; label2?: string; title?: string;
  source?: string; callouts?: { at?: string; x: number; text: string; series?: 1 | 2 }[]; drawFrom?: string; drawTo?: string; presenter?: ActorSpec;
  pen?: MarkSpec[];
}

export const ScreenScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as ScreenParams;
  const v = h > w, A = area(p, !!P.presenter), t = sec(p);
  const sw = v ? 900 : Math.min(1180, A.w - 220), sh = v ? 640 : 600;
  const sx = A.x + (A.w - sw) / 2, sy = A.y + (v ? 190 : 170);
  const pad = { l: 60, r: 60, t: 130, b: 70 };
  const all = [...P.series.y, ...(P.series2?.y ?? [])];
  const ymax = Math.max(1, ...all) * 1.08, xmax = Math.max(1, P.series.x[P.series.x.length - 1] ?? 1);
  const X = (x: number) => pad.l + (sw - pad.l - pad.r) * (x / xmax), Y = (y: number) => sh - pad.b - (sh - pad.t - pad.b) * (y / ymax);
  const path = (s: Series) => s.x.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(s.y[i]!).toFixed(1)}`).join(" ");
  const a = at(p, P.drawFrom, 0.6), b = at(p, P.drawTo, Math.max(a + 2, p.beat.frames / p.fps - 0.8));
  const prog = ease((t - a) / (b - a));
  const lines = [P.series, P.series2].filter(Boolean) as Series[];
  // the first series is the bad news (what you owe), the second the good (what you paid, what you keep)
  const colors = [pal.danger, pal.cast[0]!];
  const kScreen = pop(p, 0, 13, 130);
  const fs = v ? 46 : 32;
  return (
    <AbsoluteFill>
      <World p={p} name={P.world ?? "office"} city={P.city} night={P.night} />
      {P.title && <Caption text={P.title} p={p} start={0.15} x={A.x + 40} y={A.y + (v ? 10 : 30)} width={A.w - 80} size={v ? 60 : 54} color={pal.text} bg={pal.panel} />}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${sx},${sy + (1 - kScreen) * 60})`}>
          <WallScreen sw={sw} sh={sh} k={kScreen}>
            {Array.from({ length: 5 }, (_, i) => <line key={i} x1={pad.l} x2={sw - pad.r} y1={pad.t + i * (sh - pad.t - pad.b) / 4} y2={pad.t + i * (sh - pad.t - pad.b) / 4} stroke="#24365a" strokeWidth={2} />)}
            {lines.map((s, i) => {
              const d = path(s), ev = evolvePath(prog, d);
              const n = Math.min(s.x.length - 1, Math.floor(prog * (s.x.length - 1)));
              return <g key={i}>
                <path d={d} fill="none" stroke={colors[i]} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
                {prog > 0 && <circle cx={X(s.x[n]!)} cy={Y(s.y[n]!)} r={16} fill={colors[i]} stroke="#ffffff" strokeWidth={5} />}
              </g>;
            })}
          </WallScreen>
          {[P.label1, P.label2].map((l, i) => l && (
            <g key={i} opacity={kScreen}>
              <rect x={i ? sw - 34 - l.length * fs * 0.58 - 30 : 30} y={28} width={l.length * fs * 0.58 + 30} height={fs * 1.4} rx={fs * 0.7} fill={colors[i]} />
              <text x={i ? sw - 34 - (l.length * fs * 0.58 + 30) / 2 : 30 + (l.length * fs * 0.58 + 30) / 2} y={28 + fs * 0.72} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill="#ffffff">{l}</text>
            </g>
          ))}
          {(P.callouts ?? []).map((c, i) => {
            const s = (c.series === 2 ? P.series2 : P.series) ?? P.series;
            const idx = Math.min(s.x.length - 1, Math.round(clamp(c.x) * (s.x.length - 1)));
            const k = pop(p, at(p, c.at, a + (b - a) * clamp(c.x)), 12, 150);
            const px = X(s.x[idx]!), py = Y(s.y[idx]!), cf = v ? 54 : 42, cw = c.text.length * cf * 0.6 + 36;
            const lx = Math.min(sw - cw / 2 - 20, Math.max(cw / 2 + 20, px + 60)), ly = py < sh * 0.55 ? py + 130 : py - 110;
            return <g key={i} opacity={clamp(k * 2)} transform={`translate(0,${(1 - k) * 20})`}>
              <line x1={px} y1={py} x2={lx} y2={ly} stroke="#ffffff" strokeWidth={5} strokeDasharray="10 8" />
              <rect x={lx - cw / 2} y={ly - cf * 0.75} width={cw} height={cf * 1.5} rx={cf * 0.4} fill="#ffffff" />
              <text x={lx} y={ly + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={800} fontSize={cf} fill="#121826">{c.text}</text>
            </g>;
          })}
          {P.source && <text x={0} y={sh + (v ? 150 : 120)} fontFamily={FONT} fontWeight={600} fontSize={fs} fill={pal.muted}>{P.source}</text>}
          <Marks p={p} marks={P.pen} box={{ x: pad.l, y: pad.t, w: sw - pad.l - pad.r, h: sh - pad.t - pad.b }} ink="#ffffff" />
        </g>
      </svg>
      {P.presenter && <Presenter p={p} spec={P.presenter} />}
    </AbsoluteFill>
  );
};

// ---------------- equation ----------------

const ICONS: Record<string, (s: number, c: string) => React.ReactNode> = {
  house: (s, c) => <g><path d={`M${-s * 0.45},${-s * 0.02} L0,${-s * 0.42} L${s * 0.45},${-s * 0.02}Z`} fill="#e76f51" /><rect x={-s * 0.34} y={-s * 0.04} width={s * 0.68} height={s * 0.42} fill={c} /><rect x={-s * 0.08} y={s * 0.12} width={s * 0.16} height={s * 0.26} fill="#8d5524" /></g>,
  person: (s, c) => <g fill={c}><circle cy={-s * 0.25} r={s * 0.14} /><rect x={-s * 0.17} y={-s * 0.08} width={s * 0.34} height={s * 0.46} rx={s * 0.12} /></g>,
  family: (s, c) => <g fill={c}>{[-0.24, 0.1].map((x, i) => <g key={i}><circle cx={s * x} cy={-s * 0.25} r={s * 0.11} /><rect x={s * x - s * 0.13} y={-s * 0.1} width={s * 0.26} height={s * 0.46} rx={s * 0.1} /></g>)}
    <circle cx={s * 0.34} cy={-s * 0.02} r={s * 0.08} /><rect x={s * 0.25} y={s * 0.08} width={s * 0.18} height={s * 0.28} rx={s * 0.07} /></g>,
  car: (s, c) => <g><rect x={-s * 0.44} y={-s * 0.08} width={s * 0.88} height={s * 0.26} rx={s * 0.08} fill={c} /><path d={`M${-s * 0.26},${-s * 0.08} L${-s * 0.14},${-s * 0.3} L${s * 0.16},${-s * 0.3} L${s * 0.28},${-s * 0.08}Z`} fill={c} />
    <circle cx={-s * 0.24} cy={s * 0.2} r={s * 0.1} fill="#1f2937" /><circle cx={s * 0.24} cy={s * 0.2} r={s * 0.1} fill="#1f2937" /></g>,
  coffee: (s, c) => <g><path d={`M${-s * 0.24},${-s * 0.2} L${s * 0.24},${-s * 0.2} L${s * 0.18},${s * 0.34} L${-s * 0.18},${s * 0.34}Z`} fill={c} /><rect x={-s * 0.28} y={-s * 0.3} width={s * 0.56} height={s * 0.1} rx={s * 0.04} fill="#6b4226" /></g>,
  cash: (s) => <g>{[0, 1, 2].map((i) => <g key={i} transform={`translate(0,${-i * s * 0.1})`}><rect x={-s * 0.42} y={-s * 0.1} width={s * 0.84} height={s * 0.2} rx={s * 0.03} fill="#3fae6a" stroke="#2a7d4b" strokeWidth={4} /><circle r={s * 0.05} fill="#9fe0b4" /></g>)}</g>,
  card: (s) => <g><rect x={-s * 0.42} y={-s * 0.26} width={s * 0.84} height={s * 0.52} rx={s * 0.06} fill="#3b5bdb" /><rect x={-s * 0.32} y={-s * 0.1} width={s * 0.16} height={s * 0.12} rx={s * 0.02} fill="#ffd34d" /></g>,
  cart: (s, c) => <g><path d={`M${-s * 0.42},${-s * 0.3} L${-s * 0.3},${-s * 0.3} L${-s * 0.2},${s * 0.14} L${s * 0.34},${s * 0.14} L${s * 0.42},${-s * 0.18} L${-s * 0.26},${-s * 0.18}`} fill="none" stroke={c} strokeWidth={s * 0.06} strokeLinejoin="round" />
    <circle cx={-s * 0.14} cy={s * 0.28} r={s * 0.07} fill={c} /><circle cx={s * 0.26} cy={s * 0.28} r={s * 0.07} fill={c} /></g>,
  piggy: (s) => <g><ellipse rx={s * 0.4} ry={s * 0.3} fill="#f6a3b5" /><ellipse cx={s * 0.38} rx={s * 0.09} ry={s * 0.08} fill="#f08ca4" /><rect x={-s * 0.07} y={-s * 0.31} width={s * 0.14} height={s * 0.03} fill="#a04b62" /></g>,
  clock: (s, c) => <g><circle r={s * 0.38} fill="#ffffff" stroke={c} strokeWidth={s * 0.06} /><path d={`M0,0 L0,${-s * 0.24} M0,0 L${s * 0.16},${s * 0.06}`} stroke={c} strokeWidth={s * 0.05} strokeLinecap="round" /></g>,
  chartup: (s, c) => <g><path d={`M${-s * 0.4},${s * 0.3} L${-s * 0.12},${0} L${s * 0.08},${s * 0.12} L${s * 0.4},${-s * 0.3}`} fill="none" stroke={c} strokeWidth={s * 0.08} strokeLinecap="round" strokeLinejoin="round" /><path d={`M${s * 0.22},${-s * 0.32} L${s * 0.42},${-s * 0.32} L${s * 0.42},${-s * 0.12}`} fill="none" stroke={c} strokeWidth={s * 0.08} strokeLinecap="round" /></g>,
  chartdown: (s, c) => <g><path d={`M${-s * 0.4},${-s * 0.3} L${-s * 0.12},${0} L${s * 0.08},${-s * 0.12} L${s * 0.4},${s * 0.3}`} fill="none" stroke={c} strokeWidth={s * 0.08} strokeLinecap="round" strokeLinejoin="round" /></g>,
  gift: (s, c) => <g><rect x={-s * 0.34} y={-s * 0.12} width={s * 0.68} height={s * 0.46} fill={c} /><rect x={-s * 0.38} y={-s * 0.26} width={s * 0.76} height={s * 0.16} fill={c} /><rect x={-s * 0.05} y={-s * 0.26} width={s * 0.1} height={s * 0.6} fill="#ffd34d" /></g>,
  plane: (s, c) => <g fill={c}><path d={`M${-s * 0.42},${s * 0.02} L${s * 0.36},${-s * 0.06} Q${s * 0.46},${-s * 0.04} ${s * 0.36},${s * 0.04}Z`} /><path d={`M${-s * 0.02},${-s * 0.02} L${s * 0.12},${-s * 0.34} L${s * 0.2},${-s * 0.32} L${s * 0.14},${0}Z`} /><path d={`M${-s * 0.02},${s * 0.02} L${s * 0.12},${s * 0.3} L${s * 0.2},${s * 0.28} L${s * 0.14},${0}Z`} /></g>,
};

interface EquationParams { items: { icon: string; label?: string; text?: string; value?: number; at?: string }[]; ops?: string[]; title?: string; pattern?: string; world?: string; presenter?: ActorSpec }

export const EquationScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as EquationParams;
  const v = h > w, A = area(p, !!P.presenter), t = sec(p);
  const n = P.items.length, grid = v && n >= 4, size = grid ? 230 : v ? (n > 2 ? 260 : 320) : 280;
  const gap = v ? (A.h - 120) / Math.max(1, n) : A.w / (n + 0.4);
  // a Short with four or more items: a 2-column grid, labels under the icons, no operators
  const pos = (i: number) => grid ? { x: A.x + A.w * (0.28 + 0.44 * (i % 2)), y: A.y + 300 + Math.floor(i / 2) * 430 }
    : v ? { x: A.x + A.w / 2, y: A.y + 120 + gap * (i + 0.45) } : { x: A.x + gap * (i + 0.7), y: A.y + A.h * 0.48 };
  const below = !v || grid;
  return (
    <AbsoluteFill>
      <World p={p} name={P.world} pattern={P.pattern ?? "rays"} />
      {P.title && <Caption text={P.title} p={p} start={0.1} x={A.x + 40} y={A.y + (v ? 0 : 60)} width={A.w - 80} size={v ? 62 : 56} color={pal.text} bg={pal.panel} />}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {P.items.map((it, i) => {
          const start = at(p, it.at, 0.3 + i * 0.6), k = pop(p, start, 10, 150), c = pos(i);
          const text = it.text !== undefined && it.value !== undefined ? counted(p, it.value, it.text, start, start + 0.9) : it.text;
          const bob = Math.sin(t * 2 + i) * 6 * k;
          const icon = ICONS[it.icon] ?? ICONS.cash!;
          return <g key={i} transform={`translate(${c.x},${c.y + bob})`} opacity={clamp(k * 2)}>
            <g transform={`scale(${0.4 + 0.6 * k})`}>{icon(size, pal.cast[i % 3]!)}</g>
            {text && <text x={below ? 0 : size * 0.75} y={below ? size * 0.62 : -size * 0.06} textAnchor={below ? "middle" : "start"} fontFamily={FONT} fontWeight={800} fontSize={v ? 76 : 64} fill={pal.text}>{text}</text>}
            {it.label && <text x={below ? 0 : size * 0.75} y={below ? size * 0.62 + (text ? 80 : 0) : size * 0.2} textAnchor={below ? "middle" : "start"} fontFamily={FONT} fontWeight={700} fontSize={v ? 56 : 38} fill={pal.text}>{it.label}</text>}
          </g>;
        })}
        {(grid ? [] : P.ops ?? []).slice(0, n - 1).map((op, i) => {
          const a = pos(i), b = pos(i + 1), start = at(p, P.items[i + 1]?.at, 0.3 + (i + 1) * 0.6) - 0.25, k = pop(p, start, 9, 180);
          const x = v ? a.x - size * 0.6 : (a.x + b.x) / 2, y = v ? (a.y + b.y) / 2 : a.y;
          return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={(v ? 110 : 130) * (0.5 + 0.5 * k)}
            fill={pal.accent} opacity={clamp(k * 2)}>{op}</text>;
        })}
      </svg>
      {P.presenter && <Presenter p={p} spec={P.presenter} />}
    </AbsoluteFill>
  );
};

// ---------------- kinetic text ----------------

interface KineticParams { mode?: "type" | "box"; lines: { text: string; at?: string }[]; world?: string; city?: string; night?: boolean; presenter?: ActorSpec }

export const KineticScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as KineticParams;
  const v = h > w, A = area(p, !!P.presenter), t = sec(p);
  const mode = P.mode ?? "type";
  const size = mode === "type" ? (v ? 96 : 104) : (v ? 70 : 64);
  const blockH = P.lines.length * size * 1.2;
  const top = A.y + (A.h - blockH) / 2;
  if (mode === "type") {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${pal.bg}, ${pal.bgBottom})` }}>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {Array.from({ length: 9 }, (_, i) => {
            const y = (i / 9) * h + 30, len = 260 + (i * 97) % 380, speed = 60 + (i % 4) * 30;
            const x = ((i * 211 + t * speed) % (w + len)) - len;
            return <rect key={i} x={x} y={y} width={len} height={v ? 64 : 54} rx={32} fill={pal.panel} opacity={0.55} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: A.x + 60, top: A.y, width: A.w - 120, height: A.h, display: "flex", flexDirection: "column", justifyContent: "center", gap: size * 0.15 }}>
          {P.lines.map((l, i) => {
            const start = at(p, l.at, 0.2 + i * 0.5);
            const chars = p.beat.from === 0 && start < 0.05 ? l.text.length : Math.max(0, Math.floor((t - start) * 24));
            const shown = l.text.slice(0, chars);
            return <div key={i} style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.08, color: i % 2 ? pal.accent : pal.text,
              letterSpacing: -1, textTransform: "uppercase", minHeight: size * 1.08 }}>
              {shown}{chars < l.text.length && t > start && <span style={{ opacity: Math.floor(t * 4) % 2 ? 0.9 : 0.2, color: pal.accent }}>|</span>}
            </div>;
          })}
        </div>
        {P.presenter && <Presenter p={p} spec={P.presenter} />}
      </AbsoluteFill>
    );
  }
  // the video's first frame is its thumbnail in the feed: a box due at the start is already there
  const first = (s: number) => p.beat.from === 0 && s < 0.05;
  const k0 = at(p, P.lines[0]?.at, 0.25), k = first(k0) ? 1 : pop(p, k0, 12, 150);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(5px)", transform: "scale(1.04)" }}><World p={p} name={P.world ?? "city"} city={P.city} night={P.night} /></AbsoluteFill>
      <div style={{ position: "absolute", left: A.x + (v ? 60 : A.w * 0.12), top: top - size * 0.6, width: A.w - (v ? 120 : A.w * 0.24), padding: `${size * 0.55}px ${size * 0.6}px`,
        background: "#ffffff", borderRadius: size * 0.5, boxShadow: "0 30px 80px rgba(0,0,0,0.3)", opacity: clamp(k * 2), transform: `scale(${0.8 + 0.2 * k}) rotate(${(1 - k) * -2}deg)` }}>
        {P.lines.map((l, i) => {
          const ls = at(p, l.at, 0.3 + i * 0.35), kl = first(ls) ? 1 : pop(p, ls, 12, 160);
          return <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.12, color: i === P.lines.length - 1 ? pal.danger : "#121826",
            textAlign: "center", textTransform: "uppercase", opacity: clamp(kl * 2), transform: `translateY(${(1 - kl) * 24}px)` }}>{l.text}</div>;
        })}
      </div>
      {P.presenter && <Presenter p={p} spec={P.presenter} />}
    </AbsoluteFill>
  );
};


// ---------------- source ----------------

interface SourceLine { text: string; highlight?: boolean; underline?: boolean; at?: string }
interface SourceParams {
  publisher: string; title?: string; lines: SourceLine[]; pen?: MarkSpec[];
  world?: string; pattern?: string; presenter?: ActorSpec;
}

/** Initials for the publisher's badge: "Bureau of Labor Statistics" -> "BLS". */
const initials = (s: string) => s.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join("").slice(0, 4) || s.slice(0, 2).toUpperCase();

export const SourceScene: React.FC<SceneProps> = (p) => {
  const { width: w, height: h, palette: pal } = p.tl;
  const P = p.beat.params as unknown as SourceParams;
  const v = h > w, A = area(p, !!P.presenter), t = sec(p), dur = p.beat.frames / p.fps;
  const k = p.beat.from === 0 ? 1 : pop(p, 0, 13, 120);
  const cw = v ? A.w - 100 : Math.min(1180, A.w - 160);
  const cx = A.x + (A.w - cw) / 2, cy = A.y + (v ? 30 : 70);
  const ch = v ? A.h - 60 : A.h - 140;
  const fsT = v ? 58 : 50, fsB = v ? 48 : 36, fsP = v ? 44 : 32;
  // the page drifts up a little while it is read, as if scrolled
  const drift = -easeOut(t / Math.max(1, dur)) * (v ? 50 : 36);
  const ink = "#16202e";
  const markBox: Box = { x: 0, y: 0, w: cw, h: ch };
  return (
    <AbsoluteFill>
      <World p={p} name={P.world} pattern={P.pattern ?? "grid"} />
      <div style={{ position: "absolute", left: cx, top: cy + (1 - easeOut(k)) * 120, width: cw, height: ch, opacity: clamp(k * 2),
        transform: `rotate(${v ? -0.6 : -0.8}deg)`, background: "#ffffff", borderRadius: 18, boxShadow: "0 30px 80px rgba(0,0,0,0.32)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: drift, width: cw, padding: v ? "44px 50px" : "40px 56px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: v ? 26 : 22, paddingBottom: v ? 22 : 18, borderBottom: "3px solid #e3e8ef" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: fsP * 1.8, height: fsP * 1.5, padding: "0 10px",
              borderRadius: 10, background: "#1d3557", color: "#ffffff", fontFamily: FONT, fontWeight: 800, fontSize: fsP }}>{initials(P.publisher)}</span>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: fsP, color: "#3b4656" }}>{P.publisher}</span>
          </div>
          {P.title && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: fsT, lineHeight: 1.15, color: ink, marginBottom: v ? 26 : 22 }}>{P.title}</div>}
          {P.lines.map((l, i) => {
            const start = at(p, l.at, 0.5 + i * 0.9);
            const sweep = l.highlight ? clamp((t - start) / 0.9) : 0;
            // a marker underline drawn under the words themselves (every wrapped line), after the highlight
            const under = l.underline ? clamp((t - start - (l.highlight ? 0.7 : 0)) / 0.6) : 0;
            return <div key={i} style={{ marginBottom: v ? 22 : 16 }}>
              <span style={{ fontFamily: FONT, fontWeight: l.highlight ? 600 : 500, fontSize: fsB, lineHeight: 1.42, color: l.highlight ? ink : "#556070",
                backgroundImage: `linear-gradient(${pal.danger}, ${pal.danger}), linear-gradient(#ffe066, #ffe066)`, backgroundRepeat: "no-repeat",
                backgroundSize: `${under * 100}% ${v ? 7 : 5}px, ${sweep * 100}% 88%`, backgroundPosition: "0 100%, 0 60%",
                WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", padding: "0 4px" }}>{l.text}</span>
            </div>;
          })}
          {/* the rest of the page, as grey lines: the document goes on */}
          {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ height: fsB * 0.42, width: `${[92, 84, 96, 70, 88, 60][i]}%`, background: "#e8ecf2", borderRadius: 6, marginBottom: fsB * 0.55 }} />)}
        </div>
        <svg width={cw} height={ch} style={{ position: "absolute", left: 0, top: 0 }}>
          <Marks p={p} marks={P.pen} box={markBox} ink={ink} />
        </svg>
        {p.tl.sources && <div style={{ position: "absolute", left: 0, bottom: 0, width: cw, padding: v ? "16px 50px" : "12px 56px", boxSizing: "border-box",
          background: "#f1f4f8", fontFamily: FONT, fontWeight: 600, fontSize: fsP, color: "#3b4656" }}>{p.tl.sources}</div>}
      </div>
      {P.presenter && <Presenter p={p} spec={P.presenter} />}
    </AbsoluteFill>
  );
};
