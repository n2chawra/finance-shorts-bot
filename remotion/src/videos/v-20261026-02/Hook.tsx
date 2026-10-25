/**
 * Custom hook for "same job, same salary: which saver are you?": three coworkers side by side in
 * the office at dusk (Rohan, Priya, Sharma Uncle), a salary banner over them all. On "salary" each
 * gets a badge with how much of it they save; on "years" a spotlight starts sweeping along the
 * row, and on "millionaire" it stops on one of them with a gold flash while the others dim.
 * Built only from the studio kit (motion-direction skill).
 *
 * params: { salary, salaryLabel, rates: [three placeholders], rateLabel }, events: job, salary, years, millionaire
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";

const XS = [0.2, 0.5, 0.8];
const TONES = ["#e03131", "#f08c00", "#1f9d61"];

const Badge: React.FC<{ x: number; y: number; k: number; rate: string; label: string; color: string }> = ({ x, y, k, rate, label, color }) => (
  <div style={{ position: "absolute", left: x - 150, top: y, width: 300, textAlign: "center", opacity: clamp(k * 3),
    transform: `translateY(${(1 - k) * -120}px) scale(${0.7 + 0.3 * k})` }}>
    <div style={{ display: "inline-block", background: "#fff", border: `7px solid ${color}`, borderRadius: 24, padding: "4px 18px 8px", fontFamily: FONT, boxShadow: "0 14px 30px rgba(0,0,0,0.4)" }}>
      <div style={{ fontWeight: 900, fontSize: 80, color, lineHeight: 1.05 }}>{rate}</div>
      <div style={{ fontWeight: 700, fontSize: 44, color: "#495057" }}>{label}</div>
    </div>
  </div>
);

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { salary?: string; salaryLabel?: string; rates?: string[]; rateLabel?: string };
  const sp = (start: number, damping = 11) => t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } });
  const tSal = at(p, "salary", 0.9), tYears = at(p, "years", 2.2), tMil = at(p, "millionaire", 3.6);
  const kBanner = 1;
  const Office = SETS.office!;
  const ground = h * 0.9;
  // the spotlight sweeps the row from "years", then settles on the third coworker at "millionaire"
  const sweep = t < tYears ? -1 : t < tMil ? 0.5 + 0.38 * Math.sin((t - tYears) * 5) : XS[2]! + (0.5 + 0.38 * Math.sin((tMil - tYears) * 5) - XS[2]!) * Math.exp(-(t - tMil) * 7);
  const lit = t >= tYears;
  const kMil = sp(tMil, 8);
  const rates = P.rates ?? [];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 + 0.02 * t})`, transformOrigin: "50% 65%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
      </AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {(["rohan", "priya", "sharma"] as const).map((who, i) => (
          <Actor key={who} p={p} spec={{ who, x: XS[i]!, scale: 1.8, turn: i === 0 ? 0.2 : i === 2 ? -0.2 : 0, acting: i === 0
            ? [{ sec: 0, pose: "phone", prop: "phone", expression: "happy" }, { at: "millionaire", pose: "shrug", expression: "confused" }]
            : i === 1 ? [{ sec: 0, pose: "think", expression: "thinking" }, { at: "millionaire", pose: "point", expression: "shock" }]
            : [{ sec: 0, pose: "hips", expression: "neutral" }, { at: "millionaire", pose: "celebrate", expression: "laugh" }] }} ground={ground} index={i} />
        ))}
      </svg>
      {/* the spotlight: dark everywhere except a cone on one coworker */}
      {lit && (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse ${w * 0.26}px ${h * 0.42}px at ${sweep * 100}% 66%, rgba(255,240,180,0.18), rgba(0,0,0,0.62))` }} />
      )}
      {/* the shared salary banner */}
      <div style={{ position: "absolute", left: w * 0.08, right: w * 0.08, top: h * 0.08, textAlign: "center", opacity: clamp(kBanner * 2),
        transform: `translateY(${(1 - kBanner) * -150}px)` }}>
        <div style={{ display: "inline-block", background: "#1d2130", borderRadius: 30, padding: "12px 40px", border: "6px solid #ffd43b", fontFamily: FONT, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 700, fontSize: 52, color: "#ced4da" }}>{P.salaryLabel ?? ""}</div>
          <div style={{ fontWeight: 900, fontSize: 110, color: "#ffd43b", lineHeight: 1.05 }}>{P.salary ?? ""}</div>
        </div>
      </div>
      {rates.slice(0, 3).map((r, i) => (
        <Badge key={i} x={w * XS[i]!} y={h * 0.3} k={sp(tSal + i * 0.18, 10)} rate={r} label={P.rateLabel ?? ""} color={TONES[i]!} />
      ))}
      {/* the gold flash and a crown on the one who saves the most */}
      {t > tMil && <AbsoluteFill style={{ background: `rgba(255,212,59,${0.3 * Math.exp(-(t - tMil) * 5)})` }} />}
      <svg width={w} height={h} style={{ position: "absolute", opacity: clamp(kMil * 3) }}>
        <g transform={`translate(${w * XS[2]!},${h * 0.5 - (1 - kMil) * 200}) scale(${0.6 + 0.4 * kMil}) rotate(${Math.sin(t * 3) * 5})`}>
          <path d="M -90 40 L -110 -50 L -50 0 L 0 -70 L 50 0 L 110 -50 L 90 40 Z" fill="#ffd43b" stroke="#7a5a00" strokeWidth={8} strokeLinejoin="round" />
          <circle cx={0} cy={-70} r={14} fill="#fff3bf" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export default Hook;
