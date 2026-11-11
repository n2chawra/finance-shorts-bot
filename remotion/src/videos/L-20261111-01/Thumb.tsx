/**
 * Thumbnail A, the ladder (owner, 2026-11-11: three thumbnails from this topic's own hits). The pattern of
 * "Could You Spend $1 Trillion?" (jack pockets, 12.3M) and "What YOU Can SEE Through a $1 Billion, $32,000 and an
 * $800 Telescope" (3.07M): three side-by-side panels, each a sum written huge over the one thing it buys or fills,
 * every panel a different colour, the biggest last. Ours: one note, a pile of straps, the warehouse room packed
 * with notes. The sums are the video's own figures ({note_amount}, {spendm_total_long}, {room_final_long}).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Thing, type ThumbProps } from "../../studio/thumb";
import { FONT } from "../../design/fonts";

const PANELS = [
  { fig: "note_amount", bg: ["#2f6fe0", "#0b1f52"], prop: "hundred", s: 0.26 },
  { fig: "spendm_total_long", bg: ["#9a4fe8", "#2b0d55"], prop: "strap", s: 0.2 },
  { fig: "room_final_long", bg: ["#ff5a36", "#5a0d06"], prop: "warehouse", s: 0.27 },
] as const;

const Sum: React.FC<{ text: string; x: number; width: number; size: number }> = ({ text, x, width, size }) => (
  <div style={{ position: "absolute", left: x, top: 22, width, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1,
    color: "#fff", textTransform: "uppercase", letterSpacing: -2, WebkitTextStroke: `${Math.round(size * 0.09)}px #000`, paintOrder: "stroke fill",
    textShadow: `0 ${Math.round(size * 0.08)}px 0 rgba(0,0,0,0.55)`, whiteSpace: "nowrap" }}>{text}</div>
);

export default function Thumb({ tl, w, h }: ThumbProps) {
  const pw = w / 3;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {PANELS.map((p, i) => {
        const x = i * pw, text = String(tl.figures?.[p.fig] ?? "");
        return (
          <React.Fragment key={p.fig}>
            <div style={{ position: "absolute", left: x, top: 0, width: pw, height: h, background: `radial-gradient(circle at 50% 60%, ${p.bg[0]} 0%, ${p.bg[1]} 80%)` }} />
            {p.prop === "strap"
              ? ([[-0.55, 0], [0.55, 0], [0, 0], [-0.28, -1], [0.28, -1], [0, -2]] as const).map(([dx, row], k) => (
                <Thing key={k} tl={tl} prop="strap" x={x + pw / 2 + dx * h * 0.24} y={h * 0.9 + row * h * 0.115} s={h * p.s} w={w} h={h} />))
              : <Thing tl={tl} prop={p.prop} x={x + pw / 2} y={h * (p.prop === "hundred" ? 0.82 : 0.92)} s={h * p.s} state="full" rot={p.prop === "hundred" ? -6 : 0} w={w} h={h} />}
            <Sum text={text} x={x + 8} width={pw - 16} size={text.length > 8 ? 76 : 120} />
          </React.Fragment>
        );
      })}
      {/* white seams between the panels, as the hits draw them */}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {[1, 2].map((i) => <rect key={i} x={i * pw - 6} y={0} width={12} height={h} fill="#fff" />)}
      </svg>
    </AbsoluteFill>
  );
}
