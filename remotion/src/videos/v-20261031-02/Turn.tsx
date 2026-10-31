/**
 * The turn: "Gladly. The interest is my cost, the growth is my profit. Good debt buys something
 * that earns more than the loan costs."
 * Sharma in the penthouse beside a big balance. On "cost" the interest card drops into the left
 * pan; on "growth" the gains card drops into the right pan and the beam tips its way; on "earns"
 * the office block behind lights up floor by floor and a green arrow shoots up.
 *
 * params: { cost: "{loan_interest}", gain: "{asset_gains}", costLabel, gainLabel },
 * events: gladly, cost, growth, profit, good, earns
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Offices = props.offices!, Up = props.uparrow!;

const Card: React.FC<{ label: string; value: string; color: string; w: number; h: number; k: number }> = ({ label, value, color, w, h, k }) => {
  const maxW = w * 0.34;
  const small = Math.max(minText(w, h), fitLine(label.toUpperCase(), 46, maxW, { upper: true }));
  const big = Math.max(minText(w, h), fitLine(value, 76, maxW));
  return (
    <div style={{ transform: `scale(${k})`, textAlign: "center", background: "#fff", border: `6px solid ${color}`, borderRadius: 20, padding: "4px 18px", boxShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: small, color: "#3f4656", whiteSpace: "nowrap" }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: big, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
};

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { cost?: string; gain?: string; costLabel?: string; gainLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCost = at(p, "cost", 1.2), tGrowth = at(p, "growth", 2.2), tEarns = at(p, "earns", 4.4);
  const kCost = sp(tCost, 9), kGain = sp(tGrowth, 9), kUp = sp(tEarns, 8);
  const tilt = -6 * kCost + 14 * ease((t - tGrowth) / 0.8);
  const Pent = SETS.penthouse!;
  const cx = w * 0.5, cy = h * 0.3, arm = w * 0.3;
  const lx = cx - Math.cos((tilt * Math.PI) / 180) * arm, ly = cy - Math.sin((tilt * Math.PI) / 180) * arm;
  const rx = cx + Math.cos((tilt * Math.PI) / 180) * arm, ry = cy + Math.sin((tilt * Math.PI) / 180) * arm;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.06 - 0.04 * clamp((t - tEarns) / 1.0)})`, transformOrigin: "50% 45%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "rgba(0,20,40,0.3)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.18},${h * 0.66})`}><Offices s={h * 0.16} t={t} k={t > tEarns ? 1 : 0.25} /></g>
          {kUp > 0 && <g transform={`translate(${w * 0.18},${h * 0.44 - kUp * h * 0.04}) scale(${kUp})`}><Up s={h * 0.09} t={t} /></g>}
          {/* the balance: post, beam, two pans */}
          <rect x={cx - 10} y={cy} width={20} height={h * 0.3} fill="#c9a24a" stroke={INK} strokeWidth={5} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#c9a24a" strokeWidth={18} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={18} fill="#f2b631" stroke={INK} strokeWidth={5} />
          <Actor p={p} spec={{ who: "sharma", x: 0.72, scale: 0.95, acting: [{ sec: 0, pose: "hips", expression: "proud" }, { at: "growth", pose: "point", expression: "smirk" }, { at: "earns", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.74} index={0} />
        </svg>
      </AbsoluteFill>
      {P.cost && kCost > 0 && <div style={{ position: "absolute", left: lx, top: ly + 20, transform: "translate(-50%,0)" }}>
        <Card label={P.costLabel ?? ""} value={P.cost} color="#e5484d" w={w} h={h} k={kCost} /></div>}
      {P.gain && kGain > 0 && <div style={{ position: "absolute", left: rx, top: ry + 20, transform: "translate(-50%,0)" }}>
        <Card label={P.gainLabel ?? ""} value={P.gain} color="#1f8f55" w={w} h={h} k={kGain} /></div>}
    </AbsoluteFill>
  );
};

export default Turn;
