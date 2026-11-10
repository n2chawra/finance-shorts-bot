/**
 * Hook (a myth): "You think a year's pay is big money? Not to Ronaldo."
 * A floodlit football pitch at night. Rohan on the left holds up his year's pay: a salary slip with a
 * small cash pile, YOUR YEAR under it. Frame 0 reads A YEAR'S PAY over BIG MONEY?. On "pay" the slip
 * hops; on "big" the little pile grows a bundle; on "Not" a red NOT TO RONALDO stamp slams, a football
 * star rises on the right beside a towering pile of cash with a trophy, and the slip shrinks in its shadow.
 *
 * params: { line, ask, cross, slip }, events: pay, big, no, ronaldo
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Slip = props.payslip!, Pile = props.cashpile!, Star = props.footballer!, Sack = props.moneysack!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string; slip?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPay = at(p, "pay", 0.5), tBig = at(p, "big", 1.0), tNo = at(p, "no", 1.9);
  const kPay = sp(tPay, 8), kBig = sp(tBig, 9), kNo = sp(tNo, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 104, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 96, (box.x1 - box.x0) * 0.82, { upper: true }));
  const slip = (P.slip ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(slip, 54, w * 0.34, { upper: true }));
  const g = h * 0.64, sx = w * 0.36, px = w * 0.74;
  const hop = t > tPay && t < tPay + 0.5 ? Math.sin((t - tPay) * Math.PI * 2) * h * 0.015 : 0;
  const slipScale = 1 + 0.1 * kPay - 0.35 * kNo;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.04 * kNo})`, transformOrigin: "60% 58%" }}>
        <World kind="field" tint="#14532d" w={w} h={h} t={t} seed="hook-ronaldo-pitch" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {[0.12, 0.88].map((x) => (
            <g key={x}>
              <polygon points={`${w * x - 30},${h * 0.1} ${w * x + 30},${h * 0.1} ${w * 0.55 + (x - 0.5) * w * 0.2},${g} ${w * 0.45 + (x - 0.5) * w * 0.2},${g}`} fill="#fff8d0" opacity={0.08 + 0.03 * Math.sin(t * 4 + x)} />
              <rect x={w * x - 34} y={h * 0.08} width={68} height={30} rx={6} fill="#fff8d0" stroke={INK} strokeWidth={4} />
            </g>
          ))}
          <g transform={`translate(${px},${g + (1 - kNo) * h * 0.5})`} opacity={clamp(kNo * 3)}>
            <ellipse cx={0} cy={-h * 0.14} rx={w * 0.26} ry={h * 0.16} fill="#ffd27a" opacity={0.18} />
            <Pile s={h * 0.36} t={t} />
          </g>
          <g transform={`translate(${px - w * 0.2},${g + (1 - kNo) * h * 0.5})`} opacity={clamp(kNo * 3)}><Star s={h * 0.2} t={t} /></g>
          <g transform={`translate(${sx},${g - hop}) scale(${slipScale})`}><Slip s={h * 0.18} t={t} /></g>
          {kBig > 0 && <g transform={`translate(${sx + w * 0.1},${g}) scale(${kBig * (1 - 0.35 * kNo)})`}><Sack s={h * 0.08} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.15, scale: 1.0, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "no", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {slip && (
        <div style={{ position: "absolute", left: sx - w * 0.18, width: w * 0.36, top: g + h * 0.012, textAlign: "center", opacity: 1 - 0.4 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: INK, background: "#fff", padding: "4px 16px", borderRadius: 12, border: `4px solid ${INK}` }}>{slip}</span>
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.17, textAlign: "center", opacity: 1 - 0.5 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.1 * kBig * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.27, textAlign: "center", transform: `rotate(-7deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
