/**
 * The turn: "And this is the twist. A billion never has to be spent. At an assumed {yld_fee_pct}
 * a year, it pays {yld_per_year_total} every year, and the pile stays exactly the same size."
 * A night field: the warehouse room of notes sits on the left, its figure on a sign above it. On
 * "twist" THE TWIST drops in; on "pays" a fountain rises beside the room and starts spouting coins
 * that arc across to a growing row of paychecks on the right; on "year" the yearly figure lands over
 * the paychecks; on "same" a SAME SIZE stamp hits the room's sign while the coins keep flowing.
 * Sharma stands between them.
 *
 * params: { pile, yearly, stamp }
 * events: twist, pays, year, same
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Room = props.warehouse!, Fountain = props.fountain!, Check = props.paycheck!;

const Pill: React.FC<{ x: number; y: number; text: string; bg: string; k: number; size: number; maxW: number; min: number; color?: string }> = ({ x, y, text, bg, k, size, maxW, min, color = "#fff" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,0) scale(${k})`, opacity: clamp(k * 2), fontFamily: FONT, fontWeight: 900,
    fontSize: Math.max(min, fitLine(text, size, maxW)), color, background: bg, border: "6px solid #fff", borderRadius: 20, padding: "4px 24px",
    whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>{text}</div>
);

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { pile?: string; yearly?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.5), tPays = at(p, "pays", 3.0), tYear = at(p, "year", 4.5), tSame = at(p, "same", 6.5);
  const kTwist = sp(tTwist, 10), kF = sp(tPays), kYear = sp(tYear, 9), kStamp = sp(tSame, 9);
  const mt = minText(w, h), box = safeBox(w, h);
  const ground = h * 0.8;
  const roomX = w * 0.22, fX = w * 0.42, checksX = w * 0.62;
  const flowing = t > tPays + 0.4;
  const nChecks = flowing ? Math.min(5, 1 + Math.floor((t - tPays - 0.4) / 0.7)) : 0;
  const coins: React.ReactNode[] = [];
  if (flowing) {
    for (let i = 0; i < 9; i++) {
      const ph = ((t - tPays) * 0.9 + i / 9) % 1;
      const x = fX + (checksX + w * 0.12 - fX) * ph, y = ground - h * 0.32 - Math.sin(ph * Math.PI) * h * 0.22 + ph * h * 0.12;
      coins.push(<ellipse key={i} cx={x} cy={y} rx={h * 0.022} ry={h * 0.022 * Math.abs(Math.cos(t * 6 + i)) + 2} fill="#f2b631" stroke="#1d2433" strokeWidth={3} />);
    }
  }
  const push = 1 + 0.04 * clamp((t - tSame) / 0.8);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "40% 55%" }}>
        <World kind="night" tint={kStamp > 0.5 ? "gold" : undefined} w={w} h={h} t={t} seed="turn-fountain" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${roomX},${ground})`}><Room s={h * 0.36} t={t} k={1} /></g>
          {kF > 0 && <g transform={`translate(${fX},${ground}) scale(${kF})`}><Fountain s={h * 0.3} t={t} k={0.8} /></g>}
          {Array.from({ length: nChecks }).map((_, i) => (
            <g key={i} transform={`translate(${checksX + (i % 3) * w * 0.1},${ground - Math.floor(i / 3) * h * 0.16})`}><Check s={h * 0.14} t={t + i} /></g>
          ))}
          {coins}
          <Actor p={p} spec={{ who: "sharma", x: 0.88, scale: 0.85, acting: [{ sec: 0, pose: "think", expression: "smirk" }, { at: "pays", pose: "point", expression: "proud", turn: -0.5 },
            { at: "same", pose: "hips", expression: "smirk" }] }} ground={h * 0.97} index={0} />
        </svg>
        {P.pile && <Pill x={roomX} y={ground - h * 0.52} text={P.pile} bg="#24315e" k={1} size={58} maxW={w * 0.3} min={mt} />}
        {P.yearly && <Pill x={checksX + w * 0.1} y={ground - h * 0.5} text={P.yearly} bg="#1f8f55" k={kYear} size={64} maxW={w * 0.34} min={mt} />}
        {P.stamp && kStamp > 0 && (
          <div style={{ position: "absolute", left: roomX, top: ground - h * 0.38, transform: `translate(-50%,0) scale(${2.2 - 1.2 * kStamp}) rotate(-6deg)`, opacity: clamp(kStamp * 3) }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(mt, fitLine(P.stamp, 60, w * 0.28, { upper: true })), color: "#fff", background: "#c92a2a",
              padding: "6px 26px", whiteSpace: "nowrap", borderRadius: 22, border: "7px solid #fff", textTransform: "uppercase", boxShadow: "0 12px 0 rgba(0,0,0,0.45)" }}>{P.stamp}</span>
          </div>
        )}
      </AbsoluteFill>
      {kTwist > 0 && (
        <div style={{ position: "absolute", left: w * 0.5, top: Math.max(box.y0, h * 0.04), transform: `translate(-50%,0) scale(${kTwist})`, fontFamily: FONT, fontWeight: 900,
          fontSize: Math.max(mt, fitLine("THE TWIST", 64, w * 0.3, { upper: true })), color: "#ffd34d", whiteSpace: "nowrap", textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>THE TWIST</div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
