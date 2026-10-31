/**
 * Hook (conflict, a curiosity gap): "You're scared of debt. I love it. Let me show you why."
 * The bank's marble hall. Rohan on the left clutches a loan contract and trembles; Sharma on the
 * right holds the same kind of contract and smirks. Frame 0 already reads YOU'RE SCARED OF DEBT.
 * On "scared" Rohan's contract shakes and a red warning flashes behind him, on "love" a gold heart
 * pops over Sharma's contract, on "show" a big question mark lands between them. Why the rich love
 * it (what the loan buys) is not shown: it is the payoff.
 *
 * params: { line: "You're scared of debt" }, events: scared, love, show
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Contract = props.contract!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.9 } }));
  const tScared = at(p, "scared", 0.6), tLove = at(p, "love", 1.6), tShow = at(p, "show", 2.6);
  const kHeart = sp(tLove, 8), kQ = sp(tShow, 9);
  const shake = t > tScared ? Math.sin(t * 40) * 8 * Math.max(0, 1 - (t - tScared) / 1.5) : 0;
  const Bank = SETS.bank!;
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 116, box.x1 - box.x0 - 40, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.015 * t})`, transformOrigin: "50% 60%" }}>
        <Bank.back w={w} h={h} t={t} seed={`${p.beat.id}b`} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(120,0,0,0.35), rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, rgba(255,190,60,0.25))" }} />
        {t > tScared && <AbsoluteFill style={{ background: "radial-gradient(circle at 25% 55%, rgba(229,72,77,0.35), rgba(0,0,0,0) 40%)", opacity: 0.6 + 0.4 * Math.sin(t * 10) }} />}
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <Actor p={p} spec={{ who: "rohan", x: 0.27, scale: 1.45, acting: [{ sec: 0, pose: "worried", expression: "worried" }, { at: "scared", pose: "worried", expression: "shock" }] }} ground={h * 0.68} index={0} />
          <Actor p={p} spec={{ who: "sharma", x: 0.73, scale: 1.45, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "love", pose: "present", expression: "proud" }, { at: "show", pose: "point", expression: "smirk" }] }} ground={h * 0.68} index={1} />
          <g transform={`translate(${w * 0.43 + shake},${h * 0.62})`}><Contract s={h * 0.1} t={t} k={1} /></g>
          <g transform={`translate(${w * 0.57},${h * 0.62})`}><Contract s={h * 0.1} t={t} k={1} /></g>
          {kHeart > 0 && <g transform={`translate(${w * 0.73},${h * 0.3}) scale(${kHeart * (1 + 0.08 * Math.sin(t * 8))})`}>
            <path d={`M0,${h * 0.03} C${-h * 0.06},${-h * 0.02} ${-h * 0.03},${-h * 0.06} 0,${-h * 0.03} C${h * 0.03},${-h * 0.06} ${h * 0.06},${-h * 0.02} 0,${h * 0.03} Z`} fill="#f2b631" stroke={INK} strokeWidth={8} />
          </g>}
          {kQ > 0 && <g transform={`translate(${w * 0.5},${h * 0.42}) scale(${kQ}) rotate(${(1 - kQ) * -20})`}>
            <circle r={h * 0.06} fill="#ffd84a" stroke={INK} strokeWidth={10} />
            <text y={h * 0.034} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.085} fill={INK}>?</text>
          </g>}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffffff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) translateX(${shake * 0.5}px)`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
