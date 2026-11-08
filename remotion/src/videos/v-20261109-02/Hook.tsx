/**
 * Hook (a secret): "Basketball made Magic Johnson a billionaire? Watch this."
 * A purple arena at night: a hoop on the right with a ball dropping through the net, the gold MAGIC
 * jersey glowing in the middle, Rohan on the left cheering. Frame 0 reads BASKETBALL MADE HIM A
 * BILLIONAIRE? On "Basketball" the ball swishes; on "Magic" his name chip slides in under the jersey;
 * on "Watch" a red NOT QUITE stamp slams over the question and Rohan shrugs; on "how" an owner's
 * deed flips in beside the jersey (on "this").
 *
 * params: { line, cross, name }, events: ball, magic, billionaire, didnt, how
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { World } from "../../studio/worlds";
import props from "./props";

const Hoop = props.hoop!, Ball = props.hoopball!, Jersey = props.jersey!, Deed = props.ownerdeed!;

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; cross?: string; name?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tBall = at(p, "ball", 0.2), tMagic = at(p, "magic", 0.8), tNo = at(p, "didnt", 1.8), tHow = at(p, "how", 2.6);
  const kMagic = sp(tMagic, 12), kNo = sp(tNo, 9), kHow = sp(tHow, 11);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const line = (P.line ?? "").toUpperCase();
  const size = Math.max(min, fitWords(line, 120, box.x1 - box.x0 - 60, { upper: true }));
  const cross = (P.cross ?? "").toUpperCase();
  const cSize = Math.max(min, fitLine(cross, 110, (box.x1 - box.x0) * 0.7, { upper: true }));
  const name = (P.name ?? "").toUpperCase();
  const nSize = Math.max(min, fitLine(name, 54, w * 0.46, { upper: true }));
  const g = h * 0.64, hx = w * 0.8, jx = w * 0.52;
  // the ball arcs into the hoop from the left on "Basketball", then drops through the net
  const f = clamp((t - tBall) / 0.9);
  const bx = w * 0.3 + (hx - w * 0.3) * f, by = g - h * 0.3 - Math.sin(f * Math.PI) * h * 0.14 + (f >= 1 ? Math.min(h * 0.26, (t - tBall - 0.9) * h * 0.6) : 0);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + 0.02 * t + 0.04 * kNo})`, transformOrigin: "55% 55%" }}>
        <World kind="studio" tint="#4a2a7a" w={w} h={h} t={t} seed="hook-arena-magic" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <ellipse cx={jx} cy={g - h * 0.14} rx={w * 0.26} ry={h * 0.16} fill="#ffd84a" opacity={0.14 + 0.06 * Math.sin(t * 4)} />
          <g transform={`translate(${hx},${g})`}><Hoop s={h * 0.3} t={t} /></g>
          <g transform={`translate(${jx},${g - h * 0.02}) scale(${1 + 0.05 * kMagic})`}><Jersey s={h * 0.26} t={t} /></g>
          {t >= tBall && by < g && <g transform={`translate(${bx},${by})`}><Ball s={h * 0.07} t={t} /></g>}
          {kHow > 0 && (
            <g transform={`translate(${w * 0.8},${g + h * 0.04}) rotate(${(1 - kHow) * 80}) scale(${0.4 + 0.6 * kHow})`} opacity={clamp(kHow * 2)}>
              <Deed s={h * 0.13} t={t} />
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.2, scale: 1.1, acting: [{ sec: 0, pose: "celebrate", expression: "happy" }, { at: "didnt", pose: "shrug", expression: "confused" }] }}
            ground={h * 0.82} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: "#ffd84a", WebkitTextStroke: "10px #1d2433", paintOrder: "stroke fill",
            transform: `rotate(-3deg) scale(${1 + 0.04 * Math.sin(t * 4)})`, opacity: 1 - 0.4 * kNo, filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{line}</span>
        </div>
      )}
      {kMagic > 0 && name && (
        <div style={{ position: "absolute", left: jx - w * 0.25, width: w * 0.5, top: h * 0.62, textAlign: "center", opacity: clamp(kMagic * 2), transform: `translateY(${(1 - kMagic) * 40}px)` }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: nSize, color: "#1d2433", background: "#ffd84a", padding: "4px 18px", borderRadius: 12, border: "5px solid #1d2433" }}>{name}</span>
        </div>
      )}
      {kNo > 0 && cross && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", transform: `rotate(-8deg) scale(${1.8 - 0.8 * kNo})`, opacity: clamp(kNo * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: cSize, color: "#fff", background: "#d63031", padding: `${cSize * 0.12}px ${cSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 18 }}>{cross}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
