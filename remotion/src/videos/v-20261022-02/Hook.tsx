/**
 * Custom hook for "guess the number": a game-show board lights up over an office at dusk. The monthly
 * amount and the years flip in as they are spoken, a huge question mark spins in the answer slot,
 * bulbs chase round the board, a countdown ring drains, and Rohan below thinks hard.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { amount, per, years, ask }, events: years, guess
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { amount?: string; per?: string; years?: string; ask?: string };
  const sp = (start: number, damping = 11) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tYears = at(p, "years", 1.0), tGuess = at(p, "guess", 1.6);
  const kBoard = sp(-0.5, 14);
  const kAmt = sp(-0.3, 10), kYrs = sp(-0.2, 10), kAsk = sp(tGuess, 8);
  const Office = SETS.office!;
  const bx = w * 0.07, by = h * 0.1, bw = w * 0.86, bh = h * 0.3;
  const bulbs = 22;
  const ring = clamp(1 - t / 3.2);
  const qRot = Math.sin(t * 3) * 10;
  const qScale = 1 + 0.08 * Math.sin(t * 6) + 0.3 * kAsk * Math.exp(-(t - tGuess) * 4);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.2 + 0.03 * t})`, transformOrigin: "50% 70%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
      </AbsoluteFill>
      {/* spotlight on the board */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 28%, rgba(255,240,180,0.25), rgba(0,0,0,0.35) 70%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <Actor p={p} spec={{ who: "rohan", x: 0.5, scale: 1.6, acting: [
          { sec: 0, pose: "think", expression: "thinking" },
          { at: "guess", pose: "shrug", expression: "confused" } ] }} ground={h * 0.97} index={0} />
      </svg>
      <div style={{ position: "absolute", left: bx, top: by, width: bw, height: bh, transform: `translateY(${(1 - kBoard) * -600}px)`,
        background: "linear-gradient(180deg,#2a1a5e,#130b33)", borderRadius: 40, border: "10px solid #ffd43b",
        boxShadow: "0 30px 60px rgba(0,0,0,0.55), inset 0 0 60px rgba(120,80,255,0.35)" }}>
        {/* chasing bulbs */}
        <svg width={bw} height={bh} style={{ position: "absolute", left: -10, top: -10 }}>
          {Array.from({ length: bulbs }, (_, i) => {
            const f = i / bulbs, per = 2 * (bw + bh);
            let d = f * per, x = 0, y = 0;
            if (d < bw) { x = d; y = 0; } else if ((d -= bw) < bh) { x = bw; y = d; } else if ((d -= bh) < bw) { x = bw - d; y = bh; } else { d -= bw; x = 0; y = bh - d; }
            const on = (Math.floor(t * 8) + i) % 3 === 0;
            return <circle key={i} cx={x + 10} cy={y + 10} r={11} fill={on ? "#fff6c2" : "#a07d1c"} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center", fontFamily: FONT, color: "#fff" }}>
          <div style={{ display: "inline-block", transform: `scale(${kAmt})`, background: "#3156d3", borderRadius: 24, padding: "8px 34px" }}>
            <span style={{ fontWeight: 900, fontSize: 120 }}>{P.amount ?? ""}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 56, marginTop: 6, opacity: clamp(kAmt) }}>{P.per ?? ""}</div>
          <div style={{ display: "inline-block", marginTop: 10, transform: `rotateX(${(1 - kYrs) * 90}deg) scale(${1 + (t > tYears ? 0.18 * Math.exp(-(t - tYears) * 5) : 0)})`, background: "#1f9d61", borderRadius: 24, padding: "4px 34px" }}>
            <span style={{ fontWeight: 900, fontSize: 84 }}>{P.years ?? ""}</span>
          </div>
        </div>
      </div>
      {/* the answer slot: a spinning question mark inside a draining countdown ring */}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.78},${by + bh + 40})`}>
          <circle r={118} fill="#130b33" stroke="#ffd43b" strokeWidth={8} />
          <circle r={104} fill="none" stroke="#e03131" strokeWidth={16} strokeDasharray={2 * Math.PI * 104}
            strokeDashoffset={2 * Math.PI * 104 * (1 - ring)} transform="rotate(-90)" strokeLinecap="round" />
          <text transform={`rotate(${qRot}) scale(${qScale})`} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill="#ffd43b">?</text>
        </g>
      </svg>
      {kAsk > 0 && (
        <div style={{ position: "absolute", left: w * 0.06, top: by + bh + 30, transform: `scale(${kAsk}) rotate(-4deg)`, transformOrigin: "0 50%",
          fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#fff", background: "#e03131", borderRadius: 26, padding: "4px 30px", border: "7px solid #fff" }}>{P.ask ?? ""}</div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
