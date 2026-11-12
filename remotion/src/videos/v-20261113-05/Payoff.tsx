/**
 * The payoff: "The whole tour sold {show_total} of tickets. Would you have paid for a seat?"
 * A stadium at night. On "whole" the ticket tower grows huge in the middle with Taylor Swift's real
 * head beside it; on "sold" {show_total} slams in at the top with ERAS TOUR TICKETS under it; on
 * "seat" one pink ticket flies out to the front and the question drops in.
 *
 * params: { fig, label, ask }, events: whole, sold, tickets, seat
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { PhotoHead } from "../../studio/photo";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.tickettower!, Ticket = props.ticket!, Stadium = props.stadium!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fig?: string; label?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tW = at(p, "whole", 0.2), tS = at(p, "sold", 0.8), tE = at(p, "seat", 3.0);
  const kW = sp(tW, 13), kS = sp(tS, 9), kE = sp(tE, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const g = h * 0.67;
  const fSize = Math.max(min, fitLine(P.fig ?? "", 220, maxW * 0.8));
  const labSize = Math.max(min, fitLine((P.label ?? "").toUpperCase(), 56, maxW, { upper: true }));
  const askSize = Math.max(min, fitLine((P.ask ?? "").toUpperCase(), 72, maxW, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="night" tint="#2a1846" w={w} h={h} t={t} seed="payoff-swift-tower" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${g - h * 0.08}) scale(1.2)`} opacity={0.6}><Stadium s={h * 0.22} t={t} /></g>
          <g transform={`translate(${w * 0.58},${g})`}><Tower s={h * (0.2 + 0.06 * clamp(kW))} t={t} k={0.4 + 0.6 * clamp(kW)} /></g>
          <g transform={`translate(${w * 0.24},${g - h * 0.12})`}><PhotoHead name="swift" r={h * 0.05} /></g>
          {kE > 0 && <g transform={`translate(${w * 0.3 + (1 - kE) * w * 0.25},${g + h * 0.06 - (1 - kE) * h * 0.2}) scale(${0.6 + 0.4 * kE})`}><Ticket s={h * 0.12} t={t} /></g>}
        </svg>
      </AbsoluteFill>
      {kS > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${1.5 - 0.5 * kS})`, opacity: clamp(kS * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.fig}</div>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.label ?? "").toUpperCase()}</span></div>
        </div>
      )}
      {kE > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.255 - (1 - kE) * h * 0.04, textAlign: "center", opacity: clamp(kE * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: askSize, color: INK, background: "#ffd84a", padding: "8px 22px", borderRadius: 14, border: `6px solid ${INK}` }}>{(P.ask ?? "").toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
