/**
 * Hook (a myth): "You think Warren Buffett sells his big winners? This one he has never sold.
 * Here's why."
 * An office at night, Sharma (the rich mentor) on the left. Frame 0 reads NEVER SOLD over a giant
 * share certificate with a cola bottle beside it. On "Buffett" the certificate pops; on "sells" a big
 * red SELL button drops in and blinks; on "never" a red cross slams over the button and the
 * certificate turns gold; on "why" coins start dripping from the certificate into a fruit basket.
 *
 * params: { line }, events: buffett, sells, kept, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Cert = props.stockcert!, Sell = props.sellbutton!, Bottle = props.colabottle!, Basket = props.fruitbasket!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tB = at(p, "buffett", 0.5), tSell = at(p, "sells", 1.1), tNever = at(p, "kept", 2.2), tWhy = at(p, "why", 3.4);
  const kB = sp(tB, 8), kSell = sp(tSell, 10), kX = sp(tNever, 8), kWhy = sp(tWhy, 10);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 140, box.x1 - box.x0 - 40, { upper: true }));
  const cx = w * 0.62, cy = h * 0.5;
  const drops = t < tWhy ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tWhy) * 1.2 + i / 5) % 1;
    return <circle key={i} cx={cx + (i - 2) * w * 0.03} cy={cy + f * h * 0.17} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t})`, transformOrigin: "55% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(255,120,80,0.22), rgba(30,0,0,0.55) 75%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${cx},${cy}) scale(${0.9 + 0.12 * kB})`}><Cert s={h * 0.3} t={t} state={kX > 0.5 ? "gold" : undefined} /></g>
          <g transform={`translate(${w * 0.9},${h * 0.52})`}><Bottle s={h * 0.16} t={t} /></g>
          {drops}
          <g transform={`translate(${cx},${h * 0.7})`}><Basket s={h * 0.1} t={t} /></g>
          {kSell > 0 && (
            <g transform={`translate(${w * 0.62},${h * 0.3 - (1 - kSell) * h * 0.2})`} opacity={1 - clamp((t - tWhy) / 0.3)}>
              <Sell s={h * 0.12} t={t} state={kX > 0 ? undefined : "pressed"} />
              {kX > 0 && <g opacity={clamp(kX * 2)} transform={`scale(${2 - kX})`}>
                <line x1={-h * 0.07} y1={-h * 0.11} x2={h * 0.07} y2={h * 0.01} stroke="#e5484d" strokeWidth={18} strokeLinecap="round" />
                <line x1={h * 0.07} y1={-h * 0.11} x2={-h * 0.07} y2={h * 0.01} stroke="#e5484d" strokeWidth={18} strokeLinecap="round" />
              </g>}
            </g>
          )}
          <Actor p={p} spec={{ who: "sharma", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "kept", pose: "thumbsUp", expression: "proud" }] }}
            ground={h * 0.74} index={0} />
          {kWhy > 0 && <circle cx={cx} cy={cy - h * 0.15} r={h * 0.2 * kWhy} fill="none" stroke="#ffd84a" strokeWidth={6} opacity={0.5 * (1 - clamp((t - tWhy) / 1.5))} />}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.09, textAlign: "center", opacity: 1 - clamp((t - tNever - 0.4) / 0.25) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
