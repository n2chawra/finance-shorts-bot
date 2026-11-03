/**
 * The turn: "The twist? Give the shares themselves, and the US charges no capital gains tax on them."
 * A night office, header GIVE THE SHARES from frame 0. A share stack on the left, a tax envelope up
 * in the middle, a gift box on the right. On "twist" the header pops; on "shares" certificates fly
 * from the stack straight into the gift box, under the envelope; on "US" a red cross slams over the
 * envelope with NO GAINS TAX; on "gains" the gift box grows with FULL GIFT and a charity jar fills.
 *
 * params: { header, taxLabel, giftLabel, stackLabel }, events: twist, shares, us, gains
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

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; taxLabel?: string; giftLabel?: string; stackLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.4), tShares = at(p, "shares", 1.4), tUs = at(p, "us", 2.6), tGains = at(p, "gains", 3.6);
  const kTwist = sp(tTwist, 8), kShares = sp(tShares, 12), kUs = sp(tUs, 8), kGains = sp(tGains, 9);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.64, sx = w * 0.22, gx = w * 0.78, ex = w * 0.5, ey = h * 0.36;
  const fly = t < tShares ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tShares) * 1.1 + i / 5) % 1;
    return <rect key={i} x={sx + (gx - sx) * f - h * 0.035} y={g - h * 0.22 + Math.sin(f * Math.PI) * h * 0.06} width={h * 0.07} height={h * 0.025} rx={5} fill={PALETTE.cream} stroke={PALETTE.red} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.03 * kGains})`, transformOrigin: "50% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}t`} />
        <AbsoluteFill style={{ background: "rgba(5,10,35,0.5)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${sx},${g})`}><Stack s={h * 0.28} t={t} state="tall" /></g>
          {P.stackLabel && <text x={sx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.stackLabel, w * 0.3)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.stackLabel.toUpperCase()}</text>}
          <g transform={`translate(${ex},${ey})`} opacity={1 - 0.4 * kUs}><Tax s={h * 0.16} t={t} /></g>
          {kUs > 0 && <g transform={`translate(${ex},${ey - h * 0.06}) scale(${2 - kUs})`} opacity={clamp(kUs * 2)}>
            <line x1={-h * 0.08} y1={-h * 0.07} x2={h * 0.08} y2={h * 0.07} stroke="#e5484d" strokeWidth={20} strokeLinecap="round" />
            <line x1={h * 0.08} y1={-h * 0.07} x2={-h * 0.08} y2={h * 0.07} stroke="#e5484d" strokeWidth={20} strokeLinecap="round" />
          </g>}
          {kUs > 0 && P.taxLabel && <text x={ex} y={ey - h * 0.16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.taxLabel, w * 0.5, 60)} fill="#ff8a8a" stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={clamp(kUs * 2)}>{P.taxLabel.toUpperCase()}</text>}
          {fly}
          <g transform={`translate(${gx},${g}) scale(${0.85 + 0.3 * kGains})`}><Gift s={h * 0.18} t={t} k={1} /></g>
          {kGains > 0 && P.giftLabel && <text x={gx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.giftLabel, w * 0.3)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={clamp(kGains * 2)}>{P.giftLabel.toUpperCase()}</text>}
          <g transform={`translate(${w * 0.56},${g + h * 0.08})`} opacity={clamp(kGains * 2)}><Jar s={h * 0.1} t={t} k={0.2 + 0.6 * kGains} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#2fb37a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: `rotate(-2deg) scale(${1 + 0.1 * kTwist * (1 - clamp((t - tTwist) / 0.4))})` }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
