// Shared pieces for "Why do Telangana's new vehicles say TG instead of TS?" (India Maps sample 1, device: fill the
// map, every state's number-plate code dropping onto it, ending on the one state that changed its code). India's
// official map from the India layer (flat/india.tsx); plates are letters only, the year comes from params.fig.
import React from "react";
import { Ball, Block, INK, STROKE, Txt, shade } from "../../flat/kit";
import { IndiaMap, Plate, frameOf, lerpFrame, stateColours, type StateFx } from "../../flat/india";

export { frameOf, lerpFrame, Plate };
export type Frame = { center: [number, number]; scale: number };
export type LL = [number, number];

/** Each state's registration code (letters only), from the topic's sourced items (Wikipedia, Nov 2026). */
export const CODES: Record<string, string> = {
  "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", Assam: "AS", Bihar: "BR", Chhattisgarh: "CG", Goa: "GA", Gujarat: "GJ",
  Haryana: "HR", "Himachal Pradesh": "HP", Jharkhand: "JH", Karnataka: "KA", Kerala: "KL", "Madhya Pradesh": "MP",
  Maharashtra: "MH", Manipur: "MN", Meghalaya: "ML", Mizoram: "MZ", Nagaland: "NL", Odisha: "OD", Punjab: "PB",
  Rajasthan: "RJ", Sikkim: "SK", "Tamil Nadu": "TN", Telangana: "TG", Tripura: "TR", "Uttar Pradesh": "UP",
  Uttarakhand: "UK", "West Bengal": "WB", "Andaman and Nicobar": "AN", Chandigarh: "CH",
  "Dadra and Nagar Haveli and Daman and Diu": "DD", Delhi: "DL", "Jammu and Kashmir": "JK", Ladakh: "LA",
  Lakshadweep: "LD", Puducherry: "PY",
};

/** The order the map fills in, beat by beat. */
export const NORTH = ["Delhi", "Punjab", "Uttar Pradesh", "Bihar"];
export const WEST = ["Maharashtra", "Gujarat", "Karnataka", "Kerala"];
export const ODD = ["Uttarakhand", "Chhattisgarh", "Ladakh"];
export const TEL = "Telangana";
export const SHOWN = [TEL, ...NORTH, ...WEST, ...ODD];

/** The video's palette: bright, warm, and two touching states never the same. */
export const TONES = ["#ffc43d", "#e8453c", "#3d8bd9", "#5fae6a", "#b467c9", "#f08a3c", "#2fb5a5", "#e66aa0", "#9bc24a"];
export const COLOUR: Record<string, string> = { ...stateColours(TONES, Object.keys(CODES), 2), [TEL]: "#ffc43d" };

/** Framings the camera moves between. */
export const F = {
  india: frameOf(["India"], 1080, 1920, 70),
  tel: frameOf([TEL], 1080, 1920, 300),
  telWide: frameOf([TEL, "Andhra Pradesh", "Karnataka", "Maharashtra"], 1080, 1920, 120),
  south: frameOf(["Telangana", "Andhra Pradesh", "Karnataka", "Tamil Nadu"], 1080, 1920, 110),
  north: frameOf(["Punjab", "Bihar", "Uttar Pradesh", "Delhi"], 1080, 1920, 90),
  west: frameOf(["Gujarat", "Maharashtra", "Karnataka", "Kerala"], 1080, 1920, 100),
  odd: frameOf(["Ladakh", "Uttarakhand", "Chhattisgarh"], 1080, 1920, 90),
  ladakh: frameOf(["Ladakh", "Uttarakhand"], 1080, 1920, 120),
} satisfies Record<string, Frame>;

/** The states already painted when a beat starts (everything filled in by earlier beats). */
export const doneBefore = (beat: "hook" | "promise" | "north" | "west" | "odd" | "turn" | "payoff" | "loop"): string[] => {
  const order: Record<string, string[]> = {
    hook: [], promise: [], north: [], west: NORTH, odd: [...NORTH, ...WEST], turn: [...NORTH, ...WEST, ...ODD],
    payoff: [...NORTH, ...WEST, ...ODD], loop: [...NORTH, ...WEST, ...ODD],
  };
  return order[beat] ?? [];
};

/** Fills for states that are already painted. */
export const painted = (names: string[]): Record<string, StateFx> => Object.fromEntries(names.map((n) => [n, { fill: COLOUR[n]! }]));

/** The map, with the camera at `frame`; children draw in map coordinates (MapLabel, Plate, useAt). */
export const MapView: React.FC<{ frame: Frame; states: Record<string, StateFx>; dim?: number; sheet?: string; children?: React.ReactNode }> = ({ frame, states, dim, sheet, children }) => (
  <IndiaMap w={1080} h={1920} frame={frame} states={states} dim={dim} sheet={sheet}>{children}</IndiaMap>
);

/** The plates of states painted earlier, standing on their states (smaller, no bounce). */
export const OldPlates: React.FC<{ names: string[]; size?: number }> = ({ names, size = 0.8 }) => (
  // earlier states' plates are background: small, so the layout probe skips them (the new ones are read)
  <g data-probe="skip">{names.map((n) => <Plate key={n} state={n} text={CODES[n]!} size={size} maxY={1100} />)}</g>
);

/** A small side-on car (for the Telangana beats): body, windows, two wheels, its own plate on the back.
 * `x`, `y`: the middle of its wheels' line, `s`: length in px; `code` is the plate's letters. */
export const Car: React.FC<{ x: number; y: number; s?: number; color?: string; code?: string; t?: number; painted?: number }> = ({ x, y, s = 220, color = "#3d8bd9", code, t = 0, painted = 1 }) => {
  const h = s * 0.32, wr = s * 0.11, bob = Math.sin(t / 3) * s * 0.006;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <ellipse cx={0} cy={wr * 0.9} rx={s * 0.52} ry={wr * 0.35} fill={INK} opacity={0.25} />
      <Block x={-s / 2} y={-h - wr * 0.3} w={s} h={h} r={s * 0.08} fill={color} sw={STROKE * 0.7} />
      <path d={`M ${-s * 0.28} ${-h - wr * 0.3} L ${-s * 0.18} ${-h * 1.9} L ${s * 0.2} ${-h * 1.9} L ${s * 0.32} ${-h - wr * 0.3} Z`}
        fill={shade(color, -0.15)} stroke={INK} strokeWidth={STROKE * 0.7} strokeLinejoin="round" />
      <path d={`M ${-s * 0.21} ${-h - wr * 0.3 - 6} L ${-s * 0.14} ${-h * 1.75} L ${s * 0.16} ${-h * 1.75} L ${s * 0.25} ${-h - wr * 0.3 - 6} Z`} fill="#cfe8f7" stroke={INK} strokeWidth={4} />
      <Ball x={-s * 0.3} y={0} r={wr} fill="#2b2b33" shadow={false} />
      <Ball x={s * 0.3} y={0} r={wr} fill="#2b2b33" shadow={false} />
      {code ? (
        <g transform={`translate(${-s / 2 - 4} ${-h * 0.55})`} opacity={painted}>
          <rect x={-s * 0.2} y={-s * 0.06} width={s * 0.24} height={s * 0.12} rx={4} fill="#ffffff" stroke={INK} strokeWidth={3} />
          <Txt x={-s * 0.08} y={s * 0.035} size={Math.max(20, s * 0.085)} fill={INK} weight={900} anchor="middle" deco>{code}</Txt>
        </g>
      ) : null}
    </g>
  );
};

/** A green highway sign on two posts (the count of codes). `value` is a figure from params. */
export const HighwaySign: React.FC<{ x: number; y: number; k: number; value: string; label: string }> = ({ x, y, k, value, label }) => {
  if (k <= 0) return null;
  const up = (1 - Math.min(1, k)) * 260;
  return (
    <g transform={`translate(${x} ${y + up})`} opacity={Math.min(1, k * 2)}>
      <Block x={-150} y={-20} w={22} h={330} fill="#8a8f98" sw={4} shadow={false} />
      <Block x={128} y={-20} w={22} h={330} fill="#8a8f98" sw={4} shadow={false} />
      <Block x={-230} y={-270} w={460} h={260} r={22} fill="#1f7a45" sw={STROKE} />
      <rect x={-214} y={-254} width={428} height={228} rx={14} fill="none" stroke="#ffffff" strokeWidth={5} />
      <Txt x={0} y={-130} size={110} fill="#ffffff" weight={900} anchor="middle">{value}</Txt>
      <Txt x={0} y={-52} size={46} fill="#ffffff" weight={800} anchor="middle">{label}</Txt>
    </g>
  );
};
export default MapView;
