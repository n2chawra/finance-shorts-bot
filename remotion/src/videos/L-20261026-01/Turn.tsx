/**
 * The turn: "Six moves, and every one needs the same thing: a fortune already sitting in shares.
 * Rohan has a payslip. But the last move works with a payslip too."
 * A high shelf in a gold-lit vault holds the six moves' things behind a velvet rope; on "fortune"
 * the shelf glows and rises out of reach; on "payslip" Rohan holds his payslip up, tiny below it;
 * on "last" a small door opens in the floor-level wall, light spills out and the nest egg rolls in.
 *
 * events: fortune, payslip, last
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { World } from "../../studio/worlds";
import props from "./props";

const SHELF = ["certificates", "briefcase", "will", "foundation", "seesaw"] as const;
const Door = props.door!, Egg = props.nestegg!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tFortune = at(p, "fortune", 1.4), tPay = at(p, "payslip", 3.2), tLast = at(p, "last", 4.6);
  const rise = sp(tFortune, 14), kDoor = sp(tLast, 12), kEgg = clamp((t - tLast - 0.4) / 0.9);
  const glow = rise * (0.5 + 0.2 * Math.sin(t * 6));
  const shelfY = h * (0.42 - 0.16 * rise);
  const ground = h * 0.86;
  // the camera starts tight on the shelf and pulls back to show how far up it is
  const s = 1.25 - 0.25 * clamp((t - tFortune) / 0.8) + 0.1 * kDoor;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: kDoor > 0 ? "30% 80%" : "50% 40%" }}>
        <World kind="bank" tint="gold" w={w} h={h} t={t} seed="turn-vault" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={w * 0.55} cy={shelfY - h * 0.06} rx={w * 0.38} ry={h * 0.14} fill="#ffd34d" opacity={glow * 0.5} />
          <rect x={w * 0.2} y={shelfY} width={w * 0.7} height={h * 0.035} rx={8} fill="#8a5a2b" stroke="#1d2433" strokeWidth={6} />
          {SHELF.map((name, i) => {
            const P = props[name]!;
            return <g key={name} transform={`translate(${w * (0.28 + i * 0.135)},${shelfY})`}><P s={h * 0.13} t={t + i} k={0.7} /></g>;
          })}
          {/* the velvet rope */}
          <line x1={w * 0.2} y1={shelfY + h * 0.12} x2={w * 0.9} y2={shelfY + h * 0.12} stroke="#c92a2a" strokeWidth={14} strokeLinecap="round" />
          <g transform={`translate(${w * 0.3},${ground})`}><Door s={h * 0.3} t={t} state={kDoor > 0.4 ? "open" : undefined} /></g>
          {kDoor > 0 && <ellipse cx={w * 0.3} cy={ground - h * 0.15} rx={w * 0.06 * kDoor} ry={h * 0.16 * kDoor} fill="#fff6c8" opacity={0.6} />}
          {kEgg > 0 && <g transform={`translate(${w * (0.3 + 0.12 * kEgg)},${ground}) rotate(${(1 - kEgg) * -90})`}><Egg s={h * 0.16} t={t} k={0.3} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.6, scale: 1.0, acting: [{ sec: 0, pose: "think", expression: "confused" }, { at: "fortune", pose: "worried", expression: "sad" }, { at: "payslip", pose: "pointUp", expression: "worried", prop: "letter" }, { at: "last", pose: "celebrate", expression: "happy", turn: -0.6 }] }} ground={ground} index={0} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Turn;
