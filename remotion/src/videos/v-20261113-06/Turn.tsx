/**
 * The turn: "But number one is miles higher. Elon Musk, who runs Tesla and SpaceX, is worth {musk_total}."
 * Space. Header NUMBER ONE. Larry Page's gold tower sits small at the bottom left; on "miles" a
 * giant gold tower shoots up from the ground on the right, past the top of his; on "Musk" an ELON
 * MUSK plate lands on it; on "Tesla" a red electric car rolls in, on "SpaceX" a rocket rises beside
 * it; on "worth" {musk_total} slams in over the tower.
 *
 * params: { header, name, fig, small }, events: one, miles, musk, tesla, spacex, worth
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.goldtower!, Car = props.teslacar!, Rocket = props.rocket!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; name?: string; fig?: string; small?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tO = at(p, "one", 0.3), tM = at(p, "miles", 0.9), tU = at(p, "musk", 1.8), tT = at(p, "tesla", 2.6), tX = at(p, "spacex", 3.2), tW = at(p, "worth", 3.9);
  const kO = sp(tO), kM = sp(tM, 14), kU = sp(tU, 9), kT = sp(tT, 12), kX = sp(tX, 12), kW = sp(tW, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 96, maxW, { upper: true }));
  const name = (P.name ?? "").toUpperCase();
  const nSize = Math.max(min, fitLine(name, 60, w * 0.42, { upper: true }));
  const small = (P.small ?? "").toUpperCase();
  const smSize = Math.max(min, fitLine(small, 46, w * 0.3, { upper: true }));
  const fSize = Math.max(min, fitLine(P.fig ?? "", 200, maxW * 0.8));
  const g = h * 0.7;
  const xB = w * 0.62, xS = w * 0.2;
  const big = h * (0.12 + 0.38 * clamp(kM));
  const topBig = g - big;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 60%" }}>
        <World kind="space" tint="#14203f" w={w} h={h} t={t} seed="turn-musk-tower" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${xS},${g})`}><Tower s={h * 0.14} t={t} k={1} /></g>
          <g transform={`translate(${xB},${g})`}><Tower s={big} t={t} k={1} state="full" /></g>
          {kT > 0 && <g transform={`translate(${w * 0.3 - (1 - clamp(kT)) * w * 0.4},${g + h * 0.1})`}><Car s={h * 0.1} t={t} /></g>}
          {kX > 0 && <g transform={`translate(${w * 0.88},${g + h * 0.12 - h * 0.06 * clamp(kX)})`} opacity={clamp(kX * 2)}><Rocket s={h * 0.2} t={t} /></g>}
        </svg>
        {small && (
          <div style={{ position: "absolute", left: xS - w * 0.15, width: w * 0.3, top: g + h * 0.015, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: smSize, color: "#fff", background: INK, padding: "3px 12px", borderRadius: 10 }}>{small}</span>
          </div>
        )}
        {kU > 0 && name && (
          <div style={{ position: "absolute", left: xB - w * 0.22, width: w * 0.44, top: topBig - h * 0.06, textAlign: "center", transform: `scale(${1.5 - 0.5 * kU})`, opacity: clamp(kU * 2) }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: nSize, color: INK, background: "#ffd84a", padding: "4px 16px", borderRadius: 12, border: `6px solid ${INK}` }}>{name}</span>
          </div>
        )}
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#3d7bf5", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: `rotate(-2deg) scale(${1 + 0.1 * kO * Math.max(0, 1 - (t - tO) * 2)})`, border: `6px solid ${INK}` }}>{header}</span>
        </div>
      )}
      {kW > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.15, textAlign: "center", transform: `scale(${1.5 - 0.5 * kW})`, opacity: clamp(kW * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.fig}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
