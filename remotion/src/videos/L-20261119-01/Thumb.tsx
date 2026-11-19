/**
 * Thumbnail A, the product on a brand-colour plate (owner, 2026-11-11: three thumbnails from this topic's own hits).
 * The pattern of "Crocs - The Rise and Fall...And Rise Again" (Company Man, 1.09M) and "Why everyone wears these ugly
 * shoes" (Michael Girdley, 141K): one clog huge on a saturated green plate, two or three heavy words, a red arrow.
 * Ours: the black clogs from the video's first frame, a red arrow falling, and the loss figure on a red tag.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Arrow, Badge, Words, type ThumbProps } from "../../studio/thumb";

const MEDIA = "media/business-documentaries-rise-and-fall-of/";

export default function Thumb({ tl, w, h }: ThumbProps) {
  const loss = String(tl.figures?.fact3 ?? "");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 40%, #5fd13a 0%, #1f7a14 55%, #0b2e07 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -40, top: 90, width: w * 0.62, height: h * 0.86, borderRadius: 28, overflow: "hidden",
        border: "10px solid #fff", transform: "rotate(-4deg)", boxShadow: "0 24px 0 rgba(0,0,0,0.4)" }}>
        <Img src={staticFile(MEDIA + "commons-photo-crocs-synthetic-clogs-712e2467.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 55%", transform: "scale(1.25)" }} />
      </div>
      <Words text="Nearly *bust*" x={w * 0.56} y={70} width={w * 0.42} size={150} />
      <Arrow a={[w * 0.66, h * 0.52]} b={[w * 0.9, h * 0.86]} bend={-0.2} w={w} h={h} />
      <Badge text={`lost ${loss}`} x={w * 0.5} y={h * 0.74} size={58} rot={-6} />
    </AbsoluteFill>
  );
}
