// Shared pieces for "This piece of Russia doesn't touch Russia" (Kaliningrad; device: timeline). The channel's
// vintage map of the Baltic, an era dial at the top that turns GERMANY -> SOVIET -> TODAY, the piece of Russia cut
// out of Natural Earth's Russia, old East Prussia (simplified), the Soviet red that joins and then drains.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";
import { FlagArt } from "../../flat/flags";

export type LL = [number, number];

export const RED = "#c8102e", SOVIET = "#b8282a", GOLD = "#f2b134", SEPIA = "#a8875a", BELARUS = "#4f9a5a", SEA = "#5f9fae";
export const KALININGRAD: LL = [20.51, 54.71];
export const PIECE_C: LL = [21.2, 54.75];
export const MOSCOW: LL = [37.62, 55.75];
export const VILNIUS: LL = [25.28, 54.69];
export const MINSK: LL = [27.56, 53.9];
export const BALTIYSK: LL = [19.9, 54.65];
/** old East Prussia (1937 borders, simplified): today's Kaliningrad plus Poland's Warmia-Masuria */
export const PRUSSIA: LL[] = [[19.25, 54.33], [19.62, 54.45], [19.95, 54.93], [20.6, 54.98], [21.2, 55.28], [22.0, 55.05], [22.85, 54.9], [22.78, 54.36], [22.95, 53.9], [22.3, 53.45], [21.0, 53.22], [20.0, 53.2], [19.55, 53.45], [19.3, 53.85]];
/** the 1945 line across it, west to east (today's Polish-Russian border, simplified) */
export const CUT: LL[] = [[19.62, 54.45], [20.4, 54.38], [21.3, 54.33], [22.1, 54.33], [22.78, 54.36]];
/** the railway east: Kaliningrad, Vilnius, Minsk, Smolensk, Moscow */
export const RAIL: LL[] = [KALININGRAD, [22.6, 54.75], VILNIUS, MINSK, [30.5, 54.6], [32.05, 54.78], [35.0, 55.3], MOSCOW];

const NEAR = ["Russia", "Poland", "Lithuania", "Latvia", "Estonia", "Belarus", "Ukraine", "Germany", "Sweden", "Denmark", "Finland", "Czechia", "Slovakia", "Norway"];
export const SOVIET_LANDS = ["Russia", "Lithuania", "Latvia", "Estonia", "Belarus", "Ukraine"];

/** The Baltic on the old map; `center` and `scale` are the camera. */
export const Map: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.35} detail="50m" only={NEAR} colors={colors}>
    {children}
  </WorldMap>
);

/** Soviet red over the Soviet lands at strength `k` (merged with `own`). */
export const sovietColors = (k: number, own: Record<string, Fill> = {}): Record<string, Fill> => {
  const out: Record<string, Fill> = {};
  if (k > 0) for (const n of SOVIET_LANDS) out[n] = { fill: SOVIET, k };
  return { ...out, ...own };
};

type Feat = { type: "Feature"; properties: object; geometry: { type: "MultiPolygon"; coordinates: number[][][][] } };
let pieceCache: Feat | null = null;
let restCache: Feat | null = null;
function split(): [Feat | null, Feat | null] {
  if (pieceCache && restCache) return [pieceCache, restCache];
  const c = country("Russia");
  if (!c) return [null, null];
  const g = c.geometry as unknown as { type: string; coordinates: number[][][] | number[][][][] };
  const polys = (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]) as number[][][][];
  const isPiece = (poly: number[][][]) => poly[0]!.every(([lon, lat]) => lon! > 19 && lon! < 23.2 && lat! > 54 && lat! < 55.6);
  pieceCache = { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys.filter(isPiece) } };
  restCache = { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys.filter((p) => !isPiece(p)) } };
  return [pieceCache, restCache];
}

/** A shape (the piece, or the rest of Russia) filled with a colour and a flag clipped inside it, its border traced. */
const Shape: React.FC<{ which: "piece" | "rest"; fill?: string; k?: number; flag?: string; flagK?: number; trace?: number; glow?: number; id: string }> = ({ which, fill = RED, k = 0, flag, flagK = 0, trace = 0, glow = 0, id }) => {
  const { path } = useMap();
  const f = split()[which === "piece" ? 0 : 1];
  if (!f) return null;
  const d = path(f as never) ?? undefined;
  if (!d) return null;
  const [[x0, y0], [x1, y1]] = path.bounds(f as never);
  const bx0 = Math.max(x0, -300), by0 = Math.max(y0, -300), bx1 = Math.min(x1, 1380), by1 = Math.min(y1, 2220);
  let fx = bx0, fy = by0, fw = bx1 - bx0, fh = by1 - by0;
  if (which === "piece") {     // the whole flag at 3:2, centred on the piece
    fx = x0 - 4; fy = y0 - 4; fw = x1 - x0 + 8; fh = y1 - y0 + 8;     // the tricolour's three stripes across the piece
  }
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      {glow > 0 ? <path d={d} fill="none" stroke="#fff2b0" strokeWidth={34} opacity={0.45 * glow} strokeLinejoin="round" /> : null}
      {k > 0 ? <path d={d} fill={fill} opacity={Math.min(1, k)} /> : null}
      {flag && flagK > 0 && fw > 0 && fh > 0 ? (
        <g clipPath={`url(#${id})`} opacity={Math.min(1, flagK)}>
          <FlagArt name={flag} x={fx} y={fy} w={fw} h={fh} />
        </g>
      ) : null}
      {k > 0 || flagK > 0 ? <path d={d} fill="none" stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" /> : null}
      {trace > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={10} pathLength={1} strokeDasharray={`${Math.min(1, trace)} 1`} strokeLinejoin="round" strokeLinecap="round" /> : null}
    </g>
  );
};

/** Kaliningrad: the piece of Russia cut out of Natural Earth's Russia. */
export const Piece: React.FC<{ k?: number; fill?: string; flagK?: number; trace?: number; glow?: number }> = ({ k = 0, fill = RED, flagK = 0, trace = 0, glow = 0 }) => (
  <Shape which="piece" id="kal-piece" k={k} fill={fill} flag="Russia" flagK={flagK} trace={trace} glow={glow} />
);

/** The rest of Russia, in its flag at `flagK`. */
export const Rest: React.FC<{ k?: number; fill?: string; flagK?: number; trace?: number }> = ({ k = 0, fill = RED, flagK = 0, trace = 0 }) => (
  <Shape which="rest" id="kal-rest" k={k} fill={fill} flag="Russia" flagK={flagK} trace={trace} />
);

const ring = (at: (p: LL) => [number, number] | null, via: LL[]) => {
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  return xy.length < 3 ? null : xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
};

/** Old East Prussia: painted in from its middle (`k`), Germany's flag clipped inside (`flagK`), sepia when `old`. */
export const Prussia: React.FC<{ k: number; flagK?: number; edge?: number; o?: number }> = ({ k, flagK = 0, edge = 0, o = 1 }) => {
  const at = useAt();
  const d = ring(at, PRUSSIA);
  if (!d || k <= 0) return null;
  const c = at([21.0, 54.2]);
  const kk = Math.min(1, k);
  const xs = PRUSSIA.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const x0 = Math.min(...xs.map((p) => p[0])), x1 = Math.max(...xs.map((p) => p[0])), y0 = Math.min(...xs.map((p) => p[1])), y1 = Math.max(...xs.map((p) => p[1]));
  const fw = Math.max(x1 - x0, (y1 - y0) * 1.5), fh = fw / 1.5;
  return (
    <g opacity={o} transform={c ? `translate(${c[0]},${c[1]}) scale(${0.3 + 0.7 * kk}) translate(${-c[0]},${-c[1]})` : undefined}>
      <defs><clipPath id="prussia-clip"><path d={d} /></clipPath></defs>
      <path d={d} fill="#d8c39a" opacity={kk} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {flagK > 0 ? (
        <g clipPath="url(#prussia-clip)" opacity={Math.min(1, flagK) * 0.92}>
          <FlagArt name="Germany" x={(x0 + x1) / 2 - fw / 2} y={(y0 + y1) / 2 - fh / 2} w={fw} h={fh} />
        </g>
      ) : null}
      <path d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {edge > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={10} pathLength={1} strokeDasharray={`${Math.min(1, edge)} 1`} strokeLinejoin="round" /> : null}
    </g>
  );
};

/** The era dial pinned to the top of the frame (outside the camera): GERMANY, SOVIET, TODAY; `pos` 0..2 moves the pointer. */
export const Dial: React.FC<{ pos: number; k?: number }> = ({ pos, k = 1 }) => {
  if (k <= 0) return null;
  const xs = [345, 590, 820];
  const names = ["GERMANY", "SOVIET", "TODAY"];
  const i0 = Math.max(0, Math.min(1.999, pos));
  const px = xs[Math.floor(i0)]! + (xs[Math.min(2, Math.floor(i0) + 1)]! - xs[Math.floor(i0)]!) * (i0 - Math.floor(i0));
  const near = Math.round(Math.max(0, Math.min(2, pos)));
  return (
    <g opacity={Math.min(1, k)} transform={`translate(0,${(1 - Math.min(1, k)) * -80})`}>
      <Block x={215} y={235} w={760} h={150} fill="#f4e6c4" r={28} />
      <Limb a={[300, 345]} b={[880, 345]} w={10} color="#8a6a4a" sw={3} />
      {xs.map((x, i) => <Ball key={i} x={x} y={345} r={13} fill={i === near ? GOLD : "#cdb68a"} sw={3} shadow={false} />)}
      {names.map((n, i) => <Txt key={n} x={xs[i]!} y={305} size={48} fill={i === near ? "#8a1a1a" : "#6b5236"}>{n}</Txt>)}
      <path d={`M${px - 22},${385} L${px},${352} L${px + 22},${385} Z`} fill={RED} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

/** A question mark sign, popping on `k`. */
export const QMark: React.FC<{ x: number; y: number; size: number; k: number; t: number }> = ({ x, y, size, k, t }) => {
  if (k <= 0) return null;
  const s = Math.min(1.1, k) * (1 + 0.04 * Math.sin(t / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow x={0} y={0} r={size * 0.8} color="#ffe08a" o={0.5} />
      <Ball x={0} y={0} r={size * 0.45} fill={GOLD} />
      <text x={0} y={size * 0.17} fontFamily="Poppins" fontWeight={900} fontSize={size * 0.55} textAnchor="middle" fill={INK}>?</text>
    </g>
  );
};

/** Small waves on the sea at a point, rocking with `t`. */
export const Waves: React.FC<{ x: number; y: number; t: number; n?: number; k?: number }> = ({ x, y, t, n = 5, k = 1 }) => {
  if (k <= 0) return null;
  return (
    <g opacity={0.8 * Math.min(1, k)}>
      {Array.from({ length: n }).map((_, i) => {
        const dx = (i % 3) * 110 - 110 + Math.sin(t / 20 + i) * 14, dy = Math.floor(i / 3) * 70 + ((i * 37) % 30);
        return <path key={i} d={`M${x + dx - 40},${y + dy} q20,-18 40,0 q20,18 40,0`} fill="none" stroke="#e7f3f5" strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** A small person on the map (body + round head), walking with `step`; `bag` carries a bundle. */
export const Walker: React.FC<{ x: number; y: number; s: number; color: string; step?: number; bag?: boolean }> = ({ x, y, s, color, step = 0, bag }) => {
  const sw = Math.sin(step) * s * 0.16;
  return (
    <g>
      <Limb a={[x, y - s * 0.45]} b={[x - sw, y]} w={s * 0.12} color="#3b3046" sw={2} />
      <Limb a={[x, y - s * 0.45]} b={[x + sw, y]} w={s * 0.12} color="#3b3046" sw={2} />
      <Block x={x - s * 0.17} y={y - s * 0.95} w={s * 0.34} h={s * 0.55} fill={color} r={s * 0.1} sw={3} />
      <Ball x={x} y={y - s * 1.15} r={s * 0.18} fill="#e0b48a" sw={3} />
      {bag ? <Block x={x + s * 0.12} y={y - s * 0.75} w={s * 0.34} h={s * 0.3} fill="#c9a46a" r={s * 0.08} sw={3} /> : null}
    </g>
  );
};

/** A ship, facing right; `war` gives it a grey hull and a gun turret. */
export const Ship: React.FC<{ x: number; y: number; s: number; war?: boolean; rock?: number }> = ({ x, y, s, war, rock = 0 }) => {
  const hull = war ? "#6f7a86" : "#b5452f";
  return (
    <g transform={`rotate(${rock} ${x} ${y})`}>
      <path d={`M${x - s * 0.6},${y - s * 0.2} L${x + s * 0.65},${y - s * 0.2} L${x + s * 0.45},${y + s * 0.05} L${x - s * 0.5},${y + s * 0.05} Z`} fill={hull} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Block x={x - s * 0.25} y={y - s * 0.45} w={s * 0.4} h={s * 0.25} fill={war ? "#8e99a5" : "#f2efe6"} sw={3} />
      {war ? <Limb a={[x + s * 0.2, y - s * 0.3]} b={[x + s * 0.5, y - s * 0.36]} w={s * 0.06} color="#5a636e" sw={2} /> : <Block x={x + s * 0.2} y={y - s * 0.38} w={s * 0.25} h={s * 0.18} fill="#3f86c9" sw={2} />}
      <Limb a={[x - s * 0.05, y - s * 0.45]} b={[x - s * 0.05, y - s * 0.7]} w={s * 0.05} color="#4a3a2a" sw={2} />
    </g>
  );
};

/** A castle on the city's spot; `k` raises it. */
export const Castle: React.FC<{ x: number; y: number; s: number; k?: number; old?: boolean }> = ({ x, y, s, k = 1, old }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  const wall = old ? "#c8a878" : "#d8c3a0";
  return (
    <g transform={`translate(${x},${y}) scale(1,${q}) translate(${-x},${-y})`}>
      <Block x={x - s * 0.6} y={y - s * 0.55} w={s * 1.2} h={s * 0.55} fill={wall} sw={4} />
      <Block x={x - s * 0.2} y={y - s * 1.1} w={s * 0.4} h={s * 1.1} fill={shade(wall, -0.08)} sw={4} />
      <path d={`M${x - s * 0.26},${y - s * 1.1} L${x},${y - s * 1.45} L${x + s * 0.26},${y - s * 1.1} Z`} fill="#7a3a2a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {[-0.5, -0.3, 0.3, 0.5].map((d, i) => <rect key={i} x={x + d * s - s * 0.06} y={y - s * 0.66} width={s * 0.12} height={s * 0.12} fill={wall} stroke={INK} strokeWidth={3} />)}
      <rect x={x - s * 0.09} y={y - s * 0.3} width={s * 0.18} height={s * 0.3} rx={s * 0.09} fill={INK} />
    </g>
  );
};

/** A sign on a post standing on the map, its words big; `k` drops it in. */
export const Signpost: React.FC<{ x: number; y: number; w: number; text: string; k?: number; size?: number; strike?: number; bg?: string; fg?: string }> = ({ x, y, w, text, k = 1, size = 56, strike = 0, bg = "#f4e6c4", fg = "#3a2a1a" }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -140;
  const h = size * 1.7, top = y - 170 - h + drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y + drop]} b={[x, top + h]} w={14} color="#6b4a2a" sw={3} />
      <Block x={x - w / 2} y={top} w={w} h={h} fill={bg} r={14} />
      <Txt x={x} y={top + h * 0.66} size={size} fill={fg}>{text}</Txt>
      {strike > 0 ? <Limb a={[x - w * 0.42, top + h * 0.5]} b={[x - w * 0.42 + w * 0.84 * Math.min(1, strike), top + h * 0.5]} w={12} color={RED} sw={2} /> : null}
    </g>
  );
};

/** A red five-pointed star, stamped with `k`. */
export const Star: React.FC<{ x: number; y: number; r: number; k?: number }> = ({ x, y, r, k = 1 }) => {
  if (k <= 0) return null;
  const q = 1.6 - 0.6 * Math.min(1, k);
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
    return `${(x + rr * Math.cos(a) * q).toFixed(1)},${(y + rr * Math.sin(a) * q).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={GOLD} stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity={Math.min(1, k * 2)} />;
};

/** A steam train: an engine and two carriages, facing along `angle` (degrees). */
export const Train: React.FC<{ x: number; y: number; s: number; angle?: number; t?: number }> = ({ x, y, s, angle = 0, t = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${angle})`}>
    {[-1.9, -1.0].map((dx, i) => <Block key={i} x={dx * s} y={-s * 0.42} w={s * 0.8} h={s * 0.42} fill={i ? "#2f6b3a" : "#2f6b3a"} r={s * 0.06} sw={3} />)}
    <Block x={-0.1 * s} y={-s * 0.5} w={s * 0.75} h={s * 0.5} fill={RED} r={s * 0.06} sw={3} />
    <Block x={0.4 * s} y={-s * 0.75} w={s * 0.14} h={s * 0.3} fill="#3b3046" sw={3} />
    <Ball x={0.55 * s + Math.sin(t / 4) * 4} y={-s * 0.95 - (t % 12)} r={s * 0.12} fill="#eeeeee" sw={2} shadow={false} />
    {[-1.75, -1.25, -0.85, -0.35, 0.05, 0.45].map((dx, i) => <Ball key={i} x={dx * s} y={0} r={s * 0.09} fill="#2b2b3a" sw={2} shadow={false} />)}
  </g>
);

/** A barrier gate at a border; `k` lifts the arm. */
export const Gate: React.FC<{ x: number; y: number; s: number; k: number }> = ({ x, y, s, k }) => (
  <g>
    <Block x={x - s * 0.1} y={y - s * 0.7} w={s * 0.2} h={s * 0.7} fill="#ece6d6" sw={3} />
    <g transform={`rotate(${-75 * Math.min(1, k)} ${x} ${y - s * 0.55})`}>
      <rect x={x} y={y - s * 0.6} width={s * 1.1} height={s * 0.1} fill="#ffffff" stroke={INK} strokeWidth={3} />
      {[0.2, 0.6, 1.0].map((d, i) => <rect key={i} x={x + d * s - s * 0.08} y={y - s * 0.6} width={s * 0.16} height={s * 0.1} fill={RED} />)}
    </g>
  </g>
);

export default Map;

/** Renders `draw(x, y)` at a [lon, lat] on the current map. */
export const On: React.FC<{ at: LL; draw: (x: number, y: number) => React.ReactNode }> = ({ at, draw }) => {
  const xy = useAt()(at);
  return xy ? <>{draw(xy[0], xy[1])}</> : null;
};

/** A flag on a pole planted at (x, y), dropping in with `k` and waving with `t`. */
export const Pole: React.FC<{ x: number; y: number; flag: string; k: number; t: number }> = ({ x, y, flag, k, t }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -160, top = y - 200 + drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y + drop]} b={[x, top]} w={10} color="#6b4a2a" sw={3} />
      <g transform={`skewY(${Math.sin(t / 7) * 4})`} style={{ transformOrigin: `${x}px ${top}px` }}>
        <FlagArt name={flag} x={x} y={top} w={135} h={90} />
        <rect x={x} y={top} width={135} height={90} fill="none" stroke="#1d1a2b" strokeWidth={3} />
      </g>
    </g>
  );
};

