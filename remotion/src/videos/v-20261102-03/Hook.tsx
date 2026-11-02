/**
 * Hook (a challenge): "A billion dollars on a good salary. When would you have to start?"
 * A vault at night: Rohan cheers beside one pay envelope. Frame 0 reads HOW MANY YEARS? On
 * "billion" the outline of a sky-high cash tower snaps up on the right; on "salary" pay envelopes
 * drop into it and fill only a sliver at the bottom; on "When" a pyramid rises far behind,
 * small under the tower; on "start" a sundial's shadow starts whirling backwards.
 *
 * params: { line: "How many years?" }, events: billion, salary, pyramids, watch
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Env = props.payenvelope!, Pyr = props.pyramid!, Dial = props.sundial!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.9 } }));
  const tBil = at(p, "billion", 0.4), tSal = at(p, "salary", 1.6), tPyr = at(p, "pyramids", 2.4), tWatch = at(p, "watch", 3.2);
  const kTower = 0.55 + 0.45 * sp(tBil, 12), kPyr = sp(tPyr, 12), kDial = sp(tWatch, 10);
  const Vault = SETS.vault!;
  const box = safeBox(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(minText(w, h), fitWords(line, 124, box.x1 - box.x0 - 40, { upper: true }));
  const tx = w * 0.72, base = h * 0.8, top = h * 0.24, tw = w * 0.26;
  const towerTop = base - (base - top) * kTower;
  const fill = clamp((t - tSal) / 2) * h * 0.025;
  const drops = t < tSal ? [] : Array.from({ length: 4 }, (_, i) => {
    const f = ((t - tSal) * 1.1 + i / 4) % 1;
    return <g key={i} transform={`translate(${tx + (i - 1.5) * w * 0.04},${top + (base - top) * f}) rotate(${f * 90})`} opacity={clamp((1 - f) * 6)}><Env s={h * 0.035} t={t} /></g>;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.02 * t})`, transformOrigin: "50% 60%" }}>
        <Vault.back w={w} h={h} t={t} seed={`${p.beat.id}v`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 65% 55%, rgba(200,140,255,0.22), rgba(20,0,40,0.5) 72%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {kPyr > 0 && <g transform={`translate(${w * 0.46},${base}) scale(${kPyr})`} opacity={0.9}><Pyr s={h * 0.13} t={t} /></g>}
          {kTower > 0 && (
            <g>
              <rect x={tx - tw / 2} y={towerTop} width={tw} height={base - towerTop} rx={14} fill="rgba(47,179,122,0.12)" stroke="#7cf0b2" strokeWidth={8} strokeDasharray="28 16" />
              <rect x={tx - tw / 2 + 6} y={base - fill} width={tw - 12} height={fill} fill="#2fb37a" stroke={INK} strokeWidth={4} />
            </g>
          )}
          {drops}
          <g transform={`translate(${w * 0.45},${h * 0.86})`}><Env s={h * 0.07} t={t} /></g>
          {kDial > 0 && <g transform={`translate(${w * 0.86},${h * 0.92}) scale(${kDial})`}><Dial s={h * 0.08} t={-t * 6} /></g>}
          <Actor p={p} spec={{ who: "rohan", x: 0.3, scale: 1.7, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "pyramids", pose: "shrug", expression: "shock" }] }}
            ground={h * 1.25} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.1, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.05 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
