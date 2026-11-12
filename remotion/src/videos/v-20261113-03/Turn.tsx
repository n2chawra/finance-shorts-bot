/**
 * The turn: "And the ads everyone hates? Just over {ads_total}. Tiny next to the subscriptions."
 * A red studio, header WHERE NETFLIX MONEY COMES FROM. On "ads" an advert billboard pops up on the
 * left; on "Just" a thin red bar grows under it with {ads_total}; on "Tiny" a huge bar for everything
 * Netflix brought in rises on the right with {rev_total}; on "subscriptions" a subscription card
 * stamps onto the big bar.
 *
 * params: { header, adsLabel, adsFig, adsV, revLabel, revFig, revV }, events: ads, hates, just, tiny, subscriptions
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Ad = props.adboard!, Card = props.subcard!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; adsLabel?: string; adsFig?: string; adsV?: number; revLabel?: string; revFig?: string; revV?: number };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 130, mass: 0.9 } }));
  const tA = at(p, "ads", 0.3), tJ = at(p, "just", 1.3), tT = at(p, "tiny", 2.4), tS = at(p, "subscriptions", 3.2);
  const kA = sp(tA, 9), kJ = sp(tJ, 14), kT = sp(tT, 14), kS = sp(tS, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 80;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, maxW, { upper: true }));
  const base = h * 0.62, full = h * 0.4, colW = w * 0.34;
  const revV = P.revV ?? 1, adsV = P.adsV ?? 0;
  const xA = w * 0.28, xR = w * 0.7;
  const adsH = Math.max(h * 0.012, full * (adsV / revV)) * kJ, revH = full * kT;
  const fig = (s: string) => Math.max(min, fitLine(s, 92, colW * 1.2));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 50, colW * 1.2, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.01 * t + 0.03 * kS})`, transformOrigin: "50% 55%" }}>
        <World kind="studio" tint="#3a0d12" w={w} h={h} t={t} seed="turn-netflix-ads" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${xA},${base - h * 0.05 - adsH}) scale(${0.85 + 0.15 * kA})`}><Ad s={h * 0.22} t={t} /></g>
          <rect x={xA - colW / 2} y={base - adsH} width={colW} height={adsH} rx={8} fill="#ff5a5f" stroke={INK} strokeWidth={5} />
          <rect x={xR - colW / 2} y={base - full} width={colW} height={full} rx={16} fill="rgba(127,207,143,0.18)" stroke="#7fcf8f" strokeWidth={6} opacity={0.7 * (1 - kT)} />
          <rect x={xR - colW / 2} y={base - revH} width={colW} height={revH} rx={16} fill="#7fcf8f" stroke={INK} strokeWidth={6} />
          {kS > 0 && <g transform={`translate(${xR},${base - revH * 0.45}) scale(${kS}) rotate(-8)`}><Card s={h * 0.13} t={t} /></g>}
          <rect x={w * 0.06} y={base} width={w * 0.88} height={10} rx={5} fill={INK} />
        </svg>
        {(
          <div style={{ position: "absolute", left: xA - colW * 0.6, width: colW * 1.2, top: base + h * 0.015, textAlign: "center", transform: `scale(${1 + 0.2 * kJ * Math.max(0, 1 - (t - tJ) * 2)})` }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.adsFig ?? ""), color: "#ff9a9d", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.adsFig}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.adsLabel ?? ""), color: "#fff", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{(P.adsLabel ?? "").toUpperCase()}</div>
          </div>
        )}
        {(
          <div style={{ position: "absolute", left: xR - colW * 0.6, width: colW * 1.2, top: base + h * 0.015, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.revFig ?? ""), color: "#ffd84a", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill", lineHeight: 1, opacity: clamp(kT * 2) }}>{P.revFig}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.revLabel ?? ""), color: "#fff", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill", opacity: clamp(kT * 2) }}>{(P.revLabel ?? "").toUpperCase()}</div>
          </div>
        )}
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#e50914", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
