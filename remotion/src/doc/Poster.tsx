/**
 * The gold poster card (style-study 2026-11-19 §6, w4.md "the figure card"): in a Short, the one big result
 * gets a movie-poster card for about 7 s: the date, the name, a giant gold figure (from params.fig) and a
 * subline with the cost, over a darkened photo that keeps pushing. It arrives in one cut, no count-up; every
 * other figure in the Short lives only in the captions. Works in a long video too.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fitAnton } from "./Figures";
import { clamp01, DISPLAY, DOC, FilmGrain, fmtDate, fs, outCubic, SANS, SERIF, smooth, unit } from "./theme";


export const PosterCard: React.FC<{
  t: number; end: number; w: number; h: number;
  src?: string; focus?: [number, number]; date?: string; title?: string; figure: string; sub?: string; face?: "serif" | "display"; on?: number;
}> = ({ t, end, w, h, src, focus = [0.5, 0.4], date, title, figure, sub, face = "serif", on = 0 }) => {
  const v = h > w;
  const u = unit(w, h);
  const k = clamp01((t - on) / 1);                    // one cut, no count-up (the reference)
  const push = 1.06 + 0.06 * smooth(t / Math.max(1, end));
  const fk = outCubic((t - on) / 9);
  const shine = ((t - on - 10) / 40) % 1.6;          // a slow sheen across the gold, then rest
  const maxW = w * (v ? 0.9 : 0.8);
  const figSize = face === "display" ? fitAnton(figure, fs(w, h, v ? 300 : 280), maxW) : Math.min(fs(w, h, v ? 230 : 240), maxW / Math.max(1, figure.length * 0.64));
  const gold = "linear-gradient(180deg, #fff1c2 0%, #f3cf73 30%, #d9a238 55%, #b67c1f 75%, #f0cd78 100%)";
  return (
    <AbsoluteFill style={{ opacity: k, background: "#07080b" }}>
      {src ? (
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: "saturate(0.7) contrast(1.05) brightness(0.55)" }} />
        </AbsoluteFill>
      ) : null}
      {/* a warm glow behind the type, dark edges */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 50% ${v ? 40 : 50}%, rgba(120,80,20,0.35), rgba(0,0,0,0) 70%), linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.8))` }} />
      <FilmGrain t={t} o={0.3} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: v ? h * 0.18 : 0, textAlign: "center" }}>
        {date ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fs(w, h, 36), letterSpacing: 10 * u, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{fmtDate(date)}</div> : null}
        {title ? <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: fs(w, h, v ? 72 : 76), color: "#f6e7c1", lineHeight: 1.05, marginTop: 14 * u, maxWidth: maxW, letterSpacing: 2 * u,
          textTransform: "uppercase", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{title}</div> : null}
        <div style={{ width: 120 * u, height: 2 * u, background: DOC.gold, margin: `${26 * u}px 0 ${10 * u}px`, opacity: 0.85 }} />
        <div style={{ position: "relative", fontFamily: face === "display" ? DISPLAY : SERIF, fontWeight: 900, fontSize: figSize, lineHeight: 1.02, whiteSpace: "nowrap", fontVariantNumeric: "lining-nums",
          transform: `scale(${1.08 - 0.08 * fk})`, letterSpacing: face === "display" ? 2 * u : -2 * u, filter: `drop-shadow(0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.7))` }}>
          <span style={{ backgroundImage: gold, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{figure}</span>
          {shine > 0 && shine < 1 ? (
            <span aria-hidden data-probe="skip" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 140 - 30}%, rgba(255,255,255,0.75) ${shine * 140 - 15}%, rgba(255,255,255,0) ${shine * 140}%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{figure}</span>
          ) : null}
        </div>
        {sub ? <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, v ? 44 : 40), letterSpacing: 6 * u, color: "#ffffff", textTransform: "uppercase", marginTop: 18 * u, maxWidth: maxW, textWrap: "balance",
          lineHeight: 1.3, opacity: outCubic((t - on - 4) / 10), textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>{sub}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
