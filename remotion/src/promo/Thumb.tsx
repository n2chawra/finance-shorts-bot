import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../design/fonts";

const Phone: React.FC<{ src: string; x: number; y: number; w: number; rot: number }> = ({ src, x, y, w, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: w * 16 / 9, transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", inset: -10, borderRadius: 40, background: "#05060a", boxShadow: "0 30px 60px rgba(0,0,0,0.7)", border: "3px solid #2a3145" }} />
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 30, objectFit: "cover" }} />
  </div>
);

export const PromoThumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 75% 40%, #3a1d14, #0b0d14 60%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", left: -300, bottom: -500, background: "radial-gradient(circle, #3b8cff44, transparent 60%)" }} />
    <Phone src="promo/frame-stack.jpg" x={1010} y={70} w={250} rot={8} />
    <Phone src="promo/frame-hook.jpg" x={780} y={110} w={260} rot={-6} />
    {/* the prompt */}
    <div style={{ position: "absolute", left: 50, top: 455, width: 700, background: "#151a26", border: "3px solid #2a3145", borderRadius: 18, padding: "18px 24px",
      fontFamily: "Consolas, monospace", fontSize: 34, color: "#f3f4f8", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
      <span style={{ color: "#e07a52", fontWeight: 700 }}>{"> "}</span>make money feel physical
    </div>
    <svg width={1280} height={720} style={{ position: "absolute" }}>
      <path d="M700,560 Q790,610 820,520" fill="none" stroke="#ffd166" strokeWidth={14} strokeLinecap="round" />
      <path d="M795,530 L822,512 L832,545" fill="none" stroke="#ffd166" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", left: 48, top: 40, width: 760, fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 0.98, textTransform: "uppercase",
      color: "#fff", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.5)", letterSpacing: -2 }}>
      I type.<br /><span style={{ color: "#e07a52" }}>Claude</span><br /><span style={{ color: "#ffd166" }}>animates.</span>
    </div>
    <div style={{ position: "absolute", left: 50, top: 600, display: "flex", gap: 16 }}>
      {[["Claude Code", "#e07a52"], ["Remotion", "#3b8cff"]].map(([t, c]) => (
        <span key={t} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#fff", background: c, padding: "8px 24px", borderRadius: 14, border: "4px solid #fff" }}>{t}</span>
      ))}
    </div>
  </AbsoluteFill>
);
