/**
 * Surface: a fine paper grain over every frame (the handmade, printed feel of the best animated
 * finance channels) and quiet patterned backgrounds (grid paper, dots, soft waves) for scenes that
 * need a backdrop but no place. The grain is static: it adds texture, never fake motion, so the
 * liveliness gate still measures only real animation. It is a tiled image (public/grain.png: 256 px of
 * seeded noise, black with the darkening in its alpha, which equals the old 7% multiply blend): the
 * full-frame SVG noise filter and blend it replaced were recomputed on every frame and cost about a
 * third of the render time (measured 2026-10-21).
 */
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import type { PaletteT } from "../contract/timeline";

export const Grain: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: `url(${staticFile("grain.png")})`, backgroundRepeat: "repeat" }} data-probe="skip" />
);

export type PatternKind = "grid" | "dots" | "waves" | "rays";

/** A soft patterned backdrop in the palette's colours, drifting slowly. */
export const Pattern: React.FC<{ kind: PatternKind; pal: PaletteT; w: number; h: number; t: number; id: string }> = ({ kind, pal, w, h, t, id }) => {
  const drift = (t * 14) % 80;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${pal.bg}, ${pal.bgBottom})` }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>
          <pattern id={`${id}-grid`} width={80} height={80} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift},${drift * 0.5})`}>
            <path d="M80,0 L0,0 0,80" fill="none" stroke={pal.grid} strokeWidth={2} opacity={0.55} />
          </pattern>
          <pattern id={`${id}-dots`} width={56} height={56} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift * 0.6},0)`}>
            <circle cx={28} cy={28} r={4} fill={pal.grid} opacity={0.7} />
          </pattern>
          <pattern id={`${id}-waves`} width={160} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift * 2},0)`}>
            <path d="M0,30 C40,0 80,60 120,30 S160,30 160,30" fill="none" stroke={pal.grid} strokeWidth={4} opacity={0.5} />
          </pattern>
        </defs>
        {kind === "rays"
          ? Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2 + t * 0.08;
            return <path key={i} d={`M${w / 2},${h * 0.45} L${w / 2 + Math.cos(a) * w * 2},${h * 0.45 + Math.sin(a) * w * 2} L${w / 2 + Math.cos(a + 0.12) * w * 2},${h * 0.45 + Math.sin(a + 0.12) * w * 2}Z`}
              fill={pal.panel} opacity={i % 2 ? 0.45 : 0.2} />;
          })
          : <rect width={w} height={h} fill={`url(#${id}-${kind})`} />}
      </svg>
    </AbsoluteFill>
  );
};
