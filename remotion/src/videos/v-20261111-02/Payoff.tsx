/**
 * The payoff: "So is that pile wasted? No, it's waiting for a sale."
 * The vault again, now lit gold: the war chest big in the middle with the cash figure over it, a
 * pocket watch ticking beside it, Rohan on the left. On "pile" the chest glows; on "wasted" a grey
 * WASTED chip appears and is crossed out in red; on "waiting" the watch swings and its hand spins; on
 * "sale" a gold WAITING FOR A SALE stamp slams and the camera eases back.
 *
 * params: { figure, figureLabel, cross, stamp }, events: pile, wasted, waiting, sale
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Chest = props.warchest!, Watch = props.pocketwatch!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { figure?: string; figureLabel?: string; cross?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tP = at(p, "pile", 0.4), tW = at(p, "wasted", 1.0), tWait = at(p, "waiting", 1.8), tS = at(p, "sale", 2.6);
  const kP = sp(tP, 9), kW = sp(tW, 10), kWait = sp(tWait, 9), kS = sp(tS, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const g = h * 0.64, cx = w * 0.56, wx = w * 0.86;
  const zoom = 1.08 - 0.04 * kS;
  const fig = P.figure ?? "";
  const cross = (P.cross ?? "").toUpperCase();
  const stamp = (P.stamp ?? "").toUpperCase();
  const stSize = Math.max(min, fitLine(stamp, 80, maxW * 0.8, { upper: true }));
  const crossed = clamp((t - tW - 0.3) * 4);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "55% 60%" }}>
        <World kind="bank" tint="#6e4a1e" w={w} h={h} t={t} seed="payoff-berkshire-gold" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={cx} cy={g - h * 0.12} rx={w * 0.3} ry={h * 0.14} fill="#ffd27a" opacity={0.12 + 0.2 * kP} />
          <g transform={`translate(${cx},${g}) scale(${1 + 0.06 * kP})`}><Chest s={h * 0.24} t={t} /></g>
          <g transform={`translate(${wx},${g}) rotate(${kWait * Math.sin((t - tWait) * 4) * 12} 0 ${-h * 0.12}) scale(${0.6 + 0.4 * kWait})`}><Watch s={h * 0.12} t={t * (t > tWait ? 6 : 1)} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.18, scale: 0.9, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "sale", pose: "thumbsUp", expression: "proud" }] }}
            ground={h * 0.84} index={0} />
        </svg>
      </AbsoluteFill>
      {fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.2, textAlign: "center", opacity: clamp(kP * 2 + 0.3) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(fig, 140, maxW * 0.8)), color: "#ffd84a", WebkitTextStroke: "11px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{fig}</div>
          {P.figureLabel && <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.figureLabel.toUpperCase(), 50, maxW * 0.6, { upper: true })), color: INK, background: "#8fd19e", padding: "4px 18px", borderRadius: 12, border: `4px solid ${INK}` }}>{P.figureLabel.toUpperCase()}</span>}
        </div>
      )}
      {kW > 0 && cross && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.36, textAlign: "center", opacity: clamp(kW * 2) * (1 - 0.7 * kS) }}>
          <span style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(cross, 70, maxW * 0.6, { upper: true })), color: "#fff", background: "#7a7f8c", padding: "4px 22px", borderRadius: 12 }}>
            {cross}
            <span style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 10, background: "#e5484d", transform: `scaleX(${crossed}) rotate(-8deg)`, transformOrigin: "left center" }} />
          </span>
        </div>
      )}
      {kS > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.44, textAlign: "center", transform: `rotate(-4deg) scale(${1.5 - 0.5 * kS})`, opacity: clamp(kS * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stSize, color: INK, background: "#ffd84a", padding: `${stSize * 0.12}px ${stSize * 0.4}px`, border: `8px solid ${INK}`, borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
