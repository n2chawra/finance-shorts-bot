/**
 * The turn: "Then he takes out just {pay_fee_pct} a year. That's {pay_per_period}, every year."
 * A dark city, header HE TAKES A SLICE from frame 0, a grown money tree (BONUS AT WORK) on the left and a
 * mailbox on the right. On "Then" the tree pulses; on "takes" a rate chip pops and a pay cheque flies
 * into the mailbox; on "That's" the yearly figure slams in huge; on "every" cheques fan out, EVERY YEAR.
 *
 * params: { header, rate, pay, treeLabel, mailLabel }, events: then, takes, thats, every
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK, PALETTE } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tree = props.cashtree!, Check = props.paycheck!, Mail = props.mailbox!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; rate?: string; pay?: string; treeLabel?: string; mailLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tThen = at(p, "then", 0.2), tAt = at(p, "takes", 0.8), tHim = at(p, "thats", 2.6), tEvery = at(p, "every", 4.2);
  const kThen = sp(tThen, 9), kAt = sp(tAt, 9), kPays = sp(tAt + 0.2, 12), kHim = sp(tHim, 8), kEvery = sp(tEvery, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 120, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62, tx = w * 0.34, mx = w * 0.76;
  const cx = tx + (mx - tx) * kPays, cy = g - h * 0.2 - Math.sin(kPays * Math.PI) * h * 0.1;
  const pay = P.pay ?? "";
  const text = (x: number, y: number, s: string | undefined, max: number, color = "#fff", k = 1) => s && (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(s, max)} fill={color} stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={clamp(k * 2)}>{s.toUpperCase()}</text>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * kHim})`, transformOrigin: "50% 50%" }}>
        <World kind="city" tint="#1f3b5e" w={w} h={h} t={t} seed="turn-city-paycheck" props={props} />
        <AbsoluteFill style={{ background: "rgba(10,10,40,0.35)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${tx},${g}) scale(${1 + 0.06 * kThen * Math.abs(Math.sin((t - tThen) * 5))})`}><Tree s={h * 0.25} t={t} k={1} /></g>
          {text(tx, g + min * 1.4, P.treeLabel, w * 0.4)}
          
          {kAt > 0 && P.rate && <g transform={`translate(${mx},${g - h * 0.33}) scale(${0.5 + 0.5 * kAt})`} opacity={clamp(kAt * 2)}>
            <rect x={-w * 0.17} y={-min * 1.0} width={w * 0.34} height={min * 1.5} rx={min * 0.75} fill={PALETTE.green} stroke={INK} strokeWidth={6} />
            <text y={min * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.rate, w * 0.3, 48)} fill="#fff">{P.rate.toUpperCase()}</text>
          </g>}
          {kEvery > 0 && [0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${mx + (i - 1) * w * 0.06 * kEvery},${g - h * 0.16 - i * h * 0.02}) rotate(${(i - 1) * 12 * kEvery})`} opacity={0.85 * clamp(kEvery * 2)}><Check s={h * 0.09} t={t} /></g>
          ))}
          <g transform={`translate(${mx},${g})`} opacity={0.55 + 0.45 * clamp(kPays * 2)}><Mail s={h * 0.17} t={t} state={kPays > 0.9 ? "open" : undefined} /></g>
          {kPays > 0 && kPays < 0.98 && <g transform={`translate(${cx},${cy}) scale(${1 - 0.4 * kPays})`}><Check s={h * 0.11} t={t} /></g>}
          {kEvery > 0.3 && text(mx, g + min * 1.4, P.mailLabel, w * 0.36, "#ffd84a", 1)}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#fff", background: "#c0392b", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {kHim > 0 && pay && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.15, textAlign: "center", transform: `scale(${1.6 - 0.6 * kHim})`, opacity: clamp(kHim * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(pay, 160, w * 0.62)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{pay}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
