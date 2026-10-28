/**
 * The payoff: "So Rohan makes one rule. The card is cash: he pays it off in full, every single
 * month. That way the miles are his, and the interest is nobody's."
 * A sunny field: Rohan's airline card hovers big in the middle. On "cash" it flips into a stack
 * of notes; on "full" a green PAID IN FULL stamp lands; on "month" a strip of twelve little ticks
 * runs along the top; on "miles" winged coins flutter down to Rohan; on "interest" a red interest
 * cloud rolls in and is struck through.
 *
 * params: { stamp: "Paid in full", cloud: "Interest" }
 * events: rule, cash, full, month, miles, interest
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Card = props.wingcard!, Coin = props.milescoin!, Jar = props.savejar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { stamp?: string; cloud?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tRule = at(p, "rule", 0.6), tCash = at(p, "cash", 1.6), tFull = at(p, "full", 2.8), tMonth = at(p, "month", 3.8), tMiles = at(p, "miles", 4.8), tInt = at(p, "interest", 5.8);
  const kRule = sp(tRule), flip = clamp((t - tCash) / 0.5), kStamp = sp(tFull, 9), kCloud = sp(tInt, 13), kStrike = clamp((t - tInt - 0.5) / 0.4);
  const cx = w * 0.55, cy = h * 0.5;
  const ticks = Array.from({ length: 12 }, (_, i) => clamp((t - tMonth) * 6 - i));
  const coins = t > tMiles ? [0, 1, 2, 3].map((i) => {
    const d = clamp((t - tMiles - i * 0.15) / 1.0);
    return <g key={i} transform={`translate(${w * (0.4 - 0.2 * d + i * 0.03)},${h * (0.2 + 0.4 * d)})`}><Coin s={h * 0.07} t={t + i} /></g>;
  }) : null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${1.06 - 0.04 * clamp(t / 6)})` }}>
      <World kind="field" tint={kStamp > 0.5 ? "green" : undefined} w={w} h={h} t={t} seed="payoff-field" props={props} horizon={[{ prop: "jet", x: 0.86, size: 0.06 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the card, flipping into a stack of cash on "cash" */}
        <g transform={`translate(${cx},${cy + h * 0.12}) scale(${(1 - flip * 2 > 0 ? 1 - flip * 2 : flip * 2 - 1) * (0.8 + 0.2 * kRule)},${0.8 + 0.2 * kRule})`}>
          {flip < 0.5 ? <Card s={h * 0.3} t={t} state="glow" /> : (
            <g>
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${Math.sin(i * 2) * h * 0.01},${-i * h * 0.04})`}>
                  <rect x={-h * 0.16} y={-h * 0.04} width={h * 0.32} height={h * 0.035} rx={6} fill="#8fd18a" stroke="#1d2433" strokeWidth={4} />
                  <circle cx={0} cy={-h * 0.022} r={h * 0.01} fill="#2f7d4a" />
                </g>
              ))}
            </g>
          )}
        </g>
        <g transform={`translate(${w * 0.82},${h * 0.86})`}><Jar s={h * 0.24} t={t} k={0.2 + 0.6 * clamp((t - tMiles) / 1.5)} /></g>
        {ticks.map((k, i) => k > 0 && (
          <g key={i} transform={`translate(${w * (0.3 + i * 0.04)},${h * 0.2}) scale(${k})`}>
            <circle r={h * 0.016} fill="#2fb37a" stroke="#1d2433" strokeWidth={3} />
            <path d={`M${-h * 0.007},0 l${h * 0.005},${h * 0.006} l${h * 0.009},${-h * 0.011}`} fill="none" stroke="#fff" strokeWidth={3} />
          </g>
        ))}
        {coins}
        {kCloud > 0 && (
          <g transform={`translate(${w * 0.62},${h * (0.06 + 0.12 * kCloud)})`} opacity={1 - 0.5 * kStrike}>
            <ellipse cx={0} cy={0} rx={w * 0.09} ry={h * 0.07} fill="#e5484d" stroke="#1d2433" strokeWidth={5} />
            <ellipse cx={-w * 0.06} cy={h * 0.02} rx={w * 0.05} ry={h * 0.05} fill="#e5484d" stroke="#1d2433" strokeWidth={5} />
            <ellipse cx={w * 0.06} cy={h * 0.02} rx={w * 0.05} ry={h * 0.05} fill="#e5484d" stroke="#1d2433" strokeWidth={5} />
            {kStrike > 0 && <line x1={-w * 0.12 * kStrike} y1={h * 0.08 * kStrike} x2={w * 0.12 * kStrike} y2={-h * 0.08 * kStrike} stroke="#1d2433" strokeWidth={14} strokeLinecap="round" />}
          </g>
        )}
        <Actor p={p} spec={{ who: "rohan", x: 0.18, scale: 1.2, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "rule", pose: "pointUp", expression: "proud" }, { at: "full", pose: "thumbsUp", expression: "happy" }, { at: "miles", pose: "celebrate", expression: "laugh" }, { at: "interest", pose: "hips", expression: "smirk" }] }} ground={h * 0.98} index={0} />
      </svg>
      {P.cloud && kCloud > 0 && (
        <div style={{ position: "absolute", left: w * 0.62, top: h * (0.03 + 0.12 * kCloud), transform: "translate(-50%,0)", fontFamily: FONT, fontWeight: 900, fontSize: 48, color: "#fff", whiteSpace: "nowrap", opacity: 1 - 0.5 * kStrike }}>{P.cloud}</div>
      )}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.55, top: h * 0.56, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", background: "#1f8f55", padding: "8px 30px", whiteSpace: "nowrap",
            borderRadius: 24, border: "8px solid #fff", textTransform: "uppercase", boxShadow: "0 14px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
