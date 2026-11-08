/**
 * Hook (a secret): "Delta makes its money flying you? Watch this."
 * A sunny airport apron: a red-tailed jetliner big in the middle, a blue plane seat on the right with
 * YOUR SEAT under it, Rohan on the left cheering with his boarding pass. Frame 0 reads DELTA MAKES
 * MONEY FLYING YOU? On "Delta" the jet hops; on "flying" it lifts off and climbs; on "Watch" a red
 * NOT ONLY stamp slams over the question and Rohan shrugs; on "this" a gold rewards card with no name
 * flips in where the jet was.
 *
 * params: { line, cross, seat }, events: delta, money, flying, watch, this
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Jet = props.jetliner!, Seat = props.planeseat!, Card = props.rewardcard!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; cross?: string; seat?: string; card?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tDelta = at(p, "delta", 0.1), tFly = at(p, "flying", 1.0), tNo = at(p, "watch", 1.7), tThis = at(p, "this", 2.1);
  const kDelta = sp(tDelta, 8), kNo = sp(tNo, 9), kThis = sp(tThis, 11);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.7, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, jx = w * 0.5;
  const fly = clamp((t - tFly) / 1.4);
  const hop = kDelta * Math.abs(Math.sin((t - tDelta) * 6)) * (t < tDelta + 0.6 ? 1 : 0);
  const jetX = jx + fly * w * 0.5, jetY = g - h * 0.1 - fly * fly * h * 0.3 - hop * h * 0.02;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t + 0.04 * kNo})`, transformOrigin: "50% 55%" }}>
        <World kind="field" tint="#3d7bf5" w={w} h={h} t={t} seed="hook-apron-delta" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={0} y={g + h * 0.02} width={w} height={h * 0.05} fill="#5b6378" opacity={0.6} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * w * 0.24 + ((t * 120) % (w * 0.24)) - w * 0.1} y={g + h * 0.04} width={w * 0.1} height={h * 0.008} fill="#fff" opacity={0.8} />)}
          <g transform={`translate(${w * 0.86},${g + h * 0.02})`}><Seat s={h * 0.14} t={t} /></g>
          <g transform={`translate(${jetX},${jetY}) rotate(${-fly * 12})`} opacity={1 - clamp((fly - 0.8) * 5) * 0}><Jet s={h * 0.2} t={t} /></g>
          {kThis > 0 && (
            <g transform={`translate(${w * 0.56},${g - h * 0.06}) rotate(${(1 - kThis) * 120}) scale(${0.3 + 0.7 * kThis})`} opacity={clamp(kThis * 2)}><Card s={h * 0.16} t={t} /></g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "watch", pose: "shrug", expression: "confused" }] }}
            ground={h * 0.82} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, opacity: 1 - 0.4 * kNo, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {P.seat && (
        <div style={{ position: "absolute", left: w * 0.7, width: box.x1 - w * 0.7, top: h * 0.5, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.seat, box.x1 - w * 0.7 - 10, 46), color: "#fff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.seat.toUpperCase()}</span>
        </div>
      )}
      {kThis > 0 && P.card && (
        <div style={{ position: "absolute", left: w * 0.36, width: w * 0.4, top: h * 0.36, textAlign: "center", opacity: clamp(kThis * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.card, w * 0.36, 64), color: "#1d2433", background: "#ffd84a", padding: "4px 22px", borderRadius: 12, border: "5px solid #1d2433" }}>{P.card.toUpperCase()}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.26, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
