/**
 * The turn: "That's the twist I love. The owner carries the risk on every burger, but McDonald's
 * collects the rent either way, like a landlord."
 * Sharma in the penthouse, the landlord's keys swinging from his hand. Down on the left the
 * franchise owner juggles the risk dice beside a burger; on "collects" a stream of coins climbs
 * from the restaurant up to Sharma's keys, and on "landlord" a LANDLORD stamp slams across the top.
 *
 * params: { stamp: "Landlord" }, events: twist, risk, burger, collects, rent, landlord
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Keys = props.keys!, Dice = props.dice!, Owner = props.owner!, Diner = props.diner!, Burger = props.burger!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tRisk = at(p, "risk", 1.4), tBurger = at(p, "burger", 2.4), tCollect = at(p, "collects", 3.4), tLand = at(p, "landlord", 5.0);
  const kRisk = sp(tRisk, 9), kBurger = sp(tBurger, 10), kStamp = sp(tLand, 8);
  const Pent = SETS.penthouse!;
  const box = safeBox(w, h);
  const stamp = (P.stamp ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitLine(stamp, 130, box.x1 - box.x0 - 80, { upper: true }));
  const from: [number, number] = [w * 0.3, h * 0.52], to: [number, number] = [w * 0.8, h * 0.4];
  const coins = t < tCollect ? [] : Array.from({ length: 7 }, (_, i) => {
    const f = ((t - tCollect) * 0.7 + i / 7) % 1;
    const x = from[0] + (to[0] - from[0]) * f, y = from[1] + (to[1] - from[1]) * f - Math.sin(f * Math.PI) * h * 0.08;
    return <g key={i} transform={`translate(${x},${y})`} opacity={clamp((1 - f) * 4)}>
      <circle r={h * 0.016} fill="#f2b631" stroke={INK} strokeWidth={4} />
    </g>;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.06 - 0.04 * clamp((t - tCollect) / 1.0)})`, transformOrigin: "50% 40%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: "rgba(40,10,0,0.3)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {/* the restaurant down below, the owner and his risk */}
          <g transform={`translate(${w * 0.27},${h * 0.58})`}><Diner s={h * 0.1} t={t} /></g>
          {kRisk > 0 && <g transform={`translate(${w * 0.16},${h * 0.44 - kRisk * h * 0.03}) scale(${kRisk})`}><Dice s={h * 0.07} t={t} /></g>}
          <g transform={`translate(${w * 0.4},${h * 0.62})`}><Owner s={h * 0.12} t={t} /></g>
          {kBurger > 0 && <g transform={`translate(${w * 0.12},${h * 0.62}) scale(${kBurger})`}><Burger s={h * 0.07} t={t} /></g>}
          {coins}
          <Actor p={p} spec={{ who: "sharma", x: 0.6, scale: 1.0, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "collects", pose: "present", expression: "proud" }, { at: "landlord", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.74} index={0} />
          <g transform={`translate(${w * 0.82},${h * 0.42})`}><Keys s={h * 0.1} t={t} /></g>
        </svg>
      </AbsoluteFill>
      {stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.12, textAlign: "center", transform: `scale(${2 - kStamp}) rotate(-6deg)`, opacity: clamp(kStamp * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#e5484d", border: "12px solid #e5484d", borderRadius: 24, padding: "0 30px", background: "rgba(255,246,214,0.92)", lineHeight: 1.15 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
