/**
 * The turn: "Then the plan was cut. By the decade's end, just {fact3} kilometres, {line_pct} of the
 * line."
 * A dusk desert under a dark wash, a header THE PLAN WAS CUT. Across the frame lies the planned line
 * as a long glass bar with its length on top. On "cut" a red slash cuts it and everything past the
 * cut fades to a dashed outline; on "kilometres" a tiny gold piece lights up at the start with its
 * length and NOW EXPECTED, and a magnifier ring circles it; on "line" the share slams in huge and
 * the ring pulses.
 *
 * params: { header, planned, built, pct, plannedLabel, builtLabel }, events: cut, end, kilometres, line
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const City = props.linecity!, Crane = props.crane!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; planned?: string; built?: string; pct?: string; plannedLabel?: string; builtLabel?: string; holdLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCut = at(p, "cut", 1.0), tEnd = at(p, "kilometres", 2.0) - 0.4, tKm = at(p, "kilometres", 2.4), tLine = at(p, "line", 4.6), tHold = at(p, "hold", 6.4);
  const kCut = sp(tCut, 9), kEnd = sp(tEnd, 12), kKm = sp(tKm, 9), kLine = sp(tLine, 8), kHold = sp(tHold, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 76, box.x1 - box.x0 - 120, { upper: true }));
  const x0 = box.x0 + 210, x1 = box.x1 - 40, barY = h * 0.42, barH = h * 0.08;
  const cutX = x0 + (x1 - x0) * 0.08;
  const fade = 1 - 0.75 * kCut;
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const fig = (s: string, max: number) => Math.max(min, fitLine(s, 80, max));
  const pct = P.pct ?? "";
  const pctSize = Math.max(min, fitLine(pct, 170, w * 0.5));
  const tinyW = Math.max(14, (x1 - x0) * 0.014);
  const ringR = h * 0.06 * (1 + 0.12 * kLine * Math.abs(Math.sin(t * 5)));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * kLine})`, transformOrigin: "50% 50%" }}>
        <World kind="desert" tint="#8a63d2" w={w} h={h} t={t} seed="turn-desert-cut" props={props} horizon={[{ prop: "crane", x: 0.2, size: 0.06 }]} />
        <AbsoluteFill style={{ background: "rgba(20,12,40,0.5)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.56},${h * 0.72})`} opacity={1 - 0.65 * kCut}><City s={h * 0.3} t={t} k={1} /></g>
          <g transform={`translate(${w * 0.86},${h * 0.76})`}><Crane s={h * 0.22} t={t} /></g>
          <rect x={x0} y={barY} width={x1 - x0} height={barH} rx={14} fill="#8fd3f4" fillOpacity={fade} stroke="#fff" strokeWidth={6} strokeDasharray={kCut > 0.5 ? "22 14" : undefined} />
          {P.planned && <text x={(x0 + x1) / 2} y={barY - min * 0.6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fig(P.planned, (x1 - x0) * 0.6)} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={1 - 0.4 * kCut}>{P.planned}</text>}
          {P.plannedLabel && <text x={(x0 + x1) / 2} y={barY + barH + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.plannedLabel, (x1 - x0) * 0.5)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={1 - 0.4 * kCut}>{P.plannedLabel.toUpperCase()}</text>}
          {kCut > 0 && (
            <g opacity={clamp(kCut * 2)} transform={`translate(${cutX},${barY + barH / 2}) rotate(-20) scale(${2 - kCut})`}>
              <line x1={0} y1={-h * 0.08} x2={0} y2={h * 0.08} stroke="#e5484d" strokeWidth={18} strokeLinecap="round" />
            </g>
          )}
          {kEnd > 0 && (
            <g opacity={clamp(kEnd * 2)}>
              <line x1={x0} x2={x0} y1={barY + barH + h * 0.12} y2={barY + barH + h * 0.12 - h * 0.05 * kEnd} stroke="#ffd84a" strokeWidth={8} />
            </g>
          )}
          {kKm > 0 && (
            <g>
              <rect x={x0} y={barY} width={tinyW} height={barH} rx={4} fill="#f2b631" stroke={INK} strokeWidth={5} />
              <circle cx={x0 + tinyW / 2} cy={barY + barH / 2} r={ringR} fill="none" stroke="#ffd84a" strokeWidth={8} opacity={clamp(kKm * 2)} />
              {P.built && <text x={x0} y={barY + barH + h * 0.15} textAnchor="start" fontFamily={FONT} fontWeight={900} fontSize={fig(P.built, (x1 - x0) * 0.5)} fill="#ffd84a" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kKm * 2)}>{P.built}</text>}
              {P.builtLabel && <text x={x0} y={barY + barH + h * 0.15 + min * 1.4} textAnchor="start" fontFamily={FONT} fontWeight={900} fontSize={lab(P.builtLabel, (x1 - x0) * 0.6)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={clamp(kKm * 2)}>{P.builtLabel.toUpperCase()}</text>}
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#e5484d", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: `rotate(-2deg) scale(${1 + 0.08 * kCut * (1 - clamp((t - tCut) / 0.4))})` }}>{header}</span>
        </div>
      )}
      {kHold > 0 && P.holdLabel && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.5, textAlign: "center", transform: `rotate(-8deg) scale(${2 - kHold})`, opacity: clamp(kHold * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.holdLabel.toUpperCase(), 110, w * 0.6, { upper: true })), color: "#fff", border: "10px solid #e5484d", background: "rgba(229,72,77,0.85)", borderRadius: 20, padding: "4px 30px" }}>{P.holdLabel.toUpperCase()}</span>
        </div>
      )}
      {kLine > 0 && pct && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.15, textAlign: "center", transform: `scale(${1.6 - 0.6 * kLine})`, opacity: clamp(kLine * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: pctSize, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{pct}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
