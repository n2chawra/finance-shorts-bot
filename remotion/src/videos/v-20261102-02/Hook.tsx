/**
 * Hook (a curiosity gap): "Your car discount? You quietly pay it back. Here's how."
 * A bank-lit showroom: a red hatchback turning on its stand, Rohan cheering beside it. Frame 0
 * already reads FREE DISCOUNT? On "discount" a big yellow tag with the discount slams onto the
 * car with confetti; on "quietly" a loan paper slides in beside the car; on "back" the tag turns
 * into a boomerang that loops out and flies into the loan paper; on "how" a question mark lands.
 * The how (the rate markup) is not shown: it is the payoff.
 *
 * params: { line: "Free discount?", tag: "-{disc_total}" }, events: discount, quietly, back, how
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { SETS } from "../../studio/sets";
import props from "./props";

const Car = props.hatchback!, Paper = props.loanpaper!, Boom = props.boomerang!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; tag?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tDisc = at(p, "discount", 0.6), tQuiet = at(p, "quietly", 1.4), tBack = at(p, "back", 2.2), tHow = at(p, "how", 3.0);
  const kTag = sp(tDisc, 9), kPaper = sp(tQuiet, 12), kQ = sp(tHow, 9);
  const fly = clamp((t - tBack) / 1.0);
  const Bank = SETS.bank!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 124, box.x1 - box.x0 - 40, { upper: true }));
  const cx = w * 0.6, cy = h * 0.62, cs = h * 0.24;
  const tagText = P.tag ?? "";
  const tagSize = Math.max(min, fitLine(tagText, 76, w * 0.36));
  // the tag sits over the car, then flies off as a boomerang arc into the paper
  const tagX = cx + (w * 0.84 - cx) * fly - Math.sin(fly * Math.PI) * w * 0.2, tagY = h * 0.42 + h * 0.04 * fly - Math.sin(fly * Math.PI) * h * 0.14;
  const confetti = t < tDisc ? [] : Array.from({ length: 18 }, (_, i) => {
    const f = clamp((t - tDisc) / 1.4);
    const a = random(`cf-a-${i}`) * Math.PI * 2, r = (0.3 + random(`cf-r-${i}`) * 0.7) * h * 0.18 * f;
    return <rect key={i} x={cx + Math.cos(a) * r} y={h * 0.42 + Math.sin(a) * r + f * f * h * 0.08} width={16} height={9}
      fill={["#ffd34d", "#2fb37a", "#f2588f", "#3d7bf5"][i % 4]} opacity={1 - f} transform={`rotate(${f * 400 + i * 20},${cx + Math.cos(a) * r},${h * 0.42 + Math.sin(a) * r})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.02 * t})`, transformOrigin: "55% 60%" }}>
        <Bank.back w={w} h={h} t={t} seed={`${p.beat.id}b`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 62%, rgba(255,240,180,0.35), rgba(10,20,40,0.45) 70%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={cx} cy={cy + h * 0.005} rx={cs * 1.0} ry={cs * 0.12} fill="#2b3245" stroke="#1d2433" strokeWidth={6} />
          <g transform={`translate(${cx},${cy}) scale(${Math.cos(t * 0.8) > 0 ? 1 : -1},1)`}><Car s={cs} t={t} /></g>
          {kPaper > 0 && <g transform={`translate(${w * 0.84 + (1 - kPaper) * w * 0.4},${h * 0.52})`}><Paper s={h * 0.12} t={t} state={fly >= 1 ? "approved" : undefined} /></g>}
          {confetti}
          {kTag > 0 && fly < 1 && (
            <g transform={`translate(${tagX},${tagY}) scale(${kTag * (1 - fly * 0.6)}) rotate(${fly * 540 - 8})`}>
              {fly > 0.05 ? <Boom s={h * 0.12} t={t} /> : (
                <g>
                  <rect x={-tagSize * tagText.length * 0.33 - 30} y={-tagSize * 0.75} width={tagSize * tagText.length * 0.66 + 60} height={tagSize * 1.4} rx={20} fill="#ffd34d" stroke="#1d2433" strokeWidth={8} />
                  <text y={tagSize * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={tagSize} fill="#e5484d">{tagText}</text>
                </g>
              )}
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 1.25, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "back", pose: "shrug", expression: "shock" }] }}
            ground={h * 1.12} index={0} />
          {kQ > 0 && <g transform={`translate(${w * 0.76},${h * 0.3}) scale(${kQ}) rotate(${(1 - kQ) * -20})`}>
            <circle r={h * 0.06} fill="#ffd84a" stroke="#1d2433" strokeWidth={10} />
            <text y={h * 0.034} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.088} fill="#1d2433">?</text>
          </g>}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.05 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
