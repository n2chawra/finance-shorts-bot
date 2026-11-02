/**
 * The rewind: "So rewind the clock. Past the moon landing, past the Colosseum, past the pyramids, and
 * keep going, to the end of the last ice age, when people hunted mammoths."
 * One long ground strip scrolling to the right as time runs backwards, a big clock spinning
 * anticlockwise at the top. On "moon" the moon-landing flag slides in from the left, on
 * "Colosseum" the Colosseum, on "pyramids" a pyramid;
 * they line up as a timeline and the whole row slides away to the right on "going" while the sky turns from desert gold to icy blue on "going"; on "ice" a glacier slides in and stops,
 * and on "mammoths" a mammoth walks in beside it with a spear stuck in the snow.
 *
 * params: { moonLabel, romeLabel, pyrLabel, iceLabel }, events: rewind, moon, colosseum, pyramids, going, ice, mammoths
 */
import React from "react";
import { AbsoluteFill, interpolateColors, spring } from "remotion";
import { at, clamp, ease, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText } from "../../design/fit";
import { INK } from "../../studio/draw";
import props from "./props";

const Flag = props.moonflag!, Col = props.colosseum!, Pyr = props.pyramid!, Ice = props.glacier!, Mam = props.mammoth!, Spear = props.spear!;

const Rewind: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { moonLabel?: string; romeLabel?: string; pyrLabel?: string; iceLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 120, mass: 0.9 } }));
  const tMoon = at(p, "moon", 1.2), tCol = at(p, "colosseum", 2.4), tPyr = at(p, "pyramids", 3.6), tGo = at(p, "going", 5.0), tIce = at(p, "ice", 6.4), tMam = at(p, "mammoths", 8.0);
  const kSky = clamp((t - tGo) / 1.5), kIce = sp(tIce), kMam = sp(tMam, 14);
  const min = minText(w, h);
  const g = h * 0.7;
  const sky = interpolateColors(kSky, [0, 1], ["#f6c27a", "#9fd6ff"]);
  const sky2 = interpolateColors(kSky, [0, 1], ["#e9895a", "#e6f4ff"]);
  const ground = interpolateColors(kSky, [0, 1], ["#d9a35e", "#f2f8ff"]);
  const scroll = t * w * 0.35;
  // each item slides in from the left to its place on the timeline; on "going" the whole row slides off right
  const kGo = ease(clamp((t - tGo) / 1.2));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 46, w * 0.3, { upper: true }));
  const sweep = (start: number, stop: number, node: React.ReactNode, label: string | undefined, y = g) => {
    if (t < start || kGo >= 1) return null;
    const k = ease(clamp((t - start) / 0.7));
    const x = -w * 0.25 + (stop + w * 0.25) * k + kGo * w * 1.2;
    return <g transform={`translate(${x},${y})`}>{node}{label && <text y={min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(label)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{label.toUpperCase()}</text>}</g>;
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${sky}, ${sky2})`, overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* far hills scrolling */}
        {Array.from({ length: 6 }, (_, i) => {
          const x = ((i * w * 0.35 + scroll * 0.4) % (w * 2.1)) - w * 0.3;
          return <ellipse key={i} cx={x} cy={g} rx={w * 0.3} ry={h * 0.08} fill={interpolateColors(kSky, [0, 1], ["#c98f4f", "#cfe6f7"])} opacity={0.8} />;
        })}
        <rect x={0} y={g} width={w} height={h - g} fill={ground} />
        {/* ground stripes rushing right */}
        {Array.from({ length: 14 }, (_, i) => {
          const x = ((i * w * 0.18 + scroll) % (w * 2.5)) - w * 0.2;
          return <rect key={i} x={x} y={g + h * 0.02 + (i % 3) * h * 0.06} width={w * 0.12} height={h * 0.012} rx={6} fill={interpolateColors(kSky, [0, 1], ["#b9813f", "#cfe2f2"])} />;
        })}
        {/* clouds drifting, a timeline ribbon with ticks rushing right, rocks on the ground */}
        {Array.from({ length: 5 }, (_, i) => {
          const x = ((i * w * 0.45 + scroll * 0.2) % (w * 1.8)) - w * 0.3, y = h * (0.08 + (i % 3) * 0.06);
          return <g key={`c${i}`} opacity={0.85}><ellipse cx={x} cy={y} rx={w * 0.12} ry={h * 0.022} fill="#fff" /><ellipse cx={x + w * 0.06} cy={y - h * 0.015} rx={w * 0.08} ry={h * 0.02} fill="#fff" /></g>;
        })}
        <rect x={0} y={h * 0.43} width={w} height={h * 0.05} fill="rgba(29,36,51,0.75)" />
        {Array.from({ length: 22 }, (_, i) => {
          const x = ((i * w * 0.08 + scroll * 1.2) % (w * 1.76)) - w * 0.1;
          return <rect key={`k${i}`} x={x} y={h * (i % 4 === 0 ? 0.432 : 0.442)} width={8} height={h * (i % 4 === 0 ? 0.046 : 0.026)} fill={i % 4 === 0 ? "#ffd34d" : "#fff"} />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const x = ((i * w * 0.27 + scroll * 1.5) % (w * 2.4)) - w * 0.2, y = g + h * (0.1 + (i % 3) * 0.08);
          return <ellipse key={`r${i}`} cx={x} cy={y} rx={w * (0.04 + (i % 2) * 0.03)} ry={h * 0.015} fill={interpolateColors(kSky, [0, 1], ["#a8732f", "#bcd6ea"])} stroke={INK} strokeWidth={4} />;
        })}
        {/* the clock running backwards */}
        <g transform={`translate(${w * 0.5},${h * 0.25}) scale(1.5)`}>
          <circle r={h * 0.075} fill="#fff6d6" stroke={INK} strokeWidth={9} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.sin(i * Math.PI / 6) * h * 0.06} y1={-Math.cos(i * Math.PI / 6) * h * 0.06} x2={Math.sin(i * Math.PI / 6) * h * 0.068} y2={-Math.cos(i * Math.PI / 6) * h * 0.068} stroke={INK} strokeWidth={5} />)}
          <line x1={0} y1={0} x2={Math.sin(-t * 7) * h * 0.055} y2={-Math.cos(-t * 7) * h * 0.055} stroke="#e5484d" strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(-t * 0.6) * h * 0.035} y2={-Math.cos(-t * 0.6) * h * 0.035} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <path d={`M${-h * 0.1},${-h * 0.02} a${h * 0.1},${h * 0.1} 0 0 1 ${h * 0.05},${-h * 0.07}`} fill="none" stroke="#fff" strokeWidth={8} opacity={0.8} />
        </g>
        {sweep(tMoon, w * 0.6, <Flag s={h * 0.27} t={t} />, P.moonLabel, g - h * 0.1)}
        {sweep(tCol, w * 0.5, <Col s={h * 0.15} t={t} />, P.romeLabel, g + h * 0.08)}
        {sweep(tPyr, w * 0.22, <Pyr s={h * 0.17} t={t} />, P.pyrLabel, g - h * 0.1)}
        {kIce > 0 && (
          <g transform={`translate(${-w * 0.3 + kIce * w * 0.66},${g})`}>
            <Ice s={h * 0.18} t={t} />
            {P.iceLabel && <text y={-h * 0.17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.iceLabel)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.iceLabel.toUpperCase()}</text>}
          </g>
        )}
        {kMam > 0 && <g transform={`translate(${w * 1.2 - kMam * w * 0.5},${g + h * 0.02})`}><Mam s={h * 0.22} t={t} /></g>}
        {kMam > 0 && <g transform={`translate(${w * 0.86},${g + h * 0.03})`} opacity={kMam}><Spear s={h * 0.26} t={t} state="raised" /></g>}
      </svg>
    </AbsoluteFill>
  );
};

export default Rewind;
