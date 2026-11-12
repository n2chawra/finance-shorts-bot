/**
 * The turn: "All five together still come up short of MrBeast alone."
 * A purple studio. Header ALL FIVE TOGETHER. On the left five cash blocks, each labelled with a
 * creator's name, sized by what they made; on "together" they slide into one column, stacked on top
 * of each other; on "short" MrBeast's tower rises on the right, taller, with {mr_total}; on "MrBeast"
 * his real head pops on top of it and a dashed line marks how far the five fall short.
 *
 * params: { header, names[], vals[] (raw), beastV, beastFig, beastLabel }, events: all, together, short, mrbeast, alone
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { PhotoHead } from "../../studio/photo";
import { World } from "../../studio/worlds";
import props from "./props";

const COLORS = ["#8a63d2", "#3d7bf5", "#1fa7a0", "#f08c3a", "#f2588f"];

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; names?: string[]; vals?: number[]; beastV?: number; beastFig?: string; beastLabel?: string };
  const sp = (start: number, damping = 13) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 120, mass: 0.9 } }));
  const tA = at(p, "all", 0.05), tT = at(p, "together", 0.6), tS = at(p, "short", 1.6), tM = at(p, "mrbeast", 2.2);
  const kA = sp(tA, 12), kT = sp(tT, 16), kS = sp(tS, 14), kM = sp(tM, 9);
  const names = P.names ?? [], vals = P.vals ?? [];
  const beast = P.beastV ?? 1;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 80;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 90, maxW, { upper: true }));
  const base = h * 0.72, full = h * 0.4;
  const unit = full / beast;
  const colW = w * 0.38;
  const xL = w * 0.28, xR = w * 0.72;
  const nameSize = (s: string, bh: number) => fitLine(s.toUpperCase(), Math.min(46, bh * 0.7), colW * 0.92, { upper: true });
  // before "together": five small blocks spread on the ground; after: one column
  let yCum = base;
  const blocks = names.map((n, i) => {
    const v = vals[i] ?? 0;
    const bh = Math.max(h * 0.02, v * unit);
    const sx = w * (0.08 + i * 0.095), sy = base;
    const ex = xL, ey = yCum;
    yCum -= bh;
    const x = sx + (ex - sx) * kT, yb = sy + (ey - sy) * kT;
    const width = (w * 0.08) + (colW - w * 0.08) * kT;
    return { n, x, yb, bh, width, i, k: clamp(kA * 1.5 - i * 0.1) };
  });
  const top5 = yCum;
  const bH = full * kS;
  const lab = Math.max(min, fitLine((P.beastLabel ?? "").toUpperCase(), 56, colW * 1.2, { upper: true }));
  const figSize = Math.max(min, fitLine(P.beastFig ?? "", 96, colW * 1.3));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.01 * t + 0.03 * kM})`, transformOrigin: "50% 60%" }}>
        <World kind="studio" tint="#2a1846" w={w} h={h} t={t} seed="turn-mrbeast-five" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {blocks.map((b) => (
            <g key={b.n} opacity={b.k}>
              <rect x={b.x - b.width / 2} y={b.yb - b.bh} width={b.width} height={b.bh} rx={8} fill={COLORS[b.i % 5]} stroke={INK} strokeWidth={5} />
            </g>
          ))}
          <rect x={xR - colW / 2} y={base - full} width={colW} height={full} rx={14} fill="none" stroke="#7fcf8f" strokeWidth={6} strokeDasharray="22 14" opacity={0.55 * (1 - kS)} />
          <rect x={xR - colW / 2} y={base - bH} width={colW} height={bH} rx={14} fill="#7fcf8f" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => (base - (i + 1) * full / 10 > base - bH ? <rect key={i} x={xR - colW * 0.08} y={base - (i + 1) * full / 10} width={colW * 0.16} height={full / 10} fill="#fbf3e2" stroke={INK} strokeWidth={2} /> : null))}
          {kM > 0 && <line x1={xL - colW / 2} y1={top5} x2={xR + colW / 2} y2={top5} stroke="#ffd84a" strokeWidth={6} strokeDasharray="18 12" opacity={clamp(kM * 2)} />}
          {kM > 0 && <line x1={xR + colW * 0.55} y1={top5} x2={xR + colW * 0.55} y2={base - full} stroke="#e5484d" strokeWidth={8} opacity={clamp(kM * 2)} />}
          <rect x={w * 0.05} y={base} width={w * 0.9} height={10} rx={5} fill={INK} />
          {<g transform={`translate(${xR},${base - full - h * 0.07}) scale(${0.7 + 0.3 * kM})`}><PhotoHead name="mrbeast" r={h * 0.06} /></g>}
        </svg>
        {kT > 0.6 && blocks.map((b) => (nameSize(b.n, b.bh) >= min ? (
          <div key={b.n} style={{ position: "absolute", left: xL - colW * 0.6, width: colW * 1.2, top: b.yb - b.bh / 2 - nameSize(b.n, b.bh) * 0.62, textAlign: "center", opacity: clamp((kT - 0.6) * 3) }}>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: nameSize(b.n, b.bh), whiteSpace: "nowrap", color: "#fff", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{b.n.toUpperCase()}</span>
          </div>
        ) : null))}
        {kS > 0 && (
          <div style={{ position: "absolute", left: xR - colW * 0.65, width: colW * 1.3, top: base - bH * 0.55, textAlign: "center", opacity: clamp(kS * 2) }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: figSize, color: "#ffd84a", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.beastFig}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab, color: "#fff", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{(P.beastLabel ?? "").toUpperCase()}</div>
          </div>
        )}
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#8a63d2", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
