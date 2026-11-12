/**
 * The turn: "And that's only tickets. Not her pay, and not one T-shirt."
 * A night stage. Header TICKETS ONLY. A tall tower of ticket stubs in the middle; on "tickets" it
 * hops and a TICKETS chip lands on it; on "pay" a pay slip for Taylor Swift (her real head) on the
 * left gets a big red cross; on "T-shirt" a band T-shirt on the right gets a red cross too.
 *
 * params: { header, payLabel, shirtLabel }, events: only, tickets, pay, shirt
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

const Tower = props.tickettower!, Shirt = props.tshirt!;

const Cross: React.FC<{ x: number; y: number; r: number; k: number }> = ({ x, y, r, k }) => (
  <g transform={`translate(${x},${y}) scale(${k})`} opacity={clamp(k * 2)}>
    <line x1={-r} y1={-r} x2={r} y2={r} stroke="#e5484d" strokeWidth={r * 0.28} strokeLinecap="round" />
    <line x1={r} y1={-r} x2={-r} y2={r} stroke="#e5484d" strokeWidth={r * 0.28} strokeLinecap="round" />
  </g>
);

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; payLabel?: string; shirtLabel?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tT = at(p, "tickets", 0.6), tP = at(p, "pay", 1.6), tS = at(p, "shirt", 2.6);
  const kT = sp(tT), kP = sp(tP), kS = sp(tS);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 96, box.x1 - box.x0 - 80, { upper: true }));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 52, w * 0.3, { upper: true }));
  const g = h * 0.62;
  const hop = t > tT && t < tT + 0.5 ? Math.sin((t - tT) * Math.PI * 2) * h * 0.015 : 0;
  const xP = w * 0.17, xT = w * 0.5, xS = w * 0.83;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.01 * t})`, transformOrigin: "50% 55%" }}>
        <World kind="night" tint="#2a1846" w={w} h={h} t={t} seed="turn-swift-tickets" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${xT},${g - hop}) scale(${1 + 0.06 * kT})`}><Tower s={h * 0.28} t={t} k={1} /></g>
          <g transform={`translate(${xP},${g - h * 0.12})`}>
            <rect x={-w * 0.1} y={-h * 0.02} width={w * 0.2} height={h * 0.13} rx={14} fill="#ffffff" stroke={INK} strokeWidth={6} />
            <text x={0} y={h * 0.1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.045} fill={INK}>?</text>
            <g transform={`translate(0,${-h * 0.035})`}><PhotoHead name="swift" r={h * 0.035} /></g>
          </g>
          <Cross x={xP} y={g - h * 0.1} r={w * 0.09} k={kP} />
          <g transform={`translate(${xS},${g})`}><Shirt s={h * 0.2} t={t} /></g>
          <Cross x={xS} y={g - h * 0.1} r={w * 0.09} k={kS} />
        </svg>
        {[[xP, P.payLabel ?? "", kP], [xS, P.shirtLabel ?? "", kS]].map(([x, s, k], i) => (
          <div key={i} style={{ position: "absolute", left: (x as number) - w * 0.16, width: w * 0.32, top: g + h * 0.02, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(s as string), color: "#fff", background: (k as number) > 0.5 ? "#e5484d" : INK, padding: "4px 14px", borderRadius: 10 }}>{(s as string).toUpperCase()}</span>
          </div>
        ))}
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#ff4fa3", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: `rotate(-2deg) scale(${1 + 0.1 * kT * Math.max(0, 1 - (t - tT) * 2)})`, border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
