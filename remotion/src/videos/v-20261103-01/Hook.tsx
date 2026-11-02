/**
 * Hook (a question): "You think Apple only earns from iPhones? It doesn't. Here's why."
 * An office at night, Rohan big on the left holding up the idea. Frame 0 reads NOT JUST IPHONES over
 * a giant iPhone and a crate of apples. On "Apple" the crate pops; on "iPhones" the phone glows; on
 * "doesn't" a four-colour vault slides in from the right and coins stream from it into the phone's
 * search box; on "why" a tag FROM GOOGLE swings down over the stream.
 *
 * params: { line, tag }, events: apple, iphones, doesnt, why
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Phone = props.iphone!, Crate = props.applecrate!, Vault = props.gvault!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; tag?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tApple = at(p, "apple", 0.5), tPhone = at(p, "iphones", 1.2), tNo = at(p, "doesnt", 2.0), tWhy = at(p, "why", 3.0);
  const kApple = sp(tApple, 8), kPhone = sp(tPhone, 9), kVault = sp(tNo, 12), kTag = sp(tWhy, 9);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 130, box.x1 - box.x0 - 40, { upper: true }));
  const tag = (P.tag ?? "").toUpperCase();
  const tagSize = Math.max(min, fitLine(tag, 64, w * 0.5, { upper: true }));
  const g = h * 0.7;
  const px = w * 0.6, py = g, ps = h * 0.42;
  const vx = w * (1.15 - 0.28 * kVault), vy = h * 0.42;
  const coins = t < tNo ? [] : Array.from({ length: 7 }, (_, i) => {
    const f = ((t - tNo) * 0.9 + i / 7) % 1;
    const x = vx + (px - vx) * f, y = vy - h * 0.12 - Math.sin(f * Math.PI) * h * 0.08 + (py - ps * 0.74 - (vy - h * 0.12)) * f;
    return <circle key={i} cx={x} cy={y} r={h * 0.016} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5) * clamp(f * 8)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.02 * t})`, transformOrigin: "55% 55%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}o`} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(80,160,255,0.25), rgba(0,10,40,0.55) 75%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${px},${py}) scale(${1 + 0.06 * kPhone})`}>
            {kPhone > 0 && <ellipse cx={0} cy={-ps * 0.5} rx={ps * 0.42 * kPhone} ry={ps * 0.6 * kPhone} fill="rgba(124,200,255,0.25)" />}
            <Phone s={ps} t={t} />
          </g>
          <g transform={`translate(${w * 0.78},${h * 0.83}) scale(${0.8 + 0.2 * kApple})`}><Crate s={h * 0.13} t={t} /></g>
          {kVault > 0 && <g transform={`translate(${vx},${vy})`}><Vault s={h * 0.17} t={t} state="open" /></g>}
          {coins}
          <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 1.1, acting: [{ sec: 0, pose: "present", expression: "smirk" }, { at: "doesnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.74} index={0} />
          {kTag > 0 && tag && (
            <g transform={`translate(${w * 0.68},${h * 0.28}) rotate(${-6 + 8 * (1 - kTag)})`} opacity={clamp(kTag * 2)}>
              <rect x={-tagSize * tag.length * 0.36 - 24} y={-tagSize * 0.85} width={tagSize * tag.length * 0.72 + 48} height={tagSize * 1.45} rx={18} fill="#fff" stroke={INK} strokeWidth={7} />
              <text y={tagSize * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={tagSize} fill="#1f6fd1">{tag}</text>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.09, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
