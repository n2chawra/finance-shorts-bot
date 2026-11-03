/**
 * The answer begins: "The shop pays it. In one quarter, shops paid Affirm {fact1}."
 * A bright street, header THE SHOP PAYS from frame 0. A shop front on the left, Affirm's building on
 * the right. On "shop" the shop pops forward; on "quarter" a calendar chip ONE QUARTER drops in; on
 * "paid" coins stream from the shop into Affirm; on "Affirm" the building glows and the quarter's fee
 * slams in big above the coin stream. The source line (printed once a video) sits under the scene,
 * wrapped to fit.
 *
 * params: { header, fee, shopLabel, appLabel, quarterLabel }, events: shop, quarter, paid, affirm
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { showsSource } from "../../studio/source";
import { World } from "../../studio/worlds";
import props from "./props";

const ShopFront = props.shopfront!, Hq = props.lenderhq!;

const Shop: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; fee?: string; shopLabel?: string; appLabel?: string; quarterLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.9 } }));
  const tShop = at(p, "shop", 0.3), tQ = at(p, "quarter", 1.2), tPaid = at(p, "paid", 2.0), tAff = at(p, "affirm", 2.4);
  const kShop = sp(tShop, 9), kQ = sp(tQ, 9), kPaid = sp(tPaid, 12), kAff = sp(tAff, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.6, sx = w * 0.26, ax = w * 0.74;
  const coins = t < tPaid ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tPaid) * 1.2 + i / 6) % 1;
    return <circle key={i} cx={sx + (ax - sx) * f} cy={g - h * 0.1 - Math.sin(f * Math.PI) * h * 0.04} r={h * 0.015} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  const fee = P.fee ?? "";
  const fy = g - h * 0.23;
  const src = showsSource(p) ? (p.tl.sources ?? "") : "";
  const srcSize = Math.max(min, Math.min(min * 1.05, fitWords(src, min * 1.05, box.x1 - box.x0 - 100)));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * kAff})`, transformOrigin: "50% 50%" }}>
        <World kind="street" tint="#f08c3a" w={w} h={h} t={t} seed="shop-street-pays" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${sx},${g}) scale(${0.9 + 0.15 * kShop})`}><ShopFront s={h * 0.17} t={t} /></g>
          {P.shopLabel && <text x={sx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.shopLabel, w * 0.36)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.shopLabel.toUpperCase()}</text>}
          {kAff > 0 && <circle cx={ax} cy={g - h * 0.1} r={h * 0.15} fill="#ffd84a" opacity={0.25 * kAff} />}
          <g transform={`translate(${ax},${g})`}><Hq s={h * 0.17} t={t} /></g>
          {P.appLabel && <text x={ax} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.appLabel, w * 0.36)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.appLabel.toUpperCase()}</text>}
          {coins}
          {kQ > 0 && P.quarterLabel && <g transform={`translate(${w * 0.5},${g - h * 0.32 - (1 - kQ) * h * 0.05})`} opacity={clamp(kQ * 2)}>
            <rect x={-w * 0.2} y={-min * 1.1} width={w * 0.4} height={min * 1.6} rx={14} fill="#fff" stroke={INK} strokeWidth={5} />
            <text y={min * 0.15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.quarterLabel, w * 0.34, 50)} fill={INK}>{P.quarterLabel.toUpperCase()}</text>
          </g>}
          {kAff > 0 && fee && <text x={w * 0.5} y={fy} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.max(min, fitLine(fee, 100, w * 0.7))} fill="#ffd84a" stroke={INK} strokeWidth={10} paintOrder="stroke" opacity={clamp(kAff * 2)} transform={`translate(${w * 0.5},${fy}) scale(${1.5 - 0.5 * kAff}) translate(${-w * 0.5},${-fy})`}>{fee}</text>}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#e5484d", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {src && (
        <div style={{ position: "absolute", left: box.x0 + 40, right: w - box.x1 + 40, top: h * 0.155, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: srcSize, lineHeight: 1.2, color: "#fff", background: "rgba(0,0,0,0.6)", borderRadius: 18, padding: "6px 20px" }}>{src}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Shop;
