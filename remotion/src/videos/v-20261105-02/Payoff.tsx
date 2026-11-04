/**
 * The payoff: "Its whole profit was {fact2}. So the fees equal {share_pct} of it."
 * A vault-dark frame, header THE CARD IS THE BUSINESS from frame 0. Two tall bars side by side: on
 * "whole" the profit bar rises with a money sack on top (WHOLE PROFIT, its figure); on "fees" the card
 * fees bar rises beside it with a pile of member cards on top (CARD FEES, its figure); on "equal" a
 * bracket joins them and the share slams in huge.
 *
 * params: { header, profit, fees, pct, profitLabel, feesLabel }, events: whole, profit, fees, equal
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Sack = props.feesack!, Cards = props.cardpile!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; profit?: string; fees?: string; pct?: string; profitLabel?: string; feesLabel?: string; share?: number };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 120, mass: 0.9 } }));
  const tWhole = at(p, "whole", 0.3), tFees = at(p, "fees", 2.4), tEq = at(p, "equal", 3.0);
  const kWhole = sp(tWhole), kFees = sp(tFees), kEq = sp(tEq, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 48) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const base = h * 0.66, full = h * 0.4, bw = w * 0.3, lx = w * 0.3, rx = w * 0.7;
  const share = clamp((parseFloat((P.pct ?? "").replace(/[^0-9.]/g, "")) || 0) / 100);
  const lh = full * kWhole, rh = full * share * kFees;
  const text = (x: number, y: number, s: string | undefined, max: number, color = "#fff", k = 1, b = 48) => s && (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(s, max, b)} fill={color} stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={clamp(k * 2)}>{s.toUpperCase()}</text>
  );
  return (
    <AbsoluteFill style={{ background: "#141a2e", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.03 * kEq})`, transformOrigin: "50% 50%" }}>
        <World kind="city" tint="#2a2f6e" w={w} h={h} t={t} seed="payoff-city-costco" props={props} horizon={[{ prop: "warehouse", x: 0.5, size: 0.06 }]} />
        <AbsoluteFill style={{ background: "rgba(12,16,40,0.35)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={w * 0.08} y={base} width={w * 0.84} height={10} fill="#3b4566" />
          {[lx, rx].map((x, i) => <rect key={i} x={x - bw / 2} y={base - full} width={bw} height={full} rx={14} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeDasharray="22 14" />)}
          {kWhole <= 0.05 && <g transform={`translate(${lx},${base})`}><Sack s={h * 0.1} t={t} /></g>}
          {kFees <= 0.05 && <g transform={`translate(${rx},${base})`}><Cards s={h * 0.09} t={t} /></g>}
          <rect x={lx - bw / 2} y={base - lh} width={bw} height={lh} rx={14} fill={PALETTE.green} stroke={INK} strokeWidth={6} />
          <rect x={rx - bw / 2} y={base - rh} width={bw} height={rh} rx={14} fill={PALETTE.gold} stroke={INK} strokeWidth={6} />
          {kWhole > 0.05 && <g transform={`translate(${lx},${base - lh})`} opacity={clamp(kWhole * 2)}><Sack s={h * 0.1} t={t} /></g>}
          {kFees > 0.05 && <g transform={`translate(${rx},${base - rh})`} opacity={clamp(kFees * 2)}><Cards s={h * 0.09} t={t} /></g>}
          {text(lx, base + min * 1.3, P.profitLabel, w * 0.36, "#fff", 1)}
          {text(rx, base + min * 1.3, P.feesLabel, w * 0.36, "#ffd84a", 1)}
          {kWhole > 0 && text(lx, base - lh / 2 + min * 0.4, P.profit, bw * 0.95, "#fff", kWhole, 56)}
          {kFees > 0 && text(rx, base - rh / 2 + min * 0.4, P.fees, bw * 0.95, "#fff", kFees, 56)}
          {kEq > 0 && <path d={`M${rx + bw / 2 + 14},${base - rh} l${w * 0.03},0 l0,${rh} l${-w * 0.03},0`} stroke="#ffd84a" strokeWidth={8} fill="none" opacity={clamp(kEq * 2)} />}
        </svg>
      </AbsoluteFill>
      {kEq > 0 && P.pct && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.15, textAlign: "center", transform: `scale(${1.6 - 0.6 * kEq})`, opacity: clamp(kEq * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.pct, 150, w * 0.5)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.pct}</span>
        </div>
      )}
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
