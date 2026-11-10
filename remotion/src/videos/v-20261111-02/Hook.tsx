/**
 * Hook (a secret): "You think Buffett's company is wasting its cash? It isn't."
 * A dark vault at night: a huge war chest of cash in the middle, dusty, cobwebs in its corners, a
 * flickering bulb above; Rohan on the left shrugging. Frame 0 reads BUFFETT'S CASH PILE over WASTED?.
 * On "company" the chest hops; on "wasting" dust puffs off it and the cobwebs sway; on "isn't" a gold
 * NOT WASTED stamp slams, the dust blows away and the chest's glint flares.
 *
 * params: { line, ask, cross }, events: company, wasting, cash, isnt
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Chest = props.warchest!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCo = at(p, "company", 0.6), tW = at(p, "wasting", 1.2), tNo = at(p, "isnt", 2.4);
  const kCo = sp(tCo, 8), kNo = sp(tNo, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 116, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 110, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 100, (box.x1 - box.x0) * 0.8, { upper: true }));
  const g = h * 0.66, cx = w * 0.6;
  const hop = t > tCo && t < tCo + 0.5 ? Math.sin((t - tCo) * Math.PI * 2) * h * 0.02 : 0;
  const dust = t < tW ? [] : Array.from({ length: 16 }, (_, i) => {
    const f = clamp((t - tW) * 0.8 - i * 0.02);
    const ang = -Math.PI / 2 + (random(`d${i}`) - 0.5) * 2.6;
    const r = f * h * (0.1 + random(`e${i}`) * 0.1) + (t > tNo ? (t - tNo) * w * 0.6 : 0);
    return <circle key={i} cx={cx + Math.cos(ang) * r} cy={g - h * 0.18 + Math.sin(ang) * r} r={h * (0.012 + 0.012 * random(`f${i}`))} fill="#c9c2b4" opacity={(1 - f * 0.6) * (1 - clamp((t - tNo) * 1.5))} />;
  });
  const web = (x: number, y: number, flip: number) => (
    <g transform={`translate(${x},${y}) scale(${flip},1) rotate(${Math.sin(t * 3) * 3 * (t > tW ? 2 : 1)})`} opacity={0.75 * (1 - clamp((t - tNo) * 2))}>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M0,0 Q${40 + i * 25},${10 + i * 8} ${70 + i * 30},${60 + i * 20}`} fill="none" stroke="#e8e8e8" strokeWidth={3} />)}
      {[30, 60, 90].map((r) => <path key={r} d={`M${r},${r * 0.1} Q${r * 0.9},${r * 0.6} ${r * 0.3},${r}`} fill="none" stroke="#e8e8e8" strokeWidth={2.5} />)}
    </g>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.05 * kNo})`, transformOrigin: "60% 60%" }}>
        <World kind="bank" tint="#2a1e3e" w={w} h={h} t={t} seed="hook-berkshire-vault" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <line x1={cx} y1={0} x2={cx} y2={h * 0.33} stroke={INK} strokeWidth={4} />
          <circle cx={cx} cy={h * 0.345} r={h * 0.016} fill="#ffe9a8" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 9))} />
          <ellipse cx={cx} cy={g - h * 0.14} rx={w * 0.34} ry={h * 0.16} fill="#ffd27a" opacity={0.1 + 0.18 * kNo} />
          <g transform={`translate(${cx},${g - hop}) scale(${1 + 0.06 * kCo})`}><Chest s={h * 0.32} t={t} /></g>
          {web(cx - h * 0.2, g - h * 0.17, 1)}
          {web(cx + h * 0.2, g - h * 0.17, -1)}
          {dust}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 1.0, acting: [{ sec: 0, pose: "shrug", expression: "smirk" }, { at: "isnt", pose: "facepalm", expression: "shock" }] }}
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
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.2, textAlign: "center", opacity: 1 - 0.6 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#cfc7ff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill" }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", transform: `rotate(-6deg) scale(${1.7 - 0.7 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: INK, background: "#ffd84a", padding: `${cSize * 0.12}px ${cSize * 0.4}px`, border: `8px solid ${INK}`, borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
