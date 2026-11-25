/**
 * Water that moves on a map (owner, 2026-11-25, v-20261125-12 "What if Africa split in two?": "Floods and
 * water moving could have been animated much better kinda showing growing like waves or something. Right
 * now it's a shape and line which is very bad animated.").
 *
 *   <MapWater>   a sea, flood or lake spreading over a place: a living, wavy front with a foam line rolls
 *                out from `from` as `k` goes 0 → 1, a lighter shallow band behind the front, deep water
 *                behind that with ripples drifting across it, spray on the front, and waves lapping the
 *                new shore once it is full. Never a flat shape that scales up.
 *
 * A child of `WorldMap` or `IndiaMap` (it reads the map's projection). Pure: pass `t` from `motion(p)`.
 */
import React, { useId } from "react";
import { country, useMap } from "./map";
import { frontRing, reachOf, rippleD } from "./waterGeo";
export { frontRing, reachOf, rippleD };

type XY = [number, number];

const d = (pts: XY[], close = true): string =>
  pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + (close ? " Z" : "");

export const MapWater: React.FC<{
  /** where it spreads: a ring of [lon, lat] points, or a country by its Natural Earth name */
  area?: XY[]; name?: string;
  /** where the water comes in ([lon, lat]: a strait, a breached bank, a river mouth) */
  from: XY;
  /** how far it has spread, 0 → 1 (1 = the whole area under water) */
  k: number;
  /** the story clock (`m.t`), so the waves keep moving */
  t: number;
  deep?: string; shallow?: string; foam?: string;
  /** the shallow band behind the front (px) */
  band?: number;
  seed?: number;
}> = ({ area, name, from, k, t, deep = "#3f86a8", shallow = "#7cc3d8", foam = "#f4fbfb", band = 48, seed = 0 }) => {
  const { proj, path } = useMap();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const o = proj(from) as XY | null;
  if (!o || k <= 0) return null;
  let shape: string | null = null;
  let box: [XY, XY] | null = null;
  if (area && area.length >= 3) {
    const xy = area.map((p) => proj(p) as XY | null).filter((p): p is XY => !!p);
    if (xy.length >= 3) {
      shape = d(xy);
      box = [[Math.min(...xy.map((p) => p[0])), Math.min(...xy.map((p) => p[1]))], [Math.max(...xy.map((p) => p[0])), Math.max(...xy.map((p) => p[1]))]];
    }
  } else if (name) {
    const c = country(name);
    if (c) { shape = path(c); box = path.bounds(c) as [XY, XY]; }
  }
  if (!shape || !box) return null;
  const q = Math.max(0, Math.min(1, k));
  // ease out: the water rushes in, then slows as it fills the low ground
  const r = reachOf(o[0], o[1], box) * (1 - Math.pow(1 - q, 2.2));
  const outer = frontRing(o[0], o[1], r, t, seed);
  const inner = frontRing(o[0], o[1], r - band, t + 11, seed + 1);
  const full = q >= 1 ? 1 : Math.max(0, (q - 0.85) / 0.15);
  const rows: number[] = [];
  for (let y = box[0][1] - 20; y <= box[1][1] + 20; y += 64) rows.push(y);
  const spray = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + seed;
    const p = outer[Math.floor((a / (Math.PI * 2)) * outer.length) % outer.length]!;
    const bob = Math.abs(Math.sin(t / 5 + i * 1.3));
    return { x: p[0], y: p[1] - 6 - 12 * bob, rr: 5 + 4 * bob };
  });
  return (
    <g>
      <defs>
        <clipPath id={`wa${uid}`}><path d={shape} /></clipPath>
        <clipPath id={`wi${uid}`}><path d={d(inner)} /></clipPath>
      </defs>
      <g clipPath={`url(#wa${uid})`}>
        {outer.length ? <path d={d(outer)} fill={shallow} /> : null}
        {inner.length ? <path d={d(inner)} fill={deep} /> : null}
        {inner.length ? (
          <g clipPath={`url(#wi${uid})`} opacity={0.45}>
            {rows.map((y, i) => (
              <path key={i} d={rippleD(box![0][0] - 20, box![1][0] + 20, y + 10 * Math.sin(t / 20 + i), t, i)} fill="none" stroke={foam} strokeWidth={5} strokeLinecap="round" strokeDasharray="70 60" />
            ))}
          </g>
        ) : null}
        {q < 1 && outer.length ? (
          <>
            <path d={d(outer)} fill="none" stroke={foam} strokeWidth={14} strokeLinejoin="round" strokeDasharray="34 16" strokeDashoffset={-t * 3} />
            <path d={d(frontRing(o[0], o[1], r - 18, t + 5, seed + 2))} fill="none" stroke={foam} strokeWidth={5} opacity={0.6} strokeDasharray="18 22" strokeDashoffset={t * 2} />
            {spray.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.rr} fill={foam} opacity={0.85} />)}
          </>
        ) : null}
      </g>
      {full > 0 ? (
        // the new shore: waves lap the edge once the water has filled it
        <path d={shape} fill="none" stroke={foam} strokeWidth={8 + 3 * Math.sin(t / 6)} strokeLinejoin="round" opacity={0.85 * full}
          strokeDasharray="26 14" strokeDashoffset={-t * 2} />
      ) : null}
    </g>
  );
};
