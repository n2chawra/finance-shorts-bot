/**
 * The turn: "The fee doesn't just take its slice. Everything it takes would have grown, for decades."
 * A snowy hill: a snowball rolls down and grows. On "slice" the fee leech bites a chunk off it, on
 * "takes" the chunk flies off, and on "grown" each lost chunk turns into a ghost snowball that keeps
 * growing on its own track, bigger and bigger to "decades".
 *
 * params: { fee: "{fee_fee_pct}" }, events: slice, takes, grown, decades
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Snowball = props.snowball!, Leech = props.leech!, Hill = props.hill!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fee?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tSlice = at(p, "slice", 1.0), tTakes = at(p, "takes", 2.0), tGrown = at(p, "grown", 3.0), tDec = at(p, "decades", 4.0);
  const kLeech = sp(tSlice, 9), fly = ease((t - tTakes) / 0.8), ghost = ease((t - tGrown) / Math.max(1, tDec - tGrown + 0.8));
  const roll = clamp(t / 6);
  const gy = h * 0.8;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <World kind="field" tint="#3d7bf5" w={w} h={h} t={t} seed="turn-snow" props={props} />
      <AbsoluteFill style={{ background: "rgba(220,235,255,0.25)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.32},${gy})`}><Hill s={h * 0.5} t={t} /></g>
        <g transform={`translate(${w * (0.15 + 0.4 * roll)},${gy - h * 0.32 * (1 - roll)})`}><Snowball s={h * 0.22} t={t} k={0.3 + 0.4 * roll} /></g>
        {kLeech > 0 && <g transform={`translate(${w * (0.15 + 0.4 * roll) + 40},${gy - h * 0.32 * (1 - roll) - h * 0.17}) scale(${kLeech})`}><Leech s={h * 0.07} t={t} /></g>}
        {fly > 0 && [0, 1, 2].map((i) => {
          const x = w * (0.2 + 0.1 * i * fly), y = gy - h * (0.35 + 0.05 * i) * (1 - fly) - h * 0.02;
          return <g key={i} transform={`translate(${x},${y})`} opacity={0.55 + 0.45 * fly}><Snowball s={h * (0.05 + 0.08 * ghost * (1 + i * 0.3))} t={t + i} k={0.2 + 0.6 * ghost} /></g>;
        })}
        <Actor p={p} spec={{ who: "sharma", x: 0.74, scale: 1.3, turn: -0.6, acting: [{ sec: 0, pose: "point", expression: "smirk" }, { at: "grown", pose: "pointUp", expression: "proud" }] }} ground={h * 0.9} index={0} />
      </svg>
      {P.fee && kLeech > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", background: "#2fb37a", border: "6px solid #1d2433", borderRadius: 18, padding: "4px 26px", transform: `scale(${kLeech}) rotate(-4deg)` }}>{P.fee} A YEAR</span>
          {ghost > 0 && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", marginTop: 16, transform: `scale(${0.6 + 0.4 * clamp(ghost * 2)})` }}>+ ALL ITS GROWTH</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
