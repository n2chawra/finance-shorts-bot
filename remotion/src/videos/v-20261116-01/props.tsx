// Props for the GTA V Short: the game box (our own drawing: a dark cover, a sunset panel grid, the name),
// a box spine for towers and shelves, three console generations, a gamer, a palm tree.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt, shade } from "../../flat/kit";

/** The game box, face on: dark cover, a 2x2 grid of sunset panels with silhouettes, the name across the top. */
export const GameBox: React.FC<{ x: number; y: number; w: number; rot?: number; name?: boolean; dusty?: boolean; sealed?: boolean; label?: string }> = ({
  x, y, w, rot = 0, name = true, dusty, sealed, label = "GTA V",
}) => {
  const h = w * 1.25;
  const pw = (w - 36) / 2, ph = (h - w * 0.36 - 36) / 2;
  const panels = ["#ff8a3d", "#e0457b", "#3fb6c9", "#ffcf4a"];
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 14} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#16151f" stroke={INK} strokeWidth={STROKE} />
      <rect x={x} y={y} width={w} height={w * 0.16} rx={10} fill="#2a5bd7" />
      {name ? <Txt x={x + w / 2} y={y + w * 0.26} size={w * 0.17} fill="#ffffff" weight={900} deco={w * 0.17 < 44}>{label}</Txt> : null}
      {panels.map((c, i) => {
        const px = x + 12 + (i % 2) * (pw + 12), py = y + w * 0.36 + 12 + Math.floor(i / 2) * (ph + 12);
        return (
          <g key={i}>
            <rect x={px} y={py} width={pw} height={ph} fill={c} stroke={INK} strokeWidth={3} />
            <circle cx={px + pw * 0.5} cy={py + ph * 0.42} r={Math.min(pw, ph) * 0.16} fill={shade(c, -0.55)} />
            <rect x={px + pw * 0.38} y={py + ph * 0.55} width={pw * 0.24} height={ph * 0.45} fill={shade(c, -0.55)} />
          </g>
        );
      })}
      {dusty ? <rect x={x} y={y} width={w} height={h} rx={10} fill="#c9b99a" opacity={0.35} /> : null}
      {sealed ? (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={10} fill="#ffffff" opacity={0.16} />
          <line x1={x + w * 0.15} y1={y + 6} x2={x + w * 0.05} y2={y + h - 6} stroke="#ffffff" strokeWidth={6} opacity={0.5} />
        </g>
      ) : null}
    </g>
  );
};

/** A box seen from its spine: for towers, shelves and crates. */
export const Spine: React.FC<{ x: number; y: number; w: number; h?: number; tone?: number }> = ({ x, y, w, h = 56, tone = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={tone % 3 === 0 ? "#16151f" : tone % 3 === 1 ? "#1d1c2a" : "#14131c"} stroke={INK} strokeWidth={4} />
    <rect x={x + 8} y={y + h * 0.3} width={w * 0.12} height={h * 0.4} fill="#2a5bd7" />
    <rect x={x + w * 0.2} y={y + h * 0.38} width={w * 0.55} height={h * 0.24} fill={["#ff8a3d", "#e0457b", "#3fb6c9", "#ffcf4a"][tone % 4]} />
  </g>
);

/** A games console: gen 0 (a fat black box), 1 (a slim slab), 2 (a tall white tower). `on` lights its LED. */
export const Console: React.FC<{ x: number; y: number; gen: 0 | 1 | 2; s?: number; on?: number }> = ({ x, y, gen, s = 1, on = 0 }) => {
  if (gen === 2) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -70 0 L -90 -330 Q -60 -350 -40 -330 L -30 0 Z" fill="#f3f3f6" stroke={INK} strokeWidth={STROKE} />
        <rect x={-38} y={-320} width={76} height={320} fill="#1b1b26" stroke={INK} strokeWidth={STROKE} />
        <path d="M 70 0 L 90 -330 Q 60 -350 40 -330 L 30 0 Z" fill="#e6e6ec" stroke={INK} strokeWidth={STROKE} />
        <rect x={-20} y={-300} width={40} height={8} rx={4} fill={on > 0.5 ? "#5fb6ff" : "#444"} />
        {on > 0.5 ? <Glow x={0} y={-296} r={60} color="#5fb6ff" o={0.6 * on} /> : null}
      </g>
    );
  }
  if (gen === 1) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <polygon points="-170,0 170,0 150,-90 -150,-90" fill="#22222c" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <line x1={-160} y1={-45} x2={160} y2={-45} stroke="#3c3c4a" strokeWidth={8} />
        <rect x={-14} y={-88} width={28} height={6} fill={on > 0.5 ? "#5fb6ff" : "#444"} />
        {on > 0.5 ? <Glow x={0} y={-80} r={70} color="#5fb6ff" o={0.6 * on} /> : null}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Block x={-160} y={-120} w={320} h={120} r={18} fill="#2b2b33" />
      <rect x={-130} y={-80} width={180} height={14} rx={7} fill="#111" />
      <Ball x={110} y={-60} r={18} fill={on > 0.5 ? "#59e36d" : "#444"} sw={3} shadow={false} />
      {on > 0.5 ? <Glow x={110} y={-60} r={60} color="#59e36d" o={0.6 * on} /> : null}
    </g>
  );
};

/** A game controller held in two hands. */
export const Pad: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -20 Q -80 -40 -50 -42 L 50 -42 Q 80 -40 70 -20 L 82 30 Q 84 52 62 46 L 30 14 L -30 14 L -62 46 Q -84 52 -82 30 Z" fill="#2a2a36" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-38} cy={-12} r={10} fill="#555" />
    <circle cx={40} cy={-18} r={6} fill="#ff5a5a" />
    <circle cx={52} cy={-6} r={6} fill="#5fb6ff" />
  </g>
);

/** A palm tree (the game's sunny coast). */
export const Palm: React.FC<{ x: number; y: number; h: number; sway?: number; color?: string }> = ({ x, y, h, sway = 0, color = "#2d1f3d" }) => {
  const tx = x + sway, ty = y - h;
  return (
    <g>
      <path d={`M ${x - 10} ${y} Q ${x + sway * 0.3} ${y - h * 0.5} ${tx - 4} ${ty} L ${tx + 6} ${ty} Q ${x + sway * 0.3 + 12} ${y - h * 0.5} ${x + 10} ${y} Z`} fill={color} />
      {[-150, -110, -60, -20, 25].map((a, i) => {
        const r = (a * Math.PI) / 180, L = h * 0.42;
        return <path key={i} d={`M ${tx} ${ty} Q ${tx + Math.cos(r) * L * 0.6} ${ty + Math.sin(r) * L * 0.6 - 30} ${tx + Math.cos(r) * L} ${ty + Math.sin(r) * L + 30}`} stroke={color} strokeWidth={h * 0.05} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

/** The bedroom at night (the hook and the loop): wall, poster, window, shelf, TV, beanbag, floor. */
export const Bedroom: React.FC<{ tv: number }> = ({ tv }) => (
  <g>
    <rect x={-400} y={-600} width={1880} height={2140} fill="#3a2f6e" />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-400 + i * 160} y={-600} width={80} height={2140} fill="#40347a" />)}
    <rect x={-400} y={1500} width={1880} height={1200} fill="#5b3b55" />
    <line x1={-400} y1={1502} x2={1480} y2={1502} stroke={INK} strokeWidth={STROKE} />
    {/* poster: a sunset over the sea */}
    <rect x={60} y={360} width={250} height={340} fill="#ff8a3d" stroke={INK} strokeWidth={STROKE} />
    <rect x={60} y={560} width={250} height={140} fill="#e0457b" />
    <circle cx={185} cy={540} r={50} fill="#ffe08a" />
    <rect x={60} y={360} width={250} height={340} fill="none" stroke={INK} strokeWidth={STROKE} />
    {/* the TV on a low stand, glowing */}
    <Block x={-120} y={1300} w={420} h={200} fill="#6b4a2e" />
    <rect x={-150} y={940} width={420} height={300} rx={14} fill="#111" stroke={INK} strokeWidth={STROKE} />
    <rect x={-130} y={960} width={380} height={260} fill={tv > 0.5 ? "#4fb0ff" : "#1a2a4a"} />
    <rect x={-130} y={1110} width={380} height={110} fill={tv > 0.5 ? "#ff8a3d" : "#1a2a4a"} opacity={0.8} />
    <Glow x={60} y={1080} r={520} color="#5fa8ff" o={0.35 * tv} />
  </g>
);
export default GameBox;
