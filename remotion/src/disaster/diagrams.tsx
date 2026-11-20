/**
 * Flat engineering diagrams for the disasters channel: ForceDiagram, CauseChain, Callout, Elevation.
 * Each is an SVG <g> drawn in its parent's coordinates (a flat `Stage`/`View` or any <svg>), a pure
 * function of the frame `t`, and takes `look`. Times (`at`, `breakAt`…) are frames on the same clock as
 * `t` (a beat passes `p.at(word)`). Every figure comes from props: numbers are formatted here, never typed.
 */
import React from "react";
import { clamp01, ease, outCubic, smooth, typed, wobbleLine } from "./Texture";
import { type DisasterLook, type LookProp, useDisasterLook } from "./looks";

type Tone = "ink" | "accent" | "fail" | "ok" | "muted";
const toneOf = (L: DisasterLook, tone: Tone | undefined) =>
  tone === "fail" ? L.fail : tone === "ok" ? L.ok : tone === "accent" ? L.accent : tone === "muted" ? L.muted : L.ink;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rad = (d: number) => (d * Math.PI) / 180;

/** An arrow from (x1,y1) to (x2,y2) drawn `k` of the way, head at the tip. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k?: number; color: string; w?: number; dashed?: boolean; head?: number; wobble?: number; seed?: number }> = ({
  x1, y1, x2, y2, k = 1, color, w = 6, dashed, head, wobble = 0, seed = 1,
}) => {
  if (k <= 0) return null;
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k);
  const a = Math.atan2(ey - y1, ex - x1), hs = head ?? w * 3.2;
  const p1 = [ex - hs * Math.cos(a - 0.45), ey - hs * Math.sin(a - 0.45)], p2 = [ex - hs * Math.cos(a + 0.45), ey - hs * Math.sin(a + 0.45)];
  const bx = ex - hs * 0.7 * Math.cos(a), by = ey - hs * 0.7 * Math.sin(a);
  return (
    <g>
      <path d={wobbleLine(x1, y1, bx, by, wobble, seed)} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" strokeDasharray={dashed ? `${w * 2.4} ${w * 1.8}` : undefined} />
      <polygon points={`${ex},${ey} ${p1.join(",")} ${p2.join(",")}`} fill={color} />
    </g>
  );
};

/** A mono label that types on: a small-caps title and an optional grey subline. */
export const MonoLabel: React.FC<LookProp & { x: number; y: number; t: number; at?: number; text: string; sub?: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; box?: boolean }> = ({
  look, x, y, t, at, text, sub, size = 30, color, anchor = "start", box,
}) => {
  const L = useDisasterLook(look);
  const k = ease(t, at, 6);
  if (k <= 0) return null;
  const s = typed(text.toUpperCase(), t, at, 1.6), s2 = sub ? typed(sub, t, at === undefined ? undefined : at + text.length / 1.6, 1.8) : "";
  const wBox = Math.max(text.length, (sub ?? "").length * 0.8) * size * 0.64 + size * 1.2;
  const hBox = size * (sub ? 2.7 : 1.6);
  const bx = anchor === "start" ? x - size * 0.6 : anchor === "end" ? x - wBox + size * 0.6 : x - wBox / 2;
  return (
    <g opacity={k}>
      {box ? <rect x={bx} y={y - size * 1.15} width={wBox} height={hBox} rx={size * 0.18} fill={L.panel} stroke={color ?? L.label} strokeWidth={1.5} strokeOpacity={0.6} /> : null}
      <text x={x} y={y} fontFamily={L.fonts.mono} fontWeight={700} fontSize={size} letterSpacing={size * 0.12} fill={color ?? L.label} textAnchor={anchor}>{s}</text>
      {sub ? <text x={x} y={y + size * 1.15} fontFamily={L.fonts.mono} fontSize={size * 0.8} letterSpacing={size * 0.06} fill={L.muted} textAnchor={anchor}>{s2}</text> : null}
    </g>
  );
};

// ------------------------------------------------------------------ ForceDiagram

export type Force = {
  label: string;
  /** degrees, 0 = straight up, 90 = right; [at value 0, at value 1] */
  angle: [number, number];
  /** arrow length as a share of `size`, [at 0, at 1] */
  len: [number, number];
  tone?: Tone;
  dashed?: boolean;
  /** frame the arrow and its label appear */
  at?: number;
};

/** A front/side view reduced to a body (a wing line and a circle, a box, or nothing) with force arrows
 * that tilt and grow as `value` goes 0 → 1, and labels typing on. `bank` tilts the body with the value. */
export const ForceDiagram: React.FC<LookProp & {
  t: number; x: number; y: number; size: number; value: number; forces: Force[];
  body?: "wing" | "box" | "none"; bank?: [number, number]; title?: string; titleAt?: number;
}> = ({ look, t, x, y, size, value, forces, body = "wing", bank = [0, 0], title, titleAt }) => {
  const L = useDisasterLook(look);
  const v = clamp01(value);
  const b = lerp(bank[0], bank[1], v);
  return (
    <g>
      <g transform={`rotate(${b} ${x} ${y})`}>
        {body === "wing" ? (
          <>
            <path d={wobbleLine(x - size * 0.75, y, x + size * 0.75, y, L.wobble, 3)} stroke={L.line} strokeWidth={size * 0.035} strokeLinecap="round" fill="none" />
            <circle cx={x} cy={y} r={size * 0.12} fill={L.solid} stroke={L.line} strokeWidth={size * 0.02} />
            <path d={wobbleLine(x, y - size * 0.12, x, y - size * 0.3, L.wobble, 4)} stroke={L.line} strokeWidth={size * 0.025} fill="none" />
          </>
        ) : body === "box" ? (
          <rect x={x - size * 0.4} y={y - size * 0.18} width={size * 0.8} height={size * 0.36} fill={L.solid} stroke={L.line} strokeWidth={size * 0.02} />
        ) : null}
      </g>
      {forces.map((f, i) => {
        const k = ease(t, f.at, 10);
        if (k <= 0) return null;
        const a = rad(lerp(f.angle[0], f.angle[1], v) - 90);
        const len = size * lerp(f.len[0], f.len[1], v);
        const r0 = size * 0.14;
        const x1 = x + Math.cos(a) * r0, y1 = y + Math.sin(a) * r0, x2 = x + Math.cos(a) * (r0 + len), y2 = y + Math.sin(a) * (r0 + len);
        const c = toneOf(L, f.tone ?? "accent");
        const lx = x + Math.cos(a) * (r0 + len + size * 0.12), ly = y + Math.sin(a) * (r0 + len + size * 0.12);
        return (
          <g key={i}>
            <Arrow x1={x1} y1={y1} x2={x2} y2={y2} k={outCubic(k)} color={c} w={size * 0.028} dashed={f.dashed} wobble={L.wobble} seed={i + 7} />
            <MonoLabel look={L} t={t} at={f.at} x={lx} y={ly + size * 0.03} text={f.label} size={size * 0.075} color={c} anchor={Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle"} />
          </g>
        );
      })}
      {title ? <MonoLabel look={L} t={t} at={titleAt} x={x} y={y - size * 1.05} text={title} size={size * 0.08} anchor="middle" color={L.muted} /> : null}
    </g>
  );
};

// ------------------------------------------------------------------ CauseChain

/** A strip of causes ("less lift → nose drops → spiral") that fills link by link on the words; the
 * link at `broken` cracks and turns red at `breakAt`. Horizontal, or vertical for a Short. */
export const CauseChain: React.FC<LookProp & {
  t: number; x: number; y: number; w: number; links: { label: string; at?: number }[];
  broken?: number; breakAt?: number; vertical?: boolean; size?: number;
}> = ({ look, t, x, y, w, links, broken, breakAt, vertical = false, size = 34 }) => {
  const L = useDisasterLook(look);
  const n = links.length;
  const gap = size * 1.6;
  const cell = vertical ? size * 2.4 : (w - gap * (n - 1)) / n;
  const bk = breakAt === undefined ? 0 : smooth((t - breakAt) / 8);
  return (
    <g>
      {links.map((ln, i) => {
        const k = ease(t, ln.at, 8);
        if (k <= 0) return null;
        const isB = i === broken && bk > 0;
        const c = isB ? L.fail : L.label;
        const cx = vertical ? x + w / 2 : x + i * (cell + gap) + cell / 2;
        const cy = vertical ? y + i * (cell + gap) : y;
        const bw = vertical ? w : cell, bh = size * 1.9;
        const split = isB ? bk * size * 0.5 : 0;
        const shake = isB ? Math.sin(t * 2.3) * (1 - bk) * size * 0.15 : 0;
        const pk = outCubic(k);
        return (
          <g key={i} opacity={pk} transform={`translate(${shake} ${(1 - pk) * size * 0.4})`}>
            {i > 0 ? (
              <Arrow color={i === broken && bk > 0 ? L.fail : L.muted} w={size * 0.12} k={pk}
                x1={vertical ? cx : cx - bw / 2 - gap + size * 0.15} y1={vertical ? cy - gap - bh / 2 + size * 0.5 : cy}
                x2={vertical ? cx : cx - bw / 2 - size * 0.15} y2={vertical ? cy - bh / 2 - size * 0.1 : cy} />
            ) : null}
            {split === 0 ? (
              <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} fill={L.panel} stroke={c} strokeWidth={size * 0.08} rx={size * 0.2} />
            ) : (
              <>
                <g transform={`translate(${-split} 0) rotate(${-split * 0.15} ${cx} ${cy})`}>
                  <path d={`M${cx},${cy - bh / 2} H${cx - bw / 2} V${cy + bh / 2} H${cx}`} fill={L.panel} stroke={c} strokeWidth={size * 0.08} />
                </g>
                <g transform={`translate(${split} 0) rotate(${split * 0.15} ${cx} ${cy})`}>
                  <path d={`M${cx},${cy - bh / 2} H${cx + bw / 2} V${cy + bh / 2} H${cx}`} fill={L.panel} stroke={c} strokeWidth={size * 0.08} />
                </g>
              </>
            )}
            {isB ? <path d={`M${cx},${cy - bh / 2} l${size * 0.15},${bh * 0.3} l${-size * 0.25},${bh * 0.2} l${size * 0.2},${bh * 0.5}`} stroke={L.fail} strokeWidth={size * 0.08} fill="none" opacity={bk} /> : null}
            <text x={cx} y={cy + size * 0.36} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={size} letterSpacing={size * 0.08} fill={isB ? L.fail : L.ink}>
              {typed(ln.label.toUpperCase(), t, ln.at, 1.5)}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ Callout

/** A leader line draws from the point to the label, then the mono label types on. */
export const Callout: React.FC<LookProp & {
  t: number; at?: number; point: [number, number]; label: [number, number]; text: string; sub?: string;
  tone?: Tone; size?: number; outAt?: number;
}> = ({ look, t, at, point, label, text, sub, tone = "accent", size = 32, outAt }) => {
  const L = useDisasterLook(look);
  const k = ease(t, at, 10);
  const out = outAt === undefined ? 1 : 1 - ease(t, outAt, 8);
  if (k <= 0 || out <= 0) return null;
  const c = toneOf(L, tone);
  const [px, py] = point, [lx, ly] = label;
  const ex = lerp(px, lx, outCubic(k)), ey = lerp(py, ly, outCubic(k));
  const right = lx >= px;
  const pulse = 1 + 0.25 * Math.sin(t / 5);
  return (
    <g opacity={out}>
      <circle cx={px} cy={py} r={size * 0.28 * pulse} fill="none" stroke={c} strokeWidth={size * 0.08} />
      <circle cx={px} cy={py} r={size * 0.12} fill={c} />
      <path d={wobbleLine(px, py, ex, ey, L.wobble, 5)} stroke={c} strokeWidth={size * 0.08} fill="none" />
      {k >= 1 ? (
        <>
          <line x1={lx} y1={ly} x2={lx + (right ? 1 : -1) * size * 1.2} y2={ly} stroke={c} strokeWidth={size * 0.08} />
          <MonoLabel look={L} t={t} at={at === undefined ? undefined : at + 10} x={lx + (right ? 1 : -1) * size * 1.6} y={ly + size * 0.35}
            text={text} sub={sub} size={size} color={c} anchor={right ? "start" : "end"} box />
        </>
      ) : null}
    </g>
  );
};

// ------------------------------------------------------------------ Elevation

export type Dim = { from: [number, number]; to: [number, number]; label: string; at?: number };

/** An engineering cross-section in the box (x, y, w, h): a bridge (piers and girders), a dam profile,
 * a ship's hull at the waterline, or a framed building. A height axis on the left (ticks from `axis`),
 * dimension lines (`dims`, points as shares of the box), a water/load `level` (0..1 of the height) and
 * the failure: `stress` 0..1 colours the failing part grey → amber → red, `fail` 0..1 moves it (the
 * girder hinges off its pier, the dam's crack opens, the hull lists, the column buckles). */
export const Elevation: React.FC<LookProp & {
  t: number; x: number; y: number; w: number; h: number; kind: "bridge" | "dam" | "hull" | "building";
  axis?: { max: number; unit: string; ticks?: number; label?: string };
  level?: number; levelLabel?: string; dims?: Dim[]; stress?: number; fail?: number; failPart?: number; drawAt?: number;
}> = ({ look, t, x, y, w, h, kind, axis, level, levelLabel, dims = [], stress = 0, fail = 0, failPart = 1, drawAt }) => {
  const L = useDisasterLook(look);
  const dk = ease(t, drawAt, 24);
  const st = clamp01(stress);
  const stressC = st < 0.5 ? mix(L.solid, "#ffb23e", st * 2) : mix("#ffb23e", L.fail, (st - 0.5) * 2);
  const sw = Math.max(1.5, L.stroke * 1.2);
  const ground = y + h;
  const fx = (f: number) => x + f * w, fy = (f: number) => y + h - f * h;
  const lvl = level === undefined ? undefined : clamp01(level);
  const parts: React.ReactNode[] = [];
  const S = (key: string, d: string, fill: string, failing = false, transform?: string) =>
    parts.push(<path key={key} d={d} fill={failing ? stressC : fill} stroke={failing && st > 0.5 ? L.fail : L.line} strokeWidth={sw} strokeLinejoin="round" transform={transform} />);

  if (kind === "bridge") {
    const piers = [0.12, 0.38, 0.62, 0.88], deck = 0.62, gh = 0.07;
    piers.forEach((p, i) => S(`p${i}`, `M${fx(p - 0.025)},${ground} L${fx(p - 0.018)},${fy(deck - gh)} L${fx(p + 0.018)},${fy(deck - gh)} L${fx(p + 0.025)},${ground} Z`, L.solidShade));
    for (let i = 0; i < piers.length - 1; i++) {
      const a = piers[i]!, b = piers[i + 1]!, failing = i === failPart;
      const drop = failing ? outCubic(fail) : 0;
      const hinge = `rotate(${drop * 24} ${fx(a)} ${fy(deck)}) translate(0 ${drop * h * 0.08})`;
      S(`g${i}`, `M${fx(a)},${fy(deck)} L${fx(b)},${fy(deck)} L${fx(b)},${fy(deck - gh)} L${fx(a)},${fy(deck - gh)} Z`, L.solid, failing, failing ? hinge : undefined);
    }
  } else if (kind === "dam") {
    const crack = outCubic(fail);
    S("dam", `M${fx(0.3)},${ground} L${fx(0.42)},${fy(0.92)} L${fx(0.5)},${fy(0.92)} L${fx(0.72)},${ground} Z`, L.solid, st > 0);
    if (crack > 0) parts.push(<path key="crack" d={`M${fx(0.46)},${fy(0.92)} L${fx(0.49)},${fy(0.7)} L${fx(0.47)},${fy(0.5)} L${fx(0.53)},${fy(0.3)} L${fx(0.52)},${fy(0.3 - 0.3 * crack)}`} stroke={st > 0.5 ? L.ink : L.fail} strokeWidth={sw * (1 + crack * 2)} fill="none" />);
    if (crack > 0.3) parts.push(<path key="jet" d={`M${fx(0.6)},${fy(0.18)} q${w * 0.12},${-h * 0.05} ${w * 0.3},${h * 0.18}`} stroke={L.fluid} strokeWidth={sw * 6 * crack} fill="none" opacity={0.85} strokeLinecap="round" />);
  } else if (kind === "hull") {
    const list = outCubic(fail) * 28;
    const cx = fx(0.5), cy = fy(0.35);
    parts.push(
      <g key="hull" transform={`rotate(${list} ${cx} ${cy})`}>
        <path d={`M${fx(0.15)},${fy(0.55)} L${fx(0.85)},${fy(0.55)} L${fx(0.8)},${fy(0.18)} Q${fx(0.5)},${fy(0.06)} ${fx(0.2)},${fy(0.18)} Z`} fill={L.solid} stroke={L.line} strokeWidth={sw} />
        <path d={`M${fx(0.62)},${fy(0.5)} L${fx(0.78)},${fy(0.5)} L${fx(0.76)},${fy(0.22)} L${fx(0.62)},${fy(0.2)} Z`} fill={stressC} stroke={st > 0.5 ? L.fail : L.line} strokeWidth={sw} />
        <rect x={fx(0.3)} y={fy(0.72)} width={w * 0.3} height={h * 0.17} fill={L.solidShade} stroke={L.line} strokeWidth={sw} />
        <line x1={fx(0.5)} y1={fy(0.55)} x2={fx(0.5)} y2={fy(0.12)} stroke={L.line} strokeWidth={sw * 0.6} strokeDasharray="8 6" />
      </g>,
    );
  } else {
    const cols = [0.2, 0.4, 0.6, 0.8], floors = 5;
    for (let f = 1; f <= floors; f++) S(`f${f}`, `M${fx(0.15)},${fy((f / floors) * 0.9)} L${fx(0.85)},${fy((f / floors) * 0.9)} L${fx(0.85)},${fy((f / floors) * 0.9 - 0.025)} L${fx(0.15)},${fy((f / floors) * 0.9 - 0.025)} Z`, L.solid);
    cols.forEach((c, i) => {
      const failing = i === failPart, bend = failing ? outCubic(fail) * w * 0.05 : 0;
      parts.push(<path key={`c${i}`} d={`M${fx(c)},${ground} Q${fx(c) + bend},${fy(0.09)} ${fx(c)},${fy(0.18 - 0.025)}`} stroke={failing ? stressC : L.solidShade} strokeWidth={w * 0.022} fill="none" />);
    });
  }

  const levelY = lvl === undefined ? 0 : fy(lvl);
  return (
    <g>
      <defs>
        <clipPath id={`elev-${kind}-draw`}><rect x={x - w * 0.2} y={y - h * 0.2} width={w * 1.4 * dk} height={h * 1.5} /></clipPath>
      </defs>
      {/* the ground line */}
      <line x1={x - w * 0.03} y1={ground} x2={x + w * 1.03} y2={ground} stroke={L.line} strokeWidth={sw * 1.4} />
      {/* the water / load level behind the structure */}
      {lvl !== undefined && kind !== "building" ? (
        <rect x={kind === "dam" ? x : x - w * 0.03} y={levelY} width={kind === "dam" ? w * 0.42 : w * 1.06} height={ground - levelY} fill={L.fluid} opacity={0.6} />
      ) : null}
      <g clipPath={`url(#elev-${kind}-draw)`}>{parts}</g>
      {lvl !== undefined ? (
        <g>
          <line x1={x - w * 0.03} y1={levelY} x2={x + w * 1.03} y2={levelY} stroke={L.ok} strokeWidth={sw} strokeDasharray="14 10" />
          <polygon points={`${x + w * 0.98},${levelY - 4} ${x + w * 0.96},${levelY - 26} ${x + w * 1.0},${levelY - 26}`} fill={L.ok} />
          {levelLabel ? <text x={x + w * 0.95} y={levelY - 34} textAnchor="end" fontFamily={L.fonts.mono} fontWeight={700} fontSize={Math.min(w, h) * 0.045} fill={L.ok}>{levelLabel.toUpperCase()}</text> : null}
        </g>
      ) : null}
      {axis ? <HeightAxis L={L} x={x - w * 0.06} y={y} h={h} {...axis} /> : null}
      {dims.map((d, i) => <DimLine key={i} L={L} t={t} d={d} fx={fx} fy={fy} size={Math.min(w, h) * 0.04} />)}
    </g>
  );
};

const HeightAxis: React.FC<{ L: DisasterLook; x: number; y: number; h: number; max: number; unit: string; ticks?: number; label?: string }> = ({ L, x, y, h, max, unit, ticks = 4, label }) => {
  const size = Math.max(18, h * 0.04);
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={L.muted} strokeWidth={2} />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max * i) / ticks, ty = y + h - (h * i) / ticks;
        return (
          <g key={i}>
            <line x1={x - size * 0.5} y1={ty} x2={x} y2={ty} stroke={L.muted} strokeWidth={2} />
            <text x={x - size * 0.7} y={ty + size * 0.35} textAnchor="end" fontFamily={L.fonts.mono} fontSize={size} fill={L.muted}>{fmtNum(v)}{i === ticks ? ` ${unit}` : ""}</text>
          </g>
        );
      })}
      {label ? <text x={x} y={y - size * 0.9} textAnchor="middle" fontFamily={L.fonts.mono} fontSize={size * 0.85} letterSpacing={size * 0.1} fill={L.muted}>{label.toUpperCase()}</text> : null}
    </g>
  );
};

const DimLine: React.FC<{ L: DisasterLook; t: number; d: Dim; fx: (f: number) => number; fy: (f: number) => number; size: number }> = ({ L, t, d, fx, fy, size }) => {
  const k = ease(t, d.at, 12);
  if (k <= 0) return null;
  const x1 = fx(d.from[0]), y1 = fy(d.from[1]), x2 = fx(d.to[0]), y2 = fy(d.to[1]);
  const mx = lerp(x1, x2, 0.5), my = lerp(y1, y2, 0.5);
  const ex = lerp(mx, x2, k), ey = lerp(my, y2, k), sx = lerp(mx, x1, k), sy = lerp(my, y1, k);
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * size * 0.5, ny = Math.cos(a) * size * 0.5;
  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={L.accent} strokeWidth={2.5} />
      {k >= 1 ? (
        <>
          <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} stroke={L.accent} strokeWidth={2.5} />
          <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} stroke={L.accent} strokeWidth={2.5} />
        </>
      ) : null}
      <g transform={`rotate(${(a * 180) / Math.PI > 90 || (a * 180) / Math.PI < -90 ? (a * 180) / Math.PI + 180 : (a * 180) / Math.PI} ${mx} ${my})`}>
        <rect x={mx - d.label.length * size * 0.33 - size * 0.3} y={my - size * 0.75} width={d.label.length * size * 0.66 + size * 0.6} height={size * 1.2} fill={L.panel} />
        <text x={mx} y={my + size * 0.25} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={size} fill={L.accent}>{typed(d.label, t, d.at === undefined ? undefined : d.at + 8, 1.5)}</text>
      </g>
    </g>
  );
};

/** A number for an axis or a dial: grouped, no trailing zeros. */
export function fmtNum(v: number, dp = 0): string {
  const r = Number(v.toFixed(dp));
  return r.toLocaleString("en-US", { maximumFractionDigits: dp });
}

/** Mix two #rrggbb colours (anything else returns b once k > 0.5). */
export function mix(a: string, b: string, k: number): string {
  const p = (s: string) => (/^#[0-9a-f]{6}$/i.test(s) ? [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)) : null);
  const A = p(a), B = p(b);
  if (!A || !B) return k > 0.5 ? b : a;
  const c = A.map((v, i) => Math.round(v + (B[i]! - v) * clamp01(k)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
