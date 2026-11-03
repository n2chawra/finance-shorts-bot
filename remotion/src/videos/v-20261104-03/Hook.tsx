/**
 * Hook (a secret): "You think pay in four is free money? Someone pays. Let me show you who."
 * A street of shops at dusk, Rohan on the left, happy, holding up a phone at checkout. Frame 0 reads
 * FREE MONEY? over the phone with a PAY IN 4 button and a pair of sneakers. On "four" the payment
 * splits into four slices; on "free" the button lights green; on "Someone" a shop front slides in
 * behind with a coin trail running out of it; on "who" a gold question ring pulses round the shop.
 *
 * params: { line }, events: four, free, someone, who
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Phone = props.checkout!, Split = props.split4!, Shoe = props.sneaker!, Shop = props.shopfront!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tFour = at(p, "four", 0.6), tFree = at(p, "free", 1.1), tSome = at(p, "someone", 1.9), tWho = at(p, "who", 3.2);
  const kFour = sp(tFour, 10), kFree = sp(tFree, 9), kSome = sp(tSome, 12), kWho = sp(tWho, 10);
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 150, box.x1 - box.x0 - 40, { upper: true }));
  const g = h * 0.7, px = w * 0.56, shx = w * 0.82;
  const coins = t < tSome ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tSome) * 1.1 + i / 5) % 1;
    return <circle key={i} cx={shx - (shx - px) * f} cy={g - h * 0.38 - Math.sin(f * Math.PI) * h * 0.08} r={h * 0.013} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5) * kSome} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t})`, transformOrigin: "55% 60%" }}>
        <World kind="street" tint="#8a63d2" w={w} h={h} t={t} seed="hook-street-bnpl" props={props} horizon={[{ prop: "shopfront", x: 0.12, size: 0.06 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${shx + (1 - kSome) * w * 0.3},${g - h * 0.02})`}><Shop s={h * 0.2} t={t} /></g>
          {coins}
          <g transform={`translate(${px},${g})`}><Phone s={h * 0.36} t={t} state={kFree > 0.5 ? "pressed" : undefined} /></g>
          <g transform={`translate(${px},${g - h * 0.42}) scale(${0.4 + 0.6 * kFour})`} opacity={clamp(kFour * 2)}><Split s={h * 0.14} t={t} k={kFour} /></g>
          <g transform={`translate(${w * 0.36},${g + h * 0.06})`}><Shoe s={h * 0.12} t={t} /></g>
          {kWho > 0 && <circle cx={shx} cy={g - h * 0.12} r={h * 0.16 * kWho} fill="none" stroke="#ffd84a" strokeWidth={8} opacity={0.65 * (1 - clamp((t - tWho) / 1.2))} />}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 0.95, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "someone", pose: "shrug", expression: "confused" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
