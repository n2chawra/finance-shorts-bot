/**
 * The thumbnail, modelled on the topic's most viewed videos (2026-11-04 refs sheet): Dhruv Rathee
 * "The Middle Class TRAP" 10.1M (a man running on a treadmill inside giant gears, one huge red-boxed
 * word with a question mark, a big worried face), EverythingProfessor "Every Financial Trap Middle
 * Class People Fall Into" 1.09M (the traps as things in red-ringed circles: the car, the house),
 * Mark Tilbury "Borrow until you die" 2.86M (two or three huge stacked words, one in red, a face at
 * the side). Ours: Rohan, big and worried, running on his treadmill; the traps that drain him (the
 * car, the bigger house, the fee tap) circled in red behind; SIX TRAPS? huge, one word in red.
 */
import React from "react";
import { Face, Glow, Ring, Thing, type ThumbProps, Words } from "../../studio/thumb";

export default function Thumb({ tl, th, w, h }: ThumbProps) {
  const base = h * 0.95;
  return (
    <Glow from="#d9480f" to="#1a0b05" at={[0.3, 0.45]}>
      {/* the treadmill he can't get off, big at the bottom left */}
      <Thing tl={tl} prop="treadmill" x={w * 0.3} y={base} s={h * 0.52} state="fast" w={w} h={h} />
      {/* the traps, each circled in red */}
      <Thing tl={tl} prop="sedan" x={w * 0.52} y={h * 0.55} s={h * 0.16} w={w} h={h} />
      <Ring x={w * 0.52} y={h * 0.48} rx={w * 0.085} w={w} h={h} />
      <Thing tl={tl} prop="bighouse" x={w * 0.53} y={h * 0.9} s={h * 0.16} w={w} h={h} />
      <Ring x={w * 0.52} y={h * 0.81} rx={w * 0.085} w={w} h={h} />
      <Words text={th.words} x={36} y={18} width={w * 0.62} size={150} hi="#ff3b30" />
      <Face who={th.who} x={w * 0.85} y={h * 1.62} scale={2.05} pose={th.pose ?? "worried"} expression={th.expression ?? "shock"} gaze={[-1, 0.1]} flip w={w} h={h} />
    </Glow>
  );
}
