/**
 * A lit document (tech channel, kit gap 11): a page where only the spoken sentence is lit, an optional
 * highlighter pass over it, and a source chip. Replaces every article, filing or report screenshot:
 * the words are the source's, typed by research into the script, never a picture of their page.
 *
 * `sentences` and `source` come from the beat's params; sentence `lit` lights on frame `litAt` (the word
 * that starts it), the highlighter sweeps over `markFor` frames after it. Draw inside a `Stage`.
 */
import React from "react";
import { FONT } from "../../design/fonts";
import type { Motion } from "../kit";
import { TECH, Words, clamp01, useUnit, wrap } from "./theme";

const PAPER = "#e8ecf1";
const INK_DOC = "#10151d";
const GREY = "#5b6573";
const FADED = "#b7bec8";

export const LitDoc: React.FC<{
  m: Motion;
  sentences: string[];
  lit: number;
  litAt: number;
  title?: string;
  /** "Source: TSMC annual report · 2025": the chip's words */
  source?: string;
  sourceAt?: number;
  marker?: boolean;
  markFor?: number;
}> = ({ m, sentences, lit, litAt, title, source, sourceAt, marker = false, markFor = 24 }) => {
  const { w, h, u, vertical, min } = useUnit();
  const size = vertical ? Math.max(min, 48 * u) : Math.max(min, 36 * u);
  const lineH = size * 1.42;
  const dw = vertical ? 920 * u : 1080 * u;
  const pad = (vertical ? 60 : 70) * u;
  const dx = (w - dw) / 2;
  const chars = Math.floor((dw - pad * 2) / (size * 0.54));
  const blocks = sentences.map((s) => wrap(s, chars));
  const headH = title ? size * 2.6 : pad * 0.4;
  // y of every line, a paragraph gap between sentences
  let yy = headH + pad;
  const lines: { s: number; text: string; y: number; first: boolean; last: boolean }[] = [];
  blocks.forEach((bl, s) => {
    bl.forEach((text, j) => { lines.push({ s, text, y: yy, first: j === 0, last: j === bl.length - 1 }); yy += lineH; });
    yy += lineH * 0.45;
  });
  const docH = yy + pad;
  const litLines = lines.filter((l) => l.s === lit);
  const litMid = litLines.length ? (litLines[0]!.y + litLines[litLines.length - 1]!.y) / 2 : docH / 2;
  // the page drifts so the spoken sentence arrives at the centre as it is said
  const centre = h * (vertical ? 0.5 : 0.52);
  const topStart = Math.min(h * 0.18, centre - litMid + 240 * u);
  const top = m.lerp([0, litAt], [topStart, centre - litMid]);
  const lk = m.lerp([litAt - 4, litAt + 8], [0, 1]);
  const sk = m.pop(sourceAt ?? litAt + 12, 14);
  const markK = marker ? m.lerp([litAt + 4, litAt + 4 + markFor], [0, 1]) : 0;
  const litLen = litLines.reduce((a, l) => a + l.text.length, 0) || 1;
  let before = 0;
  return (
    <g>
      <g transform={`translate(${dx} ${top}) rotate(${vertical ? -1.5 : -1} ${dw / 2} ${litMid})`}>
        <rect x={14 * u} y={20 * u} width={dw} height={docH} rx={10 * u} fill="#000" opacity={0.45} />
        <rect x={0} y={0} width={dw} height={docH} rx={10 * u} fill={PAPER} />
        {title ? (
          <g>
            <rect x={pad} y={pad * 0.7} width={size * 1.1} height={size * 1.1} rx={6 * u} fill={GREY} />
            <Words x={pad + size * 1.5} y={pad * 0.7 + size * 0.55} size={size} fill={INK_DOC} weight={800} deco={lk > 0.5}
              opacity={1 - 0.5 * lk}>{title}</Words>
            <line x1={pad} y1={headH + pad * 0.4} x2={dw - pad} y2={headH + pad * 0.4} stroke={FADED} strokeWidth={3 * u} />
          </g>
        ) : null}
        {marker ? litLines.map((l, j) => {
          const share = l.text.length / litLen;
          const k = clamp01((markK - before) / share);
          before += share;
          const lw = l.text.length * size * 0.54;
          return k > 0 ? <rect key={`mk${j}`} x={pad - 8 * u} y={l.y - size * 0.62} width={(lw + 16 * u) * k} height={size * 1.24} rx={6 * u} fill={TECH.accent} opacity={0.75} /> : null;
        }) : null}
        {lines.map((l, i) => {
          const on = l.s === lit;
          const fill = on ? INK_DOC : lk > 0 ? FADED : GREY;
          return (
            <g key={i} data-probe={on ? undefined : "skip"} opacity={on ? 1 : 1 - 0.35 * lk}>
              <text x={pad} y={l.y} fontFamily={FONT} fontWeight={on ? 700 : 500} fontSize={size} fill={fill} dominantBaseline="central">{l.text}</text>
            </g>
          );
        })}
      </g>
      {source && sk > 0 ? (
        <g opacity={clamp01(sk * 1.5)} transform={`translate(0 ${(1 - Math.min(1, sk)) * -30 * u})`}>
          <SourceChip x={w / 2} y={vertical ? 270 * u : 80 * u} text={source} size={Math.max(min, (vertical ? 40 : 32) * u)} />
        </g>
      ) : null}
    </g>
  );
};

/** A dark pill with an accent dot: where the words on screen come from. */
export const SourceChip: React.FC<{ x: number; y: number; text: string; size: number }> = ({ x, y, text, size }) => {
  const tw = text.length * size * 0.56;
  const pw = tw + size * 2.4, ph = size * 1.7;
  return (
    <g>
      <rect x={x - pw / 2} y={y - ph / 2} width={pw} height={ph} rx={ph / 2} fill={TECH.panelHi} stroke={TECH.line} strokeWidth={3} />
      <circle cx={x - pw / 2 + size * 0.95} cy={y} r={size * 0.26} fill={TECH.accent} />
      <Words x={x - pw / 2 + size * 1.6} y={y} size={size} fill={TECH.text} weight={600}>{text}</Words>
    </g>
  );
};
