/**
 * The payoff: "After every bill, Netflix keeps about {pro_per_part} of each member's year. Would you cancel?"
 * A red studio. A member's long receipt on the left reading PAID A YEAR {rev_per_part}; on "bill" its
 * lines tick off one by one; on "keeps" coins pour from its last line into a glass jar on the right,
 * which fills to the kept share, and KEPT FROM EACH MEMBER {pro_per_part} slams over it; the real
 * NETFLIX logo sits on the jar; on "cancel" the question drops in.
 *
 * params: { fig, label, pay, payLabel, keptV, payV, ask }, events: bill, keeps, year, cancel
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

const Receipt = props.receipt!, Jar = props.profitjar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fig?: string; label?: string; pay?: string; payLabel?: string; keptV?: number; payV?: number; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tB = at(p, "bill", 0.2), tK = at(p, "keeps", 1.0), tC = at(p, "cancel", 3.2);
  const kB = sp(tB, 12), kK = sp(tK, 10), kC = sp(tC, 9);
  const share = clamp((P.keptV ?? 0) / (P.payV ?? 1));
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const g = h * 0.68;
  const rX = w * 0.27, jX = w * 0.72;
  const fSize = Math.max(min, fitLine(P.fig ?? "", 200, maxW * 0.6));
  const labSize = Math.max(min, fitLine((P.label ?? "").toUpperCase(), 56, maxW, { upper: true }));
  const pSize = Math.max(min, fitLine(P.pay ?? "", 80, w * 0.4));
  const plSize = Math.max(min, fitLine((P.payLabel ?? "").toUpperCase(), 46, w * 0.4, { upper: true }));
  const askSize = Math.max(min, fitLine((P.ask ?? "").toUpperCase(), 72, maxW, { upper: true }));
  const coins = t < tK ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tK) * 1.2 + i / 6) % 1;
    const x = rX + (jX - rX) * f, y = g - h * 0.12 - Math.sin(f * Math.PI) * h * 0.1;
    return <circle key={i} cx={x} cy={y} r={h * 0.014} fill="#f2c94c" stroke={INK} strokeWidth={3} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 50%" }}>
        <World kind="studio" tint="#3a0d12" w={w} h={h} t={t} seed="payoff-netflix-jar" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${rX},${g}) rotate(${-3 * kB})`}><Receipt s={h * 0.28} t={t} /></g>
          {coins}
          <g transform={`translate(${jX},${g}) scale(${1 + 0.1 * kK})`}><Jar s={h * 0.24} t={t} k={0.05 + share * 2.2 * clamp(kK)} /></g>
          <g transform={`translate(${jX},${g - h * 0.11})`}><Photo name="netflix" s={h * 0.035} t={t} /></g>
        </svg>
        {P.pay && (
          <div style={{ position: "absolute", left: rX - w * 0.2, width: w * 0.4, top: g - h * 0.355, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: pSize, color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.pay}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: plSize, color: "#ffc9c9", WebkitTextStroke: "6px #1d2433", paintOrder: "stroke fill" }}>{(P.payLabel ?? "").toUpperCase()}</div>
          </div>
        )}
      </AbsoluteFill>
      {kK > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${1.5 - 0.5 * kK})`, opacity: clamp(kK * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.fig}</div>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.label ?? "").toUpperCase()}</span></div>
        </div>
      )}
      {kC > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.235 - (1 - kC) * h * 0.04, textAlign: "center", opacity: clamp(kC * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: askSize, color: INK, background: "#ffd84a", padding: "8px 22px", borderRadius: 14, border: `6px solid ${INK}` }}>{(P.ask ?? "").toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
