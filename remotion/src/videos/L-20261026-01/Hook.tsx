/**
 * Hook: "Rohan earns {salary_income}, and the tax man takes {salary_tax}. Sharma's shares grew
 * {growth_gains} this year. His tax on that? Nothing. And it's all legal."
 * A split frame at dusk: on the left Rohan's payslip, the tax tin biting a chunk out of it on
 * "takes" (coins fly into the tin); on the right Sharma on a tower of share certificates that
 * shoots up on "grew", while his tax tin rattles empty and NOTHING stamps on it; LEGAL stamps last.
 *
 * params: { paid: "{salary_tax}", grew: "{growth_gains}", nothing: "Nothing", legal: "All legal" }
 * events: earns, takes, shares, grew, nothing, legal
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Payslip = props.payslip!, Tin = props.taxtin!, Certs = props.certificates!;

const Tag: React.FC<{ x: number; y: number; label: string; value: string; color: string; k: number }> = ({ x, y, label, value, color, k }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), textAlign: "center",
    background: "#fff", border: `6px solid ${color}`, borderRadius: 22, padding: "6px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#3f4656", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

const Stamp: React.FC<{ text: string; bg: string; k: number; x: number; y: number; rot: number }> = ({ text, bg, k, x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${2.2 - 1.2 * k}) rotate(${rot}deg)`, opacity: clamp(k * 3) }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 80, color: "#fff", background: bg, padding: "4px 34px", borderRadius: 22,
      border: "7px solid #fff", boxShadow: "0 12px 0 rgba(0,0,0,0.45)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{text}</div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { paid?: string; grew?: string; nothing?: string; legal?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTakes = at(p, "takes", 1.6), tShares = at(p, "shares", 3.4), tGrew = at(p, "grew", 4.0), tNothing = at(p, "nothing", 6.5), tLegal = at(p, "legal", 8.0);
  const kTake = sp(tTakes), kGrew = clamp((t - tGrew) / 1.2), kNothing = sp(tNothing, 9), kLegal = sp(tLegal, 9);
  const ground = h * 0.84;
  // coins from the payslip to the tin, once the tin bites
  const coins = [0, 1, 2, 3, 4].map((i) => {
    const d = clamp((t - tTakes - i * 0.12) / 0.6);
    if (d <= 0 || d >= 1) return null;
    const x = w * (0.2 + 0.14 * d), y = ground - h * 0.3 - Math.sin(d * Math.PI) * h * 0.16 + d * h * 0.12;
    return <circle key={i} cx={x} cy={y} r={18} fill="#f2b631" stroke="#1d2433" strokeWidth={4} />;
  });
  const rattle = t > tNothing ? Math.sin(t * 40) * 6 * Math.max(0, 1 - (t - tNothing) / 0.8) : 0;
  const half = (left: boolean, node: React.ReactNode) => (
    <AbsoluteFill style={{ clipPath: left ? "polygon(0 0, 51% 0, 49% 100%, 0 100%)" : "polygon(51% 0, 100% 0, 100% 100%, 49% 100%)" }}>{node}</AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${1.02 + 0.012 * t})` }}>
      {half(true, <>
        <World kind="street" w={w} h={h} t={t} seed="hook-street" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.2},${ground - h * 0.08}) rotate(${-kTake * 4})`}><Payslip s={h * 0.3} t={t} state={t > tTakes ? "bitten" : undefined} /></g>
          <g transform={`translate(${w * 0.36},${ground}) scale(${1 + 0.15 * kTake})`}><Tin s={h * 0.2} t={t} state={t > tTakes + 0.6 ? "full" : undefined} /></g>
          {coins}
          <Actor p={p} spec={{ who: "rohan", x: 0.13, scale: 1.1, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "takes", pose: "worried", expression: "shock" }] }} ground={h * 0.98} index={0} />
        </svg>
      </>)}
      {half(false, <>
        <World kind="night" tint={kGrew > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="hook-night" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.66},${ground})`}><Certs s={h * (0.34 + 0.22 * kGrew)} t={t} k={0.4 + 0.6 * kGrew} /></g>
          <g transform={`translate(${w * 0.88 + rattle},${ground})`}><Tin s={h * 0.16} t={t} state={t > tNothing ? "empty" : undefined} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.56, scale: 1.1, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "grew", pose: "celebrate", expression: "laugh" }, { at: "legal", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.98} index={1} />
        </svg>
      </>)}
      <svg width={w} height={h} style={{ position: "absolute" }}><line x1={w * 0.51} y1={0} x2={w * 0.49} y2={h} stroke="#fff" strokeWidth={12} /></svg>
      {P.paid && <Tag x={w * 0.27} y={h * 0.1} label="Rohan's tax" value={P.paid} color="#c92a2a" k={kTake} />}
      {P.grew && <Tag x={w * 0.72} y={h * 0.1} label="Sharma's gain" value={P.grew} color="#1f8f55" k={1.25} />}
      {P.nothing && <Stamp text={P.nothing} bg="#a3171c" k={kNothing} x={w * 0.8} y={h * 0.42} rot={-6} />}
      {P.legal && <Stamp text={P.legal} bg="#24315e" k={kLegal} x={w * 0.5} y={h * 0.6} rot={3} />}
    </AbsoluteFill>
  );
};

export default Hook;
