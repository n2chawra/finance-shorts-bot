/**
 * The turn: "Here's the twist. The {each_parts} richest Americans grew {fact2} richer in {yr_parts}
 * years, and paid {fact3} in federal income tax."
 * A dark office, Priya on the right pointing back. Two columns: on "richer" the wealth column shoots
 * up in green with its figure on top and the source line appears; on "paid" the tax column beside it
 * rises to its true size, a sliver, with its figure, and a dashed line shows how small it is; on
 * "tax" the sliver flashes red.
 *
 * params: { grew, paid, ratio, grewLabel, paidLabel, sourceIndex }, events: twist, richest, richer, paid, tax
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
  const P = p.beat.params as { grew?: string; paid?: string; ratio?: string; grewLabel?: string; paidLabel?: string; sourceIndex?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.5), tRich = at(p, "richer", 2.6), tPaid = at(p, "paid", 4.6), tTax = at(p, "tax", 6.2);
  const kRich = sp(tRich, 14), kPaid = sp(tPaid, 10);
  const flash = t > tTax ? 0.5 + 0.5 * Math.sin((t - tTax) * 10) : 0;
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const zoom = 1 + 0.06 * clamp((t - tTwist) / 0.5);
  const frac = clamp((parseFloat(P.ratio ?? "") || 5) / 100, 0.01, 1);
  const base = h * 0.66, top = h * 0.3, full = base - top;
  const colW = w * 0.2, x1 = w * 0.2, x2 = w * 0.56;
  const grewH = full * kRich, paidH = Math.max(10, full * frac) * kPaid;
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 48, max, { upper: true }));
  const fig = (s: string) => Math.max(min, fitLine(s, 80, colW * 1.3));
  const srcParts = (p.tl.sources ?? "").replace(/^Data:\s*/, "").split(" · ");
  const srcOne = srcParts[P.sourceIndex ?? 0] ?? "";
  const src = srcOne ? `Data: ${srcOne}` : "";
  const srcSize = Math.max(min, Math.min(min * 1.05, fitWords(src, min * 1.05, box.x1 - box.x0 - 100)));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "45% 45%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}t`} />
        <AbsoluteFill style={{ background: "rgba(10,20,20,0.45)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <line x1={w * 0.08} x2={w * 0.7} y1={base} y2={base} stroke="#fff" strokeOpacity={0.5} strokeWidth={6} />
          <rect x={x1 - colW / 2} y={top} width={colW} height={full} rx={12} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} strokeDasharray="18 12" />
          <rect x={x2 - colW / 2} y={top} width={colW} height={full} rx={12} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} strokeDasharray="18 12" />
          {kRich > 0 && <rect x={x1 - colW / 2} y={base - grewH} width={colW} height={grewH} rx={12} fill="#2fb37a" stroke={INK} strokeWidth={7} />}
          {kRich > 0 && P.grew && <text x={x1} y={base - grewH - min * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fig(P.grew)} fill="#7cf0b2" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kRich * 2)}>{P.grew}</text>}
          {P.grewLabel && <text x={x1} y={base + min * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.grewLabel, colW * 1.4)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.grewLabel.toUpperCase()}</text>}
          {kPaid > 0 && <rect x={x2 - colW / 2} y={base - paidH} width={colW} height={paidH} rx={6} fill={flash > 0.5 ? "#ff6b6b" : "#e5484d"} stroke={INK} strokeWidth={6} />}
          {kPaid > 0 && P.paid && <text x={x2} y={base - paidH - min * 0.6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fig(P.paid)} fill="#ff8a8a" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={clamp(kPaid * 2)}>{P.paid}</text>}
          {P.paidLabel && <text x={x2} y={base + min * 1.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.paidLabel, colW * 1.4)} fill="#ff8a8a" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.paidLabel.toUpperCase()}</text>}
          {kPaid > 0 && <line x1={x1 + colW / 2} x2={x2 + colW / 2} y1={base - grewH} y2={base - grewH} stroke="#ffd84a" strokeWidth={6} strokeDasharray="16 12" opacity={kPaid * 0.8} />}
          <Actor p={p} spec={{ who: "priya", x: 0.84, scale: 0.75, acting: [{ sec: 0, pose: "present", expression: "shock" }, { at: "paid", pose: "worried", expression: "angry" }] }}
            ground={h * 0.68} index={0} />
        </svg>
      </AbsoluteFill>
      {src && kRich > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 30, right: w - box.x1 + 30, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: srcSize, lineHeight: 1.2, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "6px 20px" }}>{src}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
