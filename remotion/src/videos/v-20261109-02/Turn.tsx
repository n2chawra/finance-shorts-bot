/**
 * The turn: "But that fortune is far bigger than anything basketball paid him."
 * A penthouse at night, header OWNING VS PLAYING from frame 0. On the right, a short purple column
 * with the basketball on top and PLAYING under the career figure. On "fortune" a gold column
 * shoots up on the left, past the top of the frame's middle, the vault at its foot; on "basketball"
 * the ball hops on the short column; on "paid" the fortune figure pulses and the camera pushes in.
 *
 * params: { header, big, bigLabel, small, smallLabel }, events: worth, basketball, paid
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Ball = props.hoopball!, Vault = props.fortunevault!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; big?: string; bigLabel?: string; small?: string; smallLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 110, mass: 0.9 } }));
  const tWorth = at(p, "worth", 0.4), tBall = at(p, "basketball", 1.6), tPaid = at(p, "paid", 2.4);
  const kWorth = sp(tWorth), kBall = sp(tBall, 8), kPaid = sp(tPaid, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const colW = w * 0.3, base = h * 0.6;
  const xBig = w * 0.3, xSmall = w * 0.72;
  const hBig = h * 0.36 * (0.3 + 0.7 * kWorth), hSmall = h * 0.035;
  const lab = (s: string, base0 = 54) => Math.max(min * 1.1, fitLine(s.toUpperCase(), base0, colW + 60, { upper: true }));
  const fig = (s: string, base0 = 90) => Math.max(min, fitLine(s, base0, colW + 70));
  const hop = kBall * Math.abs(Math.sin((t - tBall) * 7)) * (t < tBall + 0.7 ? 1 : 0);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.07 * kPaid})`, transformOrigin: "40% 50%" }}>
        <World kind="night" tint="#3b2266" w={w} h={h} t={t} seed="turn-owning-playing" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={xBig - colW / 2} y={base - hBig} width={colW} height={Math.max(1, hBig)} rx={14} fill="#f2b631" stroke={INK} strokeWidth={7} />
          {Array.from({ length: Math.floor(hBig / (h * 0.035)) }, (_, i) => (
            <line key={i} x1={xBig - colW / 2 + 10} x2={xBig + colW / 2 - 10} y1={base - (i + 1) * h * 0.035} y2={base - (i + 1) * h * 0.035} stroke="#c98d12" strokeWidth={4} />
          ))}
          <rect x={xSmall - colW / 2} y={base - hSmall} width={colW} height={hSmall} rx={8} fill="#8a63d2" stroke={INK} strokeWidth={6} />
          <g transform={`translate(${xSmall},${base - hSmall - hop * h * 0.06})`}><Ball s={h * 0.13} t={t} /></g>
          <g transform={`translate(${xBig},${base + h * 0.06})`}><Vault s={h * 0.15} t={t} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.small && (
        <div style={{ position: "absolute", left: xSmall - colW / 2 - 35, width: colW + 70, top: base - h * 0.22, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.small, 80), color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.small}</div>
          {P.smallLabel && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.smallLabel), color: "#c9b2ff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.smallLabel.toUpperCase()}</div>}
        </div>
      )}
      {P.big && (
        <div style={{ position: "absolute", left: Math.max(box.x0, xBig - colW / 2 - 35), width: colW + 70, top: Math.max(h * 0.15, base - hBig - h * 0.13), textAlign: "center", transform: `scale(${1 + 0.25 * kPaid * Math.max(0, 1 - (t - tPaid) * 2)})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.big, 110), color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.big}</div>
          {P.bigLabel && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.bigLabel), color: "#fff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.bigLabel.toUpperCase()}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
