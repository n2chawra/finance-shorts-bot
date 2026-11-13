/**
 * The loop: "Where would you stop climbing? Because {fact3} billionaires never got through the door."
 * Back to the hook's picture: the crowd of billionaires held back by the velvet rope at the gold door of
 * the Forbes list, {fact3} over them. On "stop" the crowd presses forward; on "billionaires" a TOO POOR
 * stamp slams on the crowd; on "door" the door's sign pops. It leads straight back into the hook.
 *
 * params: { count, line, door, sign }, events: stop, billionaires, door
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Door = props.golddoor!, Crowd = props.suitcrowd!, Rope = props.rope!;

const Loop: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { count?: string; line?: string; door?: string; sign?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tA = at(p, "stop", 0.4), tP = at(p, "billionaires", 1.6), tF = at(p, "door", 2.6);
  const kA = sp(tA, 13), kP = sp(tP, 9), kF = sp(tF, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const count = P.count ?? "";
  const cSize = Math.max(min, fitLine(count, 220, maxW * 0.6));
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 92, maxW, { upper: true }));
  const sign = (P.sign ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(sign, 60, w * 0.42, { upper: true }));
  const door = (P.door ?? "").toUpperCase();
  const dSize = Math.max(min, fitLine(door, 52, w * 0.4, { upper: true }));
  const stamp = "TOO POOR";
  const stSize = Math.max(min, fitLine(stamp, 84, w * 0.44, { upper: true }));
  const g = h * 0.66;
  const xD = w * 0.7, xC = w * 0.32;
  const push = w * 0.03 * clamp(kA) + Math.sin(t * 3) * w * 0.004;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t})`, transformOrigin: "50% 60%" }}>
        <World kind="bank" tint="#4a3510" w={w} h={h} t={t} seed="loop-forbes-door" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${xD},${g})`}><Door s={h * 0.36} t={t} /></g>
          <g transform={`translate(${xC + push},${g})`}><Crowd s={h * 0.21} t={t} /></g>
          <g transform={`translate(${w * 0.5},${g + h * 0.01})`}><Rope s={h * 0.12} t={t} /></g>
        </svg>
        {sign && (
          <div style={{ position: "absolute", left: xD - w * 0.22, width: w * 0.44, top: g - h * 0.42, textAlign: "center", transform: `scale(${1 + 0.15 * kF * Math.max(0, 1 - (t - tF) * 2)})` }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: INK, background: "#ffd84a", padding: "6px 16px", borderRadius: 12, border: `6px solid ${INK}` }}>{sign}</span>
          </div>
        )}
        {door && (
          <div style={{ position: "absolute", left: xD - w * 0.2, width: w * 0.4, top: g + h * 0.02, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: dSize, color: "#fff", background: INK, padding: "4px 14px", borderRadius: 10 }}>{door}</span>
          </div>
        )}
        {kP > 0 && (
          <div style={{ position: "absolute", left: xC - w * 0.22, width: w * 0.44, top: g - h * 0.2, textAlign: "center", transform: `scale(${1.8 - 0.8 * kP}) rotate(-10deg)`, opacity: clamp(kP * 2) }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stSize, color: "#e5484d", border: "8px solid #e5484d", padding: "2px 16px", borderRadius: 12, background: "rgba(255,255,255,0.92)" }}>{stamp}</span>
          </div>
        )}
      </AbsoluteFill>
      {count && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.06, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.1 * kP * Math.max(0, 1 - (t - tP) * 1.5) + 0.02 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{count}</span>
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.06 + cSize * 1.05, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: "#fff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", transform: "rotate(-2deg)" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Loop;
