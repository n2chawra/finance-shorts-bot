/**
 * The cast, flat (owner, 2026-11-13): a big round head with a drawn face, a thin body in clothes, arms
 * that pose by angle. Rohan, Priya and Sharma keep their colours (cast/cast.ts); a real person is our
 * body with their real head (`photo`, a bobblehead; they never speak).
 *
 *   <Char x={540} y={1900} s={420} who="rohan" face="shock" armR={[25, 199]} />
 *
 * (x, y) is where the feet are; `s` is pixels per body unit (the figure is about 2.8 units tall: s=420
 * draws a person about 1180 px tall, s=160 a small one in a wide shot). Arms are [upper, fore] angles in
 * degrees: 0 hangs down, 90 points out sideways, 180 points up; negative swings across the body.
 * `sit` seats them (hips on a seat 1 unit above the feet line), `back` turns them away from the camera.
 */
import React from "react";
import { CAST } from "../cast/cast";
import { PhotoHead } from "../studio/photo";
import { Ball, INK, Limb, shade } from "./kit";

export type FaceKind = "neutral" | "happy" | "grin" | "smirk" | "shock" | "worried" | "angry" | "sad";
export type Hair = "spiky" | "side" | "cap" | "beanie" | "bun" | "bald" | "long";
export type Arm = [number, number];

export interface CharProps {
  x: number; y: number; s: number;
  who?: "rohan" | "priya" | "sharma";
  skin?: string; top?: string; pants?: string; shoes?: string; accent?: string;
  hair?: Hair; hairColor?: string; hat?: string;
  outfit?: "tee" | "shirt" | "suit" | "kurta" | "dress";
  face?: FaceKind;
  /** where the eyes look: [-1..1 left/right, -1..1 up/down] */
  look?: [number, number];
  armL?: Arm; armR?: Arm;
  sit?: boolean; tilt?: number; back?: boolean;
  phone?: "L" | "R"; sweat?: boolean; glasses?: boolean; moustache?: boolean;
  /** 0..1: how open the mouth is (a speaking cast member; drive it from the words) */
  talk?: number;
  blink?: boolean;
  /** a coloured light falling on the face (a TV's glow, a fire), screen-blended */
  light?: string;
  /** a real person's cut-out head (python -m generator.images): `photo="buffett"` */
  photo?: string;
  holdR?: (hand: [number, number]) => React.ReactNode;
  holdL?: (hand: [number, number]) => React.ReactNode;
}

const PRESET: Record<string, Partial<CharProps>> = {
  rohan: { hair: "side", outfit: "shirt" },
  priya: { hair: "bun", outfit: "kurta" },
  sharma: { hair: "bald", outfit: "kurta", glasses: true, moustache: true },
};

function preset(who?: string): Partial<CharProps> {
  if (!who) return {};
  const c = CAST[who];
  if (!c) return {};
  const l = c.look;
  return { skin: l.skin, top: l.topColor, pants: l.bottom, shoes: l.shoes, accent: l.accent, hairColor: l.hair, ...PRESET[who] };
}

// ------------------------------------------------------------------ the face, in head units (radius 0.48, y down)

const EX = 0.135, EY = -0.03;
const DARK = "#4a1626", TONGUE = "#ef5f78";

const brow = (x: number, y: number, tilt: number, len = 0.12, w = 0.03, arch = 0.015) => {
  const dx = Math.cos(tilt) * len * 0.5, dy = Math.sin(tilt) * len * 0.5;
  return <path d={`M ${x - dx} ${y + dy} Q ${x} ${y - arch} ${x + dx} ${y - dy}`} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />;
};

const Face: React.FC<{ kind: FaceKind; skin: string; look: [number, number]; talk: number; blink: boolean; id: string }> = ({ kind, skin, look, talk, blink, id }) => {
  const lx = look[0] * 0.025, ly = look[1] * 0.02;
  const eye = (x: number, rx = 0.05, ry = 0.068) =>
    blink ? <line x1={x - rx} y1={EY} x2={x + rx} y2={EY} stroke={INK} strokeWidth={0.024} strokeLinecap="round" />
      : (
        <g>
          <ellipse cx={x + lx} cy={EY + ly} rx={rx} ry={ry} fill={INK} />
          <circle cx={x + lx + rx * 0.35} cy={EY + ly - ry * 0.4} r={rx * 0.32} fill="#ffffff" />
        </g>
      );
  const blush = (
    <g fill="rgba(255,110,120,0.38)">
      <ellipse cx={-0.21} cy={0.07} rx={0.055} ry={0.03} />
      <ellipse cx={0.21} cy={0.07} rx={0.055} ry={0.03} />
    </g>
  );
  const talking = talk > 0.05 ? (
    <g>
      <ellipse cx={0} cy={0.15} rx={0.07} ry={0.015 + 0.055 * talk} fill={DARK} stroke={INK} strokeWidth={0.014} />
      <ellipse cx={0} cy={0.15 + 0.035 * talk} rx={0.04} ry={0.012 + 0.018 * talk} fill={TONGUE} />
    </g>
  ) : null;

  if (kind === "grin") {
    const mouth = "M -0.15 0.085 Q 0 0.1 0.15 0.085 Q 0.13 0.27 0 0.27 Q -0.13 0.27 -0.15 0.085 Z";
    return (
      <g>
        {[-1, 1].map((s) => {
          const cx = s * EX, cy = EY + 0.025, r = 0.05;
          const a0 = 1.1 * Math.PI, a1 = 1.9 * Math.PI;
          return <path key={s} d={`M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`} stroke={INK} strokeWidth={0.032} fill="none" strokeLinecap="round" />;
        })}
        {brow(-EX, -0.14, -0.15, 0.11, 0.026, 0.02)}
        {brow(EX, -0.14, 0.15, 0.11, 0.026, 0.02)}
        <defs><clipPath id={`${id}-m`}><path d={mouth} /></clipPath></defs>
        <path d={mouth} fill={DARK} />
        <g clipPath={`url(#${id}-m)`}>
          <rect x={-0.2} y={0.06} width={0.4} height={0.07} fill="#ffffff" />
          <ellipse cx={0} cy={0.27} rx={0.085} ry={0.06} fill={TONGUE} />
        </g>
        <path d={mouth} fill="none" stroke={INK} strokeWidth={0.018} strokeLinejoin="round" />
        {blush}
      </g>
    );
  }
  if (kind === "shock") {
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 0.14} cy={EY - 0.01} rx={0.075} ry={0.09} fill="#ffffff" stroke={INK} strokeWidth={0.016} />
            {blink ? null : <circle cx={s * 0.14 + lx * 1.4} cy={EY - 0.005 + ly} r={0.026} fill={INK} />}
            <path d={`M ${s * 0.14 + 0.05 * Math.cos(0.2 * Math.PI)} ${EY + 0.05 + 0.05 * Math.sin(0.2 * Math.PI)} A 0.05 0.05 0 0 1 ${s * 0.14 + 0.05 * Math.cos(0.8 * Math.PI)} ${EY + 0.05 + 0.05 * Math.sin(0.8 * Math.PI)}`}
              stroke="rgba(29,26,43,0.45)" strokeWidth={0.01} fill="none" />
          </g>
        ))}
        {brow(-0.15, -0.19, 0.35, 0.12, 0.028, 0.03)}
        {brow(0.15, -0.19, -0.35, 0.12, 0.028, 0.03)}
        {talking ?? <ellipse cx={0} cy={0.17} rx={0.045} ry={0.065} fill={DARK} stroke={INK} strokeWidth={0.014} />}
      </g>
    );
  }
  if (kind === "smirk") {
    return (
      <g>
        {eye(-EX)}
        {eye(EX)}
        {blink ? null : [-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * EX + lx} ${EY + ly}) rotate(${s * 6.9})`}>
            <rect x={-0.08} y={-0.1} width={0.16} height={0.098} fill={skin} />
            <path d="M -0.068 -0.002 Q 0 -0.012 0.068 -0.002" stroke={INK} strokeWidth={0.024} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {brow(-EX, -0.115, -0.08, 0.13, 0.03, 0)}
        {brow(EX, -0.15, 0.22, 0.13, 0.03, 0.02)}
        {talking ?? (
          <g stroke={INK} strokeWidth={0.022} fill="none" strokeLinecap="round">
            <path d="M -0.07 0.15 Q 0.02 0.2 0.1 0.11" />
            <path d="M 0.095 0.1 L 0.115 0.125" />
          </g>
        )}
      </g>
    );
  }
  if (kind === "worried" || kind === "sad") {
    return (
      <g>
        {eye(-EX)}
        {eye(EX)}
        {brow(-EX, -0.13, 0.35, 0.12, 0.028, -0.005)}
        {brow(EX, -0.13, -0.35, 0.12, 0.028, -0.005)}
        {talking ?? (kind === "sad"
          ? <path d="M -0.08 0.18 Q 0 0.12 0.08 0.18" stroke={INK} strokeWidth={0.02} fill="none" strokeLinecap="round" />
          : <path d="M -0.08 0.17 C -0.04 0.13 0 0.2 0.04 0.15 Q 0.06 0.13 0.08 0.16" stroke={INK} strokeWidth={0.02} fill="none" strokeLinecap="round" />)}
      </g>
    );
  }
  if (kind === "angry") {
    return (
      <g>
        {eye(-EX, 0.05, 0.055)}
        {eye(EX, 0.05, 0.055)}
        {brow(-EX, -0.11, -0.4, 0.13, 0.034, 0)}
        {brow(EX, -0.11, 0.4, 0.13, 0.034, 0)}
        {talking ?? <path d="M -0.08 0.17 Q 0 0.13 0.08 0.17" stroke={INK} strokeWidth={0.022} fill="none" strokeLinecap="round" />}
      </g>
    );
  }
  // neutral / happy
  const happyMouth = "M -0.09 0.1 Q 0 0.12 0.09 0.1 Q 0.07 0.21 0 0.21 Q -0.07 0.21 -0.09 0.1 Z";
  return (
    <g>
      {eye(-EX)}
      {eye(EX)}
      {brow(-EX, -0.13, -0.05, 0.11, 0.026, 0.012)}
      {brow(EX, -0.13, 0.05, 0.11, 0.026, 0.012)}
      {talking ?? (kind === "happy" ? (
        <g>
          <defs><clipPath id={`${id}-h`}><path d={happyMouth} /></clipPath></defs>
          <path d={happyMouth} fill={DARK} />
          <ellipse cx={0} cy={0.21} rx={0.06} ry={0.04} fill={TONGUE} clipPath={`url(#${id}-h)`} />
          <path d={happyMouth} fill="none" stroke={INK} strokeWidth={0.014} />
        </g>
      ) : <path d="M -0.06 0.14 Q 0 0.16 0.06 0.14" stroke={INK} strokeWidth={0.02} fill="none" strokeLinecap="round" />)}
      {kind === "happy" ? blush : null}
    </g>
  );
};

// ------------------------------------------------------------------ the body

export const Char: React.FC<CharProps> = (props) => {
  const P = { ...preset(props.who), ...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) } as CharProps;
  const {
    x, y, s, skin = "#c98652", top = "#1fa39a", pants = "#2c3550", shoes = INK, accent = "#e0352b",
    hair = "spiky", hairColor = "#2f2836", hat = "#e0352b", outfit = "tee", face = "neutral", look = [0, 0],
    armL = [12, 8], armR = [12, 8], sit, tilt = 0, back, phone, sweat, glasses, moustache, talk = 0, blink = false,
    light, photo, holdR, holdL,
  } = P;
  const pt = (ux: number, uy: number): [number, number] => [x + ux * s, y - uy * s];
  const sw = Math.max(3, s * 0.022);
  const arm = (side: 1 | -1, [a1, a2]: Arm) => {
    const sh = pt(0.2 * side, 1.66);
    const d = (deg: number): [number, number] => [Math.sin((deg * Math.PI) / 180) * side, Math.cos((deg * Math.PI) / 180)];
    const e: [number, number] = [sh[0] + d(a1)[0] * 0.4 * s, sh[1] + d(a1)[1] * 0.4 * s];
    const h: [number, number] = [e[0] + d(a2)[0] * 0.38 * s, e[1] + d(a2)[1] * 0.38 * s];
    return { sh, e, h };
  };
  const L = arm(-1, armL);
  const R = arm(1, armR);
  const sleeve = outfit === "tee" ? skin : top;
  const head = pt(0, 2.3);
  const hr = 0.48 * s;
  const id = `fc-${Math.round(x)}-${Math.round(y)}-${Math.round(s)}`;
  const H2 = (lx: number, ly: number) => `${head[0] + lx * hr},${head[1] - ly * hr}`;
  const arc = (r: number, a0: number, a1: number, n = 18) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      return H2(Math.cos(a) * r, Math.sin(a) * r);
    }).join(" ");

  const armDraw = (j: { sh: [number, number]; e: [number, number]; h: [number, number] }) => (
    <g>
      <Limb a={j.sh} b={j.e} w={0.11 * s} color={top} sw={sw} />
      <Limb a={j.e} b={j.h} w={0.09 * s} color={sleeve} sw={sw} />
      <Ball x={j.h[0]} y={j.h[1]} r={0.07 * s} fill={skin} sw={sw} />
    </g>
  );

  const hairDraw = () => {
    if (hair === "bald" || photo) {
      return hair === "bald" && !photo
        ? <path d={`M ${H2(-0.98, 0.15)} Q ${H2(-1.05, 0.55)} ${H2(-0.8, 0.62)}`} stroke={hairColor === "#2f2836" ? "#d9d6d0" : hairColor} strokeWidth={0.14 * hr} fill="none" strokeLinecap="round" />
        : null;
    }
    if (back) return <polygon points={arc(1.05, -15, 195, 30)} fill={hairColor} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
    if (hair === "cap" || hair === "beanie") {
      const dome = `${arc(1.07, 178, 2, 24)} ${H2(1.02, 0.28)} ${H2(-1.02, 0.28)}`;
      return (
        <g>
          <polygon points={dome} fill={hat} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          {hair === "cap"
            ? <ellipse cx={head[0] + 0.45 * hr} cy={head[1] - 0.28 * hr} rx={0.75 * hr} ry={0.13 * hr} fill={shade(hat, -0.15)} stroke={INK} strokeWidth={sw} />
            : <rect x={head[0] - 1.06 * hr} y={head[1] - 0.48 * hr} width={2.12 * hr} height={0.26 * hr} rx={0.1 * hr} fill={shade(hat, -0.15)} stroke={INK} strokeWidth={sw} />}
        </g>
      );
    }
    const fringe = hair === "side"
      ? `${H2(0.98, 0.3)} ${H2(0.6, 0.55)} ${H2(0.1, 0.62)} ${H2(-0.4, 0.5)} ${H2(-0.85, 0.32)}`
      : `${H2(0.98, 0.3)} ${H2(0.7, 0.42)} ${H2(0.5, 0.36)} ${H2(0.25, 0.5)} ${H2(0.0, 0.42)} ${H2(-0.3, 0.52)} ${H2(-0.55, 0.4)} ${H2(-0.95, 0.3)}`;
    const cap = `${arc(1.04, 172, 8, 24)} ${fringe}`;
    return (
      <g>
        {hair === "long" ? <rect x={head[0] - 1.02 * hr} y={head[1] - 0.2 * hr} width={2.04 * hr} height={1.25 * hr} rx={0.3 * hr} fill={hairColor} stroke={INK} strokeWidth={sw} /> : null}
        {hair === "spiky"
          ? [115, 90, 65].map((a, i) => {
              const r0 = 0.9, r1 = 1.38;
              const a0 = ((a - 13) * Math.PI) / 180, a1 = ((a + 13) * Math.PI) / 180, am = (a * Math.PI) / 180;
              return <polygon key={i} points={`${H2(Math.cos(a0) * r0, Math.sin(a0) * r0)} ${H2(Math.cos(am) * r1, Math.sin(am) * r1)} ${H2(Math.cos(a1) * r0, Math.sin(a1) * r0)}`}
                fill={hairColor} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
            })
          : null}
        {hair === "bun" ? <Ball x={head[0]} y={head[1] - 1.05 * hr} r={0.35 * hr} fill={hairColor} sw={sw} /> : null}
        <polygon points={cap} fill={hairColor} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <polygon points={`${arc(0.98, 150, 100, 8)} ${H2(-0.2, 0.75)} ${H2(-0.6, 0.6)}`} fill={shade(hairColor, 0.12)} opacity={0.55} />
      </g>
    );
  };

  const legs = sit ? (
    <g>
      <Limb a={pt(-0.12, 1.02)} b={pt(-0.15, 0.62)} w={0.13 * s} color={pants} sw={sw} />
      <Limb a={pt(0.12, 1.02)} b={pt(0.15, 0.62)} w={0.13 * s} color={pants} sw={sw} />
      {[-1, 1].map((d) => <ellipse key={d} cx={pt(0.16 * d, 0.55)[0]} cy={pt(0.16 * d, 0.55)[1]} rx={0.13 * s} ry={0.07 * s} fill={shoes} stroke={INK} strokeWidth={sw} />)}
      {[-1, 1].map((d) => <ellipse key={`k${d}`} cx={pt(0.12 * d, 0.98)[0]} cy={pt(0.12 * d, 0.98)[1]} rx={0.12 * s} ry={0.1 * s} fill={pants} stroke={INK} strokeWidth={sw} />)}
    </g>
  ) : (
    <g>
      <Limb a={pt(-0.1, 1.02)} b={pt(-0.12, 0.1)} w={0.12 * s} color={pants} sw={sw} />
      <Limb a={pt(0.1, 1.02)} b={pt(0.12, 0.1)} w={0.12 * s} color={pants} sw={sw} />
      {[-1, 1].map((d) => <ellipse key={d} cx={pt(0.15 * d, 0.05)[0]} cy={pt(0.15 * d, 0.05)[1]} rx={0.13 * s} ry={0.07 * s} fill={shoes} stroke={INK} strokeWidth={sw} />)}
    </g>
  );
  const long = outfit === "kurta" || outfit === "dress";
  const tTop = pt(-0.22, 1.84), tBot = long ? pt(0.22, outfit === "dress" ? 0.45 : 0.7) : pt(0.22, 0.96);
  const tw = tBot[0] - tTop[0], th = tBot[1] - tTop[1];
  return (
    <g>
      <defs>
        <clipPath id={`${id}-head`}><circle cx={head[0]} cy={head[1]} r={hr} /></clipPath>
        <clipPath id={`${id}-torso`}><rect x={tTop[0]} y={tTop[1]} width={tw} height={th} rx={0.2 * s} /></clipPath>
      </defs>
      {legs}
      <rect x={tTop[0]} y={tTop[1]} width={tw} height={th} rx={0.2 * s} fill={top} />
      <g clipPath={`url(#${id}-torso)`}>
        <rect x={pt(0.08, 0)[0]} y={tTop[1]} width={0.2 * s} height={th} fill={shade(top, -0.18)} />
        {outfit === "suit" && !back ? (
          <>
            <polygon points={`${pt(-0.1, 1.84).join(",")} ${pt(0.1, 1.84).join(",")} ${pt(0, 1.52).join(",")}`} fill="#ffffff" />
            <polygon points={`${pt(-0.03, 1.72).join(",")} ${pt(0.03, 1.72).join(",")} ${pt(0.04, 1.3).join(",")} ${pt(0, 1.24).join(",")} ${pt(-0.04, 1.3).join(",")}`} fill={accent} stroke={INK} strokeWidth={sw * 0.6} />
          </>
        ) : null}
        {(outfit === "tee" || outfit === "shirt") && !back ? <path d={`M ${pt(-0.09, 1.84).join(",")} Q ${pt(0, 1.7).join(",")} ${pt(0.09, 1.84).join(",")}`} fill={skin} stroke={INK} strokeWidth={sw * 0.7} /> : null}
        {outfit === "shirt" && !back ? [1.55, 1.4, 1.25].map((u) => <circle key={u} cx={pt(0, u)[0]} cy={pt(0, u)[1]} r={0.018 * s} fill={INK} />) : null}
        {outfit === "kurta" && !back ? <line x1={pt(0, 1.8)[0]} y1={pt(0, 1.8)[1]} x2={pt(0, 1.35)[0]} y2={pt(0, 1.35)[1]} stroke={accent} strokeWidth={sw * 1.2} /> : null}
      </g>
      <rect x={tTop[0]} y={tTop[1]} width={tw} height={th} rx={0.2 * s} fill="none" stroke={INK} strokeWidth={sw} />
      {armDraw(L)}
      {armDraw(R)}
      {phone ? (() => {
        const h = phone === "R" ? R.h : L.h;
        return (
          <g transform={`rotate(${phone === "R" ? 10 : -10} ${h[0]} ${h[1]})`}>
            <rect x={h[0] - 0.09 * s} y={h[1] - 0.36 * s} width={0.18 * s} height={0.33 * s} rx={0.03 * s} fill="#23233a" stroke={INK} strokeWidth={sw} />
            <rect x={h[0] - 0.07 * s} y={h[1] - 0.33 * s} width={0.14 * s} height={0.26 * s} rx={0.02 * s} fill="#8f6bff" />
            <Ball x={h[0]} y={h[1]} r={0.07 * s} fill={skin} sw={sw} />
          </g>
        );
      })() : null}
      {holdR ? holdR(R.h) : null}
      {holdL ? holdL(L.h) : null}
      <rect x={pt(-0.06, 2.0)[0]} y={pt(0, 2.0)[1]} width={0.12 * s} height={0.2 * s} fill={skin} stroke={INK} strokeWidth={sw} />
      <g transform={`rotate(${tilt} ${head[0]} ${head[1] + hr})`}>
        {photo ? (
          <g transform={`translate(${head[0]} ${head[1]})`}><PhotoHead name={photo} r={hr * 0.75} /></g>
        ) : (
          <>
            <Ball x={head[0] - hr * 0.98} y={head[1] + hr * 0.05} r={0.13 * hr} fill={skin} sw={sw} />
            <Ball x={head[0] + hr * 0.98} y={head[1] + hr * 0.05} r={0.13 * hr} fill={skin} sw={sw} />
            <circle cx={head[0]} cy={head[1]} r={hr} fill={shade(skin, -0.16)} />
            <circle cx={head[0] - hr * 0.1} cy={head[1] - hr * 0.1} r={hr * 0.95} fill={skin} clipPath={`url(#${id}-head)`} />
            {!back ? (
              <g transform={`translate(${head[0]} ${head[1]}) scale(${hr / 0.48})`}>
                <Face kind={face} skin={skin} look={look} talk={talk} blink={blink} id={id} />
                {moustache ? <path d="M -0.1 0.1 Q 0 0.05 0.1 0.1 Q 0 0.13 -0.1 0.1 Z" fill={hairColor === "#2f2836" ? "#d9d6d0" : hairColor} stroke={INK} strokeWidth={0.012} /> : null}
                {glasses ? (
                  <g fill="none" stroke={INK} strokeWidth={0.018}>
                    <circle cx={-EX} cy={EY} r={0.085} />
                    <circle cx={EX} cy={EY} r={0.085} />
                    <line x1={-EX + 0.085} y1={EY} x2={EX - 0.085} y2={EY} />
                  </g>
                ) : null}
              </g>
            ) : null}
            {light ? <circle cx={head[0] - hr * 0.6} cy={head[1] + hr * 0.3} r={hr * 1.1} fill={light} opacity={0.35} clipPath={`url(#${id}-head)`} style={{ mixBlendMode: "screen" }} /> : null}
            <circle cx={head[0]} cy={head[1]} r={hr} fill="none" stroke={INK} strokeWidth={sw} />
            {hairDraw()}
          </>
        )}
        {sweat ? <path d={`M ${head[0] + hr * 0.82} ${head[1] - hr * 0.55} q ${hr * 0.14} ${hr * 0.25} 0 ${hr * 0.32} q ${-hr * 0.14} ${-hr * 0.07} 0 ${-hr * 0.32}`} fill="#8fd3ff" stroke={INK} strokeWidth={sw * 0.7} /> : null}
      </g>
    </g>
  );
};

/** How open a speaking character's mouth is at story frame t, from the beat's word timings (0..1). */
export function talkAt(words: { s: number; e: number }[] | undefined, voiceStart: number, t: number, fps: number): number {
  if (!words?.length) return 0;
  const sec = (t - voiceStart) / fps;
  const w = words.find((x) => sec >= x.s && sec <= x.e);
  return w ? 0.35 + 0.65 * Math.abs(Math.sin(sec * 22)) : 0;
}
