/**
 * The payoff: "MrBeast took {top_pct} of the whole list's money. Who would you pay to watch?"
 * A purple studio. A big round money pie, the whole list's {top_whole} written under it. On "took" a
 * gold slice the size of MrBeast's share pulls out of the pie with his real head on it and {top_pct}
 * slams over it; on "money" the rest of the pie greys; on "watch" the question drops in.
 *
 * params: { fig, pct (raw), label, whole, ask }, events: took, whole, money, pay, watch
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

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fig?: string; pct?: number; label?: string; whole?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tT = at(p, "took", 0.3), tM = at(p, "money", 1.4), tW = at(p, "watch", 2.6);
  const kT = sp(tT, 10), kM = sp(tM, 14), kW = sp(tW, 9);
  const share = clamp((P.pct ?? 0) / 100);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const cx = w * 0.5, cy = h * 0.44, r = w * 0.26;
  const a0 = -Math.PI / 2, a1 = a0 + share * Math.PI * 2;
  const mid = (a0 + a1) / 2;
  const off = r * 0.22 * kT;
  const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
  const arc = (from: number, to: number, dx: number, dy: number) => {
    const large = to - from > Math.PI ? 1 : 0;
    return `M${cx + dx},${cy + dy} L${cx + dx + Math.cos(from) * r},${cy + dy + Math.sin(from) * r} A${r},${r} 0 ${large} 1 ${cx + dx + Math.cos(to) * r},${cy + dy + Math.sin(to) * r} Z`;
  };
  const fSize = Math.max(min, fitLine(P.fig ?? "", 220, maxW * 0.6));
  const labSize = Math.max(min, fitLine((P.label ?? "").toUpperCase(), 60, maxW, { upper: true }));
  const wSize = Math.max(min, fitLine(P.whole ?? "", 80, maxW * 0.6));
  const askSize = Math.max(min, fitLine((P.ask ?? "").toUpperCase(), 72, maxW, { upper: true }));
  const rest = kM > 0 ? `rgb(${Math.round(127 - 30 * kM)},${Math.round(207 - 80 * kM)},${Math.round(143 - 20 * kM)})` : "#7fcf8f";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 50%" }}>
        <World kind="studio" tint="#2a1846" w={w} h={h} t={t} seed="payoff-mrbeast-pie" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <circle cx={cx} cy={cy + 14} r={r} fill="rgba(0,0,0,0.35)" />
          <path d={arc(a1, a0 + Math.PI * 2, 0, 0)} fill={rest} stroke={INK} strokeWidth={7} />
          <path d={arc(a0, a1, ox, oy)} fill="#ffd84a" stroke={INK} strokeWidth={7} />
          {kT > 0 && <g transform={`translate(${cx + ox + Math.cos(mid) * r * 0.55},${cy + oy + Math.sin(mid) * r * 0.55}) scale(${kT})`}><PhotoHead name="mrbeast" r={r * 0.24} /></g>}
        </svg>
        {P.whole && (
          <div style={{ position: "absolute", left: cx - r * 1.0, width: r * 1.2, top: cy + r * 0.05, textAlign: "center" }}>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: wSize, color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.whole}</span>
          </div>
        )}
      </AbsoluteFill>
      {kT > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${1.5 - 0.5 * kT})`, opacity: clamp(kT * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.fig}</div>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.label ?? "").toUpperCase()}</span></div>
        </div>
      )}
      {kW > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.6 - (1 - kW) * h * 0.05, textAlign: "center", opacity: clamp(kW * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: askSize, color: INK, background: "#ffd84a", padding: "8px 22px", borderRadius: 14, border: `6px solid ${INK}` }}>{(P.ask ?? "").toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
