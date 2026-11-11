/**
 * The things "What does $1 billion actually look like?" is about, drawn for this video only.
 * From the Short it expands (v-20261027-01): one big hundred, a strap, a pallet of cash, the forklift
 * and the warehouse room. New for the long version: a wallet spending a day's money, an hourglass of
 * years, a savings jar, a coin fountain (money that pays itself), a crowd of billionaires, a globe
 * with pins, a rocket (SpaceX, what it makes), an electric car (Tesla, what it makes) and a
 * warehouse district (the room multiplied).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const NOTE = "#9dc79f", NOTE_INK = "#3c6b44", BAND = "#efe9c8";

// a banded brick of notes seen from the side, the unit every bigger thing is built from
const Brick: React.FC<{ x: number; y: number; w: number; h: number; s: number }> = ({ x, y, w, h, s }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h * 0.12} fill={NOTE} stroke={INK} strokeWidth={line(s) * 0.6} />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={h} fill={BAND} stroke={INK} strokeWidth={line(s) * 0.4} />
    <rect x={x + w * 0.05} y={y + h * 0.45} width={w * 0.9} height={Math.max(1, h * 0.06)} fill={NOTE_INK} opacity={0.35} />
  </g>
);

const props: PropSet = {
  // one big hundred-dollar bill standing on its edge: the portrait oval, the corner seals
  hundred: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(${Math.sin(t * 1.3) * 2})`}>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.95} y={-s * 0.92} w={s * 1.9} h={s * 0.9} fill={NOTE} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.86} y={-s * 0.84} width={s * 1.72} height={s * 0.74} rx={s * 0.04} fill="none" stroke={NOTE_INK} strokeWidth={line(s) * 0.8} />
      <ellipse cx={0} cy={-s * 0.47} rx={s * 0.26} ry={s * 0.3} fill={BAND} stroke={NOTE_INK} strokeWidth={line(s) * 0.8} />
      <Ball cx={0} cy={-s * 0.55} rx={s * 0.1} fill={shade(NOTE_INK, 0.3)} s={s * 0.6} />
      <path d={`M${-s * 0.16},${-s * 0.24} Q0,${-s * 0.42} ${s * 0.16},${-s * 0.24}`} fill={shade(NOTE_INK, 0.3)} />
      <Ball cx={-s * 0.62} cy={-s * 0.47} rx={s * 0.14} fill={PALETTE.gold} s={s * 0.6} />
      <Ball cx={s * 0.62} cy={-s * 0.47} rx={s * 0.14} fill={NOTE_INK} s={s * 0.6} />
      <Paint x={0} y={-s * 0.13} text="USA" size={s * 0.09} fill={NOTE_INK} />
    </g>
  ),
  // a strap of hundreds: a thick brick of notes with a paper band round the middle
  strap: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)})`}>
      <Shadow w={s * 1.2} s={s} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-s * 0.6 + (i % 2) * s * 0.01} y={-s * (0.1 + i * 0.07)} width={s * 1.2} height={s * 0.075} rx={s * 0.02} fill={i % 2 ? NOTE : shade(NOTE, -0.08)} stroke={INK} strokeWidth={line(s) * 0.5} />
      ))}
      <Box x={-s * 0.6} y={-s * 0.56} w={s * 1.2} h={s * 0.12} fill={NOTE} s={s} r={0.2} sheen />
      <rect x={-s * 0.12} y={-s * 0.6} width={s * 0.24} height={s * 0.6} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // a pallet: a wooden base with a cube of notes wrapped in shiny film on top
  pallet: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.12} w={s * 1.1} h={s * 0.12} fill={PALETTE.tan} s={s} r={0.05} sheen={false} />
      {[-0.4, 0, 0.4].map((x) => <rect key={x} x={s * x - s * 0.06} y={-s * 0.08} width={s * 0.12} height={s * 0.08} fill={shade(PALETTE.tan, -0.4)} />)}
      {[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2].map((c) => (
        <Brick key={`${r}${c}`} x={-s * 0.5 + c * s * 0.335} y={-s * 0.27 - r * s * 0.145} w={s * 0.33} h={s * 0.14} s={s} />
      )))}
      <rect x={-s * 0.52} y={-s * 1.0} width={s * 1.04} height={s * 0.86} rx={s * 0.03} fill="#dff3ff" opacity={0.18} stroke="#fff" strokeOpacity={0.6} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.4 + ((t * 0.2) % 1) * s * 0.6},${-s * 0.98} l${s * 0.2},${s * 0.82}`} stroke="#fff" strokeWidth={s * 0.04} opacity={0.35} />
    </g>
  ),
  // a forklift: yellow body, mast and forks, a rotating beacon
  forklift: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <rect x={s * 0.32} y={-s * 1.0} width={s * 0.07} height={s * 0.9} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.36} y={-s * 0.14} width={s * 0.38} height={s * 0.05} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.5} y={-s * 0.5} w={s * 0.84} h={s * 0.36} fill={PALETTE.yellow} s={s} r={0.12} />
      <path d={`M${-s * 0.32},${-s * 0.5} L${-s * 0.28},${-s * 0.9} L${s * 0.22},${-s * 0.9} L${s * 0.28},${-s * 0.5}`} fill="none" stroke={INK} strokeWidth={s * 0.04} />
      <Ball cx={-s * 0.3} cy={-s * 0.12} rx={s * 0.13} fill={PALETTE.dark} s={s} />
      <Ball cx={s * 0.18} cy={-s * 0.12} rx={s * 0.13} fill={PALETTE.dark} s={s} />
      <Ball cx={-s * 0.03} cy={-s * 0.95} rx={s * 0.06} fill={Math.sin(t * 10) > 0 ? PALETTE.orange : PALETTE.red} s={s} />
    </g>
  ),
  // the room: a warehouse wall with roller doors; k > 0 shows the bricks of notes packed inside
  warehouse: ({ s, k: k0 = 0, state }) => {
    const k = state === "full" ? 1 : k0;
    return (
    <g>
      <Box x={-s * 0.9} y={-s * 0.75} w={s * 1.8} h={s * 0.75} fill={PALETTE.grey} s={s} r={0.02} sheen={false} />
      <Shape d={`M${-s * 0.95},${-s * 0.75} L0,${-s * 1.0} L${s * 0.95},${-s * 0.75} Z`} fill={PALETTE.dark} s={s} />
      {[-0.5, 0, 0.5].map((x) => (
        <g key={x}>
          <rect x={s * x - s * 0.18} y={-s * 0.5} width={s * 0.36} height={s * 0.5} fill={shade(PALETTE.grey, -0.25)} stroke={INK} strokeWidth={line(s) * 0.6} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={s * x - s * 0.18} x2={s * x + s * 0.18} y1={-s * (0.42 - i * 0.1)} y2={-s * (0.42 - i * 0.1)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
          {k > 0 && [0, 1, 2].map((r) => <Brick key={`b${r}`} x={s * x - s * 0.16} y={-s * 0.14 - r * s * 0.13 * k} w={s * 0.32} h={s * 0.12} s={s} />)}
        </g>
      ))}
    </g>
    );
  },
  // a paycheck: a long slip with a signature and a green stripe
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.4, 0.02)}) rotate(-5)`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.62} y={-s * 0.6} w={s * 1.24} h={s * 0.52} fill={PALETTE.cream} s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.62} y={-s * 0.6} width={s * 1.24} height={s * 0.1} fill={PALETTE.green} />
      <Paint x={-s * 0.25} y={-s * 0.36} text="PAY" size={s * 0.12} fill={PALETTE.green} />
      <rect x={s * 0.05} y={-s * 0.42} width={s * 0.45} height={s * 0.08} rx={s * 0.02} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.5},${-s * 0.17} q${s * 0.07},${-s * 0.08} ${s * 0.14},0 t${s * 0.14},0`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" strokeLinecap="round" />
    </g>
  ),
  // a leather wallet with notes sticking out: k (0..1) is how much of the day's money has gone
  wallet: ({ s, t, k = 0 }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.012)})`}>
      <Shadow w={s * 1.1} s={s} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-s * 0.42 + i * s * 0.08} y={-s * (0.78 - k * 0.3) - i * s * 0.04} width={s * 0.7} height={s * 0.3} rx={s * 0.02}
          fill={i % 2 ? NOTE : shade(NOTE, -0.1)} stroke={INK} strokeWidth={line(s) * 0.5} opacity={1 - k * 0.6} />
      ))}
      <Box x={-s * 0.55} y={-s * 0.62} w={s * 1.1} h={s * 0.62} fill={PALETTE.brown} s={s} r={0.1} />
      <rect x={-s * 0.55} y={-s * 0.62} width={s * 1.1} height={s * 0.16} fill={shade(PALETTE.brown, -0.25)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Ball cx={s * 0.38} cy={-s * 0.32} rx={s * 0.06} fill={PALETTE.gold} s={s * 0.6} />
    </g>
  ),
  // an hourglass of years: k (0..1) is how much sand has fallen; it spins slowly when state is "spin"
  hourglass: ({ s, t, k = 0.3, state }) => {
    const top = 1 - k, rot = state === "spin" ? (t * 40) % 360 : Math.sin(t * 1.2) * 3;
    return (
      <g transform={`translate(0,${-s * 0.5}) rotate(${rot})`}>
        <Box x={-s * 0.4} y={-s * 0.52} w={s * 0.8} h={s * 0.08} fill={PALETTE.brown} s={s} r={0.2} sheen={false} />
        <Box x={-s * 0.4} y={s * 0.44} w={s * 0.8} h={s * 0.08} fill={PALETTE.brown} s={s} r={0.2} sheen={false} />
        <path d={`M${-s * 0.32},${-s * 0.44} L${s * 0.32},${-s * 0.44} L${s * 0.04},0 L${s * 0.32},${s * 0.44} L${-s * 0.32},${s * 0.44} L${-s * 0.04},0 Z`}
          fill="#dff3ff" opacity={0.55} stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.32 * top},${-s * 0.44 * top + 0.001} L${s * 0.32 * top},${-s * 0.44 * top} L${s * 0.03},${-s * 0.02} L${-s * 0.03},${-s * 0.02} Z`} fill={PALETTE.gold} />
        <path d={`M${-s * 0.32},${s * 0.44} L${s * 0.32},${s * 0.44} L${s * 0.32 * (1 - k * 0.6)},${s * 0.44 * (1 - k)} L${-s * 0.32 * (1 - k * 0.6)},${s * 0.44 * (1 - k)} Z`} fill={PALETTE.gold} />
        <line x1={0} y1={0} x2={0} y2={s * 0.44 * (1 - k * 0.9)} stroke={PALETTE.gold} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.02} ${s * 0.02}`} strokeDashoffset={-t * s * 0.3} />
        {[-0.3, 0.3].map((x) => <rect key={x} x={s * x - s * 0.03} y={-s * 0.46} width={s * 0.06} height={s * 0.92} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      </g>
    );
  },
  // a glass savings jar on the shelf: k (0..1) is how full of coins it is
  savejar: ({ s, t, k = 0.3 }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.32} y={-s * 0.82 * k - s * 0.06} width={s * 0.64} height={s * 0.82 * k} fill={PALETTE.gold} />
      {[0, 1, 2, 3].map((i) => i / 4 < k && (
        <ellipse key={i} cx={-s * 0.15 + (i % 2) * s * 0.3} cy={-s * 0.12 - i * s * 0.18} rx={s * 0.1} ry={s * 0.04} fill={shade(PALETTE.gold, -0.25)} />
      ))}
      <path d={`M${-s * 0.36},${-s * 0.9} L${-s * 0.36},${-s * 0.06} Q${-s * 0.36},0 ${-s * 0.3},0 L${s * 0.3},0 Q${s * 0.36},0 ${s * 0.36},${-s * 0.06} L${s * 0.36},${-s * 0.9}`}
        fill="#dff3ff" opacity={0.35} stroke={INK} strokeWidth={line(s)} />
      <Box x={-s * 0.4} y={-s * 1.02} w={s * 0.8} h={s * 0.14} fill={PALETTE.red} s={s} r={0.2} />
      <rect x={-s * 0.08} y={-s * 1.0} width={s * 0.16} height={s * 0.04} fill={INK} />
      <path d={`M${-s * 0.25},${-s * 0.8} l0,${s * 0.5}`} stroke="#fff" strokeWidth={line(s) * 0.8} opacity={0.4 + 0.2 * Math.sin(t * 2)} />
    </g>
  ),
  // a stone fountain spouting coins: money paying itself; k (0..1) is how strong the jet is
  fountain: ({ s, t, k = 0.6 }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.7} y={-s * 0.28} w={s * 1.4} h={s * 0.28} fill={PALETTE.grey} s={s} r={0.15} />
      <ellipse cx={0} cy={-s * 0.28} rx={s * 0.66} ry={s * 0.08} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.08} y={-s * 0.62} width={s * 0.16} height={s * 0.34} fill={shade(PALETTE.grey, -0.15)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.32} y={-s * 0.7} w={s * 0.64} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.3} sheen={false} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const ph = (t * (0.8 + k) + i / 8) % 1, side = i % 2 ? 1 : -1;
        const x = side * ph * s * (0.25 + 0.06 * (i % 3)), y = -s * 0.72 - Math.sin(ph * Math.PI) * s * (0.3 + 0.4 * k) + ph * s * 0.42;
        return <ellipse key={i} cx={x} cy={y} rx={s * 0.06} ry={s * 0.06 * Math.abs(Math.cos(t * 6 + i))+ s * 0.01} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />;
      })}
    </g>
  ),
  // a crowd of tiny people in suits, the billionaires' club; k (0..1) is how many have arrived
  crowd: ({ s, t, k = 1 }) => {
    const n = 12, show = Math.max(1, Math.round(n * k));
    return (
      <g>
        <Shadow w={s * 1.6} s={s} />
        {Array.from({ length: show }).map((_, i) => {
          const row = i < 6 ? 1 : 0, col = i % 6, x = (col - 2.5) * s * 0.24 + row * s * 0.1, y = -row * s * 0.14;
          const suit = [PALETTE.navy, PALETTE.dark, PALETTE.purple][i % 3]!;
          return (
            <g key={i} transform={`translate(${x},${y + bob(t + i, s, 2, 0.01)})`}>
              <Shape d={`M${-s * 0.08},0 L${-s * 0.08},${-s * 0.3} Q0,${-s * 0.38} ${s * 0.08},${-s * 0.3} L${s * 0.08},0 Z`} fill={suit} s={s * 0.5} />
              <path d={`M0,${-s * 0.33} l${-s * 0.025},${s * 0.1} l${s * 0.025},${s * 0.05} l${s * 0.025},${-s * 0.05} Z`} fill={PALETTE.gold} />
              <Ball cx={0} cy={-s * 0.42} rx={s * 0.065} fill={PALETTE.skin} s={s * 0.5} />
            </g>
          );
        })}
      </g>
    );
  },
  // a globe on a stand with gold pins popping up: k (0..1) is how many pins
  globe: ({ s, t, k = 0.5 }) => {
    const pins = [[-0.18, -0.72], [0.12, -0.8], [0.22, -0.6], [-0.05, -0.52], [0.3, -0.75], [-0.25, -0.58], [0.05, -0.68], [-0.12, -0.86]];
    const spin = (t * 0.08) % 1;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <Box x={-s * 0.3} y={-s * 0.08} w={s * 0.6} h={s * 0.08} fill={PALETTE.brown} s={s} r={0.3} sheen={false} />
        <rect x={-s * 0.03} y={-s * 0.3} width={s * 0.06} height={s * 0.22} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
        <Ball cx={0} cy={-s * 0.68} rx={s * 0.38} fill={PALETTE.blue} s={s} />
        {[0, 1, 2].map((i) => {
          const cx = ((spin + i / 3) % 1 - 0.5) * s * 0.7;
          return <ellipse key={i} cx={cx} cy={-s * (0.62 + 0.12 * (i % 2))} rx={s * 0.12} ry={s * 0.08} fill={PALETTE.green} opacity={1 - Math.abs(cx) / (s * 0.4)} />;
        })}
        <ellipse cx={0} cy={-s * 0.68} rx={s * 0.38} ry={s * 0.38} fill="none" stroke={INK} strokeWidth={line(s)} />
        {pins.slice(0, Math.round(pins.length * k)).map(([x, y], i) => (
          <g key={i}><line x1={s * x!} y1={s * y!} x2={s * x!} y2={s * y! - s * 0.08} stroke={INK} strokeWidth={line(s) * 0.5} />
            <Ball cx={s * x!} cy={s * y! - s * 0.1} rx={s * 0.035} fill={PALETTE.gold} s={s * 0.5} /></g>
        ))}
      </g>
    );
  },
  // a rocket on its pad (what SpaceX makes); state "launch" lifts it on a flame
  rocket: ({ s, t, state }) => {
    const up = state === "launch" ? Math.min(1, (t % 6) / 3) * s * 0.25 : 0;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <g transform={`translate(0,${-up})`}>
          {state === "launch" && <Shape d={`M${-s * 0.08},${-s * 0.1} Q0,${s * (0.15 + 0.05 * Math.sin(t * 30))} ${s * 0.08},${-s * 0.1} Z`} fill={PALETTE.orange} s={s * 0.5} />}
          <Shape d={`M${-s * 0.1},${-s * 0.1} L${-s * 0.1},${-s * 0.8} Q0,${-s * 1.05} ${s * 0.1},${-s * 0.8} L${s * 0.1},${-s * 0.1} Z`} fill="#f4f6fa" s={s} />
          <Shape d={`M${-s * 0.1},${-s * 0.3} L${-s * 0.22},${-s * 0.1} L${-s * 0.1},${-s * 0.1} Z`} fill={PALETTE.dark} s={s} />
          <Shape d={`M${s * 0.1},${-s * 0.3} L${s * 0.22},${-s * 0.1} L${s * 0.1},${-s * 0.1} Z`} fill={PALETTE.dark} s={s} />
          <Ball cx={0} cy={-s * 0.62} rx={s * 0.05} fill={PALETTE.blue} s={s * 0.5} />
          <rect x={-s * 0.1} y={-s * 0.45} width={s * 0.2} height={s * 0.04} fill={PALETTE.dark} />
        </g>
      </g>
    );
  },
  // an electric car (what Tesla makes): a low sleek body, a charging plug on its side
  evcar: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 3, 0.006)})`}>
      <Shadow w={s * 1.5} s={s} />
      <Shape d={`M${-s * 0.75},${-s * 0.12} L${-s * 0.72},${-s * 0.28} Q${-s * 0.4},${-s * 0.34} ${-s * 0.25},${-s * 0.48} L${s * 0.25},${-s * 0.48} Q${s * 0.5},${-s * 0.34} ${s * 0.75},${-s * 0.26} L${s * 0.75},${-s * 0.12} Z`} fill={PALETTE.red} s={s} />
      <path d={`M${-s * 0.2},${-s * 0.44} L${s * 0.22},${-s * 0.44} L${s * 0.4},${-s * 0.3} L${-s * 0.36},${-s * 0.3} Z`} fill="#bfe3ff" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Ball cx={-s * 0.45} cy={-s * 0.1} rx={s * 0.12} fill={PALETTE.dark} s={s} />
      <Ball cx={s * 0.45} cy={-s * 0.1} rx={s * 0.12} fill={PALETTE.dark} s={s} />
      <path d={`M${s * 0.58},${-s * 0.22} l${s * 0.02},${-s * 0.06} l${-s * 0.03},0 l${s * 0.02},${-s * 0.06}`} stroke={PALETTE.yellow} strokeWidth={line(s) * 0.7} fill="none" />
    </g>
  ),
  // a district of warehouses to the horizon, each one a billion: k (0..1) is how many are lit
  district: ({ s, t, k = 0.5 }) => {
    const n = 15;
    return (
      <g>
        {Array.from({ length: n }).map((_, i) => {
          const row = Math.floor(i / 5), col = i % 5, sc = 1 - row * 0.22;
          const x = (col - 2) * s * 0.42 * sc, y = -row * s * 0.22;
          const lit = i / n < k;
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${sc})`} opacity={1 - row * 0.15}>
              <Box x={-s * 0.18} y={-s * 0.22} w={s * 0.36} h={s * 0.22} fill={lit ? PALETTE.grey : PALETTE.dark} s={s * 0.4} r={0.04} sheen={false} />
              <Shape d={`M${-s * 0.2},${-s * 0.22} L0,${-s * 0.3} L${s * 0.2},${-s * 0.22} Z`} fill={PALETTE.navy} s={s * 0.4} />
              <rect x={-s * 0.07} y={-s * 0.14} width={s * 0.14} height={s * 0.14} fill={lit ? (Math.sin(t * 2 + i) > -0.6 ? NOTE : shade(NOTE, -0.2)) : shade(PALETTE.dark, -0.2)} stroke={INK} strokeWidth={2} />
            </g>
          );
        })}
      </g>
    );
  },
  // a gold crown on a velvet cushion: the very top of the list
  crown: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8, 0.015)})`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.5} y={-s * 0.22} w={s * 1.0} h={s * 0.22} fill={PALETTE.purple} s={s} r={0.4} />
      <Shape d={`M${-s * 0.4},${-s * 0.24} L${-s * 0.46},${-s * 0.78} L${-s * 0.2},${-s * 0.5} L0,${-s * 0.9} L${s * 0.2},${-s * 0.5} L${s * 0.46},${-s * 0.78} L${s * 0.4},${-s * 0.24} Z`} fill={PALETTE.gold} s={s} />
      {[-0.46, 0, 0.46].map((x, i) => <Ball key={i} cx={s * x} cy={-s * (i === 1 ? 0.92 : 0.8)} rx={s * 0.06} fill={i === 1 ? PALETTE.red : PALETTE.blue} s={s * 0.5} />)}
      <rect x={-s * 0.38} y={-s * 0.36} width={s * 0.76} height={s * 0.07} fill={shade(PALETTE.gold, -0.25)} />
      <path d={`M${-s * 0.25},${-s * 0.62} l${s * 0.06},${-s * 0.1}`} stroke="#fff" strokeWidth={line(s)} opacity={0.5 + 0.4 * Math.sin(t * 3)} strokeLinecap="round" />
    </g>
  ),
  // a property deed: a scroll with a little building drawn on it and a red wax seal (rent from buildings)
  deed: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.015)}) rotate(4)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.38} y={-s * 0.98} w={s * 0.76} h={s * 0.9} fill={PALETTE.cream} s={s} r={0.04} sheen={false} />
      <rect x={-s * 0.42} y={-s * 1.02} width={s * 0.84} height={s * 0.08} rx={s * 0.04} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.84} text="DEED" size={s * 0.1} fill={PALETTE.navy} />
      <Box x={-s * 0.18} y={-s * 0.66} w={s * 0.36} h={s * 0.26} fill={PALETTE.blue} s={s * 0.6} r={0.03} sheen={false} />
      {[0, 1].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-s * 0.14 + c * s * 0.1} y={-s * 0.62 + r * s * 0.11} width={s * 0.06} height={s * 0.06} fill={PALETTE.yellow} />))}
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.28} y={-s * (0.32 - i * 0.07)} width={s * (0.56 - i * 0.12)} height={s * 0.025} fill={PALETTE.grey} />)}
      <Ball cx={s * 0.22} cy={-s * 0.18} rx={s * 0.09} fill={PALETTE.red} s={s * 0.6} />
    </g>
  ),
  // an office wall clock, the hours of work: state "spin" whirls the hands
  clock: ({ s, t, state }) => {
    const sp = state === "spin" ? 8 : 0.3;
    return (
      <g transform={`translate(0,${-s * 0.5})`}>
        <Ball cx={0} cy={0} rx={s * 0.46} fill={PALETTE.white} s={s} />
        <circle cx={0} cy={0} r={s * 0.46} fill="none" stroke={PALETTE.navy} strokeWidth={s * 0.06} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.sin(a) * s * 0.36} y1={-Math.cos(a) * s * 0.36} x2={Math.sin(a) * s * 0.41} y2={-Math.cos(a) * s * 0.41} stroke={INK} strokeWidth={line(s) * 0.7} />;
        })}
        <line x1={0} y1={0} x2={Math.sin(t * sp * 0.1) * s * 0.22} y2={-Math.cos(t * sp * 0.1) * s * 0.22} stroke={INK} strokeWidth={line(s) * 1.4} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(t * sp) * s * 0.34} y2={-Math.cos(t * sp) * s * 0.34} stroke={PALETTE.red} strokeWidth={line(s) * 0.8} strokeLinecap="round" />
        <Ball cx={0} cy={0} rx={s * 0.04} fill={INK} s={s * 0.4} />
      </g>
    );
  },
  // a sports arena seen from above the rim: tiers of seats round a pitch; k (0..1) is how full it is
  arena: ({ s, t, k = 0.2 }) => (
    <g>
      <Shadow w={s * 1.8} s={s} />
      <ellipse cx={0} cy={-s * 0.32} rx={s * 0.9} ry={s * 0.32} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s)} />
      {[0, 1, 2].map((r) => (
        <ellipse key={r} cx={0} cy={-s * 0.32} rx={s * (0.8 - r * 0.14)} ry={s * (0.27 - r * 0.045)} fill="none" stroke={shade(PALETTE.grey, -0.2)} strokeWidth={s * 0.05} />
      ))}
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2, r = 0.66 + (i % 3) * 0.06;
        return i / 36 < k ? <circle key={i} cx={Math.cos(a) * s * r} cy={-s * 0.32 + Math.sin(a) * s * r * 0.33} r={s * 0.025} fill={[PALETTE.navy, PALETTE.purple, PALETTE.gold][i % 3]} /> : null;
      })}
      <ellipse cx={0} cy={-s * 0.32} rx={s * 0.42} ry={s * 0.13} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.6} />
      <line x1={0} y1={-s * 0.45} x2={0} y2={-s * 0.19} stroke="#fff" strokeWidth={line(s) * 0.5} opacity={0.7 + 0.2 * Math.sin(t)} />
    </g>
  ),
  // a share certificate: a framed paper with a small rising chart and a gold seal (owning part of a company)
  sharecert: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.7, 0.015)}) rotate(-3)`}>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.6} y={-s * 0.86} w={s * 1.2} h={s * 0.8} fill={PALETTE.cream} s={s} r={0.03} sheen={false} />
      <rect x={-s * 0.53} y={-s * 0.79} width={s * 1.06} height={s * 0.66} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.9} strokeDasharray={`${s * 0.03} ${s * 0.015}`} />
      <Paint x={0} y={-s * 0.64} text="SHARES" size={s * 0.1} fill={PALETTE.green} />
      <path d={`M${-s * 0.4},${-s * 0.22} L${-s * 0.2},${-s * 0.32} L${-s * 0.02},${-s * 0.28} L${s * 0.18},${-s * 0.46}`} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Ball cx={s * 0.36} cy={-s * 0.28} rx={s * 0.1} fill={PALETTE.gold} s={s * 0.6} />
    </g>
  ),
  // a bond: a rolled document tied with a red ribbon and a percent tag (interest paid to its owner)
  bond: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.1, 0.015)})`}>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.6} y={-s * 0.46} w={s * 1.2} h={s * 0.36} fill={PALETTE.cream} s={s} r={0.5} />
      <ellipse cx={-s * 0.6} cy={-s * 0.28} rx={s * 0.07} ry={s * 0.18} fill={shade(PALETTE.cream, -0.15)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.08} y={-s * 0.47} width={s * 0.16} height={s * 0.38} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={s * 0.12} y={-s * 0.86} w={s * 0.36} h={s * 0.3} fill={PALETTE.gold} s={s * 0.6} r={0.15} />
      <Paint x={s * 0.3} y={-s * 0.66} text="%" size={s * 0.18} fill={INK} />
      <line x1={s * 0.1} y1={-s * 0.46} x2={s * 0.2} y2={-s * 0.58} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
};

export default props;
