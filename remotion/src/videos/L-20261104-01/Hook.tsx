/**
 * Hook: "Rohan just got a raise. His treadmill got faster, but his bank balance didn't move. Why?
 * There are seven money traps, and they take the raise before he ever sees it. Here's how."
 * A kitchen at night: Rohan running on a treadmill in the middle of the frame. On "raise" a payslip
 * with a green arrow drops in beside him; on "faster" the belt speeds up and speed lines streak out;
 * on "balance" his bank balance tag drops above the screen of the treadmill and the word SAME stamps
 * on it; on "six" six trap things pop up in an arc over his head (a price tag, a car, a jar, the
 * fee tap, a house, a clock), each one dimming the balance a little; "how" pushes the camera in.
 *
 * params: { raiseLabel, balanceLabel, stamp, count, headline (on screen from frame 0 until "why") }
 * events: raise, faster, balance, why, six, how
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Mill = props.treadmill!, Slip = props.payslip!;
const TRAPS = [props.risetag!, props.sedan!, props.cashjar!, props.feetap!, props.bighouse!, props.alarmclock!];

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { raiseLabel?: string; balanceLabel?: string; stamp?: string; count?: string; headline?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tRaise = at(p, "raise", 0.8), tFast = at(p, "faster", 1.8), tBal = at(p, "balance", 3.0), tWhy = at(p, "why", 4.2), tSeven = at(p, "six", 5.2), tHow = at(p, "how", 8.0);
  const kRaise = sp(tRaise), kBal = sp(tBal), kStamp = sp(tBal + 0.6, 9), kWhy = sp(tWhy, 9), kHow = clamp((t - tHow) / 0.8);
  const fast = t >= tFast;
  const box = safeBox(w, h), mt = minText(w, h);
  const ground = h * 0.84;
  const zoom = 1.0 + 0.012 * t + 0.08 * kHow;
  const label = P.balanceLabel ?? "";
  const fsLabel = Math.max(mt, fitLine(label, 44, w * 0.22));
  const stamp = P.stamp ?? "";
  const fsStamp = Math.max(mt, fitLine(stamp, 84, w * 0.2, { upper: true }));
  const raise = P.raiseLabel ?? "";
  const fsRaise = Math.max(mt, fitLine(raise, 46, w * 0.14));
  const count = P.count ?? "";
  const fsCount = Math.max(mt, fitLine(count, 64, w * 0.3, { upper: true }));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}>
        <World kind="kitchen" tint={t > tSeven ? "red" : undefined} w={w} h={h} t={t} seed="hook-treadmill" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${ground})`}><Mill s={h * 0.42} t={t} state={fast ? "fast" : undefined} k={0.2} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.47, scale: 1.0, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "faster", pose: "worried", expression: "worried" },
            { at: "balance", pose: "phone", expression: "shock", prop: "phone" }, { at: "seven", pose: "facepalm", expression: "sad" }, { at: "how", pose: "shrug", expression: "confused" }] }}
            ground={ground - h * 0.06} index={0} />
          {kRaise > 0 && <g transform={`translate(${w * 0.2},${ground - h * 0.02 - (1 - kRaise) * h * 0.4}) scale(${kRaise})`}><Slip s={h * 0.32} t={t} state="raise" /></g>}
          {TRAPS.map((Trap, i) => {
            const k = sp(tSeven + i * 0.22, 10);
            if (k <= 0) return null;
            const a = Math.PI * (0.92 - i * 0.14);
            const x = w * 0.5 + Math.cos(a) * w * 0.36, y = h * 0.5 - Math.sin(a) * h * 0.32;
            return <g key={i} transform={`translate(${x},${y}) scale(${k})`}><Trap s={h * 0.13} t={t + i} state={i === 5 ? "ring" : undefined} k={0.6} /></g>;
          })}
        </svg>
        {raise && kRaise > 0 && (
          <div style={{ position: "absolute", left: w * 0.2, top: ground - h * 0.4, transform: `translate(-50%,0) scale(${kRaise})`, fontFamily: FONT, fontWeight: 900,
            fontSize: fsRaise, color: "#fff", background: "#2fb37a", borderRadius: 18, padding: "4px 22px", border: "5px solid #fff", whiteSpace: "nowrap" }}>{raise}</div>
        )}
        {label && kBal > 0 && (
          <div style={{ position: "absolute", left: w * 0.76, top: h * 0.3, transform: `translate(-50%,0) scale(${kBal})`, textAlign: "center",
            background: "#fff", border: "6px solid #24315e", borderRadius: 22, padding: "10px 28px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
            opacity: 1 - 0.35 * clamp((t - tSeven) / 2) }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: fsLabel, color: "#3f4656", whiteSpace: "nowrap" }}>{label}</div>
            {stamp && kStamp > 0 && (
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fsStamp, color: "#fff", background: "#c92a2a", borderRadius: 16, padding: "2px 24px", marginTop: 8,
                transform: `scale(${2 - kStamp}) rotate(-4deg)`, textTransform: "uppercase", whiteSpace: "nowrap" }}>{stamp}</div>
            )}
          </div>
        )}
      </AbsoluteFill>
      {P.headline && kWhy < 0.5 && (
        <div style={{ position: "absolute", left: w / 2, top: Math.max(box.y0, h * 0.05), transform: "translate(-50%,0)", fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine(P.headline, 76, w * 0.8, { upper: true })), color: "#fff", background: "#c92a2a", borderRadius: 18, padding: "4px 28px",
          border: "6px solid #fff", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(0,0,0,0.4)" }}>{P.headline}</div>
      )}
      {count && kWhy > 0 && (
        <div style={{ position: "absolute", left: w / 2, top: Math.max(box.y0, h * 0.05), transform: `translate(-50%,0) scale(${kWhy})`, fontFamily: FONT, fontWeight: 900,
          fontSize: fsCount, color: "#ffd34d", textTransform: "uppercase", whiteSpace: "nowrap", textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>{count}</div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
