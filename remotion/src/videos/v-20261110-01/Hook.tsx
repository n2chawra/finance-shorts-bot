/**
 * Hook (a secret): "You think Tesla's giant pay deal gave Elon Musk cash? It didn't."
 * A night skyline, a giant paycheck floating in the middle with banknotes raining round it, Rohan
 * on the left pointing at it. Frame 0 reads TESLA'S GIANT PAY DEAL over CASH FOR ELON?. On "pay" the
 * paycheck hops; on "cash" the rain thickens and the cheque glows; on "didn't" a red NO CASH stamp
 * slams, the rain stops and the cheque flips into a padlocked steel lockbox.
 *
 * params: { line, ask, cross }, events: pay, elon, cash, didnt
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import { city as City } from "../../studio/places";
import props from "./props";

const Check = props.paycheck!, Lock = props.lockbox!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPay = at(p, "pay", 0.6), tCash = at(p, "cash", 1.8), tNo = at(p, "didnt", 2.6);
  const kPay = sp(tPay, 8), kCash = sp(tCash, 10), kNo = sp(tNo, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 110, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 120, (box.x1 - box.x0) * 0.7, { upper: true }));
  const g = h * 0.62, cx = w * 0.58;
  const hop = kPay * Math.abs(Math.sin((t - tPay) * 6)) * (t < tPay + 0.6 ? 1 : 0);
  const flip = clamp((t - tNo) * 3);
  const rain = Array.from({ length: 16 }, (_, i) => {
    const speed = 0.35 + random(`r${i}`) * 0.3 + (t > tCash ? 0.25 : 0);
    const f = (t * speed + random(`o${i}`)) % 1;
    const x = w * (0.08 + 0.84 * random(`x${i}`)), y = -h * 0.05 + f * h * 0.75;
    const show = (i < 9 || t > tCash) && t < tNo + 0.3 ? 1 : 0;
    return <rect key={i} x={x - h * 0.022} y={y - h * 0.012} width={h * 0.044} height={h * 0.024} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 360 + i * 40} ${x} ${y})`} opacity={show * 0.95} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.015 * t + 0.05 * kNo})`, transformOrigin: "55% 55%" }}>
        <World kind="night" tint="#2a1f5e" w={w} h={h} t={t} seed="hook-tesla-night" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${g - h * 0.02})`} opacity={0.55}><City s={h * 0.3} t={t} seed="hook-skyline" /></g>
          <ellipse cx={cx} cy={g - h * 0.12} rx={w * 0.3} ry={h * 0.14} fill="#ffd27a" opacity={0.12 + 0.12 * kCash * (1 - kNo)} />
          {rain}
          <g transform={`translate(${cx},${g - h * 0.04}) scale(${(1 + 0.08 * hop) * (1 - flip)},${1 + 0.08 * hop})`} opacity={1 - flip}><Check s={h * 0.22} t={t} /></g>
          {flip > 0 && <g transform={`translate(${cx},${g}) scale(${flip},1)`}><Lock s={h * 0.24} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "cash", pose: "celebrate", expression: "laugh" }, { at: "didnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.2, textAlign: "center", opacity: 1 - 0.5 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.08 * kCash * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
