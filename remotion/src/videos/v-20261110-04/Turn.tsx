/**
 * The turn: "But it only taxed residents, and Google's founders had already moved away."
 * A desert highway leaving the state, header RESIDENTS ONLY from frame 0. The capitol stands small
 * on the left behind a road sign with the state's name; a dashed state line crosses the road on the
 * right. On "residents" the sign swings up and a green ring circles the capitol; on "Google's" a
 * moving truck carrying a search bar and a suitcase rolls in with a GOOGLE FOUNDERS label; on
 * "away" it speeds across the state line, a MOVED OUT stamp slams and an OUT OF REACH chip drops.
 *
 * params: { header, sign, who, stamp, chip }, events: only, residents, google, away
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Capitol = props.capitol!, Truck = props.movingtruck!, Search = props.searchbar!, Case = props.suitcase!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; sign?: string; who?: string; stamp?: string; chip?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tRes = at(p, "residents", 0.8), tG = at(p, "google", 1.8), tAway = at(p, "away", 3.2);
  const kRes = sp(tRes, 9), kG = sp(tG, 12), kAway = sp(tAway, 14);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, box.x1 - box.x0 - 100, { upper: true }));
  const g = h * 0.62, line = w * 0.7;
  // the truck: off the left edge, rolls to the middle on "Google's", across the line on "away"
  const tx = -w * 0.3 + kG * w * 0.72 + kAway * w * 0.28;
  const sign = (P.sign ?? "").toUpperCase();
  const signSize = Math.max(min, fitLine(sign, 54, w * 0.3, { upper: true }));
  const who = (P.who ?? "").toUpperCase();
  const whoSize = Math.max(min, fitLine(who, 52, w * 0.5, { upper: true }));
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 100, (box.x1 - box.x0) * 0.7, { upper: true }));
  const chip = (P.chip ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(chip, 64, (box.x1 - box.x0) * 0.7, { upper: true }));
  const dust = t < tG ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tG) * 1.4 + i / 5) % 1;
    return <circle key={i} cx={tx - h * 0.1 - f * w * 0.12} cy={g - h * 0.01 - f * h * 0.03} r={h * (0.012 + f * 0.02)} fill="#e8c79a" opacity={(1 - f) * 0.7} />;
  });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.08 * kAway})`, transformOrigin: "62% 58%" }}>
        <World kind="desert" tint="#5e3a1e" w={w} h={h} t={t} seed="turn-ca-highway" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <rect x={0} y={g - h * 0.02} width={w} height={h * 0.06} fill="#4a4f5c" />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * w * 0.2 - ((t * 200) % (w * 0.2))} y={g + h * 0.006} width={w * 0.08} height={h * 0.006} fill="#ffd84a" />)}
          <line x1={line} y1={g - h * 0.05} x2={line} y2={g + h * 0.06} stroke="#fff" strokeWidth={8} strokeDasharray="18 14" />
          <g transform={`translate(${w * 0.2},${g - h * 0.03})`}><Capitol s={h * 0.13} t={t} /></g>
          {kRes > 0 && <ellipse cx={w * 0.2} cy={g - h * 0.1} rx={w * 0.17} ry={h * 0.1} fill="none" stroke="#2fb37a" strokeWidth={10} opacity={clamp(kRes * 2)}
            strokeDasharray={`${kRes * 1400} 1400`} />}
          <g transform={`translate(${w * 0.46},${g - h * 0.03}) rotate(${(1 - kRes) * -60} 0 0)`}>
            <rect x={-6} y={-h * 0.14} width={12} height={h * 0.14} fill={INK} />
            <rect x={-w * 0.13} y={-h * 0.19} width={w * 0.26} height={h * 0.06} rx={10} fill="#2fb37a" stroke="#fff" strokeWidth={6} />
          </g>
          {kG > 0 && (
            <g transform={`translate(${tx},${g + h * 0.03})`}>
              <Truck s={h * 0.14} t={t} />
              <g transform={`translate(${-h * 0.04},${-h * 0.135})`}><Search s={h * 0.1} t={t} /></g>
              <g transform={`translate(${-h * 0.1},${-h * 0.1})`}><Case s={h * 0.05} t={t} /></g>
            </g>
          )}
          {dust}
        </svg>
      </AbsoluteFill>
      {sign && (
        <div style={{ position: "absolute", left: w * 0.46 - w * 0.13, width: w * 0.26, top: g - h * 0.215, textAlign: "center", opacity: clamp(kRes * 3) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: signSize, color: "#fff" }}>{sign}</span>
        </div>
      )}
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {kG > 0 && who && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.335, textAlign: "center", opacity: clamp(kG * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: whoSize, color: "#fff", background: "#3d7bf5", padding: "6px 20px", borderRadius: 14, border: `5px solid ${INK}` }}>{who}</span>
        </div>
      )}
      {kAway > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.16, textAlign: "center", transform: `rotate(-8deg) scale(${1.7 - 0.7 * kAway})`, opacity: clamp(kAway * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", background: "#d63031", padding: `${sSize * 0.12}px ${sSize * 0.4}px`, border: "8px solid #fff", borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
      {kAway > 0 && chip && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.265, textAlign: "center", opacity: clamp(kAway * 2), transform: `translate(0,${(1 - kAway) * -40}px)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#1d2433", background: "#8fd19e", padding: "6px 20px", borderRadius: 14, border: `5px solid ${INK}` }}>{chip}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
