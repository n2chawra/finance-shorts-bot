/**
 * The payoff: "After a whole year of spending, he ends up {gap_diff} richer."
 * Opens close on Sharma beside the money pile on a night skyline. On "whole" a DECEMBER calendar chip
 * flips in; on "spending" a sports car, a jet and bags line up in front of the pile; on "ends" the pile
 * climbs taller and a gold crown drops on it; on "richer" the gap slams in huge with STILL RICHER and
 * the camera pulls wide.
 *
 * params: { diff, diffLabel, month }, events: whole, spending, ends, richer
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pile = props.megapile!, Crown = props.dollarcrown!, Car = props.sportscar!, Jet = props.privatejet!, Bag = props.shopbag!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { diff?: string; diffLabel?: string; month?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tWhole = at(p, "whole", 0.3), tSpend = at(p, "spending", 1.0), tEnds = at(p, "ends", 1.6), tRich = at(p, "richer", 2.6);
  const kWhole = sp(tWhole, 10), kSpend = sp(tSpend, 12), kEnds = sp(tEnds, 12), kRich = sp(tRich, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const lab = (s: string, max: number, base = 54) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, px = w * 0.6;
  const k = 0.55 + 0.45 * kEnds;
  const rows = Math.max(2, Math.round(3 + 7 * k));
  const zoom = 1.16 - 0.16 * kRich;
  const diff = P.diff ?? "";
  const month = (P.month ?? "").toUpperCase();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "55% 62%" }}>
        <World kind="city" tint="#3a2a6e" w={w} h={h} t={t} seed="payoff-city-richer" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${px},${g})`}><Pile s={h * 0.28} t={t} k={k} /></g>
          {kEnds > 0 && <g transform={`translate(${px},${g - h * 0.28 * 0.09 * rows - (1 - kEnds) * h * 0.2})`} opacity={clamp(kEnds * 2)}><Crown s={h * 0.08} t={t} /></g>}
          {[{ C: Car, x: 0.42, s: 0.07 }, { C: Jet, x: 0.62, s: 0.075 }, { C: Bag, x: 0.82, s: 0.06 }].map(({ C, x, s }, i) => {
            const kk = sp(tSpend + i * 0.12, 12);
            return kk > 0 && <g key={i} transform={`translate(${w * x + (1 - kk) * w * 0.5},${g + h * 0.06})`} opacity={clamp(kk * 2)}><C s={h * s} t={t} /></g>;
          })}
          {kWhole > 0 && month && (
            <g transform={`translate(${w * 0.7},${g - h * 0.32}) rotate(${(1 - kWhole) * 60})`} opacity={clamp(kWhole * 2)}>
              <rect x={-w * 0.13} y={-min * 1.1} width={w * 0.26} height={min * 1.7} rx={14} fill="#fff" stroke={INK} strokeWidth={6} />
              <rect x={-w * 0.13} y={-min * 1.1} width={w * 0.26} height={min * 0.4} rx={6} fill="#d63031" />
              <text y={min * 0.45} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(month, w * 0.22, 50)} fill={INK}>{month}</text>
            </g>
          )}
          <Actor p={p} spec={{ who: "sharma", x: 0.2, scale: 0.85, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "richer", pose: "thumbsUp", expression: "proud" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {kRich > 0 && diff && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${1.7 - 0.7 * kRich})`, opacity: clamp(kRich * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(diff, 170, w * 0.62)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{diff}</div>
          {P.diffLabel && <div style={{ display: "inline-block", marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.diffLabel, w * 0.5, 58), color: "#1d2433", background: "#fff", padding: "6px 26px", borderRadius: 14 }}>{P.diffLabel.toUpperCase()}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
