// Thumbnail C: the pattern of "The Hyatt Regency Walkway Collapse" (Fascinating Horror, 1.66M) and "Fast-Tracked
// Failure" (Brick Immortar, 1.2M): big serious type over one document-like picture. Ours: the real report page
// (NBS, public domain) close on the finding, the line circled in red, one heavy word on top.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

const PAGE = "media/disasters-and-engineering-failures-expla/report-document-89e880ead391-p007.png";

export default function ThumbC({ w, h }: ThumbProps) {
  // the page is 1373×1910; the finding's line sits at 53% of its height: scale it so that line fills the width
  const pw = w * 1.35, ph = pw * (1910 / 1373);
  const top = h * 0.62 - ph * 0.543;
  return (
    <AbsoluteFill style={{ background: "#0b0d12", overflow: "hidden" }}>
      <Img src={staticFile(PAGE)} style={{ position: "absolute", width: pw, height: ph, left: (w - pw) / 2 + w * 0.02, top, transform: "rotate(-2deg)", filter: "contrast(1.15) sepia(0.15)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,16,0.92) 0%, rgba(8,10,16,0.55) 38%, rgba(8,10,16,0) 52%, rgba(8,10,16,0) 78%, rgba(8,10,16,0.7) 100%)" }} />
      <Ring x={w * 0.27} y={h * 0.645} rx={w * 0.29} ry={h * 0.06} w={w} h={h} />
      <Words text="It *doubled*" x={w * 0.05} y={30} width={w * 0.9} size={150} align="left" />
    </AbsoluteFill>
  );
}
