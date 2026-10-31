/**
 * The payoff: "So McDonald's earns like a landlord, and the burgers pay the rent. Over twenty years,
 * one corner hands it about twelve million dollars."
 * The restaurant stands on its own fenced plot of land with the RENT sign beside it. On
 * "landlord" the plot's flag turns gold and the deed rises over it; on "rent" burgers slide along
 * the counter into the RENT sign; on "hands" the twenty-year total lands in a card over the corner.
 *
 * params: { total: "{twenty_total}", label: "One corner", years: "{twenty_years} years" },
 * events: earns, landlord, burgers, rent, corner, hands
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Diner = props.diner!, Ground = props.ground!, Rent = props.rentsign!, Deed = props.deed!, Burger = props.burger!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { total?: string; label?: string; years?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tLand = at(p, "landlord", 1.0), tBurg = at(p, "burgers", 2.0), tRent = at(p, "rent", 2.8), tHands = at(p, "hands", 5.0);
  const kDeed = sp(tLand, 9), kTotal = sp(tHands, 9), kRent = sp(tRent, 8);
  const box = safeBox(w, h);
  const maxW = box.x1 - box.x0 - 120;
  const big = Math.max(minText(w, h), fitLine(P.total ?? "", 110, maxW));
  const small = Math.max(minText(w, h), fitLine(`${P.label ?? ""} · ${P.years ?? ""}`.toUpperCase(), 48, maxW, { upper: true }));
  const plot = h * 0.66;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <World kind="city" tint="#f2b631" w={w} h={h} t={t} seed="payoff-city" props={props} horizon={[{ prop: "diner", x: 0.1, size: 0.06 }, { prop: "keys", x: 0.9, size: 0.06 }]} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <g transform={`translate(${w * 0.42},${plot + h * 0.02})`}><Ground s={h * 0.3} t={t} state={t > tLand ? "owned" : undefined} /></g>
        <g transform={`translate(${w * 0.34},${plot - h * 0.06})`}><Diner s={h * 0.13} t={t} /></g>
        <g transform={`translate(${w * 0.6},${plot}) scale(${1 + 0.15 * kRent * Math.abs(Math.sin(t * 6))})`}><Rent s={h * 0.12} t={t} /></g>
        {kDeed > 0 && <g transform={`translate(${w * 0.2},${h * 0.5 - kDeed * h * 0.04}) scale(${kDeed})`}><Deed s={h * 0.1} t={t} /></g>}
        {t > tBurg && Array.from({ length: 4 }, (_, i) => {
          const f = ((t - tBurg) * 0.45 + i / 4) % 1;
          return <g key={i} transform={`translate(${w * (0.5 + 0.3 * f)},${plot - h * 0.01 - Math.sin(f * Math.PI) * h * 0.05}) scale(${1 - 0.5 * f})`} opacity={1 - f * 0.7}><Burger s={h * 0.045} t={t} /></g>;
        })}
        <Actor p={p} spec={{ who: "priya", x: 0.8, scale: 1.0, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "rent", pose: "point", expression: "smirk" }] }} ground={h * 0.7} index={0} />
      </svg>
      {P.total && kTotal > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.18, transform: `translate(-50%,0) scale(${kTotal})`, textAlign: "center",
          background: "#fff", border: "6px solid #1f8f55", borderRadius: 22, padding: "8px 30px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)", maxWidth: box.x1 - box.x0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: small, color: "#3f4656", whiteSpace: "nowrap" }}>{`${P.label ?? ""} · ${P.years ?? ""}`.toUpperCase()}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: big, color: "#1f8f55", lineHeight: 1.05, whiteSpace: "nowrap" }}>{P.total}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
