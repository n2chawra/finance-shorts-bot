// Shared pieces for "Britain, Chile and Argentina all claim the same ice" (device: timeline). The channel's
// vintage map looked at straight down on the South Pole (the polar map, peninsula pointing up): Antarctica's
// ice, the seven claim slices swept open year by year on a slider at the top, the treaty that freezes them,
// and the one slice nobody claims.
import React from "react";
import { Block, INK, Txt, rng, shade } from "../../flat/kit";
import { MapLabel, WorldMap, useAt, type Fill } from "../../flat/map";
import { ClaimSlice, PlantedFlag } from "../../flat/polar";
import { FlagArt } from "../../flat/flags";

export type LL = [number, number];
export type Cam = { center: LL; scale: number };

export const ICE = "#f4f8fb", SEA = "#4f8fa6", RED = "#d9483b", GOLD = "#f2b134", FROST = "#dff3fb";

/** The claims, west to east (degrees east): the overlapping three on the peninsula, then round the continent. */
export type Claim = { from: number; to: number; fill: string; flag?: string; at: LL; stripes?: number };
export const CLAIMS: Record<string, Claim> = {
  uk: { from: -80, to: -20, fill: "#2b5cb8", flag: "United Kingdom", at: [-40, -79], stripes: 45 },
  chile: { from: -90, to: -53, fill: "#d52b1e", flag: "Chile", at: [-72, -78], stripes: -45 },
  arg: { from: -74, to: -25, fill: "#74acdf", flag: "Argentina", at: [-50, -83], stripes: 0 },
  nor: { from: -20, to: 44.63, fill: "#e0605a", flag: "Norway", at: [14, -74] },
  ausw: { from: 44.63, to: 136.18, fill: "#e8b23a", flag: "Australia", at: [92, -76] },
  fra: { from: 136.18, to: 142.03, fill: "#6d8fe0", flag: "France", at: [139.5, -68.5] },
  ause: { from: 142.03, to: 160, fill: "#e8b23a", at: [152, -74] },
  nz: { from: 160, to: 210, fill: "#2fa58f", flag: "New Zealand", at: [178, -82] },
};
/** Marie Byrd Land: the slice nobody claims (150°W to 90°W). */
export const BYRD: { from: number; to: number; at: LL } = { from: 210, to: 270, at: [-120, -79] };

/** The framings: the whole continent from above the pole, the peninsula, and the other coasts. */
export const WHOLE: Cam = { center: [0, -90], scale: 1000 };
export const PEN: Cam = { center: [-64, -72], scale: 2300 };
export const SA_TIP: Cam = { center: [-60, -64], scale: 1500 };
export const FAR: Cam = { center: [150, -82], scale: 1050 };
export const AFRICA: Cam = { center: [20, -66], scale: 1300 };
export const BYRD_CAM: Cam = { center: [-120, -80], scale: 1700 };

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
/** A camera move between two framings: the point looked at slides, the scale changes evenly in log. */
export const between = (a: Cam, b: Cam, k: number): Cam => {
  const kk = Math.max(0, Math.min(1, k));
  return { center: [mix(a.center[0], b.center[0], kk), mix(a.center[1], b.center[1], kk)], scale: Math.exp(mix(Math.log(a.scale), Math.log(b.scale), kk)) };
};

const SOUTH = [
  "Antarctica", "Argentina", "Chile", "Uruguay", "Brazil", "Paraguay", "Bolivia", "Peru", "Falkland Is.", "South Africa",
  "Namibia", "Botswana", "Lesotho", "eSwatini", "Mozambique", "Zimbabwe", "Madagascar", "Australia", "New Zealand",
  "Fr. S. Antarctic Lands", "S. Geo. and the Is.",
];

/** The polar map: `cam` frames it; Antarctica is white ice unless `colors` says otherwise. */
export const AntMap: React.FC<{ cam: Cam; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ cam, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} kind="polar" lon0={-60} center={cam.center} scale={cam.scale} look="vintage" political={0.4}
    sea={SEA} only={SOUTH} detail={cam.scale > 2200 ? "50m" : "110m"} colors={{ Antarctica: { fill: ICE, k: 1 }, ...colors }}>
    {children}
  </WorldMap>
);

/** One claim slice by its key: `k` sweeps it open, `glow` brightens it, `frost` washes it white. */
export const Slice: React.FC<{ id: string; k?: number; glow?: number; lift?: number; stripes?: boolean; frost?: number }> = ({ id, k = 1, glow = 0, lift = 0, stripes = false, frost = 0 }) => {
  const c = CLAIMS[id]!;
  const fill = frost > 0 ? mixHex(c.fill, FROST, frost * 0.55) : c.fill;
  return <ClaimSlice from={c.from} to={c.to} k={k} fill={fill} glow={glow} lift={lift} stripes={stripes ? c.stripes : undefined} opacity={stripes ? 0.85 : 0.6} />;
};

/** A claim's flag planted on its spot; `t` waves it (hold `t` to freeze it). */
export const ClaimFlag: React.FC<{ id: string; k?: number; s?: number; t?: number; dx?: number; dy?: number }> = ({ id, k = 1, s = 1, t = 0, dx = 0, dy = 0 }) => {
  const c = CLAIMS[id]!;
  return c.flag ? <PlantedFlag at={c.at} name={c.flag} k={k} s={s} t={t} dx={dx} dy={dy} /> : null;
};

export const mixHex = (a: string, b: string, k: number): string => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(mix(v, y[i]!, k)).toString(16).padStart(2, "0")).join("");
};

/** Ice floes drifting round the coast at about 62°S, so the sea is never still. */
export const Floes: React.FC<{ t: number; n?: number; lat?: number }> = ({ t, n = 40, lat = -62 }) => {
  const at = useAt();
  const r = rng("v1128floes");
  return (
    <g data-probe="skip">
      {Array.from({ length: n }, (_, i) => {
        const lon = -180 + (360 * i) / n + r() * 6 + t * 0.04;
        const la = lat + (r() - 0.5) * 5;
        const xy = at([((lon + 540) % 360) - 180, la]);
        if (!xy) return null;
        const s = 10 + r() * 16;
        return <ellipse key={i} cx={xy[0]} cy={xy[1] + Math.sin(t / 25 + i) * 3} rx={s * 1.5} ry={s} fill="#f4fbff" stroke={shade(SEA, -0.3)} strokeWidth={3} opacity={0.85} />;
      })}
    </g>
  );
};

/** Frost crystals sparkling over the ice as `k` goes 0 → 1 (the claims frozen). */
export const Frost: React.FC<{ k: number; t: number; n?: number }> = ({ k, t, n = 70 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const r = rng("v1128frost");
  return (
    <g data-probe="skip">
      {Array.from({ length: n }, (_, i) => {
        const lon = -180 + r() * 360, la = -88 + r() * 22, s = 8 + r() * 14, show = Math.max(0, Math.min(1, k * 1.6 - (i / n) * 0.6));
        const xy = at([lon, la]);
        if (!xy || show <= 0) return null;
        const tw = 0.6 + 0.4 * Math.abs(Math.sin(t / 8 + i));
        return (
          <g key={i} transform={`translate(${xy[0]} ${xy[1]}) scale(${s * show / 10})`} opacity={tw}>
            <path d="M -10 0 L 10 0 M 0 -10 L 0 10 M -7 -7 L 7 7 M -7 7 L 7 -7" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

/** The year slider at the top of the frame (screen space): a brass ruler from 1900 to 2050, the knob on `year`. */
export const YearBar: React.FC<{ year: number; k?: number; flash?: number; dark?: number }> = ({ year, k = 1, flash = 0, dark = 0 }) => {
  if (k <= 0) return null;
  const x0 = 190, x1 = 880, y = 250;
  const pos = Math.max(0, Math.min(1, (year - 1900) / 150));
  const kx = mix(x0, x1, pos);
  const shown = Math.round(year);
  const plate = mixHex("#f3e3b5", "#8a2b22", dark * 0.8);
  return (
    <g opacity={Math.min(1, k * 1.5)} transform={`translate(0 ${(1 - Math.min(1, k)) * -60})`}>
      <Block x={110} y={150} w={830} h={190} fill={plate} r={22} />
      <line x1={x0} y1={y + 40} x2={x1} y2={y + 40} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={mix(x0, x1, i / 15)} y1={y + 40} x2={mix(x0, x1, i / 15)} y2={y + (i % 5 === 0 ? 14 : 26)} stroke={INK} strokeWidth={i % 5 === 0 ? 6 : 4} />
      ))}
      <circle cx={kx} cy={y + 40} r={26 + 8 * flash} fill={RED} stroke={INK} strokeWidth={6} />
      <Txt x={525} y={200} size={64 + 10 * flash} fill={dark > 0.5 ? "#fff4d0" : INK}>{String(shown)}</Txt>
    </g>
  );
};

/** A treaty scroll (screen space) with a figure line on it; `k` unrolls it, `seal` stamps the seal. */
export const Scroll: React.FC<{ x: number; y: number; w: number; k: number; title: string; figure?: string; seal?: number; sign?: number }> = ({ x, y, w, k, title, figure, seal = 0, sign = 0 }) => {
  if (k <= 0) return null;
  const h = 300 * Math.min(1, k);
  return (
    <g>
      <rect x={x + 10} y={y + 12} width={w} height={h} rx={10} fill="#1d1a2b" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} fill="#f6ecd0" stroke={INK} strokeWidth={6} />
      <rect x={x - 20} y={y - 18} width={w + 40} height={36} rx={18} fill="#c9a76a" stroke={INK} strokeWidth={5} />
      <rect x={x - 20} y={y + h - 18} width={w + 40} height={36} rx={18} fill="#c9a76a" stroke={INK} strokeWidth={5} />
      {k > 0.6 ? (
        <g opacity={Math.min(1, (k - 0.6) / 0.4)}>
          <Txt x={x + w / 2} y={y + 80} size={52} fill={INK}>{title}</Txt>
          {figure ? <Txt x={x + w / 2} y={y + 170} size={72} fill={RED}>{figure}</Txt> : null}
          {sign > 0 ? <path d={`M ${x + 60} ${y + 250} q 40 ${-30 * sign} 80 0 t 80 0 t 80 0`} fill="none" stroke="#2b3a8c" strokeWidth={6} strokeLinecap="round"
            pathLength={1} strokeDasharray={`${Math.min(1, sign)} 1`} /> : null}
        </g>
      ) : null}
      {seal > 0 ? (
        <g transform={`translate(${x + w - 90} ${y + h - 90}) scale(${1 + (1 - Math.min(1, seal)) * 1.2})`} opacity={Math.min(1, seal * 2)}>
          <circle r={56} fill={RED} stroke={INK} strokeWidth={6} />
          <circle r={38} fill="none" stroke="#ffd0c8" strokeWidth={5} />
        </g>
      ) : null}
    </g>
  );
};

/** A big red cross stamped over a spot, `k` stamping it in. */
export const Cross: React.FC<{ x: number; y: number; r?: number; k: number }> = ({ x, y, r = 90, k }) => {
  if (k <= 0) return null;
  const s = 1 + (1 - Math.min(1, k)) * 1.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${-r} ${r} L ${r} ${-r}`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${-r} ${r} L ${r} ${-r}`} stroke={RED} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

/** A label at [lon, lat] typed on letter by letter. */
export const Name: React.FC<{ at: LL; text: string; type: number; size?: number; fill?: string; dy?: number }> = ({ at, text, type, size = 54, fill = "#2a4a6a", dy = 0 }) => (
  <MapLabel at={at} text={text} size={size} fill={fill} type={type} dy={dy} />
);

/** Several slices at once: id → how open, lit, striped and frosted each is. */
export type SliceState = { k?: number; glow?: number; lift?: number; stripes?: boolean; frost?: number };
export const Slices: React.FC<{ s: Record<string, SliceState> }> = ({ s }) => (
  <g>{Object.entries(s).map(([id, v]) => <Slice key={id} id={id} {...v} />)}</g>
);
/** Every claim open (the map after the claims are drawn), with a shared frost and glow. */
export const ALL = (o: SliceState = {}): Record<string, SliceState> =>
  Object.fromEntries(Object.keys(CLAIMS).map((id) => [id, { k: 1, ...o, stripes: o.stripes ?? (id === "uk" || id === "chile" || id === "arg") }]));
/** The three peninsula flags on the hook's spots. */
export const PEN_FLAGS: { id: string; at: LL }[] = [
  { id: "uk", at: [-60.5, -66] }, { id: "chile", at: [-64.5, -69.6] }, { id: "arg", at: [-57.5, -68.6] },
];

/** The twelve nations that signed in 1959, as small flags in a ring round the ocean at `lat`, one by one as `k` runs. */
export const SIGNERS = ["Argentina", "Australia", "Belgium", "Chile", "France", "Japan", "New Zealand", "Norway", "South Africa", "Soviet Union", "United Kingdom", "United States of America"];
export const FlagRing: React.FC<{ names: string[]; k: number; lat?: number; w?: number; t?: number; flicker?: number }> = ({ names, k, lat = -57, w = 84, t = 0, flicker = 0 }) => {
  const at = useAt();
  return (
    <g data-probe="skip">
      {names.map((n, i) => {
        const show = Math.max(0, Math.min(1, k * names.length - i));
        const xy = at([-60 + (360 * i) / names.length, lat]);
        if (!xy || show <= 0) return null;
        const h = w / 1.5, s = 0.5 + 0.5 * show;
        const o = 1 - flicker * 0.5 * (Math.sin(t / 3 + i * 1.7) > 0 ? 1 : 0);
        return (
          <g key={n + i} transform={`translate(${xy[0]} ${xy[1] + Math.sin(t / 14 + i) * 4}) scale(${s})`} opacity={o}>
            <rect x={-w / 2 + 5} y={-h / 2 + 6} width={w} height={h} fill="#1d1a2b" opacity={0.3} />
            <FlagArt name={n} x={-w / 2} y={-h / 2} w={w} h={h} />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};
export default AntMap;
