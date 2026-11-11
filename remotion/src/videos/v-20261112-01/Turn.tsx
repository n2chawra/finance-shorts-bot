/**
 * The turn: "Those services brought in {fact1}, and cost just {fact2} to run."
 * A dark studio in Apple blue. Header APPLE SERVICES from frame 0 over the iCloud cloud, the App
 * Store tile and the headphones in a row. On "services" they bob and coins rain from each; on
 * "brought" a tall green column rises with {fact1}; on "cost" a short red column rises beside it with
 * {fact2}; on "run" the gap between them lights gold: what Apple keeps.
 *
 * params: { header, inLabel, inFig, costLabel, costFig, keptLabel, inV, keptV }, events: services, brought, cost, run
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Cloud = props.icloud!, Store = props.appstore!, Phones = props.headphones!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; inLabel?: string; inFig?: string; costLabel?: string; costFig?: string; keptLabel?: string; inV?: number; keptV?: number };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 120, mass: 0.9 } }));
  const tS = at(p, "services", 0.3), tB = at(p, "brought", 0.9), tC = at(p, "cost", 2.0), tR = at(p, "run", 3.0);
  const kB = sp(tB, 14), kC = sp(tC, 14), kR = sp(tR, 10);
  const inV = P.inV ?? 1, keptV = P.keptV ?? 0;
  const costShare = clamp((inV - keptV) / inV);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 80;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 86, maxW, { upper: true }));
  const colW = w * 0.28;
  const fig = (s: string) => Math.max(min, fitLine(s, 84, colW * 1.25));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 52, colW * 1.25, { upper: true }));
  const base = h * 0.7, full = h * 0.3;
  const inH = full * kB, costH = full * costShare * kC;
  const xIn = w * 0.33, xCost = w * 0.67;
  const icons: [React.FC<{ s: number; t: number; k?: number }>, number][] = [[Cloud, 0.2], [Store, 0.5], [Phones, 0.8]];
  const coins = t < tS ? [] : Array.from({ length: 12 }, (_, i) => {
    const f = ((t - tS) * 1.1 + i / 12) % 1;
    const sx = w * icons[i % 3]![1], y = h * 0.25 + f * (base - inH - h * 0.3);
    const x = sx + (xIn - sx) * f;
    return <circle key={i} cx={x} cy={y} r={h * 0.013} fill="#f2c94c" stroke={INK} strokeWidth={3} opacity={(1 - clamp((f - 0.5) * 4)) * (1 - kB * 0.6)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.01 * t + 0.04 * kR})`, transformOrigin: "50% 60%" }}>
        <World kind="studio" tint="#10284f" w={w} h={h} t={t} seed="turn-apple-services" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {icons.map(([C, x], i) => {
            const b = t > tS ? Math.abs(Math.sin((t - tS) * 5 + i)) * h * 0.012 : 0;
            return <g key={i} transform={`translate(${w * x},${h * 0.27 - b})`}><C s={h * 0.1} t={t} k={0.8} /></g>;
          })}
          {coins}
          <rect x={xIn - colW / 2} y={base - inH} width={colW} height={inH} rx={18} fill="#4cc38a" stroke={INK} strokeWidth={6} />
          {kR > 0 && <rect x={xIn - colW / 2} y={base - inH} width={colW} height={Math.max(0, inH - full * costShare)} rx={18} fill="#ffd84a" opacity={0.85 * kR} stroke={INK} strokeWidth={6} />}
          <rect x={xCost - colW / 2} y={base - costH} width={colW} height={costH} rx={18} fill="#e5484d" stroke={INK} strokeWidth={6} />
          <rect x={w * 0.08} y={base} width={w * 0.84} height={10} rx={5} fill={INK} />
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#1f8bff", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)", border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
      {kB > 0 && (
        <div style={{ position: "absolute", left: xIn - colW * 0.65, width: colW * 1.3, top: base - inH - h * 0.1, textAlign: "center", opacity: clamp(kB * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.inFig ?? ""), color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.inFig}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.inLabel ?? ""), color: "#bff5d6", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{(P.inLabel ?? "").toUpperCase()}</div>
        </div>
      )}
      {kC > 0 && (
        <div style={{ position: "absolute", left: xCost - colW * 0.65, width: colW * 1.3, top: base - costH - h * 0.1, textAlign: "center", opacity: clamp(kC * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fig(P.costFig ?? ""), color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.costFig}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.costLabel ?? ""), color: "#ffc9c9", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{(P.costLabel ?? "").toUpperCase()}</div>
        </div>
      )}
      {kR > 0 && P.keptLabel && (
        <div style={{ position: "absolute", left: xIn - colW * 0.65, width: colW * 1.3, top: base - inH + (inH - full * costShare) / 2 - h * 0.02, textAlign: "center", transform: `scale(${1.4 - 0.4 * kR})`, opacity: clamp(kR * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.keptLabel), color: INK, background: "#fff", padding: "4px 16px", borderRadius: 12, border: `5px solid ${INK}` }}>{P.keptLabel.toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
