// Payoff: "The auction fees alone came to $50.3M, on a painting once sold for £45."
// The auction house's counting room at night: cash bundles stack up on the counting table on "fees", the stack towers
// over the clerk on "alone", the table's tag stamps the fee figure on "came" as the camera closes in, and on
// "painting" the camera pulls back to the old paper tag pinned on the wall beside the stack, swinging on "once".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Bundle, HangLamp, PaperTag } from "./props";

type Params = { fig?: { fees?: string; old?: string } };

const Fees: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const fees = m.at("fees", 2), alone = m.at("alone", 12), came = m.at("came", 22), painting = m.at("painting", 56), once = m.at("once", 66);
  const close = m.lerp([came - 4, came + 10], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([painting - 4, painting + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.3 * close - 0.25 * wide, cx = 520 + 0 * close + 60 * wide, cy = 860 - 60 * close + 80 * wide;
  const n = Math.floor(m.lerp([fees - 2, alone + 14], [4, 18]));
  const stamp = m.t < came ? 0 : m.pop(came, 9);
  return (
    <Stage p={p} bg="#141a2a" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(80, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#2a3352" />
        {Array.from({ length: 20 }).map((_, i) => <rect key={`w${i}`} x={-400 + i * 96} y={-400} width={48} height={1700} fill="#2f3a5e" />)}
        {Array.from({ length: 5 }).map((_, i) => <rect key={`s${i}`} x={-300 + i * 180} y={200 + (i % 2) * 60} width={140} height={180} rx={8} fill="#3a4470" stroke="#1d1a2b" strokeWidth={4} />)}
        <rect x={-400} y={1300} width={1880} height={900} fill="#1e2338" />
        <HangLamp x={460} y={60} sway={m.wave(90, 2)} />
        {/* the counting table and the cash tower */}
        {Array.from({ length: n }).map((_, i) => <Bundle key={i} x={310 + ((i * 37) % 3) * 6} y={1110 - i * 34} w={300} />)}
        <Glow x={460} y={800} r={360} color="#7fe0a0" o={0.25} />
        <Block x={180} y={1140} w={560} h={60} fill="#6b4a2e" />
        <Block x={220} y={1200} w={40} h={120} fill="#5a3a26" sw={4} />
        <Block x={660} y={1200} w={40} h={120} fill="#5a3a26" sw={4} />
        <Tag x={250} y={1010 - n * 34 - 100} w={420} h={110} text={F.fees ?? ""} bg="#ffd23f" k={stamp} rot={-4} />
        {/* the clerk counting */}
        <Char x={210} y={1500} s={190} outfit="shirt" top="#e8e1d4" accent="#c74634" hair="side" skin="#e2a679" glasses face={m.t >= alone ? "shock" : "neutral"} look={[0.6, -0.6]} armR={[110, 80 + 20 * Math.sin(m.t / 2)]} armL={[20, 10]} />
        {/* the old tag, pinned on the wall */}
        <g opacity={m.lerp([painting - 6, painting + 4], [0.4, 1])}>
          <PaperTag x={800} y={560} text={F.old ?? ""} rot={6 + (m.t >= once ? Math.sin((m.t - once) / 3) * 14 * Math.max(0, 1 - (m.t - once) / 30) : 0)} s={0.85} />
        </g>
      </View>
    </Stage>
  );
};

export default Fees;
