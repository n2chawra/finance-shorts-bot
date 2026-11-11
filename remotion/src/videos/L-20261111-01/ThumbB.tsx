/**
 * Thumbnail B, the face (owner, 2026-11-11: three thumbnails from this topic's own hits). The pattern of
 * "VFX Artist Uses CGI to Reveal the True Scale of A BILLION!" (Corridor Crew, 7.05M): one shocked face in the
 * middle, the question in huge yellow words across the top, a wall of cash filling everything behind, a yellow
 * frame. Ours: Sharma, shocked, in front of a wall of cash pallets, A BILLION?! over him.
 */
import React from "react";
import { Face, Thing, type ThumbProps, Words } from "../../studio/thumb";
import { AbsoluteFill } from "remotion";

export default function ThumbB({ tl, th, w, h }: ThumbProps) {
  const s = h * 0.24, cols = 9, rows = 4;
  return (
    <AbsoluteFill style={{ background: "#0c2a18", overflow: "hidden" }}>
      {/* the wall of cash */}
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => (
        <Thing key={`${r}-${c}`} tl={tl} prop="pallet" x={(c + (r % 2) * 0.5 - 0.25) * s * 1.06} y={h * 1.02 - r * s * 0.97} s={s} w={w} h={h} />
      )))}
      {/* a dark pool behind the face so it separates from the money */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 72%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 38%, rgba(0,0,0,0) 62%)" }} />
      <Face who={th.who} x={w * 0.5} y={h * 1.78} scale={2.15} pose={th.pose ?? "shrug"} expression={th.expression ?? "shock"} gaze={[0, 0]} w={w} h={h} />
      {/* the black band and the question, as the hit has it */}
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 168, background: "#000" }} />
      <Words text={th.words} x={20} y={14} width={w - 40} size={150} color="#ffd84a" hi="#ffffff" align="center" />
      <AbsoluteFill style={{ border: "14px solid #ffd84a" }} />
    </AbsoluteFill>
  );
}
