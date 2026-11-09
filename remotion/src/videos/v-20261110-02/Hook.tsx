/**
 * Hook (a secret): "You think MrBeast gets rich from his videos? He doesn't."
 * A studio office at night, a giant video screen with a red play button in the middle, money bags
 * piled at its foot and notes floating up from it, Rohan on the left pointing. Frame 0 reads
 * MRBEAST'S VIDEOS over RICH FROM THEM?. On "MrBeast" the screen hops; on "rich" the notes stream
 * faster; on "doesn't" a red NOT THE VIDEOS stamp slams, the notes stop and fall, and a chocolate
 * bar pops up beside the screen.
 *
 * params: { line, ask, cross }, events: beast, rich, videos, doesnt
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Screen = props.videoscreen!, Bag = props.leakbag!, Bar = props.chocobar!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tBeast = at(p, "beast", 0.4), tRich = at(p, "rich", 1.0), tNo = at(p, "doesnt", 2.4);
  const kBeast = sp(tBeast, 8), kRich = sp(tRich, 10), kNo = sp(tNo, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitLine(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 100, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.8, { upper: true }));
  const g = h * 0.62, sx = w * 0.58;
  const hop = kBeast * Math.abs(Math.sin((t - tBeast) * 6)) * (t < tBeast + 0.6 ? 1 : 0);
  const notes = Array.from({ length: 12 }, (_, i) => {
    const speed = 0.4 + random(`n${i}`) * 0.3 + (t > tRich ? 0.3 : 0);
    const f = (t * speed + random(`m${i}`)) % 1;
    const fall = clamp((t - tNo) * 1.5);
    const x = sx + (random(`x${i}`) - 0.5) * w * 0.6;
    const y = t < tNo ? g - h * 0.22 - f * h * 0.28 : g - h * 0.4 + fall * h * 0.4;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 300 + i * 30} ${x} ${y})`} opacity={(i < 7 || t > tRich) ? (t < tNo ? 1 - f * 0.5 : 1 - fall) : 0} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.015 * t + 0.05 * kNo})`, transformOrigin: "55% 55%" }}>
        <World kind="office" tint="#3a1e5e" w={w} h={h} t={t} seed="hook-beast-studio" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={sx} cy={g - h * 0.14} rx={w * 0.34} ry={h * 0.16} fill="#ffd27a" opacity={0.12 + 0.1 * kRich * (1 - kNo)} />
          <g transform={`translate(${sx},${g}) scale(${1 + 0.06 * hop})`}><Screen s={h * 0.24} t={t} /></g>
          <g transform={`translate(${sx - w * 0.2},${g + h * 0.02})`}><Bag s={h * 0.08} t={t} k={1 - 0.5 * kNo} /></g>
          <g transform={`translate(${sx + w * 0.22},${g + h * 0.02})`}><Bag s={h * 0.07} t={t + 1} k={1 - 0.5 * kNo} /></g>
          {notes}
          {kNo > 0 && <g transform={`translate(${w * 0.84},${g + (1 - kNo) * h * 0.2}) scale(${kNo})`}><Bar s={h * 0.1} t={t} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "rich", pose: "celebrate", expression: "laugh" }, { at: "doesnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.2, textAlign: "center", opacity: 1 - 0.5 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.08 * kRich * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.27, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
