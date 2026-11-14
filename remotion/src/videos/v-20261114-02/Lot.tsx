// Build: "Rohan's cart is one tiny piece of the $297B Costco sold that year."
// The parking lot from above: close on Rohan's cart rolling out of the doors (tagged ROHAN), the camera pulls
// back on "tiny" to a lot full of carts, more pour out on "piece", the roof sign lights on "Costco" and the
// billboard on the roof counts up to the year's sales on "sold".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, STROKE, Stage, Tag, Txt, View, countText, motion, rng } from "../../flat/kit";
import { BLUE, Cart, RED } from "./props";

type Params = { fig?: { sales?: string } };

const Lot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sales = (p.beat.params as Params).fig?.sales ?? "";
  const the = m.at("the", 50), tiny = m.at("tiny", 20), piece = m.at("piece", 34), costco = m.at("costco", 90), sold = m.at("sold", 100);
  const back = m.lerp([tiny - 2, tiny + 18], [0, 1], Easing.inOut(Easing.cubic));
  const rush = Math.round(p.fps * 3.4);
  const up = m.lerp([sold - 6, sold + 12], [0, 1], Easing.inOut(Easing.cubic));
  const nudge = m.lerp([rush, rush + 14], [0, 1], Easing.inOut(Easing.cubic)) * (1 - up);
  const zoom = 2.3 - 1.3 * back + 0.18 * nudge + 0.35 * up, cx = 540, cy = 960 - 160 * back + 60 * nudge - 300 * up;
  const r = rng("lot");
  const carts = Array.from({ length: 48 }).map((_, i) => [80 + r() * 860, 900 + r() * 420, i] as const);
  const shown = Math.round(m.lerp([tiny, piece + 20], [0, 30])) + Math.round(m.lerp([rush, rush + 14], [0, 18]));
  const lit = m.t >= costco;
  const k = m.lerp([the, sold + 6], [0, 1], Easing.out(Easing.quad));
  const carCols = ["#e8432f", "#3d6fd1", "#f4f1e8", "#2a2f3d", "#2bb673", "#ffc43d"];
  return (
    <Stage p={p} bg="#6d7385" vignette={0.3}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={2600} fill="#6d7385" />
        {/* parking rows */}
        {[1000, 1200].map((y) => Array.from({ length: 11 }).map((_, i) => (
          <g key={`${y}-${i}`}>
            <line x1={-100 + i * 120} y1={y - 60} x2={-100 + i * 120} y2={y + 60} stroke="#e8e6df" strokeWidth={5} />
            {(i * 7 + y) % 3 ? <g><Block x={-80 + i * 120} y={y - 50} w={80} h={100} r={18} fill={carCols[(i + y / 100) % 6]!} sw={4} />{m.t > rush && Math.floor((m.t - rush) / 5) % 2 === 0 && m.t < rush + 30 ? <><Glow x={-60 + i * 120} y={y + 46} r={26} color="#fff6a0" o={0.9} /><Glow x={-20 + i * 120} y={y + 46} r={26} color="#fff6a0" o={0.9} /></> : null}</g> : null}
          </g>
        )))}
        {/* the warehouse roof */}
        <Block x={60} y={240} w={960} h={600} fill="#b9bcc6" shadow="bottom" depth={0.08} />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={110 + i * 115} y={290} width={60} height={60} fill="#9fa3ae" stroke={INK} strokeWidth={3} />)}
        <Block x={60} y={790} w={960} h={50} fill={RED} shadow={false} />
        <Block x={430} y={800} w={220} h={40} fill="#2a2f3d" shadow={false} />
        {lit ? <Glow x={540} y={530} r={500} color="#ff5a6e" o={0.35 + m.wave(9, 0.05)} /> : null}
        <Txt x={540} y={385} size={110} fill={lit ? "#ffffff" : "#d7d9e0"} glow={lit ? RED : undefined} stroke={INK}>COSTCO</Txt>
        <Display x={150} y={460} w={780} h={280} label="SOLD IN ONE YEAR" value={countText(sales, k)} color="#ffd23f" k={m.pop(the - 2, 12)} />
        {/* carts pouring out */}
        {carts.slice(0, shown).map(([x, y, i]) => {
          const g = m.pop(i < 30 ? tiny + i * 1.2 : rush + (i - 30) * 0.8, 14);
          return <g key={i} transform={`translate(${540 + (x - 540) * g} ${840 + (y - 840) * g})`}><Cart x={0} y={0} s={0.22} full={0.8} /></g>;
        })}
        {/* Rohan's cart, tagged */}
        <g transform={`translate(${m.lerp([0, tiny], [0, 30])} ${m.lerp([0, tiny], [850, 935])})`}>
          <Cart x={540} y={0} s={0.42} />
          <Tag x={450} y={-260} w={190} h={70} text="ROHAN" size={46} bg="#ffffff" fg={BLUE} k={m.pop(2, 10) * (1 - m.lerp([tiny, tiny + 10], [0, 1]))} />
        </g>
        <rect x={-500} y={1400} width={2080} height={20} fill="#585d6e" stroke={INK} strokeWidth={STROKE} />
      </View>
    </Stage>
  );
};

export default Lot;
