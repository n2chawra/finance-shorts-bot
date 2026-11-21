/**
 * Going Down's avatar (800×800) and banner (2560×1440; the name inside YouTube's 1546×423 safe area),
 * from channels/going-down/branding/kit.md, in the approved sample's flat cutaway look and palette:
 * a yellow arrow diving through sky, soil and bedrock with a depth meter, and a wide cutaway strip
 * (skyline above; tunnels, trains, a vault and bedrock below; depth ticks in ft). Our own shapes only.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../design/fonts";
import { Ball, Block, Glow, INK, STROKE, rng } from "../flat/kit";

const SKY = "#7fb2e6";
const DUSK = "#ffb27a";
const SOIL = "#6e4b35";
const SOIL_DARK = "#5c3d2b";
const CLAY = "#80593f";
const SCHIST = "#4f4a5a";
const SCHIST_BAND = "#5f596b";
const DEEP = "#2b2530";
const YELLOW = "#ffc43d";
const CREAM = "#f4f1e8";
const STONE = "#ead8b4";
const CITY = "#5d6a8e";

const Arrow: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const sw = w * 0.42, head = h * 0.42;
  const d = `M ${x - sw / 2} ${y} H ${x + sw / 2} V ${y + h - head} H ${x + w / 2} L ${x} ${y + h} L ${x - w / 2} ${y + h - head} H ${x - sw / 2} Z`;
  return (
    <g>
      <path d={d} fill="#000" opacity={0.25} transform="translate(14 14)" />
      <path d={d} fill={YELLOW} stroke={INK} strokeWidth={STROKE * 2.4} strokeLinejoin="round" />
      <path d={`M ${x + sw * 0.12} ${y + 10} V ${y + h - head - 6}`} stroke="#fff3c4" strokeWidth={sw * 0.18} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

export const DiveAvatar: React.FC = () => {
  const r = rng("dive-avatar");
  const stones = Array.from({ length: 26 }, () => ({ x: r() * 800, y: 400 + r() * 150, s: 9 + r() * 16 }));
  return (
    <AbsoluteFill style={{ background: SCHIST }}>
      <svg width={800} height={800} viewBox="0 0 800 800">
        <defs><clipPath id="gd-av"><circle cx={400} cy={400} r={400} /></clipPath></defs>
        <g clipPath="url(#gd-av)">
          {/* sky with a low skyline */}
          <rect width={800} height={330} fill={SKY} />
          <rect y={250} width={800} height={80} fill={DUSK} />
          {[[40, 190, 120], [170, 140, 110], [520, 170, 120], [650, 120, 130]].map(([x, y, w], i) => (
            <Block key={i} x={x!} y={y!} w={w!} h={330 - y!} fill={CITY} shadow={false} sw={8} />
          ))}
          {/* street, soil, bedrock with schist bands, deep */}
          <rect y={316} width={800} height={34} fill="#3a3d4a" stroke={INK} strokeWidth={8} />
          <rect y={350} width={800} height={210} fill={SOIL} />
          {stones.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.7} fill={i % 2 ? SOIL_DARK : CLAY} />)}
          <rect y={560} width={800} height={240} fill={SCHIST} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M -20 ${600 + i * 52} q 210 ${i % 2 ? 22 : -22} 420 0 t 420 0`} stroke={SCHIST_BAND} strokeWidth={14} fill="none" />)}
          <line x1={0} x2={800} y1={560} y2={560} stroke={INK} strokeWidth={8} />
          {/* depth meter on the left */}
          <rect x={92} y={330} width={22} height={420} rx={11} fill="#1f1c26" stroke={INK} strokeWidth={6} />
          <rect x={96} y={334} width={14} height={300} rx={7} fill={YELLOW} />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={118} x2={150} y1={360 + i * 80} y2={360 + i * 80} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />)}
          <Glow x={400} y={600} r={220} color={YELLOW} o={0.35} />
          <Arrow x={400} y={150} w={330} h={560} />
        </g>
        <circle cx={400} cy={400} r={396} fill="none" stroke={INK} strokeWidth={8} />
      </svg>
    </AbsoluteFill>
  );
};

const Train: React.FC<{ x: number; y: number; color: string; stripe: string; cars?: number }> = ({ x, y, color, stripe, cars = 3 }) => (
  <g>
    {Array.from({ length: cars }, (_, c) => {
      const cx = x + c * 300;
      return (
        <g key={c}>
          <Block x={cx} y={y - 110} w={286} h={110} fill={color} r={c === cars - 1 ? 30 : 12} shadow="bottom" />
          <rect x={cx + 6} y={y - 40} width={274} height={11} fill={stripe} />
          {[0, 1, 2].map((wv) => <Block key={wv} x={cx + 26 + wv * 84} y={y - 94} w={62} h={42} fill="#fff6c9" r={6} shadow={false} sw={4} />)}
          <circle cx={cx + 56} cy={y + 4} r={12} fill="#22232b" /><circle cx={cx + 230} cy={y + 4} r={12} fill="#22232b" />
        </g>
      );
    })}
  </g>
);

const Tunnel: React.FC<{ x: number; y: number; w: number; h: number; light: string; train?: { color: string; stripe: string; dx: number; cars?: number } }> = ({ x, y, w, h, light, train }) => {
  const id = `gd-tun-${x}-${y}`;
  return (
    <g>
      <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={30} fill={DEEP} />
      <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={22} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#3a3340" />
        {Array.from({ length: Math.floor(w / 220) }, (_, i) => <Glow key={i} x={x + 110 + i * 220} y={y + 24} r={110} color={light} o={0.5} />)}
        {Array.from({ length: Math.floor(w / 220) }, (_, i) => <rect key={`l${i}`} x={x + 76 + i * 220} y={y + 14} width={70} height={9} fill="#fffbe6" />)}
        <rect x={x} y={y + h - 34} width={w} height={34} fill="#3d3a44" />
        <rect x={x} y={y + h - 22} width={w} height={6} fill="#a9a4b3" />
        {train ? <Train x={x + train.dx} y={y + h - 26} color={train.color} stripe={train.stripe} cars={train.cars} /> : null}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={22} fill="none" stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

/** Three flat landmark silhouettes on the skyline: a station with a clock, an arena of arches, a needle tower. */
const Station: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <Block x={x} y={g - 330} w={520} h={330} fill={STONE} shadow="right" />
    <Block x={x - 20} y={g - 370} w={560} h={50} fill="#d8c296" shadow="bottom" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={x + 60 + i * 150} y={g - 260} width={100} height={220} fill="#7cb6e0" stroke={INK} strokeWidth={STROKE} />
        <path d={`M ${x + 60 + i * 150} ${g - 260} a 50 50 0 0 1 100 0`} fill="#7cb6e0" stroke={INK} strokeWidth={STROKE} />
      </g>
    ))}
    <Ball x={x + 260} y={g - 420} r={62} fill={YELLOW} />
    <Ball x={x + 260} y={g - 420} r={42} fill="#fff6dc" shadow={false} sw={4} />
    <path d={`M ${x + 260} ${g - 420} v -26 M ${x + 260} ${g - 420} h 22`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Arena: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <path d={`M ${x} ${g} V ${g - 250} Q ${x + 260} ${g - 300} ${x + 520} ${g - 330} V ${g} Z`} fill="#d9b98a" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    {[0, 1, 2].map((row) => Array.from({ length: 7 }, (_, i) => (
      <path key={`${row}-${i}`} d={`M ${x + 30 + i * 70} ${g - 20 - row * 80} v -40 a 22 22 0 0 1 44 0 v 40 Z`} fill="#6b4a32" opacity={row === 2 && i < 2 ? 0 : 1} />
    )))}
  </g>
);
const Needle: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <path d={`M ${x - 90} ${g} L ${x - 30} ${g - 700} L ${x} ${g - 980} L ${x + 30} ${g - 700} L ${x + 90} ${g} Z`} fill="#9fb3cf" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d={`M ${x + 10} ${g - 900} L ${x + 30} ${g - 700} L ${x + 90} ${g}`} fill="none" stroke="#7d92b0" strokeWidth={18} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={x - 70 + i * 9} x2={x + 70 - i * 9} y1={g - 120 - i * 110} y2={g - 120 - i * 110} stroke={INK} strokeWidth={4} opacity={0.5} />)}
  </g>
);

export const DiveBanner: React.FC = () => {
  const W = 2560, H = 1440, G = 640;   // G: street level
  const FT = 4;                         // banner pixels per foot (not to scale, like the videos)
  const r = rng("dive-banner");
  const stones = Array.from({ length: 140 }, () => ({ x: r() * W, y: G + 50 + r() * 300, s: 8 + r() * 22, k: r() }));
  return (
    <AbsoluteFill style={{ background: SCHIST }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* sky and skyline */}
        <rect width={W} height={G} fill={SKY} />
        <rect y={G - 260} width={W} height={260} fill={DUSK} />
        <Glow x={W / 2} y={G - 200} r={900} color="#ffd9a0" o={0.45} />
        {[[60, 260], [330, 180], [820, 300], [1000, 220], [1560, 260], [1700, 160], [2140, 280], [2380, 200]].map(([x, h], i) => (
          <Block key={i} x={x!} y={G - 200 - h!} w={170} h={200 + h!} fill={CITY} shadow={false} sw={5} />
        ))}
        <Station x={200} g={G} />
        <Needle x={1280} g={G} />
        <Arena x={1840} g={G} />
        {/* taxis on the street */}
        <Block x={0} y={G} w={W} h={46} fill="#3a3d4a" shadow={false} />
        {[120, 900, 1500, 2300].map((x, i) => (
          <g key={i} transform={`translate(${x} ${G - 44})`}>
            <Block x={0} y={0} w={150} h={44} fill={YELLOW} r={10} shadow={false} sw={5} />
            <Block x={32} y={-24} w={80} h={28} fill={YELLOW} r={8} shadow={false} sw={5} />
          </g>
        ))}
        {/* soil, bedrock, deep */}
        <rect y={G + 46} width={W} height={340} fill={SOIL} />
        {stones.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.s} ry={s.s * 0.7} fill={s.k < 0.5 ? SOIL_DARK : CLAY} />)}
        <rect y={G + 386} width={W} height={H - G - 386} fill={SCHIST} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M 0 ${G + 420 + i * 46} q 640 ${i % 2 ? 26 : -26} 1280 0 t 1280 0`} stroke={SCHIST_BAND} strokeWidth={10} fill="none" />)}
        <line x1={0} x2={W} y1={G + 386} y2={G + 386} stroke={INK} strokeWidth={STROKE} />
        {/* tunnels left and right of the name, a vault and a deep tunnel below */}
        <Tunnel x={150} y={G + 110} w={760} h={200} light="#ffe7a8" train={{ color: "#dfe3ea", stripe: "#3a9d5d", dx: 40, cars: 2 }} />
        <Tunnel x={1650} y={G + 110} w={760} h={200} light="#f0c8ff" train={{ color: "#dfe3ea", stripe: "#b03ab8", dx: 160, cars: 2 }} />
        <Tunnel x={240} y={G + 470} w={900} h={220} light="#cfe3ff" train={{ color: "#dfe3ea", stripe: "#d23a3a", dx: 60, cars: 3 }} />
        <g>
          <Block x={1500} y={G + 470} w={560} h={240} fill="#2f3a34" r={14} shadow="bottom" />
          {[0, 1, 2].map((i) => <Ball key={i} x={1600 + i * 180} y={G + 600} r={58} fill="#6f8577" />)}
          {[0, 1, 2].map((i) => <line key={i} x1={1600 + i * 180 - 34} x2={1600 + i * 180 + 34} y1={G + 600 + (i - 1) * 14} y2={G + 600 - (i - 1) * 14} stroke="#c9d6cc" strokeWidth={10} strokeLinecap="round" />)}
          <Ball x={2010} y={G + 506} r={16} fill="#ff5a4a" shadow={false} sw={4} />
        </g>
        {/* depth meter, left edge */}
        <rect x={40} y={G - 10} width={26} height={H - G - 20} rx={13} fill="#1f1c26" stroke={INK} strokeWidth={5} />
        <rect x={45} y={G - 5} width={16} height={480} rx={8} fill={YELLOW} />
        {[0, 25, 50, 75, 100, 125, 150, 175].map((ft) => (
          <g key={ft}>
            <line x1={70} x2={ft % 50 === 0 ? 110 : 92} y1={G + ft * FT} y2={G + ft * FT} stroke={CREAM} strokeWidth={5} strokeLinecap="round" />
            {ft % 50 === 0 ? <text x={118} y={G + ft * FT + 12} fontFamily={FONT} fontWeight={800} fontSize={34} fill={CREAM}>{`${ft} ft`}</text> : null}
          </g>
        ))}
        {/* name panel inside the safe area (507..2053 × 508..931) */}
        <g transform={`translate(${W / 2} ${H / 2})`}>
          <rect x={-680} y={-170} width={1360} height={340} rx={22} fill="#000" opacity={0.25} transform="translate(12 14)" />
          <rect x={-680} y={-170} width={1360} height={340} rx={22} fill="#111318" stroke={INK} strokeWidth={STROKE} />
          <rect x={-660} y={-150} width={1320} height={8} fill={CREAM} />
          <g transform="translate(-560 -112) scale(0.42)"><Arrow x={0} y={0} w={330} h={540} /></g>
          <text x={-450} y={34} fontFamily={FONT} fontWeight={800} fontSize={140} letterSpacing={4} fill={CREAM}>GOING DOWN</text>
          <text x={-446} y={112} fontFamily={FONT} fontWeight={700} fontSize={48} fill={YELLOW}>Under famous places, layer by layer</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
