/**
 * Dark interface cards (tech channel, kit gap 9): a deck that builds one card per spoken item and
 * lights the named one in the accent, and a chapter title card for long videos.
 *
 * Every word and figure comes in as props (a directed beat reads them from `p.beat.params`, figures
 * from `params.fig`); every moment is a frame passed in (a spoken word's event). Draw inside a `Stage`.
 */
import React from "react";
import { FONT } from "../../design/fonts";
import type { Motion } from "../kit";
import { Icon, type IconName } from "./icons";
import { Num, TECH, Words, clamp01, numWidth, useUnit, wrap } from "./theme";

export type DeckItem = { title: string; sub?: string; fig?: string; icon?: IconName };
export type Box = { x: number; y: number; w: number; h: number };

/**
 * One card per item, each built on its frame in `on` (the word that names it). `hi` is the index of the
 * named item: from `hiAt` it takes the accent and the others dim. `box` is where the deck sits (default:
 * the safe middle of the frame); `cols` defaults to 1 in a Short and up to 4 across in a long video.
 */
export const CardDeck: React.FC<{ m: Motion; items: DeckItem[]; on: number[]; hi?: number; hiAt?: number; box?: Box; cols?: number }> = ({
  m, items, on, hi, hiAt, box, cols,
}) => {
  const { u, vertical, min } = useUnit();
  const b = box ?? (vertical ? { x: 80, y: 420, w: 920, h: 1060 } : { x: 140, y: 230, w: 1640, h: 640 });
  const n = Math.max(1, items.length);
  const c = Math.max(1, Math.min(n, cols ?? (vertical ? 1 : Math.min(4, n))));
  const rows = Math.ceil(n / c);
  const gap = 36 * u;
  const cw = (b.w - gap * (c - 1)) / c;
  const ch = Math.min((b.h - gap * (rows - 1)) / rows, vertical ? 300 * u : b.h);
  const top = b.y + (b.h - (ch * rows + gap * (rows - 1))) / 2;
  const row = cw / ch > 2;                     // a wide card: icon left, words, figure right
  const hk = hi !== undefined && hiAt !== undefined ? m.pop(hiAt, 16) : 0;
  return (
    <g>
      <defs>
        <filter id="deck-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={18 * u} />
        </filter>
      </defs>
      {items.map((it, i) => {
        const x = b.x + (i % c) * (cw + gap), y = top + Math.floor(i / c) * (ch + gap);
        const from = on[i] ?? 0;
        const isHi = i === hi;
        const k = m.pop(from, 14);
        if (m.t < from) {
          // the empty slot the card will land in: the deck reads as a list still being built
          return <rect key={i} x={x} y={y} width={cw} height={ch} rx={22 * u} fill="none" stroke={TECH.grid} strokeWidth={3 * u} strokeDasharray={`${14 * u} ${12 * u}`} />;
        }
        const dim = isHi ? 1 : 1 - 0.55 * hk;
        const lift = isHi ? hk : 0;
        const accent = isHi && hk > 0.05;
        const cx = x + cw / 2, cy = y + ch / 2;
        const sc = 1 + 0.04 * lift;
        return (
          <g key={i} opacity={clamp01(k * 1.6) * dim}
            transform={`translate(0 ${(1 - Math.min(1, k)) * 70 * u}) translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
            {accent ? <rect x={x} y={y} width={cw} height={ch} rx={22 * u} fill={TECH.accent} opacity={0.35 * hk} filter="url(#deck-glow)" /> : null}
            <rect x={x} y={y} width={cw} height={ch} rx={22 * u} fill={accent ? TECH.panelHi : TECH.panel}
              stroke={accent ? TECH.accent : TECH.line} strokeWidth={(accent ? 5 : 3) * u} />
            {row ? <RowCard it={it} x={x} y={y} w={cw} h={ch} accent={accent} u={u} min={min} index={i} />
              : <TallCard it={it} x={x} y={y} w={cw} h={ch} accent={accent} u={u} min={min} index={i} />}
          </g>
        );
      })}
    </g>
  );
};

type CardBody = { it: DeckItem; x: number; y: number; w: number; h: number; accent: boolean; u: number; min: number; index: number };

const RowCard: React.FC<CardBody> = ({ it, x, y, w, h, accent, u, min, index }) => {
  const pad = 34 * u;
  const ic = it.icon ? Math.min(h - pad * 2, 112 * u) : 0;
  const figSize = it.fig ? Math.min(h * 0.46, 108 * u) : 0;
  const figW = it.fig ? numWidth(it.fig, figSize) : 0;
  const tx = x + pad + (ic ? ic + pad : 0);
  const titleSize = Math.max(min, 54 * u);
  const subSize = min;
  const chars = Math.max(6, Math.floor((w - (tx - x) - figW - pad * 2) / (titleSize * 0.6)));
  const lines = wrap(it.title, chars).slice(0, 2);
  const subLines = it.sub ? wrap(it.sub, Math.max(6, Math.floor((w - (tx - x) - figW - pad * 2.5) / (subSize * 0.56)))).slice(0, 2) : [];
  const block = lines.length * titleSize * 1.12 + subLines.length * subSize * 1.2;
  let ty = y + h / 2 - block / 2 + titleSize * 0.56;
  const col = accent ? TECH.accent : TECH.text;
  return (
    <g>
      <rect x={x} y={y + 18 * u} width={6 * u} height={h - 36 * u} rx={3 * u} fill={accent ? TECH.accent : TECH.dim} />
      {ic ? <Icon name={it.icon!} x={x + pad + ic / 2} y={y + h / 2} size={ic} color={col} sw={5} /> : null}
      <Words x={x + w - pad} y={y + 26 * u} size={22 * u} fill={TECH.dim} anchor="end" deco>{String(index + 1).padStart(2, "0")}</Words>
      {lines.map((l, j) => {
        const el = <Words key={j} x={tx} y={ty} size={titleSize} fill={TECH.text} weight={700}>{l}</Words>;
        ty += titleSize * 1.12;
        return el;
      })}
      {subLines.map((s, j) => <Words key={`s${j}`} x={tx} y={ty - titleSize * 0.56 + subSize * (0.75 + j * 1.2)} size={subSize} fill={TECH.muted} weight={500}>{s}</Words>)}
      {it.fig ? <Num x={x + w - pad} y={y + h / 2 + 6 * u} size={figSize} fill={col} anchor="end" glow={accent ? TECH.accent : undefined}>{it.fig}</Num> : null}
    </g>
  );
};

const TallCard: React.FC<CardBody> = ({ it, x, y, w, h, accent, u, min, index }) => {
  const pad = 34 * u;
  const col = accent ? TECH.accent : TECH.text;
  const ic = it.icon ? Math.min(w * 0.36, 130 * u) : 0;
  const titleSize = Math.max(min, Math.min(50 * u, w / 8));
  const chars = Math.max(6, Math.floor((w - pad * 2) / (titleSize * 0.6)));
  const lines = wrap(it.title, chars).slice(0, 3);
  const figSize = it.fig ? Math.min(140 * u, (w - pad * 2) / Math.max(1, it.fig.length * 0.55)) : 0;
  let cy = y + pad + 24 * u;
  return (
    <g>
      <Words x={x + w - pad} y={y + pad} size={22 * u} fill={TECH.dim} anchor="end" deco>{String(index + 1).padStart(2, "0")}</Words>
      {ic ? <Icon name={it.icon!} x={x + pad + ic / 2} y={(cy += ic / 2)} size={ic} color={col} sw={5} /> : null}
      {(() => { cy += ic / 2 + 40 * u; return null; })()}
      {lines.map((l, j) => <Words key={j} x={x + pad} y={cy + j * titleSize * 1.12} size={titleSize} fill={TECH.text}>{l}</Words>)}
      {it.fig ? <Num x={x + pad} y={y + h - pad - (it.sub ? min * 1.6 : 0) - figSize * 0.5} size={figSize} fill={col} glow={accent ? TECH.accent : undefined}>{it.fig}</Num> : null}
      {it.sub ? <Words x={x + pad} y={y + h - pad - min * 0.5} size={min} fill={TECH.muted} weight={500}>{it.sub}</Words> : null}
    </g>
  );
};

/**
 * A chapter title for a long video (works in a Short too): the chapter's number in big outlined
 * numerals, an accent rule that draws, the title word by word from `on`, a small kicker above it.
 * `n` and `title` come from the beat's params (the number is the chapter's, not typed in the file).
 */
export const ChapterCard: React.FC<{ m: Motion; n: string; title: string; kicker?: string; on?: number }> = ({ m, n, title, kicker, on = 6 }) => {
  const { w, h, u, vertical, min } = useUnit();
  const push = m.lerp([0, m.end], [1, 1.05]);
  const numSize = vertical ? 520 * u : 560 * u;
  const titleSize = vertical ? 104 * u : 100 * u;
  const lines = wrap(title, vertical ? 15 : 18);
  const words = lines.flatMap((l, li) => l.split(" ").map((wd, wi) => ({ wd, li, wi })));
  const nx = vertical ? 90 * u : 150 * u, ny = vertical ? h * 0.33 : h * 0.5;
  const tx = vertical ? 100 * u : w * 0.47, ty = vertical ? h * 0.56 : h * 0.5 - (lines.length - 1) * titleSize * 0.56 + 20 * u;
  const rule = m.lerp([on - 4, on + 14], [0, 1]);
  const nk = m.pop(0, 18);
  return (
    <g transform={`translate(${w / 2} ${h / 2}) scale(${push}) translate(${-w / 2} ${-h / 2})`}>
      <g opacity={clamp01(nk * 1.4)} transform={`translate(${(1 - nk) * -60 * u} 0)`}>
        <g transform={`translate(${nx} ${ny}) scale(0.82 1)`}>
          <text x={0} y={0} fontFamily={FONT} fontWeight={800} fontSize={numSize} fill="none" stroke={TECH.accent} strokeWidth={4 * u}
            dominantBaseline="central" letterSpacing={-numSize * 0.04} data-probe="skip">{n}</text>
        </g>
      </g>
      {kicker ? <Words x={tx} y={ty - titleSize * 1.1} size={Math.max(min, 34 * u)} fill={TECH.accent} weight={700} spacing={6 * u}
        opacity={clamp01(m.lerp([on - 6, on + 6], [0, 1]))}>{kicker.toUpperCase()}</Words> : null}
      <rect x={tx} y={ty - titleSize * 0.82} width={(vertical ? 760 : 820) * u * rule} height={5 * u} fill={TECH.accent} />
      {lines.map((_, li) => {
        const mine = words.map((x, i) => ({ ...x, i })).filter((x) => x.li === li);
        const k0 = m.pop(on + mine[0]!.i * 3, 15);
        return (
          <g key={li} transform={`translate(0 ${(1 - Math.min(1, k0)) * 40 * u})`}>
            <text x={tx} y={ty + li * titleSize * 1.12 + titleSize * 0.2} fontFamily={FONT} fontWeight={800} fontSize={titleSize}
              fill={TECH.text} dominantBaseline="central" opacity={k0 > 0 ? 1 : 0}>
              {mine.map(({ wd, wi, i }) => (
                <tspan key={i} opacity={clamp01(m.pop(on + i * 3, 15) * 1.5)}>{wi ? " " : ""}{wd}</tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
};
