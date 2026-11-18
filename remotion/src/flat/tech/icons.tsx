/**
 * A small line-icon set for the tech look: each drawn in a 100×100 box with round strokes, placed by
 * centre and size. Things a viewer knows (a home, a car, a phone) and the things the channel explains
 * (a chip, a GPU, a server, a data centre).
 */
import React from "react";
import { TECH } from "./theme";

export const ICONS = ["chip", "gpu", "server", "bolt", "home", "car", "phone", "bulb", "cloud", "doc", "water", "plane", "city", "brain"] as const;
export type IconName = (typeof ICONS)[number];

const PATHS: Record<IconName, React.ReactNode> = {
  chip: (<>
    <rect x={26} y={26} width={48} height={48} rx={6} /><rect x={38} y={38} width={24} height={24} rx={3} />
    {[34, 50, 66].map((v) => <g key={v}><line x1={v} y1={12} x2={v} y2={26} /><line x1={v} y1={74} x2={v} y2={88} /><line x1={12} y1={v} x2={26} y2={v} /><line x1={74} y1={v} x2={88} y2={v} /></g>)}
  </>),
  gpu: (<>
    <rect x={8} y={28} width={84} height={42} rx={5} /><circle cx={34} cy={49} r={13} /><circle cx={66} cy={49} r={13} />
    <line x1={16} y1={70} x2={16} y2={80} /><line x1={30} y1={70} x2={60} y2={70} /><line x1={30} y1={78} x2={60} y2={78} />
  </>),
  server: (<>
    {[14, 40, 66].map((y) => <g key={y}><rect x={16} y={y} width={68} height={20} rx={4} /><circle cx={28} cy={y + 10} r={2.5} /><line x1={46} y1={y + 10} x2={72} y2={y + 10} /></g>)}
  </>),
  bolt: <polygon points="56,8 22,56 48,56 42,92 78,40 52,40" strokeLinejoin="round" />,
  home: (<><polyline points="12,50 50,16 88,50" /><polyline points="22,42 22,86 78,86 78,42" /><rect x={42} y={60} width={16} height={26} /></>),
  car: (<>
    <path d="M10 64 L18 44 Q22 36 32 36 L68 36 Q78 36 82 44 L90 64 L90 74 L10 74 Z" strokeLinejoin="round" />
    <circle cx={28} cy={76} r={9} /><circle cx={72} cy={76} r={9} /><line x1={22} y1={50} x2={78} y2={50} />
  </>),
  phone: (<><rect x={30} y={8} width={40} height={84} rx={8} /><line x1={44} y1={18} x2={56} y2={18} /><circle cx={50} cy={80} r={3} /></>),
  bulb: (<><path d="M36 64 Q20 52 22 36 Q26 14 50 12 Q74 14 78 36 Q80 52 64 64 Z" strokeLinejoin="round" /><line x1={38} y1={74} x2={62} y2={74} /><line x1={42} y1={84} x2={58} y2={84} /></>),
  cloud: <path d="M26 74 Q8 74 10 58 Q12 44 28 46 Q30 26 50 26 Q68 26 72 44 Q90 42 90 58 Q90 74 74 74 Z" strokeLinejoin="round" />,
  doc: (<><path d="M24 8 L62 8 L80 26 L80 92 L24 92 Z" strokeLinejoin="round" /><polyline points="62,8 62,26 80,26" />{[42, 56, 70].map((y) => <line key={y} x1={34} y1={y} x2={70} y2={y} />)}</>),
  water: <path d="M50 10 Q78 48 78 64 Q78 90 50 90 Q22 90 22 64 Q22 48 50 10 Z" strokeLinejoin="round" />,
  plane: <path d="M50 8 Q56 8 56 20 L56 40 L90 58 L90 66 L56 56 L56 78 L68 86 L68 92 L50 88 L32 92 L32 86 L44 78 L44 56 L10 66 L10 58 L44 40 L44 20 Q44 8 50 8 Z" strokeLinejoin="round" />,
  city: (<>
    <rect x={10} y={44} width={22} height={46} /><rect x={36} y={18} width={28} height={72} /><rect x={68} y={34} width={22} height={56} />
    {[30, 44, 58, 72].map((y) => <line key={y} x1={44} y1={y} x2={56} y2={y} />)}
  </>),
  brain: (<>
    {[[30, 30], [70, 30], [20, 62], [50, 54], [80, 62], [50, 84]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={7} />)}
    <polyline points="30,30 50,54 70,30" /><polyline points="20,62 50,54 80,62" /><polyline points="50,54 50,84" /><line x1={30} y1={30} x2={20} y2={62} /><line x1={70} y1={30} x2={80} y2={62} />
  </>),
};

/** An icon centred on (x, y), `size` px across, in `color`; `k` (0..1) scales it in. */
export const Icon: React.FC<{ name: IconName; x: number; y: number; size: number; color?: string; k?: number; sw?: number }> = ({
  name, x, y, size, color = TECH.text, k = 1, sw = 6,
}) => {
  if (k <= 0) return null;
  const s = (size / 100) * (0.6 + 0.4 * Math.min(1, k));
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -50)`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" opacity={Math.min(1, k * 1.5)}>
      {PATHS[name]}
    </g>
  );
};
