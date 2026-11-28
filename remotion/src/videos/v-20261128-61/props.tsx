// Shared pieces for "Mumbai ki seedh mein duniya ka kaunsa bada shehar?": a straight line east along Mumbai's
// latitude, across India, South-East Asia, the Pacific and Hawaii to Mexico City. Device: the straight line across
// the world. India on India's official map (flat/india.tsx: IndiaMap, and IndiaOutline on the world map); every
// latitude figure comes from params.fig.
import React, { useMemo } from "react";
import { Block, INK, STROKE, Txt } from "../../flat/kit";
import { WorldMap, country, useAt, useMap } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { IndiaMap, IndiaOutline, type StateFx } from "../../flat/india";

export type LL = [number, number];
export type Frame = { center: LL; scale: number };

/** The line's latitude: Mumbai's (19° 4′ N), drawn by the map as the place where the line runs. */
export const LAT = 19.076;
export const MUMBAI: LL = [72.88, LAT];
export const MEXICO_CITY: LL = [-99.13, 19.43];
/** Where the line leaves India's east coast and where it reaches Mexico, measured on the maps' outlines. */
export const EAST_COAST = 84.8;
export const MEXICO_COAST = -104.35;
/** Longitudes run on past 180 so the line stays continuous across the Pacific (260.87 is Mexico City). */
export const MX_LON = 360 - 99.13;

export const GOLD = "#ffc43d";
export const MH = "#f2a33a";

/** A framing whose `center` lands `lift` px above the middle of the frame (the captions take the bottom). */
export const frame = (lon: number, lat: number, scale: number, lift = 220): Frame => ({ center: [lon, lat - (lift / scale) * (180 / Math.PI)], scale });
export const lerpF = (a: Frame, b: Frame, k: number): Frame => {
  const q = Math.max(0, Math.min(1, k));
  return { center: [a.center[0] + (b.center[0] - a.center[0]) * q, a.center[1] + (b.center[1] - a.center[1]) * q],
    scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * q) };
};
const wrap = (lon: number) => ((lon + 540) % 360) - 180;

/** India's map with the camera at `f`. */
export const IndiaView: React.FC<{ f: Frame; states?: Record<string, StateFx>; dim?: number; children?: React.ReactNode }> = ({ f, states = {}, dim = 0.45, children }) => (
  <IndiaMap w={1080} h={1920} frame={f} states={states} dim={dim} sheet="#f1e6cf">{children}</IndiaMap>
);

const WORLD = ["China", "Vietnam", "Laos", "Thailand", "Myanmar", "Cambodia", "Philippines", "Taiwan", "Japan", "South Korea", "North Korea",
  "Mongolia", "Russia", "Malaysia", "Indonesia", "Papua New Guinea", "Australia", "Bangladesh", "Bhutan", "Nepal", "Pakistan", "Sri Lanka",
  "Afghanistan", "Iran", "Oman", "United States of America", "Canada", "Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Cuba"];

/** The world map centred on the Pacific (India drawn only by its official outline), camera at `f`. */
export const WorldView: React.FC<{ f: Frame; india?: Record<string, string>; children?: React.ReactNode }> = ({ f, india = {}, children }) => (
  <WorldMap w={1080} h={1920} kind="flat" lon0={180} center={[wrap(f.center[0]), f.center[1]]} scale={f.scale} only={WORLD} detail="50m"
    land="#d9cfb8" sea="url(#v61sea)">
    <IndiaOutline sheet="#f1e6cf" fill={india} />
    {children}
  </WorldMap>
);

/** The latitude line from lon `a` to lon `a + (b - a) * k`: a soft glow, a white dashed line marching east, a bright
 * head (the traveller) on its tip. `t` moves the dashes. */
export const LatLine: React.FC<{ a: number; b: number; k: number; t: number; glow?: number; head?: boolean; width?: number; lat?: number; ship?: number }> = ({ a, b, k, t, glow = 0, head = true, width = 9, lat = LAT, ship = 0 }) => {
  const at = useAt();
  const q = Math.max(0, Math.min(1, k));
  if (q <= 0) return null;
  const end = a + (b - a) * q;
  const n = Math.max(2, Math.ceil(Math.abs(end - a) / 0.25));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const xy = at([wrap(a + ((end - a) * i) / n), lat]);
    if (xy && isFinite(xy[0])) pts.push(xy);
  }
  if (pts.length < 2) return null;
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [hx, hy] = pts[pts.length - 1]!;
  return (
    <g data-probe="skip">
      <path d={d} fill="none" stroke="#ffd84a" strokeOpacity={0.25 + 0.35 * glow} strokeWidth={width * (2.6 + glow)} strokeLinecap="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 6} strokeLinecap="round" opacity={0.55} />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={width} strokeLinecap="round" strokeDasharray={`${width * 3} ${width * 1.6}`} strokeDashoffset={-t * 2.2} />
      {head && ship > 0 ? (
        <g transform={`translate(${hx} ${hy + Math.sin(t / 6) * 4}) rotate(${Math.sin(t / 9) * 3}) scale(${ship})`}>
          <ellipse cx={0} cy={18} rx={120} ry={22} fill="#cfeeff" opacity={0.5} />
          <path d="M -110 -10 L 110 -10 L 80 30 L -80 30 Z" fill="#e8453c" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <rect x={-60} y={-46} width={110} height={36} rx={6} fill="#ffffff" stroke={INK} strokeWidth={6} />
          <rect x={-6} y={-150} width={10} height={106} fill="#6b5a44" stroke={INK} strokeWidth={4} />
          <path d="M 4 -146 L 92 -60 L 4 -60 Z" fill="#ffd84a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -6 -136 L -84 -60 L -6 -60 Z" fill="#ffffff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      ) : head ? (
        <g transform={`translate(${hx} ${hy})`}>
          <circle r={34 + 6 * Math.sin(t / 5)} fill="#ffd84a" opacity={0.35} />
          <circle r={20} fill="#ffd84a" stroke={INK} strokeWidth={5} />
          <path d="M -8 -9 L 10 0 L -8 9 Z" fill={INK} />
        </g>
      ) : null}
    </g>
  );
};

/** Places on the map: children get the screen point of `ll`. */
export const OnMap: React.FC<{ ll: LL; children: (x: number, y: number) => React.ReactNode }> = ({ ll, children }) => {
  const xy = useAt()([wrap(ll[0]), ll[1]]);
  if (!xy) return null;
  return <>{children(xy[0], xy[1])}</>;
};

/** A white name pill with an ink edge and a stem down to (x, y). */
export const Pill: React.FC<{ x: number; y: number; text: string; k: number; size?: number; dy?: number; bg?: string; fg?: string }> = ({ x, y, text, k, size = 54, dy = -110, bg = "#ffffff", fg = INK }) => {
  if (k <= 0) return null;
  const W = Math.max(150, text.length * size * 0.56 + 60), H = size * 1.5;
  const px = Math.min(Math.max(x, W / 2 + 40), 1080 - 170 - W / 2), py = y + dy;
  const s = 0.6 + 0.4 * Math.min(1, k);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <line x1={x} y1={y} x2={px} y2={py + H / 2} stroke={INK} strokeWidth={5} />
      <g transform={`translate(${px} ${py}) scale(${s})`}>
        <rect x={-W / 2 + 6} y={-H / 2 + 8} width={W} height={H} rx={H / 2} fill={INK} opacity={0.35} />
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={H / 2} fill={bg} stroke={INK} strokeWidth={STROKE * 0.7} />
        <Txt x={0} y={2} size={size} fill={fg} weight={800}>{text}</Txt>
      </g>
    </g>
  );
};

/** A city pin dropping in on (x, y) with a pulsing ring. */
export const Pin: React.FC<{ x: number; y: number; k: number; t: number; color?: string; r?: number }> = ({ x, y, k, t, color = "#e8453c", r = 26 }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -140;
  const ring = (t % 40) / 40;
  return (
    <g transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, k * 2)}>
      <circle cx={0} cy={0} r={r * (0.6 + 1.6 * ring)} fill="none" stroke={color} strokeWidth={5} opacity={0.7 * (1 - ring)} />
      <ellipse cx={0} cy={4} rx={r * 0.7} ry={r * 0.25} fill={INK} opacity={0.35} />
      <path d={`M0,0 C${-r},${-r * 1.4} ${-r},${-r * 2.6} 0,${-r * 2.6} C${r},${-r * 2.6} ${r},${-r * 1.4} 0,0 Z`} fill={color} stroke={INK} strokeWidth={STROKE * 0.7} />
      <circle cx={0} cy={-r * 1.75} r={r * 0.36} fill="#ffffff" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A latitude signpost planted at (x, y): a post with a yellow board showing "<lat>° N". */
export const LatSign: React.FC<{ x: number; y: number; k: number; lat: string; big?: boolean; glow?: number; t: number }> = ({ x, y, k, lat, big = false, glow = 0, t }) => {
  if (k <= 0) return null;
  const fs = big ? 104 : 78;
  const text = `${lat}° N`;
  const W = Math.max(300, text.length * fs * 0.6 + 80), H = fs * 1.55, pole = big ? 300 : 240;
  const bx = Math.min(Math.max(x, W / 2 + 40), 1080 - 170 - W / 2);
  const rise = (1 - Math.min(1, k)) * pole;
  const sway = Math.sin(t / 11) * 1.5;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <ellipse cx={x} cy={y + 4} rx={24} ry={8} fill={INK} opacity={0.35} />
      <rect x={x - 7} y={y - pole + rise} width={14} height={pole - rise} fill="#6b5a44" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${bx} ${y - pole + rise - H / 2}) rotate(${sway})`}>
        {glow > 0 ? <rect x={-W / 2 - 18} y={-H / 2 - 18} width={W + 36} height={H + 36} rx={26} fill="#ffd84a" opacity={0.45 * glow} data-probe="skip" /> : null}
        <rect x={-W / 2 + 8} y={-H / 2 + 10} width={W} height={H} rx={18} fill={INK} opacity={0.4} />
        <Block x={-W / 2} y={-H / 2} w={W} h={H} r={18} fill={GOLD} sw={STROKE} shadow={false} />
        <Txt x={0} y={-2} size={fs} fill={INK} weight={900}>{text}</Txt>
      </g>
    </g>
  );
};

/** A big question mark in a white disc at (x, y). */
export const Question: React.FC<{ x: number; y: number; k: number; r?: number; spin?: number }> = ({ x, y, k, r = 90, spin = 0 }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * Math.min(1, k) + 0.15 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle cx={6} cy={8} r={r} fill={INK} opacity={0.35} />
      <circle r={r} fill="#ffffff" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={4} size={r * 1.4} fill="#e8453c" weight={900}>?</Txt>
    </g>
  );
};

/** Part of a country: only its polygons whose first point falls inside `box` ([lon0, lat0, lon1, lat1]); Hainan out of
 * China, the island of Hawaii out of the United States. */
type Pos = number[];
type Geo = { type: string; coordinates: unknown };
type Feat = { type: "Feature"; properties: Record<string, unknown>; geometry: Geo };
const pieces = (name: string, box?: [number, number, number, number]): Feat | undefined => {
  const c = country(name, "50m");
  if (!c) return undefined;
  if (!box) return c as unknown as Feat;
  const g = c.geometry as unknown as Geo;
  const polys: Pos[][][] = g.type === "Polygon" ? [g.coordinates as Pos[][]] : (g.coordinates as Pos[][][]);
  const inBox = (p: Pos[][]) => {
    const [lo, la] = p[0]![0]!;
    return lo! >= box[0] && lo! <= box[2] && la! >= box[1] && la! <= box[3];
  };
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys.filter(inBox) } };
};

/** A country (or a part of it, `box`) filled with its colour and its whole flag clipped inside, rising with `lift`,
 * a bright line tracing its edge with `trace`. */
export const Land: React.FC<{ name: string; box?: [number, number, number, number]; fill: string; flag?: string; k: number; lift?: number; trace?: number; min?: number }> = ({
  name, box, fill, flag, k, lift = 0, trace = 0, min = 0,
}) => {
  const f = useMemo(() => pieces(name, box), [name, box?.join(",")]);   // eslint-disable-line react-hooks/exhaustive-deps
  const { path } = useMap();
  const id = `land${name.replace(/[^a-zA-Z]/g, "")}${box ? box.map((v) => Math.round(Math.abs(v))).join("") : ""}`;
  if (!f || k <= 0) return null;
  const gf = f as unknown as Parameters<typeof path>[0];
  const d = path(gf) ?? "";
  const [[x0, y0], [x1, y1]] = path.bounds(gf as Parameters<typeof path.bounds>[0]);
  // a small island drawn too small to read is grown round its middle to at least `min` px wide
  const wpx = x1 - x0, grow = min > 0 && wpx < min ? min / Math.max(1, wpx) : 1;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const up = lift * 14;
  const q = Math.min(1, k);
  return (
    <g opacity={q} transform={`translate(${cx} ${cy - up}) scale(${grow * (0.85 + 0.15 * q)}) translate(${-cx} ${-cy})`}>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      {lift > 0 ? <path d={d} fill={INK} opacity={0.3 * lift} transform={`translate(5 ${7 + up * 0.4})`} /> : null}
      <g clipPath={`url(#${id})`}>
        <path d={d} fill={fill} />
        {flag ? <FlagArt name={flag} x={x0} y={y0} w={x1 - x0} h={y1 - y0} cover /> : null}
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={Math.max(3, STROKE * 0.6) / grow} strokeLinejoin="round" />
      {trace > 0 ? (
        <path d={d} fill="none" stroke="#ffd84a" strokeWidth={(STROKE * 1.6) / grow} strokeLinejoin="round" strokeLinecap="round" pathLength={1}
          strokeDasharray={trace < 1 ? `${trace} 1` : undefined} data-probe="skip" />
      ) : null}
    </g>
  );
};


/** A comment bubble at (x, y). */
export const Bubble: React.FC<{ x: number; y: number; k: number; text: string }> = ({ x, y, k, text }) => {
  if (k <= 0) return null;
  const s = 0.5 + 0.5 * Math.min(1, k);
  const W = Math.max(260, text.length * 30 + 80), H = 110;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <path d={`M ${-W / 2 + 40} ${H / 2} L ${-W / 2 + 30} ${H / 2 + 46} L ${-W / 2 + 90} ${H / 2} Z`} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.7} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={30} fill="#ffffff" stroke={INK} strokeWidth={STROKE * 0.7} />
      <Txt x={0} y={4} size={54} fill={INK} weight={800}>{text}</Txt>
    </g>
  );
};

const props = { LAT, MUMBAI, MEXICO_CITY };
export default props;

/** The open ocean as a texture (for Stage `defs`): deep blue with rows of wave crests drifting east with `t`, so the
 * wide Pacific never reads as an empty sheet. */
export const SeaDefs: React.FC<{ t: number }> = ({ t }) => (
  <pattern id="v61sea" patternUnits="userSpaceOnUse" width={240} height={120} patternTransform={`translate(${(t * 0.8) % 240} ${Math.sin(t / 20) * 6})`}>
    <rect width={240} height={120} fill="#2a6690" />
    <path d="M 0 40 q 30 -26 60 0 t 60 0 t 60 0 t 60 0 L 240 95 q -30 -22 -60 0 t -60 0 t -60 0 t -60 0 Z" fill="#3d86b6" />
    <path d="M 0 40 q 30 -26 60 0 t 60 0 t 60 0 t 60 0" fill="none" stroke="#b6e1f5" strokeWidth={9} strokeLinecap="round" opacity={0.8} />
  </pattern>
);
