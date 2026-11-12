/**
 * Hook (shock number): "One night of Taylor Swift's Eras Tour brought in about {show_per_part}."
 * A packed stadium at night with light beams. Taylor Swift (her real head on our cartoon body, never
 * speaking) on the left with her name on her chest; on the right a pile of cash bundles on the stage.
 * Frame 0 reads ONE NIGHT OF THE ERAS TOUR / {show_per_part}. On "night" a ONE NIGHT stamp slams on
 * the pile; on "Swift's" she presents; on "brought" the pile grows bundle by bundle and the figure pulses.
 *
 * params: { line, fig, stamp, label }, events: night, swift, eras, brought
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Stadium = props.stadium!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; fig?: string; stamp?: string; label?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tN = at(p, "night", 0.2), tB = at(p, "brought", 1.8);
  const kN = sp(tN, 9), kB = sp(tB, 13);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 96, maxW, { upper: true }));
  const fig = P.fig ?? "";
  const fSize = Math.max(min, fitLine(fig, 240, maxW * 0.85));
  const stamp = (P.stamp ?? "").toUpperCase();
  const stSize = Math.max(min, fitLine(stamp, 70, w * 0.4, { upper: true }));
  const label = (P.label ?? "").toUpperCase();
  const labSize = Math.max(min, fitLine(label, 52, w * 0.36, { upper: true }));
  const g = h * 0.8;
  const px = w * 0.7;
  const n = Math.round(6 + 8 * clamp(kB));
  const bw = w * 0.2, bh = h * 0.034;
  const bundles = Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const x = px - bw + col * bw + (row % 2) * bw * 0.15 - bw * 0.07, y = g - (row + 1) * bh;
    return (
      <g key={i}>
        <rect x={x} y={y} width={bw * 0.95} height={bh} rx={4} fill="#7fcf8f" stroke={INK} strokeWidth={4} />
        <rect x={x + bw * 0.4} y={y} width={bw * 0.15} height={bh} fill="#fbf3e2" stroke={INK} strokeWidth={2} />
      </g>
    );
  });
  const topY = g - Math.ceil(n / 2) * bh;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.03 * kB})`, transformOrigin: "50% 65%" }}>
        <World kind="night" tint="#2a1846" w={w} h={h} t={t} seed="hook-swift-stadium" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${g - h * 0.18})`}><Stadium s={h * 0.3} t={t} /></g>
          <ellipse cx={px} cy={g + h * 0.005} rx={bw * 1.3} ry={h * 0.02} fill="rgba(0,0,0,0.35)" />
          {bundles}
          <Actor p={p} spec={{ who: "photo:swift", x: 0.26, scale: 1.2, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "swift", pose: "thumbsUp", expression: "proud" }] }} ground={g + h * 0.02} index={0} />
        </svg>
        {kN > 0 && stamp && (
          <div style={{ position: "absolute", left: px - w * 0.2, width: w * 0.4, top: topY - h * 0.08, textAlign: "center", transform: `scale(${1.8 - 0.8 * kN}) rotate(-8deg)`, opacity: clamp(kN * 2) }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stSize, color: "#ff4fa3", border: `8px solid #ff4fa3`, padding: "2px 16px", borderRadius: 12, background: "rgba(255,255,255,0.92)" }}>{stamp}</span>
          </div>
        )}
        {label && (
          <div style={{ position: "absolute", left: w * 0.26 - w * 0.18, width: w * 0.36, top: g - h * 0.15, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: "#b28dff", padding: "4px 16px", borderRadius: 12, border: `5px solid ${INK}` }}>{label}</span>
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
            transform: `scale(${1 + 0.12 * kB * Math.max(0, 1 - (t - tB) * 1.5) + 0.02 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{fig}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
