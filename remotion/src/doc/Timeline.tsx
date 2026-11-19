/**
 * A timeline of years: markers on a track, the camera sliding along it to each year as it is said,
 * the year big in gold, what happened under it, an optional photo above it. Years are numbers from the
 * script (dates are facts the fact review checks); nothing here computes one.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, DOC, fs, outBack, outCubic, SANS, SERIF, smooth, unit } from "./theme";

export type YearMark = { year: number | string; label: string; at?: number; src?: string };

export const Timeline: React.FC<{ marks: YearMark[]; t: number; end: number; w: number; h: number }> = ({ marks, t, end, w, h }) => {
  const v = h > w;
  const u = unit(w, h);
  const gap = v ? w * 0.62 : w * 0.34;
  const ats = marks.map((m, i) => m.at ?? 6 + i * 30);
  // how far along the track the camera is: one step per mark once it is said
  const pos = ats.reduce((acc, a, i) => (i === 0 ? acc : acc + smooth((t - a) / 18)), 0);
  const active = Math.round(pos);
  const cy = v ? h * 0.5 : h * 0.56;
  const offset = w / 2 - pos * gap - (t / Math.max(1, end)) * gap * 0.06;
  const trackEnd = offset + (marks.length - 1) * gap;
  const lit = offset + pos * gap;
  const yearSize = fs(w, h, v ? 150 : 130);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 55%, ${DOC.bg2}, ${DOC.bg})`, overflow: "hidden" }}>
      {/* the track */}
      <div style={{ position: "absolute", left: Math.min(0, offset - gap), width: Math.max(w, trackEnd + gap) - Math.min(0, offset - gap), top: cy, height: 3 * u, background: "rgba(255,255,255,0.14)" }} />
      <div style={{ position: "absolute", left: Math.min(0, offset - gap), width: Math.max(0, lit - Math.min(0, offset - gap)), top: cy - 1 * u, height: 5 * u,
        background: `linear-gradient(90deg, rgba(232,176,74,0), ${DOC.gold})`, boxShadow: `0 0 ${16 * u}px rgba(232,176,74,0.6)` }} />
      {marks.map((m, i) => {
        const x = offset + i * gap;
        if (x < -gap || x > w + gap) return null;
        const k = outBack((t - ats[i]! + 4) / 16);
        const on = i === active;
        const near = clamp01(1 - Math.abs(pos - i));
        const s = 0.62 + 0.38 * near;
        const lk = outCubic((t - ats[i]!) / 14);
        return (
          <div key={i}>
            {/* tick */}
            <div style={{ position: "absolute", left: x - 13 * u, top: cy - 13 * u, width: 26 * u, height: 26 * u, borderRadius: "50%",
              background: on ? DOC.gold : DOC.bg2, border: `${4 * u}px solid ${on || i < pos ? DOC.gold : "rgba(255,255,255,0.35)"}`,
              boxShadow: on ? `0 0 ${24 * u}px rgba(232,176,74,0.8)` : undefined, transform: `scale(${0.6 + 0.4 * Math.max(0, k)})` }} />
            {/* the year */}
            <div style={{ position: "absolute", left: x - 400, width: 800, top: cy + 34 * u, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: yearSize, lineHeight: 1,
              color: on ? DOC.gold : "rgba(243,239,230,0.35)", transform: `scale(${s})`, transformOrigin: "50% 0%", letterSpacing: -2 }}>{String(m.year)}</div>
            {/* what happened */}
            <div style={{ position: "absolute", left: x - (v ? w * 0.4 : gap * 0.46), width: v ? w * 0.8 : gap * 0.92, top: cy + 34 * u + yearSize * s + 18 * u, textAlign: "center",
              fontFamily: SERIF, fontWeight: 600, fontSize: fs(w, h, v ? 50 : 40), lineHeight: 1.2, color: DOC.text, opacity: lk * near * near,
              transform: `translateY(${(1 - lk) * 16 * u}px)` }}>{m.label}</div>
            {/* a photo above the year */}
            {m.src ? (
              <div style={{ position: "absolute", left: x - (v ? 230 : 190) * u, top: cy - (v ? 520 : 400) * u, width: (v ? 460 : 380) * u, height: (v ? 460 : 340) * u,
                transform: `scale(${0.75 + 0.25 * near}) rotate(${i % 2 ? 2 : -2}deg)`, transformOrigin: "50% 100%", opacity: clamp01(k) * (0.4 + 0.6 * near),
                background: "#f7f5ef", padding: 12 * u, boxShadow: `0 ${18 * u}px ${44 * u}px rgba(0,0,0,0.6)` }}>
                <Img src={staticFile(m.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: on ? "saturate(0.9)" : "grayscale(1) brightness(0.8)" }} />
              </div>
            ) : null}
          </div>
        );
      })}
      {/* edge fades: the track runs on beyond the frame */}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${DOC.bg} 0%, rgba(11,15,23,0) 14%, rgba(11,15,23,0) 86%, ${DOC.bg} 100%)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
