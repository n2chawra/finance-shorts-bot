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
import { FlagArt } from "./flags";
import data from "./data/india.json";

type Props = { name: string; hi: string; kind?: "state" | "ut"; code?: string };
type Shape = Feature<Geometry, Props>;
const DATA = data as unknown as { outline: Shape; states: Shape[]; neighbours: Shape[]; adjacent: Record<string, string[]> };
// Kerala is officially Keralam since 25 Aug 2026 (The Kerala (Alteration of Name) Act, 2026): set here too, so
// rebuilding data/india.json from Natural Earth (scripts/build_india_map.py) never brings the old name back.
for (const st of DATA.states) if (st.properties.name === "Kerala") (st.properties as { hi: string }).hi = "केरलम";

/** Every state and UT by its English name ("Uttar Pradesh", "Ladakh", "Dadra and Nagar Haveli and Daman and Diu"). */
export const INDIA_STATES: readonly string[] = DATA.states.map((s) => s.properties.name);
/** A state's new official name, for code that names it in English (owner research, 2026-11-25: Kerala is
 * officially Keralam since 25 Aug 2026). The data keeps the old key so older videos still resolve. */
export const STATE_ALIASES: Readonly<Record<string, string>> = { keralam: "Kerala" };
const keyOf = (name: string): string => STATE_ALIASES[name.toLowerCase()] ?? name;
/** The name a state goes by today, in English ("Kerala" -> "Keralam"). */
export const stateNow = (name: string): string => Object.entries(STATE_ALIASES).find(([, k]) => k === name)?.[0].replace(/^./, (c) => c.toUpperCase()) ?? name;
/** A state's or UT's name in Devanagari (Natural Earth's `name_hi`; Kerala as केरलम, its name since 2026). */
export const stateHi = (name: string): string => DATA.states.find((s) => s.properties.name === keyOf(name))?.properties.hi ?? name;
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
const byName = (name: string) => DATA.states.find((s) => s.properties.name.toLowerCase() === keyOf(name).toLowerCase());

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

/** The framing that shows these states (or "India") with `pad` pixels round them, as a centre and a scale, so a
 * beat can move the camera between two framings: `lerpFrame(frameOf(["India"]), frameOf(["Kerala"]), k)`. */
export function frameOf(focus: string[], w = 1080, h = 1920, pad = 90): { center: [number, number]; scale: number } {
  const p = geoEquirectangular();
  const framed = focus.flatMap((n) => (n.toLowerCase() === "india" ? [DATA.outline] : [byName(n)].filter((s): s is Shape => !!s)));
  p.fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: framed.length ? framed : [DATA.outline] });
  return { center: p.invert!([w / 2, h / 2]) as [number, number], scale: p.scale() };
}
/** Between two framings; the scale moves on a log curve so a push-in feels even. */
export const lerpFrame = (a: { center: [number, number]; scale: number }, b: { center: [number, number]; scale: number }, k: number) => {
  const q = Math.max(0, Math.min(1, k));
  return { center: [a.center[0] + (b.center[0] - a.center[0]) * q, a.center[1] + (b.center[1] - a.center[1]) * q] as [number, number],
    scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * q) };
};

export const IndiaMap: React.FC<{
  w: number; h: number;
  /** frame these states (English names) or "India" with `pad` pixels round them */
  focus?: string[]; pad?: number;
  /** or the camera itself (from `frameOf` / `lerpFrame`): wins over `focus` */
  frame?: { center: [number, number]; scale: number };
  /** paint states, made on screen */
  states?: Record<string, StateFx>;
  /** the sheet colour of unpainted India and how dark the world outside India sits (0 none .. 1 black) */
  sheet?: string; dim?: number;
  /** write every unpainted state's Devanagari name faintly (an atlas page) */
  names?: boolean;
  /** neighbours' Devanagari names (पाकिस्तान, चीन …) on the dimmed land */
  neighbourNames?: boolean;
  children?: React.ReactNode;
}> = ({ w, h, focus = ["India"], pad = 90, frame, states = {}, sheet = "#f3ead6", dim = 0.42, names = false, neighbourNames = false, children }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  useLoaded(staticFile(RELIEF.file));
  const proj = useMemo(() => {
    const p = geoEquirectangular();
    if (frame) return p.scale(frame.scale).center(frame.center).translate([w / 2, h / 2]);
    const framed = focus.flatMap((n) => (n.toLowerCase() === "india" ? [DATA.outline] : [byName(n)].filter((s): s is Shape => !!s)));
    p.fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: framed.length ? framed : [DATA.outline] });
    return p;
  }, [focus.join("|"), pad, w, h, frame?.center[0], frame?.center[1], frame?.scale]);   // eslint-disable-line react-hooks/exhaustive-deps
  const path = useMemo(() => geoPath(proj), [proj]);
  const [rx0, ry0] = proj([RELIEF.lon0, RELIEF.lat1]) as [number, number];
  const [rx1, ry1] = proj([RELIEF.lon1, RELIEF.lat0]) as [number, number];
  const outline = path(DATA.outline) ?? undefined;
  const scale = proj.scale() / 1500;              // line weights grow a little as the camera closes in
  const sw = Math.max(1.5, Math.min(4, 2.2 * scale));
  const fxOf = (name: string) => states[name] ?? states[stateNow(name)];
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

/** An Indian vehicle number plate pinned to a state (the India Maps channel's every-state plates, 2026-11-24): a white
 * plate with an ink border and the blue "IND" strip on the left, the state's letters big; `k` drops it in with a
 * bounce, `glow` rings it while it is spoken. Letters only: a plate's numbers are never drawn (figures come from code). */
export const Plate: React.FC<{ state?: string; at?: [number, number]; text: string; k?: number; size?: number; dy?: number; glow?: number; tone?: string; maxY?: number }> = ({
  state, at, text, k = 1, size = 1, dy = 0, glow = 0, tone = "#ffffff", maxY,
}) => {
  const ctx = React.useContext(MapCtx);
  const frame = React.useContext(FrameSize);
  if (!ctx || k <= 0) return null;
  const s = state ? byName(state) : undefined;
  const xy = at ? ctx.proj(at) : s ? ctx.path.centroid(s) : null;
  if (!xy || !isFinite(xy[0])) return null;
  const W = 190 * size, H = 82 * size, strip = 34 * size;
  const x = Math.min(Math.max(xy[0], W / 2 + 20), frame.w - W / 2 - 20);
  const drop = (1 - Math.min(1, k * 1.3)) * -60 * size, sq = k < 0.85 ? 1 : 1 + 0.08 * Math.sin((k - 0.85) / 0.15 * Math.PI);
  const y = xy[1] + dy + drop;
  // `maxY`: a plate that would sit lower than this (in the captions' band) fades out instead of hiding under them
  const keep = maxY === undefined ? 1 : Math.max(0, Math.min(1, (maxY + 60 - y) / 60));
  if (keep <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sq} ${1 / sq})`} opacity={Math.min(1, k * 2.2) * keep}>
      {glow > 0 ? <rect x={-W / 2 - 14} y={-H / 2 - 14} width={W + 28} height={H + 28} rx={16 * size} fill="#ffd84a" opacity={0.45 * glow} data-probe="skip" /> : null}
      <rect x={-W / 2 + 6} y={-H / 2 + 8} width={W} height={H} rx={10 * size} fill={INK} opacity={0.4} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={10 * size} fill={tone} stroke={INK} strokeWidth={5 * size} />
      <rect x={-W / 2 + 7 * size} y={-H / 2 + 7 * size} width={strip} height={H - 14 * size} rx={5 * size} fill="#2a4fb0" />
      <text x={-W / 2 + 7 * size + strip / 2} y={H / 2 - 16 * size} fontFamily="Poppins" fontWeight={700} fontSize={13 * size} textAnchor="middle" fill="#ffffff" data-probe="skip">IND</text>
      <text x={strip / 2 + 4 * size} y={3 * size} fontFamily="Poppins" fontWeight={900} fontSize={54 * size} letterSpacing={3 * size} textAnchor="middle" dominantBaseline="middle" fill={INK}>{text}</text>
    </g>
  );
};

/** Several states drawn as one, the way the map looked before a split (2026-11-25, for v-20261125-61: Madhya Pradesh
 * with Chhattisgarh, Uttar Pradesh with Uttaranchal, Bihar with Jharkhand before November 2000): one fill with no line
 * inside, an ink outline round the outside only; `k` fades it in, `lift` raises it off the sheet, `trace` runs a bright
 * line round its outer border. Put it as a child of `IndiaMap` (it draws over the states). */
export const StateUnion: React.FC<{ names: string[]; fill: string; k?: number; lift?: number; trace?: number; traceColor?: string }> = ({
  names, fill, k = 1, lift = 0, trace = 0, traceColor = "#ffd84a",
}) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!ctx || k <= 0) return null;
  const ds = names.map(byName).filter((s): s is Shape => !!s).map((s) => ctx.path(s) ?? "");
  const scale = ctx.proj.scale() / 1500;
  const sw = Math.max(3, STROKE * 0.6 * Math.min(1.4, scale));
  const up = clamp(lift, 0) * 16, tr = clamp(trace, 0), tw = STROKE * 1.8;
  return (
    <g opacity={clamp(k)}>
      <defs>
        <mask id={`u${uid}`}>
          <rect x={-5000} y={-5000} width={10000} height={10000} fill="#fff" />
          {ds.map((d, i) => <path key={i} d={d} fill="#000" />)}
        </mask>
      </defs>
      {up > 0 ? <g opacity={0.32 * clamp(lift, 0)} transform={`translate(${7 * clamp(lift, 0)} ${9 + up * 0.4})`}>{ds.map((d, i) => <path key={i} d={d} fill={INK} />)}</g> : null}
      <g transform={`translate(0 ${-up})`}>
        {ds.map((d, i) => <path key={`f${i}`} d={d} fill={fill} stroke={fill} strokeWidth={sw * 1.6} strokeLinejoin="round" />)}
        <g mask={`url(#u${uid})`}>
          {ds.map((d, i) => <path key={`o${i}`} d={d} fill="none" stroke={INK} strokeWidth={sw * 2} strokeLinejoin="round" />)}
          {tr > 0 ? (
            <g data-probe="skip">
              {ds.map((d, i) => <path key={`t${i}`} d={d} fill="none" stroke={traceColor} strokeWidth={tw * 2.4} strokeLinejoin="round" strokeLinecap="round"
                pathLength={1} strokeDasharray={tr < 1 ? `${tr} 1` : undefined} />)}
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};

/** The line a split draws: the border between `state` and `parent` (only the stretch they share), as a dashed
 * line that runs on as `k` goes 0 -> 1, like a cut being marked on paper (2026-11-25, for v-20261125-61). */
export const CutLine: React.FC<{ state: string; parent: string; k: number; color?: string; width?: number }> = ({
  state, parent, k, color = "#e8453c", width = 14,
}) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = byName(state), par = byName(parent);
  if (!ctx || !s || !par || k <= 0) return null;
  const d = ctx.path(s) ?? "", dp = ctx.path(par) ?? "";
  const q = clamp(k);
  return (
    <g data-probe="skip">
      <defs>
        <clipPath id={`c${uid}`}><path d={dp} /></clipPath>
        <mask id={`m${uid}`}><path d={d} fill="none" stroke="#fff" strokeWidth={width * 4} pathLength={1} strokeDasharray={q < 1 ? `${q} 1` : undefined} /></mask>
      </defs>
      <g clipPath={`url(#c${uid})`} mask={`url(#m${uid})`}>
        <path d={d} fill="none" stroke="#ffffff" strokeWidth={width * 2 + 6} strokeLinejoin="round" opacity={0.9} />
        <path d={d} fill="none" stroke={color} strokeWidth={width * 2} strokeLinejoin="round" strokeDasharray={`${width * 1.6} ${width * 1.1}`} />
      </g>
    </g>
  );
};

/** A neighbouring country on India's map (2026-11-25, for v-20261125-62): its land outside India's official outline
 * filled with `fill`, its whole flag (`flag`, a name `flags.tsx` has) fitted over its box and clipped to its shape,
 * an ink outline; `k` fades it in, `flagK` the flag. Names: China, Bhutan, Myanmar, Bangladesh, Afghanistan, Nepal,
 * Pakistan, Sri Lanka, Maldives. A child of `IndiaMap`; never covers India (masked to outside its outline). */
export const Neighbour: React.FC<{ name: string; fill?: string; flag?: string; k?: number; flagK?: number; lift?: number }> = ({
  name, fill = "#d8cdb6", flag, k = 1, flagK = 1, lift = 0,
}) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = DATA.neighbours.find((c) => c.properties.name === name);
  if (!ctx || !n || k <= 0) return null;
  const d = ctx.path(n) ?? "", outline = ctx.path(DATA.outline) ?? "";
  const [[x0, y0], [x1, y1]] = ctx.path.bounds(n);
  const up = clamp(lift, 0) * 14;
  return (
    <g opacity={clamp(k)}>
      <defs>
        <mask id={`o${uid}`}><rect x={-5000} y={-5000} width={10000} height={10000} fill="#fff" /><path d={outline} fill="#000" /></mask>
        <clipPath id={`c${uid}`}><path d={d} /></clipPath>
      </defs>
      <g mask={`url(#o${uid})`}>
        {up > 0 ? <path d={d} fill={INK} opacity={0.3 * clamp(lift, 0)} transform={`translate(6 ${8 + up * 0.4})`} /> : null}
        <g transform={`translate(0 ${-up})`}>
          <g clipPath={`url(#c${uid})`}>
            <path d={d} fill={fill} />
            {flag && flagK > 0 ? <FlagArt name={flag} x={x0} y={y0} w={x1 - x0} h={y1 - y0} cover opacity={clamp(flagK)} /> : null}
          </g>
          <path d={d} fill="none" stroke={INK} strokeWidth={Math.max(3, STROKE * 0.6)} strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
};

/** The land border India shares with a neighbour, drawn on as `k` goes 0 -> 1 (a bright line with a soft glow): only
 * the stretch of the neighbour's outline that runs along India's official outline (2026-11-25, for v-20261125-62). */
export const BorderLine: React.FC<{ name: string; k: number; color?: string; width?: number }> = ({ name, k, color = "#ffd84a", width = 12 }) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = DATA.neighbours.find((c) => c.properties.name === name);
  if (!ctx || !n || k <= 0) return null;
  const d = ctx.path(n) ?? "", outline = ctx.path(DATA.outline) ?? "";
  const q = clamp(k);
  return (
    <g data-probe="skip">
      <defs>
        <mask id={`b${uid}`}>
          <path d={outline} fill="none" stroke="#fff" strokeWidth={width * 3} strokeLinejoin="round" />
        </mask>
        <mask id={`p${uid}`}><path d={d} fill="none" stroke="#fff" strokeWidth={width * 6} pathLength={1} strokeDasharray={q < 1 ? `${q} 1` : undefined} /></mask>
      </defs>
      <g mask={`url(#b${uid})`}>
        <g mask={`url(#p${uid})`}>
          <path d={d} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={width * 2.6} strokeLinejoin="round" strokeLinecap="round" />
          <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/** India's land neighbours: a coast is India's outline away from these. */
const LAND_NEIGHBOURS = ["China", "Bhutan", "Myanmar", "Bangladesh", "Afghanistan", "Nepal", "Pakistan"];

/** The sea coast of a state (or of all of "India"): the stretch of its border that runs along India's official outline
 * and touches no land neighbour, as a bright line with a soft glow (2026-11-26, for v-20261126-61). `k` 0 -> 1 reveals
 * it: with `pivot` ([lon, lat]) as a sweep round that point from screen angle `a0` to `a1` (degrees, 0 = east,
 * 90 = south: Gujarat to Bengal round the peninsula is a0 190, a1 -15), else drawn on along the border. */
export const CoastLine: React.FC<{ name?: string; k: number; color?: string; width?: number; pivot?: [number, number]; a0?: number; a1?: number }> = ({
  name = "India", k, color = "#5fd3ff", width = 10, pivot, a0 = 190, a1 = -15,
}) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const shape = name.toLowerCase() === "india" ? DATA.outline : byName(name);
  if (!ctx || !shape || k <= 0) return null;
  const d = ctx.path(shape) ?? "", outline = ctx.path(DATA.outline) ?? "";
  const land = DATA.neighbours.filter((n) => LAND_NEIGHBOURS.includes(n.properties.name));
  const q = clamp(k);
  const big = { x: -4000, y: -4000, width: 9000, height: 9000 };
  let wedge = "";
  if (pivot) {
    const c = ctx.proj(pivot) as [number, number];
    const R = 6000, steps = 48, a = (v: number) => (v * Math.PI) / 180;
    const pts = Array.from({ length: steps + 1 }, (_, i) => a0 + ((a1 - a0) * q * i) / steps).map((v) => `${c[0] + R * Math.cos(a(v))} ${c[1] + R * Math.sin(a(v))}`);
    wedge = `M ${c[0]} ${c[1]} L ${pts.join(" L ")} Z`;
  }
  return (
    <g data-probe="skip">
      <defs>
        <mask id={`c${uid}`} maskUnits="userSpaceOnUse" {...big}>
          <path d={outline} fill="none" stroke="#fff" strokeWidth={width * 3} strokeLinejoin="round" />
          {land.map((n) => <path key={n.properties.name} d={ctx.path(n) ?? ""} fill="#000" stroke="#000" strokeWidth={width * 4} />)}
        </mask>
        {pivot ? <mask id={`r${uid}`} maskUnits="userSpaceOnUse" {...big}><path d={wedge} fill="#fff" /></mask> : null}
      </defs>
      <g mask={`url(#c${uid})`}>
        <g mask={pivot && q < 1 ? `url(#r${uid})` : undefined}>
          <path d={d} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={width * 2.6} strokeLinejoin="round" strokeLinecap="round"
            pathLength={pivot ? undefined : 1} strokeDasharray={!pivot && q < 1 ? `${q} 1` : undefined} />
          <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round"
            pathLength={pivot ? undefined : 1} strokeDasharray={!pivot && q < 1 ? `${q} 1` : undefined} />
        </g>
      </g>
    </g>
  );
};

/** Surf along India's sea coast (2026-11-26, for v-20261126-61): rings of foam that roll in from the sea onto the
 * shore, only on the sea side and never along a land border. `t` is the story frame (`m.t`); `k` fades it in;
 * `period` frames per wave; `reach` how far out (px) a wave starts. */
export const CoastSurf: React.FC<{ t: number; k?: number; period?: number; reach?: number; color?: string }> = ({ t, k = 1, period = 54, reach = 70, color = "#e9f8ff" }) => {
  const ctx = React.useContext(MapCtx);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!ctx || k <= 0) return null;
  const outline = ctx.path(DATA.outline) ?? "";
  const land = DATA.neighbours.filter((n) => LAND_NEIGHBOURS.includes(n.properties.name));
  const big = { x: -4000, y: -4000, width: 9000, height: 9000 };
  return (
    <g data-probe="skip" opacity={clamp(k)}>
      <defs>
        <mask id={`s${uid}`} maskUnits="userSpaceOnUse" {...big}>
          <rect {...big} fill="#fff" />
          <path d={outline} fill="#000" />
          {land.map((n) => <path key={n.properties.name} d={ctx.path(n) ?? ""} fill="#000" stroke="#000" strokeWidth={reach * 2.4} />)}
        </mask>
      </defs>
      <g mask={`url(#s${uid})`}>
        {[0, 1, 2].map((i) => {
          const f = (((t / period + i / 3) % 1) + 1) % 1;      // 0 far out -> 1 on the shore
          const r = (1 - f) * reach * 2 + 6;
          return <path key={i} d={outline} fill="none" stroke={color} strokeWidth={r} strokeOpacity={0.1 + 0.22 * f} strokeLinejoin="round" />;
        })}
        <path d={outline} fill="none" stroke={color} strokeWidth={9 + 3 * Math.sin(t / 9)} strokeOpacity={0.55} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Ripples on the open sea round India (2026-11-26, for v-20261126-61): small wave crests on a seeded grid across the
 * frame, only outside India's outline, drifting and breathing with `t` (`m.t`), so the sea is never a flat sheet.
 * `k` fades them in; `gap` is the grid step in px; `top` the highest y they reach. */
export const SeaRipples: React.FC<{ t: number; k?: number; gap?: number; top?: number; color?: string }> = ({ t, k = 1, gap = 84, top = 0, color = "#cfeeff" }) => {
  const ctx = React.useContext(MapCtx);
  const frame = React.useContext(FrameSize);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!ctx || k <= 0) return null;
  const outline = ctx.path(DATA.outline) ?? "";
  const land = DATA.neighbours.filter((n) => LAND_NEIGHBOURS.includes(n.properties.name) || n.properties.name === "Sri Lanka");
  const crests: React.ReactNode[] = [];
  let i = 0;
  for (let y = top + gap / 2; y < frame.h + gap; y += gap) {
    for (let x = gap / 2; x < frame.w + gap; x += gap) {
      i += 1;
      const j = Math.sin(i * 12.9898) * 43758.5453, r = j - Math.floor(j);            // a fixed jitter per crest
      const cx = x + (r - 0.5) * gap * 0.6 + Math.sin((t + i * 7) / 40) * 8, cy = y + ((r * 7) % 1 - 0.5) * gap * 0.5;
      const o = 0.22 + 0.18 * Math.sin((t + i * 11) / 22);
      crests.push(<path key={i} d={`M ${cx - 26} ${cy} Q ${cx - 13} ${cy - 12} ${cx} ${cy} Q ${cx + 13} ${cy + 12} ${cx + 26} ${cy}`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={o} />);
    }
  }
  return (
    <g data-probe="skip" opacity={clamp(k)}>
      <defs>
        <mask id={`r${uid}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={frame.w + 400} height={frame.h + 400}>
          <rect x={-200} y={-200} width={frame.w + 400} height={frame.h + 400} fill="#fff" />
          <path d={outline} fill="#000" stroke="#000" strokeWidth={30} />
          {land.map((n) => <path key={n.properties.name} d={ctx.path(n) ?? ""} fill="#000" />)}
        </mask>
      </defs>
      <g mask={`url(#r${uid})`}>{crests}</g>
    </g>
  );
};
