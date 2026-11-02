/**
 * The promise: "Berkshire finished buying these Coca-Cola shares decades ago, for {fact1} in total.
 * Watch what that one purchase does."
 * A cream card. The cola factory on the left, a share certificate on the right, Berkshire's letter
 * as a slip between them filling in on the words: on "Berkshire" the factory glows; on "shares" the
 * first rows land and coins fly into the certificate; on "total" the cost lands; on "purchase" the
 * SOLD SINCE: NONE row lands and a KEPT stamp slams on; on "Watch" a fruit basket rises under it.
 * The source of the figures is written under the slip, wrapped to fit.
 *
 * params: { header, rows: [{label, value, at}], stamp, sourceIndex }, events: berkshire, shares, total, watch, purchase
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import props from "./props";

const Vault = props.colafactory!, Crate = props.stockcert!, Phone = props.fruitbasket!;

const Letter: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; rows?: { label: string; value: string; at?: string }[]; stamp?: string; ask?: string; sourceIndex?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tG = at(p, "berkshire", 0.1), tPaid = at(p, "shares", 0.8), tYear = at(p, "purchase", 4.5), tSet = at(p, "watch", 3.8), tBuy = at(p, "purchase", 4.5);
  const kOpen = sp(tG, 12), kStamp = sp(tYear, 8), kPhone = sp(tSet, 10), kAsk = sp(tBuy, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 40;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, maxW - 80, { upper: true }));
  const rows = P.rows ?? [];
  const slipW = w * 0.72, rowH = Math.max(min * 1.5, h * 0.05), slipX = (w - slipW) / 2, slipY = h * 0.17;
  const slipH = rowH * (rows.length + 1.4);
  const rowSize = (s: string) => Math.max(min, fitLine(s, 58, slipW * 0.46));
  const g = h * 0.7;
  const vx = w * 0.22, cx = w * 0.78;
  const coins = t < tPaid ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tPaid) * 0.9 + i / 6) % 1;
    return <circle key={i} cx={vx + (cx - vx) * f} cy={g - h * 0.1 - Math.sin(f * Math.PI) * h * 0.08} r={h * 0.015} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5) * clamp(f * 8)} />;
  });
  const srcParts = (p.tl.sources ?? "").replace(/^Data:\s*/, "").split(" · ");
  const srcOne = srcParts[P.sourceIndex ?? 0] ?? "";
  const src = srcOne ? `Data: ${srcOne}${(P.sourceIndex ?? 0) === srcParts.length - 2 ? " · " + srcParts[srcParts.length - 1] : ""}` : "";
  const srcSize = Math.max(min, Math.min(min * 1.05, fitWords(src, min * 1.05, maxW - 40)));
  const ask = (P.ask ?? "").toUpperCase();
  const askSize = Math.max(min, fitLine(ask, 60, w * 0.4, { upper: true }));
  const stamp = (P.stamp ?? "").toUpperCase();
  return (
    <AbsoluteFill style={{ background: "#f3e3c3", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.25), rgba(0,0,0,0.12) 80%)" }} />
      <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.075, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: INK, padding: `${hSize * 0.2}px ${hSize * 0.6}px`, borderRadius: hSize * 0.6 }}>{header}</span>
      </div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <rect x={slipX} y={slipY} width={slipW} height={slipH} rx={18} fill="#fffdf5" stroke={INK} strokeWidth={7} />
        {rows.map((r, i) => {
          const k = r.at ? sp(at(p, r.at, 0.5 + i * 0.6), 12) : 1;
          const y = slipY + rowH * (i + 1.1);
          return (
            <g key={i} opacity={clamp(k * 2)} transform={`translate(${(1 - k) * -30},0)`}>
              <text x={slipX + 30} y={y} fontFamily={FONT} fontWeight={700} fontSize={rowSize(r.label)} fill="#5b6475">{r.label}</text>
              <text x={slipX + slipW - 30} y={y} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={rowSize(r.value)} fill={i === 2 ? "#1f8f55" : INK}>{r.value}</text>
            </g>
          );
        })}
        {kStamp > 0 && stamp && (
          <g transform={`translate(${slipX + slipW * 0.7},${slipY + slipH * 0.55}) rotate(-14) scale(${2 - kStamp})`} opacity={clamp(kStamp * 2) * 0.9}>
            <rect x={-min * 2.2} y={-min * 0.9} width={min * 4.4} height={min * 1.6} rx={12} fill="none" stroke="#d23a3a" strokeWidth={9} />
            <text y={min * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={min * 1.1} fill="#d23a3a">{stamp}</text>
          </g>
        )}
        <g transform={`translate(${vx},${g}) scale(${1 + 0.05 * kOpen})`}><Vault s={h * 0.17} t={t}  /></g>
        <g transform={`translate(${cx},${g}) scale(${1 + 0.08 * Math.abs(Math.sin(t * 3)) * clamp(t - tPaid)})`}><Crate s={h * 0.15} t={t} state={t > tYear ? "gold" : undefined} /></g>
        {kPhone > 0 && <g transform={`translate(${w * 0.5},${g + h * 0.01}) scale(${kPhone})`}><Phone s={h * 0.14} t={t} /></g>}
        {coins}
        {kAsk > 0 && ask && (
          <g transform={`translate(${cx},${g - h * 0.2}) rotate(${6 - 6 * kAsk}) scale(${kAsk})`}>
            <rect x={-askSize * ask.length * 0.36 - 20} y={-askSize * 0.85} width={askSize * ask.length * 0.72 + 40} height={askSize * 1.45} rx={16} fill="#fff" stroke={INK} strokeWidth={6} />
            <text y={askSize * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={askSize} fill="#d23a3a">{ask}</text>
          </g>
        )}
      </svg>
      {src && (
        <div style={{ position: "absolute", left: box.x0 + 30, right: w - box.x1 + 30, top: slipY + slipH + h * 0.015, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: srcSize, lineHeight: 1.2, color: "#fff", background: "rgba(0,0,0,0.5)", borderRadius: 18, padding: "6px 20px" }}>{src}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Letter;
