/**
 * Thumbnail B, the document (owner, 2026-11-11: three thumbnails from this topic's own hits). The pattern of "I sued
 * Crocs India without a lawyer" (Yoopa Rebe, 132K): the paper itself fills the frame, the one line that matters marked
 * by hand, two heavy words on top. Ours: Crocs' own 2008 annual report with the going-concern line highlighted and
 * circled in red, a clog cut in beside it.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

const MEDIA = "media/business-documentaries-rise-and-fall-of/";

export default function ThumbB({ w, h }: ThumbProps) {
  // the page is 2041x1632; its risk-factor line sits at 37-41% of the height, 4-54% of the width
  const pw = w * 1.35, ph = pw * (1632 / 2041), px = -w * 0.08, py = -ph * 0.3;
  return (
    <AbsoluteFill style={{ background: "#14110f", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: px, top: py, width: pw, height: ph, transform: "rotate(-3deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
        <Img src={staticFile(MEDIA + "edgar-1334036-0001047469-09-002818-p015.png")} style={{ width: "100%", height: "100%" }} />
        <div style={{ position: "absolute", left: pw * 0.03, top: ph * 0.372, width: pw * 0.52, height: ph * 0.04, background: "rgba(255,221,0,0.55)", mixBlendMode: "multiply" }} />
      </div>
      <Ring x={w * 0.42} y={py + ph * 0.392} rx={w * 0.4} ry={56} w={w} h={h} />
      <div style={{ position: "absolute", right: 30, bottom: 26, width: w * 0.36, height: h * 0.5, borderRadius: 22, overflow: "hidden", border: "9px solid #fff",
        transform: "rotate(5deg)", boxShadow: "0 20px 0 rgba(0,0,0,0.45)" }}>
        <Img src={staticFile(MEDIA + "commons-photo-single-croc-ef3df225.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Words text="Auditors *worried*" x={36} y={h * 0.6} width={w * 0.56} size={130} />
    </AbsoluteFill>
  );
}
