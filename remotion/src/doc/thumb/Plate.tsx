/**
 * The ground behind a thumbnail's subject (playbook gap #3). Prefer a plate that isn't red: the feed is red.
 *   "grid"   off-white grid paper (the Bagholder look, for P1: a dark product reads on it)
 *   "brand"  a saturated radial in the brand's own colour (`color`), lighter at `at` (P2, P5)
 *   "dark"   charcoal with a vignette and a soft spot at `at` (P3, P4); `color` tints the spot
 */
import React, { useId } from "react";
import { AbsoluteFill } from "remotion";

export type PlateKind = "grid" | "brand" | "dark";

/** A hex colour mixed toward white (k > 0) or black (k < 0). */
export function tint(hex: string, k: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k)));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export const Plate: React.FC<{ kind: PlateKind; color?: string; at?: [number, number]; w: number; h: number }> = ({ kind, color, at = [0.5, 0.45], w, h }) => {
  const pos = `${at[0] * 100}% ${at[1] * 100}%`;
  const id = useId().replace(/:/g, "");
  if (kind === "grid") {
    const minor = Math.round(h / 24), major = minor * 4;
    return (
      <AbsoluteFill style={{ background: "#f2eee5" }}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id={`minor-${id}`} width={minor} height={minor} patternUnits="userSpaceOnUse">
              <path d={`M ${minor} 0 L 0 0 0 ${minor}`} fill="none" stroke="#c9d3db" strokeWidth={1.2} />
            </pattern>
            <pattern id={`major-${id}`} width={major} height={major} patternUnits="userSpaceOnUse">
              <rect width={major} height={major} fill={`url(#minor-${id})`} />
              <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" stroke="#a9b8c4" strokeWidth={2.2} />
            </pattern>
          </defs>
          <rect width={w} height={h} fill={`url(#major-${id})`} />
        </svg>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${pos}, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%, rgba(60,50,30,0.22) 100%)` }} />
      </AbsoluteFill>
    );
  }
  if (kind === "brand") {
    const c = color ?? "#3fae2a";
    return <AbsoluteFill style={{ background: `radial-gradient(circle at ${pos}, ${tint(c, 0.28)} 0%, ${c} 38%, ${tint(c, -0.55)} 100%)` }} />;
  }
  const spot = color ?? "#3a4150";
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${pos}, ${spot} 0%, #1a1c22 42%, #08090b 100%)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};
