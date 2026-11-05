/**
 * Hook (a myth): "You think your gym wants you there? It doesn't. Here's why."
 * A blue night street, the budget gym's front lit in the middle, Rohan on the left cheering in his
 * running gear. Frame 0 reads YOUR GYM WANTS YOU? over the gym. On "gym" the gym hops and its doors
 * slide open; on "doesn't" a red IT DOESN'T stamp slams over the question, the doors shut and Rohan
 * shrugs; on "why" his membership card flips in beside the door with its fee and A MONTH.
 *
 * params: { line, cross, fee, feeLabel }, events: think, gym, there, doesnt, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Gym = props.gymfront!, Card = props.membercard!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; cross?: string; fee?: string; feeLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tGym = at(p, "gym", 0.6), tNo = at(p, "doesnt", 1.8), tWhy = at(p, "why", 2.8);
  const kGym = sp(tGym, 8), kNo = sp(tNo, 9), kWhy = sp(tWhy, 11);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 140, box.x1 - box.x0 - 60, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.8, { upper: true }));
  const lab = (s: string, max: number, base = 54) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, gx = w * 0.6, cx = w * 0.84;
  const hop = kGym * Math.abs(Math.sin((t - tGym) * 6)) * (t < tNo ? 1 : 0);
  const open = t >= tGym && t < tNo ? "open" : undefined;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t + 0.03 * kNo})`, transformOrigin: "55% 55%" }}>
        <World kind="street" tint="#1e3a70" w={w} h={h} t={t} seed="hook-street-gym" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={gx} cy={g - h * 0.12} rx={w * 0.36} ry={h * 0.16} fill="#ffe27a" opacity={0.12 + 0.06 * Math.sin(t * 4)} />
          <g transform={`translate(${gx},${g}) scale(${1 + 0.08 * hop})`}><Gym s={h * 0.3} t={t} state={open} /></g>
          {kWhy > 0 && (
            <g transform={`translate(${cx},${g - h * 0.2}) rotate(${(1 - kWhy) * 90}) scale(${0.4 + 0.6 * kWhy})`} opacity={clamp(kWhy * 2)}>
              <Card s={h * 0.11} t={t} />
            </g>
          )}
          {kWhy > 0 && P.fee && (
            <text x={cx} y={g - h * 0.29} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.fee, w * 0.26, 76)} fill="#ffd84a" stroke={INK} strokeWidth={9}
              paintOrder="stroke" opacity={clamp(kWhy * 2)}>{P.fee}</text>
          )}
          {kWhy > 0 && P.feeLabel && (
            <text x={cx} y={g + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.feeLabel, w * 0.26)} fill="#fff" stroke={INK} strokeWidth={7}
              paintOrder="stroke" opacity={clamp(kWhy * 2)}>{P.feeLabel.toUpperCase()}</text>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 0.9, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "doesnt", pose: "shrug", expression: "confused" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, opacity: 1 - 0.45 * kNo, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
