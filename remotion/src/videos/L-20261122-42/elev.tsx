// The 2D pieces shared by the flat beats: the sheet (look provider, drafting grid, a camera on the drawing),
// lines and boxes that draw on, a desk telephone, a rubber stamp and a big gauge. Every piece is a pure
// function of the beat's story frame `t`.
import React from "react";
import { AbsoluteFill } from "remotion";
import { DisasterLookProvider, LookBackground, MonoLabel, Texture, useDisasterLook } from "../../disaster/index";
import { LampStrip, RECIPE } from "./ui";

export const W = 1920, H = 1080;
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, at: number, len = 12) => sm((t - at) / len);

/** The blueprint sheet: background, a camera (zoom about cx, cy, at most 1.3), texture on top. */
export const Sheet: React.FC<{ t: number; zoom?: number; cx?: number; cy?: number; children: React.ReactNode; html?: React.ReactNode; marks?: number[] }> = ({ t, zoom = 1, cx = W / 2, cy = H / 2, children, html, marks }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="draft-grid" width={90} height={90} patternUnits="userSpaceOnUse"><rect x={0} y={0} width={90} height={4} fill="#39ff9a" /><rect x={0} y={0} width={4} height={90} fill="#39ff9a" /></pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#draft-grid)" opacity={0.3} />
        <rect x={36} y={36} width={W - 72} height={H - 72} fill="none" stroke="#39ff9a" strokeOpacity={0.35} strokeWidth={6} />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
      {html}
      {marks ? <LampStrip t={t} marks={marks} /> : null}
      <Texture t={t} />
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** A line that draws on: k 0→1. */
export const DrawLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color: string; w?: number; dash?: string }> = ({ x1, y1, x2, y2, k, color, w = 4, dash }) =>
  k <= 0 ? null : <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * clamp(k)} y2={y1 + (y2 - y1) * clamp(k)} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />;

/** A box drawn as an outline that draws on, then a soft fill. */
export const DrawBox: React.FC<{ x: number; y: number; w: number; h: number; k: number; fill?: string; color?: string; sw?: number }> = ({ x, y, w, h, k, fill, color, sw = 7 }) => {
  const L = useDisasterLook();
  if (k <= 0) return null;
  const per = 2 * (w + h);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill ?? L.solid} fillOpacity={clamp((k - 0.6) / 0.4)} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color ?? L.line} strokeWidth={sw} strokeDasharray={per} strokeDashoffset={per * (1 - clamp(k))} />
    </g>
  );
};

/** A desk telephone, ringing from `ring` (handset jumps, sound arcs pulse). */
export const Phone: React.FC<{ x: number; y: number; t: number; k: number; ring?: number; s?: number }> = ({ x, y, t, k, ring, s = 1 }) => {
  const L = useDisasterLook();
  if (k <= 0) return null;
  const on = ring !== undefined && t >= ring && t < ring + 60;
  const jump = on ? Math.abs(Math.sin((t - ring!) * 0.9)) * 8 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * k)})`} opacity={k}>
      <path d="M -90 40 L -70 -20 L 70 -20 L 90 40 Z" fill={L.panel} stroke={L.line} strokeWidth={4} />
      <circle cx={0} cy={12} r={20} fill="none" stroke={L.line} strokeWidth={3} />
      <g transform={`translate(0 ${-34 - jump}) rotate(${on ? Math.sin(t * 1.3) * 4 : 0})`}>
        <path d="M -95 0 Q -95 -26 -70 -26 L 70 -26 Q 95 -26 95 0 L 70 4 L 52 -8 L -52 -8 L -70 4 Z" fill={L.panel} stroke={L.line} strokeWidth={4} />
      </g>
      {on && [0, 1, 2].map((i) => {
        const r = 70 + i * 26 + ((t * 2) % 26);
        return (
          <g key={i} opacity={0.8 - i * 0.22}>
            <path d={`M ${-r} ${-40} A ${r} ${r} 0 0 1 ${-r * 0.55} ${-40 - r * 0.8}`} fill="none" stroke={L.label} strokeWidth={4} />
            <path d={`M ${r} ${-40} A ${r} ${r} 0 0 0 ${r * 0.55} ${-40 - r * 0.8}`} fill="none" stroke={L.label} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/** A rubber stamp that lands with a squash at `at`. */
export const Stamp: React.FC<{ x: number; y: number; t: number; at: number; text: string; color: string; size?: number; rot?: number }> = ({ x, y, t, at, text, color, size = 64, rot = -10 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 6);
  const sc = 1.8 - 0.8 * k;
  const L = useDisasterLook();
  const w = text.length * size * 0.62 + size * 0.8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={k * 0.92}>
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.4} rx={10} fill="none" stroke={color} strokeWidth={7} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily={L.fonts.value} fontSize={size} letterSpacing={size * 0.08} fill={color}>{text}</text>
    </g>
  );
};
export default Sheet;

/** A big horizontal gauge: a track, a fill to `v` (0..1), a red mark at `mark` with its label, a label over
 * it and an optional value at the fill's end. Figures only from the caller (params.fig). */
export const BigGauge: React.FC<{ x: number; y: number; w: number; v: number; mark?: number; label: string; markLabel?: string; value?: string; color?: string }> = ({ x, y, w, v, mark, label, markLabel, value, color }) => {
  const L = useDisasterLook();
  const h = 110, k = clamp(v), c = color ?? (k > 0.85 ? L.fail : k > 0.6 ? "#ffb23e" : L.ok);
  return (
    <g>
      <text x={x} y={y - 24} fontFamily={L.fonts.mono} fontWeight={700} fontSize={40} letterSpacing={4} fill={L.ink}>{label.toUpperCase()}</text>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#0b0f0c" stroke={L.line} strokeOpacity={0.6} strokeWidth={4} />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={x + (w * i) / 10} y1={y + h} x2={x + (w * i) / 10} y2={y + h + 22} stroke={L.line} strokeOpacity={0.6} strokeWidth={3} />)}
      <rect x={x + 8} y={y + 8} width={(w - 16) * k} height={h - 16} rx={6} fill={c} />
      {mark !== undefined && <line x1={x + w * mark} y1={y - 30} x2={x + w * mark} y2={y + h + 30} stroke={L.fail} strokeWidth={8} />}
      {mark !== undefined && markLabel && <text x={Math.min(x + w * mark, x + w - 10)} y={y + h + 80} textAnchor={mark > 0.8 ? "end" : "middle"} fontFamily={L.fonts.mono} fontWeight={700} fontSize={38} fill={L.fail}>{markLabel.toUpperCase()}</text>}
      {value ? <text x={x + Math.max(160, (w - 16) * k) + 20} y={y + h - 22} fontFamily={L.fonts.value} fontSize={80} fill={L.ink}>{value}</text> : null}
    </g>
  );
};
