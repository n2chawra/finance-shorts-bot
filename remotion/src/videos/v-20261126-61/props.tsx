// Shared pieces for "भारत का समुद्र तट अचानक इतना लंबा कैसे हो गया?" (India Maps; device: the coast lit state by state
// round the peninsula, then the old ruler-drawn coastline against the re-measured one). India's official map from
// the India layer (flat/india.tsx); every figure comes from params.fig.
import React from "react";
import { Block, INK, STROKE, Txt } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { IndiaMap, StateTag, frameOf, lerpFrame, stateColours, type StateFx } from "../../flat/india";

export { lerpFrame, StateTag };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

export const WEST = ["Gujarat", "Maharashtra", "Goa", "Karnataka", "Kerala"];
export const EAST = ["Tamil Nadu", "Andhra Pradesh", "Odisha", "West Bengal"];
export const DD = "Dadra and Nagar Haveli and Daman and Diu";
export const UTS = [DD, "Puducherry", "Lakshadweep", "Andaman and Nicobar"];
export const COAST = [...WEST, ...EAST];

/** One strong colour per state, two coastal neighbours never the same. */
export const TONES = ["#f2a93b", "#e8553c", "#3d8bd9", "#5fae6a", "#b467c9", "#2fb5a5", "#e66aa0", "#9bc24a"];
export const COLOUR: Record<string, string> = { ...stateColours(TONES, COAST, 1), Gujarat: "#f2a93b" };
export const UT_COLOUR = "#2fc4c0";

/** Where each tag sits, out in the sea beside its coast. */
export const TAG_AT: Record<string, LL> = {
  Gujarat: [68.4, 21.4], Maharashtra: [71.2, 18.6], Goa: [72.2, 15.4], Karnataka: [72.9, 13.4], Kerala: [74.2, 9.6],
  "Tamil Nadu": [81.4, 10.4], "Andhra Pradesh": [83.6, 15.4], Odisha: [87.4, 19.2], "West Bengal": [89.4, 21.2],
  [DD]: [70.4, 19.6], Puducherry: [81.4, 12.2], Lakshadweep: [72.4, 10.2], "Andaman and Nicobar": [91.0, 12.0],
};
export const TAG_TEXT: Record<string, string | undefined> = { [DD]: "दमन दीव", "Andaman and Nicobar": "अंडमान निकोबार" };

/** A framing of these states that keeps them in the top 1360 px (the captions band stays clear). */
const PX_DEG = 180 / Math.PI;
export const upper = (focus: string[], pad = 90): Frame => {
  const f = frameOf(focus, 1080, 1640, pad);
  return { center: [f.center[0], f.center[1] - (110 * PX_DEG) / f.scale], scale: f.scale };
};
export const F = {
  india: upper(["India"], 30),
  south: upper(["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Goa"], 100),
  west: upper(WEST, 110),
  east: upper(EAST, 110),
  peninsula: upper(["Gujarat", "Kerala", "Tamil Nadu", "West Bengal", "Odisha"], 40),
  gujarat: upper(["Gujarat"], 120),
  khambhat: { center: [72.3, 21.2] as LL, scale: upper(["Gujarat"], 120).scale * 1.9 },
} satisfies Record<string, Frame>;

/** Painted states (already made on screen by earlier beats). */
export const painted = (names: string[], k = 1): Record<string, StateFx> =>
  Object.fromEntries(names.map((n) => [n, { fill: n.startsWith("Dadra") || UTS.includes(n) ? UT_COLOUR : COLOUR[n]!, k }]));

export const MapView: React.FC<{ frame: Frame; states?: Record<string, StateFx>; dim?: number; sheet?: string; children?: React.ReactNode }> = ({ frame, states, dim = 0.5, sheet, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet={sheet}>{children}</IndiaMap>
);

/** Stand something on a [lon, lat] point of the current map. */
export const OnMap: React.FC<{ at: LL; children: (x: number, y: number) => React.ReactNode }> = ({ at, children }) => {
  const xy = useAt()(at);
  return xy ? <>{children(xy[0], xy[1])}</> : null;
};

/** The tags of the states named so far, each popping in with its `k`. */
export const Tags: React.FC<{ names: string[]; ks: number[]; size?: number }> = ({ names, ks, size = 46 }) => (
  <>{names.map((n, i) => <StateTag key={n} state={n} at={TAG_AT[n]} text={TAG_TEXT[n]} k={ks[i] ?? 1} size={size} dy={-56} />)}</>
);

/** A big question mark on a white disc. */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 86 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI)})`} opacity={Math.min(1, k * 2)}>
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** A sign board in screen space (a title over a big value), dropping in with `k`. */
export const Board: React.FC<{ x: number; y: number; k: number; title: string; value: string; bg?: string; fg?: string; w?: number; shake?: number }> = ({
  x, y, k, title, value, bg = "#1d5f8a", fg = "#ffffff", w = 620, shake = 0,
}) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -260;
  return (
    <g transform={`translate(${x + Math.sin(shake * 20) * 14 * shake} ${y + drop}) rotate(${shake * 3 * Math.sin(shake * 12)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2 + 10} y={-110 + 12} width={w} height={220} rx={26} fill={INK} opacity={0.4} />
      <Block x={-w / 2} y={-110} w={w} h={220} r={26} fill={bg} sw={STROKE} shadow={false} />
      <rect x={-w / 2 + 18} y={-92} width={w - 36} height={184} rx={16} fill="none" stroke={fg} strokeWidth={5} opacity={0.8} />
      <Txt x={0} y={-42} size={48} fill={fg} weight={700}>{title}</Txt>
      <Txt x={0} y={44} size={88} fill={fg} weight={900}>{value}</Txt>
    </g>
  );
};

/** The coast as an old school atlas drew it: straight ruled lines between a few points. */
export const RULED: LL[] = [[68.4, 23.5], [69.0, 22.3], [70.9, 20.7], [72.8, 19.0], [73.8, 15.4], [76.2, 9.6], [77.5, 8.1],
  [79.8, 10.3], [80.3, 13.1], [82.3, 16.6], [85.8, 19.8], [88.1, 21.6]];
export const Ruled: React.FC<{ k: number; color?: string; width?: number; dash?: boolean }> = ({ k, color = "#7a4a1c", width = 9, dash = true }) => {
  const at = useAt();
  if (k <= 0) return null;
  const pts = RULED.map((ll) => at(ll)).filter((v): v is [number, number] => !!v);
  const d = `M ${pts.map((q) => q.join(" ")).join(" L ")}`;
  return (
    <g data-probe="skip">
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="miter"
        pathLength={1} strokeDasharray={k < 1 ? `${k} 1` : undefined} opacity={0.9} />
      {dash ? pts.map((q, i) => (i / (pts.length - 1) <= k ? <circle key={i} cx={q[0]} cy={q[1]} r={width * 1.1} fill="#fff6e0" stroke={color} strokeWidth={4} /> : null)) : null}
    </g>
  );
};

/** A measuring wheel (a surveyor's wheel on a handle), rolling: `spin` turns it. */
export const Wheel: React.FC<{ x: number; y: number; r?: number; spin: number; k?: number }> = ({ x, y, r = 46, spin, k = 1 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1, k)})`} data-probe="skip">
      <line x1={0} y1={0} x2={r * 1.6} y2={-r * 2.6} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <line x1={r * 1.6} y1={-r * 2.6} x2={r * 2.1} y2={-r * 2.6} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <circle r={r} fill="#ffd84a" stroke={INK} strokeWidth={7} />
      {[0, 60, 120].map((a) => <line key={a} x1={-r * 0.85 * Math.cos(((a + spin) * Math.PI) / 180)} y1={-r * 0.85 * Math.sin(((a + spin) * Math.PI) / 180)}
        x2={r * 0.85 * Math.cos(((a + spin) * Math.PI) / 180)} y2={r * 0.85 * Math.sin(((a + spin) * Math.PI) / 180)} stroke={INK} strokeWidth={5} />)}
      <circle r={9} fill={INK} />
    </g>
  );
};

/** A comment bubble with three dots. */
export const Bubble: React.FC<{ x: number; y: number; k: number; bounce?: number }> = ({ x, y, k, bounce = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y - 20 * bounce}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 2)} data-probe="skip">
      <path d="M -150 -90 Q -150 -130 -110 -130 L 110 -130 Q 150 -130 150 -90 L 150 30 Q 150 70 110 70 L -40 70 L -90 120 L -80 70 L -110 70 Q -150 70 -150 30 Z" fill="#ffffff" stroke={INK} strokeWidth={8} />
      {[-60, 0, 60].map((dx) => <circle key={dx} cx={dx} cy={-30} r={18} fill="#3d8bd9" />)}
    </g>
  );
};
export default MapView;
