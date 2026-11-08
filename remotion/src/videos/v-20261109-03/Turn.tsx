/**
 * The turn: "That's more than Delta's whole profit before tax."
 * An office at dusk, header CARD BEATS PROFIT from frame 0. Two columns: on the left a gold column
 * topped by the rewards card, the card money figure and FROM AMEX; on the right a shorter blue column
 * topped by the jet, with the pre-tax profit figure and PRE-TAX PROFIT. On "more" the gold column
 * shoots up past the blue one; on "whole" the blue column hops; on "profit" a red ">" stamps between
 * them and the camera pushes in.
 *
 * params: { header, big, bigLabel, small, smallLabel }, events: more, whole, profit
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Card = props.rewardcard!, Jet = props.jetliner!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; big?: string; bigLabel?: string; small?: string; smallLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 120, mass: 0.9 } }));
  const tMore = at(p, "more", 0.3), tWhole = at(p, "whole", 1.0), tProfit = at(p, "profit", 1.6);
  const kMore = sp(tMore), kWhole = sp(tWhole, 8), kProfit = sp(tProfit, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const colW = w * 0.28, base = h * 0.62, xBig = w * 0.3, xSmall = w * 0.7;
  const hSmall = h * 0.18, hBig = h * (0.22 + 0.08 * kMore);   // the card money's column ends taller than the profit's
  const hop = kWhole * Math.abs(Math.sin((t - tWhole) * 7)) * (t < tWhole + 0.6 ? 1 : 0);
  const lab = (s: string, base0 = 48) => Math.max(min * 1.1, fitLine(s.toUpperCase(), base0, colW + 60, { upper: true }));
  const fig = (s: string) => Math.max(min, fitLine(s, 96, colW + 60));
  const label = (x: number, top: number, f: string | undefined, l: string | undefined, color: string) => f ? (
    <div style={{ position: "absolute", left: x - colW / 2 - 30, width: colW + 60, top, textAlign: "center", background: "rgba(29,36,51,0.82)", borderRadius: 20, padding: "10px 0" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(f), color, WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{f}</div>
      {l && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(l), color: "#fff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{l.toUpperCase()}</div>}
    </div>
  ) : null;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.06 * kProfit})`, transformOrigin: "50% 50%" }}>
        <World kind="office" tint="#1e4a7a" w={w} h={h} t={t} seed="turn-card-profit" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={xBig - colW / 2} y={base - hBig} width={colW} height={hBig} rx={14} fill="#f2b631" stroke={INK} strokeWidth={7} />
          <rect x={xSmall - colW / 2} y={base - hSmall - hop * h * 0.02} width={colW} height={hSmall} rx={14} fill="#3d7bf5" stroke={INK} strokeWidth={7} />
          <g transform={`translate(${xBig},${base - hBig - h * 0.005})`}><Card s={h * 0.1} t={t} /></g>
          <g transform={`translate(${xSmall},${base - hSmall - hop * h * 0.02 + h * 0.02})`}><Jet s={h * 0.09} t={t} /></g>
          {kProfit > 0 && (
            <text x={w * 0.5} y={base - h * 0.04} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130 * (1.6 - 0.6 * kProfit)} fill="#e5484d"
              stroke="#fff" strokeWidth={10} paintOrder="stroke" opacity={clamp(kProfit * 2)}>{">"}</text>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {label(xBig, Math.max(h * 0.14, base - hBig - h * 0.24), P.big, P.bigLabel, "#ffd84a")}
      {label(xSmall, Math.max(h * 0.14, base - hSmall - h * 0.24), P.small, P.smallLabel, "#bfe6ff")}
    </AbsoluteFill>
  );
};

export default Turn;
