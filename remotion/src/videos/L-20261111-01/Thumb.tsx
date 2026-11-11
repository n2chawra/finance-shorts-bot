/**
 * The thumbnail, redone 2026-11-11 (owner: "4 clicks from 100 impressions, the thumbnail is the biggest
 * problem"; research long-thumb-one-subject-matches-title). The first cover said "Million? Cute." under a
 * $1 billion title, packed ten small things and a calm smirk. This one follows the topic's hits instead:
 * "The Middle Class TRAP" 10.1M (one boxed word top left, one scene, one big reacting face on the right),
 * "Borrow until you die" 2.86M (stacked huge words, the last in a red box, a face at the side) and the
 * scale-of-wealth explainers (one tiny person against one towering pile). Ours: a tower of cash pallets
 * running out of the top of the frame, tiny Rohan at its foot looking up, THIS IS / the billion (a figure
 * th.figure, {room_final_long} from the maths) in a red box, and Sharma big on the right, shocked. Gold-green money on a deep violet
 * ground, so the subject never melts into the background.
 */
import React from "react";
import { Face, Glow, Thing, type ThumbProps, Words } from "../../studio/thumb";
import { FONT } from "../../design/fonts";

export default function Thumb({ tl, th, w, h }: ThumbProps) {
  const s = h * 0.2;                         // one pallet
  const colW = s * 1.06, cx = w * 0.5;       // the tower: three pallets wide, in the middle
  const floor = h * 0.985;
  const rows = 6;                            // runs out of the top of the frame
  const billion = String(th.figure ?? "");   // {room_final_long}, computed by the maths
  return (
    <Glow from="#6c4cf0" to="#0a0620" at={[0.5, 0.5]}>
      {/* the floor */}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <rect x={0} y={floor - 8} width={w} height={h - floor + 8} fill="#07051a" />
      </svg>
      {/* the tower of cash pallets, back to front */}
      {Array.from({ length: rows }).map((_, r) => [-1, 0, 1].map((c) => (
        <Thing key={`${r}${c}`} tl={tl} prop="pallet" x={cx + c * colW} y={floor - r * s * 0.99} s={s} w={w} h={h} />
      )))}
      {/* the tiny person at its foot, looking up */}
      <Face who="rohan" x={cx - colW * 2.1} y={floor} scale={0.2} pose="worried" expression="shock" gaze={[0.6, -1]} w={w} h={h} />
      {/* THIS IS / $1 BILLION */}
      <Words text={th.words} x={34} y={20} width={w * 0.42} size={130} />
      {billion && (
        <div style={{ position: "absolute", left: 30, top: 170, fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1, color: "#fff",
          background: "#e8202a", padding: "10px 26px 14px", borderRadius: 14, border: "8px solid #fff", whiteSpace: "nowrap", textTransform: "uppercase",
          letterSpacing: -2, transform: "rotate(-3deg)", boxShadow: "0 14px 0 rgba(0,0,0,0.5)", WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>
          {billion}
        </div>
      )}
      {/* Sharma, big and shocked, looking at the tower */}
      <Face who={th.who} x={w * 0.9} y={h * 1.62} scale={2.0} pose={th.pose ?? "stand"} expression={th.expression ?? "shock"} gaze={[-1, -0.3]} flip w={w} h={h} />
    </Glow>
  );
}
