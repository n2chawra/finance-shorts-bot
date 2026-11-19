/**
 * Where it happened: a dark map (Natural Earth, flat/map.tsx) framed on countries, pins dropping on
 * places as they are named, a label beside each, the camera easing in on the last pin.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { MapLabel, MapPin, WorldMap } from "../flat/map";
import { DOC, outCubic, smooth, unit } from "./theme";

export type Pin = { at: [number, number]; label?: string; on?: number };

/** `fit` frames countries; a country that wraps the globe (the USA with Alaska) frames better with
 * `center` [lon, lat] and `scale` (pixels per radian at 1080 px). */
export const DocMap: React.FC<{ fit?: string[]; center?: [number, number]; scale?: number; pins: Pin[]; t: number; end: number; w: number; h: number; hi?: string[] }> = ({
  fit, center, scale, pins, t, end, w, h, hi = [],
}) => {
  const u = unit(w, h);
  const zoom = 1 + 0.08 * smooth(t / Math.max(1, end));
  const colors = Object.fromEntries(hi.map((n) => [n, { fill: "#5e4a1e", k: outCubic(t / 20) }]));
  return (
    <AbsoluteFill style={{ background: DOC.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <WorldMap w={w} h={h} {...(center && scale ? { center, scale: scale * u } : { fit: fit ?? [] })} pad={140 * u} kind="flat" land="#1b2433" sea={DOC.bg} border="#33405a" colors={colors}>
            {pins.map((p, i) => {
              const k = outCubic((t - (p.on ?? 6 + i * 20)) / 12);
              return (
                <g key={i}>
                  <MapPin at={p.at} k={k} color={DOC.red} r={20 * u} />
                  {p.label ? <MapLabel at={p.at} text={p.label} size={Math.max(30, 38 * u)} k={k} dy={30 * u} /> : null}
                </g>
              );
            })}
          </WorldMap>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
