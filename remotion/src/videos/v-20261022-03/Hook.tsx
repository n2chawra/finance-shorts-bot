/**
 * Custom hook for the Diwali bonus rich vs poor: a night market under fireworks, one bonus envelope
 * glowing above two men. On "Poor" its notes fly left into Rohan's shopping bags; on "Rich" they fly
 * right and land as a stack beside Sharma Uncle. POOR and RICH stamp in as they are named.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { poor, rich, bonus, label }, events: poor, rich, same
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import { CashStack, MoneyFlow, type Cur } from "../../studio/money";

const Burst: React.FC<{ x: number; y: number; t: number; start: number; color: string; r: number; seed: string }> = ({ x, y, t, start, color, r, seed }) => {
  const f = ((t - start) % 1.8) / 1.8;
  if (t < start) return null;
  return (
    <g opacity={1 - f}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + random(`${seed}${i}`) * 0.2;
        const d = r * Math.sqrt(f);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d + f * f * 40} r={7 * (1 - f) + 2} fill={color} />;
      })}
    </g>
  );
};

const Bag: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -40 -50 Q 0 -100 40 -50" fill="none" stroke="#3a2a1a" strokeWidth={8} />
    <rect x={-60} y={-50} width={120} height={110} rx={10} fill={color} stroke="#fff" strokeWidth={5} />
  </g>
);

const Stamp: React.FC<{ text: string; bg: string; k: number; x: number; y: number; rot: number }> = ({ text, bg, k, x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${2 - k}) rotate(${rot}deg)`, opacity: clamp(k * 3) }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 100, color: "#fff", background: bg, padding: "4px 36px", borderRadius: 24, border: "8px solid #fff" }}>{text}</div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { poor?: string; rich?: string; bonus?: string; label?: string };
  const cur = (p.tl.currency ?? "INR") as Cur;
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const tPoor = at(p, "poor", 0.2), tRich = at(p, "rich", 1.6), tSame = at(p, "same", 2.2);
  const kEnv = sp(-0.5, 12), kPoor = sp(tPoor, 9), kRich = sp(tRich, 9);
  const kStack = clamp((t - tRich - 0.5) / 1.2);
  const Market = SETS.market!;
  const ground = h * 0.93;
  const env = { x: w * 0.5, y: h * 0.17 };
  const glow = 0.6 + 0.4 * Math.sin(t * 5);
  const bagPop = (i: number) => clamp((t - tPoor - 0.5 - i * 0.25) / 0.3);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.22 + 0.03 * t})`, transformOrigin: "50% 65%" }}>
        <Market.back w={w} h={h} t={t} seed={`${p.beat.id}m`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,5,40,0.55), rgba(10,5,40,0) 45%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <Burst x={w * 0.2} y={h * 0.1} t={t} start={0} color="#ffd43b" r={170} seed="a" />
        <Burst x={w * 0.82} y={h * 0.08} t={t} start={0.6} color="#ff6b9a" r={150} seed="b" />
        <Burst x={w * 0.6} y={h * 0.04} t={t} start={1.2} color="#7cf0b2" r={130} seed="c" />
        <Actor p={p} spec={{ who: "rohan", x: 0.26, scale: 2.0, turn: 0.3, acting: [
          { sec: 0, pose: "celebrate", expression: "laugh" }, { at: "poor", pose: "phone", prop: "phone", expression: "happy" } ] }} ground={ground} index={0} />
        <Actor p={p} spec={{ who: "sharma", x: 0.72, scale: 2.0, turn: -0.3, acting: [
          { sec: 0, pose: "hips", expression: "smirk" }, { at: "rich", pose: "thumbsUp", expression: "proud" } ] }} ground={ground} index={1} />
        {[0, 1, 2].map((i) => bagPop(i) > 0 && <Bag key={i} x={w * (0.08 + i * 0.1)} y={ground - 60} s={0.9 * bagPop(i)} color={["#e03131", "#f59f00", "#ae3ec9"][i]!} />)}
        <CashStack x={w * 0.9} ground={ground} width={150} full={h * 0.3} k={kStack} cur={cur} textShown={false} tone="good" seed={`${p.beat.id}s`} />
        <MoneyFlow from={[env.x, env.y + 80]} to={[w * 0.16, ground - 120]} t={t} start={tPoor + 0.2} dur={1.4} n={10} cur={cur} nw={240} lift={160} seed={`${p.beat.id}l`} />
        <MoneyFlow from={[env.x, env.y + 80]} to={[w * 0.9, ground - 200]} t={t} start={tRich + 0.2} dur={1.4} n={10} cur={cur} nw={240} lift={160} seed={`${p.beat.id}r`} />
      </svg>
      {/* the bonus envelope */}
      <div style={{ position: "absolute", left: env.x - w * 0.3, top: env.y - 120, width: w * 0.6, transform: `translateY(${(1 - kEnv) * -500}px) rotate(${Math.sin(t * 2) * 2}deg)`,
        background: "linear-gradient(180deg,#ffb703,#fb8500)", borderRadius: 28, border: "8px solid #fff7d6", textAlign: "center", padding: "18px 10px 22px",
        boxShadow: `0 0 ${60 * glow}px rgba(255,200,80,0.9), 0 20px 40px rgba(0,0,0,0.45)`, fontFamily: FONT }}>
        <div style={{ fontWeight: 800, fontSize: 56, color: "#5a1e00" }}>{P.label ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 110, color: "#fff", textShadow: "0 6px 0 rgba(90,30,0,0.5)" }}>{P.bonus ?? ""}</div>
      </div>
      <Stamp text={P.poor ?? "Poor"} bg="#c92a2a" k={kPoor} x={w * 0.27} y={h * 0.3} rot={-5} />
      <Stamp text={P.rich ?? "Rich"} bg="#1f8f55" k={kRich} x={w * 0.7} y={h * 0.3} rot={4} />
      {/* both sides light up with the same amount */}
      {t > tSame && <AbsoluteFill style={{ background: `rgba(255,230,150,${0.25 * Math.exp(-(t - tSame) * 4)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
