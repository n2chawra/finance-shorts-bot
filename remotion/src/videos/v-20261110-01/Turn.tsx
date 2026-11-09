/**
 * The turn: "Miss them, and the boxes stay locked. No shares at all."
 * A vault at night, header MISS THE TARGETS from frame 0. A row of steel lockboxes stands on the
 * floor with the count of boxes over them and the value still needed beside. On "miss" a red target
 * flag on the right topples; on "boxes" the boxes hop in turn; on "locked" every padlock flashes
 * red with a chain across the row; on "shares" a red NO SHARES stamp slams over them.
 *
 * params: { header, count, countLabel, stamp, goal, goalLabel }, events: miss, boxes, locked, shares
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import { showsSource } from "../../studio/source";
import props from "./props";

const Lock = props.lockbox!, Flag = props.flag!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; count?: string; countLabel?: string; stamp?: string; goal?: string; goalLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tMiss = at(p, "miss", 0.2), tBoxes = at(p, "boxes", 1.0), tLock = at(p, "locked", 1.6), tNo = at(p, "shares", 2.6);
  const kMiss = sp(tMiss), kLock = sp(tLock, 10), kNo = sp(tNo, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, box.x1 - box.x0 - 100, { upper: true }));
  const lab = (s: string, max: number, b = 54) => Math.max(min, fitLine(s.toUpperCase(), b, max, { upper: true }));
  const g = h * 0.62;
  const xs = [0.17, 0.43, 0.69];
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 120, (box.x1 - box.x0) * 0.75, { upper: true }));
  const src = showsSource(p) ? (p.tl.sources ?? "") : "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.06 * kNo})`, transformOrigin: "45% 55%" }}>
        <World kind="bank" tint="#4a1e2e" w={w} h={h} t={t} seed="turn-locked-vault" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {xs.map((x, i) => {
            const hop = t > tBoxes + i * 0.15 && t < tBoxes + i * 0.15 + 0.5 ? Math.sin((t - tBoxes - i * 0.15) * 2 * Math.PI) * h * 0.02 : 0;
            return (
              <g key={x} transform={`translate(${w * x},${g - Math.abs(hop)})`}><Lock s={h * 0.14} t={t + i} /></g>
            );
          })}
          {kLock > 0 && <line x1={w * 0.06} x2={w * 0.8} y1={g - h * 0.05} y2={g - h * 0.05} stroke="#e5484d" strokeWidth={16} strokeLinecap="round"
            strokeDasharray={`${w * 0.7 * kLock} ${w}`} />}
          {kLock > 0 && xs.map((x) => <circle key={x} cx={w * x} cy={g - h * 0.045} r={h * 0.02} fill="#e5484d" opacity={0.5 + 0.5 * Math.sin(t * 10)} />)}
          <g transform={`translate(${w * 0.82},${g}) rotate(${-20 * kMiss})`} opacity={1 - 0.5 * kMiss}><Flag s={h * 0.13} t={t} /></g>
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#d63031", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.count && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.17, textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.count, 170, w * 0.5)), color: "#ffd84a", WebkitTextStroke: "11px #1d2433", paintOrder: "stroke fill", lineHeight: 1,
            transform: `scale(${1 + 0.1 * (t > tBoxes && t < tBoxes + 0.4 ? 1 : 0)})` }}>{P.count}</div>
          {P.countLabel && <div style={{ display: "inline-block", marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.countLabel, (box.x1 - box.x0) * 0.8), color: "#1d2433", background: "#fff", padding: "4px 22px", borderRadius: 14 }}>{P.countLabel.toUpperCase()}</div>}
        </div>
      )}
      {P.goal && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.355, textAlign: "center", opacity: clamp((t - tMiss) * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(`${P.goalLabel ?? ""} ${P.goal}`, (box.x1 - box.x0) * 0.85, 50), color: "#1d2433", background: "#ffd84a", padding: "6px 20px", borderRadius: 14 }}>
            {`${(P.goalLabel ?? "").toUpperCase()} ${P.goal}`}</span>
        </div>
      )}
      {kNo > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.44, textAlign: "center", transform: `rotate(-8deg) scale(${1.7 - 0.7 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", background: "#d63031", padding: `${sSize * 0.12}px ${sSize * 0.4}px`, border: "8px solid #fff", borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
      {src && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.66, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: Math.max(min * 0.8, fitLine(src, 40, box.x1 - box.x0)), color: "#fff", background: "rgba(0,0,0,0.55)", padding: "4px 14px", borderRadius: 10 }}>{src}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
