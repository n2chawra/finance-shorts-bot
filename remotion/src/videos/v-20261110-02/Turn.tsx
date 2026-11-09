/**
 * The turn: "So every video is really an advert for the bar."
 * A studio office, header THE REAL BUSINESS from frame 0. On the left the video screen stands over
 * a red chip with what the videos lost; on the right the chocolate bar over a green chip with what
 * it kept. On "video" the screen hops; on "advert" a megaphone with AD swings in above the screen
 * and an ADVERT stamp slams over it; on "bar" notes fly from the screen to the bar and the bar
 * swells, the camera pushing in.
 *
 * params: { header, loss, lossLabel, gain, gainLabel, stamp }, events: video, advert, bar
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Screen = props.videoscreen!, Bar = props.chocobar!, Mega = props.megaphone!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; loss?: string; lossLabel?: string; gain?: string; gainLabel?: string; stamp?: string };
  const sp = (start: number, damping = 12) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 140, mass: 0.85 } }));
  const tVid = at(p, "video", 0.3), tAd = at(p, "advert", 1.2), tBar = at(p, "bar", 2.0);
  const kVid = sp(tVid, 8), kAd = sp(tAd, 9), kBar = sp(tBar, 10);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 84, box.x1 - box.x0 - 100, { upper: true }));
  const colW = (box.x1 - box.x0) * 0.46;
  const lab = (s: string, b = 50) => Math.max(min, fitLine(s.toUpperCase(), b, colW, { upper: true }));
  const g = h * 0.6, lx = w * 0.28, rx = w * 0.74;
  const hop = kVid * Math.abs(Math.sin((t - tVid) * 6)) * (t < tVid + 0.6 ? 1 : 0);
  const notes = t < tBar ? [] : Array.from({ length: 6 }, (_, i) => {
    const f = ((t - tBar) * 0.9 + i / 6) % 1;
    const x = lx + (rx - lx) * f, y = g - h * 0.14 - Math.sin(f * Math.PI) * h * 0.12;
    return <rect key={i} x={x - h * 0.02} y={y - h * 0.011} width={h * 0.04} height={h * 0.022} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 200} ${x} ${y})`} opacity={clamp((1 - f) * 5)} />;
  });
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 100, colW * 1.2, { upper: true }));
  const chip = (text: string, bg: string, x: number, op: number) => (
    <div style={{ position: "absolute", left: x - colW / 2, width: colW, top: h * 0.645, textAlign: "center", opacity: op }}>
      <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lab(text), color: "#1d2433", background: bg, padding: "6px 16px", borderRadius: 14, border: `5px solid ${INK}` }}>{text.toUpperCase()}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.06 * kBar})`, transformOrigin: "70% 55%" }}>
        <World kind="office" tint="#1e3a5e" w={w} h={h} t={t} seed="turn-beast-office" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${lx},${g}) scale(${1 + 0.06 * hop})`}><Screen s={h * 0.17} t={t} /></g>
          <g transform={`translate(${rx},${g}) scale(${1 + 0.25 * kBar})`}><Bar s={h * 0.17} t={t} /></g>
          {kAd > 0 && <g transform={`translate(${lx + w * 0.02},${g - h * 0.22 - (1 - kAd) * h * 0.1}) scale(${kAd})`}><Mega s={h * 0.12} t={t} /></g>}
          {notes}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.07, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`, transform: "rotate(-2deg)" }}>{header}</span>
        </div>
      )}
      {P.loss && chip(`${P.lossLabel ?? ""} ${P.loss}`, "#ff9b8a", lx, 1)}
      {P.gain && chip(`${P.gainLabel ?? ""} ${P.gain}`, "#8fd19e", rx, 1)}
      {kAd > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, width: w * 0.56, top: h * 0.18, textAlign: "center", transform: `rotate(-8deg) scale(${1.7 - 0.7 * kAd})`, opacity: clamp(kAd * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", background: "#d63031", padding: `${sSize * 0.12}px ${sSize * 0.4}px`, border: "8px solid #fff", borderRadius: 18 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
