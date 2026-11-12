/**
 * Hook (secret): "Netflix spent {con_total} on new shows and films in one year, and still kept {pro_total}."
 * A dark screening room in Netflix red: the real NETFLIX logo big over a giant TV playing a show, a
 * film reel on the left spilling notes into the TV, an empty glass jar on the right. Frame 0 reads
 * NETFLIX SPENT / {con_total} / ON NEW SHOWS AND FILMS. On "Netflix" the logo pops; on "spent" notes
 * stream from the reel into the TV; on "shows" the TV grows; on "kept" the jar fills with coins and
 * STILL KEPT {pro_total} slams in beside it.
 *
 * params: { line, fig, sub, kept, keptLabel }, events: netflix, spent, shows, kept
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { Photo } from "../../studio/photo";
import { World } from "../../studio/worlds";
import props from "./props";

const Tv = props.tv!, Reel = props.filmreel!, Jar = props.profitjar!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; fig?: string; sub?: string; kept?: string; keptLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tN = at(p, "netflix", 0.1), tS = at(p, "spent", 0.5), tW = at(p, "shows", 2.0), tK = at(p, "kept", 3.6);
  const kN = sp(tN, 8), kS = sp(tS, 12), kW = sp(tW, 10), kK = sp(tK, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 110, maxW, { upper: true }));
  const fig = P.fig ?? "";
  const fSize = Math.max(min, fitLine(fig, 240, maxW * 0.85));
  const sub = (P.sub ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(sub, 58, maxW - 60, { upper: true }));
  const kept = P.kept ?? "", keptLabel = (P.keptLabel ?? "").toUpperCase();
  const kSize = Math.max(min, fitLine(kept, 110, w * 0.36));
  const klSize = Math.max(min, fitLine(keptLabel, 50, w * 0.36, { upper: true }));
  const g = h * 0.8;
  const tvX = w * 0.5, reelX = w * 0.17, jarX = w * 0.82;
  const notes = t < tS ? [] : Array.from({ length: 7 }, (_, i) => {
    const f = ((t - tS) * 1.0 + i / 7) % 1;
    const x = reelX + (tvX - reelX) * f, y = g - h * 0.1 - Math.sin(f * Math.PI) * h * 0.12;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={3} fill="#7fcf8f" stroke={INK} strokeWidth={3} transform={`rotate(${f * 300} ${x} ${y})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.03 * kK})`, transformOrigin: "50% 65%" }}>
        <World kind="studio" tint="#3a0d12" w={w} h={h} t={t} seed="hook-netflix-room" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={tvX} cy={g - h * 0.2} rx={w * 0.4} ry={h * 0.18} fill="#e50914" opacity={0.1 + 0.1 * kS} />
          <g transform={`translate(${tvX},${g}) scale(${1 + 0.08 * kW})`}><Tv s={h * 0.24} t={t} /></g>
          <g transform={`translate(${tvX},${g - h * 0.27 - (1 - kN) * h * 0.02}) scale(${0.85 + 0.15 * kN})`}><Photo name="netflix" s={h * 0.08} t={t} /></g>
          <g transform={`translate(${reelX},${g})`}><Reel s={h * 0.14} t={t} /></g>
          {notes}
          <g transform={`translate(${jarX},${g})`}><Jar s={h * 0.16} t={t} k={0.05 + 0.95 * clamp(kK)} /></g>
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: "#fff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", transform: "rotate(-2deg)" }}>{line}</span>
        </div>
      )}
      {fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.13, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1.0, color: "#ff5a5f", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.12 * kS * Math.max(0, 1 - (t - tS) * 1.5) + 0.02 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{fig}</span>
        </div>
      )}
      {sub && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.27, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, lineHeight: 1.15, color: "#ffffff", background: "#1d2433", padding: "6px 20px", borderRadius: 14 }}>{sub}</span>
        </div>
      )}
      {kK > 0 && kept && (
        <div style={{ position: "absolute", left: jarX - w * 0.2, width: w * 0.4, top: h * 0.36, textAlign: "center", transform: `scale(${1.5 - 0.5 * kK})`, opacity: clamp(kK * 2) }}>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: klSize, color: INK, background: "#ffd84a", padding: "4px 14px", borderRadius: 10, border: `5px solid ${INK}` }}>{keptLabel}</span></div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: kSize, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{kept}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
