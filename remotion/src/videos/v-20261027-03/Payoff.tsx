/**
 * The payoff: "So the casino doesn't need luck. It just needs players who keep coming back."
 * The casino's neon front at night; on "luck" a horseshoe-shaped LUCK sign is crossed out, on
 * "players" a line of little players walks in through the door in a loop while chips flow in
 * over them, and on "back" Rohan's ten-year total lands on the door.
 *
 * params: { total: "{decade_total}", label: "Rohan's Saturdays" }, events: casino, luck, players, back
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Casino = props.casino!, Chips = props.chips!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { total?: string; label?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tLuck = at(p, "luck", 0.9), tPlayers = at(p, "players", 1.9), tBack = at(p, "back", 2.8);
  const kLuck = sp(0.1), kX = clamp((t - tLuck) / 0.35), kTotal = sp(tBack, 9);
  const door = h * 0.6;
  const walkers = t < tPlayers ? 0 : 6;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <World kind="city" tint="#8a63d2" w={w} h={h} t={t} seed="payoff-city" props={props} horizon={[{ prop: "slots", x: 0.1, size: 0.1 }, { prop: "wheel", x: 0.9, size: 0.1 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.5},${door})`}><Casino s={h * 0.36} t={t} /></g>
        {Array.from({ length: walkers }, (_, i) => {
          const f = ((t - tPlayers) * 0.35 + i / walkers) % 1;
          const x = w * (0.05 + 0.45 * f), sc = 1 - 0.6 * f;
          return <g key={i} transform={`translate(${x},${door + 40 - f * 30}) scale(${sc})`} opacity={1 - f * 0.8}>
            <circle cx={0} cy={-120} r={26} fill="#e0a678" stroke="#1d2433" strokeWidth={5} />
            <rect x={-26} y={-92} width={52} height={80} rx={18} fill={["#1fa7a0", "#3d7bf5", "#f2588f"][i % 3]} stroke="#1d2433" strokeWidth={5} />
          </g>;
        })}
        {walkers > 0 && Array.from({ length: 5 }, (_, i) => {
          const f = ((t - tPlayers) * 0.6 + i / 5) % 1;
          return <g key={`c${i}`} transform={`translate(${w * (0.15 + 0.35 * f)},${h * (0.35 + 0.2 * f) - Math.sin(f * Math.PI) * 120})`}><Chips s={h * 0.04} t={t} /></g>;
        })}
        <Actor p={p} spec={{ who: "priya", x: 0.8, scale: 1.0, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "players", pose: "point", expression: "smirk" }] }} ground={h * 0.7} index={0} />
      </svg>
      {/* LUCK, crossed out */}
      <div style={{ position: "absolute", left: w * 0.08, top: h * 0.12, transform: `scale(${kLuck}) rotate(-5deg)` }}>
        <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#2fb37a", background: "#fff", padding: "4px 30px", borderRadius: 22, border: "8px solid #1d2433" }}>
          LUCK
          {kX > 0 && <svg width={300} height={140} style={{ position: "absolute", left: -10, top: -10, overflow: "visible" }}>
            <path d="M10,120 L280,15" stroke="#e5484d" strokeWidth={22} strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - kX)} />
          </svg>}
        </div>
      </div>
      {P.total && kTotal > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.22, transform: `translate(-50%,0) scale(${kTotal})`, textAlign: "center",
          background: "#fff", border: "6px solid #1f8f55", borderRadius: 22, padding: "8px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
          {P.label && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#3f4656", textTransform: "uppercase", whiteSpace: "nowrap" }}>{P.label}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#1f8f55", lineHeight: 1.05, whiteSpace: "nowrap" }}>{P.total}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
