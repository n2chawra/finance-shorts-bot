/**
 * The turn: "Exactly. A salary is taxed the day it's paid. Shares are taxed only when they're sold."
 * A split down the middle. Left, on "salary": the cheque drops straight into the tax sack the moment
 * it lands ("paid"). Right, on "shares": the share stack climbs behind a gold padlock, the sack
 * waiting outside it empty; on "sold" a SOLD? sign swings, unopened.
 *
 * params: { left: "Salary", right: "Shares" }, events: salary, paid, shares, sold
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Cheque = props.cheque!, Taxbag = props.taxbag!, Certificate = props.certificate!, Padlock = props.padlock!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { left?: string; right?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tSalary = at(p, "salary", 0.6), tPaid = at(p, "paid", 1.6), tShares = at(p, "shares", 2.4), tSold = at(p, "sold", 3.6);
  const kL = sp(tSalary), kR = sp(tShares), kSold = sp(tSold, 8);
  const drop = ease((t - tPaid) / 0.6);
  const climb = ease((t - tShares) / 2.0);
  const gy = h * 0.74;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <World kind="studio" tint="#f2b631" w={w} h={h} t={t} seed="turn-studio" props={props} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w / 2, height: h, background: "rgba(229,72,77,0.18)" }} />
      <div style={{ position: "absolute", left: w / 2, top: 0, width: w / 2, height: h, background: "rgba(47,179,122,0.18)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w / 2} y1={h * 0.12} x2={w / 2} y2={h * 0.9} stroke="#1d2433" strokeWidth={10} strokeDasharray="30 20" />
        {/* left: the salary is taxed the day it is paid */}
        <g transform={`translate(${w * 0.25},${gy})`}><Taxbag s={h * 0.16} t={t} k={0.3 + 0.6 * drop} /></g>
        {kL > 0 && drop < 1 && <g transform={`translate(${w * 0.25},${gy - h * 0.38 + drop * h * 0.3}) scale(${kL * (1 - 0.6 * drop)})`}><Cheque s={h * 0.1} t={t} /></g>}
        {/* right: the shares grow, locked, never sold */}
        {kR > 0 && Array.from({ length: 1 + Math.floor(5 * climb) }, (_, i) => (
          <g key={i} transform={`translate(${w * 0.75},${gy - i * h * 0.06}) scale(${kR})`}><Certificate s={h * 0.08} t={t + i} /></g>
        ))}
        {kR > 0 && <g transform={`translate(${w * 0.75},${gy + h * 0.02}) scale(${kR})`}><Padlock s={h * 0.08} t={t} /></g>}
        {kR > 0 && <g transform={`translate(${w * 0.92},${gy}) scale(${0.6 * kR})`} opacity={0.7}><Taxbag s={h * 0.12} t={t} k={0} /></g>}
        <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 1.3, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "shares", pose: "pointUp", expression: "proud" }] }} ground={h * 0.86} index={0} />
      </svg>
      {P.left && <div style={{ position: "absolute", left: 0, width: w / 2, top: h * 0.12, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", textShadow: "0 6px 0 #1d2433", transform: `scale(${0.5 + 0.5 * kL})`, opacity: clamp(kL * 2) }}>{P.left}</div>}
      {P.right && <div style={{ position: "absolute", left: w / 2, width: w / 2, top: h * 0.12, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", textShadow: "0 6px 0 #1d2433", transform: `scale(${0.5 + 0.5 * kR})`, opacity: clamp(kR * 2) }}>{P.right}</div>}
      {drop > 0 && <div style={{ position: "absolute", left: 0, width: w / 2, top: h * 0.2, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#fff", background: "#e5484d", border: "6px solid #1d2433", borderRadius: 16, padding: "2px 22px", transform: `rotate(-6deg) scale(${clamp(drop * 1.5)})` }}>TAXED NOW</span>
      </div>}
      {kSold > 0 && <div style={{ position: "absolute", left: w / 2, width: w / 2, top: h * 0.2, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#1d2433", background: "#7cf0b2", border: "6px solid #1d2433", borderRadius: 16, padding: "2px 22px", transform: `rotate(${Math.sin((t - tSold) * 4) * 8 * Math.exp(-(t - tSold))}deg) scale(${kSold})` }}>ONLY IF SOLD</span>
      </div>}
    </AbsoluteFill>
  );
};

export default Turn;
