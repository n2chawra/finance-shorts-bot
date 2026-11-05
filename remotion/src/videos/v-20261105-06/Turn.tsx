/**
 * The turn: "So who pays for all their machines? Rohan does."
 * The gym floor under green light, header WHO PAYS FOR THESE? from frame 0, a kettlebell and a
 * dumbbell on the floor. On "who" the header hops; on "machines" three treadmills slide in, belts
 * running; on "Rohan" Rohan's membership card (from the street) flies in from the left trailing
 * notes into the treadmills, ROHAN'S CARD under it; on "does" a red PAID BY ROHAN stamp slams over the
 * machines and the fee slams in huge.
 *
 * params: { header, fee, stamp, cardLabel }, events: who, machines, rohan, does
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import { World } from "../../studio/worlds";
import props from "./props";

const Tread = props.treadmill!, Card = props.membercard!, Bell = props.kettlebell!, Dumb = props.dumbbell!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { header?: string; fee?: string; stamp?: string; cardLabel?: string };
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tWho = at(p, "who", 0.2), tMach = at(p, "machines", 1.0), tRo = at(p, "rohan", 1.8), tDoes = at(p, "does", 2.3);
  const kWho = sp(tWho, 8), kMach = sp(tMach, 12), kRo = sp(tRo, 12), kDoes = sp(tDoes, 8);
  const box = safeBox(w, h);
  const min = minText(w, h);
  const header = (P.header ?? "").toUpperCase();
  const hSize = Math.max(min, fitLine(header, 80, box.x1 - box.x0 - 100, { upper: true }));
  const lab = (s: string, max: number, base = 52) => Math.max(min, fitLine(s.toUpperCase(), base, max, { upper: true }));
  const g = h * 0.62;
  const zoom = 1 + 0.12 * kDoes;
  const cardX = -w * 0.2 + (w * 0.24 + w * 0.2) * kRo, cardY = g - h * 0.3;
  const notes = t < tRo ? [] : Array.from({ length: 5 }, (_, i) => {
    const f = ((t - tRo) * 0.9 + i / 5) % 1;
    const x = cardX + (w * 0.66 - cardX) * f, y = cardY - Math.sin(f * Math.PI) * h * 0.08 + f * h * 0.14;
    return <rect key={i} x={x - h * 0.022} y={y - h * 0.012} width={h * 0.044} height={h * 0.024} rx={4} fill="#8fd19e" stroke={INK} strokeWidth={4}
      transform={`rotate(${f * 220} ${x} ${y})`} opacity={clamp((1 - f) * 5) * clamp(kRo * 2)} />;
  });
  const stamp = (P.stamp ?? "").toUpperCase();
  const sSize = Math.max(min, fitLine(stamp, 96, (box.x1 - box.x0) * 0.82, { upper: true }));
  const fee = P.fee ?? "";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "60% 58%" }}>
        <World kind="office" tint="#1f6b4a" w={w} h={h} t={t} seed="turn-gym-floor" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.16},${g + h * 0.08})`}><Bell s={h * 0.08} t={t} /></g>
          <g transform={`translate(${w * 0.86},${g + h * 0.09})`}><Dumb s={h * 0.07} t={t} /></g>
          {[0, 1, 2].map((i) => {
            const k = sp(tMach + i * 0.12, 12);
            return (
              <g key={i} transform={`translate(${w * (0.5 + i * 0.16) + (1 - k) * w * 0.7},${g - i * h * 0.03}) scale(${1 - i * 0.08})`} opacity={clamp(k * 2)}>
                <Tread s={h * 0.17} t={t} />
              </g>
            );
          })}
          {notes}
          {kRo > 0 && (
            <g transform={`translate(${cardX},${cardY}) rotate(${(1 - kRo) * -40}) scale(${1 + 0.15 * kDoes})`} opacity={clamp(kRo * 2)}>
              <Card s={h * 0.13} t={t} />
            </g>
          )}
          {kRo > 0 && P.cardLabel && (
            <text x={cardX} y={cardY + min * 1.3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={lab(P.cardLabel, w * 0.36)} fill="#fff" stroke={INK} strokeWidth={7}
              paintOrder="stroke" opacity={clamp(kRo * 2)}>{P.cardLabel.toUpperCase()}</text>
          )}
        </svg>
      </AbsoluteFill>
      {header && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.08, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: hSize, color: "#1d2433", background: "#ffd84a", padding: `${hSize * 0.2}px ${hSize * 0.5}px`,
            transform: `rotate(-2deg) translateY(${-Math.abs(Math.sin((t - tWho) * 6)) * 18 * kWho * (t < tWho + 0.6 ? 1 : 0)}px)` }}>{header}</span>
        </div>
      )}
      {kDoes > 0 && fee && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.16, textAlign: "center", transform: `scale(${1.7 - 0.7 * kDoes})`, opacity: clamp(kDoes * 2) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.max(min, fitLine(fee, 170, w * 0.5)), color: "#ffd84a", WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill" }}>{fee}</span>
        </div>
      )}
      {kDoes > 0 && stamp && (
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.33, textAlign: "center", transform: `rotate(-7deg) scale(${1.6 - 0.6 * kDoes})`, opacity: clamp(kDoes * 2) }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: sSize, color: "#fff", background: "#d63031", padding: `${sSize * 0.12}px ${sSize * 0.4}px`,
            border: "8px solid #fff", borderRadius: 16 }}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Turn;
