// Payoff: "That's 64% of the profit, from a card. The cart is the bait. Would you renew yours?"
// Back on the warehouse floor of the hook: the card's blue rises up the cash pallet to the share on "profit",
// the share stamps on the giant card on "card"; on "bait" Rohan's cart rolls past under a dangling fishing
// hook; on "renew" he holds his card up to the camera, and the last frames glide back to the opening shot.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BLUE, BigCard, Cart, CashPallet, Warehouse, frac } from "./props";

type Params = { fig?: { share?: string; profit?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const profit = m.at("profit", 20), card = m.at("card", 36), bait = m.at("bait", 60), renew = m.at("renew", m.end - 24);
  const flood = m.lerp([profit - 8, profit + 10], [0, frac(F.share)]);
  const mid = m.lerp([bait - 4, bait + 12], [0, 1], Easing.inOut(Easing.cubic));
  const cl = m.lerp([renew - 6, renew + 8], [0, 1], Easing.inOut(Easing.cubic));
  const home = m.lerp([m.end - 14, m.end], [0, 1], Easing.inOut(Easing.cubic));
  let zoom = 1 + 0.15 * mid + 0.35 * cl, cx = 540 + 40 * cl, cy = 900 + 80 * mid + 60 * cl;
  zoom = zoom + (1.12 - zoom) * home; cx = cx + (400 - cx) * home; cy = cy + (880 - cy) * home;
  const roll = m.lerp([bait - 16, bait + 30], [-700, 1500]);
  const up = m.t > renew - 8;
  return (
    <Stage p={p} bg="#c9ccd6" vignette={0.35}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <Warehouse floor={1250} />
        <CashPallet x={120} y={1250} w={380} h={560} fill={flood} />
        <Tag x={130} y={500} w={360} h={150} text={F.profit ?? ""} size={84} />
        <Txt x={310} y={470} size={44} fill={INK}>PROFIT</Txt>
        <BigCard x={560} y={560} w={400} h={660} rot={4} />
        <Tag x={150} y={1010} w={320} h={130} text={F.share ?? ""} rot={-6} size={84} bg="#ffffff" fg={BLUE} k={m.pop(profit + 6, 9)} />
        <Tag x={600} y={300} w={330} h={120} text="PAYS" rot={6} size={70} bg={BLUE} fg="#ffffff" k={m.pop(card - 2, 9)} />
        {/* the bait: a cart rolling under a fishing hook */}
        <g transform={`translate(${roll} 0)`}>
          <line x1={0} y1={-200} x2={0} y2={1020 + m.wave(30, 10)} stroke={INK} strokeWidth={4} />
          <path d={`M 0 ${1020 + m.wave(30, 10)} q 0 40 -24 40 q -24 0 -24 -24`} fill="none" stroke="#6b7080" strokeWidth={8} strokeLinecap="round" />
          <Cart x={0} y={1340} s={0.9} spin={m.t * 18} />
        </g>
        <Char x={m.lerp([renew - 20, renew], [780, 600])} y={1560} s={250} who="rohan" hair="side" outfit="shirt" face={up ? "grin" : "smirk"} look={up ? [0, 0] : [-1, -0.3]}
          armR={up ? [-150, -170] : [15, 10]} armL={[15, 10]}
          holdR={up ? (h) => <BigCard x={h[0] - 90} y={h[1] - 130} w={180} h={116} name={false} rot={-8} /> : undefined} />
      </View>
    </Stage>
  );
};

export default Payoff;
