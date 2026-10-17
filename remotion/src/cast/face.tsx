/**
 * Faces: eyes with lids, gaze and blinks; thick brows; a mouth that holds an expression or speaks.
 *
 * Expressions set brows, eye shape and a resting mouth. While a character talks, a viseme (from
 * Kokoro's phoneme timings, see visemes.ts) replaces only the mouth, so a worried character still
 * looks worried mid-sentence. Drawn around the head centre in head-local px (head radius r).
 */
import React from "react";

export type Expression =
  | "neutral" | "happy" | "laugh" | "shock" | "sad" | "worried" | "angry" | "thinking" | "proud" | "confused" | "smirk";

export type Viseme = "rest" | "A" | "E" | "I" | "O" | "U" | "M" | "F" | "L" | "S";

type EyeShape = "open" | "closed-happy" | "wide" | "droop" | "glare" | "half";
type Mouth = Viseme | "smile" | "grin" | "frown" | "open-smile" | "flat" | "o-small" | "smirk" | "wobble";

interface FaceSpec {
  brow: [number, number];       // raise in units of r (viewer's left brow first)
  tilt: [number, number];       // positive raises the inner end (worry), negative lowers it (anger)
  eye: EyeShape;
  mouth: Mouth;
  blush: number;
}

const FACES: Record<Expression, FaceSpec> = {
  neutral:  { brow: [0, 0], tilt: [0, 0], eye: "open", mouth: "flat", blush: 0.12 },
  happy:    { brow: [0.04, 0.04], tilt: [0.05, 0.05], eye: "open", mouth: "smile", blush: 0.35 },
  laugh:    { brow: [0.1, 0.1], tilt: [0.15, 0.15], eye: "closed-happy", mouth: "open-smile", blush: 0.55 },
  shock:    { brow: [0.2, 0.2], tilt: [0.1, 0.1], eye: "wide", mouth: "O", blush: 0.05 },
  sad:      { brow: [0.02, 0.02], tilt: [0.55, 0.55], eye: "droop", mouth: "frown", blush: 0.08 },
  worried:  { brow: [0.08, 0.08], tilt: [0.45, 0.45], eye: "open", mouth: "wobble", blush: 0.08 },
  angry:    { brow: [-0.05, -0.05], tilt: [-0.55, -0.55], eye: "glare", mouth: "frown", blush: 0.4 },
  thinking: { brow: [0.14, -0.02], tilt: [0.1, -0.2], eye: "half", mouth: "smirk", blush: 0.08 },
  proud:    { brow: [0.06, 0.06], tilt: [-0.1, -0.1], eye: "half", mouth: "grin", blush: 0.3 },
  confused: { brow: [0.16, -0.04], tilt: [0.3, -0.25], eye: "open", mouth: "o-small", blush: 0.08 },
  smirk:    { brow: [0.0, 0.1], tilt: [0, -0.1], eye: "half", mouth: "smirk", blush: 0.2 },
};

export const EXPRESSIONS = Object.keys(FACES) as Expression[];

export interface FaceProps {
  expression: Expression;
  viseme?: Viseme | null;
  turn: number;                 // -1 … 1: features slide toward the turn, the far eye narrows
  look: [number, number];       // gaze, -1 … 1 each
  blink: number;                // 0 open … 1 closed
  skin: string;
  ink: string;
  lip: string;
  r: number;
  lashes?: boolean;
}

const E = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0Z`;

function mouthShape(m: Mouth, w: number): { d: string; open: boolean; teeth?: boolean; tongue?: boolean } {
  const h = w * 0.55;
  switch (m) {
    case "smile": return { d: `M${-w},${-h * 0.15} Q0,${h * 1.2} ${w},${-h * 0.15}`, open: false };
    case "grin": return { d: `M${-w},${-h * 0.2} Q0,${h * 1.5} ${w},${-h * 0.2} Q0,${h * 0.25} ${-w},${-h * 0.2}Z`, open: true, teeth: true };
    case "open-smile": return { d: `M${-w * 1.05},${-h * 0.3} Q0,${h * 2.3} ${w * 1.05},${-h * 0.3} Q0,${-h * 0.05} ${-w * 1.05},${-h * 0.3}Z`, open: true, teeth: true, tongue: true };
    case "frown": return { d: `M${-w * 0.75},${h * 0.55} Q0,${-h * 0.55} ${w * 0.75},${h * 0.55}`, open: false };
    case "wobble": return { d: `M${-w * 0.7},${h * 0.3} q${w * 0.23},${-h * 0.35} ${w * 0.47},0 t${w * 0.47},0`, open: false };
    case "flat": return { d: `M${-w * 0.6},${h * 0.1} Q0,${h * 0.3} ${w * 0.6},${h * 0.1}`, open: false };
    case "o-small": return { d: E(0, h * 0.2, w * 0.25, h * 0.4), open: true };
    case "smirk": return { d: `M${-w * 0.7},${h * 0.2} Q${w * 0.15},${h * 0.65} ${w * 0.8},${-h * 0.35}`, open: false };
    case "rest": return { d: `M${-w * 0.45},${h * 0.1} Q0,${h * 0.25} ${w * 0.45},${h * 0.1}`, open: false };
    case "M": return { d: `M${-w * 0.5},${h * 0.1} Q0,${h * 0.05} ${w * 0.5},${h * 0.1}`, open: false };
    case "A": return { d: E(0, h * 0.55, w * 0.62, h * 1.0), open: true, teeth: true, tongue: true };
    case "E": return { d: E(0, h * 0.3, w * 0.8, h * 0.5), open: true, teeth: true };
    case "I": return { d: E(0, h * 0.25, w * 0.72, h * 0.36), open: true, teeth: true };
    case "O": return { d: E(0, h * 0.5, w * 0.44, h * 0.85), open: true, tongue: true };
    case "U": return { d: E(0, h * 0.3, w * 0.27, h * 0.45), open: true };
    case "F": return { d: `M${-w * 0.6},0 Q0,${h * 0.65} ${w * 0.6},0 Q0,${h * 0.15} ${-w * 0.6},0Z`, open: true, teeth: true };
    case "L": return { d: E(0, h * 0.4, w * 0.55, h * 0.65), open: true, tongue: true };
    case "S": return { d: E(0, h * 0.2, w * 0.62, h * 0.26), open: true, teeth: true };
  }
}

export const Face: React.FC<FaceProps> = ({ expression, viseme, turn, look, blink, skin, ink, lip, r, lashes }) => {
  const f = FACES[expression];
  const shift = turn * r * 0.28;
  const eyeY = r * 0.12, gap = r * 0.38;
  const ew = r * 0.21, ehBase = r * 0.25;
  const open = Math.max(0, 1 - blink);
  const lw = r * 0.06;

  const eye = (side: -1 | 1, i: 0 | 1) => {
    const far = side === Math.sign(turn) ? Math.abs(turn) : 0;
    const sx = 1 - 0.4 * far;
    const cx = shift + side * gap * (1 - 0.28 * far);
    const rx = ew * sx;
    const wide = f.eye === "wide" ? 1.25 : 1;
    const half = f.eye === "half" ? 0.62 : f.eye === "glare" ? 0.7 : 1;
    const ry = ehBase * wide * half * open;
    const id = `e${i}${Math.round(cx * 10)}${Math.round(r)}`;
    const browRaise = f.brow[i] * r, tilt = f.tilt[i];
    const by = eyeY - ehBase - r * 0.13 - browRaise;
    const inner = -side;                                  // direction of the inner end of this brow
    const bw = rx * 1.3;
    const brow = (
      <path d={`M${cx + inner * bw},${by - tilt * r * 0.18} Q${cx},${by - r * 0.07 - Math.abs(tilt) * r * 0.02} ${cx - inner * bw},${by + tilt * r * 0.1}`}
        stroke={ink} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
    );
    if (f.eye === "closed-happy" || open < 0.18) {
      const up = f.eye === "closed-happy";
      return (
        <g key={side}>
          <path d={up ? `M${cx - rx},${eyeY + r * 0.04} Q${cx},${eyeY - r * 0.16} ${cx + rx},${eyeY + r * 0.04}`
                      : `M${cx - rx},${eyeY} Q${cx},${eyeY + r * 0.08} ${cx + rx},${eyeY}`}
            stroke={ink} strokeWidth={lw} fill="none" strokeLinecap="round" />
          {brow}
        </g>
      );
    }
    const px = cx + look[0] * rx * 0.42, py = eyeY + look[1] * ry * 0.3 + ry * 0.08;
    const lid = f.eye === "droop"
      ? `M${cx - rx * 1.3},${eyeY - ry * 1.2} L${cx + rx * 1.3},${eyeY - ry * 1.2} L${cx - inner * rx * 1.3},${eyeY - ry * 0.25} L${cx + inner * rx * 1.3},${eyeY - ry * 0.75}Z`
      : f.eye === "glare"
        ? `M${cx - rx * 1.3},${eyeY - ry * 1.3} L${cx + rx * 1.3},${eyeY - ry * 1.3} L${cx + inner * rx * 1.3},${eyeY - ry * 0.15} L${cx - inner * rx * 1.3},${eyeY - ry * 0.9}Z`
        : null;
    return (
      <g key={side}>
        <clipPath id={id}><path d={E(cx, eyeY, rx, ry)} /></clipPath>
        <path d={E(cx, eyeY, rx, ry)} fill="#fffdf7" />
        <g clipPath={`url(#${id})`}>
          <circle cx={px} cy={py} r={ew * 0.68} fill="#3b2418" />
          <circle cx={px} cy={py} r={ew * 0.42} fill={ink} />
          <circle cx={px + ew * 0.22} cy={py - ew * 0.26} r={ew * 0.2} fill="#ffffff" />
          {lid && <path d={lid} fill={skin} />}
        </g>
        <path d={`M${cx - rx * 1.05},${eyeY - ry * 0.15} Q${cx},${eyeY - ry * 1.32} ${cx + rx * 1.05},${eyeY - ry * 0.15}`}
          stroke={ink} strokeWidth={lw} fill="none" strokeLinecap="round" />
        {lashes && <path d={`M${cx - inner * rx * 1.02},${eyeY - ry * 0.35} l${-inner * r * 0.09},${-r * 0.06}`} stroke={ink} strokeWidth={lw * 0.8} strokeLinecap="round" />}
        {brow}
      </g>
    );
  };

  const m = mouthShape(viseme ?? f.mouth, r * 0.3);
  const mx = shift * 1.08, my = r * 0.56;
  const mid = `m${Math.round(mx * 10)}${Math.round(r)}`;
  return (
    <g>
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={shift + s * r * 0.55 * (1 - 0.25 * Math.abs(turn))} cy={r * 0.4} rx={r * 0.16} ry={r * 0.09} fill="#ff6f7d" opacity={f.blush} />
      ))}
      {eye(-1, 0)}{eye(1, 1)}
      <path d={`M${shift * 1.12 + r * 0.02},${r * 0.24} q${r * 0.07 + turn * r * 0.05},${r * 0.14} ${-r * 0.05 + turn * r * 0.08},${r * 0.17}`}
        stroke={ink} strokeOpacity={0.45} strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
      <g transform={`translate(${mx},${my})`}>
        {m.open ? (
          <>
            <clipPath id={mid}><path d={m.d} /></clipPath>
            <path d={m.d} fill="#4a1622" />
            <g clipPath={`url(#${mid})`}>
              {m.teeth && <rect x={-r} y={-r} width={r * 2} height={r + r * 0.05} fill="#ffffff" />}
              {m.tongue && <ellipse cx={0} cy={r * 0.36} rx={r * 0.2} ry={r * 0.14} fill="#e2606f" />}
            </g>
            <path d={m.d} fill="none" stroke={lip} strokeWidth={r * 0.045} strokeLinejoin="round" />
          </>
        ) : (
          <path d={m.d} fill="none" stroke={lip} strokeWidth={r * 0.075} strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};
