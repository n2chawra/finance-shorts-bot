/**
 * The turn: "And here's the twist. Decades later, the dividend was {fact4} a year. That's {pay_pct}
 * of the whole price, paid back in one year."
 * A dark office, Sharma small on the left. Two columns stand side by side: the price paid (a tall
 * grey column of certificates) and one year's dividend. On "twist" the camera punches in; on
 * "dividend" the dividend column climbs in gold with its figure on top, and the source line shows;
 * on "whole" a dashed line measures it against the price and the share figure slams in huge; on
 * "back" coins fly from the dividend column into the price column.
 *
 * params: { paid, cost, pct, costLabel, paidLabel, sourceIndex }, events: twist, dividend, year, whole, price, back
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { paid?: string; cost?: string; pct?: string; costLabel?: string; paidLabel?: string; sourceIndex?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.5), tDiv = at(p, "dividend", 1.8), tWhole = at(p, "whole", 4.5), tBack = at(p, "back", 6.0);
  const kDiv = sp(tDiv, 14), kWhole = sp(tWhole, 8);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const zoom = 1 + 0.06 * clamp((t - tTwist) / 0.5);
  const frac = clamp((parseFloat(P.pct ?? "") || 50) / 100, 0.05, 1);
  const base = h * 0.66, top = h * 0.3, full = base - top;
  const colW = w * 0.2, x1 = w * 0.24, x2 = w * 0.54;
  const divH = full * frac * kDiv;
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 50, max, { upper: true }));
  const fig = (s: string) => Math.max(min, fitLine(s, 72, colW * 1.2));
  const pct = P.pct ?? "";
  const pctSize = Math.max(min, fitLine(pct, 190, w * 0.5));
  const srcParts = (p.tl.sources ?? "").replace(/^Data:\s*/, "").split(" · ");
  const srcOne = srcParts[P.sourceIndex ?? 0] ?? "";
  const src = srcOne ? `Data: ${srcOne}${(P.sourceIndex ?? 0) === srcParts.length - 2 ? " · " + srcParts[srcParts.length - 1] : ""}` : "";
  const srcSize = Math.max(min, Math.min(min * 1.05, fitWords(src, min * 1.05, box.x1 - box.x0 - 100)));
  const coins = t < tBack ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tBack) * 1.2 + i / 5) % 1;
    return <circle key={i} cx={x2 + (x1 - x2) * f} cy={base - divH - h * 0.03 - Math.sin(f * Math.PI) * h * 0.08} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "45% 45%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}t`} />
        <AbsoluteFill style={{ background: "rgba(20,10,10,0.45)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={x1 - colW / 2} y={top} width={colW} height={full} rx={12} fill="#9aa3b5" stroke={INK} strokeWidth={7} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x1 - colW / 2} x2={x1 + colW / 2} y1={top + (full / 6) * i} y2={top + (full / 6) * i} stroke={INK} strokeOpacity={0.3} strokeWidth={4} />)}
          {P.cost && <text x={x1} y={top - min * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fig(P.cost)} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{P.cost}</text>}
          {P.costLabel && <text x={x1} y={base + min * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.costLabel, colW * 1.3)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.costLabel.toUpperCase()}</text>}
          {kDiv > 0 && <rect x={x2 - colW / 2} y={base - divH} width={colW} height={divH} rx={12} fill="#f2b631" stroke={INK} strokeWidth={7} />}
          {kDiv > 0 && P.paid && <text x={x2} y={base - divH - min * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fig(P.paid)} fill="#ffd84a" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kDiv * 2)}>{P.paid}</text>}
          {P.paidLabel && kDiv > 0 && <text x={x2} y={base + min * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.paidLabel, colW * 1.4)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.paidLabel.toUpperCase()}</text>}
          {kWhole > 0 && <line x1={x1 + colW / 2} x2={x2 - colW / 2} y1={base - full * frac} y2={base - full * frac} stroke="#ffd84a" strokeWidth={8} strokeDasharray="18 12" opacity={kWhole} />}
          {coins}
          <Actor p={p} spec={{ who: "sharma", x: 0.84, scale: 0.75, acting: [{ sec: 0, pose: "present", expression: "proud" }, { at: "whole", pose: "celebrate", expression: "laugh" }] }}
            ground={h * 0.68} index={0} />
        </svg>
      </AbsoluteFill>
      {kWhole > 0 && pct && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.12, textAlign: "center", transform: `scale(${1.6 - 0.6 * kWhole})`, opacity: clamp(kWhole * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: pctSize, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{pct}</span>
        </div>
      )}
      {src && kDiv > 0 && kWhole <= 0 && (
        <div style={{ position: "absolute", left: box.x0 + 30, right: w - box.x1 + 30, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: srcSize, lineHeight: 1.2, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "6px 20px" }}>{src}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
