// Board: "Why it stuck isn't known yet. The fast hit or the slow capsize: which surprised you more?"
// The investigators' preliminary board: it slides in with PRELIMINARY stamped at the top ("stuck"); CAUSE OF
// THE JAM: UNDER INVESTIGATION types on ("known"); the FAST HIT card lights with its clock ("fast"); the SLOW
// CAPSIZE card lights with its clock ("slow"); a red question mark lands between them ("which"); the two
// clocks pulse ("more").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { AMBER, ANTON, CREAM, Flat, MONO, RED } from "./World";

type Params = { fig?: { minutes?: string; capsize?: string } };

const Card: React.FC<{ x: number; y: number; on: number; title: string; color: string; draw: React.ReactNode }> = ({ x, y, on, title, color, draw }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 400, height: 380, borderRadius: 16, background: "rgba(16,22,30,0.92)",
    border: `5px solid ${on > 0 ? color : "rgba(244,239,231,0.25)"}`, boxShadow: on > 0 ? `0 0 ${40 * on}px ${color}` : "none", transform: `scale(${1 + 0.05 * on})` }}>
    <svg viewBox="0 0 400 260" width={400} height={260} style={{ display: "block" }}>{draw}</svg>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 2, color: on > 0 ? color : CREAM, textAlign: "center", lineHeight: 1.1 }}>{title}</div>
  </div>
);

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const known = m.at("known", 16), rudder = m.at("fast", 40), current = m.at("slow", 56), which = m.at("which", 70), stop = m.at("more", 100);
  const slide = m.lerp([0, 12], [0, 1]);
  const qk = m.pop(which, 9, 200);
  const z = 1 + m.lerp([0, m.end], [0, 0.05]);
  const pulse = t >= stop ? 0.5 + 0.5 * Math.sin((t - stop) * 0.4) : 0;
  return (
    <Flat t={t} tag="as reported" prelim={false}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z}) translateY(${(1 - slide) * 300}px)`, transformOrigin: "540px 800px", opacity: slide }}>
        <div style={{ position: "absolute", left: 60, top: 280, width: 960, height: 1040, borderRadius: 20, background: "#d8ccb4", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
          <span style={{ fontFamily: ANTON, fontSize: 92, color: RED, border: `6px solid ${RED}`, padding: "0 26px", transform: "rotate(-3deg)", display: "inline-block" }}>PRELIMINARY</span>
        </div>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <MonoLabel t={t} at={known} x={540} y={520} text="CAUSE OF THE JAM:" size={48} color="#1b2230" anchor="middle" />
          <MonoLabel t={t} at={known + 10} x={540} y={580} text="UNDER INVESTIGATION" size={48} color="#8e1b17" anchor="middle" />
        </svg>
        <Card x={100} y={640} on={t >= rudder ? 1 : 0} title="FAST HIT" color={AMBER}
          draw={<g><circle cx={200} cy={130} r={118} fill="none" stroke={AMBER} strokeWidth={10} /><text x={200} y={162} textAnchor="middle" fontFamily={ANTON} fontSize={84} fill={CREAM}>{`${fig.minutes ?? ""} MIN`}</text></g>} />
        <Card x={580} y={640} on={t >= current ? 1 : 0} title="SLOW CAPSIZE" color={RED}
          draw={<g><g transform={`rotate(${-20 * pulse - 12} 200 80)`}><rect x={110} y={60} width={180} height={34} rx={10} fill="#f3f1ec" /><rect x={140} y={34} width={120} height={28} rx={6} fill="#fbfaf7" /></g><text x={200} y={215} textAnchor="middle" fontFamily={ANTON} fontSize={96} fill={CREAM}>{`${fig.capsize ?? ""} MIN`}</text></g>} />
        {qk > 0 ? (
          <div style={{ position: "absolute", left: 455, top: 740, width: 170, height: 170, borderRadius: 85, background: RED, opacity: Math.min(1, qk * 1.5),
            transform: `scale(${1.6 - 0.6 * qk})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 130, color: CREAM }}>?</div>
        ) : null}
      </div>
    </Flat>
  );
};
export default Board;
