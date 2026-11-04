/**
 * Places every video can use (owner, 2026-11-04, on v-20261104-01's Neom Short: "The city props is
 * shit. What the fuck is that??" The video drew its city as one tilted glass slab). A place reads as
 * that place at a glance: a city is a skyline of different towers with rows of windows, roofs,
 * spires and antennas, not a box. Videos still draw their own things; for a city, a downtown or a
 * skyline they use these (generator/prompts/checklist.md).
 *
 *   city      a skyline of six towers. k 0..1: how much of it is built (each tower rises in turn, the
 *             unbuilt part shows as a dashed outline with a crane); state "dark": the lights are off
 *   building  one tower with windows, a door and a roof sign. k 0..1: built height
 */
import React from "react";
import { random } from "remotion";
import { Box, INK, PALETTE, type PropFC, Shadow, Shape, line, shade } from "./draw";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

interface Tower { x: number; w: number; h: number; fill: string; roof: "flat" | "spire" | "antenna" | "step" | "dome" }
// a fixed, hand-balanced skyline (x and w in shares of s, h in shares of s); the tallest in the middle
const SKYLINE: Tower[] = [
  { x: -0.78, w: 0.26, h: 0.5, fill: PALETTE.teal, roof: "flat" },
  { x: -0.52, w: 0.28, h: 0.78, fill: PALETTE.blue, roof: "antenna" },
  { x: -0.22, w: 0.3, h: 1.08, fill: PALETTE.navy, roof: "spire" },
  { x: 0.1, w: 0.26, h: 0.66, fill: PALETTE.purple, roof: "dome" },
  { x: 0.38, w: 0.3, h: 0.9, fill: PALETTE.orange, roof: "step" },
  { x: 0.7, w: 0.22, h: 0.44, fill: PALETTE.green, roof: "flat" },
];

/** One tower drawn from its ground line up: body, window grid, door, roof. */
const TowerShape: React.FC<{ tw: Tower; s: number; t: number; built: number; dark: boolean; seed: string }> = ({ tw, s, t, built, dark, seed }) => {
  const x = tw.x * s, w = tw.w * s, fullH = tw.h * s, h = fullH * built, lw = line(s);
  const cols = w > s * 0.27 ? 3 : 2, rows = Math.max(2, Math.round(tw.h * 7));
  const cw = w / (cols + 1), rh = fullH / (rows + 1.6);
  const out: React.ReactNode[] = [];
  // the unbuilt part: a dashed outline of what is planned
  if (built < 1) out.push(<rect key="plan" x={x} y={-fullH} width={w} height={fullH - h} fill="none" stroke={INK} strokeWidth={lw * 0.7} strokeDasharray={`${s * 0.03} ${s * 0.025}`} opacity={0.55} />);
  if (h > 2) {
    out.push(<Box key="body" x={x} y={-h} w={w} h={h} fill={tw.fill} s={s} r={0.04} sheen={false} />);
    // windows: only where the tower is built; some lit, twinkling slowly
    for (let r = 0; r < rows; r++) {
      const wy = -fullH + rh * (r + 1);
      if (wy < -h + rh * 0.35) continue;
      for (let c = 0; c < cols; c++) {
        const lit = !dark && random(`${seed}${r}-${c}`) > 0.35;
        const on = lit ? 0.75 + 0.25 * Math.sin(t * (0.8 + random(`${seed}f${r}${c}`)) + r + c) : 0;
        out.push(<rect key={`w${r}-${c}`} x={x + cw * (c + 1) - cw * 0.3} y={wy} width={cw * 0.6} height={rh * 0.55} rx={cw * 0.08}
          fill={lit ? PALETTE.yellow : shade(tw.fill, -0.35)} opacity={lit ? on : 0.9} stroke={INK} strokeWidth={lw * 0.35} />);
      }
    }
    if (built >= 1) {
      // a door at street level and the roof
      out.push(<rect key="door" x={x + w * 0.38} y={-rh * 0.9} width={w * 0.24} height={rh * 0.9} fill={shade(tw.fill, -0.45)} stroke={INK} strokeWidth={lw * 0.5} />);
      const top = -h, mid = x + w / 2;
      if (tw.roof === "spire") out.push(<Shape key="roof" d={`M${x + w * 0.2},${top} L${mid},${top - s * 0.22} L${x + w * 0.8},${top} Z`} fill={PALETTE.grey} s={s} />);
      if (tw.roof === "antenna") out.push(<g key="roof"><line x1={mid} y1={top} x2={mid} y2={top - s * 0.18} stroke={INK} strokeWidth={lw} />
        <circle cx={mid} cy={top - s * 0.18} r={s * 0.018} fill={PALETTE.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 3))} /></g>);
      if (tw.roof === "step") out.push(<Box key="roof" x={x + w * 0.18} y={top - s * 0.09} w={w * 0.64} h={s * 0.09} fill={shade(tw.fill, -0.15)} s={s} r={0.05} sheen={false} />);
      if (tw.roof === "dome") out.push(<Shape key="roof" d={`M${x + w * 0.1},${top} A${w * 0.4},${w * 0.36} 0 0 1 ${x + w * 0.9},${top} Z`} fill={PALETTE.gold} s={s} />);
    }
  }
  return <g>{out}</g>;
};

export const city: PropFC = ({ s, t, k = 1, state, seed = "city" }) => {
  const dark = state === "dark";
  const n = SKYLINE.length, kk = clamp01(k);
  // build order: the middle first, then outwards, each tower rising over its share of k
  const order = [2, 1, 3, 4, 0, 5];
  const built = SKYLINE.map((_, i) => clamp01(kk * n - order.indexOf(i)));
  const craneAt = SKYLINE[order.find((i) => built[i]! < 1) ?? 2]!;
  return (
    <g>
      <Shadow w={s * 1.8} s={s} />
      {SKYLINE.map((tw, i) => <TowerShape key={i} tw={tw} s={s} t={t} built={built[i]!} dark={dark} seed={`${seed}${i}`} />)}
      {kk < 1 && (() => {
        // a tower crane over the tower being built, its hook swinging
        const cx = (craneAt.x + craneAt.w * 0.5) * s, top = -craneAt.h * s - s * 0.2, sw = Math.sin(t * 1.4) * s * 0.03;
        return <g>
          <line x1={cx} y1={0} x2={cx} y2={top} stroke={PALETTE.yellow} strokeWidth={line(s) * 2.2} />
          <line x1={cx} y1={0} x2={cx} y2={top} stroke={INK} strokeWidth={line(s) * 0.6} strokeDasharray={`${s * 0.02} ${s * 0.03}`} />
          <line x1={cx - s * 0.12} y1={top} x2={cx + s * 0.4} y2={top} stroke={PALETTE.yellow} strokeWidth={line(s) * 2} />
          <line x1={cx + s * 0.3 + sw} y1={top} x2={cx + s * 0.3 + sw} y2={top + s * 0.16} stroke={INK} strokeWidth={line(s) * 0.6} />
          <rect x={cx + s * 0.27 + sw} y={top + s * 0.16} width={s * 0.06} height={s * 0.04} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
        </g>;
      })()}
    </g>
  );
};

export const building: PropFC = ({ s, t, k = 1, state, seed = "building" }) => {
  const tw: Tower = { x: -0.3, w: 0.6, h: 1, fill: PALETTE.blue, roof: "flat" };
  return (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <TowerShape tw={tw} s={s} t={t} built={clamp01(k)} dark={state === "dark"} seed={seed} />
    </g>
  );
};

export const PLACES = { city, building, skyline: city };
