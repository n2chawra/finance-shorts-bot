// Polar pieces (2026-11-28, for v-20261128-11 "Britain, Chile and Argentina all claim the same ice"): drawn on a
// `WorldMap kind="polar"` (the South Pole in the middle). A claim slice cut from the pole out to a latitude between
// two meridians, swept open on a word and clipped to the land; a ring along a latitude drawn on (the treaty's 60°S
// line); a flag planted on its pole at [lon, lat]; a research station hut. Pure functions of their props.
import React, { useId } from "react";
import { INK, STROKE, shade } from "./kit";
import { FlagArt } from "./flags";
import { country, useMap } from "./map";

const norm = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;

/** Screen points along latitude `lat` from meridian `a` to `b` (degrees east; `b` may pass 180, e.g. 160 → 210). */
const arc = (proj: (ll: [number, number]) => [number, number] | null, a: number, b: number, lat: number) => {
  const out: [number, number][] = [];
  const n = Math.max(2, Math.ceil(Math.abs(b - a)));
  for (let i = 0; i <= n; i++) {
    const xy = proj([norm(a + ((b - a) * i) / n), lat]);
    if (xy) out.push(xy);
  }
  return out;
};

/**
 * A claim slice: the wedge from the South Pole out to `edge` (default 60°S) between meridians `from` and `to`
 * (degrees east, `to` > `from`; 160 → 210 crosses the date line). `k` 0 → 1 sweeps it open from `from`; `land`
 * clips the fill to Antarctica's ice (the edges still run to `edge`). `stripes` (an angle) fills it with stripes
 * instead of a wash, so overlapping slices show each other; `glow` brightens it; `lift` raises it off the map.
 */
export const ClaimSlice: React.FC<{
  from: number; to: number; edge?: number; k?: number; fill: string; opacity?: number; stripes?: number;
  land?: boolean; glow?: number; lift?: number; edges?: boolean;
}> = ({ from, to, edge = -60, k = 1, fill, opacity = 0.62, stripes, land = true, glow = 0, lift = 0, edges = true }) => {
  const { proj, path } = useMap();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const kk = Math.max(0, Math.min(1, k));
  if (kk <= 0) return null;
  const at = (ll: [number, number]) => proj(ll) as [number, number] | null;
  const pole = at([0, -90]);
  if (!pole) return null;
  const end = from + (to - from) * kk;
  const rim = arc(at, from, end, edge);
  if (rim.length < 2) return null;
  const d = `M${pole[0].toFixed(1)},${pole[1].toFixed(1)} ` + rim.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  const ice = country("Antarctica");
  const iceD = ice ? path(ice) ?? undefined : undefined;
  const up = Math.max(0, Math.min(1, lift)) * 16;
  const first = rim[0]!, last = rim[rim.length - 1]!;
  return (
    <g data-probe="skip" transform={up ? `translate(0 ${-up})` : undefined}>
      <defs>
        {land && iceD ? <clipPath id={`ice${uid}`}><path d={iceD} /></clipPath> : null}
        {stripes !== undefined ? (
          <pattern id={`st${uid}`} patternUnits="userSpaceOnUse" width={34} height={34} patternTransform={`rotate(${stripes})`}>
            <rect width={15} height={34} fill={fill} />
          </pattern>
        ) : null}
      </defs>
      <g clipPath={land && iceD ? `url(#ice${uid})` : undefined}>
        <path d={d} fill={stripes !== undefined ? `url(#st${uid})` : fill} opacity={Math.min(1, opacity + 0.3 * glow)} />
        {glow > 0 ? <path d={d} fill="#ffffff" opacity={0.18 * glow} /> : null}
      </g>
      {edges ? (
        <g>
          <line x1={pole[0]} y1={pole[1]} x2={first[0]} y2={first[1]} stroke={INK} strokeWidth={STROKE * 1.1} strokeLinecap="round" />
          <line x1={pole[0]} y1={pole[1]} x2={first[0]} y2={first[1]} stroke={shade(fill, 0.25)} strokeWidth={STROKE * 0.55} strokeLinecap="round" />
          <line x1={pole[0]} y1={pole[1]} x2={last[0]} y2={last[1]} stroke={INK} strokeWidth={STROKE * 1.1} strokeLinecap="round" />
          <line x1={pole[0]} y1={pole[1]} x2={last[0]} y2={last[1]} stroke={shade(fill, 0.25)} strokeWidth={STROKE * 0.55} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

/** A ring along latitude `lat` (the treaty's 60°S line), drawn on as `k` goes 0 → 1; `dash` makes it dashed. */
export const LatRing: React.FC<{ lat: number; k?: number; color?: string; width?: number; dash?: boolean; from?: number }> = ({ lat, k = 1, color = "#fff4d0", width = 8, dash = true, from = -90 }) => {
  const { proj } = useMap();
  const kk = Math.max(0, Math.min(1, k));
  if (kk <= 0) return null;
  const pts = arc((ll) => proj(ll) as [number, number] | null, from, from + 360 * kk, lat);
  if (pts.length < 2) return null;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <g data-probe="skip">
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 6} strokeLinecap="round" opacity={0.6} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash ? `${width * 3} ${width * 2}` : undefined} />
    </g>
  );
};

/** A flag planted on its pole at [lon, lat]: it drops in and the cloth waves as `k` goes 0 → 1; `t` (m.t) flutters it. */
export const PlantedFlag: React.FC<{ at: [number, number]; name: string; k?: number; s?: number; t?: number; dx?: number; dy?: number }> = ({ at, name, k = 1, s = 1, t = 0, dx = 0, dy = 0 }) => {
  const { proj } = useMap();
  const xy = proj(at) as [number, number] | null;
  const kk = Math.max(0, Math.min(1.2, k));
  if (!xy || kk <= 0) return null;
  const x = xy[0] + dx, y = xy[1] + dy;
  const drop = (1 - Math.min(1, kk)) * -120;
  const pw = 120 * s, ph = 80 * s, pole = 190 * s;
  const sway = Math.sin(t / 9) * 4 * s;
  return (
    <g transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, kk * 2)}>
      <ellipse cx={0} cy={4} rx={26 * s} ry={9 * s} fill="#1d1a2b" opacity={0.3} />
      <line x1={0} y1={0} x2={0} y2={-pole} stroke={INK} strokeWidth={10 * s} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-pole} stroke="#d8d2c4" strokeWidth={4 * s} strokeLinecap="round" />
      <g transform={`translate(${4 * s} ${-pole + 4 * s}) skewY(${sway})`}>
        <FlagArt name={name} x={0} y={0} w={pw} h={ph} />
        <rect x={0} y={0} width={pw} height={ph} fill="none" stroke={INK} strokeWidth={4 * s} />
      </g>
      <circle cx={0} cy={-pole} r={8 * s} fill="#f2b134" stroke={INK} strokeWidth={3 * s} />
    </g>
  );
};

/** A research station hut at [lon, lat]: a red box on stilts with a dish and a blinking lamp; `k` pops it in. */
export const Station: React.FC<{ at: [number, number]; k?: number; s?: number; t?: number; color?: string }> = ({ at, k = 1, s = 1, t = 0, color = "#d9483b" }) => {
  const { proj } = useMap();
  const xy = proj(at) as [number, number] | null;
  const kk = Math.max(0, Math.min(1.2, k));
  if (!xy || kk <= 0) return null;
  const sc = s * Math.min(1, kk);
  const blink = Math.sin(t / 6) > 0 ? 1 : 0.35;
  return (
    <g transform={`translate(${xy[0]} ${xy[1]}) scale(${sc})`}>
      <ellipse cx={0} cy={6} rx={62} ry={14} fill="#1d1a2b" opacity={0.25} />
      <line x1={-36} y1={0} x2={-36} y2={-26} stroke={INK} strokeWidth={6} />
      <line x1={36} y1={0} x2={36} y2={-26} stroke={INK} strokeWidth={6} />
      <rect x={-52} y={-74} width={104} height={50} rx={8} fill={color} stroke={INK} strokeWidth={5} />
      <rect x={-52} y={-74} width={104} height={12} rx={6} fill={shade(color, 0.3)} />
      <rect x={-36} y={-58} width={20} height={16} fill="#bfe6f0" stroke={INK} strokeWidth={3} />
      <rect x={-6} y={-58} width={20} height={16} fill="#bfe6f0" stroke={INK} strokeWidth={3} />
      <line x1={34} y1={-74} x2={34} y2={-104} stroke={INK} strokeWidth={4} />
      <path d="M 18 -112 Q 34 -94 50 -112" fill="#e8e4da" stroke={INK} strokeWidth={4} />
      <circle cx={-40} cy={-82} r={7} fill="#ffd84a" opacity={blink} stroke={INK} strokeWidth={2} />
    </g>
  );
};
