/**
 * An equivalence chain (tech channel, kit gap 10): an icon and its figure, then a line draws to a thing
 * the viewer knows ("one GPU rack = 120 kW → the power of 100 homes"), and the camera trucks along the
 * line to it. Any number of links.
 *
 * Figures (`fig`) come from params.fig; link i lands on frame `on[i]` (the word that names it), its line
 * drawing in the `draw` frames before. Draw inside a `Stage`.
 */
import React from "react";
import type { Motion } from "../kit";
import { Icon, type IconName } from "./icons";
import { Num, TECH, Words, clamp01, useUnit } from "./theme";

export type EquivLink = { icon: IconName; fig?: string; label?: string; /** shown on the line into this link: "=", "≈", "×" */ rel?: string };

export const EquivChain: React.FC<{ m: Motion; links: EquivLink[]; on: number[]; draw?: number; y?: number }> = ({ m, links, on, draw = 20, y }) => {
  const { w, h, u, vertical, min } = useUnit();
  const gap = (vertical ? 640 : 900) * u;
  const cy = y ?? h * (vertical ? 0.46 : 0.45);
  const r = (vertical ? 150 : 140) * u;
  const nodeX = (i: number) => i * gap;
  const landed = (i: number) => on[i] ?? i * 40;
  // the camera: on the first link, then the midpoint of the line being drawn, trucking as it draws
  let cam = 0;
  for (let i = 1; i < links.length; i++) {
    const a = landed(i) - draw;
    cam += m.lerp([a - 6, landed(i) + 6], [0, 1]) * (i === 1 ? gap / 2 : gap);
  }
  const figSize = (vertical ? 128 : 116) * u;
  return (
    <g transform={`translate(${w / 2 - cam} 0)`}>
      {links.map((lk, i) => {
        if (i === 0) return null;
        const a = landed(i) - draw;
        const k = m.lerp([a, landed(i)], [0, 1]);
        if (k <= 0) return null;
        const x0 = nodeX(i - 1) + r + 20 * u, x1 = nodeX(i) - r - 20 * u;
        const xe = x0 + (x1 - x0) * k;
        const mid = (x0 + x1) / 2;
        const rk = m.pop(a + draw * 0.5, 14);
        return (
          <g key={`l${i}`}>
            <line x1={x0} y1={cy} x2={x1} y2={cy} stroke={TECH.grid} strokeWidth={4 * u} strokeDasharray={`${10 * u} ${12 * u}`} />
            <line x1={x0} y1={cy} x2={xe} y2={cy} stroke={TECH.accent} strokeWidth={6 * u} strokeLinecap="round" />
            <circle cx={xe} cy={cy} r={16 * u} fill={TECH.accent} opacity={0.3} />
            <circle cx={xe} cy={cy} r={8 * u} fill={TECH.accent} />
            {k >= 1 ? <polyline points={`${x1 - 22 * u},${cy - 18 * u} ${x1},${cy} ${x1 - 22 * u},${cy + 18 * u}`} fill="none" stroke={TECH.accent} strokeWidth={6 * u} strokeLinecap="round" strokeLinejoin="round" /> : null}
            {lk.rel && rk > 0 ? (
              <g opacity={clamp01(rk * 1.5)} transform={`translate(${mid} ${cy}) scale(${0.6 + 0.4 * Math.min(1, rk)})`}>
                <circle r={46 * u} fill={TECH.bg} stroke={TECH.accent} strokeWidth={4 * u} />
                <Words x={0} y={-2 * u} size={Math.max(min, 56 * u)} fill={TECH.accent} weight={800} anchor="middle">{lk.rel}</Words>
              </g>
            ) : null}
          </g>
        );
      })}
      {links.map((lk, i) => {
        const k = m.pop(landed(i), 13);
        if (k <= 0) return null;
        const x = nodeX(i);
        const last = i === links.length - 1 && i > 0;
        const fk = m.pop(landed(i) + 5, 12);
        return (
          <g key={`n${i}`}>
            <g transform={`translate(${x} ${cy}) scale(${0.5 + 0.5 * Math.min(1.08, k)})`} opacity={clamp01(k * 1.6)}>
              {last ? <circle r={r * 1.35} fill={TECH.accent} opacity={0.12} /> : null}
              <circle r={r} fill={TECH.panel} stroke={last ? TECH.accent : TECH.line} strokeWidth={(last ? 5 : 3) * u} />
              <Icon name={lk.icon} x={0} y={0} size={r * 1.05} color={last ? TECH.accent : TECH.text} sw={5} />
            </g>
            {lk.fig ? (
              <g opacity={clamp01(fk * 1.5)} transform={`translate(0 ${(1 - Math.min(1, fk)) * 30 * u})`}>
                <Num x={x} y={cy + r + 40 * u + figSize * 0.5} size={figSize} anchor="middle" fill={last ? TECH.accent : TECH.text} glow={last ? TECH.accent : undefined}>{lk.fig}</Num>
              </g>
            ) : null}
            {lk.label ? (
              <Words x={x} y={cy + r + (lk.fig ? figSize * 1.15 + 70 * u : 70 * u)} size={Math.max(min, 42 * u)} fill={TECH.muted} weight={600} anchor="middle"
                opacity={clamp01(fk * 1.5)}>{lk.label}</Words>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
