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
 * A country a line is about is highlighted with `colors[name].trace` (owner, 2026-11-19: "the borders
 * should be highlighted in an animated way, like lines rounding and completing over the corners"): a
 * bright line with a glowing head runs round its border and closes. `colors[name].flag` sets the whole flag,
 * true to its 3:2 shape, inside the country as big as fits, over its colour (owner, same day: first "cover
 * the map of country with flag", then, on the stills: "better to color and fit the flag inside so that the
 * flag appears correct").
 *
 * Everything is a pure function of its props: pass times from `motion(p)` (the kit), never Date or random.
 */
import React, { createContext, useContext, useId, useMemo } from "react";
import { geoArea, geoAzimuthalEqualArea, geoCentroid, geoInterpolate, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world110 from "world-atlas/countries-110m.json";
import world50 from "world-atlas/countries-50m.json";

import { INK, STROKE, shade } from "./kit";
import { FlagArt, RATIO, hasFlag } from "./flags";


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

export type Fill = {
  fill: string; k?: number; outline?: string;
  /** made on screen (2026-11-18, owner: "maps are already there, not made on the spot"): the outline draws
   * itself 0 -> 1, the fill following over the last part */
  draw?: number;
  /** the colour paints in from `from` ([lon, lat], else the country's middle) as a growing brush, 0 -> 1 */
  paint?: number; from?: [number, number];
  /** the country rises off the map with a shadow under it, 0 -> 1 */
  lift?: number;
  /** a bright line runs round the border and closes as `trace` goes 0 -> 1, a glowing head on
   * its tip; at 1 the border stays lit. `traceColor` (default warm yellow) sets its colour */
  trace?: number; traceColor?: string;
  /** the country's flag (a name the flag table has, usually its own): the whole flag at 3:2, fitted inside the
   * country as big as it goes (at least 90 px wide), over `fill`; grows in with the country. A flag the table
   * lacks: just `fill` */
  flag?: string;
};

/**
 * The map, drawn inside the kit's <Stage>/<View>. `fit` frames those countries (or `center` + `scale`
 * frames a point); `colors` paints countries (k 0 -> 1 fades the colour in from the land colour, so a
 * recolour lands on a word; `draw`, `paint` and `lift` make it on screen); everything else is plain land.
 * `look="vintage"` (the geography channel, from its references): parchment land with relief and paper
 * grain anchored to the map (they move and scale with it), coast rings in the sea, brown ink borders.
 */
export const WorldMap: React.FC<{
  w: number; h: number;
  /** frame these countries with `pad` pixels around them */
  fit?: string[]; pad?: number;
  /** or frame a point at a scale (pixels per radian) */
  center?: [number, number]; scale?: number;
  /** "world" (Natural Earth projection) or "flat" (Mercator, for a region) */
  kind?: "world" | "flat";
  look?: "flat" | "vintage";
  /** a political map (the references, 2026-11-18: "include border lines, country colour wherever
   * required"): every country its own muted tone at this strength (0 plain land .. 1 full), dark ink
   * borders, and its name written at its middle when `names` is on */
  political?: number;
  names?: boolean | string[];
  land?: string; sea?: string; border?: string;
  colors?: Record<string, Fill>;
  /** names to leave out (a disputed region in a video that can't show it) */
  hide?: string[];
  /** draw only these countries (a regional map at 50m detail: drawing all ~240 every frame timed renders out) */
  only?: string[];
  detail?: "110m" | "50m";
  children?: React.ReactNode;
}> = ({ w, h, fit, pad = 80, center, scale, kind = "world", look = "flat", political = 0, names = false, land: land0, sea: sea0, border, colors = {}, hide = [], only, detail, children }) => {
  const vintage = look === "vintage";
  const land = land0 ?? (vintage ? "#e8d4a2" : "#e9dcc1");
  const sea = sea0 ?? (vintage ? "#5f9fae" : "#8ec5e0");
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
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
  const ink = border ?? (vintage ? "#4a3218" : INK);
  // a political map: each country its own tone (a stable pick by name), neighbours told apart by colour
  const TONES = ["#e3b56f", "#c9c27a", "#a8c48a", "#e29c78", "#c3a7cf", "#8fbfb0", "#e8cf86", "#d49aa6", "#b9b08c"];
  const toneOf = (name: string) => {
    let hsh = 0;
    for (const ch of name) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    return TONES[hsh % TONES.length]!;
  };
  const baseOf = (name: string) => (political > 0 ? mix(land, toneOf(name), Math.min(1, political)) : land);
  const shown = all.filter((c) => !hidden.has(c.properties.name.toLowerCase()));
  const d = (c: Country) => path(c) ?? undefined;
  const fillOf = (c: Fill) => {
    const k = Math.max(0, Math.min(1, c.k ?? 1));
    return k >= 1 ? c.fill : mix(land, c.fill, k);
  };
  const sphere = path({ type: "Sphere" }) ?? undefined;
  // the textures are drawn in the map's own coordinates: anchored at [0, 0] and scaled with the map
  const anchor = proj([0, 0]) ?? [w / 2, h / 2];
  const ks = proj.scale() / 9000;
  const local = { x: -anchor[0] / ks, y: -anchor[1] / ks, w: w / ks, h: h / ks };
  const fxOf = (c: Country) => colors[c.properties.name] ?? colors[c.properties.name.toLowerCase()];
  const special = shown.filter((c) => fxOf(c));
  return (
    <MapCtx.Provider value={{ proj, path }}>
      {vintage ? (
        <defs>
          <filter id={`grain${uid}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.55 0" />
          </filter>
          <filter id={`relief${uid}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={6} seed={3} result="n" />
            <feDiffuseLighting in="n" surfaceScale={11} diffuseConstant={1.15} lightingColor="#ffffff" result="lit">
              <feDistantLight azimuth={225} elevation={42} />
            </feDiffuseLighting>
            {/* shadows only, as a see-through brown layer: the headless renderer ignores blend modes, so an
                opaque lit layer would grey out every colour under it (2026-11-18) */}
            <feColorMatrix in="lit" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0 0.06  -0.42 -0.42 -0.42 0 1.12" />
          </filter>
          <clipPath id={`land${uid}`}>{shown.map((c) => <path key={`c${c.id ?? c.properties.name}`} d={d(c)} />)}</clipPath>
        </defs>
      ) : null}
      {kind === "world" ? <path d={sphere} fill={sea} stroke={INK} strokeWidth={STROKE} /> : <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={sea} />}
      {vintage ? (
        <g>
          {/* rings of shallow water along every coast, like an old chart */}
          {[34, 18].map((sw, i) => (
            <g key={sw} opacity={i ? 0.3 : 0.18}>{shown.map((c) => <path key={`r${sw}${c.id ?? c.properties.name}`} d={d(c)} fill="none" stroke="#d8efe9" strokeWidth={sw * Math.min(2, Math.max(0.6, ks))} strokeLinejoin="round" />)}</g>
          ))}
        </g>
      ) : null}
      {/* the painted shadow under all land: one darker tone, offset down-right */}
      <g transform="translate(6,8)" opacity={vintage ? 0.22 : 0.35}>
        {shown.map((c) => <path key={`s${c.id ?? c.properties.name}`} d={d(c)} fill={shade(sea, -0.45)} />)}
      </g>
      {/* plain land first; a country with its own colour is drawn over it, made on screen */}
      {shown.map((c) => <path key={c.id ?? c.properties.name} d={d(c)} fill={baseOf(c.properties.name)} stroke={ink} strokeWidth={STROKE * (political > 0 ? 0.7 : vintage ? 0.35 : 0.45)} strokeLinejoin="round" />)}
      {special.map((c) => {
        const f = fxOf(c)!;
        const name = c.properties.name;
        const draw = f.draw === undefined ? 1 : Math.max(0, Math.min(1, f.draw));
        const paint = f.paint === undefined ? 1 : Math.max(0, Math.min(1, f.paint));
        const lift = Math.max(0, Math.min(1, f.lift ?? 0));
        const traceK = f.trace === undefined ? 0 : Math.max(0, Math.min(1, f.trace));
        const unseen = draw <= 0 || paint <= 0;   // the fill isn't made yet; a trace may already run round it
        if (unseen && traceK <= 0) return null;
        const outline = f.outline ?? ink;
        const fillK = f.draw === undefined ? 1 : Math.max(0, (draw - 0.55) / 0.45);
        const [[x0, y0], [x1, y1]] = path.bounds(c);
        const from = f.from ? proj(f.from) : null;
        const [px, py] = from ?? [(x0 + x1) / 2, (y0 + y1) / 2];
        const R = Math.max(Math.hypot(px - x0, py - y0), Math.hypot(px - x1, py - y1), Math.hypot(px - x0, py - y1), Math.hypot(px - x1, py - y0));
        const cid = `p${uid}${String(c.id ?? name).replace(/[^a-zA-Z0-9]/g, "")}`;
        const up = lift * 18;
        const flagName = f.flag && hasFlag(f.flag) ? f.flag : null;
        const trace = traceK;
        const tc = f.traceColor ?? "#ffd84a";
        const tw = STROKE * 2.2;
        return (
          <g key={`f${c.id ?? name}`}>
            {paint < 1 ? <defs><clipPath id={cid}><circle cx={px} cy={py} r={R * paint} /></clipPath></defs> : null}
            {lift > 0 ? <path d={d(c)} fill="#1d1a2b" opacity={0.3 * lift} transform={`translate(${8 * lift} ${10 + up * 0.4})`} /> : null}
            <g transform={`translate(0 ${-up})`}>
              {unseen ? null : <path d={d(c)} fill={fillOf(f)} opacity={fillK} clipPath={paint < 1 ? `url(#${cid})` : undefined} />}
              {unseen ? null : <path d={d(c)} fill="none" stroke={outline} strokeWidth={STROKE * 0.8} strokeLinejoin="round"
                pathLength={1} strokeDasharray={draw < 1 ? `${draw} 1` : undefined} />}
              {trace > 0 ? (
                <g data-probe="skip">
                  {/* the glow under the line, then the line, then its brighter head just behind the tip */}
                  <path d={d(c)} fill="none" stroke={tc} strokeOpacity={0.35} strokeWidth={tw * 2.6} strokeLinejoin="round" strokeLinecap="round"
                    pathLength={1} strokeDasharray={trace < 1 ? `${trace} 1` : undefined} />
                  <path d={d(c)} fill="none" stroke={tc} strokeWidth={tw} strokeLinejoin="round" strokeLinecap="round"
                    pathLength={1} strokeDasharray={trace < 1 ? `${trace} 1` : undefined} />
                  {trace < 1 ? (
                    <path d={d(c)} fill="none" stroke="#fffbe6" strokeWidth={tw * 1.7} strokeLinecap="round"
                      pathLength={1} strokeDasharray={`0.012 1`} strokeDashoffset={-Math.max(0, trace - 0.012)} />
                  ) : null}
                </g>
              ) : null}
            </g>
          </g>
        );
      })}
      {/* the relief over the land and over every painted country, so the colours sit on the old map */}
      {vintage ? (
        <g clipPath={`url(#land${uid})`}>
          <g transform={`translate(${anchor[0]} ${anchor[1]}) scale(${ks})`} opacity={0.9}>
            <rect x={local.x} y={local.y} width={local.w} height={local.h} filter={`url(#relief${uid})`} />
          </g>
        </g>
      ) : null}
      {vintage ? (
        <g transform={`translate(${anchor[0]} ${anchor[1]}) scale(${ks})`} opacity={0.45}>
          <rect x={local.x} y={local.y} width={local.w} height={local.h} filter={`url(#grain${uid})`} />
        </g>
      ) : null}
      {/* flags: the whole flag, true to its shape, as big as fits inside the country, over the colour and the map's
          texture so it stays crisp (owner, 2026-11-19: "color and fit the flag inside so that flag appears correct") */}
      {special.map((c) => {
        const f = fxOf(c)!;
        if (!f.flag || !hasFlag(f.flag)) return null;
        const draw = f.draw === undefined ? 1 : Math.max(0, Math.min(1, f.draw));
        const paint = f.paint === undefined ? 1 : Math.max(0, Math.min(1, f.paint));
        const k = Math.min(Math.max(0, Math.min(1, f.k ?? 1)), f.draw === undefined ? 1 : Math.max(0, (draw - 0.55) / 0.45), f.paint === undefined ? 1 : paint);
        if (k <= 0) return null;
        const box = flagBox(c, proj);
        if (!box) return null;
        const s = 0.6 + 0.4 * Math.min(1, k * 1.4);   // grows in as the country is made
        const fw = box.w * s, fh = fw / RATIO, up = Math.max(0, Math.min(1, f.lift ?? 0)) * 18;
        // kept whole inside the frame when the camera is close in on a big country (Greenland at a push-in)
        const clampX = (v: number) => Math.min(Math.max(v, 24), w - fw - 24), clampY = (v: number) => Math.min(Math.max(v, 24), h - fh - 24);
        const onScreen = box.x >= 0 && box.x <= w && box.y >= 0 && box.y <= h;   // a country off the frame keeps its flag off it too
        const x = onScreen && fw < w - 48 ? clampX(box.x - fw / 2) : box.x - fw / 2, y = onScreen && fh < h - 48 ? clampY(box.y - fh / 2 - up) : box.y - fh / 2 - up;
        return (
          <g key={`flag${c.id ?? c.properties.name}`} opacity={Math.min(1, k * 1.6)}>
            <rect x={x + fw * 0.04} y={y + fh * 0.06} width={fw} height={fh} fill="#1d1a2b" opacity={0.3} />
            <FlagArt name={f.flag} x={x} y={y} w={fw} h={fh} />
            <rect x={x} y={y} width={fw} height={fh} fill="none" stroke={INK} strokeWidth={Math.max(3, Math.min(STROKE * 0.7, fw * 0.025))} />
          </g>
        );
      })}
      {names ? shown.filter((c) => !fxOf(c) && (names === true || names.includes(c.properties.name))).map((c) => {
        const [x, y] = path.centroid(c);
        const [[x0, y0], [x1, y1]] = path.bounds(c);
        if (!isFinite(x) || x < 60 || x > w - 160 || y < 200 || y > h - 600 || x1 - x0 < 160 || y1 - y0 < 60) return null;
        return <text key={`n${c.id ?? c.properties.name}`} x={x} y={y} fontFamily="Poppins" fontWeight={700} fontSize={36} letterSpacing={4} textAnchor="middle"
          dominantBaseline="middle" fill={shade(ink, 0.15)} opacity={0.7} data-probe="skip">{c.properties.name.toUpperCase()}</text>;
      }) : null}
      {children}
    </MapCtx.Provider>
  );
};

/** A place name at [lon, lat], Poppins with an ink halo so it reads over any land. */
export const MapLabel: React.FC<{ at: [number, number]; text: string; size?: number; fill?: string; k?: number; dy?: number; type?: number }> = ({ at, text, size = 42, fill = "#ffffff", k = 1, dy = 0, type }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  // `type` writes the name on letter by letter (0 -> 1); the rest of the word holds its place, unseen
  const n = type === undefined ? text.length : Math.round(text.length * Math.max(0, Math.min(1, type)));
  if (n <= 0) return null;
  return (
    <text x={xy[0]} y={xy[1] + dy} fontFamily="Poppins" fontWeight={800} fontSize={size * (type === undefined ? Math.min(1, k * 1.2) : 1)} textAnchor="middle" dominantBaseline="middle"
      fill={fill} stroke={INK} strokeWidth={size * 0.16} paintOrder="stroke" opacity={Math.min(1, k * 2)}>
      {text.slice(0, n)}<tspan opacity={0}>{text.slice(n)}</tspan>
    </text>
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

/**
 * Where a flag sits inside a country: the biggest 3:2 rectangle found inside its main land, in degrees (found once
 * per country, then projected each frame). A grid of candidate centres inside the outline, each grown by halving
 * until the rectangle's edges leave the land or a coastline vertex falls inside it.
 */
type GeoRect = { lon: number; lat: number; hw: number; hh: number };
const fitCache = new Map<string, GeoRect | null>();
function fitFlag(c: Country): GeoRect | null {
  const key = `${c.properties.name}|${c.geometry.type}|${JSON.stringify(c.geometry).length}`;
  if (fitCache.has(key)) return fitCache.get(key)!;
  const g = mainland(c).geometry;
  if (g.type !== "Polygon") { fitCache.set(key, null); return null; }
  const ring = g.coordinates[0]! as [number, number][];
  const lat0 = ring.reduce((a, p) => a + p[1], 0) / ring.length;
  const kx = Math.cos((lat0 * Math.PI) / 180);
  const pts = ring.map(([lo, la]) => [lo * kx, la] as [number, number]);   // roughly equal-area flat coordinates
  const step = Math.max(1, Math.floor(pts.length / 500));
  const verts = pts.filter((_, i) => i % step === 0);
  const inside = (x: number, y: number) => {
    let hit = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]!, [xj, yj] = pts[j]!;
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const fits = (cx: number, cy: number, s: number) => {
    const hw = 1.5 * s, hh = s;
    for (let t = 0; t <= 4; t++) {
      const u = -1 + t / 2;
      if (!inside(cx + u * hw, cy - hh) || !inside(cx + u * hw, cy + hh) || !inside(cx - hw, cy + u * hh) || !inside(cx + hw, cy + u * hh)) return false;
    }
    for (const [vx, vy] of verts) if (Math.abs(vx - cx) < hw && Math.abs(vy - cy) < hh) return false;
    return true;
  };
  let best: { x: number; y: number; s: number } | null = null;
  const N = 14, maxS = Math.min((x1 - x0) / 3, (y1 - y0) / 2);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const cx = x0 + ((i + 0.5) / N) * (x1 - x0), cy = y0 + ((j + 0.5) / N) * (y1 - y0);
    if (!inside(cx, cy)) continue;
    let lo = 0, hi = maxS;
    if (best && !fits(cx, cy, best.s)) continue;   // can't beat the best so far
    for (let it = 0; it < 10; it++) { const mid = (lo + hi) / 2; if (fits(cx, cy, mid)) lo = mid; else hi = mid; }
    if (!best || lo > best.s) best = { x: cx, y: cy, s: lo };
  }
  const out = best && best.s > 0 ? { lon: best.x / kx, lat: best.y, hw: (1.5 * best.s) / kx, hh: best.s } : null;
  fitCache.set(key, out);
  return out;
}

/** The flag's centre and width on screen: its fitted rectangle projected, kept 3:2, never under a readable size. */
function flagBox(c: Country, proj: GeoProjection): { x: number; y: number; w: number } | null {
  const r = fitFlag(c);
  const at = r ? proj([r.lon, r.lat]) : proj(geoCentroid(mainland(c)));
  if (!at) return null;
  let w = 90;
  if (r) {
    const L = proj([r.lon - r.hw, r.lat]), R = proj([r.lon + r.hw, r.lat]), T = proj([r.lon, r.lat + r.hh]), B = proj([r.lon, r.lat - r.hh]);
    if (L && R && T && B) w = Math.min(Math.abs(R[0] - L[0]), Math.abs(B[1] - T[1]) * RATIO) * 0.92;
  }
  return { x: at[0], y: at[1], w: Math.min(Math.max(w, 90), 640) };   // a thin country still gets a flag you can read
}

/** A country's largest piece of land (by area on the globe): the USA's lower 48, mainland France, Chile without its islands. */
function mainland(c: Country): Country {
  const g = c.geometry;
  if (g.type !== "MultiPolygon") return c;
  let best = g.coordinates[0]!, area = -1;
  for (const poly of g.coordinates) {
    const a = geoArea({ type: "Polygon", coordinates: poly });
    if (a > area) { area = a; best = poly; }
  }
  return { ...c, geometry: { type: "Polygon", coordinates: best } };
}

/** A blend of two hex colours (a recolour landing on a word). */
function mix(a: string, b: string, k: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i]! - v) * k).toString(16).padStart(2, "0")).join("")}`;
}
