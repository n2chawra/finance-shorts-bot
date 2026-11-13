// Reference directed beat: "And it still kept $11B." The vault is open; cash drops onto the shelves on
// "still", the counter over the door counts up to the figure on "kept", the boss smirks beside the door.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Cash, Display, Glow, INK, STROKE, Stage, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { kept?: string } };

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const kept = (p.beat.params as Params).fig?.kept ?? "";
  const still = m.at("still", 10), said = m.at("kept", 24);
  const count = m.lerp([said, said + 20], [0, 1], Easing.out(Easing.cubic));
  const cx = 450, cy = 960, R = 320;
  return (
    <Stage p={p} bg="#232a3d" vignette={0.45}>
      <View zoom={m.lerp([still, m.end], [1.0, 1.1])} cx={m.lerp([still, m.end], [540, 520])} cy={m.lerp([still, m.end], [960, 760])}>
        <rect x={-200} y={-200} width={1480} height={1520} fill="#6b7a99" />
        {[60, 1010].map((x) => <rect key={x} x={x} y={-200} width={46} height={1520} fill="#5d6b88" stroke={INK} strokeWidth={4} />)}
        <rect x={-200} y={1320} width={1480} height={800} fill="#3a4256" />
        <line x1={-200} y1={1322} x2={1280} y2={1322} stroke={INK} strokeWidth={STROKE} />
        <defs><clipPath id="nfx-hole"><circle cx={cx} cy={cy} r={R} /></clipPath></defs>
        <circle cx={cx} cy={cy} r={R} fill="#3b3020" />
        <g clipPath="url(#nfx-hole)">
          <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="#4a3b26" />
          {[cy - 170, cy - 30, cy + 110].map((y, k) => (
            <g key={y}>
              <rect x={cx - R} y={y + 30} width={R * 2} height={16} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
              {Array.from({ length: 9 }).map((_, i) => {
                const d = m.pop(still + k * 4 + i * 1.5, 12);
                return <g key={i} transform={`translate(0 ${(1 - d) * -260})`} opacity={d > 0.02 ? 1 : 0}><Cash x={cx - R + 30 + i * 66 + (k % 2) * 12} y={y + 8} w={60} /></g>;
              })}
              {Array.from({ length: 8 }).map((_, i) => {
                const d = m.pop(still + 12 + k * 4 + i * 1.5, 12);
                return <g key={`b${i}`} transform={`translate(0 ${(1 - d) * -260})`} opacity={d > 0.02 ? 1 : 0}><Cash x={cx - R + 60 + i * 66} y={y - 12} w={60} /></g>;
              })}
            </g>
          ))}
          {[[cx - 120, cy + 250], [cx - 40, cy + 250], [cx + 40, cy + 250], [cx - 80, cy + 222], [cx, cy + 222], [cx - 40, cy + 194]].map(([x, y], i) => (
            <polygon key={i} points={`${x! - 36},${y! + 26} ${x! + 36},${y! + 26} ${x! + 26},${y} ${x! - 26},${y}`} fill="#f2c14e" stroke={INK} strokeWidth={3} />
          ))}
          <Glow x={cx} y={cy} r={R * 1.2} color="#ffb84d" o={0.4 + 0.1 * m.pulse(said, 12)} />
        </g>
        <circle cx={cx} cy={cy} r={R + 22} fill="none" stroke="#8e9bb8" strokeWidth={44} />
        <circle cx={cx} cy={cy} r={R + 44} fill="none" stroke={INK} strokeWidth={STROKE} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={STROKE} />
        {/* the door, swung open */}
        <ellipse cx={858} cy={cy + 10} rx={118} ry={R + 30} fill="#7d89a6" stroke={INK} strokeWidth={STROKE} />
        <ellipse cx={880} cy={cy + 10} rx={118} ry={R + 30} fill="#a9b4cc" stroke={INK} strokeWidth={STROKE} />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <Ball key={i} x={880 + Math.cos(a) * 92} y={cy + 10 + Math.sin(a) * (R - 10)} r={13} fill="#7d89a6" sw={3} />;
        })}
        <g transform={`rotate(${m.lerp([0, m.end], [0, 40])} 880 ${cy + 10})`}>
          <ellipse cx={880} cy={cy + 10} rx={44} ry={120} fill="none" stroke="#d8dee9" strokeWidth={12} />
        </g>
        {/* the figure lives on the counter over the door */}
        <Display x={230} y={400} w={460} h={190} label="KEPT IN ONE YEAR" value={m.t < said ? "- - -" : countText(kept, count)} />
        <Char x={800} y={1500 + m.wave(63, 3)} s={290} skin="#e2a679" top="#2f3445" pants="#2f3445" outfit="suit" accent="#e0352b" hair="side" hairColor="#2a2233"
          face="smirk" armL={[70, 50]} armR={[35, m.lerp([said, said + 14], [-110, -150])]} tilt={-4 + m.wave(75, 2)} />
      </View>
    </Stage>
  );
};

export default Vault;
