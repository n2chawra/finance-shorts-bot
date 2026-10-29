/**
 * The thumbnail, modelled on the topic's most viewed videos (search "why the rich borrow money instead
 * of selling", 2026-10-29): Alux "Buy Borrow Die" 1.31M, Sherman 537K, Wealth Logic "The debt money
 * rule" 325K, Karlton Dennis 305K. What they share: the strategy as a chain of things joined by red
 * arrows, two or three huge stacked words with one in a second colour, and one big face at the side.
 * Ours: the house that stays, the loan against it, the cash it frees; Sharma, big, pointing at it.
 */
import React from "react";
import { Arrow, Face, Glow, Thing, type ThumbProps, Words } from "../../studio/thumb";

export default function Thumb({ tl, th, w, h }: ThumbProps) {
  const base = h * 0.9;
  return (
    <Glow from="#2f63e0" to="#0a1028" at={[0.72, 0.42]}>
      {/* the chain: keep the house, borrow on it, spend the cash */}
      <Thing tl={tl} prop="house" x={w * 0.13} y={base} s={h * 0.3} w={w} h={h} />
      <Arrow a={[w * 0.21, h * 0.72]} b={[w * 0.31, h * 0.74]} bend={-0.3} width={18} w={w} h={h} />
      <Thing tl={tl} prop="receipt" x={w * 0.37} y={base} s={h * 0.27} rot={-6} w={w} h={h} />
      <Arrow a={[w * 0.43, h * 0.72]} b={[w * 0.52, h * 0.74]} bend={-0.3} width={18} w={w} h={h} />
      <Thing tl={tl} prop="cash" x={w * 0.62} y={base} s={h * 0.24} w={w} h={h} />
      <Words text={th.words} x={36} y={18} width={w * 0.62} size={140} hi="#4fd1ff" />
      <Face who={th.who} x={w * 0.86} y={h * 1.62} scale={2.05} pose={th.pose ?? "point"} expression={th.expression ?? "smirk"} gaze={[1, 0.2]} flip w={w} h={h} />
    </Glow>
  );
}
