// Board: "Investigators named {fact5} factors. The hand brakes, or the test: which should have stopped it?"
// The investigators' cause board: its title writes on with the count ("factors"); TOO FEW HAND BRAKES
// slides in and is stamped ("brakes"); BRAKE TEST WITH AIR BRAKES ON ("test"); a red question mark lands
// between the two ("which").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, MonoLabel } from "../../disaster/index";
import { AMBER, ANTON, CREAM, Flat, Mist, RED } from "./World";

type Params = { fig?: { factors?: string } };

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const n = (p.beat.params as Params).fig?.factors ?? "";
  const factors = m.at("factors", 10), brakes = m.at("brakes", 34), test = m.at("test", 50), which = m.at("which", 66);
  const qk = m.pop(which, 9, 200);
  const z = 1 + m.lerp([0, m.end], [0, 0.05]) + 0.03 * m.pulse(which + 4, 10);
  return (
    <Flat t={t} tag="as reported">
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "540px 860px" }}>
        <CauseBoard t={t} title={`Investigators: ${n} factors`} titleAt={0}
          causes={[
            { label: "Engine shut down after the fire", at: 0, verdict: "factor" },
            { label: "Too few hand brakes", at: brakes - 4, verdict: "factor" },
            { label: "Brake test with air brakes on", at: test - 4, verdict: "factor" },
          ]} />
        <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="rgba(120,170,230,0.16)" strokeWidth={i % 5 === 0 ? 7 : 4} />)}
          {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="rgba(120,170,230,0.16)" strokeWidth={i % 5 === 0 ? 7 : 4} />)}
        </svg>
        <Mist f={t} k={0.6} />
        {/* the investigators' profile of the line: the hill where it was parked, the grade, the town */}
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <g transform="translate(0 45)">
          <path d="M90,330 L330,340 C560,380 760,520 990,600" stroke={CREAM} strokeWidth={8} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - m.lerp([0, 16], [0.3, 1]))} />
          <path d="M90,330 L330,340 C560,380 760,520 990,600 L990,650 L90,650 Z" fill="rgba(120,170,230,0.12)" />
          <circle cx={200} cy={334} r={16} fill={AMBER} />
          <g transform={`translate(${200 + 640 * m.lerp([0, m.end], [0, 0.55])} ${334 + 210 * m.lerp([0, m.end], [0, 0.55]) ** 1.6})`}>
            <rect x={-46} y={-30} width={92} height={30} rx={8} fill="#1b2230" stroke={AMBER} strokeWidth={4} />
          </g>
          <g transform="translate(995 602)"><line x1={-26} y1={-26} x2={26} y2={26} stroke={RED} strokeWidth={10} /><line x1={-26} y1={26} x2={26} y2={-26} stroke={RED} strokeWidth={10} /></g>
          <MonoLabel t={t} at={-40} x={90} y={300} text="PARKED HERE" size={46} color={AMBER} />
          <MonoLabel t={t} at={-40} x={900} y={560} text="LAC-MÉGANTIC" size={46} color={RED} anchor="end" />
          </g>
        </svg>
        {qk > 0 ? (
          <div style={{ position: "absolute", left: 450, top: 300, width: 190, height: 190, borderRadius: 95, background: RED, opacity: Math.min(1, qk * 1.5),
            transform: `scale(${1.6 - 0.6 * qk})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 150, color: CREAM }}>?</div>
        ) : null}
      </div>
    </Flat>
  );
};
export default Board;
