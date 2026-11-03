/**
 * The turn: "About {cut_pct} of every dollar spent. Paid by the shop, not the buyer."
 * A dark street, header THE SHOP'S CUT from frame 0. One giant dollar note fills the middle. On
 * "every" a thin gold slice is marked off its right edge; on "dollar" the share slams in huge above
 * it; on "shop" the slice flies out of the note into a shop front on the right with SHOP PAYS; on
 * "buyer" a buyer's bag on the left gets a green tick and BUYER.
 *
 * params: { header, pct, dollarLabel, shopLabel, buyerLabel }, events: every, dollar, shop, buyer
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Shop = props.shopfront!, Bag = props.bag!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; pct?: string; dollarLabel?: string; shopLabel?: string; buyerLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tEvery = at(p, "every", 0.8), tDollar = at(p, "dollar", 1.3), tShop = at(p, "shop", 2.6), tBuyer = at(p, "buyer", 3.4);
  const kEvery = sp(tEvery, 10), kDollar = sp(tDollar, 8), kShop = sp(tShop, 12), kBuyer = sp(tBuyer, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const nx = w * 0.5, ny = h * 0.42, nw = w * 0.72, nh = h * 0.16;
  const sliceW = nw * 0.05;
  const sx = nx + nw / 2 - sliceW / 2, shopX = w * 0.8, shopY = h * 0.72;
  const fx = sx + (shopX - sx) * kShop, fy = ny + (shopY - h * 0.1 - ny) * kShop;
  const pct = P.pct ?? "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.03 * kDollar})`, transformOrigin: "50% 45%" }}>
        <World kind="street" tint="#24315e" w={w} h={h} t={t} seed="turn-street-cut" props={props} />
        <AbsoluteFill style={{ background: "rgba(10,10,40,0.45)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={nx - nw / 2} y={ny - nh / 2} width={nw - (kEvery > 0 ? sliceW : 0)} height={nh} rx={16} fill="#8fd19e" stroke={INK} strokeWidth={7} />
          <circle cx={nx - sliceW / 2} cy={ny} r={nh * 0.3} fill="#6bbf7f" stroke={INK} strokeWidth={5} />
          <text x={nx - sliceW / 2} y={ny + nh * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={nh * 0.4} fill={INK}>$</text>
          {P.dollarLabel && <text x={nx} y={ny + nh / 2 + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.dollarLabel, nw * 0.7)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.dollarLabel.toUpperCase()}</text>}
          {kEvery > 0 && <rect x={fx - sliceW / 2} y={fy - nh / 2} width={sliceW} height={nh} rx={6} fill="#f2b631" stroke={INK} strokeWidth={6} opacity={clamp(kEvery * 2)} transform={`rotate(${kShop * 30} ${fx} ${fy})`} />}
          <g transform={`translate(${shopX},${shopY})`} opacity={0.5 + 0.5 * kShop}><Shop s={h * 0.17} t={t} /></g>
          {kShop > 0 && P.shopLabel && <text x={shopX} y={shopY + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.shopLabel, w * 0.34)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={clamp(kShop * 2)}>{P.shopLabel.toUpperCase()}</text>}
          <g transform={`translate(${w * 0.22},${shopY})`}><Bag s={h * 0.13} t={t} /></g>
          {kBuyer > 0 && <path d={`M${w * 0.17},${shopY - h * 0.17} l${w * 0.04},${w * 0.04} l${w * 0.08},${-w * 0.08}`} stroke={PALETTE.green} strokeWidth={16} fill="none" strokeLinecap="round" opacity={clamp(kBuyer * 2)} />}
          {kBuyer > 0 && P.buyerLabel && <text x={w * 0.22} y={shopY + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.buyerLabel, w * 0.3)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={clamp(kBuyer * 2)}>{P.buyerLabel.toUpperCase()}</text>}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#8a63d2", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {kDollar > 0 && pct && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.17, textAlign: "center", transform: `scale(${1.6 - 0.6 * kDollar})`, opacity: clamp(kDollar * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(pct, 170, w * 0.5)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{pct}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
