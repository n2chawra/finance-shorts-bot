// Promise: "Not the groceries. So where does all the cart money go?"
// A grocery aisle of giant packs: Rohan stops his cart on "Not", giant packs tumble in on "groceries", he looks
// up on "where" as the camera pulls back, and on "go" the dollar notes lift out of the cart and drift away.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, INK, STROKE, Stage, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BLUE, Cart, Note, RED } from "./props";

const Aisle: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const not = m.at("not", 2), gro = m.at("groceries", 14), where = m.at("where", 34), cart = m.at("cart", 50), go = m.at("go", 62);
  const pull = m.lerp([where - 2, cart + 10], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.45 - 0.45 * pull, cy = 1060 - 160 * pull;
  const roll = m.lerp([0, not + 6], [-180, 0], Easing.out(Easing.back(1.3)));
  const full = m.lerp([gro - 2, gro + 12], [0.2, 1]);
  const r = rng("aisle-notes");
  const notes = Array.from({ length: 9 }).map(() => [r() * 600 - 300, r() * 900 + 200, r() * 80 - 40] as const);
  const cols = ["#ffcf3d", RED, "#2bb673", BLUE, "#f07b2a", "#7b5cff"];
  return (
    <Stage p={p} bg="#e7e9ef" vignette={0.3}>
      <View zoom={zoom} cx={540} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1700} fill="#dfe2ea" />
        <polygon points="380,560 700,560 1480,1300 -400,1300" fill="#a5a8b2" />
        {/* shelves on both sides, receding to the back wall */}
        <Block x={380} y={330} w={320} h={230} fill="#5b6278" shadow={false} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Block key={`w${i}`} x={392 + (i % 3) * 102} y={350 + Math.floor(i / 3) * 100} w={92} h={86} r={6} fill={cols[(i + 2) % 6]!} sw={3} />)}
        {[0, 1].map((side) => [0.45, 0.6, 0.8, 1.05, 1.35].map((d, k) => {
          const xl = 380 - 420 * d, x = side ? 1080 - xl - 200 * d : xl, top = 560 - 520 * d;
          return (
            <g key={`${side}-${k}`}>
              <Block x={x} y={top} w={200 * d} h={760 * d} fill="#5b6278" shadow={false} sw={3} />
              {[0, 1, 2, 3].map((row) => (
                <g key={row}>
                  <Block x={x} y={top + (row + 1) * 185 * d} w={200 * d} h={18 * d} fill="#f07b2a" shadow={false} sw={3} />
                  {[0, 1].map((c) => <Block key={c} x={x + 8 * d + c * 96 * d} y={top + (row + 1) * 185 * d - 140 * d} w={88 * d} h={140 * d} r={6} fill={cols[(k + row + c + side) % 6]!} sw={3} />)}
                </g>
              ))}
            </g>
          );
        }))}
        <Glow x={540} y={300} r={420} color="#fff6d8" o={0.4} />
        <g transform={`translate(${roll} 0)`}>
          <Cart x={470} y={1290} s={1.25} full={full} spin={m.t < not + 6 ? m.t * 20 : 0} />
          <Char x={800} y={1310} s={230} who="rohan" hair="side" outfit="shirt" face={m.t > where ? "worried" : "happy"}
            look={m.t > where ? [-0.6, -1] : [-1, 0]} armL={[60, 50]} armR={m.t > where ? [150, 160] : [60, 50]} />
        </g>
        {m.t >= go - 4 ? notes.map(([dx, dist, rot], i) => {
          const k = m.lerp([go - 4 + i * 1.5, go + 26 + i * 1.5], [0, 1], Easing.out(Easing.quad));
          return <Note key={i} x={470 + dx * 0.3 + dx * k} y={1000 - dist * k + m.wave(20, 8, i)} rot={rot + k * 200} w={110} />;
        }) : null}
        <rect x={-400} y={1300} width={1880} height={30} fill="#8d909a" stroke={INK} strokeWidth={STROKE} />
      </View>
    </Stage>
  );
};

export default Aisle;
