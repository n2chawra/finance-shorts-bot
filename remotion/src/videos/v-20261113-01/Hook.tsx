/**
 * Hook (shock number): "MrBeast made {mr_total} in one year, Forbes estimates."
 * A creator's studio at night in purple: MrBeast (his real head on our cartoon body) on the left, a
 * cash tower beside him already half built, a red play-button award behind. Frame 0 reads MRBEAST
 * MADE / {mr_total} / IN ONE YEAR, his name on a label under him. On "MrBeast" he presents; on "made"
 * the tower shoots up bundle by bundle and notes fly into it; on "year" the figure slams; on "Forbes"
 * the Forbes list pops up beside the tower.
 *
 * params: { line, fig, sub, label }, events: mrbeast, made, year, forbes
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.cashtower!, Award = props.playaward!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; fig?: string; sub?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tB = at(p, "mrbeast", 0.1), tM = at(p, "made", 0.6), tY = at(p, "year", 2.0), tF = at(p, "forbes", 2.6);
  const kB = sp(tB, 8), kM = sp(tM, 14), kY = sp(tY, 9), kF = sp(tF, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 110, maxW, { upper: true }));
  const fig = P.fig ?? "";
  const fSize = Math.max(min, fitLine(fig, 260, maxW * 0.85));
  const sub = (P.sub ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(sub, 64, maxW - 60, { upper: true }));
  const label = (P.label ?? "").toUpperCase();
  const labSize = Math.max(min, fitLine(label, 64, w * 0.36, { upper: true }));
  const g = h * 0.78;
  const tx = w * 0.66;
  const grow = 0.45 + 0.55 * clamp(kM);
  const notes = t < tM ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tM) * 1.1 + i / 6) % 1;
    const x = w * 0.95 - (w * 0.95 - tx) * f, y = h * 0.42 + f * h * 0.12 - Math.sin(f * Math.PI) * h * 0.08;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={3} fill="#7fcf8f" stroke={INK} strokeWidth={3} transform={`rotate(${f * 300} ${x} ${y})`} opacity={1 - f * 0.6} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.04 * kY})`, transformOrigin: "50% 65%" }}>
        <World kind="studio" tint="#2a1846" w={w} h={h} t={t} seed="hook-mrbeast-studio" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={tx} cy={g - h * 0.2} rx={w * 0.28} ry={h * 0.2} fill="#f2c94c" opacity={0.08 + 0.1 * kM} />
          <g transform={`translate(${w * 0.86},${g - h * 0.02}) scale(${0.9 + 0.15 * kF})`}><Award s={h * 0.12} t={t} /></g>
          <g transform={`translate(${tx},${g})`}><Tower s={h * 0.46} t={t} k={grow} /></g>
          {notes}
          <Actor p={p} spec={{ who: "photo:mrbeast", x: 0.27, scale: 1.2, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "made", pose: "thumbsUp", expression: "proud" }] }} ground={g + h * 0.02} index={0} />
        </svg>
        {label && (
          <div style={{ position: "absolute", left: w * 0.27 - w * 0.18, width: w * 0.36, top: g - h * 0.15, textAlign: "center", transform: `scale(${0.9 + 0.1 * kB})` }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: "#e5484d", padding: "4px 18px", borderRadius: 12, border: `5px solid ${INK}` }}>{label}</span>
          </div>
        )}
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: "#fff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", transform: "rotate(-2deg)" }}>{line}</span>
        </div>
      )}
      {fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.13, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1.0, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.15 * kY * Math.max(0, 1 - (t - tY) * 1.5) + 0.02 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{fig}</span>
        </div>
      )}
      {sub && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.29, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, lineHeight: 1.15, color: "#ffffff", background: "#1d2433", padding: "6px 20px", borderRadius: 14, letterSpacing: 1 }}>{sub}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
