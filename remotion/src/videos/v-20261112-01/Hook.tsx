/**
 * Hook (shock number): "Apple keeps {svc_pct} of every dollar you pay for its services, like iCloud."
 * An office at night in Apple blue: a giant iPhone labelled APPLE in the middle, a green dollar bill
 * beside it. Frame 0 reads APPLE KEEPS / {svc_pct} / OF EVERY SERVICES DOLLAR. On "Apple" the phone
 * hops; on "keeps" the bill turns gold up to the kept share and notes fly from it into the phone; on
 * "dollar" the figure slams bigger; on "iCloud" a cloud and the App Store tile pop out of the screen.
 *
 * params: { line, figure, sub, label, keep (raw percent) }, events: apple, keeps, dollar, icloud
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Phone = props.iphone!, Bill = props.splitbill!, Cloud = props.icloud!, Store = props.appstore!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; figure?: string; sub?: string; label?: string; keep?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tA = at(p, "apple", 0.1), tK = at(p, "keeps", 0.6), tD = at(p, "dollar", 1.6), tC = at(p, "icloud", 2.8);
  const kA = sp(tA, 8), kK = sp(tK, 12), kD = sp(tD, 9), kC = sp(tC, 10);
  const keep = clamp((P.keep ?? 0) / 100);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const maxW = box.x1 - box.x0 - 60;
  const line = (P.line ?? "").toUpperCase();
  const lSize = Math.max(min, fitLine(line, 110, maxW, { upper: true }));
  const fig = P.figure ?? "";
  const fSize = Math.max(min, fitLine(fig, 260, maxW * 0.8));
  const sub = (P.sub ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(sub, 60, maxW - 60, { upper: true }));
  const label = (P.label ?? "").toUpperCase();
  const labSize = Math.max(min, fitLine(label, 64, w * 0.4, { upper: true }));
  const g = h * 0.8;
  const px = w * 0.62, bx = w * 0.3;
  const hop = t > tA && t < tA + 0.5 ? Math.sin((t - tA) * Math.PI * 2) * h * 0.02 : 0;
  const notes = t < tK ? [] : Array.from({ length: 7 }, (_, i) => {
    const f = ((t - tK) * 1.2 + i / 7) % 1;
    const x = bx + (px - bx) * f, y = g - h * 0.14 - Math.sin(f * Math.PI) * h * 0.14;
    return <rect key={i} x={x - h * 0.018} y={y - h * 0.01} width={h * 0.036} height={h * 0.02} rx={3} fill="#f2c94c" stroke={INK} strokeWidth={3} transform={`rotate(${f * 320} ${x} ${y})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.03 + 0.012 * t + 0.04 * kD})`, transformOrigin: "55% 65%" }}>
        <World kind="office" tint="#14305e" w={w} h={h} t={t} seed="hook-apple-office" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={px} cy={g - h * 0.2} rx={w * 0.3} ry={h * 0.18} fill="#9fd0ff" opacity={0.12 + 0.12 * kK} />
          <g transform={`translate(${px},${g - hop}) scale(${1 + 0.05 * kA})`}><Phone s={h * 0.4} t={t} /></g>
          <g transform={`translate(${bx},${g})`}><Bill s={h * 0.2} t={t} k={1 - (1 - keep) * kK} /></g>
          {notes}
          {kC > 0 && <g transform={`translate(${px - w * 0.2},${g - h * 0.34 - kC * h * 0.06}) scale(${kC})`}><Cloud s={h * 0.13} t={t} k={0.8} /></g>}
          {kC > 0 && <g transform={`translate(${px + w * 0.22},${g - h * 0.3 - kC * h * 0.08}) scale(${kC})`}><Store s={h * 0.1} t={t} /></g>}
        </svg>
        {label && (
          <div style={{ position: "absolute", left: px - w * 0.2, width: w * 0.4, top: g - h * 0.445, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: labSize, color: "#fff", background: INK, padding: "4px 18px", borderRadius: 12 }}>{label}</span>
          </div>
        )}
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lSize, color: "#fff", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill", transform: "rotate(-2deg)" }}>{line}</span>
        </div>
      )}
      {fig && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.13, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: fSize, lineHeight: 1.0, color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill",
            transform: `scale(${1 + 0.15 * kD * Math.max(0, 1 - (t - tD) * 1.5) + 0.02 * Math.sin(t * 4)})`, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{fig}</span>
        </div>
      )}
      {sub && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.29, textAlign: "center", opacity: 0.6 + 0.4 * clamp(kK) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, lineHeight: 1.15, color: "#ffffff", background: "#1d2433", padding: "6px 20px", borderRadius: 14, letterSpacing: 1 }}>{sub}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
