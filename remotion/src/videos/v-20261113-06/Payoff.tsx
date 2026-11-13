/**
 * The payoff: "One man is worth {gap_ratio} the fortune that gets you in, and {mshare_pct} of the whole list."
 * Space in gold light. On "man" Musk's gold tower towers in the middle with ELON MUSK on it; on
 * "fortune" the little gold door of last place shakes at its foot and {gap_ratio} slams in at the
 * top with LAST PLACE, TIMES under it; on "whole" a ring fills to {mshare_pct} on the left; on
 * "list" its label OF THE WHOLE LIST pops.
 *
 * params: { fig, label, pct, pctLabel, name }, events: man, fortune, whole, list
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tower = props.goldtower!, Door = props.golddoor!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { fig?: string; label?: string; pct?: string; pctLabel?: string; name?: string; pctValue?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tM = Math.min(0.05, at(p, "man", 0.3)), tF = at(p, "fortune", 1.6), tW = at(p, "whole", 3.4), tL = at(p, "list", 3.8);
  const kM = sp(tM, 13), kW = sp(tW, 14), kL = sp(tL, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const g = h * 0.72;
  const fSize = Math.max(min, fitLine(P.fig ?? "", 220, maxW * 0.8));
  const labSize = Math.max(min, fitLine((P.label ?? "").toUpperCase(), 56, maxW, { upper: true }));
  const name = (P.name ?? "").toUpperCase();
  const nSize = Math.max(min, fitLine(name, 56, w * 0.4, { upper: true }));
  const pSize = Math.max(min, fitLine(P.pct ?? "", 84, w * 0.26));
  const plSize = Math.max(min, fitLine((P.pctLabel ?? "").toUpperCase(), 44, w * 0.36, { upper: true }));
  const big = h * (0.34 + 0.05 * clamp(kM));
  const xT = w * 0.64, xR = w * 0.24, yR = h * 0.44, r = w * 0.13;
  const pctNum = clamp(Number(P.pctValue ?? 0) / 100);
  const hop = t > tF && t < tF + 0.5 ? Math.sin((t - tF) * Math.PI * 2) * h * 0.012 : 0;
  const arc = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 60%" }}>
        <World kind="space" tint="#3a2a08" w={w} h={h} t={t} seed="payoff-musk-gap" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${xT},${g})`}><Tower s={big} t={t} k={1} state="full" /></g>
          <g transform={`translate(${w * 0.3},${g - hop})`}><Door s={h * 0.16} t={t} /></g>
          {kW > 0 && (
            <g transform={`translate(${xR},${yR})`} opacity={clamp(kW * 2)}>
              <circle r={r} fill="none" stroke="#2b3245" strokeWidth={r * 0.32} />
              <circle r={r} fill="none" stroke="#ffd84a" strokeWidth={r * 0.32} strokeDasharray={`${arc * pctNum * clamp(kW)} ${arc}`} transform="rotate(-90)" />
              <circle r={r * 0.84} fill="none" stroke={INK} strokeWidth={4} />
            </g>
          )}
        </svg>
        {name && (
          <div style={{ position: "absolute", left: xT - w * 0.2, width: w * 0.4, top: g - big - h * 0.06, textAlign: "center", opacity: 1 }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: nSize, color: INK, background: "#ffd84a", padding: "4px 14px", borderRadius: 10, border: `5px solid ${INK}` }}>{name}</span>
          </div>
        )}
        {kW > 0 && (
          <div style={{ position: "absolute", left: xR - w * 0.18, width: w * 0.36, top: yR - pSize * 0.6, textAlign: "center", opacity: clamp(kW * 2) }}>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: pSize, color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.pct}</span>
          </div>
        )}
        {kL > 0 && (
          <div style={{ position: "absolute", left: xR - w * 0.19, width: w * 0.38, top: yR + r * 1.3, textAlign: "center", transform: `scale(${1.4 - 0.4 * kL})`, opacity: clamp(kL * 2) }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: plSize, color: "#fff", background: INK, padding: "4px 12px", borderRadius: 10 }}>{(P.pctLabel ?? "").toUpperCase()}</span>
          </div>
        )}
      </AbsoluteFill>
      {kM > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.07, textAlign: "center", transform: `scale(${1.5 - 0.5 * kM})`, opacity: clamp(kM * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.fig}</div>
          <div><span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.label ?? "").toUpperCase()}</span></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
