// Shared pieces for "Drop Mexico on Spain and it won't stop at Spain" (device: lift and compare). The channel's
// vintage world map: Mexico's own outline lifted and laid on Spain at true scale (it covers Spain and most of
// Portugal, Baja hangs over the Atlantic, the south-east tail reaches Morocco, Algeria and Tunisia), Spain dropped
// into Mexico, and crowds of small figures for the people.
import React from "react";
import { Ball, Block, INK, Limb, Tag, rng, shade } from "../../flat/kit";
import { Lift, WorldMap, useAt, type Fill } from "../../flat/map";

export type LL = [number, number];
export type Cam = { center: LL; scale: number };

export const SEA = "#5f9fae", MX_FILL = "#3f9a5c", ES_FILL = "#e2b13a", RED = "#d9483b";
export const ES_C: LL = [-3.7, 40.21];      // Spain's centroid: where Mexico's centroid is laid
export const MX_C: LL = [-102.17, 23.92];   // Mexico's centroid: where Spain's is laid
export const MADRID: LL = [-3.7, 40.42];

export const ATLANTIC: Cam = { center: [-52, 31], scale: 520 };
export const MEXICO: Cam = { center: [-102, 23], scale: 1350 };
export const IBERIA: Cam = { center: [-4, 39.5], scale: 2600 };
export const COVER: Cam = { center: [-1, 37.5], scale: 1500 };
export const AFRICA: Cam = { center: [4, 34.5], scale: 1700 };

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const between = (a: Cam, b: Cam, k: number): Cam => {
  const kk = Math.max(0, Math.min(1, k));
  return { center: [mix(a.center[0], b.center[0], kk), mix(a.center[1], b.center[1], kk)], scale: Math.exp(mix(Math.log(a.scale), Math.log(b.scale), kk)) };
};

const NEAR = [
  "Mexico", "United States of America", "Canada", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Cuba",
  "Spain", "Portugal", "France", "Morocco", "Algeria", "Tunisia", "Libya", "Italy", "Andorra", "Switzerland", "Germany",
  "Belgium", "United Kingdom", "Ireland", "W. Sahara", "Mauritania", "Mali", "Niger", "Malta", "Greenland", "Bahamas",
  "Haiti", "Dominican Rep.", "Jamaica", "Austria", "Netherlands", "Luxembourg",
];

/** The old map; `cam` frames it. Close framings use the 50m outlines. */
export const GeoMap: React.FC<{ cam: Cam; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ cam, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={cam.center} scale={cam.scale} look="vintage" political={0.4} sea="url(#v1128sea)"
    detail={cam.scale > 1200 ? "50m" : "110m"} only={NEAR} colors={colors}>
    <defs>
      <pattern id="v1128sea" patternUnits="userSpaceOnUse" width={84} height={60}>
        <rect width={84} height={60} fill={SEA} />
        <path d="M 6 18 q 9 -8 18 0 q 9 8 18 0" fill="none" stroke="#86c0cc" strokeWidth={5} strokeLinecap="round" />
        <path d="M 46 48 q 9 -8 18 0 q 9 8 18 0" fill="none" stroke="#86c0cc" strokeWidth={5} strokeLinecap="round" />
      </pattern>
    </defs>
    {children}
  </WorldMap>
);

/** Mexico's outline lifted from home onto Spain (`k` 0 → 1), its flag in it; `o` its opacity so the land shows. */
export const MexicoOnSpain: React.FC<{ k: number; o?: number; flagK?: number; cutLat?: number }> = ({ k, o = 0.82, flagK = 1, cutLat }) => {
  const at = useAt();
  if (k <= 0) return null;
  const body = <g opacity={o}><Lift name="Mexico" to={ES_C} k={k} fill={MX_FILL} flag="Mexico" flagK={flagK} /></g>;
  if (cutLat === undefined) return body;
  // a soft fade across a line running WSW-ENE along Spain's south coast (Gibraltar, Cartagena, Sardinia):
  // everything south-east of it (the tail over Africa, Sicily, Tunisia) fades out; `cutLat` moves the line south
  const sh = 36.2 - cutLat;
  const a = at([-3.2, 38.4 - sh]), b = at([-2.4, 36.0 - sh]);
  if (!a || !b) return body;
  return (
    <g>
      <defs>
        <linearGradient id="v1128fade" gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <mask id="v1128mask" maskUnits="userSpaceOnUse" x={-6000} y={-6000} width={14000} height={14000}>
          <rect x={-6000} y={-6000} width={14000} height={14000} fill="url(#v1128fade)" />
        </mask>
      </defs>
      <g mask="url(#v1128mask)">{body}</g>
    </g>
  );
};
/** Spain's outline lifted from home into Mexico. */
export const SpainInMexico: React.FC<{ k: number; o?: number }> = ({ k, o = 0.92 }) =>
  k <= 0 ? null : <g opacity={o}><Lift name="Spain" to={MX_C} k={k} fill={ES_FILL} flag="Spain" /></g>;

/** Points inside each country (sampled once in code from the 50m outlines), for crowds and icons. */
export const ES_PTS: LL[] = [[-8.1, 42.8], [-7, 37.3], [-7, 38.4], [-7, 39.5], [-7, 42.8], [-5.9, 36.2], [-5.9, 37.3], [-5.9, 38.4], [-5.9, 39.5], [-5.9, 40.6], [-5.9, 41.7], [-5.9, 42.8], [-4.8, 37.3], [-4.8, 38.4], [-4.8, 39.5], [-4.8, 40.6], [-4.8, 41.7], [-4.8, 42.8], [-3.7, 37.3], [-3.7, 38.4], [-3.7, 39.5], [-3.7, 40.6], [-3.7, 41.7], [-3.7, 42.8], [-2.6, 37.3], [-2.6, 38.4], [-2.6, 39.5], [-2.6, 40.6], [-2.6, 41.7], [-2.6, 42.8], [-1.5, 38.4], [-1.5, 39.5], [-1.5, 40.6], [-1.5, 41.7], [-1.5, 42.8], [-0.4, 39.5], [-0.4, 40.6], [-0.4, 41.7], [-0.4, 42.8], [0.7, 41.7], [0.7, 42.8], [1.8, 41.7]];
export const MX_PTS: LL[] = [[-116.7, 32.3], [-114.5, 32.3], [-112.3, 30.1], [-110.1, 23.5], [-110.1, 27.9], [-110.1, 30.1], [-107.9, 25.7], [-107.9, 27.9], [-107.9, 30.1], [-105.7, 23.5], [-105.7, 25.7], [-105.7, 27.9], [-105.7, 30.1], [-103.5, 19.1], [-103.5, 21.3], [-103.5, 23.5], [-103.5, 25.7], [-103.5, 27.9], [-101.3, 19.1], [-101.3, 21.3], [-101.3, 23.5], [-101.3, 25.7], [-101.3, 27.9], [-99.1, 16.9], [-99.1, 19.1], [-99.1, 21.3], [-99.1, 23.5], [-99.1, 25.7], [-96.9, 16.9], [-96.9, 19.1], [-94.7, 16.9], [-92.5, 16.9], [-90.3, 19.1], [-88.1, 19.1], [-88.1, 21.3]];

/** A small person standing on the map: a round head and a body in a colour; `k` pops them in, `t` bobs them. */
export const Tiny: React.FC<{ x: number; y: number; s?: number; color: string; k?: number; t?: number; i?: number }> = ({ x, y, s = 1, color, k = 1, t = 0, i = 0 }) => {
  if (k <= 0) return null;
  const sc = s * Math.min(1, k);
  const bob = Math.sin(t / 7 + i * 1.3) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${sc})`}>
      <ellipse cx={0} cy={2} rx={12} ry={4} fill="#1d1a2b" opacity={0.25} />
      <path d="M -10 0 L -8 -26 Q 0 -34 8 -26 L 10 0 Z" fill={color} stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-38} r={10} fill="#e0a87a" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A crowd on a list of [lon, lat] points, each popping in after `from` frames, one every `gap`. */
export const Crowd: React.FC<{ pts: LL[]; color: string; from: number; gap?: number; t: number; s?: number; jitter?: number; seed?: string }> = ({ pts, color, from, gap = 1.5, t, s = 1, jitter = 18, seed = "crowd" }) => {
  const at = useAt();
  const r = rng(seed);
  return (
    <g data-probe="skip">
      {pts.map((p, i) => {
        const xy = at(p);
        const dx = (r() - 0.5) * jitter, dy = (r() - 0.5) * jitter;
        if (!xy) return null;
        const k = Math.max(0, Math.min(1, (t - from - i * gap) / 8));
        return <Tiny key={i} x={xy[0] + dx} y={xy[1] + dy} s={s} color={color} k={k} t={t} i={i} />;
      })}
    </g>
  );
};

/** A signpost planted at [lon, lat] with a figure on its board; `k` drops it in. */
export const Post: React.FC<{ at: LL; text: string; label?: string; k: number; w?: number }> = ({ at: ll, text, label, k, w = 380 }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  const y = xy[1] + (1 - Math.min(1, k)) * -90;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[xy[0], y]} b={[xy[0], y - 170]} w={14} color="#6b4a2a" sw={3} />
      {label ? <Tag x={xy[0] - w / 2} y={y - 330} w={w} h={70} text={label} size={44} bg="#f4e6c4" /> : null}
      <Tag x={xy[0] - w / 2} y={y - 255} w={w} h={110} text={text} size={72} />
    </g>
  );
};

/** A cactus, a jungle tree and a galleon: small things standing on the map. */
export const Cactus: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 1 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, k)})`}>
      <Limb a={[0, 0]} b={[0, -60]} w={16} color="#4f9a4a" sw={3} />
      <Limb a={[0, -30]} b={[-18, -30]} w={10} color="#4f9a4a" sw={3} />
      <Limb a={[-18, -30]} b={[-18, -48]} w={10} color="#4f9a4a" sw={3} />
      <Limb a={[0, -38]} b={[16, -38]} w={10} color="#4f9a4a" sw={3} />
      <Limb a={[16, -38]} b={[16, -54]} w={10} color="#4f9a4a" sw={3} />
    </g>
  );
export const Tree: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 1 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, k)})`}>
      <Limb a={[0, 0]} b={[0, -36]} w={10} color="#7a4f2a" sw={3} />
      <Ball x={0} y={-50} r={24} fill="#2f7a3f" />
      <Ball x={-16} y={-38} r={16} fill="#3f8f4a" />
      <Ball x={16} y={-38} r={16} fill="#3f8f4a" />
    </g>
  );
export const Galleon: React.FC<{ x: number; y: number; a?: number; s?: number; t?: number }> = ({ x, y, a = 0, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t / 8) * 4}) rotate(${a * 0.15}) scale(${s})`}>
    <path d="M -60 0 L 60 0 L 44 26 L -44 26 Z" fill="#8a5a2e" stroke={INK} strokeWidth={5} />
    <Limb a={[0, 0]} b={[0, -90]} w={7} color="#5a3a1a" sw={2} />
    <path d="M 4 -84 Q 44 -60 4 -30 Z" fill="#f4ecd8" stroke={INK} strokeWidth={4} />
    <path d="M -4 -80 Q -40 -58 -4 -34 Z" fill="#f4ecd8" stroke={INK} strokeWidth={4} />
    <rect x={-4} y={-104} width={26} height={16} fill={RED} stroke={INK} strokeWidth={3} />
  </g>
);
/** A spot on the map, for placing things: renders `children(x, y)` at [lon, lat]. */
export const At: React.FC<{ ll: LL; children: (x: number, y: number) => React.ReactNode }> = ({ ll, children }) => {
  const xy = useAt()(ll);
  return xy ? <>{children(xy[0], xy[1])}</> : null;
};
export const tone = (c: string, k: number) => shade(c, k);
export { Block };
export default GeoMap;
