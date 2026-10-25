/**
 * Custom hook for "money that out-earns a doctor": a penthouse at night, Sharma Uncle big and
 * relaxed on the right, a tower of invested cash on the left that keeps growing by itself, gold
 * coins raining onto it. On "money" an interest notification slides in; on "doctor" a salary badge
 * drops in small next to it; on "never" a NEVER WORKS stamp slams over the stack.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { secret, toast, toastLabel, label, stack, rival, rivalLabel }, events: money, doctor, never
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import { CashStack, type Cur } from "../../studio/money";

const Toast: React.FC<{ x: number; y: number; w: number; k: number; label: string; text: string }> = ({ x, y, w, k, label, text }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * -80}px) scale(${0.85 + 0.15 * k})` }}>
    <div style={{ background: "#14171f", borderRadius: 28, padding: "16px 24px", boxShadow: "0 18px 44px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 16, border: "3px solid #2f3546" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1f9d61", flexShrink: 0 }} />
      <div style={{ fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 700, fontSize: 46, opacity: 0.8 }}>{label}</div>
        <div style={{ fontWeight: 900, fontSize: 68, color: "#7cf0b2" }}>{text}</div>
      </div>
    </div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { secret?: string; toast?: string; toastLabel?: string; label?: string; stack?: string; rival?: string; rivalLabel?: string };
  const cur = (p.tl.currency ?? "USD") as Cur;
  const sp = (start: number, damping = 10) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } });
  const tMoney = at(p, "money", 0.3), tDoctor = at(p, "doctor", 1.4), tNever = at(p, "never", 2.4);
  const kToast = sp(tMoney + 0.1, 12), kRival = sp(tDoctor, 9), kNever = sp(tNever, 8), kTag = sp(0, 12);
  const Pent = SETS.penthouse!;
  const ground = h * 0.9;
  const stackX = w * 0.28;
  const grow = 0.45 + 0.55 * clamp(t / 3.2);
  const full = h * 0.36;
  const top = ground - full * grow;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.2 + 0.03 * t}) translateX(${-t * 6}px)`, transformOrigin: "50% 60%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 28% 70%, rgba(255,200,90,0.28), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(10,10,30,0.35), rgba(0,0,0,0) 40%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <CashStack x={stackX} ground={ground} width={320} full={full} k={grow} cur={cur} textShown={false} tone="good" seed={`${p.beat.id}s`} />
        {/* notes keep landing on the stack: the money working on its own */}
        {Array.from({ length: 10 }, (_, i) => {
          const f = ((t * 0.7 + i / 10) % 1);
          const x = stackX + (random(`hk${i}`) - 0.5) * 260;
          const y = -80 + (top + 20) * f;
          const r = (random(`hr${i}`) - 0.5) * 80 + f * 200, o = clamp((1 - f) * 5) * clamp(f * 6);
          return <g key={i} transform={`translate(${x},${y}) rotate(${r})`} opacity={o}>
            <rect x={-65} y={-31} width={130} height={62} rx={6} fill="#9dc79f" stroke="#3c6b44" strokeWidth={3} />
            <circle cx={24} cy={0} r={19} fill="#efe9c8" />
          </g>;
        })}
        <Actor p={p} spec={{ who: "sharma", x: 0.72, scale: 2.1, turn: -0.3, acting: [
          { sec: 0, pose: "hips", expression: "smirk" }, { at: "doctor", pose: "pointUp", expression: "proud" }, { at: "never", pose: "thumbsUp", expression: "laugh" } ] }} ground={ground} index={0} />
      </svg>
      {/* the invested tag riding on the stack */}
      <div style={{ position: "absolute", left: stackX - 280, top: top - 180, width: 560, transform: `translateY(${(1 - kTag) * -300}px) rotate(${Math.sin(t * 2) * 2}deg)`,
        background: "#fff", borderRadius: 24, border: "7px solid #1f9d61", textAlign: "center", padding: "10px 10px 14px", fontFamily: FONT, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
        <div style={{ fontWeight: 700, fontSize: 46, color: "#495057" }}>{P.label ?? ""}</div>
        <div style={{ fontWeight: 900, fontSize: 72, color: "#1f9d61", whiteSpace: "nowrap" }}>{P.stack ?? ""}</div>
      </div>
      {/* the secret, painted over the skyline */}
      <div style={{ position: "absolute", left: w * 0.06, right: w * 0.06, top: h * 0.085, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 88,
        color: "#ffd43b", textShadow: "0 6px 0 rgba(0,0,0,0.6)" }}>{P.secret ?? ""}</div>
      {P.toast && <Toast x={w * 0.08} y={h * 0.17} w={w * 0.6} k={kToast} label={P.toastLabel ?? ""} text={P.toast} />}
      {/* the doctor's salary: smaller, and red */}
      {P.rival && (
        <div style={{ position: "absolute", left: w * 0.06, top: h * 0.29, transform: `scale(${1.8 - 0.8 * kRival}) rotate(-4deg)`, transformOrigin: "0 50%", opacity: clamp(kRival * 3),
          background: "#fff", borderRadius: 20, border: "6px solid #c92a2a", padding: "6px 22px", fontFamily: FONT, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 44, color: "#495057" }}>{P.rivalLabel ?? ""}</div>
          <div style={{ fontWeight: 900, fontSize: 64, color: "#c92a2a" }}>{P.rival}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: w * 0.5, top: h * 0.77, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kNever}) rotate(-7deg)`, opacity: clamp(kNever * 3) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color: "#fff", background: "#c92a2a", padding: "2px 30px", borderRadius: 22, border: "8px solid #fff", whiteSpace: "nowrap" }}>NEVER WORKS</div>
      </div>
      {t > tNever && <AbsoluteFill style={{ background: `rgba(255,210,80,${0.2 * Math.exp(-(t - tNever) * 5)})` }} />}
    </AbsoluteFill>
  );
};

export default Hook;
