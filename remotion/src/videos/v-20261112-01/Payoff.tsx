/**
 * The payoff: "So Apple keeps {svc_pct} of every service dollar, and {prod_pct} of an iPhone dollar.
 * Which Apple bill do you pay?"
 * Two big dollar bills, one above the other, on a blue office wall: the PHONE DOLLAR and the SERVICE
 * DOLLAR. On "keeps" the service bill fills gold to its kept share with {svc_pct}; on "iPhone" the
 * phone bill fills to its share with {prod_pct}; on "bill" a stack of monthly bills drops in with
 * a question mark.
 *
 * params: { svcLabel, svcFig, svcV, prodLabel, prodFig, prodV, ask }, events: keeps, iphone, bill
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Bill = props.splitbill!, Phone = props.iphone!, Cloud = props.icloud!, Monthly = props.monthlybill!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { svcLabel?: string; svcFig?: string; svcV?: number; prodLabel?: string; prodFig?: string; prodV?: number; ask?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 130, mass: 0.85 } }));
  const tK = at(p, "keeps", 0.4), tI = at(p, "iphone", 2.2), tB = at(p, "bill", 4.0);
  const kK = sp(tK, 14), kI = sp(tI, 14), kB = sp(tB, 9);
  const svc = clamp((P.svcV ?? 0) / 100), prod = clamp((P.prodV ?? 0) / 100);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const fig = (s: string) => Math.max(min, fitLine(s, 150, maxW * 0.45));
  const lab = (s: string) => Math.max(min, fitLine(s.toUpperCase(), 58, maxW * 0.9, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const g1 = h * 0.42, g2 = h * 0.7;
  const bx = w * 0.42;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.012 * t})`, transformOrigin: "50% 50%" }}>
        <World kind="office" tint="#163a6e" w={w} h={h} t={t} seed="payoff-apple-bills" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.84},${g1 - h * 0.02})`}><Cloud s={h * 0.08} t={t} k={0.9} /></g>
          <g transform={`translate(${bx},${g1})`}><Bill s={h * 0.22} t={t} k={svc * kK} /></g>
          <g transform={`translate(${w * 0.86},${g2 - h * 0.01}) scale(${0.6 + 0.4 * kI})`}><Phone s={h * 0.13} t={t} /></g>
          <g transform={`translate(${bx},${g2})`}><Bill s={h * 0.22} t={t + 1} k={prod * kI} /></g>
          {kB > 0 && <g transform={`translate(${w * 0.5},${h * 0.2 + (1 - kB) * -h * 0.3}) rotate(${(1 - kB) * 20})`}><Monthly s={h * 0.1} t={t} k={1} /></g>}
        </svg>
      </AbsoluteFill>
      {[{ y: g1, l: P.svcLabel, f: P.svcFig, k: kK }, { y: g2, l: P.prodLabel, f: P.prodFig, k: kI }].map((r, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: r.y - h * 0.2, textAlign: "left" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(r.l ?? ""), color: "#fff", background: INK, padding: "4px 16px", borderRadius: 10 }}>{(r.l ?? "").toUpperCase()}</span>
          </div>
          {r.k > 0 && (
            <div style={{ position: "absolute", left: bx - w * 0.2, width: w * 0.4, top: r.y - h * 0.115, textAlign: "center", transform: `scale(${1.5 - 0.5 * r.k})`, opacity: clamp(r.k * 2) }}>
              <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: fig(r.f ?? ""), color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill" }}>{r.f}</span>
            </div>
          )}
        </React.Fragment>
      ))}
      {kB > 0 && ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center", opacity: clamp(kB * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(ask), color: INK, background: "#ffd84a", padding: "6px 22px", borderRadius: 14, border: `6px solid ${INK}` }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
