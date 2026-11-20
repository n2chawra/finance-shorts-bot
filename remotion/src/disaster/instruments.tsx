/**
 * The story's own instrument (build spec "Where we beat them" 5): altimeter tape, speed dial, load
 * gauge, list angle, water level and the mission clock with honest "time paused" / "2× speed" flags.
 * SVG <g> pieces in the parent's coordinates, driven only by numeric props (the timeline's maths):
 * every number shown is formatted here from those props. Red marks the danger band and the failure.
 */
import React from "react";
import { clamp01 } from "./Texture";
import { fmtNum, mix } from "./diagrams";
import { type DisasterLook, type LookProp, useDisasterLook } from "./looks";

type Box = { x: number; y: number; size: number };
const rad = (d: number) => (d * Math.PI) / 180;

const Bezel: React.FC<{ L: DisasterLook; x: number; y: number; w: number; h: number; label?: string; size: number }> = ({ L, x, y, w, h, label, size }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={size * 0.06} fill={L.panel} stroke={L.line} strokeOpacity={0.5} strokeWidth={2} />
    {label ? <text x={x + size * 0.07} y={y - size * 0.05} fontFamily={L.fonts.mono} fontWeight={700} fontSize={size * 0.075} letterSpacing={size * 0.012} fill={L.muted}>{label.toUpperCase()}</text> : null}
  </g>
);

const Readout: React.FC<{ L: DisasterLook; x: number; y: number; size: number; text: string; color: string; anchor?: "start" | "middle" | "end" }> = ({ L, x, y, size, text, color, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={L.fonts.value} fontSize={size} fill={color} letterSpacing={size * 0.02}>{text}</text>
);

/** A vertical altimeter tape: numbers scroll past a fixed pointer; red below `floor`. */
export const AltimeterTape: React.FC<LookProp & Box & { value: number; step: number; unit: string; floor?: number; label?: string }> = ({
  look, x, y, size, value, step, unit, floor, label = "altitude",
}) => {
  const L = useDisasterLook(look);
  const w = size * 0.42, h = size, cy = y + h / 2, px = h / (step * 5);
  const first = Math.floor((value - step * 3) / step) * step;
  const low = floor !== undefined && value < floor;
  return (
    <g>
      <Bezel L={L} x={x} y={y} w={w} h={h} label={label} size={size} />
      <clipPath id={`alt-${x}-${y}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#alt-${x}-${y})`}>
        {floor !== undefined ? <rect x={x} y={cy - (floor - value) * px} width={w * 0.12} height={h} fill={L.fail} opacity={0.8} /> : null}
        {Array.from({ length: 8 }, (_, i) => {
          const v = first + i * step, ty = cy - (v - value) * px;
          return (
            <g key={i}>
              <line x1={x + w * 0.14} y1={ty} x2={x + w * 0.3} y2={ty} stroke={L.line} strokeWidth={2} />
              {Math.abs(ty - cy) > size * 0.09 ? <text x={x + w * 0.36} y={ty + size * 0.025} fontFamily={L.fonts.mono} fontSize={size * 0.065} fill={L.muted}>{fmtNum(v)}</text> : null}
            </g>
          );
        })}
      </g>
      <polygon points={`${x - size * 0.05},${cy} ${x + w * 0.12},${cy - size * 0.05} ${x + w * 0.12},${cy + size * 0.05}`} fill={low ? L.fail : L.accent} />
      <rect x={x + w * 0.12} y={cy - size * 0.06} width={w * 0.88} height={size * 0.12} fill={L.bg[1]} stroke={low ? L.fail : L.accent} strokeWidth={3} />
      <Readout L={L} x={x + w * 0.56} y={cy + size * 0.04} size={size * 0.1} text={fmtNum(value)} color={low ? L.fail : L.ink} />
      <text x={x + w / 2} y={y + h + size * 0.09} textAnchor="middle" fontFamily={L.fonts.mono} fontSize={size * 0.06} fill={L.muted}>{unit.toUpperCase()}</text>
    </g>
  );
};

/** A round dial: needle from 0 to `max` over 270°, a red arc from `redFrom`, the value in the middle. */
export const SpeedDial: React.FC<LookProp & Box & { value: number; max: number; unit: string; redFrom?: number; ticks?: number; label?: string }> = ({
  look, x, y, size, value, max, unit, redFrom, ticks = 6, label = "speed",
}) => {
  const L = useDisasterLook(look);
  const r = size / 2, cx = x + r, cy = y + r;
  const ang = (v: number) => -225 + 270 * clamp01(v / max);
  const pt = (a: number, rr: number): [number, number] => [cx + Math.cos(rad(a)) * rr, cy + Math.sin(rad(a)) * rr];
  const arc = (a0: number, a1: number, rr: number) => { const [x0, y0] = pt(a0, rr), [x1, y1] = pt(a1, rr); return `M${x0},${y0} A${rr},${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`; };
  const over = redFrom !== undefined && value >= redFrom;
  const [nx, ny] = pt(ang(value), r * 0.78);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={L.panel} stroke={L.line} strokeOpacity={0.5} strokeWidth={2} />
      <path d={arc(-225, 45, r * 0.86)} stroke={L.muted} strokeWidth={size * 0.02} fill="none" />
      {redFrom !== undefined ? <path d={arc(ang(redFrom), 45, r * 0.86)} stroke={L.fail} strokeWidth={size * 0.04} fill="none" /> : null}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max * i) / ticks, a = ang(v), [a1, b1] = pt(a, r * 0.8), [a2, b2] = pt(a, r * 0.92), [lx, ly] = pt(a, r * 0.64);
        return (
          <g key={i}>
            <line x1={a1} y1={b1} x2={a2} y2={b2} stroke={L.line} strokeWidth={3} />
            <text x={lx} y={ly + size * 0.025} textAnchor="middle" fontFamily={L.fonts.mono} fontSize={size * 0.06} fill={L.muted}>{fmtNum(v)}</text>
          </g>
        );
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={over ? L.fail : L.accent} strokeWidth={size * 0.025} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={size * 0.04} fill={over ? L.fail : L.accent} />
      <Readout L={L} x={cx} y={cy + r * 0.52} size={size * 0.13} text={fmtNum(value)} color={over ? L.fail : L.ink} />
      <text x={cx} y={cy + r * 0.72} textAnchor="middle" fontFamily={L.fonts.mono} fontSize={size * 0.055} fill={L.muted}>{unit.toUpperCase()}</text>
      <text x={cx} y={y - size * 0.03} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={size * 0.065} letterSpacing={size * 0.01} fill={L.muted}>{label.toUpperCase()}</text>
    </g>
  );
};

/** A horizontal bar of load against its limit: fills grey → amber → red, the limit line marked. */
export const LoadGauge: React.FC<LookProp & Box & { value: number; limit: number; unit: string; label?: string; limitLabel?: string }> = ({
  look, x, y, size, value, limit, unit, label = "load", limitLabel = "design limit",
}) => {
  const L = useDisasterLook(look);
  const w = size, h = size * 0.16, max = limit * 1.5, k = clamp01(value / max), lim = limit / max;
  const st = clamp01(value / limit);
  const c = value >= limit ? L.fail : st > 0.75 ? mix(L.ok, "#ffb23e", (st - 0.75) * 4) : L.ok;
  return (
    <g>
      <Bezel L={L} x={x} y={y} w={w} h={h} label={label} size={size} />
      <rect x={x + 4} y={y + 4} width={(w - 8) * k} height={h - 8} fill={c} />
      <line x1={x + w * lim} y1={y - size * 0.03} x2={x + w * lim} y2={y + h + size * 0.03} stroke={L.fail} strokeWidth={4} />
      <text x={x + w * lim} y={y + h + size * 0.1} textAnchor="middle" fontFamily={L.fonts.mono} fontSize={size * 0.05} fill={L.fail}>{`${limitLabel.toUpperCase()} ${fmtNum(limit)} ${unit}`}</text>
      <Readout L={L} x={x + w} y={y - size * 0.04} size={size * 0.1} text={`${fmtNum(value)} ${unit}`} color={value >= limit ? L.fail : L.ink} anchor="end" />
    </g>
  );
};

/** A ship's list: a hull silhouette tilting by `deg`, an arc scale with the capsize `limit` in red. */
export const ListAngle: React.FC<LookProp & Box & { deg: number; limit: number; label?: string }> = ({ look, x, y, size, deg, limit, label = "list" }) => {
  const L = useDisasterLook(look);
  const cx = x + size / 2, cy = y + size * 0.55, r = size * 0.45;
  const pt = (a: number, rr: number): [number, number] => [cx + Math.sin(rad(a)) * rr, cy - Math.cos(rad(a)) * rr];
  const over = Math.abs(deg) >= limit;
  return (
    <g>
      {[-limit, limit].map((a, i) => { const [x1, y1] = pt(a, r), [x2, y2] = pt(a + (a > 0 ? 25 : -25), r); return <path key={i} d={`M${x1},${y1} A${r},${r} 0 0 ${a > 0 ? 1 : 0} ${x2},${y2}`} stroke={L.fail} strokeWidth={size * 0.04} fill="none" />; })}
      <path d={`M${pt(-limit, r).join(",")} A${r},${r} 0 0 1 ${pt(limit, r).join(",")}`} stroke={L.muted} strokeWidth={size * 0.015} fill="none" />
      {[-30, -15, 0, 15, 30].map((a) => { const [x1, y1] = pt(a, r * 0.92), [x2, y2] = pt(a, r * 1.04); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={L.line} strokeWidth={2} />; })}
      <line x1={x + size * 0.02} y1={cy + size * 0.12} x2={x + size * 0.98} y2={cy + size * 0.12} stroke={L.fluid} strokeWidth={4} strokeDasharray="10 8" />
      <g transform={`rotate(${deg} ${cx} ${cy})`}>
        <path d={`M${cx - size * 0.3},${cy} L${cx + size * 0.3},${cy} L${cx + size * 0.24},${cy + size * 0.18} L${cx - size * 0.24},${cy + size * 0.18} Z`} fill={over ? L.fail : L.solid} stroke={L.line} strokeWidth={2} />
        <rect x={cx - size * 0.1} y={cy - size * 0.12} width={size * 0.2} height={size * 0.12} fill={L.solidShade} stroke={L.line} strokeWidth={2} />
        <line x1={cx} y1={cy + size * 0.18} x2={cx} y2={cy - r * 0.95} stroke={over ? L.fail : L.accent} strokeWidth={3} />
      </g>
      <Readout L={L} x={cx} y={y + size * 1.02} size={size * 0.13} text={`${fmtNum(Math.abs(deg), 1)}°`} color={over ? L.fail : L.ink} />
      <text x={cx} y={y - size * 0.02} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={size * 0.065} fill={L.muted}>{label.toUpperCase()}</text>
    </g>
  );
};

/** A tank / reservoir level: water rises to `value` of `max`, a red danger line at `danger`. */
export const WaterLevel: React.FC<LookProp & Box & { value: number; max: number; unit: string; danger?: number; label?: string; t?: number }> = ({
  look, x, y, size, value, max, unit, danger, label = "water level", t = 0,
}) => {
  const L = useDisasterLook(look);
  const w = size * 0.4, h = size, k = clamp01(value / max), top = y + h - h * k;
  const over = danger !== undefined && value >= danger;
  const wave = Array.from({ length: 9 }, (_, i) => `${x + (w * i) / 8},${top + Math.sin(t / 6 + i) * size * 0.008}`).join(" L");
  return (
    <g>
      <Bezel L={L} x={x} y={y} w={w} h={h} label={label} size={size} />
      <path d={`M${wave} L${x + w},${y + h} L${x},${y + h} Z`} fill={over ? mix(L.fluid.startsWith("#") ? L.fluid : "#2a6f9e", L.fail, 0.35) : L.fluid} opacity={0.9} />
      {danger !== undefined ? <line x1={x - size * 0.04} y1={y + h - h * clamp01(danger / max)} x2={x + w + size * 0.04} y2={y + h - h * clamp01(danger / max)} stroke={L.fail} strokeWidth={4} strokeDasharray="12 8" /> : null}
      <Readout L={L} x={x + w + size * 0.06} y={top + size * 0.04} size={size * 0.1} text={fmtNum(value, 1)} color={over ? L.fail : L.ink} anchor="start" />
      <text x={x + w + size * 0.06} y={top + size * 0.11} fontFamily={L.fonts.mono} fontSize={size * 0.05} fill={L.muted}>{unit.toUpperCase()}</text>
    </g>
  );
};

/** The reconstruction clock: hh:mm:ss from `seconds` (time of day), with a flag when the picture is
 * not real time ("time paused" pulses, "2× speed" shows the rate). */
export const MissionClock: React.FC<LookProp & Box & { seconds: number; flag?: "paused" | "speed"; rate?: number; label?: string; t?: number }> = ({
  look, x, y, size, seconds, flag, rate = 2, label = "local time", t = 0,
}) => {
  const L = useDisasterLook(look);
  const s = Math.max(0, Math.floor(seconds));
  const hh = String(Math.floor(s / 3600) % 24).padStart(2, "0"), mm = String(Math.floor(s / 60) % 60).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  const w = size, h = size * 0.3;
  const blink = flag === "paused" ? 0.55 + 0.45 * Math.abs(Math.sin(t / 8)) : 1;
  const flagText = flag === "paused" ? "TIME PAUSED" : flag === "speed" ? `${fmtNum(rate, 1)}× SPEED` : "";
  return (
    <g>
      <Bezel L={L} x={x} y={y} w={w} h={h} label={label} size={size} />
      <text x={x + w / 2} y={y + h * 0.72} textAnchor="middle" fontFamily={L.fonts.mono} fontWeight={700} fontSize={h * 0.62} letterSpacing={h * 0.04} fill={flag === "paused" ? L.label : L.ink}>{`${hh}:${mm}:${ss}`}</text>
      {flag ? (
        <g opacity={blink}>
          <rect x={x} y={y + h + size * 0.03} width={flagText.length * size * 0.042 + size * 0.06} height={size * 0.085} rx={size * 0.015} fill={L.label} />
          <text x={x + size * 0.03} y={y + h + size * 0.095} fontFamily={L.fonts.mono} fontWeight={700} fontSize={size * 0.06} fill={L.bg[1]}>{flagText}</text>
        </g>
      ) : null}
    </g>
  );
};
