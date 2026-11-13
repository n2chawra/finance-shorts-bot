// Reference directed beat: "About $53 of that goes on new shows and films." The camera pulls back from
// Rohan's window: coins stream out of it along a glowing line across the city into the studio lot, the
// figure pops beside the stream, the studio door glows on "shows" and the director cheers.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Glow, INK, STROKE, Stage, Tag, Txt, View, motion, rng, shade } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { shows?: string } };

const Coins: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const share = (p.beat.params as Params).fig?.shows ?? "";
  const about = m.at("about", 4), shows = m.at("shows", 60);
  const p0 = [330, 560], c = [990, 430], p1 = [790, 1330];
  const along = (u: number) => [(1 - u) ** 2 * p0[0]! + 2 * (1 - u) * u * c[0]! + u * u * p1[0]!, (1 - u) ** 2 * p0[1]! + 2 * (1 - u) * u * c[1]! + u * u * p1[1]!];
  const back = m.lerp([0, 32], [0, 1], Easing.out(Easing.cubic));
  const r = rng("nfx-skyline");
  return (
    <Stage p={p} bg="#070a24" vignette={0.48}
      defs={<linearGradient id="nfx-night2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a24" /><stop offset="1" stopColor="#2a2160" /></linearGradient>}>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#nfx-night2)" />
      <View zoom={(2.4 + (1 - 2.4) * back) * m.lerp([32, m.end], [1, 1.05])} cx={300 + 240 * back} cy={545 + 415 * back}>
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={r() * 1080} cy={r() * 500} r={r() * 2.5 + 1} fill="#fff" opacity={0.8} />)}
        <circle cx={920} cy={210} r={56} fill="#fff3c4" />
        <Glow x={920} y={210} r={200} color="#fff3c4" o={0.4} />
        {Array.from({ length: 9 }).map((_, i) => {
          const h = 380 + r() * 420, x = i * 130 - 30;
          return (
            <g key={i}>
              <rect x={x} y={1500 - h} width={120} height={h} fill={i % 2 ? "#1c1846" : "#251f58"} stroke={INK} strokeWidth={3} />
              {Array.from({ length: Math.floor(h / 50) }).map((_, kk) =>
                [0, 1, 2].map((cI) => {
                  const v = r();
                  return <rect key={`${kk}-${cI}`} x={x + 14 + cI * 34} y={1500 - h + 20 + kk * 50} width={20} height={26} fill={v < 0.35 ? "#8fd0ff" : v < 0.6 ? "#ffd27a" : "#141238"} />;
                }),
              )}
            </g>
          );
        })}
        <rect x={-200} y={1500} width={1480} height={600} fill="#1f1d3a" />
        <line x1={-200} y1={1500} x2={1280} y2={1500} stroke={INK} strokeWidth={STROKE} />
        {/* Rohan's building, his window lit */}
        <Block x={-40} y={300} w={400} h={1200} fill="#4a3f86" />
        {Array.from({ length: 13 }).map((_, kk) =>
          [0, 1, 2].map((cI) => {
            const v = r();
            return <rect key={`${kk}-${cI}`} x={20 + cI * 110} y={360 + kk * 86} width={60} height={50} fill={v < 0.4 ? "#9fdcff" : v < 0.65 ? "#ffd27a" : "#1a1838"} stroke={INK} strokeWidth={3} />;
          }),
        )}
        <Glow x={300} y={545} r={180} color="#ffcf7a" o={0.75} />
        <rect x={250} y={480} width={110} height={130} fill="#ffe2a8" stroke={INK} strokeWidth={STROKE} />
        {/* the studio lot */}
        <path d="M 520 1500 L 520 1220 Q 790 980 1060 1220 L 1060 1500 Z" fill="#d7d2e6" stroke={INK} strokeWidth={STROKE} />
        <path d="M 900 1500 L 900 1150 Q 990 1170 1060 1220 L 1060 1500 Z" fill={shade("#d7d2e6", -0.18)} />
        <path d="M 520 1220 Q 790 980 1060 1220" fill="none" stroke={INK} strokeWidth={STROKE} />
        <Glow x={790} y={1400} r={260} color="#ffcf7a" o={0.55 + 0.35 * m.pulse(shows + 2, 16)} />
        <rect x={690} y={1290} width={200} height={210} fill="#ffcf7a" stroke={INK} strokeWidth={STROKE} />
        <Block x={640} y={1175} w={300} h={70} fill="#1d1a2b" r={8} shadow={false} />
        <Txt x={790} y={1212} size={40} fill="#ffc43d" deco>STUDIO</Txt>
        {/* the money travels: coins along a glowing line */}
        <path d={`M ${p0.join(" ")} Q ${c.join(" ")} ${p1.join(" ")}`} fill="none" stroke="#ffd970" strokeWidth={8} strokeDasharray="4 18" strokeDashoffset={-m.t * 4} strokeLinecap="round" />
        {m.t >= about ? Array.from({ length: 9 }).map((_, i) => {
          const u = ((m.t - about) / 58 + i / 9) % 1;
          const [x, y] = along(0.04 + u * 0.92);
          return (
            <g key={i}>
              <Glow x={x!} y={y!} r={70} color="#ffd970" o={0.45} />
              <Coin x={x!} y={y!} r={36} tilt={-30 + u * 80} spin={0.2 + 0.8 * Math.abs(Math.cos(m.t / 4 + i))} />
            </g>
          );
        }) : null}
        <Tag x={800} y={700} w={190} h={96} text={share} rot={6} k={m.pop(about + 6, 9)} />  {/* the figure is said right after "About" */}
        <Char x={790} y={1520 - Math.abs(Math.sin(m.t / 5)) * 18} s={160} skin="#b9733f" top="#2a2f3d" hair="cap" hat="#ffc43d" face="grin"
          armL={[150 + Math.sin(m.t / 4) * 15, 172]} armR={[150 + Math.cos(m.t / 4) * 15, 172]} />
      </View>
    </Stage>
  );
};

export default Coins;
