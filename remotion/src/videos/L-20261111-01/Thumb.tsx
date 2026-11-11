/**
 * The thumbnail, modelled on the hits on this sheet (2026-11-11 refs): "Basic Economics" 3.79M and
 * "Entire map, starting from $0" 858K (two huge words, one boxed, over a row of small drawn things on
 * a money-green ground), and "Borrow until you die" 2.86M (stacked huge words, one in a second colour,
 * a big face at the side). Ours: one small $100 note on the left facing a warehouse room bursting
 * with pallets of cash (the hook's picture), the other ways to measure a billion in a row along the
 * bottom, MILLION? CUTE. huge at the top left, and Sharma big on the right, smirking at the viewer.
 */
import React from "react";
import { Arrow, Face, Glow, Thing, type ThumbProps, Words } from "../../studio/thumb";

export default function Thumb({ tl, th, w, h }: ThumbProps) {
  const base = h * 0.78;
  return (
    <Glow from="#2fb37a" to="#06301c" at={[0.4, 0.5]}>
      {/* the note against the room */}
      <Thing tl={tl} prop="hundred" x={w * 0.13} y={base} s={h * 0.16} rot={-6} w={w} h={h} />
      <Arrow a={[w * 0.21, h * 0.66]} b={[w * 0.32, h * 0.62]} bend={-0.35} width={18} w={w} h={h} />
      <Thing tl={tl} prop="warehouse" x={w * 0.5} y={base} s={h * 0.5} state="full" w={w} h={h} />
      <Thing tl={tl} prop="pallet" x={w * 0.37} y={base + h * 0.04} s={h * 0.16} w={w} h={h} />
      <Thing tl={tl} prop="pallet" x={w * 0.63} y={base + h * 0.04} s={h * 0.16} w={w} h={h} />
      {/* the row of other measures along the bottom */}
      <Thing tl={tl} prop="wallet" x={w * 0.07} y={h * 0.99} s={h * 0.13} w={w} h={h} />
      <Thing tl={tl} prop="hourglass" x={w * 0.2} y={h * 0.99} s={h * 0.15} w={w} h={h} />
      <Thing tl={tl} prop="fountain" x={w * 0.34} y={h * 0.99} s={h * 0.14} w={w} h={h} />
      <Thing tl={tl} prop="crowd" x={w * 0.5} y={h * 0.99} s={h * 0.12} w={w} h={h} />
      <Thing tl={tl} prop="rocket" x={w * 0.64} y={h * 0.99} s={h * 0.16} w={w} h={h} />
      <Words text={th.words} x={30} y={14} width={w * 0.62} size={150} hi="#ffd84a" />
      <Face who={th.who} x={w * 0.87} y={h * 1.6} scale={2.0} pose={th.pose ?? "point"} expression={th.expression ?? "smirk"} gaze={[-1, 0.1]} flip w={w} h={h} />
    </Glow>
  );
}
