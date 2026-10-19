/**
 * Marker marks (style study of Casual Finance, 2026-10-19): the hand-drawn layer on top of the
 * evidence. A circle round a figure, an underline, an arrow, a double arrow across a gap, a tick,
 * a cross, a short note. Each draws itself on, stroke by stroke, at its event, with a slight hand
 * wobble, so a still chart or document has something new happening at the moment it is spoken.
 *
 * Positions are 0..1 of the host box (the document card, the wall screen, the chart area). A note's
 * text comes from Python like every other string: placeholders filled, never a typed number.
 */
import React from "react";
import { random } from "remotion";
import { evolvePath } from "@remotion/paths";
import type { PaletteT } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { at, clamp, easeOut, pop, type SceneProps, sec } from "../scenes/kit";

export type MarkKind = "circle" | "underline" | "arrow" | "gap" | "tick" | "cross" | "note";
export interface MarkSpec {
  kind: MarkKind;
  at?: string;                 // event name; marks without one follow each other through the beat
  x?: number; y?: number;      // 0..1 of the host box: centre (circle, tick, cross, note), start (underline, arrow, gap)
  x2?: number; y2?: number;    // end (underline, arrow, gap)
  r?: number;                  // circle radius, 0..1 of the box width
  text?: string;               // note
  color?: "bad" | "good" | "ink" | "accent";
}
export interface Box { x: number; y: number; w: number; h: number }

const DRAW = 0.45;             // seconds a stroke takes to draw on

function markColor(c: MarkSpec["color"], pal: PaletteT, ink: string): string {
  return c === "good" ? "#1f9d61" : c === "ink" ? ink : c === "accent" ? pal.accent : pal.danger;
}

/** A hand-drawn loop round a point: a little more than one turn, slightly uneven. */
function loop(cx: number, cy: number, rx: number, ry: number, seed: string): string {
  const pts: string[] = [];
  const turns = 1.12, n = 40, j = (i: number) => 1 + (random(`${seed}${i}`) - 0.5) * 0.08;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 0.7 + (i / n) * Math.PI * 2 * turns;
    const grow = 1 + (i / n) * 0.06;
    pts.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * rx * j(i) * grow).toFixed(1)},${(cy + Math.sin(a) * ry * j(i + 99) * grow).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** A slightly wavy line, as a marker drags across the page. */
function wavy(x1: number, y1: number, x2: number, y2: number, seed: string): string {
  const n = 12, pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, wob = (random(`${seed}${i}`) - 0.5) * 6;
    pts.push(`${i ? "L" : "M"}${(x1 + (x2 - x1) * f).toFixed(1)},${(y1 + (y2 - y1) * f + wob).toFixed(1)}`);
  }
  return pts.join(" ");
}

function head(x: number, y: number, ang: number, s: number): string {
  const a1 = ang + Math.PI * 0.82, a2 = ang - Math.PI * 0.82;
  return `M${x + Math.cos(a1) * s},${y + Math.sin(a1) * s} L${x},${y} L${x + Math.cos(a2) * s},${y + Math.sin(a2) * s}`;
}

/** The strokes of one mark, in drawing order, in the host box's pixels. */
function strokes(m: MarkSpec, b: Box, seed: string): string[] {
  const X = (f = 0.5) => b.x + b.w * f, Y = (f = 0.5) => b.y + b.h * f;
  const x = X(m.x), y = Y(m.y), x2 = X(m.x2 ?? (m.x ?? 0.5) + 0.3), y2 = Y(m.y2 ?? m.y);
  switch (m.kind) {
    case "circle": { const r = b.w * (m.r ?? 0.12); return [loop(x, y, r, r * 0.72, seed)]; }
    case "underline": return [wavy(x, y, x2, y2, seed)];
    case "arrow": {
      const mx = (x + x2) / 2 + (y2 - y) * 0.25, my = (y + y2) / 2 - (x2 - x) * 0.25;
      const ang = Math.atan2(y2 - my, x2 - mx);
      return [`M${x},${y} Q${mx},${my} ${x2},${y2}`, head(x2, y2, ang, 34)];
    }
    case "gap": {
      const top = Math.min(y, Y(m.y2 ?? (m.y ?? 0.5) + 0.3)), bot = Math.max(y, Y(m.y2 ?? (m.y ?? 0.5) + 0.3));
      return [wavy(x, top, x, bot, seed), head(x, top, -Math.PI / 2, 30), head(x, bot, Math.PI / 2, 30)];
    }
    case "tick": return [`M${x - 34},${y} L${x - 8},${y + 30} L${x + 46},${y - 40}`];
    case "cross": return [`M${x - 34},${y - 34} L${x + 34},${y + 34}`, `M${x + 34},${y - 34} L${x - 34},${y + 34}`];
    default: return [];
  }
}

/** The marks of a beat, drawn into the host's SVG. `ink` is the colour of plain writing on the host. */
export const Marks: React.FC<{ p: SceneProps; marks?: MarkSpec[]; box: Box; ink: string }> = ({ p, marks, box, ink }) => {
  if (!marks?.length) return null;
  const t = sec(p), dur = p.beat.frames / p.fps;
  const v = p.tl.height > p.tl.width;
  const width = v ? 11 : 8;
  return (
    <g data-probe-host="marks">
      {marks.map((m, i) => {
        const start = at(p, m.at, 0.6 + (dur - 1.2) * (i / Math.max(1, marks.length)));
        const color = markColor(m.color, p.tl.palette, ink);
        if (m.kind === "note") {
          const k = pop(p, start, 11, 170);
          if (!m.text || k <= 0) return null;
          const fs = v ? 64 : 46;
          return <text key={i} x={box.x + box.w * (m.x ?? 0.5)} y={box.y + box.h * (m.y ?? 0.5)} textAnchor="middle" dominantBaseline="middle"
            fontFamily={FONT} fontStyle="italic" fontWeight={800} fontSize={fs} fill={color} opacity={clamp(k * 2)}
            transform={`rotate(-5 ${box.x + box.w * (m.x ?? 0.5)} ${box.y + box.h * (m.y ?? 0.5)}) translate(0 ${(1 - k) * 14})`}>{m.text}</text>;
        }
        const parts = strokes(m, box, `${p.beat.id}m${i}`);
        return <g key={i}>{parts.map((d, j) => {
          // the strokes of one mark follow each other: a shaft, then its heads
          const s = start + j * DRAW * 0.6, f = easeOut((t - s) / DRAW);
          if (f <= 0) return null;
          const ev = evolvePath(f, d);
          return <path key={j} d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} opacity={0.92} />;
        })}</g>;
      })}
    </g>
  );
};
