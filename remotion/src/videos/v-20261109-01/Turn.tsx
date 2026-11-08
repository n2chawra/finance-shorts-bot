/**
 * The turn: "Every single day, that gap brings the bank this much money."
 * A dusk office floor, header EVERY SINGLE DAY from frame 0. The year's gap stands as a tall gold
 * column on the left with its figure and A YEAR. On "every" the column is ruled into thin daily
 * slices; on "day" one slice flies out to the right and swells into a money sack; on "brings" a
 * desk calendar page flips beside it; on "money" the day's figure slams in huge with A DAY.
 *
 * params: { header, year, yearLabel, day, dayLabel }, events: every, day, brings, money
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Bag = props.gapbag!, Book = props.passbook!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; year?: string; yearLabel?: string; day?: string; dayLabel?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 130, mass: 0.85 } }));
  const tEvery = at(p, "every", 0.2), tDay = at(p, "day", 0.8), tBring = at(p, "brings", 1.4), tMoney = at(p, "money", 2.4);
  const kEvery = sp(tEvery), kDay = sp(tDay, 11), kBring = sp(tBring), kMoney = sp(tMoney, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const colW = w * 0.24, xCol = w * 0.27, base = h * 0.62, hCol = h * 0.34;
  const lab = (s: string, max: number, base0 = 54) => Math.max(min * 1.1, fitLine(s.toUpperCase(), base0, max, { upper: true }));
  // one slice leaves the column and flies to the sack's place
  const sx = xCol + (w * 0.68 - xCol) * kDay, sy = base - hCol * 0.5 - Math.sin(kDay * Math.PI) * h * 0.1;
  const bagS = h * (0.04 + 0.16 * kDay);
  const zoom = 1 + 0.05 * kMoney;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "60% 50%" }}>
        <World kind="office" tint="#3a2a6e" w={w} h={h} t={t} seed="turn-bank-floor" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={xCol - colW / 2} y={base - hCol} width={colW} height={hCol} rx={14} fill="#f2b631" stroke={INK} strokeWidth={7} />
          {Array.from({ length: 36 }, (_, i) => (
            <line key={i} x1={xCol - colW / 2 + 8} x2={xCol + colW / 2 - 8} y1={base - (i + 1) * hCol / 37} y2={base - (i + 1) * hCol / 37} stroke="#c98d12" strokeWidth={3}
              opacity={clamp(kEvery * 3 - i / 18)} />
          ))}
          {kDay > 0 && kDay < 0.98 && <rect x={sx - colW * 0.4} y={sy - 8} width={colW * 0.8} height={16} rx={6} fill="#ffd84a" stroke={INK} strokeWidth={4} />}
          {kDay > 0.6 && <g transform={`translate(${w * 0.68},${base})`} opacity={clamp((kDay - 0.6) * 3)}><Bag s={bagS} t={t} /></g>}
          {kBring > 0 && (
            <g transform={`translate(${w * 0.86},${base - h * 0.02}) rotate(${(1 - kBring) * 50}) scale(${kBring})`}><Book s={h * 0.09} t={t} /></g>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.year && (
        <div style={{ position: "absolute", left: Math.max(box.x0, xCol - colW / 2 - 40), width: colW + 80, top: base - hCol - h * 0.11, textAlign: "center", opacity: 1 - 0.4 * kMoney }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.year, 80, colW + 70)), color: "#ffd84a", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.year}</div>
          {P.yearLabel && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: lab(P.yearLabel, colW + 70), color: "#fff", WebkitTextStroke: "7px #1d2433", paintOrder: "stroke fill" }}>{P.yearLabel.toUpperCase()}</div>}
        </div>
      )}
      {kMoney > 0 && P.day && (
        <div style={{ position: "absolute", left: w * 0.44, right: w - box.x1, top: h * 0.2, textAlign: "center", opacity: clamp(kMoney * 2), transform: `scale(${1.6 - 0.6 * kMoney})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.day, 120, box.x1 - w * 0.44 - 10)), color: "#ffd84a", WebkitTextStroke: "11px #1d2433", paintOrder: "stroke fill", lineHeight: 1 }}>{P.day}</div>
          {P.dayLabel && <div style={{ display: "inline-block", marginTop: 10, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.dayLabel, w * 0.4, 64), color: "#1d2433", background: "#fff", padding: "4px 24px", borderRadius: 14 }}>{P.dayLabel.toUpperCase()}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
