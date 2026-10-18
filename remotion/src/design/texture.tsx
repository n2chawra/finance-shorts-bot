/**
 * Surface: a fine paper grain over every frame (the handmade, printed feel of the best animated
 * finance channels) and quiet patterned backgrounds (grid paper, dots, soft waves) for scenes that
 * need a backdrop but no place. The grain is static: it adds texture, never fake motion, so the
 * liveliness gate still measures only real animation.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import type { PaletteT } from "../contract/timeline";

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity }} data-probe="skip">
    <svg width="100%" height="100%">
      <filter id="grain-f" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-f)" />
    </svg>
  </AbsoluteFill>
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
