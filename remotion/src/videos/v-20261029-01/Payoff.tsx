/**
 * The payoff: "Rohan's money sleeps when he sleeps. Mine never clocks out."
 * The same midnight, split down the middle. Left: Rohan's dark flat, his bed, the empty wallet,
 * "Asleep" lit on "sleeps". Right: the penthouse at night, money in hard hats on the night shift,
 * one more crew member joining on "mine" and the whole crew bouncing on "clocks"; the stopwatch
 * keeps sweeping. Sharma stands on the line between them.
 *
 * params: { poor: "Asleep", rich: "Working" }, events: money, sleeps, mine, never, clocks
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { SETS } from "../../studio/sets";
import props from "./props";

const Bed = props.bed!, Wallet = props.wallet!, Crew = props.hardhat!, Watch = props.stopwatch!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { poor?: string; rich?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tSleep = at(p, "sleeps", 0.6), tMine = at(p, "mine", 1.6), tClocks = at(p, "clocks", 2.4);
  const kPoor = sp(tSleep), kRich = sp(tMine), kCrew = sp(tClocks, 8);
  const Pent = SETS.penthouse!;
  const ground = h * 0.6;
  const crew = [0.68, 0.8, 0.92];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(10,15,45,${0.55 + 0.2 * kPoor}) 0 50%, rgba(20,110,70,${0.1 + 0.25 * kRich}) 50% 100%)` }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <line x1={w / 2} x2={w / 2} y1={h * 0.08} y2={h * 0.8} stroke="#fff" strokeWidth={8} strokeDasharray="30 20" opacity={0.7} />
        <g transform={`translate(${w * 0.22},${ground})`}><Bed s={h * 0.13} t={t} /></g>
        <g transform={`translate(${w * 0.1},${ground})`}><Wallet s={h * 0.06} t={t} state="empty" /></g>
        <g transform={`translate(${w * 0.8},${h * 0.36})`}><Watch s={h * 0.1} t={t} k={(t * 0.3) % 1} /></g>
        {crew.map((x, i) => {
          const show = i < 2 ? 1 : kRich;
          const jump = kCrew > 0 ? Math.abs(Math.sin(t * 7 + i)) * h * 0.02 : 0;
          return show > 0 ? <g key={x} transform={`translate(${w * x},${ground - jump}) scale(${show})`}><Crew s={h * 0.08} t={t + i * 0.3} /></g> : null;
        })}
        <Actor p={p} spec={{ who: "sharma", x: 0.5, scale: 0.8, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "mine", pose: "pointUp", expression: "proud" }] }} ground={h * 0.64} index={0} />
      </svg>
      {[P.poor, P.rich].map((word, i) => word ? (
        <div key={i} style={{ position: "absolute", top: h * 0.14, left: i ? w / 2 : 0, width: w / 2, textAlign: "center", transform: `scale(${i ? kRich : kPoor})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 74, textTransform: "uppercase", color: i ? "#7cf0b2" : "#9fc3ff", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{word}</span>
        </div>
      ) : null)}
    </AbsoluteFill>
  );
};

export default Payoff;
