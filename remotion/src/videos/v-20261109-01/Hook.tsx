/**
 * Hook (a secret): "Your money, held for free? Not at your bank. Watch this."
 * A warm marble bank hall, the bank's columned front lit in the middle, Rohan on the left holding
 * out his savings. Frame 0 reads YOUR MONEY, HELD FOR FREE? over the bank. On "bank" the bank
 * hops; on "free" a red NOT FREE stamp slams over the question and Rohan shrugs; on "watch" his
 * notes fly into the bank's door; on "money" they shoot out the far side; on "goes" a loan paper
 * flips in on the right with a red arrow and his savings figure.
 *
 * params: { line, cross, cash }, events: bank, free, watch, money, goes
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Bank = props.bankhall!, Loan = props.loanpaper!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; cross?: string; cash?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tBank = at(p, "bank", 0.4), tFree = at(p, "free", 1.4), tWatch = at(p, "watch", 1.8), tMoney = tWatch + 0.5, tGoes = at(p, "goes", 2.9);
  const kBank = sp(tBank, 8), kFree = sp(tFree, 9), kGoes = sp(tGoes, 11);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 130, box.x1 - box.x0 - 60, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.7, { upper: true }));
  const g = h * 0.62, bx = w * 0.56, lx = w * 0.84;
  const hop = kBank * Math.abs(Math.sin((t - tBank) * 6)) * (t < tBank + 0.6 ? 1 : 0);
  // notes: into the bank's door from Rohan's hands on "watch", out the far side on "money"
  const notes = t < tWatch ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = clamp(((t - tWatch) * 1.1 - i * 0.1));
    const out = clamp((t - tMoney) * 1.2 - i * 0.08);
    const x0 = w * 0.28, x1 = bx, x2 = lx;
    const x = out > 0 ? x1 + (x2 - x1) * out : x0 + (x1 - x0) * f;
    const y = out > 0 ? g - h * 0.1 - Math.sin(out * Math.PI) * h * 0.12 : g - h * 0.24 + (h * 0.14) * f - Math.sin(f * Math.PI) * h * 0.06;
    const vis = f > 0 && f < 1 ? 1 : out > 0 && out < 1 ? 1 : 0;
    return <rect key={i} x={x - h * 0.024} y={y - h * 0.013} width={h * 0.048} height={h * 0.026} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${(f + out) * 200} ${x} ${y})`} opacity={vis} />;
  });
  const cash = P.cash ?? "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t + 0.04 * kFree})`, transformOrigin: "50% 55%" }}>
        <World kind="bank" tint="#7a4a1e" w={w} h={h} t={t} seed="hook-bank-hall" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={bx} cy={g - h * 0.14} rx={w * 0.34} ry={h * 0.16} fill="#ffd27a" opacity={0.14 + 0.06 * Math.sin(t * 4)} />
          <g transform={`translate(${bx},${g}) scale(${1 + 0.08 * hop})`}><Bank s={h * 0.28} t={t} state={t >= tWatch ? "lit" : undefined} /></g>
          {notes}
          {kGoes > 0 && (
            <g transform={`translate(${lx},${g}) rotate(${(1 - kGoes) * 80}) scale(${0.4 + 0.6 * kGoes})`} opacity={clamp(kGoes * 2)}>
              <Loan s={h * 0.14} t={t} />
            </g>
          )}
          {kGoes > 0 && (
            <path d={`M${bx + w * 0.12},${g - h * 0.2} Q${(bx + lx) / 2 + w * 0.04},${g - h * 0.3} ${lx - w * 0.04},${g - h * 0.17}`} stroke="#e5484d" strokeWidth={14} fill="none"
              strokeLinecap="round" strokeDasharray={`${700 * kGoes} 900`} />
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.22, scale: 1.15, acting: [{ sec: 0, pose: "present", expression: "happy" }, { at: "free", pose: "shrug", expression: "confused" }, { at: "goes", pose: "point", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.09, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, opacity: 1 - 0.4 * kFree, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {kFree > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.25, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kFree})`, opacity: clamp(kFree * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
      {kGoes > 0 && cash && (
        <div style={{ position: "absolute", left: w * 0.62, width: box.x1 - w * 0.62, top: h * 0.36, textAlign: "center", opacity: clamp(kGoes * 2), transform: `scale(${1.5 - 0.5 * kGoes})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(cash, 90, box.x1 - w * 0.62 - 10)), color: "#ffd84a", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill" }}>{cash}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
