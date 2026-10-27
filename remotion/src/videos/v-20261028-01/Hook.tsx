/**
 * Hook: "Payday! {tax_amount} on my payslip!"
 * Rohan's rented flat at night, Rohan big and celebrating, a fat pay envelope on the table. On
 * "payday" the PAYDAY banner drops, on "landed" the envelope bursts open and notes fly up around
 * the month's pay figure, on "rich" five red bite marks start circling the envelope: what's coming.
 *
 * params: { pay: "{tax_amount}" }, events: payday, landed, rich
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { Note } from "../../studio/money";
import { SETS } from "../../studio/sets";
import props from "./props";

const Payslip = props.payslip!, Taxbill = props.taxbill!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { pay?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 160, mass: 0.8 } }));
  const tPay = at(p, "payday", 0.2), tLand = at(p, "landed", 1.2), tRich = at(p, "rich", 2.2);
  const kBanner = sp(tPay, 10), kFig = sp(tLand, 9), kBites = clamp((t - tRich) / 0.5);
  const burst = clamp((t - tLand) / 1.4);
  const Flat = SETS.flat!;
  const push = 1.04 + 0.025 * t;
  const env: [number, number] = [w * 0.72, h * 0.8];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "55% 65%" }}>
        <Flat.back w={w} h={h} t={t} seed={`${p.beat.id}f`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 70%, rgba(255,220,120,0.28), rgba(10,20,40,0.35) 70%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {/* the table */}
          <path d={`M${w * 0.46},${h * 0.8} L${w * 1.02},${h * 0.8} L${w * 1.02},${h * 0.84} L${w * 0.46},${h * 0.84} Z`} fill="#8a5a2b" stroke="#1d2433" strokeWidth={8} />
          <g transform={`translate(${env[0]},${env[1]}) scale(${1 + 0.12 * kFig * Math.exp(-(t - tLand) * 2.5)})`}>
            <Payslip s={h * 0.17} t={t} state={t >= tLand ? "open" : undefined} />
          </g>
          {burst > 0 && Array.from({ length: 9 }, (_, i) => {
            const a = -Math.PI / 2 + (i - 4) * 0.28, d = h * (0.12 + 0.28 * burst) * (0.7 + (i % 3) * 0.2);
            return <Note key={i} cur={p.tl.currency} nw={w * 0.16} rot={(i * 41) % 70 - 35 + t * 40 * (i % 2 ? 1 : -1)}
              x={env[0] + Math.cos(a) * d * 0.9} y={env[1] - h * 0.12 + Math.sin(a) * d + burst * burst * h * 0.08} opacity={1 - burst * 0.4} />;
          })}
          {kBites > 0 && Array.from({ length: 5 }, (_, i) => {
            const a = t * 1.3 + (i / 5) * Math.PI * 2;
            return <g key={`b${i}`} transform={`translate(${env[0] + Math.cos(a) * w * 0.22},${env[1] - h * 0.12 + Math.sin(a) * h * 0.08}) scale(${kBites})`} opacity={0.9}>
              <Taxbill s={h * 0.06} t={t} k={0.8} />
            </g>;
          })}
          <Actor p={p} spec={{ who: "rohan", x: 0.26, scale: 1.3, acting: [{ sec: 0, pose: "phone", expression: "shock", prop: "phone" }, { at: "landed", pose: "celebrate", expression: "laugh" }, { at: "rich", pose: "thumbsUp", expression: "proud" }] }} ground={h * 1.06} index={0} />
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, textAlign: "center", transform: `translateY(${(1 - kBanner) * -h * 0.15}px) rotate(-4deg)`, opacity: clamp(kBanner * 2) }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 104, color: "#fff", background: "#2fb37a", padding: "4px 40px", borderRadius: 26,
          border: "8px solid #1d2433", boxShadow: "0 14px 0 #1d2433" }}>PAYDAY</span>
      </div>
      {P.pay && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.22, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))", display: "inline-block", transform: `scale(${0.85 + 0.15 * clamp(kFig + (t < tLand ? 1 : 0)) + 0.2 * kFig * Math.exp(-(t - tLand) * 3)})` }}>{P.pay}</span>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff", textShadow: "0 4px 0 #1d2433" }}>THIS MONTH</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
