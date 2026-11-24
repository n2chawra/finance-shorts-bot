/**
 * India on the flat kit (the India Maps channel, 2026-11-24): India's official map with its 28 states and
 * 8 union territories, on a shaded-relief base, in the house style.
 *
 * Data: `data/india.json` (scripts/build_india_map.py, Natural Earth 5.1, public domain): India's-view
 * outline, the states clipped to it, with the parts of India's official outline Natural Earth leaves out
 * assigned as the Survey of India map shows them (Azad Kashmir to Jammu and Kashmir; Gilgit-Baltistan,
 * Siachen, Aksai Chin and the Shaksgam valley to Ladakh). The channel never draws another India outline.
 * Base: `public/maps/south-asia-relief.jpg` (Natural Earth hypsometric tints with shaded relief, public
 * domain, graded), 50-115 E, 15 S-54 N, equirectangular, so it lines up with the shapes exactly.
 *
 * Our own look, not the references' (owner, 2026-11-24: "take what's better, not them totally"): the relief
 * stays as depth, but the world outside India is dimmed (a spotlight on India), India sits as a pale
 * paper sheet with fine white state lines, and a state the line is about is *made* on screen: its outline
 * draws, the colour brushes in from a point, it lifts off the sheet with a painted shadow, a bright line
 * runs round its border. States painted earlier stay painted, so an every-state video fills the map.
 *
 *   <IndiaMap>    the map: `focus` frames states (or all of India) with `pad`; `states` paints them
 *   <StateTag>    a pill with a state's name or a label (Devanagari or Latin), pinned to the state
 *   MapLabel / MapPin / MapRoute (map.tsx) work inside it too: <IndiaMap> provides the same map context.
 *
 * Pure functions of their props: pass times from `motion(p)`, never Date or random.
 */
import React, { useEffect, useId, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";

import { INK, STROKE, shade } from "./kit";
import { MapCtx } from "./map";
import data from "./data/india.json";

type Props = { name: string; hi: string; kind?: "state" | "ut"; code?: string };
type Shape = Feature<Geometry, Props>;
const DATA = data as unknown as { outline: Shape; states: Shape[]; neighbours: Shape[]; adjacent: Record<string, string[]> };

/** Every state and UT by its English name ("Uttar Pradesh", "Ladakh", "Dadra and Nagar Haveli and Daman and Diu"). */
export const INDIA_STATES: readonly string[] = DATA.states.map((s) => s.properties.name);
/** A state's or UT's name in Devanagari (Natural Earth's `name_hi`). */
export const stateHi = (name: string): string => DATA.states.find((s) => s.properties.name === name)?.properties.hi ?? name;
/** A colour for each state from `palette`, never the same as a state it touches (greedy, biggest
 * neighbourhoods first; deterministic). `offset` rotates the palette so videos don't all look alike. */
export function stateColours(palette: string[], names: readonly string[] = INDIA_STATES, offset = 0): Record<string, string> {
  const out: Record<string, string> = {};
  const count = new Map<string, number>(palette.map((c) => [c, 0]));
  const order = [...names].sort((a, b) => (DATA.adjacent[b]?.length ?? 0) - (DATA.adjacent[a]?.length ?? 0) || a.localeCompare(b));
  for (const n of order) {
    const used = new Set((DATA.adjacent[n] ?? []).map((m) => out[m]).filter(Boolean));
    // the least-used colour no neighbour has (the whole palette gets used, not just the first four)
    const free = palette.map((_, k) => palette[(k + offset) % palette.length]!).filter((c) => !used.has(c));
    const pick = (free.length ? free : palette).reduce((a, c) => (count.get(c)! < count.get(a)! ? c : a));
    out[n] = pick;
    count.set(pick, count.get(pick)! + 1);
  }
  return out;
}
const byName = (name: string) => DATA.states.find((s) => s.properties.name.toLowerCase() === name.toLowerCase());

/** The relief image's extent (degrees): 60 px a degree. */
const RELIEF = { lon0: 50, lon1: 115, lat0: -15, lat1: 54, file: "maps/south-asia-relief.jpg" };

/** The map's frame, so tags stay inside it. */
const FrameSize = React.createContext<{ w: number; h: number }>({ w: 1080, h: 1920 });

export type StateFx = {
  /** the colour; `k` fades it in from the sheet colour on a word */
  fill: string; k?: number;
  /** the outline draws itself 0 -> 1, the fill following over its last part */
  draw?: number;
  /** the colour brushes in from `from` ([lon, lat], else the middle), 0 -> 1 */
  paint?: number; from?: [number, number];
  /** rises off the sheet with a shadow under it, 0 -> 1 */
  lift?: number;
  /** a bright line runs round the border and closes, 0 -> 1 */
  trace?: number; traceColor?: string;
};

/** The relief is loaded before the frame is captured (as studio/photo.tsx does), so a still never shows the bare sea. */
function useLoaded(src: string): void {
  const [handle] = useState(() => delayRender(`relief ${src}`));
  useEffect(() => {
    const img = new Image();
    const done = () => continueRender(handle);
    img.onload = done;
    img.onerror = done;
    img.src = src;
  }, [src, handle]);
}

const clamp = (v: number | undefined, d = 1) => Math.max(0, Math.min(1, v ?? d));
const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i]! - v) * k).toString(16).padStart(2, "0")).join("")}`;
};

export const IndiaMap: React.FC<{
  w: number; h: number;
  /** frame these states (English names) or "India" with `pad` pixels round them */
  focus?: string[]; pad?: number;
  /** paint states, made on screen */
  states?: Record<string, StateFx>;
  /** the sheet colour of unpainted India and how dark the world outside India sits (0 none .. 1 black) */
  sheet?: string; dim?: number;
  /** write every unpainted state's Devanagari name faintly (an atlas page) */
  names?: boolean;
  /** neighbours' Devanagari names (पाकिस्तान, चीन …) on the dimmed land */
  neighbourNames?: boolean;
  children?: React.ReactNode;
}> = ({ w, h, focus = ["India"], pad = 90, states = {}, sheet = "#f3ead6", dim = 0.42, names = false, neighbourNames = false, children }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  useLoaded(staticFile(RELIEF.file));
  const proj = useMemo(() => {
    const p = geoEquirectangular();
    const framed = focus.flatMap((n) => (n.toLowerCase() === "india" ? [DATA.outline] : [byName(n)].filter((s): s is Shape => !!s)));
    p.fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: framed.length ? framed : [DATA.outline] });
    return p;
  }, [focus.join("|"), pad, w, h]);   // eslint-disable-line react-hooks/exhaustive-deps
  const path = useMemo(() => geoPath(proj), [proj]);
  const [rx0, ry0] = proj([RELIEF.lon0, RELIEF.lat1]) as [number, number];
  const [rx1, ry1] = proj([RELIEF.lon1, RELIEF.lat0]) as [number, number];
  const outline = path(DATA.outline) ?? undefined;
  const scale = proj.scale() / 1500;              // line weights grow a little as the camera closes in
  const sw = Math.max(1.5, Math.min(4, 2.2 * scale));
  const fxOf = (name: string) => states[name];
  const painted = DATA.states.filter((s) => fxOf(s.properties.name));
  return (
    <MapCtx.Provider value={{ proj, path }}><FrameSize.Provider value={{ w, h }}>
      <defs>
        <clipPath id={`in${uid}`}><path d={outline} /></clipPath>
        <mask id={`out${uid}`}>
          <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="#fff" />
          <path d={outline} fill="#000" />
        </mask>
      </defs>
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="#16354d" />
      <image href={staticFile(RELIEF.file)} x={rx0} y={ry0} width={rx1 - rx0} height={ry1 - ry0} preserveAspectRatio="none" />
      {/* the spotlight: the world outside India dimmed, India untouched */}
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="#0b1724" opacity={dim} mask={`url(#out${uid})`} />
      {neighbourNames ? DATA.neighbours.map((n) => {
        const [x, y] = path.centroid(n);
        if (!isFinite(x) || x < 80 || x > w - 80 || y < 160 || y > h - 420) return null;
        return <text key={n.properties.code} x={x} y={y} fontFamily="Poppins" fontWeight={700} fontSize={34} textAnchor="middle" dominantBaseline="middle"
          fill="#ffffff" opacity={0.55} data-probe="skip">{n.properties.hi}</text>;
      }) : null}
      {/* India: a painted shadow, then the paper sheet over the relief (the relief shows through a little) */}
      <path d={outline} fill="#0b1724" opacity={0.35} transform="translate(7 9)" />
      <path d={outline} fill={sheet} opacity={0.78} />
      <g clipPath={`url(#in${uid})`} opacity={0.22}>
        <image href={staticFile(RELIEF.file)} x={rx0} y={ry0} width={rx1 - rx0} height={ry1 - ry0} preserveAspectRatio="none" />
      </g>
      {DATA.states.map((s) => <path key={`l${s.properties.name}`} d={path(s) ?? undefined} fill="none" stroke="#ffffff" strokeWidth={sw} strokeLinejoin="round" opacity={0.9} />)}
      {painted.map((s) => {
        const name = s.properties.name, f = fxOf(name)!;
        const draw = f.draw === undefined ? 1 : clamp(f.draw), paint = f.paint === undefined ? 1 : clamp(f.paint);
        const lift = clamp(f.lift, 0), trace = f.trace === undefined ? 0 : clamp(f.trace);
        const unseen = draw <= 0 || paint <= 0;
        if (unseen && trace <= 0) return null;
        const d = path(s) ?? undefined;
        const fillK = f.draw === undefined ? 1 : Math.max(0, (draw - 0.55) / 0.45);
        const colour = clamp(f.k) >= 1 ? f.fill : mixHex(sheet, f.fill, clamp(f.k));
        const [[x0, y0], [x1, y1]] = path.bounds(s);
        const from = f.from ? proj(f.from) : null;
        const [px, py] = from ?? [(x0 + x1) / 2, (y0 + y1) / 2];
        const R = Math.max(...[[x0, y0], [x1, y1], [x0, y1], [x1, y0]].map(([x, y]) => Math.hypot(px - x!, py - y!)));
        const cid = `p${uid}${name.replace(/[^a-zA-Z]/g, "")}`;
        const up = lift * 16;
        const tc = f.traceColor ?? "#ffd84a", tw = STROKE * 1.8;
        return (
          <g key={`f${name}`}>
            {paint < 1 ? <defs><clipPath id={cid}><circle cx={px} cy={py} r={R * paint} /></clipPath></defs> : null}
            {lift > 0 ? <path d={d} fill={INK} opacity={0.32 * lift} transform={`translate(${7 * lift} ${9 + up * 0.4})`} /> : null}
            <g transform={`translate(0 ${-up})`}>
              {unseen ? null : <path d={d} fill={colour} opacity={fillK} clipPath={paint < 1 ? `url(#${cid})` : undefined} />}
              {unseen ? null : <path d={d} fill="none" stroke={INK} strokeWidth={Math.max(3, STROKE * 0.6 * Math.min(1.4, scale))} strokeLinejoin="round"
                pathLength={1} strokeDasharray={draw < 1 ? `${draw} 1` : undefined} />}
              {trace > 0 ? (
                <g data-probe="skip">
                  <path d={d} fill="none" stroke={tc} strokeOpacity={0.35} strokeWidth={tw * 2.6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={trace < 1 ? `${trace} 1` : undefined} />
                  <path d={d} fill="none" stroke={tc} strokeWidth={tw} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={trace < 1 ? `${trace} 1` : undefined} />
                </g>
              ) : null}
            </g>
          </g>
        );
      })}
      {/* India's outline last, in ink, so the official border reads on every frame */}
      <path d={outline} fill="none" stroke={INK} strokeWidth={Math.max(3, STROKE * 0.75)} strokeLinejoin="round" />
      {names ? DATA.states.filter((s) => !fxOf(s.properties.name)).map((s) => {
        const [x, y] = path.centroid(s);
        const [[x0, y0], [x1, y1]] = path.bounds(s);
        if (!isFinite(x) || x1 - x0 < 150 || y1 - y0 < 70 || x < 60 || x > w - 60 || y < 180 || y > h - 420) return null;
        return <text key={`n${s.properties.name}`} x={x} y={y} fontFamily="Poppins" fontWeight={700} fontSize={30} textAnchor="middle" dominantBaseline="middle"
          fill={shade(INK, 0.25)} opacity={0.55} data-probe="skip">{s.properties.hi}</text>;
      }) : null}
      {children}
    </FrameSize.Provider></MapCtx.Provider>
  );
};

/** A pill pinned to a state's middle (or `at`): the state's name in Devanagari by default, or any label;
 * `k` pops it in. Sits above the state with a short stem. */
export const StateTag: React.FC<{ state: string; text?: string; at?: [number, number]; k?: number; size?: number; bg?: string; fg?: string; dy?: number }> = ({
  state, text, at, k = 1, size = 46, bg = "#ffffff", fg = INK, dy = -70,
}) => {
  const ctx = React.useContext(MapCtx);
  const frame = React.useContext(FrameSize);
  if (!ctx || k <= 0) return null;
  const s = byName(state);
  const xy = at ? ctx.proj(at) : s ? ctx.path.centroid(s) : null;
  if (!xy || !isFinite(xy[0])) return null;
  const label = text ?? s?.properties.hi ?? state;
  const pop = Math.min(1, k * 1.25) * (k < 0.8 ? 1 + 0.12 * Math.sin(k * Math.PI / 0.8) : 1);
  const wBox = Math.max(size * 2.2, label.length * size * 0.62 + size * 1.1), hBox = size * 1.6;
  // the pill stays whole inside the frame; its stem still points at the state
  const x = Math.min(Math.max(xy[0], wBox / 2 + 24), frame.w - wBox / 2 - 24), y = xy[1] + dy;
  const stemX = xy[0] - x;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop})`} opacity={Math.min(1, k * 2)}>
      <line x1={0} y1={hBox / 2} x2={stemX} y2={-dy} stroke={INK} strokeWidth={5} />
      <circle cx={stemX} cy={-dy} r={9} fill={bg} stroke={INK} strokeWidth={4} />
      <rect x={-wBox / 2 + 6} y={-hBox / 2 + 8} width={wBox} height={hBox} rx={hBox / 2} fill={INK} opacity={0.35} />
      <rect x={-wBox / 2} y={-hBox / 2} width={wBox} height={hBox} rx={hBox / 2} fill={bg} stroke={INK} strokeWidth={STROKE * 0.8} />
      <text x={0} y={2} fontFamily="Poppins" fontWeight={800} fontSize={size} textAnchor="middle" dominantBaseline="middle" fill={fg}>{label}</text>
    </g>
  );
};
