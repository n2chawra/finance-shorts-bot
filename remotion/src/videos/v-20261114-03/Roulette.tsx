// Turn: "And that's not what people bet. It's what was kept after paying every winner."
// The roulette table: close on the wheel as the ball drops on "And", chips pile onto the bets on "bet", the
// croupier rakes the losing chips into the house pile on "kept", the winner is paid a small stack on "paying",
// and on "winner" the camera pulls back: Rohan cheers, while the house pile behind him is far bigger.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, Limb, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Chip } from "./props";

const Roulette: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const and = m.at("and", 2), bet = m.at("bet", 24), kept = m.at("kept", 50), paying = m.at("paying", 62), winner = m.at("winner", 80);
  const mid = m.lerp([kept - 4, kept + 10], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([winner - 4, winner + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.7 - 0.45 * mid - 0.3 * wide, cx = 330 + 180 * mid + 30 * wide, cy = 760 + 120 * mid + 120 * wide;
  const spin = m.t * 6;
  const ballA = m.t < and ? -m.t * 14 : -and * 14 - (m.t - and) * Math.max(0, 14 - (m.t - and) * 0.5);
  const rake = m.lerp([kept, kept + 16], [0, 1], Easing.inOut(Easing.quad));
  const house = Math.round(m.lerp([kept, winner + 10], [0, 26]));
  const cols = ["#e8432f", "#3d6fd1", "#2bb673", "#2a2f3d"];
  return (
    <Stage p={p} bg="#0f2a1e" vignette={0.5}>
      <View zoom={zoom * (1 + 0.03 * Math.sin(m.t / 9.5))} cx={cx + m.wave(70, 16)} cy={cy + m.wave(83, 10)} rot={m.wave(110, 0.6)}>
        <rect x={-500} y={-500} width={2080} height={2700} fill="#2a1430" />
        <Glow x={540} y={600} r={700} color="#ffcf5c" o={0.25} />
        <Char x={760} y={620} s={170} skin="#e0b48a" top="#2a2f3d" hair="side" outfit="suit" face="smirk" look={[-1, 0.5]}
          armR={[60 + 60 * rake, 90]} />
        <Block x={-200} y={520} w={1480} h={720} r={60} fill="#1f8a4c" shadow="bottom" depth={0.12} />
        <rect x={-200} y={1200} width={1480} height={60} fill="#6b3f1f" stroke={INK} strokeWidth={STROKE} />
        {/* the wheel */}
        <ellipse cx={320} cy={760} rx={250} ry={150} fill="#6b3f1f" stroke={INK} strokeWidth={STROKE} />
        <g transform={`translate(320 760) scale(1 0.6)`}>
          {Array.from({ length: 18 }).map((_, i) => {
            const a0 = ((i * 20 + spin) * Math.PI) / 180, a1 = (((i + 1) * 20 + spin) * Math.PI) / 180;
            return <path key={i} d={`M 0 0 L ${Math.cos(a0) * 210} ${Math.sin(a0) * 210} A 210 210 0 0 1 ${Math.cos(a1) * 210} ${Math.sin(a1) * 210} Z`} fill={i === 0 ? "#2bb673" : i % 2 ? "#e8432f" : "#1d1a2b"} stroke="#c9a24a" strokeWidth={3} />;
          })}
          <circle r={90} fill="#c9a24a" stroke={INK} strokeWidth={5} />
          <circle cx={Math.cos((ballA * Math.PI) / 180) * 180} cy={Math.sin((ballA * Math.PI) / 180) * 180} r={18} fill="#ffffff" stroke={INK} strokeWidth={3} />
        </g>
        {/* the betting layout */}
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={620 + (i % 3) * 100} y={720 + Math.floor(i / 3) * 110} width={96} height={106} fill={i % 2 ? "#e8432f" : "#1d1a2b"} stroke="#f4f1e8" strokeWidth={4} />)}
        {m.t > bet - 2 ? Array.from({ length: 10 }).map((_, i) => {
          const k = m.pop(bet - 2 + i * 1.5, 12);
          const x0 = 670 + (i % 3) * 100, y0 = 770 + Math.floor(i / 3) * 110;
          const gone = i > 1 ? rake : 0;
          return k > 0 ? <Chip key={i} x={x0 + (200 - x0) * gone} y={y0 - (1 - k) * 200 + (1060 - y0) * gone} r={34} color={cols[i % 4]!} /> : null;
        }) : null}
        {/* the house pile */}
        {Array.from({ length: house }).map((_, i) => <Chip key={i} x={110 + (i % 4) * 70} y={1150 - Math.floor(i / 4) * 24} r={60} color={cols[i % 4]!} flat />)}
        {house > 0 ? <Txt x={215} y={1150 - Math.floor(house / 4) * 24 - 60} size={46} fill="#ffd23f" stroke={INK}>HOUSE</Txt> : null}
        <Limb a={[760 - 200 * rake, 520]} b={[700 - 300 * rake, 900 - 60 * rake]} w={10} color="#c9a24a" sw={3} />
        {/* the winner's small stack */}
        {m.t > paying ? Array.from({ length: Math.min(4, Math.floor((m.t - paying) / 3) + 1) }).map((_, i) => <Chip key={i} x={860} y={1150 - i * 24} r={60} color="#2bb673" flat />) : null}
        <Char x={860} y={1560} s={200} who="rohan" hair="side" outfit="shirt" face={m.t > winner ? "grin" : "happy"} look={[-0.6, -0.6]}
          armL={m.t > winner ? [150, 170] : [20, 20]} armR={m.t > winner ? [150, 170] : [20, 20]} />
      </View>
    </Stage>
  );
};

export default Roulette;
