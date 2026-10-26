/**
 * The payoff: "Rohan puts in {nest_invested} over the years. At an assumed {nest_rate}, it grows to
 * {nest_final}. And the tax on all that growth, when he takes it out? None."
 * The nest egg grows from small to huge on "grows"; a tax cloud rolls in over it on "tax" and an
 * umbrella snaps open on "none", the red drops bouncing off; the two tags and a stamp land.
 *
 * params: { invested: "{nest_invested}", final: "{nest_final}", stamp: "Tax-free growth" }
 * events: puts, grows, tax, none
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Egg = props.nestegg!, Cloud = props.taxcloud!, Umbrella = props.umbrella!;

const Tag: React.FC<{ x: number; y: number; label: string; value: string; color: string; k: number }> = ({ x, y, label, value, color, k }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), textAlign: "center",
    background: "#fff", border: `6px solid ${color}`, borderRadius: 22, padding: "6px 26px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#3f4656", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
  </div>
);

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { invested?: string; final?: string; stamp?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tPuts = at(p, "puts", 0.4), tGrows = at(p, "grows", 2.0), tTax = at(p, "tax", 4.0), tNone = at(p, "none", 5.4);
  const kIn = sp(tPuts), grow = clamp((t - tGrows) / 1.4), kCloud = sp(tTax, 14), kUmb = sp(tNone, 8), kStamp = sp(tNone + 0.3, 9);
  const ground = h * 0.8;
  const cx = w * 0.56;
  const eggS = h * (0.22 + 0.3 * grow);
  // drops bounce off the umbrella once it is open
  const drops = kUmb > 0.5 ? [0, 1, 2, 3, 4, 5].map((i) => {
    const d = ((t * 1.3 + i * 0.29) % 1);
    const x = cx + (i - 2.5) * w * 0.05 + d * (i < 3 ? -1 : 1) * w * 0.08;
    const y = h * 0.2 + Math.sin(d * Math.PI) * -h * 0.05 + d * h * 0.06;
    return <circle key={i} cx={x} cy={y} r={10} fill="#e5484d" stroke="#1d2433" strokeWidth={3} opacity={1 - d} />;
  }) : null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `scale(${1.04 - 0.04 * grow})` }}>
      <World kind="field" tint={grow > 0.6 ? "gold" : undefined} w={w} h={h} t={t} seed="payoff-field" props={props} horizon={[{ prop: "foundation", x: 0.88, size: 0.08 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${cx},${ground})`}><Egg s={eggS} t={t} k={0.3 + 0.7 * grow} /></g>
        {kCloud > 0 && <g transform={`translate(${cx},${h * (0.02 + 0.2 * kCloud)})`}><Cloud s={h * 0.32} t={t} /></g>}
        {kUmb > 0 && <g transform={`translate(${cx},${ground - eggS * 0.2}) scale(${kUmb})`}><Umbrella s={eggS * 1.25} t={t} /></g>}
        {drops}
        <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 1.25, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "grows", pose: "celebrate", expression: "laugh" }, { at: "tax", pose: "worried", expression: "worried" }, { at: "none", pose: "thumbsUp", expression: "proud" }] }} ground={h * 0.98} index={0} />
      </svg>
      {P.invested && <Tag x={w * 0.2} y={h * 0.08} label="He puts in" value={P.invested} color="#24315e" k={kIn} />}
      {P.final && <Tag x={w * 0.84} y={h * 0.08} label="It grows to" value={P.final} color="#1f8f55" k={sp(tGrows + 0.8)} />}
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.74, top: h * 0.46, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", background: "#1f8f55", padding: "8px 30px", whiteSpace: "nowrap",
            borderRadius: 24, border: "8px solid #fff", textTransform: "uppercase", boxShadow: "0 14px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
