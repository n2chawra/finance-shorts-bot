/**
 * Hook (a secret): "You think a {fact1} billionaire tax is easy money? It isn't."
 * A city at dusk, the state capitol big in the middle, a pile of share certificates on the right
 * with a gold tag carrying the tax rate, Rohan on the left pointing. Frame 0 reads BILLIONAIRE TAX
 * over EASY MONEY?. On "tax" the capitol hops and the rate tag pops; on "easy" notes stream from the
 * pile to the capitol; on "isn't" a red NOT SO EASY stamp slams, the notes fall, and a padlock
 * snaps onto the pile.
 *
 * params: { line, ask, cross, fig? }, events: think, tax, easy, isnt
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Capitol = props.capitol!, Pile = props.sharepile!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; ask?: string; cross?: string; fig?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTax = at(p, "tax", 0.8), tEasy = at(p, "easy", 1.4), tNo = at(p, "isnt", 2.4);
  const kTax = sp(tTax, 8), kEasy = sp(tEasy, 10), kNo = sp(tNo, 9);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitLine(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const ask = (P.ask ?? "").toUpperCase();
  const aSize = Math.max(min, fitLine(ask, 100, box.x1 - box.x0 - 80, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.8, { upper: true }));
  const g = h * 0.62, cx = w * 0.5, px = w * 0.8;
  const hop = kTax * Math.abs(Math.sin((t - tTax) * 6)) * (t < tTax + 0.6 ? 1 : 0);
  const fall = clamp((t - tNo) * 1.5);
  const notes = t < tEasy ? [] : Array.from({ length: 10 }, (_, i) => {
    const f = ((t - tEasy) * (0.8 + random(`s${i}`) * 0.3) + i / 10) % 1;
    const x = px + (cx - px) * f, y0 = g - h * 0.2 - Math.sin(f * Math.PI) * h * 0.16;
    const y = t < tNo ? y0 : y0 + fall * h * 0.3;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 260 + i * 25} ${x} ${y})`} opacity={t < tNo ? clamp((1 - f) * 4) : 1 - fall} />;
  });
  const fig = P.fig ?? "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.015 * t + 0.05 * kNo})`, transformOrigin: "50% 55%" }}>
        <World kind="city" tint="#5e3a1e" w={w} h={h} t={t} seed="hook-ca-capitol" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={cx} cy={g - h * 0.12} rx={w * 0.34} ry={h * 0.14} fill="#ffd27a" opacity={0.14 + 0.1 * kEasy * (1 - kNo)} />
          <g transform={`translate(${cx},${g}) scale(${1 + 0.06 * hop})`}><Capitol s={h * 0.2} t={t} /></g>
          <g transform={`translate(${px},${g + h * 0.04})`}><Pile s={h * 0.11} t={t} state={kNo > 0.5 ? "locked" : undefined} /></g>
          {notes}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.05, acting: [{ sec: 0, pose: "point", expression: "happy" }, { at: "easy", pose: "celebrate", expression: "laugh" }, { at: "isnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.8} index={0} />
        </svg>
      </AbsoluteFill>
      {fig && kTax > 0 && (
        <div style={{ position: "absolute", left: px - w * 0.16, width: w * 0.32, top: g - h * 0.22, textAlign: "center", transform: `scale(${kTax})` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(fig, 80, w * 0.28)), color: "#1d2433", background: "#ffd84a",
            padding: "6px 18px", borderRadius: 14, border: `5px solid ${INK}` }}>{fig}</span>
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-2deg) scale(${1 + 0.03 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {ask && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.2, textAlign: "center", opacity: 1 - 0.5 * kNo }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: aSize, color: "#fff", WebkitTextStroke: "9px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.08 * kEasy * (1 - kNo)})` }}>{ask}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.28, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
