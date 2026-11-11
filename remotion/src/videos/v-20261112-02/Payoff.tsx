/**
 * The payoff: "So Amazon spends {cmp_ratio} his salary on his security and travel. Paycheck or shares: which would you take?"
 * A balance scale in a dark office: on the left pan the small paycheck ({sal_total}), on the right
 * the SUV and the jet ({sec_total}). On "spends" the right pan crashes down and {cmp_ratio} slams
 * between them; on "which" the paycheck and the share certificate swing up side by side under a
 * yellow PAYCHECK OR SHARES? chip.
 *
 * params: { ratio, ratioLabel, pay, cost, ask }, events: spends, security, which
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Pay = props.paycheck!, Car = props.armoredcar!, Cert = props.sharecert!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { ratio?: string; ratioLabel?: string; pay?: string; cost?: string; ask?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 130, mass: 0.85 } }));
  const tS = at(p, "spends", 0.4), tW = at(p, "which", 3.5);
  const kS = sp(tS, 10), kW = sp(tW, 11);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const rSize = Math.max(min, fitLine(P.ratio ?? "", 200, maxW * 0.6));
  const lab = (s: string, b = 56, f = 0.42) => Math.max(min, fitLine(s.toUpperCase(), b, maxW * f, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const tilt = 14 * kS * (1 - kW * 0.5);
  const cx = w * 0.5, cy = h * 0.42, arm = w * 0.27;
  const lx = cx - Math.cos((tilt * Math.PI) / 180) * arm, ly = cy - Math.sin((tilt * Math.PI) / 180) * arm;
  const rx = cx + Math.cos((tilt * Math.PI) / 180) * arm, ry = cy + Math.sin((tilt * Math.PI) / 180) * arm;
  const pan = h * 0.2;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 50%" }}>
        <World kind="office" tint="#2a2018" w={w} h={h} t={t} seed="payoff-bezos-scale" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={cx - 12} y={cy} width={24} height={h * 0.33} fill="#b08a4a" stroke={INK} strokeWidth={5} />
          <rect x={cx - w * 0.12} y={cy + h * 0.33} width={w * 0.24} height={22} rx={8} fill="#b08a4a" stroke={INK} strokeWidth={5} />
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#d9b56a" strokeWidth={8} strokeLinecap="round" />
          {[[lx, ly], [rx, ry]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x! - w * 0.1} y1={y! + pan} x2={x!} y2={y!} stroke={INK} strokeWidth={4} />
              <line x1={x! + w * 0.1} y1={y! + pan} x2={x!} y2={y!} stroke={INK} strokeWidth={4} />
              <path d={`M${x! - w * 0.13},${y! + pan} Q${x!},${y! + pan + h * 0.05} ${x! + w * 0.13},${y! + pan}`} fill="#d9b56a" stroke={INK} strokeWidth={5} />
            </g>
          ))}
          <g transform={`translate(${lx},${ly + pan - 4})`}><Pay s={h * 0.08} t={t} /></g>
          <g transform={`translate(${rx},${ry + pan - 4})`}><Car s={h * 0.09} t={t} /></g>
          {kW > 0 && <g transform={`translate(${w * 0.3},${h * 0.33 - kW * h * 0.03}) scale(${kW})`}><Pay s={h * 0.1} t={t} /></g>}
          {kW > 0 && <g transform={`translate(${w * 0.7},${h * 0.33 - kW * h * 0.03}) scale(${kW})`}><Cert s={h * 0.1} t={t} /></g>}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: lx - w * 0.2, width: w * 0.4, top: ly + pan + h * 0.03, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.pay ?? ""), color: "#9ff0b4", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.pay}</span>
      </div>
      <div style={{ position: "absolute", left: rx - w * 0.2, width: w * 0.4, top: ry + pan + h * 0.03, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.cost ?? ""), color: "#ffd84a", WebkitTextStroke: "8px #1d2433", paintOrder: "stroke fill" }}>{P.cost}</span>
      </div>
      {kS > 0 && P.ratio && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.1, textAlign: "center", transform: `scale(${1.6 - 0.6 * kS})`, opacity: clamp(kS * 2) * (1 - clamp(kW * 3)) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: rSize, lineHeight: 1, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{P.ratio}</div>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(P.ratioLabel ?? "", 54, 0.9), color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(P.ratioLabel ?? "").toUpperCase()}</span>
        </div>
      )}
      {kW > 0 && ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.12, textAlign: "center", opacity: clamp(kW * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(ask, 64, 0.9), color: INK, background: "#ffd84a", padding: "6px 22px", borderRadius: 14, border: `6px solid ${INK}` }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
