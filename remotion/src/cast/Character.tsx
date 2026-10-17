/**
 * One cast member, drawn from a Look and posed by a Pose: layered SVG in the character's own
 * coordinates (feet at 0,0), placed in a scene by x, y and scale.
 *
 * Limbs are tapered capsules, the torso has shoulders and a waist, the head has a jaw. Draw order
 * follows the turn: the far arm goes behind the torso, so a ¾ view reads as a body with depth.
 */
import React from "react";
import { BODY, chain, type Chain, type Hand, type P, type Pose, shoulder } from "./rig";
import { Face, type Expression, type Viseme } from "./face";
import type { Look } from "./cast";

export interface CharacterProps {
  look: Look;
  pose: Pose;
  expression?: Expression;
  viseme?: Viseme | null;
  gaze?: [number, number];
  blink?: number;
  x: number;
  y: number;
  scale?: number;
  holdL?: (x: number, y: number) => React.ReactNode;   // drawn in character space at the hand
  holdR?: (x: number, y: number) => React.ReactNode;
  shadow?: boolean;
  id?: string;                                          // unique per character on screen (clip ids)
}

/** A limb segment that tapers from width wa at a to wb at b, with round ends. */
function capsule(a: P, b: P, wa: number, wb: number): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ha = wa / 2, hb = wb / 2;
  const f = (n: number) => n.toFixed(1);
  // the tapered body, then a disc at each end; overlapping subpaths fill as one shape
  const disc = (c: P, rr: number) => `M${f(c[0] - rr)},${f(c[1])} a${f(rr)},${f(rr)} 0 1,0 ${f(rr * 2)},0 a${f(rr)},${f(rr)} 0 1,0 ${f(-rr * 2)},0Z`;
  return `M${f(a[0] + nx * ha)},${f(a[1] + ny * ha)} L${f(b[0] + nx * hb)},${f(b[1] + ny * hb)}
    L${f(b[0] - nx * hb)},${f(b[1] - ny * hb)} L${f(a[0] - nx * ha)},${f(a[1] - ny * ha)}Z ${disc(a, ha)} ${disc(b, hb)}`;
}

const lerpP = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const HandShape: React.FC<{ at: P; angle: number; kind: Hand; skin: string; shade: string; mirror: number }> = ({ at, angle, kind, skin, shade, mirror }) => {
  const deg = (angle * 180) / Math.PI - 90;
  const r = 15;
  return (
    <g transform={`translate(${at[0]},${at[1]}) rotate(${deg}) scale(${mirror},1)`}>
      {kind === "point" && <rect x={-4.5} y={8} width={9} height={28} rx={4.5} fill={skin} />}
      {kind === "wave" && [-1.5, -0.5, 0.5, 1.5].map((k) => (
        <rect key={k} x={k * 8 - 3.5} y={10} width={7} height={18 - Math.abs(k) * 2} rx={3.5} fill={skin} transform={`rotate(${k * 10})`} />
      ))}
      <ellipse cx={0} cy={6} rx={r} ry={kind === "fist" || kind === "thumb" ? r * 0.92 : r * 1.12} fill={skin} />
      {kind === "thumb"
        ? <rect x={-4.5} y={-22} width={9} height={22} rx={4.5} fill={skin} />
        : kind !== "fist" && <ellipse cx={r * 0.9} cy={0} rx={5.5} ry={10} fill={skin} transform={`rotate(-28 ${r * 0.9} 0)`} />}
      <ellipse cx={-3} cy={12} rx={r * 0.55} ry={r * 0.38} fill={shade} opacity={0.3} />
    </g>
  );
};

function headPath(r: number, t: number): string {
  const c = t * r * 0.12;   // the chin follows the turn a little
  return `M${-0.95 * r},${-0.12 * r} C${-0.99 * r},${-1.03 * r} ${0.99 * r},${-1.03 * r} ${0.95 * r},${-0.12 * r}
    C${0.93 * r},${0.52 * r} ${0.5 * r + c},${0.98 * r} ${c},${1.0 * r} C${-0.5 * r + c},${0.98 * r} ${-0.93 * r},${0.52 * r} ${-0.95 * r},${-0.12 * r}Z`;
}

function hair(style: Look["hairStyle"], r: number, s: number, color: string): [React.ReactNode, React.ReactNode] {
  switch (style) {
    case "side-part":   // a swept-up quiff with short sides
      return [
        <ellipse cx={s * 0.15} cy={-r * 0.22} rx={r * 1.03} ry={r * 0.9} fill={color} />,
        <g fill={color}>
          <path d={`M${-0.97 * r + s},${0.02 * r} C${-1.02 * r + s},${-0.7 * r} ${-0.75 * r + s},${-1.12 * r} ${-0.15 * r + s},${-1.24 * r}
            C${0.45 * r + s},${-1.34 * r} ${1.02 * r + s},${-1.05 * r} ${0.98 * r + s},${-0.05 * r}
            C${0.88 * r + s},${-0.5 * r} ${0.62 * r + s},${-0.68 * r} ${0.2 * r + s},${-0.66 * r}
            C${-0.05 * r + s},${-0.72 * r} ${-0.35 * r + s},${-0.6 * r} ${-0.6 * r + s},${-0.55 * r}
            C${-0.8 * r + s},${-0.45 * r} ${-0.9 * r + s},${-0.25 * r} ${-0.97 * r + s},${0.02 * r}Z`} />
          <path d={`M${-0.2 * r + s},${-1.2 * r} C${0.15 * r + s},${-1.0 * r} ${0.35 * r + s},${-0.85 * r} ${0.4 * r + s},${-0.68 * r}`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={r * 0.06} fill="none" />
          {[-1, 1].map((k) => <rect key={k} x={k * 0.95 * r - r * 0.07 + s * 0.5} y={-0.25 * r} width={r * 0.14} height={r * 0.42} rx={r * 0.06} />)}
        </g>,
      ];
    case "braid":
      return [
        <path d={`M${-1.03 * r},${0.35 * r} C${-1.16 * r},${-1.18 * r} ${1.16 * r},${-1.18 * r} ${1.03 * r},${0.35 * r} L${0.8 * r},${0.6 * r} L${-0.8 * r},${0.6 * r}Z`} fill={color} />,
        <g fill={color}>
          <path d={`M${-0.98 * r + s},${0.1 * r} C${-1.02 * r + s},${-0.9 * r} ${-0.25 * r + s},${-1.1 * r} ${0.05 * r + s},${-0.84 * r}
            C${0.35 * r + s},${-1.1 * r} ${1.02 * r + s},${-0.9 * r} ${0.98 * r + s},${0.1 * r}
            C${0.85 * r + s},${-0.38 * r} ${0.45 * r + s},${-0.62 * r} ${0.06 * r + s},${-0.64 * r}
            C${-0.42 * r + s},${-0.66 * r} ${-0.86 * r + s},${-0.45 * r} ${-0.98 * r + s},${0.1 * r}Z`} />
          <path d={`M${0.06 * r + s},${-0.84 * r} L${0.06 * r + s},${-0.66 * r}`} stroke="#000" strokeOpacity={0.25} strokeWidth={r * 0.04} />
        </g>,
      ];
    case "receding":
      return [
        <path d={`M${-1.04 * r},${0.28 * r} C${-1.12 * r},${-0.5 * r} ${-0.9 * r},${-0.75 * r} ${-0.55 * r},${-0.84 * r} L${0.55 * r},${-0.84 * r} C${0.9 * r},${-0.75 * r} ${1.12 * r},${-0.5 * r} ${1.04 * r},${0.28 * r}Z`} fill={color} />,
        <g fill={color}>
          {[-1, 1].map((k) => (
            <path key={k} d={`M${k * 0.98 * r + s * 0.6},${0.15 * r} C${k * 1.1 * r + s * 0.6},${-0.3 * r} ${k * 0.95 * r + s * 0.6},${-0.65 * r} ${k * 0.6 * r + s * 0.6},${-0.74 * r}
              C${k * 0.82 * r + s * 0.6},${-0.45 * r} ${k * 0.86 * r + s * 0.6},${-0.15 * r} ${k * 0.8 * r + s * 0.6},${0.15 * r}Z`} />
          ))}
        </g>,
      ];
    case "bun":
      return [
        <g fill={color}><circle cx={s * 0.3} cy={-r * 1.05} r={r * 0.42} /><ellipse cx={0} cy={-r * 0.2} rx={r * 1.04} ry={r * 0.95} /></g>,
        <path fill={color} d={`M${-0.98 * r + s},0 C${-r + s},${-0.95 * r} ${r + s},${-0.95 * r} ${0.98 * r + s},0 C${0.7 * r + s},${-0.55 * r} ${-0.7 * r + s},${-0.55 * r} ${-0.98 * r + s},0Z`} />,
      ];
    case "curly":
      return [
        <g fill={color}>{Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return <circle key={i} cx={Math.cos(a) * r * 0.92} cy={-r * 0.15 + Math.sin(a) * r * 0.9} r={r * 0.36} />; })}</g>,
        <g fill={color}>{Array.from({ length: 5 }, (_, i) => <circle key={i} cx={s + (i - 2) * r * 0.38} cy={-r * 0.72 + Math.abs(i - 2) * r * 0.1} r={r * 0.28} />)}</g>,
      ];
  }
}

export const Character: React.FC<CharacterProps> = ({
  look, pose, expression = "neutral", viseme, gaze = [0, 0], blink = 0, x, y, scale = 1, holdL, holdR, shadow = true, id = "c",
}) => {
  const r = BODY.headR;
  const t = pose.turn;
  const narrow = 1 - 0.16 * Math.abs(t);
  const lean = pose.lean * 160;
  const hipY = BODY.hipY + pose.bob * 0.4;
  const hipsX = BODY.hipX * (1 - 0.55 * Math.abs(t));
  const sl = shoulder("L", pose), sr = shoulder("R", pose);
  const armL = chain(sl[0], sl[1], pose.armL[0], BODY.upperArm, pose.armL[1], BODY.forearm);
  const armR = chain(sr[0], sr[1], pose.armR[0], BODY.upperArm, pose.armR[1], BODY.forearm);
  const legL = chain(hipsX + lean * 0.15, hipY, pose.legL[0], BODY.thigh, pose.legL[1], BODY.shin);
  const legR = chain(-hipsX + lean * 0.15, hipY, pose.legR[0], BODY.thigh, pose.legR[1], BODY.shin);
  const headX = lean * 1.1 + t * 8, headY = BODY.headY + pose.bob;
  const longSleeve = look.top === "kurti" || look.top === "kurta-vest" || look.top === "hoodie";
  const longTop = look.top === "kurti" || look.top === "kurta-vest";
  const far: "L" | "R" | null = t > 0.15 ? "L" : t < -0.15 ? "R" : null;
  const sh = t * r * 0.28;   // face feature shift for the turn

  const arm = (side: "L" | "R") => {
    const p: Chain = side === "L" ? armL : armR;
    const handAngle = Math.atan2(p[2][1] - p[1][1], p[2][0] - p[1][0]);
    const hold = side === "L" ? holdL : holdR;
    const dim = side === far ? { filter: "brightness(0.88)" } : undefined;
    const wrist = lerpP(p[1], p[2], 0.86);
    return (
      <g key={side} style={dim}>
        <path d={capsule(p[0], p[1], 31, 26)} fill={longSleeve ? look.topColor : look.skin} />
        <path d={capsule(p[1], wrist, 26, 21)} fill={longSleeve ? look.topColor : look.skin} />
        {longSleeve && <path d={capsule(lerpP(p[1], p[2], 0.78), wrist, 25, 23)} fill={look.topShade} />}
        {!longSleeve && <path d={capsule(p[0], lerpP(p[0], p[1], 0.62), 40, 35)} fill={look.topColor} />}
        {side === "L" && look.watch && <path d={capsule(lerpP(p[1], p[2], 0.8), lerpP(p[1], p[2], 0.9), 24, 24)} fill="#2a2a33" />}
        <HandShape at={p[2]} angle={handAngle} kind={side === "L" ? pose.handL : pose.handR} skin={look.skin} shade={look.skinShade} mirror={side === "L" ? 1 : -1} />
        {hold?.(p[2][0], p[2][1])}
      </g>
    );
  };

  const legs = [legR, legL].map((p, i) => {
    const dir = Math.abs(t) > 0.3 ? Math.sign(t) : (i ? 1 : -1) * 0.5;
    const [, knee, ankle] = p;
    return (
      <g key={i}>
        <path d={capsule(p[0], knee, 44, 37)} fill={look.bottom} />
        <path d={capsule(knee, ankle, 37, 31)} fill={look.bottom} />
        <path d={`M${ankle[0] - 16 * Math.sign(dir || 1)},${ankle[1] - 18} Q${ankle[0] + dir * 34},${ankle[1] - 22} ${ankle[0] + dir * 36},${ankle[1] - 2}
          L${ankle[0] - 18 * Math.sign(dir || 1)},${ankle[1] - 2}Z`} fill={look.shoes} stroke={look.shoes} strokeWidth={8} strokeLinejoin="round" />
      </g>
    );
  });

  const top = BODY.shoulderY - 16 + pose.bob;
  const w = BODY.shoulderX * narrow + 14;
  const hw = BODY.hipX * (1 - 0.3 * Math.abs(t)) + 30 + (longTop ? 16 : 0);
  const bottom = longTop ? hipY + 92 : hipY + 14;
  const L = lean;
  const torso = `M${-22 + L},${top} L${22 + L},${top}
    C${w * 0.7 + L},${top} ${w + L},${top + 4} ${w + L},${top + 34}
    C${w - 2 + L},${top + 70} ${w * 0.84 + L * 0.6},${hipY - 40} ${w * 0.84 + L * 0.4},${hipY - 20}
    L${hw},${bottom} Q0,${bottom + 10} ${-hw},${bottom}
    L${-w * 0.84 + L * 0.4},${hipY - 20}
    C${-w * 0.84 + L * 0.6},${hipY - 40} ${-w + 2 + L},${top + 70} ${-w + L},${top + 34}
    C${-w + L},${top + 4} ${-w * 0.7 + L},${top} ${-22 + L},${top}Z`;
  const cx = L * 0.6 + t * 22;
  const clip = `${id}-torso`;

  return (
    <g transform={`translate(${x},${y}) scale(${scale * look.scale})`}>
      {shadow && <ellipse cx={0} cy={6} rx={90} ry={15} fill="#000" opacity={0.22} />}
      {far === "L" && arm("L")}
      {far === "R" && arm("R")}
      {legs}
      <path d={torso} fill={look.topColor} />
      <clipPath id={clip}><path d={torso} /></clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={cx + w * 0.45} y={top - 10} width={w * 1.4} height={500} fill={look.topShade} opacity={0.5} />
        <rect x={-w * 1.5} y={top - 10} width={w * 3} height={22} fill={look.topShade} opacity={0.35} />
        {look.top === "shirt" && (
          <>
            <line x1={cx} y1={top + 26} x2={cx} y2={bottom + 10} stroke={look.topShade} strokeWidth={4} />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={cx + 6} cy={top + 52 + k * 34} r={4} fill={look.accent} />)}
            <path d={`M${cx - w * 0.66},${top + 52} h30 v28 q-15,7 -30,0Z`} fill={look.topShade} />
            <rect x={-w * 1.5} y={bottom - 12} width={w * 3} height={30} fill={look.topShade} opacity={0.4} />
          </>
        )}
        {look.top === "kurti" && (
          <>
            <path d={`M${cx - 28},${top - 2} Q${cx},${top + 60} ${cx + 28},${top - 2}Z`} fill={look.skin} />
            <path d={`M${cx - 30},${top + 2} Q${cx},${top + 66} ${cx + 30},${top + 2}`} stroke={look.accent} strokeWidth={6} fill="none" />
            {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={-hw + 12 + k * ((2 * hw - 24) / 5)} cy={bottom - 16} r={5} fill={look.accent} />)}
            <path d={`M${-hw + 4},${bottom - 30} Q0,${bottom - 20} ${hw - 4},${bottom - 30}`} stroke={look.accent} strokeWidth={3} fill="none" />
          </>
        )}
        {look.top === "kurta-vest" && (
          <>
            <path d={`M${-w + L},${top + 12} L${cx - 20},${top} L${cx - 6},${hipY + 36} Q${-hw * 0.5},${hipY + 44} ${-hw - 4},${hipY + 30}Z`} fill={look.accent} />
            <path d={`M${w + L},${top + 12} L${cx + 20},${top} L${cx + 6},${hipY + 36} Q${hw * 0.5},${hipY + 44} ${hw + 4},${hipY + 30}Z`} fill={look.accent} />
            {[0, 1, 2].map((k) => <circle key={k} cx={cx + 13} cy={top + 58 + k * 36} r={4.5} fill="#e8c06a" />)}
            <rect x={cx - w * 0.62} y={top + 74} width={24} height={6} rx={3} fill="#e8c06a" />
          </>
        )}
      </g>
      {look.top === "shirt" && (
        <path d={`M${cx - 30},${top - 3} L${cx},${top + 28} L${cx + 30},${top - 3} L${cx + 18},${top + 32} L${cx},${top + 20} L${cx - 18},${top + 32}Z`} fill={look.accent} />
      )}
      {look.lanyard && (
        <g>
          <path d={`M${cx - 18},${top + 4} L${cx - 4},${top + 112} M${cx + 18},${top + 4} L${cx + 4},${top + 112}`} stroke={look.lanyard} strokeWidth={6} />
          <rect x={cx - 20} y={top + 108} width={40} height={52} rx={6} fill="#ffffff" />
          <rect x={cx - 13} y={top + 116} width={26} height={20} rx={3} fill={look.lanyard} opacity={0.8} />
          <rect x={cx - 13} y={top + 142} width={26} height={5} rx={2} fill="#9aa4b8" />
        </g>
      )}
      {look.dupatta && (
        <g fill={look.dupatta}>
          <path d={`M${-w * 0.78 + L},${top - 2} Q${cx},${top + 62} ${w * 0.78 + L},${top - 2} L${w * 0.82 + L},${top + 18} Q${cx},${top + 86} ${-w * 0.82 + L},${top + 18}Z`} />
          <path d={`M${w * 0.6 + L},${top + 4} L${w * 0.95 + L},${top + 10} L${w * 0.88 + L},${hipY + 40} L${w * 0.58 + L},${hipY + 30}Z`} />
          <path d={`M${w * 0.6 + L},${hipY + 30} L${w * 0.88 + L},${hipY + 40}`} stroke="#e8c06a" strokeWidth={5} />
        </g>
      )}
      {far !== "L" && arm("L")}
      {far !== "R" && arm("R")}
      <path d={`M${headX - 21},${BODY.neckY - 30 + pose.bob} L${headX + 21},${BODY.neckY - 30 + pose.bob} L${headX + 19},${top + 6} Q${headX},${top + 18} ${headX - 19},${top + 6}Z`} fill={look.skinShade} />
      <g transform={`translate(${headX},${headY}) rotate(${(pose.headTilt * 180) / Math.PI})`}>
        {hair(look.hairStyle, r, sh, look.hair)[0]}
        {[-1, 1].map((k) => {
          if (Math.abs(t) > 0.45 && k === Math.sign(t)) return null;   // that ear has turned behind the head
          const ex = k * r * 0.95 + t * r * 0.35;
          return (
            <g key={k}>
              <ellipse cx={ex} cy={r * 0.14} rx={r * 0.16} ry={r * 0.22} fill={look.skin} />
              <ellipse cx={ex} cy={r * 0.16} rx={r * 0.07} ry={r * 0.11} fill={look.skinShade} />
              {look.earrings && <circle cx={ex} cy={r * 0.42} r={r * 0.085} fill="#e8c06a" stroke="#b8901f" strokeWidth={2} />}
            </g>
          );
        })}
        <path d={headPath(r, t)} fill={look.skin} />
        <clipPath id={`${id}-face`}><path d={headPath(r, t)} /></clipPath>
        <g clipPath={`url(#${id}-face)`}>
          <ellipse cx={sh * 0.5} cy={-r * 0.62} rx={r * 1.1} ry={r * 0.3} fill={look.skinShade} opacity={0.3} />
          <ellipse cx={r * 0.95 - t * r * 0.6} cy={r * 0.25} rx={r * 0.32} ry={r * 0.95} fill={look.skinShade} opacity={0.22} />
          {look.hairStyle === "receding" && <ellipse cx={-r * 0.32} cy={-r * 0.78} rx={r * 0.3} ry={r * 0.11} fill="#ffffff" opacity={0.3} />}
        </g>
        {look.bindi && <circle cx={sh} cy={-r * 0.33} r={r * 0.05} fill="#c2213a" />}
        <Face expression={expression} viseme={viseme} turn={t} look={gaze} blink={blink} skin={look.skin} ink={look.ink} lip={look.lip} r={r} lashes={look.lashes} />
        {look.moustache && (
          <path d={`M${sh - r * 0.3},${r * 0.5} Q${sh},${r * 0.32} ${sh + r * 0.3},${r * 0.5} Q${sh},${r * 0.42} ${sh - r * 0.3},${r * 0.5}Z`}
            fill={look.hair} stroke={look.hair} strokeWidth={7} strokeLinejoin="round" />
        )}
        {hair(look.hairStyle, r, sh, look.hair)[1]}
        {look.glasses && <Glasses kind={look.glasses} r={r} t={t} />}
      </g>
      {look.hairStyle === "braid" && (
        <g fill={look.hair} transform={`translate(${headX},${headY})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx={r * 0.72 + Math.sin(i * 0.9) * 4 + i * 2.2} cy={r * 0.55 + i * r * 0.29} rx={r * 0.19 - i * 0.7} ry={r * 0.18} />
          ))}
          <circle cx={r * 0.9} cy={r * 2.85} r={r * 0.08} fill="#c2432f" />
        </g>
      )}
    </g>
  );
};

const Glasses: React.FC<{ kind: "rect" | "round"; r: number; t: number }> = ({ kind, r, t }) => {
  const shift = t * r * 0.28, gap = r * 0.38, y = r * 0.12;
  const lens = (side: number) => {
    const far = side === Math.sign(t) ? Math.abs(t) : 0;
    const cx = shift + side * gap * (1 - 0.28 * far);
    const sx = 1 - 0.4 * far;
    return kind === "round"
      ? <ellipse key={side} cx={cx} cy={y} rx={r * 0.29 * sx} ry={r * 0.29} />
      : <rect key={side} x={cx - r * 0.3 * sx} y={y - r * 0.23} width={r * 0.6 * sx} height={r * 0.46} rx={r * 0.1} />;
  };
  return (
    <g fill="#ffffff" fillOpacity={0.1} stroke="#2a2226" strokeWidth={r * 0.06}>
      {lens(-1)}{lens(1)}
      <path d={`M${shift - gap * 0.3},${y - r * 0.04} Q${shift},${y - r * 0.12} ${shift + gap * 0.3},${y - r * 0.04}`} fill="none" />
    </g>
  );
};
