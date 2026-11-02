/**
 * The payoff: "Every single one. Google isn't buying a setting. It's renting your habit, at
 * {minute_per_part} every minute."
 * A night city. In the middle the habit loop (a phone in a spinning loop arrow) grows big. On
 * "single" the search box pulses; on "buying" a SETTING label is crossed out; on "renting" a RENT
 * tag swings onto the habit and coins start to orbit it; on "habit" the loop speeds up; on "minute"
 * a clock above spins a full lap and the per-minute figure slams in under it.
 *
 * params: { perMinute, minuteLabel, habitLabel }, events: single, buying, renting, habit, minute
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Habit = props.habit!, Clock = props.clock!, Search = props.searchbar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { perMinute?: string; minuteLabel?: string; habitLabel?: string; header?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tOne = at(p, "single", 0.4), tBuy = at(p, "buying", 1.4), tRent = at(p, "renting", 2.6), tHabit = at(p, "habit", 3.2), tMin = at(p, "minute", 4.8), tFig = at(p, "rent", 4.0);
  const kOne = sp(tOne, 9), kCross = clamp((t - tBuy - 0.4) / 0.4), kRent = sp(tRent, 9), kHabit = sp(tHabit, 10), kMin = sp(tMin, 8), kFig = sp(tFig, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const g = h * 0.66;
  const lab = (s: string, max: number, big = 56) => Math.max(min, fitLine(s.toUpperCase(), big, max, { upper: true }));
  const fig = P.perMinute ?? "";
  const figSize = Math.max(min, fitLine(fig, 150, box.x1 - box.x0 - 80));
  const hx = w * 0.5, hs = h * (0.3 + 0.05 * kHabit);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const orbit = t < tRent ? [] : Array.from({ length: 6 }, (_, i) => {
    const a = (t - tRent) * (1.5 + kHabit) + (i * Math.PI) / 3;
    return <circle key={i} cx={hx + Math.cos(a) * hs * 0.62} cy={g - hs * 0.5 + Math.sin(a) * hs * 0.62} r={h * 0.016} fill="#f2b631" stroke={INK} strokeWidth={4} />;
  });
  const setting = "SETTING";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="night" tint="#3d7bf5" w={w} h={h} t={t} seed="payoff-city-g" props={props} horizon={[{ prop: "gvault", x: 0.12, size: 0.06 }, { prop: "applecrate", x: 0.88, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${h * 0.32}) scale(${0.7 + 0.12 * kOne * Math.abs(Math.sin(t * 4))})`} opacity={1 - kFig}><Search s={h * 0.2} t={t} state="typing" /></g>
          {t > tBuy && (
            <g opacity={1 - kFig}>
              <text x={w * 0.5} y={h * 0.21} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(setting, w * 0.5, 64)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{setting}</text>
              <line x1={w * 0.3} x2={w * 0.3 + w * 0.4 * kCross} y1={h * 0.2} y2={h * 0.2 - h * 0.02 * kCross} stroke="#e5484d" strokeWidth={14} strokeLinecap="round" />
            </g>
          )}
          <g transform={`translate(${hx},${g})`}><Habit s={hs} t={t * (1 + 2 * kHabit)} /></g>
          {orbit}
          {P.habitLabel && kRent > 0 && (
            <g transform={`translate(${hx},${g + hs * 0.2 + min * 1.2}) scale(${kRent})`}>
              <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.habitLabel, w * 0.6)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.habitLabel.toUpperCase()}</text>
            </g>
          )}
          {kMin > 0 && (
            <g transform={`translate(${w * 0.82},${h * 0.3}) scale(${kMin})`}><Clock s={h * 0.14} t={(t - tMin) * 6} /></g>
          )}
          {kFig > 0 && fig && (
            <g transform={`translate(${w * 0.5},${h * 0.27}) scale(${0.6 + 0.4 * kFig + 0.08 * kMin})`}>
              <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={figSize} fill="#ffd84a" stroke={INK} strokeWidth={12} paintOrder="stroke">{fig}</text>
              {P.minuteLabel && <text y={min * 1.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.minuteLabel, w * 0.6)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.minuteLabel.toUpperCase()}</text>}
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.075, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#7cf0ff", background: "rgba(10,12,30,0.8)", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, borderRadius: hSize * 0.3, border: "4px solid #7cf0ff" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
