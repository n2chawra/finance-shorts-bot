// Build: "Yet the whole profit is just 3.1% of those sales. Nearly every dollar pays for the goods."
// The checkout lane: the till prints a long receipt along the counter on "Yet"; on "profit" the camera pushes in
// on a thin green strip at its very end, the share stamps on it on "sales"; on "dollar" the camera pulls back
// and coins pour out of the till along the belt into the supplier's truck on "goods", the cashier shrugs.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Coin, Glow, INK, STROKE, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BLUE, Cart, RED, frac } from "./props";

type Params = { fig?: { margin?: string } };

const Till: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const margin = (p.beat.params as Params).fig?.margin ?? "";
  const yet = m.at("yet", 2), profit = m.at("profit", 14), sales = m.at("sales", 50), dollar = m.at("dollar", 70), goods = m.at("goods", 90);
  const L = m.lerp([yet, profit], [0, 640], Easing.out(Easing.quad));
  const sliver = Math.max(26, 640 * frac(margin));
  const inn = m.lerp([profit - 2, profit + 14], [0, 1], Easing.inOut(Easing.cubic));
  const out = m.lerp([dollar - 4, dollar + 14], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.1 + 0.6 * inn - 0.75 * out;
  const rohan = m.lerp([0, m.end], [150, 110]);
  const cx = 540 + 280 * inn - 280 * out, cy = 960 - 220 * inn + 210 * out;
  const end = 380 + L;
  return (
    <Stage p={p} bg="#d8dce6" vignette={0.3}>
      <View zoom={zoom} cx={cx} cy={cy}>
        <rect x={-500} y={-500} width={2080} height={1500} fill="#d8dce6" />
        {[0, 1, 2].map((i) => <Block key={i} x={-300 + i * 520} y={160} w={420} h={90} r={12} fill={i % 2 ? BLUE : RED} />)}
        {[0, 1, 2].map((i) => <Txt key={i} x={-90 + i * 520} y={205} size={50} fill="#ffffff" deco>{`LANE ${["ONE", "TWO", "THREE"][i]}`}</Txt>)}
        <Glow x={540} y={200} r={600} color="#fff6d8" o={0.3} />
        <rect x={-500} y={1000} width={2080} height={1200} fill="#a3a7b3" />
        <Char x={250} y={1010} s={210} skin="#8d5a3b" top={RED} hair="bun" hairColor="#2f2836" outfit="shirt"
          face={m.t > goods ? "smirk" : "neutral"} look={[1, 0]} armL={m.t > goods ? [100, 160] : [20, 20]} armR={m.t > goods ? [100, 160] : [40, 60]} />
        {/* counter and belt */}
        <Block x={-200} y={820} w={1300} h={200} fill="#5b6278" shadow="bottom" />
        <rect x={380} y={800} width={800} height={30} fill="#2a2f3d" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={380 + ((i * 60 + m.t * 4) % 800)} y1={802} x2={380 + ((i * 60 + m.t * 4) % 800)} y2={828} stroke="#4a5060" strokeWidth={4} />)}
        {/* the till */}
        <Block x={120} y={620} w={260} h={200} r={14} fill="#e8e6df" />
        <rect x={150} y={650} width={200} height={70} rx={6} fill="#10202a" stroke={INK} strokeWidth={4} />
        <Txt x={250} y={685} size={30} fill="#4dff9a" deco>TOTAL</Txt>
        {Array.from({ length: 6 }).map((_, i) => <Block key={i} x={150 + (i % 3) * 68} y={735 + Math.floor(i / 3) * 38} w={60} h={30} r={5} fill="#c9ccd6" shadow={false} sw={3} />)}
        {/* the receipt along the counter */}
        <rect x={380} y={740} width={L} height={60} fill="#ffffff" stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor(L / 40) }).map((_, i) => <rect key={i} x={392 + i * 40} y={756} width={26} height={8} fill="#b9bcc6" />)}
        {L > 600 ? (
          <g>
            <rect x={end - sliver} y={740} width={sliver} height={60} fill="#2bb673" stroke={INK} strokeWidth={4} />
            <Glow x={end - sliver / 2} y={770} r={120 + 80 * m.pulse(sales, 8)} color="#4dff9a" o={m.t > profit ? 0.6 + m.wave(8, 0.15) + 0.4 * m.pulse(sales, 8) : 0} />
          </g>
        ) : null}
        <g transform={`translate(0 0)`}>
          <line x1={end - sliver / 2} y1={740} x2={end - 70} y2={660} stroke={INK} strokeWidth={5} />
          <Tag x={end - 260} y={560} w={250} h={110} text={margin} size={70} bg="#2bb673" fg="#ffffff" k={m.pop(profit + 4, 9)} />
          {m.t > profit + 2 ? <Txt x={end - 135} y={530} size={44} fill={INK}>PROFIT</Txt> : null}
        </g>
        {/* the supplier truck */}
        <g transform={`translate(${m.lerp([dollar - 10, dollar + 6], [400, 0], Easing.out(Easing.quad))} 0)`}>
          <Block x={1180} y={760} w={420} h={260} r={14} fill="#f4f1e8" />
          <Txt x={1390} y={860} size={56} fill={INK}>SUPPLIERS</Txt>
          <Block x={1600} y={820} w={140} h={200} r={14} fill={BLUE} />
          <Ball x={1260} y={1030} r={40} fill="#2a2f3d" />
          <Ball x={1650} y={1030} r={40} fill="#2a2f3d" />
        </g>
        {/* coins along the belt into the truck */}
        {m.t > dollar ? Array.from({ length: 14 }).map((_, i) => {
          const k = m.lerp([dollar + i * 2.2, dollar + 22 + i * 2.2], [0, 1]);
          if (k <= 0 || k >= 1) return null;
          const x = 260 + k * 1150, y = 660 - Math.sin(k * Math.PI) * 260;
          return <Coin key={i} x={x} y={y} r={30} spin={Math.abs(Math.cos(m.t / 4 + i))} />;
        }) : null}
        <Cart x={rohan + 340} y={1430} s={1.0} full={0.6} />
        <Char x={rohan} y={1440} s={200} who="rohan" hair="side" outfit="shirt" face={m.t > profit ? "worried" : "happy"} look={[-0.6, -0.8]}
          armL={[70, 60]} armR={m.t > goods ? [120, 150] : [20, 15]} />
        <rect x={-500} y={1018} width={2080} height={10} fill={INK} />
        <Block x={-500} y={1018} w={2080} h={1} fill={INK} shadow={false} sw={STROKE} />
      </View>
    </Stage>
  );
};

export default Till;
