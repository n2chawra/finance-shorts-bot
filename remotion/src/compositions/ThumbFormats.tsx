/**
 * Covers for the demand-first formats (owner, 2026-10-21: "the thumbnail is the first biggest factor
 * to someone clicking"). Each says the format at a glance, the way the top finance Shorts do:
 *
 * - `versus` (rich vs poor): a red and a green half, the poor move and the rich move side by side,
 *   one figure each, a VS badge, the topic in huge words on top.
 * - `secret` (what the rich know): dark and gold, the rich mentor smirking, the cost everyone else
 *   pays crossed out, what the rich keep instead, the claim in huge words.
 *
 * Words are at most four; a word between asterisks is highlighted ("BILLIONAIRES *NEVER* SELL").
 * Every figure is one Python computed (build.py checks `figure` and `small`).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import type { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { PROPS } from "../scenes/kit";

type Th = NonNullable<Timeline["thumbnail"]>;

/** Huge words with an optional highlighted *word*, black outline, hard shadow. */
export const BigWords: React.FC<{ text: string; size: number; color?: string; hi?: string; style?: React.CSSProperties }> =
  ({ text, size, color = "#ffffff", hi = "#ffd84a", style }) => (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.98, textTransform: "uppercase", letterSpacing: -1,
      color, WebkitTextStroke: `${Math.round(size * 0.07)}px #000`, paintOrder: "stroke fill", textShadow: `0 ${Math.round(size * 0.09)}px 0 rgba(0,0,0,0.5)`, ...style }}>
      {text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, i) =>
        part.startsWith("*") ? <span key={i} style={{ color: hi }}>{part.slice(1, -1)}</span> : <span key={i}>{part}</span>)}
    </div>
  );

const Pill: React.FC<{ text: string; bg: string; size: number; rot?: number }> = ({ text, bg, size, rot = 0 }) => (
  <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#fff", background: bg,
    padding: `${size * 0.12}px ${size * 0.42}px`, borderRadius: size * 0.3, border: `${Math.max(4, size * 0.07)}px solid #fff`,
    transform: `rotate(${rot}deg)`, boxShadow: "0 12px 0 rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 1 }}>{text}</div>
);

/** A figure on a card: a small caption above a huge number. */
const FigureCard: React.FC<{ label?: string; value: string; color: string; size: number; rot?: number; strike?: boolean }> =
  ({ label, value, color, size, rot = 0, strike }) => (
    <div style={{ display: "inline-block", background: "#ffffff", borderRadius: size * 0.16, padding: `${size * 0.1}px ${size * 0.22}px ${size * 0.08}px`,
      transform: `rotate(${rot}deg)`, boxShadow: "0 14px 0 rgba(0,0,0,0.45)", border: `${Math.max(5, size * 0.06)}px solid ${color}`, textAlign: "center", position: "relative" }}>
      {label && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size * 0.3, color: "#3f4656", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>}
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color, letterSpacing: -2 }}>{value}</div>
      {strike && <div style={{ position: "absolute", left: "-6%", right: "-6%", top: "58%", height: size * 0.16, background: "#e03131",
        transform: "rotate(-8deg)", borderRadius: 99, boxShadow: "0 4px 0 rgba(0,0,0,0.35)" }} />}
    </div>
  );

function actor(who: string, pose: string | undefined, expression: string | undefined, fallbackPose: PoseName, fallbackFace: Expression) {
  const member = CAST[who];
  if (!member) throw new Error(`unknown cast member ${who}`);
  return { look: member.look, pose: POSES[(pose ?? fallbackPose) as PoseName] ?? POSES[fallbackPose], expression: (expression ?? fallbackFace) as Expression };
}

export const VersusThumb: React.FC<{ th: Th; w: number; h: number }> = ({ th, w, h }) => {
  const v = h > w;
  const poor = actor(th.who, th.pose, th.expression, "worried", "sad");
  const rich = actor(th.who2 ?? "sharma", th.pose2, th.expression2, "thumbsUp", "proud");
  const seam = v ? `polygon(0 0, 54% 0, 46% 100%, 0 100%)` : `polygon(0 0, 53% 0, 47% 100%, 0 100%)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "radial-gradient(circle at 75% 60%, #20c06a, #0a4a2a 70%)" }}>
      <AbsoluteFill style={{ clipPath: seam, background: "radial-gradient(circle at 25% 60%, #ff4d4d, #6a0f1c 70%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the seam */}
        <line x1={w * (v ? 0.54 : 0.53)} y1={0} x2={w * (v ? 0.46 : 0.47)} y2={h} stroke="#ffffff" strokeWidth={v ? 14 : 10} />
        <Character id="tp" look={poor.look} pose={poor.pose} expression={poor.expression} x={v ? w * 0.25 : w * 0.2} y={v ? h * 1.1 : h * 1.5}
          scale={v ? 2.0 : 1.25} gaze={[0.4, 0]} shadow={false} holdL={th.prop ? PROPS[th.prop] : undefined} />
        <Character id="tr" look={rich.look} pose={rich.pose} expression={rich.expression} x={v ? w * 0.76 : w * 0.82} y={v ? h * 1.1 : h * 1.5}
          scale={v ? 2.0 : 1.25} gaze={[-0.4, 0]} shadow={false} />
      </svg>
      {/* the topic */}
      <div style={{ position: "absolute", left: 40, right: 40, top: v ? 70 : 22, textAlign: "center" }}>
        <BigWords text={th.words} size={v ? 132 : 84} />
      </div>
      {/* the two sides */}
      <div style={{ position: "absolute", left: v ? 40 : 40, top: v ? 470 : 165, width: v ? w * 0.44 : w * 0.42, textAlign: "center" }}>
        <Pill text="Poor" bg="#c92a2a" size={v ? 92 : 58} rot={-4} />
        {th.small && <div style={{ marginTop: v ? 36 : 18 }}><FigureCard label={th.tag} value={th.small} color="#c92a2a" size={v ? 96 : 60} rot={-3} /></div>}
      </div>
      <div style={{ position: "absolute", right: v ? 40 : 40, top: v ? 470 : 165, width: v ? w * 0.44 : w * 0.42, textAlign: "center" }}>
        <Pill text="Rich" bg="#1f8f55" size={v ? 92 : 58} rot={4} />
        <div style={{ marginTop: v ? 36 : 18 }}><FigureCard label={th.to} value={th.figure} color="#1f8f55" size={v ? 110 : 66} rot={3} /></div>
      </div>
      {/* VS */}
      <div style={{ position: "absolute", left: w / 2 - (v ? 95 : 60), top: v ? 860 : 330, width: v ? 190 : 120, height: v ? 190 : 120, borderRadius: "50%",
        background: "#ffd34d", border: `${v ? 10 : 7}px solid #000`, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: v ? 96 : 60, color: "#000", boxShadow: "0 12px 0 rgba(0,0,0,0.45)", transform: "rotate(-8deg)" }}>VS</div>
    </AbsoluteFill>
  );
};

export const SecretThumb: React.FC<{ th: Th; w: number; h: number }> = ({ th, w, h }) => {
  const v = h > w;
  const rich = actor(th.who, th.pose, th.expression, "pointUp", "smirk");
  // a gold line climbing behind everything: what the rich keep growing
  const pts = Array.from({ length: 9 }, (_, i) => [w * (0.02 + i * 0.12), h * (v ? 0.82 - i * 0.05 - (i % 2) * 0.025 : 0.9 - i * 0.075 - (i % 2) * 0.04)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x!.toFixed(0)},${y!.toFixed(0)}`).join(" ");
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "radial-gradient(circle at 70% 45%, #6b4b07, #15110a 62%, #07070d)" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <path d={`${line} L${w},${h} L0,${h} Z`} fill="#ffcf40" opacity={0.12} />
        <path d={line} fill="none" stroke="#ffcf40" strokeWidth={v ? 18 : 12} strokeLinejoin="round" strokeLinecap="round" />
        <Character id="ts" look={rich.look} pose={rich.pose} expression={rich.expression} x={v ? w * 0.7 : w * 0.8} y={v ? h * 1.06 : h * 1.48}
          scale={v ? 2.35 : 1.35} gaze={[-0.5, 0.1]} shadow={false} />
      </svg>
      <div style={{ position: "absolute", left: 40, right: 40, top: v ? 70 : 22, textAlign: v ? "center" : "left" }}>
        <BigWords text={th.words} size={v ? 140 : 88} />
      </div>
      {/* what everyone else pays, crossed out; what the rich keep */}
      <div style={{ position: "absolute", left: v ? 50 : 40, top: v ? 470 : 250 }}>
        <FigureCard label={th.tag ?? "Tax"} value={th.figure} color="#c92a2a" size={v ? 104 : 64} rot={-5} strike />
      </div>
      {th.small && <div style={{ position: "absolute", left: v ? 70 : 60, top: v ? 790 : 430 }}>
        <FigureCard label={th.to} value={th.small} color="#1f8f55" size={v ? 104 : 64} rot={3} />
      </div>}
    </AbsoluteFill>
  );
};
