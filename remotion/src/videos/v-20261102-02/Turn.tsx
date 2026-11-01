/**
 * The turn: "Here's the clever part. The discount comes off the price, but the loan hands it back to
 * the dealer, one payment at a time."
 * Sharma in the penthouse, smirking. On the left the grinning dealer stands below Rohan's new
 * hatchback. On "discount" the yellow discount tag flies from the dealer onto the car; on "loan" a
 * loan paper drops in beside the car; on "back" boomerangs start looping from the loan paper back to
 * the dealer, one after another; on "payment" bill stubs pile up at the dealer's feet and the
 * figure the loan hands back lands over them.
 *
 * params: { tag: "{disc_total}", back: "{extra_diff}" }, events: clever, discount, price, loan, back, payment
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Dealer = props.dealer!, Car = props.hatchback!, Paper = props.loanpaper!, Boom = props.boomerang!, Stub = props.billstub!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { tag?: string; back?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tDisc = at(p, "discount", 1.4), tLoan = at(p, "loan", 3.0), tBack = at(p, "back", 3.8), tPay = at(p, "payment", 5.2);
  const kTag = ease(clamp((t - tDisc) / 0.8)), kLoan = sp(tLoan, 10), kPay = sp(tPay, 9);
  const Pent = SETS.penthouse!;
  const min = minText(w, h);
  const dealer: [number, number] = [w * 0.24, h * 0.62], car: [number, number] = [w * 0.4, h * 0.38], paper: [number, number] = [w * 0.56, h * 0.5];
  const tag = P.tag ?? "", back = P.back ?? "";
  const tagSize = Math.max(min, fitLine(tag, 56, w * 0.28));
  const backSize = Math.max(min, fitLine(back, 72, w * 0.36));
  const tx = dealer[0] + (car[0] - dealer[0]) * kTag, ty = dealer[1] - h * 0.2 + (car[1] - h * 0.14 - (dealer[1] - h * 0.2)) * kTag - Math.sin(kTag * Math.PI) * h * 0.08;
  const booms = t < tBack ? [] : Array.from({ length: 3 }, (_, i) => {
    const f = ((t - tBack) * 0.7 + i / 3) % 1;
    const x = paper[0] + (dealer[0] - paper[0]) * f, y = paper[1] - h * 0.06 + (dealer[1] - h * 0.12 - (paper[1] - h * 0.06)) * f - Math.sin(f * Math.PI) * h * 0.1;
    return <g key={i} transform={`translate(${x},${y + h * 0.03})`} opacity={clamp((1 - f) * 4)}><Boom s={h * 0.06} t={t + i} /></g>;
  });
  const stubs = Math.floor(clamp((t - tPay) / 1.5) * 4);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.06 - 0.04 * clamp((t - tLoan) / 1.2)})`, transformOrigin: "50% 45%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "rgba(10,30,20,0.3)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${car[0]},${car[1]})`}><Car s={h * 0.15} t={t} /></g>
          {kLoan > 0 && <g transform={`translate(${paper[0]},${paper[1] - (1 - kLoan) * h * 0.2})`} opacity={clamp(kLoan * 2)}><Paper s={h * 0.13} t={t} state="approved" /></g>}
          <g transform={`translate(${dealer[0]},${dealer[1]})`}><Dealer s={h * 0.25} t={t} /></g>
          {Array.from({ length: stubs }, (_, i) => (
            <g key={i} transform={`translate(${dealer[0] + w * 0.13 + (i % 2) * w * 0.04},${dealer[1] - i * h * 0.012})`}><Stub s={h * 0.06} t={t + i} /></g>
          ))}
          {booms}
          {t > tDisc - 0.1 && (
            <g transform={`translate(${tx},${ty}) rotate(${-8 + Math.sin(t * 3) * 4})`}>
              <rect x={-tagSize * tag.length * 0.33 - 24} y={-tagSize * 0.75} width={tagSize * tag.length * 0.66 + 48} height={tagSize * 1.4} rx={16} fill="#ffd34d" stroke={INK} strokeWidth={6} />
              <text y={tagSize * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={tagSize} fill="#e5484d">{tag}</text>
            </g>
          )}
          {kPay > 0 && back && (
            <g transform={`translate(${dealer[0] + w * 0.08},${h * 0.2}) scale(${kPay})`}>
              <rect x={-backSize * back.length * 0.33 - 28} y={-backSize * 0.8} width={backSize * back.length * 0.66 + 56} height={backSize * 1.5} rx={18} fill="#fff" stroke="#1f8f55" strokeWidth={7} />
              <text y={backSize * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={backSize} fill="#1f8f55">{back}</text>
            </g>
          )}
          <Actor p={p} spec={{ who: "sharma", x: 0.8, scale: 0.92, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "loan", pose: "present", expression: "proud" }, { at: "payment", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.66} index={0} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Turn;
