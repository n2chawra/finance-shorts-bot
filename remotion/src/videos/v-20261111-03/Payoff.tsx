/**
 * The payoff: "So he lives on sponsors and lets the big cheque wait."
 * A penthouse over the night city: the baseball star at ease on the right, a billboard behind him
 * sending cash to him; the steel time safe on the left with the deferred figure and PAID LATER.
 * On "lives" the star bobs as notes fly from the billboard to him; on "sponsors" the billboard
 * glows; on "cheque" the big cheque slides into the safe; on "wait" the safe locks and a gold BIG
 * CHEQUE WAITS stamp slams while the camera eases back.
 *
 * params: { waiting, waitingLabel, stamp }, events: lives, sponsors, cheque, wait
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Star = props.batter!, Board = props.billboard!, Safe = props.timesafe!, Cheque = props.bigcheque!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { waiting?: string; waitingLabel?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tL = at(p, "lives", 0.3), tSp = at(p, "sponsors", 0.9), tC = at(p, "cheque", 1.8), tW = at(p, "wait", 2.4);
  const kSp = sp(tSp, 9), kC = sp(tC, 10), kW = sp(tW, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const colW = (box.x1 - box.x0) * 0.47;
  const g = h * 0.64, bx = w * 0.86, sx = w * 0.62, safeX = w * 0.3;
  const zoom = 1.06 - 0.04 * kW;
  const notes = t < tL ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tL) * 1.2 + i / 6) % 1;
    const x = bx + (sx - bx) * f, y = g - h * 0.1 - Math.sin(f * Math.PI) * h * 0.08;
    return <rect key={i} x={x - h * 0.015} y={y} width={h * 0.03} height={h * 0.017} rx={3} fill="#8fd19e" stroke={INK} strokeWidth={2.5} />;
  });
  const chequeX = sx - (sx - safeX) * kC, chequeY = g - h * 0.3 + kC * h * 0.12;
  const stamp = (P.stamp ?? "").toUpperCase();
  const stSize = Math.max(min, fitLine(stamp, 80, maxW * 0.8, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 60%" }}>
        <World kind="city" tint="#1e2e5e" w={w} h={h} t={t} seed="payoff-ohtani-city" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${bx},${g}) scale(${1 + 0.08 * kSp})`} opacity={0.75 + 0.25 * kSp}><Board s={h * 0.12} t={t} /></g>
          {notes}
          <g transform={`translate(${sx},${g})`}><Star s={h * 0.22} t={t * 1.5} /></g>
          <g transform={`translate(${safeX},${g})`}><Safe s={h * 0.2} t={t} state={t < tW ? "open" : undefined} /></g>
          {t < tW + 0.3 && <g transform={`translate(${chequeX},${chequeY}) scale(${1 - 0.6 * kC})`} opacity={1 - clamp((t - tW) * 4)}><Cheque s={h * 0.14} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.12, scale: 0.75, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "wait", pose: "thumbsUp", expression: "proud" }] }}
            ground={h * 0.86} index={0} />
        </svg>
      </AbsoluteFill>
      {P.waiting && (
        <div style={{ position: "absolute", left: safeX - colW / 2, width: colW, top: h * 0.3, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.waiting, 84, colW)), color: "#ffd84a", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{P.waiting}</div>
          {P.waitingLabel && <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.waitingLabel.toUpperCase(), 48, colW, { upper: true })), color: INK, background: "#fff", padding: "4px 14px", borderRadius: 12, border: `4px solid ${INK}` }}>{P.waitingLabel.toUpperCase()}</span>}
        </div>
      )}
      {kW > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.17, textAlign: "center", transform: `rotate(-4deg) scale(${1.5 - 0.5 * kW})`, opacity: clamp(kW * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stSize, color: INK, background: "#ffd84a", padding: `${stSize * 0.12}px ${stSize * 0.4}px`, border: `8px solid ${INK}`, borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
