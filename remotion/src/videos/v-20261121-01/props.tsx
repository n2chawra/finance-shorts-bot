// Props for the Uber fare Short: the night street, the Uber car, the fare receipt that tears in two, the phone
// with the fare, coin streams, the glass jar in Uber's office.
import React from "react";
import { Ball, Block, Coin, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";

export const NIGHT = "#141a3a";
export const UBERGREEN = "#06c167";

/** The night street: sky, far towers with lit windows, street lamps, the road and kerb. */
export const Street: React.FC<{ m: Motion }> = ({ m }) => (
  <g>
    <rect x={-600} y={-600} width={2280} height={1700} fill={NIGHT} />
    <rect x={-600} y={500} width={2280} height={600} fill="#26306a" />
    {[-260, 40, 330, 640, 900, 1180].map((x, i) => (
      <g key={i}>
        <Block x={x} y={260 + (i % 3) * 120} w={240} h={1000} fill={["#2e3878", "#36418a", "#2a3270"][i % 3]!} shadow={false} />
        {Array.from({ length: 12 }).map((_, r) => [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={x + 30 + c * 70} y={300 + (i % 3) * 120 + r * 70} width={36} height={38} rx={4}
            fill={(r * 3 + c + i) % 4 === 0 ? "#3b4588" : "#ffd98a"} opacity={0.55 + 0.35 * Math.sin(m.t / 9 + r + c + i)} />
        )))}
      </g>
    ))}
    {[-120, 520, 1160].map((x) => (
      <g key={x}>
        <rect x={x - 8} y={700} width={16} height={560} fill="#3a3f55" stroke={INK} strokeWidth={4} />
        <rect x={x - 50} y={680} width={100} height={28} rx={10} fill="#3a3f55" stroke={INK} strokeWidth={4} />
        <Glow x={x} y={720} r={260} color="#ffd98a" o={0.35} />
      </g>
    ))}
    <rect x={-600} y={1240} width={2280} height={60} fill="#8b8fa6" stroke={INK} strokeWidth={STROKE} />
    <rect x={-600} y={1300} width={2280} height={1000} fill="#2b2d3c" />
  </g>
);

/** The Uber car, side on: black body, windows, wheels, the real Uber logo on the door. */
export const UberCar: React.FC<{ x: number; y: number; s?: number; m: Motion; lit?: number; driver?: React.ReactNode }> = ({ x, y, s = 1, m, lit = 1, driver }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={430} ry={30} fill="#000" opacity={0.35} />
    <path d="M -420 -40 L -400 -170 Q -380 -200 -330 -205 L -230 -210 L -140 -330 Q -120 -350 -80 -350 L 160 -350 Q 200 -350 230 -320 L 330 -210 L 400 -195 Q 430 -185 430 -150 L 430 -40 Z" fill="#1c1d24" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d="M -200 -215 L -125 -320 L 20 -320 L 20 -215 Z" fill="#7fb8ff" stroke={INK} strokeWidth={5} opacity={0.9} />
    <path d="M 45 -215 L 45 -320 L 160 -320 Q 185 -320 200 -300 L 280 -215 Z" fill="#7fb8ff" stroke={INK} strokeWidth={5} opacity={0.9} />
    {driver}
    <line x1={32} y1={-210} x2={32} y2={-50} stroke="#000" strokeWidth={4} />
    <rect x={-330} y={-180} width={40} height={20} rx={6} fill="#ffe7a3" />
    <rect x={385} y={-180} width={40} height={24} rx={6} fill="#ff5a4a" />
    <Glow x={-345} y={-170} r={130} color="#fff1c9" o={0.5} />
    <g transform="translate(-95 -70)" opacity={0.4 + 0.6 * lit}>
      <rect x={-130} y={-80} width={260} height={100} rx={18} fill="#ffffff" stroke={INK} strokeWidth={4} />
      <Photo name="uber" s={78} t={m.t / 30} />
    </g>
    {[-260, 270].map((wx) => (
      <g key={wx} transform={`rotate(${m.t * 4} ${wx} -20)`}>
        <Ball x={wx} y={-20} r={70} fill="#2a2a32" />
        <circle cx={wx} cy={-20} r={30} fill="#9aa0b4" stroke={INK} strokeWidth={4} />
        <line x1={wx - 30} y1={-20} x2={wx + 30} y2={-20} stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** The fare receipt: white paper, the Uber logo strip, a zig-zag foot; `tear` 0..1 pulls the halves apart. */
export const Receipt: React.FC<{ x: number; y: number; w: number; h: number; m: Motion; tear?: number; label?: string; value?: string; rot?: number }> = ({ x, y, w, h, m, tear = 0, label, value, rot = 0 }) => {
  const half = (side: -1 | 1) => {
    const dx = side * tear * 170, r = side * tear * 14, dy = tear * 40;
    const jag = Array.from({ length: 9 }).map((_, i) => `${i % 2 ? 14 : -14},${-h / 2 + (i * h) / 8}`);
    const pts = side < 0
      ? `${-w / 2},${-h / 2} ${jag.join(" ")} ${-w / 2},${h / 2}`
      : `${w / 2},${-h / 2} ${w / 2},${h / 2} ${[...jag].reverse().join(" ")}`;
    const id = `rc${side < 0 ? "l" : "r"}${Math.round(x)}${Math.round(y)}`;
    return (
      <g transform={`translate(${dx} ${dy}) rotate(${r})`}>
        <clipPath id={id}><polygon points={pts} /></clipPath>
        <g clipPath={`url(#${id})`}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#fffdf6" />
          <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.24} fill="#000000" />
          {[0.56, 0.66, 0.76, 0.86].map((f) => <rect key={f} x={-w / 2 + 40} y={-h / 2 + h * f} width={w - 80} height={8} rx={4} fill="#d9d3c4" />)}
        </g>
        <polygon points={pts} fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + m.wave(70, 8)}) rotate(${rot})`}>
      {half(-1)}
      {half(1)}
      <g opacity={1 - tear}>
        <g transform={`translate(0 ${-h / 2 + h * 0.2})`}><Photo name="uber" s={h * 0.12} t={0} /></g>
        {label ? <Txt x={0} y={-h / 2 + h * 0.36} size={46} fill={INK}>{label}</Txt> : null}
        {value ? <Txt x={0} y={-h / 2 + h * 0.47} size={80} fill={INK}>{value}</Txt> : null}
      </g>
    </g>
  );
};

/** A stream of coins flying from a to b, starting at frame `from` (n coins, `gap` frames apart). */
export const CoinStream: React.FC<{ m: Motion; a: [number, number]; b: [number, number]; from: number; n?: number; gap?: number; dur?: number; arc?: number; r?: number }> = ({ m, a, b, from, n = 7, gap = 3, dur = 16, arc = 220, r = 30 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const k = (m.t - from - i * gap) / dur;
      if (k <= 0 || k >= 1) return null;
      const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * arc;
      return <Coin key={i} x={x} y={y} r={r} spin={Math.abs(Math.cos((m.t + i * 5) / 4))} />;
    })}
  </g>
);

/** A glass jar with `fill` (0..1) coins inside and a tag strip. */
export const Jar: React.FC<{ x: number; y: number; w: number; h: number; fill: number; shake?: number }> = ({ x, y, w, h, fill, shake = 0 }) => {
  const level = Math.max(0, Math.min(1, fill));
  const rows = Math.round(level * 8);
  return (
    <g transform={`translate(${x + shake} ${y})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={40} fill="#cfe9ff" opacity={0.35} stroke={INK} strokeWidth={STROKE} />
      {Array.from({ length: rows }).map((_, r) => [0, 1, 2, 3].map((c) => (
        <ellipse key={`${r}-${c}`} cx={-w / 2 + 60 + c * ((w - 120) / 3) + (r % 2) * 18} cy={-34 - r * 34} rx={34} ry={16} fill="#f5c542" stroke={INK} strokeWidth={3} />
      )))}
      <rect x={-w / 2 - 14} y={-h - 40} width={w + 28} height={56} rx={14} fill="#3a3f55" stroke={INK} strokeWidth={STROKE} />
      <rect x={-w / 2 + 30} y={-h + 30} width={24} height={h - 80} rx={12} fill="#ffffff" opacity={0.35} />
    </g>
  );
};
export default Street;
