// Thumbnail C: the pattern of the investigation-board videos (CSB safety videos, 0.55M, 0.19M): the
// official finding up front. Ours: the real CSB report page (public domain) close on its finding, the line
// ringed in red, heavy words on top.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

const PAGE = "media/disasters-and-engineering-failures-expla/report-document-3f57172277f7-p018.png";

export default function ThumbReport({ w, h }: ThumbProps) {
  const pw = w * 1.35, ph = pw * (1980 / 1530);
  const top = h * 0.62 - ph * 0.278;
  return (
    <AbsoluteFill style={{ background: "#0b0d12", overflow: "hidden" }}>
      <Img src={staticFile(PAGE)} style={{ position: "absolute", width: pw, height: ph, left: (w - pw) / 2 + w * 0.06, top, transform: "rotate(-2deg)", filter: "contrast(1.15) sepia(0.15)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,16,0.92) 0%, rgba(8,10,16,0.55) 38%, rgba(8,10,16,0) 52%, rgba(8,10,16,0) 78%, rgba(8,10,16,0.7) 100%)" }} />
      <Ring x={w * 0.5} y={h * 0.63} rx={w * 0.44} ry={h * 0.07} w={w} h={h} />
      <Words text="Every *level* failed" x={w * 0.05} y={30} width={w * 0.9} size={150} align="left" />
    </AbsoluteFill>
  );
}
