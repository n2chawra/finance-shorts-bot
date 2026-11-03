/**
 * The payoff: "So on zero interest, the shop pays. On longer plans, buyers pay interest too."
 * A bright street, header THE SHOP PAYS THE APP from frame 0. Three things in a row: you (a
 * shopping bag) on the left, the app's building in the middle, the shop on the right. On "zero" a
 * ZERO INTEREST tag swings onto the bag; on "app" a dashed arrow from the bag to the app fades and
 * gets crossed; on "shop" coins flow from the shop into the app with the quarter's fee figure; on
 * "does" the shop pulses and the app glows.
 *
 * params: { header, fee, appLabel, shopLabel, youLabel }, events: zero, shop, longer, interest
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Bag = props.bag!, Hq = props.lenderhq!, Shop = props.shopfront!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; fee?: string; longLabel?: string; appLabel?: string; shopLabel?: string; youLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tZero = at(p, "zero", 0.5), tShop = at(p, "shop", 1.2), tApp = at(p, "longer", 2.4), tDoes = at(p, "interest", 3.4);
  const kZero = sp(tZero, 9), kApp = sp(tApp, 10), kShop = sp(tShop, 10), kDoes = sp(tDoes, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 50) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, yx = w * 0.2, ax = w * 0.5, sx = w * 0.78;
  const coins = t < tShop ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tShop) * 1.2 + i / 6) % 1;
    return <circle key={i} cx={sx + (ax - sx) * f} cy={g - h * 0.14 - Math.sin(f * Math.PI) * h * 0.1} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  const fee = P.fee ?? "";
  const item = (x: number, label: string | undefined, color = "#fff") => label && <text x={x} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(label, w * 0.28)} fill={color} stroke={INK} strokeWidth={6} paintOrder="stroke">{label.toUpperCase()}</text>;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * kDoes})`, transformOrigin: "65% 55%" }}>
        <World kind="street" tint="#3d7bf5" w={w} h={h} t={t} seed="payoff-street-pays" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${yx},${g})`}><Bag s={h * 0.14} t={t} /></g>
          {item(yx, P.youLabel)}
          {kZero > 0 && <g transform={`translate(${w * 0.27},${g - h * 0.22}) rotate(${-8 + Math.sin(t * 3) * 4})`} opacity={clamp(kZero * 2)}>
            <rect x={-w * 0.17} y={-min} width={w * 0.34} height={min * 1.5} rx={12} fill="#ffe066" stroke={INK} strokeWidth={5} />
            <text y={min * 0.1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab("Zero interest", w * 0.3, 48)} fill={INK}>ZERO INTEREST</text>
          </g>}
          {kApp > 0 && <g opacity={clamp(kApp * 2)}>
            <line x1={yx + w * 0.08} x2={ax - w * 0.1} y1={g - h * 0.08} y2={g - h * 0.08} stroke="#ff8a8a" strokeWidth={8} strokeDasharray="18 12" />
            <path d={`M${ax - w * 0.1},${g - h * 0.08} l${-w * 0.03},${-w * 0.025} M${ax - w * 0.1},${g - h * 0.08} l${-w * 0.03},${w * 0.025}`} stroke="#ff8a8a" strokeWidth={8} strokeLinecap="round" />
          </g>}
                    {kDoes > 0 && <circle cx={ax} cy={g - h * 0.1} r={h * 0.14} fill="#ffd84a" opacity={0.25 * kDoes} />}
          <g transform={`translate(${ax},${g}) scale(${1 + 0.08 * kDoes * Math.abs(Math.sin(t * 4))})`}><Hq s={h * 0.15} t={t} /></g>
          {item(ax, P.appLabel, "#ffd84a")}
          <g transform={`translate(${sx},${g}) scale(${0.95 + 0.1 * kShop})`}><Shop s={h * 0.14} t={t} /></g>
          {item(sx, P.shopLabel)}
          {coins}
          {kShop > 0 && fee && <text x={(ax + sx) / 2} y={g - h * 0.27} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(fee, 70, w * 0.4))} fill="#ffd84a" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kShop * 2)}>{fee}</text>}
        </svg>
      </AbsoluteFill>
      {kDoes > 0 && P.longLabel && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", opacity: clamp(kDoes * 2), transform: `scale(${1.3 - 0.3 * kDoes})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.longLabel, w * 0.7, 52), color: "#fff", background: "#c0392b", border: "6px solid #1d2433", borderRadius: 18, padding: "6px 24px" }}>{P.longLabel.toUpperCase()}</span>
        </div>
      )}
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffe066", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
