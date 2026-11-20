/**
 * Versus (playbook gap #7, P5 business wars): two brand plates split by a tilted white seam, a "VS" badge on the
 * seam, and whatever goes on each side (usually a ProductHero or a cut-out logo each, facing the seam).
 * The loser's side may take ProductHero `damage`; the winner keeps its colour.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY } from "../theme";
import { tint } from "./Plate";
import { capSize } from "./Tags";

export const VersusSplit: React.FC<{
  left: string; right: string;          // the two brand colours
  tilt?: number;                        // the seam's lean, as a share of the width at the top vs bottom
  vs?: boolean;
  children?: React.ReactNode;           // both sides' things, drawn over the plates and under the badge
  w: number; h: number;
}> = ({ left, right, tilt = 0.06, vs = true, children, w, h }) => {
  const top = w * (0.5 + tilt), bot = w * (0.5 - tilt);
  const s = capSize(h, 0.11);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 25% 45%, ${tint(left, 0.25)} 0%, ${left} 40%, ${tint(left, -0.55)} 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 45%, ${tint(right, 0.25)} 0%, ${right} 40%, ${tint(right, -0.55)} 100%)`,
        clipPath: `polygon(${top}px 0, ${w}px 0, ${w}px ${h}px, ${bot}px ${h}px)` }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <line x1={top} y1={-10} x2={bot} y2={h + 10} stroke="#ffffff" strokeWidth={h * 0.02} />
      </svg>
      {children}
      {vs ? (
        <div style={{ position: "absolute", left: w / 2, top: h * 0.5, transform: "translate(-50%, -50%) rotate(-6deg)", width: s * 1.5, height: s * 1.5, borderRadius: "50%",
          background: "#141414", border: `${Math.round(s * 0.08)}px solid #ffffff`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: DISPLAY, fontSize: s * 0.75, color: "#ffd23f", boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }}>VS</div>
      ) : null}
    </AbsoluteFill>
  );
};
