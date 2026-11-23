// Choice: "Your body or the instruments: which would you trust in cloud?"
// A cockpit panel split in two: the left card lights, a head with a level arrow, FEELS LEVEL ("body"); the right
// card lights, the attitude indicator banked left ("instruments"); a question mark drops between them ("which");
// both cards pulse ("trust").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ANTON, Attitude, CREAM, Flat, k01, MONO, SKY, sm } from "./World";

const Card: React.FC<{ x: number; on: number; title: string; sub: string; color: string; pulse: number }> = ({ x, on, title, sub, color, pulse }) => (
  <div style={{ position: "absolute", left: x, top: 430, width: 430, height: 760, borderRadius: 26, background: "rgba(12,16,20,0.85)",
    border: `6px solid ${on > 0.5 ? color : "#4a525b"}`, transform: `scale(${1 + 0.03 * pulse})`, boxShadow: on > 0.5 ? `0 0 40px ${color}55` : "none" }}>
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", fontFamily: ANTON, fontSize: 72, color: on > 0.5 ? color : "#8a929b" }}>{title}</div>
    <div style={{ position: "absolute", top: 660, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 2, color: CREAM }}>{sub}</div>
  </div>
);

const Choice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const body = m.at("body", 2), inst = m.at("instruments", 25), which = m.at("which", 40), trust = m.at("trust", 55);
  const pulse = t >= trust ? Math.max(0, Math.sin((t - trust) * 0.3)) : 0;
  const q = sm((t - which) / 10);
  const bOn = k01((t - body) / 6), iOn = k01((t - inst) / 6);
  return (
    <Flat t={t} tag="">
      {/* the windscreen: grey cloud sliding past, the frame posts; below, the instrument panel */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420, background: "linear-gradient(180deg,#8d969f,#6c757e)" }} />
      <div style={{ position: "absolute", left: -200 + ((t * 3) % 200), top: 60, width: 1500, height: 360, background: "radial-gradient(ellipse at 30% 50%, rgba(235,240,245,0.55), rgba(235,240,245,0) 60%), radial-gradient(ellipse at 75% 40%, rgba(220,226,232,0.5), rgba(220,226,232,0) 55%)" }} />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M0,0 L180,0 L120,420 L0,420 Z M1080,0 L900,0 L960,420 L1080,420 Z M500,0 L580,0 L560,420 L520,420 Z" fill="#1c2026" />
        <path d="M0,390 Q540,330 1080,390 L1080,1920 L0,1920 Z" fill="#23282e" />
        <path d="M0,390 Q540,330 1080,390 L1080,420 Q540,362 0,420 Z" fill="#111418" />
        {[150, 300, 780, 930].map((x) => <circle key={x} cx={x} cy={1290} r={34} fill="#15181c" stroke="#5a626b" strokeWidth={5} />)}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={200 + i * 88} y={1240} width={56} height={26} rx={5} fill={i % 3 === 0 ? "#3a4a2e" : "#2f353c"} />)}
      </svg>
      <Card x={60} on={bOn} title="YOUR BODY" sub="FEELS LEVEL" color={SKY} pulse={pulse} />
      <Card x={590} on={iOn} title="INSTRUMENTS" sub="BANKED LEFT" color={AMBER} pulse={pulse} />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* the body card: a head, a level arrow over it */}
        <g opacity={0.4 + 0.6 * bOn}>
          <circle cx={275} cy={700} r={120} fill="#2a333c" stroke={CREAM} strokeWidth={6} />
          <path d="M215,840 Q275,790 335,840 L360,960 L190,960 Z" fill="#2a333c" stroke={CREAM} strokeWidth={6} />
          <line x1={140} y1={540} x2={410} y2={540} stroke={SKY} strokeWidth={12} strokeLinecap="round" />
          <circle cx={275} cy={540} r={14} fill={SKY} />
        </g>
      </svg>
      <div style={{ opacity: 0.4 + 0.6 * iOn }}><Attitude cx={805} cy={760} r={170} bank={28} ring={AMBER} id="choice" /></div>
      {q > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1210 - 160 * (1 - q), textAlign: "center", fontFamily: ANTON, fontSize: 150, color: CREAM, opacity: q, textShadow: "0 8px 30px rgba(0,0,0,0.7)" }}>?</div>
      ) : null}
    </Flat>
  );
};
export default Choice;
