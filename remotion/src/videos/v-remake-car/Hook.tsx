/**
 * Hook: "You think the dealer gave you {disc_total} off? He didn't. Watch."
 * A night showroom: the red hatchback turns on a lit stand, Rohan cheering on the left, the grinning
 * dealer on the right. Frame 0 already reads "{disc_total} OFF?". On "off" a giant discount tag slams
 * onto the car (confetti, the frame jolts). On "didn't" a crane hook swings down on a cable, catches
 * the tag and yanks it up out of the frame; the stand light turns red and Rohan's face drops. On
 * "watch" the camera snaps in on the dealer, who grins. Where the money goes is the payoff.
 *
 * params: { line: "{disc_total} off?", tag: "-{disc_total}" }, events: dealer, off, didnt, watch
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { FONT } from "../../design/fonts";
import { fitLine, fitWords, minText, safeBox } from "../../design/fit";
import { INK } from "../../studio/draw";
import props from "./props";

const Car = props.hatchback!, Dealer = props.dealer!;
const ease = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

const Hook: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const P = p.beat.params as { line?: string; tag?: string };
  const sp = (start: number, damping = 10) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 170, mass: 0.7 } }));
  const tOff = at(p, "off", 1.0), tNo = at(p, "didnt", 1.9), tWatch = at(p, "watch", 2.6);
  const kTag = sp(tOff, 8);
  // the hook: swings down (0..0.45 s), catches, and yanks up (0.45..0.9 s)
  const down = ease((t - tNo + 0.25) / 0.45), up = ease((t - tNo - 0.3) / 0.5);
  const box = safeBox(w, h), min = minText(w, h);
  const cx = w * 0.52, ground = h * 0.66, cs = h * 0.27;
  const tagY0 = ground - cs * 0.95, hookY = -h * 0.1 + (tagY0 - h * 0.06 + h * 0.1) * down - up * h * 0.9;
  const tagY = up > 0 ? Math.min(tagY0, hookY + h * 0.06) : tagY0;
  const red = clamp((t - tNo) / 0.3);
  // the frame jolts on the slam and on the yank
  const jolt = (d: number) => (d > 0 && d < 0.35 ? Math.sin(d * 70) * 18 * (1 - d / 0.35) : 0);
  const jx = jolt(t - tOff) + jolt(t - tNo - 0.3) * 0.7, jy = jolt(t - tOff - 0.02) * 0.6;
  // "watch": a snap zoom onto the dealer
  const z = ease((t - tWatch) / 0.35), zs = 1 + 0.4 * z, zx = w * 0.84, zy = h * 0.32;
  const line = (P.line ?? "").toUpperCase();
  const lineSize = Math.max(min, fitWords(line, 150, box.x1 - box.x0 - 40, { upper: true }));
  const tagText = P.tag ?? "";
  const tagSize = Math.max(min, fitLine(tagText, 96, w * 0.5));
  const confetti = t < tOff ? [] : Array.from({ length: 26 }, (_, i) => {
    const f = clamp((t - tOff) / 1.3);
    const a = random(`cf-a-${i}`) * Math.PI * 2, r = (0.3 + random(`cf-r-${i}`) * 0.7) * h * 0.25 * f;
    const x = cx + Math.cos(a) * r, y = tagY0 + Math.sin(a) * r + f * f * h * 0.1;
    return <rect key={i} x={x} y={y} width={22} height={12} fill={["#ffd34d", "#2fb37a", "#f2588f", "#3d7bf5"][i % 4]} opacity={1 - f} transform={`rotate(${f * 400 + i * 20},${x},${y})`} />;
  });
  return (
    <AbsoluteFill style={{ background: "#070b1c", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${jx}px,${jy}px) translate(${zx}px,${zy}px) scale(${zs * (1.02 + 0.02 * t)}) translate(${-zx}px,${-zy}px)` }}>
        {/* showroom: a glass wall of city lights, a glossy floor and a spotlight cone on the stand */}
        <AbsoluteFill style={{ background: "linear-gradient(#0d1846 0%, #16225e 55%, #22284a 66%, #11152a 100%)" }} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={(i * w) / 9} y={h * 0.08} width={w / 9 - 12} height={ground - h * 0.08} fill="#1c2b6e" opacity={0.6} />)}
          {Array.from({ length: 40 }, (_, i) => <circle key={`l${i}`} cx={random(`lx${i}`) * w} cy={h * 0.12 + random(`ly${i}`) * h * 0.4} r={4 + random(`lr${i}`) * 8} fill="#ffd84a" opacity={0.25 + 0.2 * Math.sin(t * 3 + i)} />)}
          <polygon points={`${cx - w * 0.08},0 ${cx + w * 0.08},0 ${cx + w * 0.42},${ground + h * 0.02} ${cx - w * 0.42},${ground + h * 0.02}`}
            fill={red > 0 ? `rgba(255,${Math.round(230 - 170 * red)},${Math.round(150 - 110 * red)},0.22)` : "rgba(255,240,170,0.22)"} />
          <ellipse cx={cx} cy={ground + h * 0.01} rx={cs * 1.15} ry={cs * 0.13} fill="#2b3245" stroke={INK} strokeWidth={8} />
          <ellipse cx={cx} cy={ground - h * 0.004} rx={cs * 1.0} ry={cs * 0.09} fill={red > 0.5 ? "#e5484d" : "#ffd84a"} opacity={0.5} />
          <g transform={`translate(${cx},${ground}) scale(${Math.cos(t * 0.9) > 0 ? 1 : -1},1)`}><Car s={cs} t={t} /></g>
          <g transform={`translate(${w * 0.86},${ground + h * 0.03})`}><Dealer s={h * 0.3} t={t} /></g>
          {confetti}
          {/* the crane cable and hook */}
          {t > tNo - 0.3 && (
            <g>
              <line x1={cx} y1={-20} x2={cx} y2={hookY - h * 0.04} stroke={INK} strokeWidth={10} />
              <path d={`M${cx},${hookY - h * 0.045} v${h * 0.05} a${h * 0.03},${h * 0.03} 0 1 1 ${-h * 0.06},0`} fill="none" stroke="#c9cfdb" strokeWidth={22} strokeLinecap="round" />
              <path d={`M${cx},${hookY - h * 0.045} v${h * 0.05} a${h * 0.03},${h * 0.03} 0 1 1 ${-h * 0.06},0`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            </g>
          )}
          {kTag > 0 && tagY > -h * 0.2 && (
            <g transform={`translate(${cx},${tagY}) scale(${kTag}) rotate(${-6 + up * 25})`}>
              <rect x={-tagSize * tagText.length * 0.34 - 36} y={-tagSize * 0.8} width={tagSize * tagText.length * 0.68 + 72} height={tagSize * 1.5} rx={24} fill="#ffd34d" stroke={INK} strokeWidth={10} />
              <circle cx={-tagSize * tagText.length * 0.34 - 6} cy={-tagSize * 0.05} r={12} fill="#11152a" />
              <text y={tagSize * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={tagSize} fill="#e5484d">{tagText}</text>
            </g>
          )}
          <Actor p={p} spec={{ who: "rohan", x: 0.16, scale: 0.95, acting: [{ sec: 0, pose: "celebrate", expression: "laugh" }, { at: "didnt", pose: "shrug", expression: "shock" }] }}
            ground={h * 0.9} index={0} />
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: box.x0 + 20, right: w - box.x1 + 20, top: h * 0.09, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: lineSize, lineHeight: 1.0, color: red > 0.5 ? "#ff6b6b" : "#ffd84a",
            WebkitTextStroke: "12px #1d2433", paintOrder: "stroke fill", filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.5))",
            transform: `rotate(-4deg) scale(${(1 + 0.04 * Math.sin(t * 5)) * (red > 0 && red < 1 ? 1.12 : 1)})` }}>
            {red > 0.5 ? "NOT FREE." : line}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default Hook;
