/**
 * The payoff: "So he doesn't need a paycheck. The shares grow untaxed, he borrows against them, and
 * their true tax rate was {true_pct}."
 * A night city. Header THEIR TRUE TAX RATE from frame 0. A big ring (a whole pie of new wealth) in
 * the middle. Three steps line up under the header on their words: "paycheck" crosses out a pay slip,
 * "grow" brings SHARES GROW, "borrows" BORROW AGAINST THEM, "true" LITTLE INCOME TAX; on "rate" the
 * ring's tiny red slice lights and the rate slams in huge in its centre.
 *
 * params: { header, rate, steps: [three short lines] }, events: paycheck, grow, borrows, true, rate
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";


const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; rate?: string; steps?: string[]; wealthLabel?: string; taxLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tGrow = at(p, "grow", 1.8), tBor = at(p, "borrows", 3.0), tTrue = at(p, "true", 4.6), tRate = at(p, "rate", 5.0);
  const ks = [sp(tGrow, 10), sp(tBor, 10), sp(tTrue, 10)];
  const kRate = sp(tRate, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const steps = P.steps ?? [];
  const stepSize = Math.min(...steps.map((s) => Math.max(min, fitLine(s.toUpperCase(), 54, box.x1 - box.x0 - 160, { upper: true }))), 54);
  const rate = P.rate ?? "";
  const rateSize = Math.max(min, fitLine(rate, 150, w * 0.42));
  const frac = clamp((parseFloat(rate) || 5) / 100, 0.01, 1);
  const cx = w * 0.5, cy = h * 0.53, r = w * 0.3;
  const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * frac;
  const slice = `M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 0 1 ${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="city" tint="#2fb37a" w={w} h={h} t={t} seed="payoff-night-tax" props={props} horizon={[{ prop: "villa", x: 0.12, size: 0.05 }, { prop: "privatejet", x: 0.86, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <circle cx={cx} cy={cy} r={r} fill="#2fb37a" stroke={INK} strokeWidth={8} opacity={0.85 + 0.15 * ks[0]!} />
          <path d={slice} fill="#e5484d" stroke={INK} strokeWidth={6} transform={`translate(${12 + 12 * kRate},${-12 - 12 * kRate})`} />
          {P.wealthLabel && kRate <= 0 && <text x={cx} y={cy + min * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(P.wealthLabel.toUpperCase(), 64, r * 1.5, { upper: true }))} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{P.wealthLabel.toUpperCase()}</text>}
          {P.taxLabel && <g transform={`translate(${cx + r * 0.55},${cy - r * 1.08})`}>
            <line x1={-r * 0.3} y1={r * 0.12} x2={-r * 0.48} y2={r * 0.2} stroke="#fff" strokeWidth={6} />
            <text textAnchor="start" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(P.taxLabel.toUpperCase(), 52, w * 0.36, { upper: true }))} fill="#ff8a8a" stroke={INK} strokeWidth={6} paintOrder="stroke" x={-r * 0.28} y={r * 0.12}>{P.taxLabel.toUpperCase()}</text>
          </g>}
          {kRate > 0 && rate && (
            <text x={cx} y={cy + rateSize * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={rateSize * (0.6 + 0.4 * kRate)} fill="#fff" stroke={INK} strokeWidth={12} paintOrder="stroke">{rate}</text>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.075, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke fill" }}>{header}</span>
        </div>
      )}
      <div style={{ position: "absolute", left: box.x0 + 40, right: w - box.x1 + 40, top: h * 0.15, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {steps.map((s, i) => (ks[i] ?? 0) > 0 && (
          <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: stepSize, color: INK, background: i === 2 ? "#ffd84a" : "#fff", borderRadius: 999, padding: "4px 26px",
            transform: `scale(${ks[i]})`, border: `5px solid ${INK}` }}>{s.toUpperCase()}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default Payoff;
