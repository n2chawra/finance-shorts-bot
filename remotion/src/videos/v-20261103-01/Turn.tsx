/**
 * The turn: "But here's the twist. It isn't a flat fee. Apple keeps {fact2} of the ad money from
 * those searches."
 * Sharma in the office. A giant pie of ad money fills the middle, coins circling its rim. On "twist"
 * the camera punches in; on "flat" a NOT A FLAT FEE stamp slams across the top; on "Apple" a slice
 * of the pie (the share) lights gold and slides out toward a crate of apples; on "keeps" the share
 * figure slams in huge; on "money" coins pour from the slice into the crate.
 *
 * params: { share, stamp, adLabel, appleLabel }, events: twist, flat, apple, keeps, money, searches
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { SETS } from "../../studio/sets";
import props from "./props";

const Crate = props.applecrate!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { share?: string; stamp?: string; adLabel?: string; appleLabel?: string; sourceIndex?: number };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tTwist = at(p, "twist", 0.6), tFlat = at(p, "flat", 1.6), tApple = at(p, "apple", 2.6), tKeeps = at(p, "keeps", 3.0), tMoney = at(p, "money", 4.2);
  const kStamp = sp(tFlat, 8), kSlice = sp(tApple, 10), kShare = sp(tKeeps, 8);
  const Office = SETS.office!;
  const box = safeBox(w, h);
  const min = minText(w, h);
  const zoom = 1 + 0.08 * clamp((t - tTwist) / 0.5);
  const cx = w * 0.45, cy = h * 0.43, r = w * 0.3;
  const pct = clamp((parseFloat(P.share ?? "") || 30) / 100, 0.05, 0.95);
  const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * pct;
  const mid = (a0 + a1) / 2;
  const out = r * 0.18 * kSlice;
  const ox = Math.cos(mid) * out, oy = Math.sin(mid) * out;
  const arc = (from: number, to: number, rr: number, dx = 0, dy = 0) =>
    `M${cx + dx},${cy + dy} L${cx + dx + Math.cos(from) * rr},${cy + dy + Math.sin(from) * rr} A${rr},${rr} 0 ${to - from > Math.PI ? 1 : 0} 1 ${cx + dx + Math.cos(to) * rr},${cy + dy + Math.sin(to) * rr} Z`;
  const stamp = (P.stamp ?? "").toUpperCase();
  const stampSize = Math.max(min, fitLine(stamp, 96, box.x1 - box.x0 - 120, { upper: true }));
  const share = P.share ?? "";
  const shareSize = Math.max(min, fitLine(share, 200, w * 0.4));
  const lab = (s: string, max: number) => Math.max(min, fitLine(s.toUpperCase(), 52, max, { upper: true }));
  const srcParts = (p.tl.sources ?? "").replace(/^Data:\s*/, "").split(" · ");
  const srcOne = srcParts[P.sourceIndex ?? 0] ?? "";
  const src = srcOne ? `Data: ${srcOne}${srcParts.length > 2 && (P.sourceIndex ?? 0) === srcParts.length - 2 ? " · " + srcParts[srcParts.length - 1] : ""}` : "";
  const srcSize = Math.max(min, Math.min(min * 1.05, fitWords(src, min * 1.05, box.x1 - box.x0 - 100)));
  const crX = w * 0.8, crY = h * 0.72;
  const coins = t < tMoney ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tMoney) * 1.1 + i / 6) % 1;
    const sx = cx + ox + Math.cos(mid) * r * 0.6, sy = cy + oy + Math.sin(mid) * r * 0.6;
    return <circle key={i} cx={sx + (crX - sx) * f} cy={sy + (crY - h * 0.08 - sy) * f - Math.sin(f * Math.PI) * h * 0.06} r={h * 0.014} fill="#f2b631" stroke={INK} strokeWidth={4} opacity={clamp((1 - f) * 5)} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}>
        <Office.back w={w} h={h} t={t} seed={`${p.beat.id}t`} />
        <AbsoluteFill style={{ background: "rgba(10,20,50,0.35)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <circle cx={cx} cy={cy} r={r + 22} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} strokeDasharray="10 18" strokeDashoffset={-t * 40} />
          <path d={arc(a1, a0 + Math.PI * 2, r)} fill="#3d7bf5" stroke={INK} strokeWidth={8} />
          <path d={arc(a0, a1, r, ox, oy)} fill={kSlice > 0 ? "#f2b631" : "#5b8ff7"} stroke={INK} strokeWidth={8} />
          {P.adLabel && <text x={cx - r * 0.25} y={cy + r * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.adLabel, r * 1.1)} fill="#fff" stroke={INK} strokeWidth={6} paintOrder="stroke">{P.adLabel.toUpperCase()}</text>}
          <g transform={`translate(${crX},${crY}) scale(${0.9 + 0.15 * kSlice})`}><Crate s={h * 0.14} t={t} state={t > tMoney ? "gold" : undefined} /></g>
          {P.appleLabel && kSlice > 0 && <text x={crX} y={crY + min * 1.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.appleLabel, w * 0.34)} fill="#ffd84a" stroke={INK} strokeWidth={6} paintOrder="stroke" opacity={kSlice}>{P.appleLabel.toUpperCase()}</text>}
          {coins}
          {kShare > 0 && share && (
            <text x={cx + ox + Math.cos(mid) * r * 0.55} y={cy + oy + Math.sin(mid) * r * 0.55 + shareSize * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={shareSize * (0.6 + 0.4 * kShare)} fill="#fff" stroke={INK} strokeWidth={10} paintOrder="stroke">{share}</text>
          )}
          <Actor p={p} spec={{ who: "sharma", x: 0.22, scale: 1.0, acting: [{ sec: 0, pose: "hips", expression: "smirk" }, { at: "apple", pose: "present", expression: "proud" }, { at: "money", pose: "thumbsUp", expression: "laugh" }] }}
            ground={h * 0.9} index={0} />
        </svg>
      </AbsoluteFill>
      {src && kShare > 0 && (
        <div style={{ position: "absolute", left: box.x0 + 30, right: w - box.x1 + 30, top: h * 0.17, textAlign: "center", opacity: clamp(kShare * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: srcSize, lineHeight: 1.2, color: "#fff", background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "6px 20px" }}>{src}</span>
        </div>
      )}
      {stamp && kStamp > 0 && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.08, textAlign: "center", transform: `scale(${2 - kStamp}) rotate(-5deg)`, opacity: clamp(kStamp * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: stampSize, color: "#d23a3a", border: "12px solid #d23a3a", borderRadius: 24, padding: "0 30px", background: "rgba(255,245,245,0.94)", lineHeight: 1.15 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
