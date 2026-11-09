/**
 * Hook (a secret): "You think splitting a billionaire's fortune makes everyone rich? It doesn't."
 * A gold-lit vault, a mountain of cash in the middle and a big knife hovering over it, Rohan on the
 * left cheering. Frame 0 reads SPLIT A BILLIONAIRE'S FORTUNE over EVERYONE RICH?. On "splitting"
 * the knife chops down and the mountain splits in two; on "rich" notes burst upward; on "doesn't" a
 * red NOT EVEN CLOSE stamp slams and the halves crumble into a scatter of tiny notes.
 *
 * params: { line, ask, cross }, events: split, fortune, rich, doesnt
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pile = props.moneymountain!, Knife = props.knife!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tSplit = at(p, "split", 0.5), tRich = at(p, "rich", 1.8), tNo = at(p, "doesnt", 2.6);
  const kSplit = sp(tSplit, 9), kRich = sp(tRich, 10), kNo = sp(tNo, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 110, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 100, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.8, { upper: true }));
  const g = h * 0.64, cx = w * 0.6;
  const chop = clamp((t - tSplit) * 4);
  const gap = kSplit * w * 0.07;
  const crumble = clamp((t - tNo) * 1.5);
  const notes = t < tRich ? [] : Array.from({ length: 14 }, (_, i) => {
    const f = clamp((t - tRich) * 0.9 - i * 0.03);
    const ang = -Math.PI / 2 + (random(`a${i}`) - 0.5) * 2.2;
    const r = f * h * (0.18 + random(`r${i}`) * 0.12);
    const x = cx + Math.cos(ang) * r, y = g - h * 0.14 + Math.sin(ang) * r + f * f * h * 0.15;
    return <rect key={i} x={x - h * 0.016} y={y - h * 0.009} width={h * 0.032} height={h * 0.018} rx={3} fill="#8fd19e" stroke={INK} strokeWidth={3}
      transform={`rotate(${f * 400 + i * 25} ${x} ${y})`} opacity={1 - f * 0.4} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.015 * t + 0.05 * kNo})`, transformOrigin: "55% 55%" }}>
        <World kind="bank" tint="#6e4a1e" w={w} h={h} t={t} seed="hook-split-vault" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={cx} cy={g - h * 0.12} rx={w * 0.32} ry={h * 0.14} fill="#ffd27a" opacity={0.16 + 0.08 * Math.sin(t * 3)} />
          <g transform={`translate(${cx - gap},${g + crumble * h * 0.03}) rotate(${-6 * kSplit - 10 * crumble})`} opacity={1 - 0.5 * crumble}>
            <svg x={-w * 0.4} y={-h * 0.4} width={w * 0.4} height={h * 0.45} viewBox={`${-w * 0.4} ${-h * 0.4} ${w * 0.4} ${h * 0.45}`} overflow="hidden"><Pile s={h * 0.24} t={t} /></svg>
          </g>
          <g transform={`translate(${cx + gap},${g + crumble * h * 0.03}) rotate(${6 * kSplit + 10 * crumble})`} opacity={1 - 0.5 * crumble}>
            <svg x={0} y={-h * 0.4} width={w * 0.4} height={h * 0.45} viewBox={`0 ${-h * 0.4} ${w * 0.4} ${h * 0.45}`} overflow="hidden"><Pile s={h * 0.24} t={t} /></svg>
          </g>
          <g transform={`translate(${cx + w * 0.28},${g - h * 0.18 + chop * h * 0.06})`}><Knife s={h * 0.2} t={t} /></g>
          {notes}
          <Actor p={p} spec={{ who: "rohan", x: 0.18, scale: 1.05, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "rich", pose: "celebrate", expression: "laugh" }, { at: "doesnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.24, textAlign: "center", opacity: 1 - 0.5 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.08 * kRich * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.33, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
