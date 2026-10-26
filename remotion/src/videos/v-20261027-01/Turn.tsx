/**
 * The turn: "Here's the part that hurts. Saving my whole salary for 40 years, I'd never even leave level two."
 * Rohan at his desk with a paycheck; on "salary" the year counter rolls in and its drums start
 * spinning, on "room" the warehouse of pallets looms behind him, and on "years" calendar pages
 * fly off and the year figure slams down.
 *
 * params: { years: "{career_years} years", label: "Still level two" }, events: hurts, salary, room, years
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Counter = props.counter!, Calendar = props.calendar!, Paycheck = props.paycheck!, Warehouse = props.warehouse!, Pallet = props.pallet!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { years?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tHurt = at(p, "hurts", 0.5), tSal = at(p, "salary", 1.4), tRoom = at(p, "room", 2.2), tYears = at(p, "years", 3.2);
  const kCount = sp(tSal), kRoom = sp(tRoom, 14), kYears = sp(tYears, 8);
  const spin = clamp((t - tSal) / 2);
  const quake = t >= tYears && t < tYears + 0.5 ? Math.sin((t - tYears) * 70) * 18 * (1 - (t - tYears) / 0.5) : 0;
  const dim = t >= tHurt ? clamp((t - tHurt) / 0.4) * 0.3 : 0;
  const Office = SETS.office!;
  const zoom = 1.3 - 0.25 * clamp((t - tRoom) / 0.8);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", transform: `translate(${quake}px,${quake * 0.5}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 65%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kRoom > 0 && <g transform={`translate(${w * 0.68},${h * 0.62}) scale(${kRoom})`} opacity={clamp(kRoom)}>
            <Warehouse s={h * 0.36} t={t} />
            {[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i - 1) * h * 0.11},0)`}><Pallet s={h * 0.1} t={t + i} /></g>)}
          </g>}
          <g transform={`translate(${w * 0.5},${h * 0.5}) scale(${kCount})`}><Counter s={h * 0.16} t={t} k={spin} /></g>
          <g transform={`translate(${w * 0.82},${h * 0.36})`}><Calendar s={h * 0.13} t={t} k={t > tYears ? 1 : 0.15} /></g>
          <g transform={`translate(${w * 0.3},${h * 0.83})`}><Paycheck s={h * 0.09} t={t} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.3, scale: 1.3, acting: [{ sec: 0, pose: "phone", expression: "neutral" }, { at: "hurts", pose: "worried", expression: "worried" }, { at: "years", pose: "facepalm", expression: "shock" }] }} ground={h * 0.97} index={0} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#100818", opacity: dim, pointerEvents: "none" }} />
      {P.years && kYears > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", transform: `scale(${2 - kYears})`, opacity: clamp(kYears * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ff6b6b", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{P.years}</div>
          {P.label && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", background: "#1d2433", borderRadius: 18, padding: "4px 26px" }}>{P.label}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
