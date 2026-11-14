// Shared things for the Costco Short (v-20261114-02): the warehouse, the cash pallet, the giant membership
// card, a shopping cart full of giant packs.
import React from "react";
import { Ball, Block, Cash, Glow, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";

export const RED = "#e31837";
export const BLUE = "#1f5fbf";

/** A share string such as "64%" as a 0..1 fraction (the figure comes from the script, never typed). */
export const frac = (s: string | undefined): number => {
  const v = parseFloat((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v / 100)) : 0;
};

/** The warehouse inside: orange racks with blue beams, pallets of boxes, a concrete floor from `floor` down. */
export const Warehouse: React.FC<{ floor?: number; sign?: boolean; lights?: number }> = ({ floor = 1250, sign = true, lights = 1 }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={floor + 400} fill="#c9ccd6" />
    <rect x={-400} y={-400} width={1880} height={300} fill="#9aa0b2" />
    {[-60, 200, 460, 720, 980].map((x, i) => <Limb key={i} a={[x, -140]} b={[x + 260, -140]} w={14} color="#7a8096" sw={3} />)}
    {[100, 540, 980].map((x) => <Glow key={x} x={x} y={-60} r={260} color="#fff6d8" o={0.35 * lights} />)}
    {[-300, 40, 380, 720, 1060].map((x, i) => (
      <g key={i}>
        <Block x={x} y={120} w={26} h={floor - 120} fill="#f07b2a" shadow={false} sw={4} />
        <Block x={x + 300} y={120} w={26} h={floor - 120} fill="#f07b2a" shadow={false} sw={4} />
        {[420, 760, floor - 40].map((y) => <Block key={y} x={x} y={y} w={326} h={24} fill={BLUE} shadow={false} sw={4} />)}
        {[0, 1].map((r) => [0, 1, 2].map((c) => {
          const col = ["#c48a4a", "#d9a15e", "#b97c3e"][(i + r + c) % 3]!;
          return <Block key={`${r}${c}`} x={x + 34 + c * 92} y={(r ? 760 : 420) - 150} w={86} h={150} fill={col} sw={4} />;
        }))}
      </g>
    ))}
    {sign ? (
      <g>
        <Block x={140} y={150} w={800} h={130} r={14} fill={RED} shadow="bottom" />
        <Txt x={540} y={206} size={84} fill="#ffffff">COSTCO</Txt>
        <rect x={140} y={250} width={800} height={30} fill={BLUE} stroke={INK} strokeWidth={4} />
        <Txt x={540} y={265} size={22} fill="#ffffff" weight={700} deco>WHOLESALE</Txt>
      </g>
    ) : null}
    <rect x={-400} y={floor} width={1880} height={1400} fill="#9b9ea8" />
    <line x1={-400} y1={floor} x2={1480} y2={floor} stroke={INK} strokeWidth={STROKE} />
    {[-200, 100, 400, 700, 1000, 1300].map((x) => <line key={x} x1={540} y1={floor} x2={x * 1.6 - 324} y2={floor + 900} stroke="#8a8d97" strokeWidth={4} />)}
  </g>
);

/** A wooden pallet stacked with cash bundles, `w` wide and `h` tall, feet at (x, y). `fill` (0..1) floods the
 * stack from the bottom with the card's blue: the part the card pays for. */
export const CashPallet: React.FC<{ x: number; y: number; w: number; h: number; fill?: number }> = ({ x, y, w, h, fill = 0 }) => {
  const top = y - 40 - h;
  const rows = Math.round(h / 46), cols = Math.max(2, Math.round(w / 120));
  const fh = h * fill;
  return (
    <g>
      <Block x={x} y={y - 40} w={w} h={40} fill="#b07a42" shadow="bottom" />
      {[0.08, 0.46, 0.84].map((f) => <rect key={f} x={x + w * f} y={y - 22} width={w * 0.08} height={22} fill="#6b4520" />)}
      <Block x={x + 6} y={top} w={w - 12} h={h} fill="#3a9d5d" shadow="right" />
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => (
        <Cash key={`${r}-${c}`} x={x + 16 + c * ((w - 32) / cols)} y={top + 10 + r * (h / rows)} w={(w - 32) / cols - 10} />
      )))}
      {fill > 0 ? (
        <g>
          <rect x={x + 6} y={y - 40 - fh} width={w - 12} height={fh} fill={BLUE} opacity={0.88} />
          <line x1={x - 20} y1={y - 40 - fh} x2={x + w + 20} y2={y - 40 - fh} stroke="#ffffff" strokeWidth={8} strokeDasharray="22 14" />
        </g>
      ) : null}
      <rect x={x + 6} y={top} width={w - 12} height={h} fill="none" stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

/** The membership card, standing: a white card with the red and blue bands, a member photo and lines. */
export const BigCard: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; name?: boolean }> = ({ x, y, w, h, rot = 0, name = true }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 14} y={y + 18} width={w} height={h} rx={w * 0.08} fill="#000" opacity={0.22} />
    <rect x={x} y={y} width={w} height={h} rx={w * 0.08} fill="#f8f8fb" stroke={INK} strokeWidth={STROKE} />
    <rect x={x} y={y + h * 0.06} width={w} height={h * 0.16} fill={RED} stroke={INK} strokeWidth={4} />
    <rect x={x} y={y + h * 0.22} width={w} height={h * 0.05} fill={BLUE} stroke={INK} strokeWidth={4} />
    {name ? <Txt x={x + w / 2} y={y + h * 0.14} size={Math.max(44, w * 0.17)} fill="#ffffff">COSTCO</Txt> : null}
    <rect x={x + w * 0.12} y={y + h * 0.36} width={w * 0.38} height={h * 0.3} rx={10} fill="#cfd8e6" stroke={INK} strokeWidth={4} />
    <Ball x={x + w * 0.31} y={y + h * 0.46} r={w * 0.08} fill="#e0b48a" sw={3} />
    <path d={`M ${x + w * 0.16} ${y + h * 0.66} Q ${x + w * 0.31} ${y + h * 0.52} ${x + w * 0.46} ${y + h * 0.66} Z`} fill={BLUE} />
    {[0.4, 0.48, 0.56].map((f) => <rect key={f} x={x + w * 0.56} y={y + h * f} width={w * 0.3} height={h * 0.025} rx={4} fill="#a9b2c4" />)}
    {w >= 150 ? <Txt x={x + w / 2} y={y + h * 0.8} size={Math.max(30, w * 0.09)} fill={INK} weight={700} deco>MEMBER</Txt> : null}
    <rect x={x + w * 0.12} y={y + h * 0.88} width={w * 0.76} height={h * 0.05} fill="#2a2f3d" />
  </g>
);

/** A shopping cart, wheels at (x, y), `s` = scale (1 ≈ 300 px wide), heaped with giant packs when `full`. */
export const Cart: React.FC<{ x: number; y: number; s?: number; full?: number; spin?: number }> = ({ x, y, s = 1, full = 1, spin = 0 }) => {
  const packs: [number, number, number, number, string][] = [[-110, -260, 90, 110, "#ffcf3d"], [-15, -280, 100, 130, RED], [90, -250, 80, 100, "#2bb673"], [-70, -360, 110, 90, BLUE], [50, -360, 90, 100, "#f07b2a"]];
  const shown = Math.round(packs.length * Math.max(0, Math.min(1, full)));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {packs.slice(0, shown).map(([px, py, w, h, c], i) => (
        <g key={i}>
          <Block x={px} y={py - (i > 2 ? 10 : 0)} w={w} h={h} r={8} fill={c} sw={4} />
          <rect x={px + 12} y={py + h * 0.35 - (i > 2 ? 10 : 0)} width={w - 24} height={h * 0.25} rx={6} fill="#ffffff" opacity={0.85} />
        </g>
      ))}
      <polygon points="-150,-170 150,-170 120,-40 -120,-40" fill="#d7dbe3" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" opacity={0.92} />
      {[-100, -50, 0, 50, 100].map((gx) => <line key={gx} x1={gx} y1={-165} x2={gx * 0.82} y2={-45} stroke="#9aa0b2" strokeWidth={5} />)}
      <rect x={-150} y={-190} width={300} height={22} rx={6} fill={RED} stroke={INK} strokeWidth={4} />
      <Limb a={[150, -180]} b={[200, -250]} w={12} color="#9aa0b2" sw={3} />
      <Limb a={[190, -255]} b={[240, -255]} w={16} color={RED} sw={3} />
      <Limb a={[-120, -40]} b={[-100, -10]} w={10} color="#9aa0b2" sw={3} />
      <Limb a={[120, -40]} b={[100, -10]} w={10} color="#9aa0b2" sw={3} />
      {[-100, 100].map((wx) => (
        <g key={wx} transform={`rotate(${spin} ${wx} 0)`}><Ball x={wx} y={0} r={20} fill="#2a2f3d" sw={4} /><line x1={wx - 14} y1={0} x2={wx + 14} y2={0} stroke="#6b7080" strokeWidth={4} /></g>
      ))}
    </g>
  );
};

/** A dollar note drifting (rotates as it floats). */
export const Note: React.FC<{ x: number; y: number; rot?: number; w?: number }> = ({ x, y, rot = 0, w = 120 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x - w / 2} y={y - w * 0.22} width={w} height={w * 0.44} rx={6} fill="#7fcf8a" stroke={INK} strokeWidth={4} />
    <ellipse cx={x} cy={y} rx={w * 0.14} ry={w * 0.16} fill="none" stroke={shade("#7fcf8a", -0.35)} strokeWidth={4} />
  </g>
);

const props = { Warehouse, CashPallet, BigCard, Cart, Note };
export default props;
