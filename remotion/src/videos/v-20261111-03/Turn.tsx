/**
 * The turn: "Next to that, what's his team's money? A side cheque."
 * An office at dusk, header WHO PAYS FOR HIS LIFE? from frame 0. Right: a sponsor billboard with a
 * sneaker and a gift box raining cash into a tall pile, the sponsors' figure over it. Left: the team's
 * small cheque. On "that" the sponsor pile surges up and its figure slams in; on "team's" the small
 * cheque pops in with its figure, looking tiny beside it; on "side" it shrinks further and tilts while
 * a SIDE CHEQUE chip drops on it.
 *
 * params: { header, big, bigLabel, small, smallLabel }, events: that, team, side
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Board = props.billboard!, Shoe = props.sneaker!, Gift = props.giftbox!, Cheque = props.bigcheque!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; big?: string; bigLabel?: string; small?: string; smallLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tT = at(p, "that", 0.4), tTeam = at(p, "team", 1.4), tS = at(p, "side", 2.4);
  const kT = sp(tT, 9), kTeam = sp(tTeam, 9), kS = sp(tS, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const colW = (box.x1 - box.x0) * 0.47;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 74, box.x1 - box.x0 - 80, { upper: true }));
  const g = h * 0.66, lx = w * 0.27, rx = w * 0.72;
  const rows = Math.round(2 + 5 * kT);
  const pile = Array.from({ length: rows * 2 }, (_, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    return <rect key={i} x={rx - h * 0.07 + c * h * 0.07} y={g - (r + 1) * h * 0.035} width={h * 0.068} height={h * 0.033} rx={4} fill="#7fcf8f" stroke={INK} strokeWidth={3} />;
  });
  const notes = Array.from({ length: 6 }, (_, i) => {
    const f = ((t * 0.9) + i / 6) % 1;
    const x = rx + Math.sin(i * 2.1) * w * 0.1, y = h * 0.32 + f * (g - h * 0.32 - rows * h * 0.035);
    return <rect key={i} x={x - h * 0.015} y={y} width={h * 0.03} height={h * 0.017} rx={3} fill="#8fd19e" stroke={INK} strokeWidth={2.5} transform={`rotate(${f * 360} ${x} ${y})`} />;
  });
  const chip = (top: string, bottom: string, x: number, y: number, k: number, bg: string, base: number) => (
    <div style={{ position: "absolute", left: x - colW / 2, width: colW, top: y, textAlign: "center", opacity: clamp(k * 2), transform: `scale(${1.4 - 0.4 * k})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(top, base, colW)), color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{top}</div>
      <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(bottom.toUpperCase(), 48, colW, { upper: true })), color: INK, background: bg, padding: "4px 14px", borderRadius: 12, border: `4px solid ${INK}` }}>{bottom.toUpperCase()}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * kS})`, transformOrigin: "35% 62%" }}>
        <World kind="office" tint="#5e2e1e" w={w} h={h} t={t} seed="turn-ohtani-sponsors" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${rx},${h * 0.42})`}><Board s={h * 0.16} t={t} /></g>
          {pile}
          {notes}
          <g transform={`translate(${rx + w * 0.2},${g})`}><Shoe s={h * 0.08} t={t} /></g>
          <g transform={`translate(${rx - w * 0.2},${g})`}><Gift s={h * 0.08} t={t} /></g>
          {kTeam > 0 && <g transform={`translate(${lx},${g}) scale(${kTeam * (1 - 0.35 * kS)}) rotate(${-12 * kS})`}><Cheque s={h * 0.14} t={t} /></g>}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: INK, background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.45}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.big && chip(P.big, P.bigLabel ?? "", rx, h * 0.16, kT, "#8fd19e", 100)}
      {P.small && chip(P.small, P.smallLabel ?? "", lx, h * 0.3, kTeam, "#fff", 70)}
      {kS > 0 && (
        <div style={{ position: "absolute", left: lx - colW / 2, width: colW, top: h * 0.46, textAlign: "center", opacity: clamp(kS * 2), transform: `rotate(-6deg) scale(${1.5 - 0.5 * kS})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine("SIDE CHEQUE", 60, colW, { upper: true })), color: "#fff", background: "#e5484d", padding: "4px 16px", borderRadius: 12, border: `5px solid ${INK}` }}>SIDE CHEQUE</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
