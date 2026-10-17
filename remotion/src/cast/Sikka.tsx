/**
 * Sikka, the living ₹ coin: the money itself as a character. It gets spent and runs off, gets
 * invested and grows, multiplies, sulks when it's wasted. It never gives advice.
 */
import React from "react";
import { Face, type Expression, type Viseme } from "./face";
import { SIKKA } from "./cast";

export const Sikka: React.FC<{
  x: number; y: number; size?: number; expression?: Expression; viseme?: Viseme | null;
  spin?: number; squash?: number; armsUp?: boolean; blink?: number; gaze?: [number, number];
}> = ({ x, y, size = 120, expression = "happy", viseme, spin = 0, squash = 0, armsUp = false, blink = 0, gaze = [0, 0] }) => {
  const r = size / 2;
  const sx = Math.max(0.2, Math.abs(Math.cos(spin))) * (1 + squash);
  const sy = 1 - squash * 0.6;
  const showFace = Math.abs(Math.cos(spin)) > 0.55;
  const limb = { stroke: SIKKA.rim, strokeWidth: r * 0.12, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 1.55} rx={r * 0.8} ry={r * 0.14} fill="#000" opacity={0.2} />
      {/* legs and arms first, so the coin's body sits on top of them */}
      <path d={`M${-r * 0.3},${r * 0.85} l${-r * 0.1},${r * 0.55} l${-r * 0.2},0`} {...limb} />
      <path d={`M${r * 0.3},${r * 0.85} l${r * 0.1},${r * 0.55} l${r * 0.2},0`} {...limb} />
      <path d={armsUp ? `M${-r * 0.9},0 l${-r * 0.35},${-r * 0.6}` : `M${-r * 0.9},${r * 0.1} l${-r * 0.35},${r * 0.45}`} {...limb} />
      <path d={armsUp ? `M${r * 0.9},0 l${r * 0.35},${-r * 0.6}` : `M${r * 0.9},${r * 0.1} l${r * 0.35},${r * 0.45}`} {...limb} />
      <g transform={`scale(${sx},${sy})`}>
        <circle r={r} fill={SIKKA.rim} />
        <circle r={r * 0.92} fill={SIKKA.gold} />
        <circle r={r * 0.78} fill="none" stroke={SIKKA.goldShade} strokeWidth={r * 0.05} />
        <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.32} ry={r * 0.16} fill="#ffffff" opacity={0.45} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.45})`} />
        {showFace ? (
          <g transform={`translate(0,${-r * 0.08}) scale(${(r * 0.62) / 70})`}>
            <Face expression={expression} viseme={viseme} turn={0} look={gaze} blink={blink} skin={SIKKA.gold} ink={SIKKA.ink} lip={SIKKA.ink} r={70} />
          </g>
        ) : (
          <text y={r * 0.32} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={r} fill={SIKKA.goldShade}>₹</text>
        )}
      </g>
    </g>
  );
};
