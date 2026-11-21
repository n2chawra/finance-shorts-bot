// The 2D pieces shared by the blueprint beats: the sheet (look provider, paper, grid, a camera on the
// drawing), the side elevation of one hanger (roof framing, the fourth- and second-floor box beams and their
// decks, the rod or rods and their nuts), a desk telephone and a rubber stamp. Every piece is a pure
// function of the beat's story frame `t`.
import React from "react";
import { AbsoluteFill } from "remotion";
import { DisasterLookProvider, LookBackground, MonoLabel, Texture, useDisasterLook } from "../../disaster/index";

export const W = 1920, H = 1080;
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, at: number, len = 12) => sm((t - at) / len);

/** The blueprint sheet: background, a camera (zoom about cx, cy, at most 1.3), texture on top. */
export const Sheet: React.FC<{ t: number; zoom?: number; cx?: number; cy?: number; children: React.ReactNode; html?: React.ReactNode }> = ({ t, zoom = 1, cx = W / 2, cy = H / 2, children, html }) => (
  <DisasterLookProvider value="blueprint">
    <AbsoluteFill>
      <LookBackground />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <rect x={36} y={36} width={W - 72} height={H - 72} fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={6} />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
      {html}
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

/** A hex nut seen side-on, centred at (x, y); `hot` 0..1 turns it amber then red with a glow. */
export const Nut: React.FC<{ x: number; y: number; k?: number; hot?: number; s?: number }> = ({ x, y, k = 1, hot = 0, s = 1 }) => {
  const L = useDisasterLook();
  if (k <= 0) return null;
  const c = hot <= 0 ? L.line : hot < 0.5 ? "#ffd84a" : L.fail;
  return (
    <g opacity={clamp(k * 1.5)} transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * sm(k))})`}>
      {hot > 0 && <circle r={34 + 10 * hot} fill={c} opacity={0.18 + 0.15 * hot} />}
      <rect x={-26} y={-6} width={52} height={8} fill={L.bg[1]} stroke={c} strokeWidth={3} />
      <path d="M -18 2 L 18 2 L 22 10 L 18 20 L -18 20 L -22 10 Z" fill={hot > 0 ? c : L.bg[1]} fillOpacity={hot > 0 ? 0.55 : 1} stroke={c} strokeWidth={3.5} />
      <line x1={-6} y1={2} x2={-6} y2={20} stroke={c} strokeWidth={2} />
      <line x1={6} y1={2} x2={6} y2={20} stroke={c} strokeWidth={2} />
    </g>
  );
};

export type ElevProps = {
  t: number;
  cx?: number;
  /** draw-on of roof, upper beam+deck, lower beam+deck, rod(s), nuts: frames each starts (undefined = drawn) */
  at?: { roof?: number; upper?: number; lower?: number; rod?: number; nuts?: number };
  /** 0 = one continuous rod (the design), 1 = two offset rods (as built) */
  split?: number;
  /** the nut under the upper beam heating */
  hot?: number;
  labels?: number;
  rodColor?: string;
};

export const ROOF_Y = 170, UB_Y = 452, LB_Y = 812, BEAM_H = 60;

/** The side elevation of one hanger. */
export const Elev: React.FC<ElevProps> = ({ t, cx = 960, at = {}, split = 0, hot = 0, labels, rodColor }) => {
  const L = useDisasterLook();
  const d = (a: number | undefined, len = 16) => (a === undefined ? 1 : ramp(t, a, len));
  const roof = d(at.roof), up = d(at.upper), lo = d(at.lower), rod = d(at.rod, 22), nuts = d(at.nuts, 10);
  const s = sm(split);
  const rc = rodColor ?? L.label;
  const ux = cx - 46 * s, lx = cx + 46 * s;
  return (
    <g>
      {/* roof framing, hatched */}
      <DrawBox x={cx - 380} y={ROOF_Y - 40} w={760} h={40} k={roof} />
      {roof > 0.8 && Array.from({ length: 19 }, (_, i) => (
        <line key={i} x1={cx - 370 + i * 40} y1={ROOF_Y - 40} x2={cx - 350 + i * 40} y2={ROOF_Y} stroke={L.line} strokeOpacity={0.35} strokeWidth={2} />
      ))}
      {/* fourth floor: deck and box beam */}
      <DrawBox x={cx - 440} y={UB_Y - 24} w={880} h={24} k={up} />
      <DrawBox x={cx - 150} y={UB_Y} w={300} h={BEAM_H} k={up} />
      {up > 0.8 && <line x1={cx - 150} y1={UB_Y + BEAM_H / 2} x2={cx + 150} y2={UB_Y + BEAM_H / 2} stroke={L.line} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="10 8" />}
      {/* second floor */}
      <DrawBox x={cx - 440} y={LB_Y - 24} w={880} h={24} k={lo} />
      <DrawBox x={cx - 150} y={LB_Y} w={300} h={BEAM_H} k={lo} />
      {/* the rod(s) */}
      {s < 0.02 ? (
        <DrawLine x1={cx} y1={ROOF_Y} x2={cx} y2={LB_Y + BEAM_H + 34} k={rod} color={rc} w={15} />
      ) : (
        <>
          <DrawLine x1={ux} y1={ROOF_Y} x2={ux} y2={UB_Y + BEAM_H + 34 + (1 - s) * 20} k={rod} color={rc} w={15} />
          <DrawLine x1={lx} y1={UB_Y - 30 - s * 18 + 18} x2={lx} y2={LB_Y + BEAM_H + 34} k={rod} color={rc} w={15} />
        </>
      )}
      {/* nuts: under each beam; as built, the lower rod's nut sits on top of the upper beam */}
      <Nut x={ux} y={UB_Y + BEAM_H + 4} k={nuts} hot={hot} s={1.5} />
      <Nut x={lx} y={LB_Y + BEAM_H + 4} k={nuts} s={1.5} />
      {s > 0.5 && <g transform={`translate(${lx} ${UB_Y - 24 - 26}) scale(1 -1) translate(0 -22)`}><Nut x={0} y={0} k={nuts * (s - 0.5) * 2} s={1.5} /></g>}
      {labels !== undefined && (
        <>
          <MonoLabel x={cx + 420} y={ROOF_Y - 8} t={t} at={labels} text="roof framing" size={44} color={L.ink} />
          <MonoLabel x={cx + 470} y={UB_Y + 10} t={t} at={labels + 8} text="fourth floor" size={44} />
          <MonoLabel x={cx + 470} y={LB_Y + 10} t={t} at={labels + 16} text="second floor" size={44} />
        </>
      )}
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
