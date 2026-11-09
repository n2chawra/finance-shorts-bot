/**
 * The payoff: "Investors valued it all at about {fact4}. Still think it's the videos?"
 * A city skyline at dusk. The chocolate bar stands big on a gold pedestal in the middle, the video
 * screen small on the right, Rohan small on the left. On "Investors" a briefcase of notes pops in
 * and notes fly into the bar; on "valued" the value slams in huge over VALUED AT; on "Still" the
 * screen wobbles; on "videos" a STILL THE VIDEOS? chip drops in and the camera pulls wide.
 *
 * params: { worth, worthLabel, ask }, events: investors, valued, still, videos
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Bar = props.chocobar!, Screen = props.videoscreen!, Till = props.cashtill!;

const Payoff: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { worth?: string; worthLabel?: string; ask?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tInv = at(p, "investors", 0.2), tVal = at(p, "valued", 0.8), tStill = at(p, "still", 2.6), tVid = at(p, "videos", 3.2);
  const kInv = sp(tInv, 10), kVal = sp(tVal, 8), kStill = sp(tStill, 8), kVid = sp(tVid, 12);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const g = h * 0.64, cx = w * 0.5;
  const zoom = 1.1 - 0.1 * kVid;
  const wob = kStill * Math.sin((t - tStill) * 10) * (t < tStill + 0.8 ? 8 : 0);
  const notes = t < tInv ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tInv) * 0.8 + i / 6) % 1;
    const x = w * 0.2 + (cx - w * 0.2) * f, y = g - h * 0.08 - Math.sin(f * Math.PI) * h * 0.14;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kInv * 2)} />;
  });
  const worth = P.worth ?? "";
  const ask = (P.ask ?? "").toUpperCase();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 58%" }}>
        <World kind="city" tint="#5e2e1e" w={w} h={h} t={t} seed="payoff-beast-city" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={cx} cy={g - h * 0.12} rx={w * 0.26} ry={h * 0.13} fill="#ffd27a" opacity={0.12 + 0.12 * kVal} />
          <rect x={cx - w * 0.16} y={g - h * 0.03} width={w * 0.32} height={h * 0.05} rx={10} fill="#f2b631" stroke={INK} strokeWidth={6} />
          <g transform={`translate(${cx},${g - h * 0.03}) scale(${1 + 0.15 * kVal})`}><Bar s={h * 0.2} t={t} /></g>
          <g transform={`translate(${w * 0.84},${g + h * 0.02}) rotate(${wob} 0 0)`}><Screen s={h * 0.09} t={t} /></g>
          {kInv > 0 && <g transform={`translate(${w * 0.22},${g + h * 0.02}) scale(${kInv})`}><Till s={h * 0.08} t={t} /></g>}
          {notes}
          <Actor p={p} spec={{ who: "rohan", x: 0.14, scale: 0.8, acting: [{ sec: 0, pose: "think", expression: "thinking" }, { at: "valued", pose: "celebrate", expression: "shock" }, { at: "videos", pose: "shrug", expression: "smirk" }] }}
            ground={h * 0.82} index={0} />
        </svg>
      </AbsoluteFill>
      {kVal > 0 && worth && (
        <div style={{ position: "absolute", left: box.x0, right: w - box.x1, top: h * 0.1, textAlign: "center", opacity: clamp(kVal * 2), transform: `scale(${1.5 - 0.5 * kVal})` }}>
          {P.worthLabel && <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(P.worthLabel.toUpperCase(), 60, w * 0.6, { upper: true })), color: "#1d2433", background: "#fff", padding: "4px 22px", borderRadius: 14 }}>{P.worthLabel.toUpperCase()}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(worth, 170, w * 0.7)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", lineHeight: 1.05 }}>{worth}</div>
        </div>
      )}
      {kVid > 0 && ask && (
        <div style={{ position: "absolute", left: box.x0 + 10, right: w - box.x1 + 10, top: h * 0.3, textAlign: "center", opacity: clamp(kVid * 2), transform: `translate(0,${(1 - kVid) * -40}px)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(ask, 70, (box.x1 - box.x0) * 0.85, { upper: true })), color: "#fff", background: "#3d7bf5", padding: "8px 26px", borderRadius: 16, border: `6px solid ${INK}` }}>{ask}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Payoff;
