/**
 * The payoff: "Your card buys Delta's miles. Is it only the seats?"
 * Rohan's office at dusk: his open wallet big in the middle with the gold card, the jet parked on
 * the right, Rohan on the left thinking. On "card" the card lifts out of the wallet with YOUR WALLET
 * under it; on "buys" (event wallet) the wallet hops; on "miles" notes fly from the card to the jet and three
 * MILES badges fly back; on "seats" a plane seat drops in, ONLY THE SEATS? stamps across the middle
 * and the camera pulls wide.
 *
 * params: { walletLabel, milesLabel, ask }, events: card, wallet, miles, seats
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Wallet = props.wallet!, Card = props.rewardcard!, Jet = props.jetliner!, Badge = props.milesbadge!, Seat = props.planeseat!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { walletLabel?: string; milesLabel?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCard = at(p, "card", 0.3), tWallet = at(p, "wallet", 0.9), tMiles = at(p, "miles", 1.8), tSeats = at(p, "seats", 3.2);
  const kCard = sp(tCard, 12), kWallet = sp(tWallet, 8), kMiles = sp(tMiles, 12), kSeats = sp(tSeats, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const lab = (s: string, max: number, base = 50) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, wx = w * 0.4, jx = w * 0.76;
  const cardY = g - h * 0.1 - kCard * h * 0.14;
  const zoom = 1.08 - 0.08 * kSeats;
  const hop = kWallet * Math.abs(Math.sin((t - tWallet) * 7)) * (t < tWallet + 0.6 ? 1 : 0);
  const notes = t < tMiles ? [] : Array.from({ length: 4 }, (_, i) => {
    const f = ((t - tMiles) * 0.9 + i / 4) % 1;
    const x = wx + (jx - wx) * f, y = cardY - Math.sin(f * Math.PI) * h * 0.08;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kMiles * 2)} />;
  });
  const badges = t < tMiles + 0.3 ? [] : [0, 1, 2].map((i) => {
    const f = clamp((t - tMiles - 0.3 - i * 0.25) / 0.8);
    const x = jx + (wx + (i - 1) * w * 0.12 - jx) * f, y = g - h * 0.32 - Math.sin(f * Math.PI) * h * 0.06;
    return f > 0 ? <g key={i} transform={`translate(${x},${y})`}><Badge s={h * 0.07} t={t + i} /></g> : null;
  });
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 100, box.x1 - box.x0 - 40, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="office" tint="#2f3a6e" w={w} h={h} t={t} seed="payoff-wallet-miles" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${jx},${g})`}><Jet s={h * 0.1} t={t} /></g>
          <g transform={`translate(${wx},${g - hop * h * 0.03})`}><Wallet s={h * 0.17} t={t} /></g>
          <g transform={`translate(${wx},${cardY}) rotate(${-10 * kCard})`}><Card s={h * 0.11} t={t} /></g>
          {notes}
          {badges}
          {kSeats > 0 && <g transform={`translate(${w * 0.62},${g + h * 0.02 - (1 - kSeats) * h * 0.3})`} opacity={clamp(kSeats * 3)}><Seat s={h * 0.13} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 0.8, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "seats", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {P.walletLabel && (
        <div style={{ position: "absolute", left: wx - w * 0.22, width: w * 0.44, top: h * 0.45, textAlign: "center", opacity: clamp(kCard * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.walletLabel, w * 0.4, 56), color: "#1d2433", background: "#ffd84a", padding: "4px 20px", borderRadius: 12, border: "5px solid #1d2433" }}>{P.walletLabel.toUpperCase()}</span>
        </div>
      )}
      {kMiles > 0 && P.milesLabel && (
        <div style={{ position: "absolute", left: jx - w * 0.2, width: w * 0.36, top: h * 0.12, textAlign: "center", opacity: clamp(kMiles * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.milesLabel, w * 0.3, 72), color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.milesLabel.toUpperCase()}</span>
        </div>
      )}
      {kSeats > 0 && ask && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.27, textAlign: "center", transform: `rotate(-5deg) scale(${1.6 - 0.6 * kSeats})`, opacity: clamp(kSeats * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", background: "#d63031", padding: `${aSize * 0.12}px ${aSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 16 }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
