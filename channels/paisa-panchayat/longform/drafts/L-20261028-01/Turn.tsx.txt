/**
 * The turn: "Here's the twist. Those free flights aren't free. The shop pays the swipe fee, then
 * builds it into its prices, for everyone. Even the people paying cash."
 * A shop counter at night: the till in the middle, Rohan on the left with his airline card and
 * Sharma on the right with cash. On "free" a miles coin flutters over Rohan; on "shop" the till
 * slams down; on "fee" a coin hops from the till into the card reader; on "prices" every price
 * board on the shelf turns red and climbs; on "everyone" the climb runs down the whole shelf; on
 * "cash" the camera pushes in on Sharma, whose price arrow is just as red.
 *
 * params: { stamp: "Everyone pays" }
 * events: twist, free, shop, fee, prices, everyone, cash
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { World } from "../../studio/worlds";
import props from "./props";

const Till = props.till!, Reader = props.cardreader!, Coin = props.milescoin!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tFree = at(p, "free", 1.0), tShop = at(p, "shop", 2.4), tFee = at(p, "fee", 3.2), tPrices = at(p, "prices", 4.4), tAll = at(p, "everyone", 5.4), tCash = at(p, "cash", 6.6);
  const kTill = sp(tShop, 9), kPrices = clamp((t - tPrices) / 0.8), kAll = clamp((t - tAll) / 1.0), kStamp = sp(tCash + 0.4, 9);
  const ground = h * 0.86;
  // the camera: wide on the counter, then pushes in on Sharma's side for "cash"
  const push = clamp((t - tCash) / 0.7);
  const s = 1.0 + 0.22 * push;
  const coinHop = clamp((t - tFee) / 0.6);
  const shelf = [0.3, 0.42, 0.54, 0.66, 0.78];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "80% 70%" }}>
        <World kind="night" tint={kPrices > 0.5 ? "red" : undefined} w={w} h={h} t={t} seed="turn-shop" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {/* the shelf of goods, each with a price board that climbs */}
          <rect x={w * 0.24} y={h * 0.4} width={w * 0.6} height={h * 0.025} fill="#8a5a2b" stroke="#1d2433" strokeWidth={5} />
          {shelf.map((x, i) => {
            const climb = clamp(kPrices * 2 - i * 0.25) * (i === 0 ? 1 : kAll > 0 ? 1 : 0.35);
            return (
              <g key={x} transform={`translate(${w * x},${h * 0.4})`}>
                <rect x={-w * 0.035} y={-h * 0.12} width={w * 0.07} height={h * 0.12} rx={10} fill={["#7cc4ff", "#ffd34d", "#7cf0b2", "#f2588f", "#f08c3a"][i]} stroke="#1d2433" strokeWidth={5} />
                <rect x={-w * 0.025} y={-h * (0.2 + 0.08 * climb)} width={w * 0.05} height={h * 0.06} rx={8} fill={climb > 0.2 ? "#e5484d" : "#ffffff"} stroke="#1d2433" strokeWidth={4} />
                {climb > 0.2 && <path d={`M${w * 0.035},${-h * (0.16 + 0.08 * climb)} l${w * 0.012},${-h * 0.03} l${w * 0.012},${h * 0.03} z`} fill="#e5484d" stroke="#1d2433" strokeWidth={3} />}
              </g>
            );
          })}
          <g transform={`translate(${w * 0.5},${ground - (1 - kTill) * h * 0.5})`}><Till s={h * 0.3} t={t} state={kPrices > 0.4 ? "up" : undefined} /></g>
          <g transform={`translate(${w * 0.64},${ground})`}><Reader s={h * 0.2} t={t} state={coinHop >= 1 ? "paid" : undefined} /></g>
          {coinHop > 0 && coinHop < 1 && <g transform={`translate(${w * (0.5 + 0.14 * coinHop)},${ground - h * 0.32 - Math.sin(coinHop * Math.PI) * h * 0.14})`}><Coin s={h * 0.07} t={t} /></g>}
          {t > tFree && <g transform={`translate(${w * 0.16},${h * (0.3 - 0.03 * Math.sin(t * 3))})`}><Coin s={h * 0.09} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 1.05, acting: [{ sec: 0, pose: "present", expression: "happy", prop: "card" }, { at: "free", pose: "celebrate", expression: "laugh" }, { at: "prices", pose: "worried", expression: "shock" }] }} ground={h * 0.99} index={0} />
          <Actor p={p} spec={{ who: "sharma", x: 0.86, scale: 1.05, turn: -0.4, acting: [{ sec: 0, pose: "stand", expression: "neutral", prop: "letter" }, { at: "everyone", pose: "think", expression: "confused" }, { at: "cash", pose: "facepalm", expression: "angry" }] }} ground={h * 0.99} index={1} />
        </svg>
      </AbsoluteFill>
      {P.stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: h * 0.08, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-3deg)`, opacity: clamp(kStamp * 3) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 80, color: "#fff", background: "#a3171c", padding: "6px 34px", whiteSpace: "nowrap",
            borderRadius: 22, border: "7px solid #fff", textTransform: "uppercase", boxShadow: "0 12px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
