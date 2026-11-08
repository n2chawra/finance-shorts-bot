/**
 * The payoff: "Your money was never kept for free. It was rented out."
 * Rohan's flat at night, his piggy bank big in the middle, Rohan small on the left. On "money" the
 * piggy glows with his savings figure; on "never" a red FREE label is struck through; on "free"
 * Priya's red car, parked on the right, hops; on "rented" a FOR RENT sign drops onto the piggy, the
 * camera pulls wide, notes fly from the car past the piggy, and two chips show what Priya pays and
 * what Rohan is paid, with a RENTED OUT stamp.
 *
 * params: { stamp, cash, earn, earnLabel, rent, rentLabel }, events: money, never, free, rented
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Piggy = props.piggy!, Sign = props.rentsign!, Car = props.newcar!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { stamp?: string; cash?: string; earn?: string; earnLabel?: string; rent?: string; rentLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tMoney = at(p, "money", 0.3), tNever = at(p, "never", 0.8), tFree = at(p, "free", 1.4), tRent = at(p, "rented", 2.2);
  const kMoney = sp(tMoney, 9), kNever = sp(tNever, 9), kFree = sp(tFree, 13), kRent = sp(tRent, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.68, px = w * 0.48, cx = w * 0.76;
  const zoom = 1.12 - 0.12 * kRent;
  const notes = t < tRent ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tRent) * 0.9 + i / 5) % 1;
    const x = cx + (px - cx) * f, y = g - h * 0.12 - Math.sin(f * Math.PI) * h * 0.1;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kRent * 2)} />;
  });
  const free = "FREE";
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 100, (box.x1 - box.x0) * 0.8, { upper: true }));
  const chip = (text: string, bg: string) => (
    <span style={{ display: "inline-block", margin: "8px 0", fontFamily: FONT, fontWeight: 900, fontSize: lab(text, (box.x1 - box.x0) * 0.8, 46), color: "#1d2433", background: bg,
      padding: "6px 20px", borderRadius: 14, border: `5px solid ${INK}` }}>{text.toUpperCase()}</span>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="flat" tint="#5a2f1e" w={w} h={h} t={t} seed="payoff-flat-piggy" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={px} cy={g - h * 0.1} rx={w * 0.22} ry={h * 0.1} fill="#ffd27a" opacity={0.15 * kMoney + 0.05} />
          <g transform={`translate(${px},${g}) scale(${1 + 0.06 * kMoney * Math.abs(Math.sin((t - tMoney) * 6)) * (t < tMoney + 0.6 ? 1 : 0)})`}><Piggy s={h * 0.25} t={t} /></g>
          {kRent > 0 && (
            <g transform={`translate(${px - w * 0.2},${g - h * 0.02 - (1 - kRent) * h * 0.3})`} opacity={clamp(kRent * 3)}><Sign s={h * 0.15} t={t} /></g>
          )}
          <g transform={`translate(${cx},${g}) scale(${1 + 0.12 * kFree * Math.abs(Math.sin((t - tFree) * 6)) * (t < tFree + 0.6 ? 1 : 0)})`}><Car s={h * 0.11} t={t} /></g>
          {notes}
          <Actor p={p} spec={{ who: "rohan", x: 0.17, scale: 0.85, acting: [{ sec: 0, pose: "shrug", expression: "confused" }, { at: "rented", pose: "facepalm", expression: "sad" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {kMoney > 0 && P.cash && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", opacity: clamp(kMoney * 2), transform: `scale(${1.5 - 0.5 * kMoney})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.cash, 150, w * 0.6)), color: "#ffd84a", WebkitTextStroke: "11px #1d2433", paintOrder: "stroke fill" }}>{P.cash}</span>
        </div>
      )}
      {(
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.2, textAlign: "center", opacity: 1 - 0.6 * kRent }}>
          <span style={{ position: "relative", display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(free, w * 0.4, 96), color: "#fff", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>
            {free}{kNever > 0 ? "" : "?"}
            <span style={{ position: "absolute", left: -10, right: -10, top: "48%", height: 16, background: "#e5484d", transform: `scaleX(${kNever}) rotate(-6deg)`, transformOrigin: "left" }} />
          </span>
        </div>
      )}
      {kRent > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.28, textAlign: "center", transform: `rotate(-7deg) scale(${1.6 - 0.6 * kRent})`, opacity: clamp(kRent * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", background: "#d63031", padding: `${sSize * 0.12}px ${sSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 16 }}>{stamp}</span>
        </div>
      )}
      {kRent > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.355, textAlign: "center", opacity: clamp((t - tRent - 0.3) * 3) }}>
          {P.rent && P.rentLabel && <div>{chip(`${P.rentLabel} ${P.rent}`, "#ff9b8a")}</div>}
          {P.earn && P.earnLabel && <div>{chip(`${P.earnLabel} ${P.earn}`, "#8fd19e")}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
