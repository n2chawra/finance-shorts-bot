/**
 * The payoff: "And your whole year's pay? He makes it before breakfast."
 * A flat at dawn: an alarm clock ringing and a breakfast plate on the table, Rohan small on the left.
 * On "pay" the salary slip with YOUR YEAR and the yearly figure pops in over the table; on "makes"
 * coins pour from the clock into the slip while HIS MINUTE and the per-minute figure ticks in; on
 * "breakfast" a gold BEFORE BREAKFAST stamp slams over the plate and the camera pulls wide.
 *
 * params: { pay, payLabel, minute, minuteLabel, stamp }, events: pay, makes, breakfast
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Clock = props.alarmclock!, Plate = props.breakfast!, Slip = props.payslip!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { pay?: string; payLabel?: string; minute?: string; minuteLabel?: string; stamp?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tPay = at(p, "pay", 0.6), tMake = at(p, "makes", 1.4), tBf = at(p, "breakfast", 2.2);
  const kPay = sp(tPay, 9), kMake = sp(tMake, 10), kBf = sp(tBf, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const colW = (box.x1 - box.x0) * 0.47;
  const g = h * 0.64, cx = w * 0.42, sx = w * 0.62, bx = w * 0.82;
  const zoom = 1.08 - 0.03 * kBf;
  const coins = t < tMake ? [] : Array.from({ length: 8 }, (_, i) => {
    const f = ((t - tMake) * 1.4 + i / 8) % 1;
    const x = cx + (sx - cx) * f, y = g - h * 0.16 - Math.sin(f * Math.PI) * h * 0.1;
    return <circle key={i} cx={x} cy={y} r={h * 0.012} fill="#f2b631" stroke={INK} strokeWidth={3} />;
  });
  const chip = (top: string, bottom: string, x: number, k: number, bg: string) => (
    <div style={{ position: "absolute", left: x - colW / 2, width: colW, top: h * 0.33, textAlign: "center", opacity: clamp(k * 2), transform: `scale(${1.4 - 0.4 * k})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(top, 84, colW)), color: "#ffd84a", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{top}</div>
      <span style={{ display: "inline-block", marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(bottom.toUpperCase(), 50, colW, { upper: true })), color: INK, background: bg, padding: "4px 16px", borderRadius: 12, border: `4px solid ${INK}` }}>{bottom.toUpperCase()}</span>
    </div>
  );
  const stamp = (P.stamp ?? "").toUpperCase();
  const stSize = Math.max(min, fitLine(stamp, 84, (box.x1 - box.x0) * 0.72, { upper: true }));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "55% 60%" }}>
        <World kind="kitchen" tint="#f0a050" w={w} h={h} t={t} seed="payoff-ronaldo-dawn" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <circle cx={w * 0.85} cy={h * 0.3} r={h * 0.06} fill="#ffcf6b" opacity={0.5 + 0.1 * Math.sin(t * 2)} />
          <g transform={`translate(${cx},${g})`}><Clock s={h * 0.16} t={t} /></g>
          {kPay > 0 && <g transform={`translate(${sx},${g}) scale(${kPay})`}><Slip s={h * 0.16} t={t} /></g>}
          {coins}
          <g transform={`translate(${bx},${g}) scale(${1 + 0.12 * kBf})`}><Plate s={h * 0.16} t={t} /></g>
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 0.9, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "breakfast", pose: "facepalm", expression: "shock" }] }}
            ground={h * 0.84} index={0} />
        </svg>
      </AbsoluteFill>
      {P.pay && chip(P.pay, P.payLabel ?? "", w * 0.3, kPay, "#fff")}
      {P.minute && chip(P.minute, P.minuteLabel ?? "", w * 0.72, kMake, "#8fd19e")}
      {kBf > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.47, textAlign: "center", transform: `rotate(-4deg) scale(${1.5 - 0.5 * kBf})`, opacity: clamp(kBf * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stSize, color: INK, background: "#ffd84a", padding: `${stSize * 0.12}px ${stSize * 0.4}px`, border: `8px solid ${INK}`, borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
