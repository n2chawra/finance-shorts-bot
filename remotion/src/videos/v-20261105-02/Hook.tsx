/**
 * Hook (a myth): "You think Costco gets rich on your giant cart? It doesn't. Here's how."
 * A street at night, a big warehouse store behind, Rohan on the left beside a heaped giant cart.
 * Frame 0 reads RICH ON YOUR CART? On "cart" the cart hops and fills higher; on "doesn't" a red cross
 * slams over the cart; on "how" the store's roller door lifts and a gold question ring pulses on it.
 *
 * params: { line, cartLabel, storeLabel }, events: costco, rich, cart, doesnt, how
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Cart = props.giantcart!, Store = props.warehouse!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; cartLabel?: string; storeLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCart = at(p, "cart", 1.2), tNo = at(p, "doesnt", 2.0), tHow = at(p, "how", 3.0);
  const kCart = sp(tCart, 8), kNo = sp(tNo, 9), kHow = sp(tHow, 12);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 40, { upper: true }));
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 52, max, { upper: true }));
  const g = h * 0.7, cx = w * 0.5, sx = w * 0.68, sy = h * 0.52;
  const hop = kCart * Math.abs(Math.sin((t - tCart) * 7)) * h * 0.02 * clamp(1 - (t - tCart) / 1.2);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t})`, transformOrigin: "55% 60%" }}>
        <World kind="street" tint="#2a3d7a" w={w} h={h} t={t} seed="hook-street-costco" props={props} horizon={[{ prop: "pallet", x: 0.1, size: 0.05 }]} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${sx},${sy})`}><Store s={h * 0.2} t={t} state={kHow > 0.3 ? "open" : undefined} /></g>
          {P.storeLabel && <text x={sx} y={sy - h * 0.15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.storeLabel, w * 0.4)} fill="#fff" stroke={INK} strokeWidth={7} paintOrder="stroke">{P.storeLabel.toUpperCase()}</text>}
          {kHow > 0 && <circle cx={sx} cy={sy - h * 0.05} r={h * 0.09 * (0.6 + 0.4 * kHow)} fill="none" stroke="#ffd84a" strokeWidth={9} opacity={0.85 * (1 - clamp((t - tHow) / 1.5))} />}
          {kHow > 0 && <text x={sx} y={sy - h * 0.02} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.06} fill="#ffd84a" stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={clamp(kHow * 2)}>?</text>}
          <g transform={`translate(${cx},${g - hop})`}><Cart s={h * 0.24} t={t} k={0.6 + 0.4 * kCart} /></g>
          {P.cartLabel && <text x={cx} y={g + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.cartLabel, w * 0.36)} fill="#ffd84a" stroke={INK} strokeWidth={7} paintOrder="stroke">{P.cartLabel.toUpperCase()}</text>}
          {kNo > 0 && <path d={`M${cx - w * 0.16},${g - h * 0.2} L${cx + w * 0.16},${g - h * 0.02} M${cx + w * 0.16},${g - h * 0.2} L${cx - w * 0.16},${g - h * 0.02}`}
            stroke={PALETTE.red} strokeWidth={22} strokeLinecap="round" opacity={clamp(kNo * 2)} transform={`scale(1)`} />}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 0.9, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "doesnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
