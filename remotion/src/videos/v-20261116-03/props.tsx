// Props for the Salvator Mundi Short: the painting (our own flat drawing of a robed figure holding a glass orb,
// right hand raised), which can be brown with overpaint or clean, a gilt frame, a paper price tag on a string, a
// gold name plate, an auction paddle, a gavel, bundles of cash.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt } from "../../flat/kit";

/** The painting in its frame. `paint` 0..1: how much of the face and robe is under brown overpaint;
 * `split`: the left half brown and the right half clean (the hook). */
export const Painting: React.FC<{ x: number; y: number; w: number; paint?: number; split?: boolean; glow?: number }> = ({ x, y, w, paint = 0, split, glow = 0 }) => {
  const h = w * 1.36, f = w * 0.07;
  const cx = x + w / 2, ix = x + f, iy = y + f, iw = w - 2 * f, ih = h - 2 * f;
  const id = `sm-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;
  const figure = (
    <g>
      <rect x={ix} y={iy} width={iw} height={ih} fill="#1c1712" />
      <Glow x={cx} y={iy + ih * 0.35} r={iw * 0.6} color="#6a5a3a" o={0.35} />
      {/* hair and face */}
      <ellipse cx={cx} cy={iy + ih * 0.3} rx={iw * 0.2} ry={iw * 0.27} fill="#5a3a22" />
      <ellipse cx={cx} cy={iy + ih * 0.28} rx={iw * 0.12} ry={iw * 0.16} fill="#d9a77a" />
      <rect x={cx - iw * 0.07} y={iy + ih * 0.25} width={iw * 0.05} height={iw * 0.012} fill="#3a2414" />
      <rect x={cx + iw * 0.02} y={iy + ih * 0.25} width={iw * 0.05} height={iw * 0.012} fill="#3a2414" />
      {/* robe */}
      <path d={`M ${cx - iw * 0.42} ${iy + ih} Q ${cx - iw * 0.32} ${iy + ih * 0.45} ${cx} ${iy + ih * 0.42} Q ${cx + iw * 0.32} ${iy + ih * 0.45} ${cx + iw * 0.42} ${iy + ih} Z`} fill="#2a4a8a" />
      <path d={`M ${cx - iw * 0.1} ${iy + ih * 0.44} L ${cx} ${iy + ih * 0.62} L ${cx + iw * 0.1} ${iy + ih * 0.44}`} stroke="#d4af37" strokeWidth={iw * 0.02} fill="none" />
      {/* the raised right hand */}
      <rect x={cx - iw * 0.3} y={iy + ih * 0.5} width={iw * 0.07} height={iw * 0.16} rx={iw * 0.03} fill="#d9a77a" />
      {/* the glass orb */}
      <circle cx={cx + iw * 0.12} cy={iy + ih * 0.76} r={iw * 0.15} fill="#cfe6f2" opacity={0.55} stroke="#ffffff" strokeWidth={3} />
      <circle cx={cx + iw * 0.07} cy={iy + ih * 0.72} r={iw * 0.03} fill="#ffffff" opacity={0.9} />
    </g>
  );
  return (
    <g>
      <rect x={x + 12} y={y + 16} width={w} height={h} fill="#000" opacity={0.3} />
      <rect x={x} y={y} width={w} height={h} fill="#b8892e" stroke={INK} strokeWidth={STROKE} />
      <rect x={x + f * 0.35} y={y + f * 0.35} width={w - f * 0.7} height={h - f * 0.7} fill="none" stroke="#e6c25a" strokeWidth={f * 0.25} />
      <defs><clipPath id={id}><rect x={ix} y={iy} width={iw} height={ih} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {figure}
        {split ? <rect x={ix} y={iy} width={iw / 2} height={ih} fill="#5a3f22" opacity={0.92} /> : null}
        {paint > 0 ? <rect x={ix} y={iy} width={iw} height={ih * paint} fill="#5a3f22" opacity={0.94} /> : null}
        {split || paint > 0 ? Array.from({ length: 6 }).map((_, i) => <line key={i} x1={ix + 10} y1={iy + 30 + i * ih * 0.15} x2={ix + (split ? iw / 2 : iw) - 10} y2={iy + 50 + i * ih * 0.15} stroke="#4a321a" strokeWidth={10} strokeLinecap="round" opacity={paint > 0 && !split && iy + 30 + i * ih * 0.15 > iy + ih * paint ? 0 : 0.8} />) : null}
        {glow > 0 ? <Glow x={cx} y={iy + ih * 0.35} r={iw * 0.8} color="#ffe6a0" o={0.45 * glow} /> : null}
      </g>
      <rect x={ix} y={iy} width={iw} height={ih} fill="none" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A paper price tag on a string: the old figure. */
export const PaperTag: React.FC<{ x: number; y: number; text: string; rot?: number; s?: number }> = ({ x, y, text, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={0} y1={-70} x2={0} y2={0} stroke="#6b5a3a" strokeWidth={4} />
    <path d="M -110 0 L 110 0 L 110 130 L -110 130 L -110 30 Z" fill="#f2e6c4" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={16} r={8} fill="#6b5a3a" />
    <Txt x={0} y={82} size={80} fill="#5a3a22">{text}</Txt>
  </g>
);

/** A gold name plate under a painting. */
export const Plate: React.FC<{ x: number; y: number; w: number; text: string; k?: number }> = ({ x, y, w, text, k = 1 }) => (
  <g opacity={Math.min(1, Math.max(0, k))} transform={`translate(${x + w / 2} ${y + 40}) scale(${0.6 + 0.4 * Math.min(1, k)}) translate(${-(x + w / 2)} ${-(y + 40)})`}>
    <Block x={x} y={y} w={w} h={80} r={8} fill="#d4af37" />
    <Txt x={x + w / 2} y={y + 42} size={46} fill={INK}>{text}</Txt>
  </g>
);

/** An auction paddle. */
export const Paddle: React.FC<{ x: number; y: number; up: number; c?: string }> = ({ x, y, up, c = "#f4f1e8" }) => (
  <g transform={`translate(${x} ${y - up * 90}) rotate(${-10 + up * 10})`}>
    <rect x={-5} y={0} width={10} height={90} fill="#6b4a2e" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={-30} r={36} fill={c} stroke={INK} strokeWidth={4} />
  </g>
);

/** A bundle of hundred-dollar notes seen side on. */
export const Bundle: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 150 }) => (
  <g>
    <rect x={x} y={y} width={w} height={34} rx={4} fill="#4f9a62" stroke={INK} strokeWidth={4} />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={34} fill="#e8dcb8" stroke={INK} strokeWidth={2} />
  </g>
);

/** A hanging lamp with a warm cone of light. */
export const HangLamp: React.FC<{ x: number; y: number; sway?: number }> = ({ x, y, sway = 0 }) => (
  <g transform={`rotate(${sway} ${x} ${y - 300})`}>
    <line x1={x} y1={y - 300} x2={x} y2={y} stroke={INK} strokeWidth={5} />
    <path d={`M ${x - 70} ${y + 60} L ${x - 30} ${y} L ${x + 30} ${y} L ${x + 70} ${y + 60} Z`} fill="#3a5a4a" stroke={INK} strokeWidth={5} />
    <Ball x={x} y={y + 64} r={18} fill="#fff1c0" sw={3} shadow={false} />
    <Glow x={x} y={y + 300} r={420} color="#ffd890" o={0.45} />
  </g>
);

export default Painting;
