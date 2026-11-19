/**
 * Thumbnail C, the fall drawn over the product (owner, 2026-11-11: three thumbnails from this topic's own hits). The
 * pattern of "WTF Happened to Labubu?" (Fortune & Fall, 2.28M): the product big on one side, a falling red chart
 * arrow behind it, two huge words with one in red. Ours: the clog in the sand from the video, a sales line that
 * drops and climbs back, "then huge" in the words.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";

const MEDIA = "media/business-documentaries-rise-and-fall-of/";

export default function ThumbC({ w, h }: ThumbProps) {
  // the shape only, no axis figures: up, a crash, then a climb past the old high
  const pts = ([[0.48, 0.62], [0.6, 0.3], [0.7, 0.72], [0.8, 0.6], [0.97, 0.08]] as const).map(([x, y]) => `${x * w},${y * h}`).join(" ");
  return (
    <AbsoluteFill style={{ background: "linear-gradient(120deg, #f4efe6 0%, #e6dccb 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w * 0.52, height: h, overflow: "hidden" }}>
        <Img src={staticFile(MEDIA + "commons-photo-crocs-shoes-on-sandy-point-beach-9717478835-5a1c4991.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "55% 50%" }} />
      </div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <polyline points={pts} fill="none" stroke="#fff" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts} fill="none" stroke="#e8261c" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Words text="*Dead*. Then huge" x={w * 0.52} y={h * 0.5} width={w * 0.46} size={104} hi="#e8261c" />
    </AbsoluteFill>
  );
}
