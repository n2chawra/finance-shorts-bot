/**
 * The payoff: "Your bonus bought a TV. His bought a paycheck."
 * A split frame, header SAME BONUS from frame 0. Left half dusk-blue: YOUR BONUS over a fading TV; on
 * "TV" the screen cracks and a red WORTH LESS tag swings on. Right half gold: HIS BONUS; on "His" a
 * money tree rises; on "paycheck" a pay cheque pops out of it with the yearly figure and EVERY YEAR,
 * and the right half glows.
 *
 * params: { header, youLabel, hisLabel, tvTag, pay, payTag }, events: your, tv, his, paycheck
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import props from "./props";

const Tv = props.flattv!, Tree = props.cashtree!, Check = props.paycheck!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; youLabel?: string; hisLabel?: string; tvTag?: string; pay?: string; payTag?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tYour = at(p, "your", 0.1), tTv = at(p, "tv", 0.9), tHis = at(p, "his", 1.4), tPay = at(p, "paycheck", 2.2);
  const kYour = sp(tYour, 10), kTv = sp(tTv, 9), kHis = sp(tHis, 10), kPay = sp(tPay, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 50) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.6, lx = w * 0.27, rx = w * 0.72;
  const pay = P.pay ?? "";
  const text = (x: number, y: number, s: string | undefined, max: number, color = "#fff", k = 1, base = 50) => s && (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(s, max, base)} fill={color} stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={clamp(k * 2)}>{s.toUpperCase()}</text>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.03 * kPay})`, transformOrigin: "70% 50%" }}>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={0} y={0} width={w / 2} height={h} fill="#2c3550" />
          <rect x={w / 2} y={0} width={w / 2} height={h} fill={kPay > 0 ? "#f2b631" : "#c9962a"} />
          {kPay > 0 && <circle cx={rx} cy={g - h * 0.16} r={h * 0.22 * kPay} fill="#fff3b0" opacity={0.45} />}
          <rect x={w / 2 - 6} y={0} width={12} height={h} fill={INK} />
          {text(lx, h * 0.28, P.youLabel, w * 0.42, "#fff", 0.5 + kYour)}
          {text(rx, h * 0.28, P.hisLabel, w * 0.42, "#fff", kHis)}
          <g transform={`translate(${lx},${g}) scale(${1 + 0.1 * kYour - 0.1 * kTv})`} opacity={1 - 0.3 * kTv}><Tv s={h * 0.2} t={t} state={kTv > 0.3 ? "old" : undefined} /></g>
          {kTv > 0 && P.tvTag && <g transform={`translate(${lx},${g + h * 0.06}) rotate(${-6 + Math.sin(t * 3) * 3})`} opacity={clamp(kTv * 2)}>
            <rect x={-w * 0.18} y={-min} width={w * 0.36} height={min * 1.5} rx={12} fill={PALETTE.red} stroke={INK} strokeWidth={5} />
            <text y={min * 0.1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.tvTag, w * 0.32, 48)} fill="#fff">{P.tvTag.toUpperCase()}</text>
          </g>}
          <g transform={`translate(${rx},${g + (1 - kHis) * h * 0.3})`} opacity={clamp(kHis * 2)}><Tree s={h * 0.22} t={t} k={1} /></g>
          {kPay > 0 && <g transform={`translate(${rx},${g - h * 0.24 - h * 0.04 * kPay}) scale(${0.3 + 0.7 * kPay})`}><Check s={h * 0.16} t={t} /></g>}
          {kPay > 0 && pay && text(rx, g - h * 0.36, pay, w * 0.42, "#fff", kPay, 90)}
          {kPay > 0 && text(rx, g + h * 0.07, P.payTag, w * 0.4, "#fff", kPay)}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
