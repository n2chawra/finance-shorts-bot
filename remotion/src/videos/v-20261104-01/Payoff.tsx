/**
 * The payoff: "Because a price tag of {fact1} is a plan, not money in the bank."
 * A bright desert, header A PRICE TAG ISN'T CASH from frame 0. The gold pile stands on the left with
 * the reported cost on it, a short stub of the glass city and a crane at the back. On "price" the
 * pile pulses; on "plan" coins fly from it into a blueprint that unrolls in the middle; on "money"
 * the pile turns into a dashed ghost outline; on "bank" an empty bank vault slams in on the right
 * with a NOT IN THE BANK stamp.
 *
 * params: { header, budget, budgetLabel, bankLabel }, events: price, plan, money, bank
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { Box, INK, PALETTE } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Gold = props.goldpile!, Plan = props.blueprint!, Crane = props.crane!, City = props.linecity!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; budget?: string; budgetLabel?: string; bankLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tPrice = at(p, "price", 0.4), tPlan = at(p, "plan", 2.4), tMoney = at(p, "money", 3.0), tBank = at(p, "bank", 3.8);
  const kPrice = sp(tPrice, 9), kPlan = sp(tPlan, 10), kMoney = sp(tMoney, 12), kBank = sp(tBank, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 56) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.6;
  const gx = w * 0.26, px = w * 0.5, vx = w * 0.76;
  const coins = t < tPlan ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tPlan) * 1.2 + i / 5) % 1;
    return <circle key={i} cx={gx + (px - gx) * f} cy={g - h * 0.16 - Math.sin(f * Math.PI) * h * 0.1} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5) * (1 - kMoney)} />;
  });
  const budget = P.budget ?? "";
  const vs = h * 0.2;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * kMoney})`, transformOrigin: "55% 55%" }}>
        <World kind="desert" tint="#ffd34d" w={w} h={h} t={t} seed="payoff-desert-pricetag" props={props} horizon={[{ prop: "camel", x: 0.1, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.42},${g + h * 0.16})`}><City s={h * 0.12} t={t} k={0.02} /></g>
          <g transform={`translate(${w * 0.62},${g + h * 0.16})`}><Crane s={h * 0.2} t={t} /></g>
          <g transform={`translate(${gx},${g}) scale(${1 + 0.1 * kPrice * (1 - clamp((t - tPrice) / 0.6))})`} opacity={1 - 0.75 * kMoney}><Gold s={h * 0.24} t={t} /></g>
          {kMoney > 0 && <rect x={gx - h * 0.14} y={g - h * 0.13} width={h * 0.28} height={h * 0.13} rx={10} fill="none" stroke="#e5484d" strokeWidth={8} strokeDasharray="20 12" opacity={kMoney} />}
          {budget && <text x={gx} y={g - h * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(budget, 72, w * 0.3))} fill="#ffd84a" stroke={INK} strokeWidth={8} paintOrder="stroke">{budget}</text>}
          {P.budgetLabel && <text x={gx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.budgetLabel, w * 0.34)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.budgetLabel.toUpperCase()}</text>}
          {coins}
          {kPlan > 0 && <g transform={`translate(${px},${g - h * 0.02}) scale(${kPlan})`}><Plan s={h * 0.16} t={t} /></g>}
          {kBank > 0 && (
            <g transform={`translate(${vx},${g - (1 - kBank) * h * 0.2})`}>
              <Box x={-vs * 0.5} y={-vs} w={vs} h={vs} fill={PALETTE.grey} s={vs} r={0.06} />
              <circle cx={0} cy={-vs * 0.5} r={vs * 0.3} fill={PALETTE.dark} stroke={INK} strokeWidth={6} />
              <circle cx={0} cy={-vs * 0.5} r={vs * 0.1} fill={PALETTE.grey} />
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>{header}</span>
        </div>
      )}
      {kBank > 0 && P.bankLabel && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.27, textAlign: "center", transform: `rotate(-6deg) scale(${2 - kBank})`, opacity: clamp(kBank * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.bankLabel, w * 0.7, 90), color: "#fff", background: "rgba(229,72,77,0.9)", border: "8px solid #fff", borderRadius: 18, padding: "4px 26px" }}>{P.bankLabel.toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
