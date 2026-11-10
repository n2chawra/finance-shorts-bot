/**
 * Hook (a secret): "You think Ohtani cashes a giant salary? He doesn't."
 * An office at night: a baseball star on the right with a giant cheque floating over his head, Rohan
 * on the left cheering. Frame 0 reads OHTANI'S GIANT SALARY over CASHED?. On "Ohtani" the star taps
 * his bat; on "cashes" the giant cheque swings down toward him; on "doesn't" a red HE DOESN'T stamp
 * slams and the cheque flies back up into a steel time safe that slams shut.
 *
 * params: { line, ask, cross }, events: ohtani, cashes, giant, no
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Star = props.batter!, Cheque = props.bigcheque!, Safe = props.timesafe!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tO = at(p, "ohtani", 0.5), tC = at(p, "cashes", 1.0), tNo = at(p, "no", 2.2);
  const kO = sp(tO, 8), kC = sp(tC, 10), kNo = sp(tNo, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 116, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 110, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 100, (box.x1 - box.x0) * 0.8, { upper: true }));
  const g = h * 0.66, sx = w * 0.68, safeX = w * 0.3;
  const tap = kO * Math.sin(clamp((t - tO) * 3) * Math.PI) * 8;
  const chequeX = sx + w * 0.06 - (sx + w * 0.06 - safeX) * kNo, chequeY = g - h * 0.27 + kC * h * 0.04 * (1 - kNo) + kNo * h * 0.1;
  const chequeS = 1 - 0.7 * kNo;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.04 * kNo})`, transformOrigin: "55% 60%" }}>
        <World kind="office" tint="#1e2e5e" w={w} h={h} t={t} seed="hook-ohtani-office" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={sx} cy={g - h * 0.18} rx={w * 0.24} ry={h * 0.18} fill="#ffe9a8" opacity={0.14} />
          <g transform={`translate(${sx},${g}) rotate(${tap})`}><Star s={h * 0.26} t={t} /></g>
          <g transform={`translate(${safeX},${g + (1 - kNo) * h * 0.4})`} opacity={clamp(kNo * 3)}><Safe s={h * 0.16} t={t} state={t > tNo + 0.5 ? undefined : "open"} /></g>
          <g transform={`translate(${chequeX},${chequeY}) scale(${chequeS})`} opacity={1 - clamp((t - tNo - 0.5) * 3)}><Cheque s={h * 0.15} t={t} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.14, scale: 0.95, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "no", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.82} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.2, textAlign: "center", opacity: 1 - 0.6 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", transform: `scale(${1 + 0.08 * kC * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.29, textAlign: "center", transform: `rotate(-6deg) scale(${1.7 - 0.7 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`, border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
