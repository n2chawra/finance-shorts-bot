/**
 * Hook (a curiosity gap): "It's not the burgers. So how does McDonald's really make money?"
 * A street corner at night: Rohan cheers next to a giant burger, the restaurant glowing behind.
 * Frame 0 already reads IT'S NOT THE BURGERS. On "burgers" a red cross slashes the burger, on
 * "really" the burger sinks and the restaurant's sign lights up, on "money" a big question mark
 * lands over the restaurant. The answer (the land, the rent) is not shown: it is the payoff.
 *
 * params: { line: "It's not the burgers" }, events: burgers, really, money
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { SETS } from "../../studio/sets";
import props from "./props";

const Diner = props.diner!, Burger = props.burger!, Fries = props.fries!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.9 } }));
  const tBurg = at(p, "burgers", 0.9), tReal = at(p, "really", 2.0), tMoney = at(p, "money", 3.0);
  const kX = clamp((t - tBurg) / 0.35), kSink = clamp((t - tReal) / 0.8), kQ = sp(tMoney, 9);
  const Market = SETS.market!;
  const push = 1.03 + 0.015 * t;
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 120, box.x1 - box.x0 - 40, { upper: true }));
  const bx = w * 0.56, by = h * 0.74 + kSink * h * 0.04, bs = h * 0.17 * (1 + 0.06 * Math.sin(t * 3)) * (1 - 0.3 * kSink);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 62%" }}>
        <Market.back w={w} h={h} t={t} seed={`${p.beat.id}m`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 60%, rgba(255,190,80,0.25), rgba(30,10,0,0.55) 72%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.66},${h * 0.58})`}><Diner s={h * 0.17} t={t} k={t > tReal ? 1 : 0.2} /></g>
          <g transform={`translate(${w * 0.84},${h * 0.8})`}><Fries s={h * 0.08} t={t} /></g>
          <g transform={`translate(${bx},${by})`}><Burger s={bs} t={t} /></g>
          {kX > 0 && (
            <g transform={`translate(${bx},${by - bs * 0.45})`}>
              <path d={`M${-bs * 0.55},${-bs * 0.45} L${bs * 0.55},${bs * 0.45}`} stroke="#e5484d" strokeWidth={28} strokeLinecap="round" strokeDasharray={bs * 1.5} strokeDashoffset={bs * 1.5 * (1 - kX)} />
              <path d={`M${bs * 0.55},${-bs * 0.45} L${-bs * 0.55},${bs * 0.45}`} stroke="#e5484d" strokeWidth={28} strokeLinecap="round" strokeDasharray={bs * 1.5} strokeDashoffset={bs * 1.5 * (1 - clamp((t - tBurg - 0.2) / 0.35))} />
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.24, scale: 1.15, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "really", pose: "think", expression: "confused" }] }}
            ground={h * 1.02} index={0} />
          {kQ > 0 && <g transform={`translate(${w * 0.68},${h * 0.36}) scale(${kQ}) rotate(${(1 - kQ) * -20})`}>
            <circle r={h * 0.07} fill="#ffd84a" stroke="#1d2433" strokeWidth={10} />
            <text y={h * 0.04} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.1} fill="#1d2433">?</text>
          </g>}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.06 * Math.sin(t * 4) * (1 - kSink)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
