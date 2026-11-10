/**
 * The turn: "Because when markets crash, prices drop, and cash buys first."
 * A night market street. Header MARKETS CRASH from frame 0 over a price chart that climbs. On "crash"
 * the chart's line dives red and the screen jolts; on "drop" price tags fall from above and a red SALE
 * sign springs up with EVERYTHING ON SALE; on "buys" the war chest slides in, cash flies from it into
 * a shopping cart and a green CASH BUYS FIRST chip lands.
 *
 * params: { header, sale, buys }, events: crash, drop, buys
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Chart = props.crashchart!, Sign = props.salesign!, Tag = props.pricetag!, Cart = props.cart!, Chest = props.warchest!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; sale?: string; buys?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tC = at(p, "crash", 0.8), tD = at(p, "drop", 1.5), tB = at(p, "buys", 2.3);
  const kD = sp(tD, 9), kB = sp(tB, 10);
  const crashed = t >= tC;
  const jolt = t > tC && t < tC + 0.4 ? Math.sin((t - tC) * 60) * 10 * (1 - (t - tC) / 0.4) : 0;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 80;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, maxW, { upper: true }));
  const chip = (s: string, b: number) => Math.max(min, fitLine(s.toUpperCase(), b, maxW * 0.9, { upper: true }));
  const g = h * 0.66;
  const tags = t < tD ? [] : [0.18, 0.4, 0.62, 0.84].map((x, i) => {
    const f = clamp((t - tD) * 1.6 - i * 0.1);
    return <g key={x} transform={`translate(${w * x},${-h * 0.05 + f * h * 0.42})`}><Tag s={h * 0.09} t={t + i} /></g>;
  });
  const notes = t < tB ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tB) * 1.4 + i / 6) % 1;
    const x = w * 0.24 + (w * 0.72 - w * 0.24) * f, y = g - h * 0.14 - Math.sin(f * Math.PI) * h * 0.1;
    return <rect key={i} x={x - h * 0.016} y={y - h * 0.009} width={h * 0.032} height={h * 0.018} rx={3} fill="#8fd19e" stroke={INK} strokeWidth={3} transform={`rotate(${f * 300} ${x} ${y})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${jolt}px,0) scale(${1 + 0.05 * kB})`, transformOrigin: "50% 60%" }}>
        <World kind="street" tint="#3a1e4e" w={w} h={h} t={t} seed="turn-berkshire-market" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${h * 0.44}) scale(${1 - 0.35 * kD})`} opacity={1 - 0.5 * kB}><Chart s={h * 0.2} t={t} state={crashed ? "crash" : undefined} /></g>
          {kD > 0 && <g transform={`translate(${w * 0.8},${g}) scale(${kD})`}><Sign s={h * 0.2} t={t} /></g>}
          {tags}
          {kB > 0 && <g transform={`translate(${w * 0.24 - (1 - kB) * w * 0.4},${g})`}><Chest s={h * 0.16} t={t} /></g>}
          {kB > 0 && <g transform={`translate(${w * 0.62},${g}) scale(${kB})`}><Cart s={h * 0.16} t={t} /></g>}
          {notes}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: crashed ? "#e5484d" : "#3d7bf5", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {kD > 0 && P.sale && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.17, textAlign: "center", opacity: clamp(kD * 2) * (1 - 0.6 * kB) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: chip(P.sale, 70), color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill" }}>{P.sale.toUpperCase()}</span>
        </div>
      )}
      {kB > 0 && P.buys && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.27, textAlign: "center", opacity: clamp(kB * 2), transform: `scale(${1.5 - 0.5 * kB})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: chip(P.buys, 80), color: INK, background: "#8fd19e", padding: "6px 24px", borderRadius: 14, border: `6px solid ${INK}` }}>{P.buys.toUpperCase()}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
