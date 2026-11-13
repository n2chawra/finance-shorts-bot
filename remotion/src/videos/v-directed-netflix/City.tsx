// Reference directed beat: "So who pays? More than 325M paid memberships. Rohan's is one of them."
// The city at night from above: windows switch on in a wave, the billboard on the tallest roof counts to
// the figure, then the camera dives into one window, tagged "Rohan".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, IsoBlock, Limb, STROKE, Stage, Txt, View, countText, isoProjector, motion, pts, rng } from "../../flat/kit";

type Params = { fig?: { members?: string } };

const City: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const members = (p.beat.params as Params).fig?.members ?? "";
  const iso = isoProjector(540, 1060, 52);
  const r = rng("nfx-city");
  const bases = ["#3b3a78", "#4a3f86", "#2f3f7a", "#563f7a", "#3a4a8a"];
  const blocks: { x0: number; y0: number; w: number; d: number; h: number; c: string; seed: string; hero: boolean; home: boolean }[] = [];
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 7; j++)
      blocks.push({ x0: (i - 3) * 4.4, y0: (j - 3.5) * 4.4, w: 2.8 + r() * 0.8, d: 2.8 + r() * 0.8, h: i === 2 && j === 3 ? 10 : 3 + r() * 8,
        c: bases[Math.floor(r() * 5)]!, seed: `b${i}-${j}`, hero: i === 2 && j === 3, home: i === 4 && j === 4 });
  blocks.sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0));
  const hero = blocks.find((b) => b.hero)!;
  const home = blocks.find((b) => b.home)!;
  const top = iso(hero.x0 + hero.w / 2, hero.y0 + hero.d / 2, hero.h);
  const win = iso(home.x0 + home.w * 0.5, home.y0 + home.d, home.h * 0.55);
  const pays = m.at("pays", 12), more = m.at("more", 40), said = m.at("memberships", 100), rohan = m.at("rohan", m.end - 46);
  const count = m.lerp([more, said], [0, 1], Easing.out(Easing.cubic));
  const dive = m.lerp([rohan, m.end], [0, 1], Easing.in(Easing.cubic));
  const zoom = m.lerp([0, pays + 30], [1.3, 1.0]) * (1 + dive * 4.5);
  const follow = Math.min(1, dive * 1.6);
  const stars = rng("nfx-stars");
  return (
    <Stage p={p} bg="#070a24" vignette={0.5}
      defs={<linearGradient id="nfx-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a24" /><stop offset="1" stopColor="#2a2160" /></linearGradient>}>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#nfx-night)" />
      {Array.from({ length: 50 }).map((_, i) => <circle key={i} cx={stars() * 1080} cy={stars() * 420} r={stars() * 2.5 + 1} fill="#ffffff" opacity={0.5 + m.wave(38, 0.4, i)} />)}
      <circle cx={170} cy={200} r={58} fill="#fff3c4" />
      <Glow x={170} y={200} r={220} color="#fff3c4" o={0.4} />
      <View zoom={zoom} cx={540 + (win[0] - 540) * follow} cy={960 + (win[1] - 960) * follow}>
        <polygon points={pts([iso(-16, -18, 0), iso(14, -18, 0), iso(14, 16, 0), iso(-16, 16, 0)])} fill="#1f1d3a" />
        {blocks.map((b) => {
          const lr = rng(b.seed);
          // the lights come on in a wave from the back of the city to the front, from "pays" to "memberships"
          return <IsoBlock key={b.seed} iso={iso} x0={b.x0} y0={b.y0} w={b.w} d={b.d} h={b.h} color={b.c} seed={b.seed}
            lit={() => m.t > pays + lr() * (said - pays) * 0.9 + ((b.x0 + b.y0 + 30) / 60) * 10} />;
        })}
        {m.t >= rohan - 6 ? (
          <g>
            <Glow x={win[0]} y={win[1]} r={90} color="#ffcf7a" o={0.6 + m.wave(19, 0.3)} />
            <rect x={win[0] - 16} y={win[1] - 20} width={32} height={40} fill="#ffe2a8" stroke={INK} strokeWidth={3} />
            <g transform={`translate(${win[0]} ${win[1] - 70}) scale(${m.pop(rohan, 10) / (1 + dive * 4.5)})`}>
              <rect x={-70} y={-34} width={140} height={56} rx={12} fill="#ffc43d" stroke={INK} strokeWidth={5} />
              <Txt x={0} y={-5} size={30} fill={INK} deco>Rohan</Txt>
              <polygon points="-12,22 12,22 0,40" fill="#ffc43d" stroke={INK} strokeWidth={4} />
            </g>
          </g>
        ) : null}
        {/* the figure lives on the billboard */}
        <g transform={`translate(${top[0]} ${top[1]}) scale(${m.pop(more - 4, 10)}) translate(${-top[0]} ${-top[1]})`}>
          <Limb a={[top[0] - 100, top[1]]} b={[top[0] - 100, top[1] - 90]} w={12} color="#5b5f6b" sw={3} />
          <Limb a={[top[0] + 100, top[1]]} b={[top[0] + 100, top[1] - 90]} w={12} color="#5b5f6b" sw={3} />
          <Glow x={top[0]} y={top[1] - 170} r={300} color="#ff4d57" o={0.55} />
          <rect x={top[0] - 190} y={top[1] - 260} width={380} height={180} rx={10} fill="#e50914" stroke={INK} strokeWidth={STROKE} />
          <rect x={top[0] - 176} y={top[1] - 246} width={352} height={152} rx={6} fill="none" stroke="#ffe0e2" strokeWidth={5} />
          <Txt x={top[0]} y={top[1] - 190} size={84} fill="#ffffff">{countText(members, count)}</Txt>
          <Txt x={top[0]} y={top[1] - 125} size={28} fill="#ffe0e2" weight={700} deco>PAID MEMBERSHIPS</Txt>
        </g>
      </View>
    </Stage>
  );
};

export default City;
