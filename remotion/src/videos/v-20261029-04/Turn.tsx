/**
 * The turn: "Nobody earned more. Only the order changed. That's {gap_diff}."
 * Two identical pay stubs side by side in an office. On "nobody" an equals sign drops between
 * them; on "order" the two lines under each stub swap places (save on top on the right, last on the
 * left); on "that's" the small oak on the left and the big oak on the right shoot up and the gap
 * between them lands on a gold plate.
 *
 * params: { gap: "{gap_diff}" }, events: nobody, order, changed, that's
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Stub = props.paystub!, Oak = props.oak!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { gap?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tNobody = at(p, "nobody", 0.2), tOrder = at(p, "order", 1.2), tThat = at(p, "that's", 2.4);
  const kEq = sp(tNobody, 9), kSwap = clamp((t - tOrder) / 0.6), kGrow = clamp((t - tThat) / 1.2), kGap = sp(tThat, 8);
  const Office = SETS.office!;
  const chip = (text: string, color: string, y: number, x: number) => (
    <g transform={`translate(${x},${y})`}>
      <rect x={-130} y={-34} width={260} height={68} rx={20} fill={color} stroke="#1d2433" strokeWidth={6} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">{text}</text>
    </g>
  );
  const yA = h * 0.47, yB = h * 0.53;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
      <AbsoluteFill style={{ background: "rgba(30,20,60,0.25)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.25},${h * 0.4})`}><Stub s={h * 0.12} t={t} /></g>
        <g transform={`translate(${w * 0.75},${h * 0.4})`}><Stub s={h * 0.12} t={t + 0.6} /></g>
        {kEq > 0 && <g transform={`translate(${w * 0.5},${h * 0.33 - (1 - kEq) * h * 0.1})`}>
          <rect x={-50} y={-30} width={100} height={18} rx={9} fill="#ffd84a" stroke="#1d2433" strokeWidth={5} />
          <rect x={-50} y={6} width={100} height={18} rx={9} fill="#ffd84a" stroke="#1d2433" strokeWidth={5} />
        </g>}
        {chip("SPEND", "#c9303a", yA, w * 0.25)}
        {chip("SAVE", "#1f9d63", yB, w * 0.25)}
        {chip("SAVE", "#1f9d63", yA + (yB - yA) * (1 - kSwap), w * 0.75)}
        {chip("SPEND", "#c9303a", yB + (yA - yB) * (1 - kSwap), w * 0.75)}
        <g transform={`translate(${w * 0.25},${h * 0.66})`}><Oak s={h * 0.1} t={t} k={0.1 + 0.2 * kGrow} /></g>
        <g transform={`translate(${w * 0.75},${h * 0.66})`}><Oak s={h * 0.1 + h * 0.06 * kGrow} t={t} k={0.1 + 0.9 * kGrow} /></g>
        <Actor p={p} spec={{ who: "priya", x: 0.5, scale: 0.75, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "order", pose: "point", expression: "smirk" }, { at: "that's", pose: "pointUp", expression: "shock" }] }} ground={h * 0.66} index={0} />
      </svg>
      {P.gap && kGap > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `scale(${Math.min(1, kGap * 1.2)})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 104, color: "#1d2433", background: "#ffd84a", border: "8px solid #1d2433", borderRadius: 26,
            padding: "4px 32px", boxShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>{P.gap}</span>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", marginTop: 8, textShadow: "0 4px 0 #1d2433" }}>THE GAP</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
