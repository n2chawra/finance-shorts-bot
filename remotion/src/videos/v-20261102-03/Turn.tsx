/**
 * The turn: "Because they don't get paid by the year. They own a piece of something that grows,
 * like a company, so the pile grows even while they sleep."
 * Sharma in the penthouse. On the left a pay envelope sits still; on "own" a company tower rises
 * behind it and a slice of it lights gold (his piece); on "grows" and "pile" a cash tower beside it
 * climbs bundle by bundle; on "sleep" night falls over the window with a moon, and the tower keeps
 * climbing. OWN IT stamps across the top.
 *
 * params: { stamp: "Own it" }, events: paid, own, piece, grows, company, pile, sleep
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Env = props.payenvelope!, Tower = props.billiontower!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tOwn = at(p, "own", 1.6), tPiece = at(p, "piece", 2.0), tGrow = at(p, "grows", 2.8), tSleep = at(p, "sleep", 6.0);
  const kCo = sp(tOwn, 12), kPiece = sp(tPiece, 10), kNight = clamp((t - tSleep) / 0.8), kStamp = sp(tOwn + 0.3, 8);
  const grow = 0.35 + 0.65 * clamp((t - tGrow) / 4);
  const Pent = SETS.penthouse!;
  const box = safeBox(w, h);
  const stamp = (P.stamp ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitLine(stamp, 120, box.x1 - box.x0 - 160, { upper: true }));
  const g = h * 0.66;
  const cx = w * 0.3, cw = w * 0.22, ch = h * 0.34 * kCo;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.05 - 0.03 * clamp((t - tGrow) / 2)})`, transformOrigin: "50% 45%" }}>
        <Pent.back w={w} h={h} t={t} seed={`${p.beat.id}p`} />
        <AbsoluteFill style={{ background: `rgba(10,0,40,${0.25 + 0.35 * kNight})` }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kNight > 0 && <circle cx={w * 0.2} cy={h * 0.2} r={h * 0.04 * kNight} fill="#fff6d6" stroke={INK} strokeWidth={5} />}
          {kCo > 0 && (
            <g>
              <rect x={cx - cw / 2} y={g - ch} width={cw} height={ch} fill="#3d4a7a" stroke={INK} strokeWidth={6} rx={8} />
              {Array.from({ length: 12 }, (_, i) => {
                const r = Math.floor(i / 3), c = i % 3, y = g - ch + 20 + r * (ch / 4.2);
                return y < g - 30 ? <rect key={i} x={cx - cw / 2 + 18 + c * (cw - 36) / 3} y={y} width={(cw - 72) / 3} height={ch / 8} fill={(i + Math.floor(t * 2)) % 4 ? "#ffe9a8" : "#fff6d6"} stroke={INK} strokeWidth={3} /> : null;
              })}
              {kPiece > 0 && <rect x={cx - cw / 2} y={g - ch} width={cw * 0.34} height={ch} fill="rgba(242,182,49,0.55)" stroke="#f2b631" strokeWidth={8} rx={8} opacity={kPiece} />}
            </g>
          )}
          <g transform={`translate(${w * 0.56},${g}) scale(1,${grow})`}><Tower s={h * 0.36} t={t} /></g>
          <g transform={`translate(${w * 0.13},${g})`}><Env s={h * 0.07} t={0} /></g>
          <Actor p={p} spec={{ who: "sharma", x: 0.82, scale: 0.9, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "own", pose: "present", expression: "proud" }, { at: "sleep", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.68} index={0} />
        </svg>
      </AbsoluteFill>
      {stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.12, textAlign: "center", transform: `scale(${2 - kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#1f8f55", border: "12px solid #1f8f55", borderRadius: 24, padding: "0 30px", background: "rgba(240,255,246,0.94)", lineHeight: 1.15 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
