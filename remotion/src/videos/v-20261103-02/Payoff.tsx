/**
 * The payoff: "That's why he never sells. He keeps the tree and eats the fruit, now about
 * {d22_per_part} every single day."
 * A warm field. A header KEEP THE TREE from frame 0. The dividend tree stands big in the middle; on
 * "sells" a small SELL button fades out with a cross; on "tree" the tree grows and fills with fruit;
 * on "fruit" fruit starts dropping into a basket and the per-day figure slams in under the header;
 * on "day" the figure pulses and a NEVER SOLD stamp lands on the trunk.
 *
 * params: { header, perDay, dayLabel, treeLabel }, events: sells, tree, fruit, single, day
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tree = props.fruittree!, Basket = props.fruitbasket!, Sell = props.sellbutton!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; perDay?: string; dayLabel?: string; treeLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tSell = at(p, "sells", 0.8), tTree = at(p, "tree", 2.0), tFruit = at(p, "fruit", 3.0), tDay = at(p, "day", 5.6);
  const kSell = sp(tSell, 9), kTree = sp(tTree, 12), kFruit = sp(tFruit, 8), kDay = sp(tDay, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const fig = P.perDay ?? "";
  const figSize = Math.max(min, fitLine(fig, 150, box.x1 - box.x0 - 80));
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 54, max, { upper: true }));
  const g = h * 0.66, tx = w * 0.45, ts = h * (0.32 + 0.05 * kTree);
  const bx = w * 0.78;
  const falls = t < tFruit ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tFruit) * 0.9 + i / 5) % 1;
    const sx = tx + (i - 2) * w * 0.05, sy = g - ts * 0.7;
    return <circle key={i} cx={sx + (bx - sx) * f} cy={sy + (g - h * 0.06 - sy) * f * f} r={h * 0.016} fill="#e5484d" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 6)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="field" tint="#f2b631" w={w} h={h} t={t} seed="payoff-field-coke" props={props} horizon={[{ prop: "colafactory", x: 0.9, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${tx},${g})`}><Tree s={ts} t={t} k={0.3 + 0.7 * kTree} /></g>
          <g transform={`translate(${bx},${g})`}><Basket s={h * 0.1} t={t} /></g>
          {falls}
          <g transform={`translate(${w * 0.15},${g})`} opacity={1 - kTree}>
            <Sell s={h * 0.09} t={t} />
            {kSell > 0 && <g opacity={clamp(kSell * 2)}>
              <line x1={-h * 0.05} y1={-h * 0.08} x2={h * 0.05} y2={0} stroke="#e5484d" strokeWidth={14} strokeLinecap="round" />
              <line x1={h * 0.05} y1={-h * 0.08} x2={-h * 0.05} y2={0} stroke="#e5484d" strokeWidth={14} strokeLinecap="round" />
            </g>}
          </g>
          {kDay > 0 && P.treeLabel && (
            <g transform={`translate(${tx},${g - ts * 0.25}) rotate(-8) scale(${2 - kDay})`} opacity={clamp(kDay * 2)}>
              <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.treeLabel, w * 0.4)} fill="#fff" stroke="#c0392b" strokeWidth={8} paintOrder="stroke">{P.treeLabel.toUpperCase()}</text>
            </g>
          )}
          {kFruit > 0 && fig && (
            <g transform={`translate(${w * 0.5},${h * 0.23}) scale(${(0.6 + 0.4 * kFruit) * (1 + 0.06 * kDay * Math.abs(Math.sin(t * 5)))})`}>
              <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={figSize} fill="#ffd84a" stroke={INK} strokeWidth={12} paintOrder="stroke">{fig}</text>
              {P.dayLabel && <text y={min * 1.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.dayLabel, w * 0.6)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.dayLabel.toUpperCase()}</text>}
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.075, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
