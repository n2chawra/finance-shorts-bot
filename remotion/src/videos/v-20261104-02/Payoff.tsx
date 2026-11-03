/**
 * The payoff: "That's the catch: selling first shrinks the gift by {g_total}."
 * A night office, header IT SHRINKS BEFORE IT'S GIVEN from frame 0. A tall stack of shares stands on
 * the left, a tax envelope in the middle, a gift box on the right. On "billions" the stack glows; on
 * "shrink" certificates fly into the tax envelope with the tax figure and the stack shrinks; on
 * "gives" the gift box pops up smaller with LEFT TO GIVE; on "why" the camera pulls back and the
 * gift box pulses.
 *
 * params: { header, tax, taxLabel, giftLabel }, events: catch, selling, shrinks, gift
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Stack = props.sharestack!, Tax = props.taxenvelope!, Gift = props.giftbox!, Jar = props.charityjar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; tax?: string; taxLabel?: string; giftLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tBil = at(p, "selling", 0.6), tShr = at(p, "shrinks", 1.2), tGive = at(p, "gift", 1.8), tWhy = at(p, "gift", 1.8) + 1.2;
  const kBil = sp(tBil, 9), kShr = sp(tShr, 12), kGive = sp(tGive, 9), kWhy = sp(tWhy, 12);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 72, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 50) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.66, sx = w * 0.22, tx = w * 0.52, gx = w * 0.8;
  const fly = t < tShr ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tShr) * 1.2 + i / 5) % 1;
    return <rect key={i} x={sx + (tx - sx) * f - h * 0.035} y={g - h * 0.3 - Math.sin(f * Math.PI) * h * 0.08} width={h * 0.07} height={h * 0.025} rx={5} fill={PALETTE.cream} stroke={PALETTE.red} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  const tax = P.tax ?? "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.06 - 0.06 * kWhy})`, transformOrigin: "50% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "rgba(10,10,40,0.45)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${sx},${g}) scale(${1 - 0.3 * kShr})`}>
            {kBil > 0 && <ellipse cx={0} cy={-h * 0.2} rx={h * 0.16} ry={h * 0.24} fill="#ffd84a" opacity={0.25 * kBil * (1 - kShr)} />}
            <Stack s={h * 0.3} t={t} state="tall" />
          </g>
          {fly}
          <g transform={`translate(${tx},${g}) scale(${0.9 + 0.15 * kShr})`}><Tax s={h * 0.17} t={t} /></g>
          {kShr > 0 && tax && <text x={tx} y={g - h * 0.24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(tax, 64, w * 0.3))} fill="#ff8a8a" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kShr * 2)}>{tax}</text>}
          {P.taxLabel && <text x={tx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.taxLabel, w * 0.26)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.taxLabel.toUpperCase()}</text>}
          <g transform={`translate(${gx},${g})`}>
            <g transform={`scale(${0.6 + 0.25 * kGive + 0.05 * kWhy * Math.abs(Math.sin(t * 5))})`}><Gift s={h * 0.2} t={t} k={1} /></g>
            {kGive > 0 && P.giftLabel && <text y={min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.giftLabel, w * 0.3)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={clamp(kGive * 2)}>{P.giftLabel.toUpperCase()}</text>}
          </g>
          <g transform={`translate(${w * 0.66},${g + h * 0.12})`} opacity={kWhy}><Jar s={h * 0.09} t={t} k={0.3} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.45}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
