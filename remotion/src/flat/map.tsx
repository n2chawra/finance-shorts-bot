/**
 * Maps on the flat kit (multi-channel plan: the geography channel, 2026-11-17). Country outlines are
 * Natural Earth's (public domain) via world-atlas; they are drawn in the house style: an ink outline,
 * flat fills, one painted shadow, labels in Poppins. Borders are shown as Natural Earth draws them (as
 * controlled); a video about a disputed border follows that country's official map or leaves the
 * region out (channels/geography-maps-geopolitical-mysteries/profile.md).
 *
 *   <WorldMap>   the map: a projection framed on countries or a point, every country drawn, some coloured
 *   <MapLabel>   a place name pinned to a longitude/latitude
 *   <MapPin>     a pin that drops in
 *   <MapRoute>   a dashed route drawn along great circles as `k` goes 0 → 1 (a ship, a plane, a trade)
 *   <Lift>       one country's own shape laid over another place at the same scale (Chile over India)
 *
 * Everything is a pure function of its props: pass times from `motion(p)` (the kit), never Date or random.
 */
import React, { createContext, useContext, useMemo } from "react";
import { geoAzimuthalEqualArea, geoCentroid, geoInterpolate, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world110 from "world-atlas/countries-110m.json";
import world50 from "world-atlas/countries-50m.json";

import { INK, STROKE, shade } from "./kit";

type Country = Feature<Geometry, { name: string }>;

const cache = new Map<string, Country[]>();

/** Every country's outline: 110m for the whole world, 50m when zoomed in on a region. */
export function countries(detail: "110m" | "50m" = "110m"): Country[] {
  const hit = cache.get(detail);
  if (hit) return hit;
  const topo = (detail === "50m" ? world50 : world110) as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  cache.set(detail, fc.features);
  return fc.features;
}

/** A country by its Natural Earth name ("Chile", "India", "Gambia", "Bosnia and Herz."). */
export function country(name: string, detail: "110m" | "50m" = "50m"): Country | undefined {
  const n = name.toLowerCase();
  return countries(detail).find((c) => c.properties.name.toLowerCase() === n);
}

type Ctx = { proj: GeoProjection; path: ReturnType<typeof geoPath> };
const MapCtx = createContext<Ctx | null>(null);
/** The map's projection, for drawing anything else at a longitude/latitude (characters, signs). */
export const useMap = (): Ctx => {
  const c = useContext(MapCtx);
  if (!c) throw new Error("useMap() outside <WorldMap>");
  return c;
};
/** [lon, lat] → [x, y] on the current map (or null when it falls behind the projection). */
export const useAt = () => {
  const { proj } = useMap();
  return (lonlat: [number, number]) => proj(lonlat) as [number, number] | null;
};

export type Fill = { fill: string; k?: number; outline?: string };

/**
 * The map, drawn inside the kit's <Stage>/<View>. `fit` frames those countries (or `center` + `scale`
 * frames a point); `colors` paints countries (k 0 → 1 fades the colour in from the land colour, so a
 * recolour lands on a word); everything else is plain land.
 */
export const WorldMap: React.FC<{
  w: number; h: number;
  /** frame these countries with `pad` pixels around them */
  fit?: string[]; pad?: number;
  /** or frame a point at a scale (pixels per radian) */
  center?: [number, number]; scale?: number;
  /** "world" (Natural Earth projection) or "flat" (Mercator, for a region) */
  kind?: "world" | "flat";
  land?: string; sea?: string; border?: string;
  colors?: Record<string, Fill>;
  /** names to leave out (a disputed region in a video that can't show it) */
  hide?: string[];
  /** draw only these countries (a regional map at 50m detail: drawing all ~240 every frame timed renders out) */
  only?: string[];
  detail?: "110m" | "50m";
  children?: React.ReactNode;
}> = ({ w, h, fit, pad = 80, center, scale, kind = "world", land = "#e9dcc1", sea = "#8ec5e0", border, colors = {}, hide = [], only, detail, children }) => {
  const det = detail ?? (fit && fit.length <= 6 ? "50m" : "110m");
  const keep = only ? new Set(only.map((n) => n.toLowerCase())) : null;
  const all = keep ? countries(det).filter((c) => keep.has(c.properties.name.toLowerCase())) : countries(det);
  const proj = useMemo(() => {
    const p = kind === "flat" ? geoMercator() : geoNaturalEarth1();
    const framed = fit?.map((n) => all.find((c) => c.properties.name.toLowerCase() === n.toLowerCase())).filter((c): c is Country => !!c);
    if (framed?.length) p.fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: framed });
    else if (center) p.center(center).scale(scale ?? w / 6.2).translate([w / 2, h / 2]);
    else p.fitExtent([[pad, pad], [w - pad, h - pad]], { type: "Sphere" });
    return p;
  }, [kind, fit?.join("|"), pad, center?.join(","), scale, w, h, det]);   // eslint-disable-line react-hooks/exhaustive-deps
  const path = useMemo(() => geoPath(proj), [proj]);
  const hidden = new Set(hide.map((n) => n.toLowerCase()));
  const ink = border ?? INK;
  const col = (name: string): { fill: string; outline: string; lifted: boolean } => {
    const c = colors[name] ?? colors[name.toLowerCase()];
    if (!c) return { fill: land, outline: ink, lifted: false };
    const k = Math.max(0, Math.min(1, c.k ?? 1));
    return { fill: k >= 1 ? c.fill : mix(land, c.fill, k), outline: c.outline ?? ink, lifted: k > 0 };
  };
  const sphere = path({ type: "Sphere" }) ?? undefined;
  return (
    <MapCtx.Provider value={{ proj, path }}>
      {kind === "world" ? <path d={sphere} fill={sea} stroke={INK} strokeWidth={STROKE} /> : <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={sea} />}
      {/* the painted shadow under all land: one darker tone, offset down-right */}
      <g transform="translate(6,8)" opacity={0.35}>
        {all.filter((c) => !hidden.has(c.properties.name.toLowerCase())).map((c) => <path key={`s${c.id ?? c.properties.name}`} d={path(c) ?? undefined} fill={shade(sea, -0.45)} />)}
      </g>
      {all.filter((c) => !hidden.has(c.properties.name.toLowerCase())).map((c) => {
        const { fill, outline, lifted } = col(c.properties.name);
        return <path key={c.id ?? c.properties.name} d={path(c) ?? undefined} fill={fill} stroke={outline} strokeWidth={lifted ? STROKE * 0.8 : STROKE * 0.45} strokeLinejoin="round" />;
      })}
      {children}
    </MapCtx.Provider>
  );
};

/** A place name at [lon, lat], Poppins with an ink halo so it reads over any land. */
export const MapLabel: React.FC<{ at: [number, number]; text: string; size?: number; fill?: string; k?: number; dy?: number }> = ({ at, text, size = 42, fill = "#ffffff", k = 1, dy = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  return (
    <text x={xy[0]} y={xy[1] + dy} fontFamily="Poppins" fontWeight={800} fontSize={size * Math.min(1, k * 1.2)} textAnchor="middle" dominantBaseline="middle"
      fill={fill} stroke={INK} strokeWidth={size * 0.16} paintOrder="stroke" opacity={Math.min(1, k * 2)}>{text}</text>
  );
};

/** A pin that drops onto [lon, lat] as `k` goes 0 → 1. */
export const MapPin: React.FC<{ at: [number, number]; k?: number; color?: string; r?: number }> = ({ at, k = 1, color = "#e8453c", r = 22 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -120;
  return (
    <g transform={`translate(${xy[0]},${xy[1] + drop})`}>
      <path d={`M0,0 C${-r},${-r * 1.4} ${-r},${-r * 2.6} 0,${-r * 2.6} C${r},${-r * 2.6} ${r},${-r * 1.4} 0,0 Z`} fill={color} stroke={INK} strokeWidth={STROKE * 0.7} />
      <circle cx={0} cy={-r * 1.75} r={r * 0.38} fill="#ffffff" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A route along great circles through `via` ([lon, lat] stops), drawn up to `k` (0 → 1); `mover` rides its tip. */
export const MapRoute: React.FC<{ via: [number, number][]; k?: number; color?: string; width?: number; dash?: boolean; mover?: (x: number, y: number, angle: number) => React.ReactNode }> = ({
  via, k = 1, color = "#ffffff", width = 10, dash = true, mover,
}) => {
  const at = useAt();
  const pts = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < via.length - 1; i++) {
      const f = geoInterpolate(via[i]!, via[i + 1]!);
      for (let s = 0; s <= 40; s++) out.push(f(s / 40) as [number, number]);
    }
    return out;
  }, [via.map((v) => v.join(",")).join(";")]);   // eslint-disable-line react-hooks/exhaustive-deps
  const xy = pts.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const n = Math.max(2, Math.round(xy.length * Math.max(0, Math.min(1, k))));
  const shown = xy.slice(0, n);
  if (shown.length < 2) return null;
  const d = shown.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const [a, b] = [shown[shown.length - 2]!, shown[shown.length - 1]!];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? `${width * 2.2} ${width * 1.6}` : undefined} />
      {mover ? mover(b[0], b[1], (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI) : null}
    </g>
  );
};

/**
 * One country's own shape laid over another place at the true scale of the map (an equal-area
 * projection centred on the country, drawn at the map's scale): the Chile-over-India comparison.
 * `k` slides it from its home (0) to `to` (1).
 */
export const Lift: React.FC<{ name: string; to: [number, number]; k?: number; fill?: string; rot?: number; label?: string }> = ({ name, to, k = 1, fill = "#e8453c", rot = 0, label }) => {
  const { proj } = useMap();
  const c = country(name);
  if (!c) return null;
  const home = geoCentroid(c);
  const t = Math.max(0, Math.min(1, k));
  const here = [home[0] + (to[0] - home[0]) * t, home[1] + (to[1] - home[1]) * t] as [number, number];
  const xy = proj(here);
  if (!xy) return null;
  const own = geoAzimuthalEqualArea().rotate([-home[0], -home[1]]).scale(proj.scale()).translate([0, 0]);
  const d = geoPath(own)(c) ?? undefined;
  return (
    <g transform={`translate(${xy[0]},${xy[1]}) rotate(${rot})`}>
      <path d={d} fill={shade(fill, -0.35)} transform="translate(8,10)" opacity={0.5} />
      <path d={d} fill={fill} stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
      {label ? <text x={0} y={0} fontFamily="Poppins" fontWeight={800} fontSize={44} textAnchor="middle" fill="#ffffff" stroke={INK} strokeWidth={7} paintOrder="stroke">{label}</text> : null}
    </g>
  );
};

/** A blend of two hex colours (a recolour landing on a word). */
function mix(a: string, b: string, k: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * k).toString(16).padStart(2, "0")).join("")}`;
}
