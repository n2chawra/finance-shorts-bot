/**
 * The payoff: "Each regular trains on {regular_per_part} of fees a month, paid by people who stay home."
 * Opens close on Priya, the regular, cheering beside a running treadmill on the right; three couches
 * with membership cards wait on the left. On "regular" the treadmill hops; on "month" the big figure
 * slams in with EACH REGULAR; on "paid" notes fly from every couch's card to the treadmill and a
 * small ROHAN PAYS chip shows the fee; on "home" the camera pulls wide and STAYED HOME stamps the couches.
 *
 * params: { big, bigLabel, small, smallLabel, homeLabel }, events: each, regular, month, paid, home
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tread = props.treadmill!, Couch = props.couch!, Card = props.membercard!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { big?: string; bigLabel?: string; small?: string; smallLabel?: string; homeLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tReg = at(p, "regular", 0.4), tFees = at(p, "month", 1.6), tPaid = at(p, "paid", 2.6), tHome = at(p, "home", 3.6);
  const kReg = sp(tReg, 8), kFees = sp(tFees, 8), kPaid = sp(tPaid, 12), kHome = sp(tHome, 14);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.6, tx = w * 0.66;
  const zoom = 1.18 - 0.18 * kHome;
  const couches = [0.14, 0.3, 0.46].map((x, i) => ({ x: w * (x - 0.02 * i), y: g - h * (0.16 - i * 0.07) }));
  const notes = t < tPaid ? [] : couches.flatMap((c, j) => Array.from({ length: 3 }, (_, i) => {
    const f = ((t - tPaid) * 0.85 + i / 3 + j * 0.11) % 1;
    const x = c.x + (tx - c.x) * f, y = c.y - h * 0.08 - Math.sin(f * Math.PI) * h * 0.1;
    return <rect key={`${j}-${i}`} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kPaid * 2)} />;
  }));
  const big = P.big ?? "";
  const home = (P.homeLabel ?? "").toUpperCase();
  const small = P.small && P.smallLabel ? `${P.smallLabel} ${P.small}` : "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "68% 60%" }}>
        <World kind="flat" tint="#3b2a5e" w={w} h={h} t={t} seed="payoff-homes-gym" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {couches.map((c, i) => (
            <g key={i}>
              <g transform={`translate(${c.x},${c.y}) scale(${1 - i * 0.1})`}><Couch s={h * 0.11} t={t} /></g>
              <g transform={`translate(${c.x},${c.y - h * 0.08}) scale(${(1 - i * 0.1) * (1 + 0.1 * kPaid)})`}><Card s={h * 0.06} t={t + i} /></g>
            </g>
          ))}
          {notes}
          <g transform={`translate(${tx},${g}) scale(${1 + 0.08 * kReg * Math.abs(Math.sin((t - tReg) * 6)) * (t < tReg + 0.7 ? 1 : 0)})`}><Tread s={h * 0.2} t={t} /></g>
          <Actor p={p} spec={{ who: "priya", x: 0.82, scale: 0.8, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "home", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.8} index={0} />
          {kHome > 0 && home && (
            <text x={w * 0.3} y={g - h * 0.27} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(home, w * 0.42, 64)} fill="#fff" stroke="#d63031" strokeWidth={10}
              paintOrder="stroke" opacity={clamp(kHome * 2)} transform={`rotate(-6 ${w * 0.3} ${g - h * 0.27}) scale(1)`}>{home}</text>
          )}
        </svg>
      </AbsoluteFill>
      {kPaid > 0 && small && (
        <div style={{ position: "absolute", left: box.x0 + 10, width: (box.x1 - box.x0) * 0.55, top: h * 0.56, textAlign: "center", opacity: clamp(kPaid * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(small, (box.x1 - box.x0) * 0.5, 46), color: "#1d2433", background: "#ffd84a",
            padding: "6px 20px", borderRadius: 14, border: `5px solid ${INK}` }}>{small.toUpperCase()}</span>
        </div>
      )}
      {kFees > 0 && big && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${1.7 - 0.7 * kFees})`, opacity: clamp(kFees * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(big, 190, w * 0.56)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{big}</div>
          {P.bigLabel && <div style={{ display: "inline-block", marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: lab(P.bigLabel, w * 0.5, 58), color: "#1d2433", background: "#fff", padding: "6px 26px", borderRadius: 14 }}>{P.bigLabel.toUpperCase()}</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
