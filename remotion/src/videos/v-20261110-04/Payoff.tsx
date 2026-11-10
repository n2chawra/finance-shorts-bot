/**
 * The payoff: "Then voters said no. Still think it's easy money?"
 * The city at night, the ballot box big in the middle on a step, the tax bill on the right with its
 * figure on a red chip, the capitol small behind, Rohan small on the left. On "voters" three ballots
 * drop into the box; on "no" VOTERS SAID NO slams in huge, the bill is crossed and floats up and
 * away; on "Still" the capitol wobbles; on "easy" a STILL EASY MONEY? chip drops in and the camera
 * pulls wide.
 *
 * params: { vote, voteLabel, bill, billLabel, ask }, events: voters, no, still, easy
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Ballot = props.ballotbox!, Bill = props.taxbill!, Capitol = props.capitol!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { vote?: string; voteLabel?: string; bill?: string; billLabel?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tV = at(p, "voters", 0.3), tNo = at(p, "no", 0.9), tStill = at(p, "still", 1.6), tEasy = at(p, "easy", 2.4);
  const kV = sp(tV, 10), kNo = sp(tNo, 8), kStill = sp(tStill, 8), kEasy = sp(tEasy, 12);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const g = h * 0.64, cx = w * 0.46, bx = w * 0.8;
  const zoom = 1.1 - 0.1 * kEasy;
  const wob = kStill * Math.sin((t - tStill) * 10) * (t < tStill + 0.8 ? 6 : 0);
  const up = clamp((t - tNo) * 0.8) * 0.4;
  const papers = t < tV ? [] : [0, 1, 2].map((i) => {
    const f = clamp((t - tV - i * 0.18) * 2.2);
    return <rect key={i} x={cx - h * 0.025 + (i - 1) * h * 0.02} y={g - h * 0.34 + f * h * 0.16} width={h * 0.05} height={h * 0.06} fill="#fff" stroke={INK} strokeWidth={4}
      opacity={f < 1 ? 1 : 0} />;
  });
  const vote = (P.vote ?? "").toUpperCase(), label = (P.voteLabel ?? "").toUpperCase();
  const bill = P.bill ?? "", billLabel = (P.billLabel ?? "").toUpperCase();
  const ask = (P.ask ?? "").toUpperCase();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="city" tint="#1e2e5e" w={w} h={h} t={t} seed="payoff-ca-night" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${g - h * 0.12}) rotate(${wob} 0 0)`} opacity={0.75}><Capitol s={h * 0.1} t={t} /></g>
          <ellipse cx={cx} cy={g - h * 0.1} rx={w * 0.22} ry={h * 0.11} fill="#ffd27a" opacity={0.12 + 0.12 * kNo} />
          <rect x={cx - w * 0.15} y={g - h * 0.02} width={w * 0.3} height={h * 0.04} rx={10} fill="#9aa3b5" stroke={INK} strokeWidth={6} />
          {papers}
          <g transform={`translate(${cx},${g - h * 0.02}) scale(${1 + 0.1 * kNo})`}><Ballot s={h * 0.17} t={t} /></g>
          <g transform={`translate(${bx},${g - up * h * 0.25}) scale(${1 - 0.35 * up})`} opacity={1 - up * 0.5}>
            <Bill s={h * 0.14} t={t} />
            {kNo > 0 && <g opacity={clamp(kNo * 2)}>
              <line x1={-h * 0.06} y1={-h * 0.13} x2={h * 0.06} y2={-h * 0.01} stroke="#d63031" strokeWidth={14} strokeLinecap="round" />
              <line x1={h * 0.06} y1={-h * 0.13} x2={-h * 0.06} y2={-h * 0.01} stroke="#d63031" strokeWidth={14} strokeLinecap="round" />
            </g>}
          </g>
          <Actor p={p} spec={{ who: "rohan", x: 0.14, scale: 0.8, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "no", pose: "shrug", expression: "shock" }, { at: "easy", pose: "point", expression: "smirk" }] }}
            ground={h * 0.82} index={0} />
        </svg>
      </AbsoluteFill>
      {bill && (
        <div style={{ position: "absolute", left: bx - w * 0.17, width: w * 0.34, top: g + h * 0.015 - up * h * 0.25, textAlign: "center", opacity: 1 - up * 0.6 }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(`${billLabel} ${bill}`, 52, w * 0.32, { upper: true })),
            color: "#1d2433", background: "#ff9b8a", padding: "4px 14px", borderRadius: 12, border: `5px solid ${INK}`, textDecoration: kNo > 0.5 ? "line-through" : "none" }}>{`${billLabel} ${bill}`}</span>
        </div>
      )}
      {kNo > 0 && vote && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.09, textAlign: "center", opacity: clamp(kNo * 2), transform: `scale(${1.5 - 0.5 * kNo})` }}>
          {label && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(label, 60, w * 0.6, { upper: true })), color: "#1d2433", background: "#fff", padding: "4px 22px", borderRadius: 14 }}>{label}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(vote, 200, w * 0.6, { upper: true })), color: "#ff6b6b", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{vote}</div>
        </div>
      )}
      {kEasy > 0 && ask && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.32, textAlign: "center", opacity: clamp(kEasy * 2), transform: `translate(0,${(1 - kEasy) * -40}px)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(ask, 70, (box.x1 - box.x0) * 0.85, { upper: true })), color: "#fff", background: "#3d7bf5", padding: "8px 26px", borderRadius: 16, border: `6px solid ${INK}` }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
