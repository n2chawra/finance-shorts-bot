/**
 * Custom hook for "the rich never let cash sleep": a marble bank hall at night, a stack of the
 * viewer's savings asleep under a blanket on the left with Zzz drifting up, Sharma Uncle big on
 * the right with the secret. On "never" a NEVER stamp slams in; on "sleep" the Zzz burst and the
 * stack's tag swings. Built only from the studio kit (motion-direction skill).
 *
 * params: { secret, asleep, label }, events: never, sleep
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import { CashStack, type Cur } from "../../studio/money";

const Zzz: React.FC<{ x: number; y: number; t: number; boost: number }> = ({ x, y, t, boost }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const f = ((t * (0.55 + boost * 0.6) + i * 0.25) % 1);
      const s = 50 + 40 * f + boost * 30;
      return (
        <text key={i} x={x + Math.sin((f + i) * 4) * 40 + f * 90} y={y - f * 360} fontFamily={FONT} fontWeight={900}
          fontSize={s} fill="#cfe3ff" stroke="#1b2a4a" strokeWidth={6} paintOrder="stroke" opacity={clamp((1 - f) * 2.5)}>Z</text>
      );
    })}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { secret?: string; asleep?: string; label?: string };
  const cur = (p.tl.currency ?? "USD") as Cur;
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tNever = at(p, "never", 0.7), tSleep = at(p, "sleep", 1.6);
  const kNever = sp(tNever, 8), kTag = sp(-0.3, 12), kSleep = sp(tSleep, 7);
  const Bank = SETS.bank!;
  const ground = h * 0.9;
  const stackX = w * 0.27;
  const breathe = 1 + 0.025 * Math.sin(t * 2.4);
  const swing = Math.sin(t * 2) * 3 + (t > tSleep ? Math.sin((t - tSleep) * 14) * 8 * Math.exp(-(t - tSleep) * 3) : 0);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.18 + 0.025 * t})`, transformOrigin: "50% 60%" }}>
        <Bank.back w={w} h={h} t={t} seed={`${p.beat.id}b`} />
      </AbsoluteFill>
      {/* night: a cool wash on the sleeping side, a warm spot on Sharma */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,30,80,0.55), rgba(20,30,80,0.1) 55%, rgba(255,190,90,0.12))" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${stackX},${ground}) scale(1,${breathe}) translate(${-stackX},${-ground})`}>
          <CashStack x={stackX} ground={ground} width={300} full={h * 0.3} k={1} cur={cur} textShown={false} tone="bad" seed={`${p.beat.id}s`} />
          {/* the blanket over the stack */}
          <path d={`M ${stackX - 200} ${ground - h * 0.27} Q ${stackX} ${ground - h * 0.33} ${stackX + 200} ${ground - h * 0.27} L ${stackX + 215} ${ground - h * 0.12} Q ${stackX} ${ground - h * 0.1} ${stackX - 215} ${ground - h * 0.12} Z`}
            fill="#4c6ef5" stroke="#fff" strokeWidth={6} opacity={0.92} />
          <path d={`M ${stackX - 190} ${ground - h * 0.22} Q ${stackX} ${ground - h * 0.25} ${stackX + 190} ${ground - h * 0.22}`} stroke="#91a7ff" strokeWidth={14} fill="none" />
        </g>
        <Zzz x={stackX + 60} y={ground - h * 0.34} t={t} boost={clamp(kSleep)} />
        <Actor p={p} spec={{ who: "sharma", x: 0.7, scale: 2.1, turn: -0.3, acting: [
          { sec: 0, pose: "pointUp", expression: "smirk" }, { at: "never", pose: "point", expression: "proud" }, { at: "sleep", pose: "hips", expression: "laugh" } ] }} ground={ground} index={0} />
      </svg>
      {/* the savings tag hanging over the sleeping stack */}
      <div style={{ position: "absolute", left: stackX - 230, top: h * 0.3, width: 460, transform: `translateY(${(1 - kTag) * -400}px) rotate(${swing}deg)`, transformOrigin: "50% -60px",
        background: "#fff", borderRadius: 24, border: "7px solid #1b2a4a", textAlign: "center", padding: "12px 10px 16px", fontFamily: FONT, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ fontWeight: 700, fontSize: 48, color: "#495057" }}>{P.label ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 96, color: "#e03131" }}>{P.asleep ?? ""}</div>
      </div>
      {/* the secret, painted over the hall */}
      <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.1, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 92,
        color: "#ffd43b", textShadow: "0 6px 0 rgba(0,0,0,0.55)", opacity: 1 }}>{P.secret ?? ""}</div>
      <div style={{ position: "absolute", left: w * 0.72, top: h * 0.27, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kNever}) rotate(6deg)`, opacity: clamp(kNever * 3) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#fff", background: "#c92a2a", padding: "2px 40px", borderRadius: 22, border: "8px solid #fff" }}>NEVER</div>
      </div>
      {t > tNever && <AbsoluteFill style={{ background: `rgba(255,80,80,${0.22 * Math.exp(-(t - tNever) * 5)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
