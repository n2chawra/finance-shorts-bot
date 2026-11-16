// Build: "From July to September, that snack bar took in $589.4M in all."
// AMC's cash office at closing time: the wall calendar flips from July to September on "From"/"September", cash
// bags from the snack bar slide down a chute and pile up on "snack", they thump onto the counting table on "took",
// the counting machine's display counts up to the figure on "in", and the manager grins over the pile on "all".
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { CashBag } from "./props";

type Params = { fig?: { total?: string } };

const MONTHS = ["JULY", "AUGUST", "SEPTEMBER"];

const CashOffice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const total = (p.beat.params as Params).fig?.total ?? "";
  const from = m.at("from", 1), sep = m.at("september", 18), snack = m.at("snack", 26), took = m.at("took", 36), inn = m.at("in", 40), all = m.at("all", 90);
  const mi = m.t < from + 8 ? 0 : m.t < sep ? 1 : 2;
  const bags = m.t < snack ? 0 : Math.min(10, Math.floor((m.t - snack) / 3) + 1);
  const thump = m.pulse(took + 1, 5);
  const count = m.lerp([inn, inn + 30], [0, 1], Easing.out(Easing.cubic));
  const close = m.lerp([inn - 2, inn + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.04 + 0.04 * close;
  const cx = 540, cy = 860 - 160 * close;
  return (
    <Stage p={p} bg="#1f2a2a" vignette={0.46}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy + thump * 8}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#24343a" />
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-400 + i * 200} y={-400} width={4} height={1800} fill="#2c3e44" />)}
        {/* the calendar */}
        <Block x={70} y={270} w={320} h={280} r={10} fill="#fffdf4" />
        <rect x={70} y={270} width={320} height={80} fill="#d7262b" stroke={INK} strokeWidth={5} />
        <Txt x={230} y={455} size={52} fill={INK}>{MONTHS[mi]!}</Txt>
        {/* the counting machine */}
        <Display x={420} y={290} w={460} h={170} label="SNACK BAR" value={m.t < inn ? "" : countText(total, count)} color="#ffcf4a" />
        <Glow x={650} y={375} r={300} color="#ffcf4a" o={0.5 * m.pulse(inn + 24, 12)} />
        {/* the chute and the bags */}
        <Limb a={[1180, 520]} b={[860, 900]} w={80} color="#7a8a92" />
        {bags > 0 && bags < 10 ? <g transform={`translate(${-80 * ((m.t - snack) % 3) / 3} ${100 * ((m.t - snack) % 3) / 3})`}><CashBag x={1000} y={760} s={0.85} /></g> : null}
        <Block x={60} y={1000} w={960} h={60} fill="#8a6a4a" />
        <Block x={120} y={1060} w={50} h={260} fill="#6a4a2a" shadow={false} />
        <Block x={910} y={1060} w={50} h={260} fill="#6a4a2a" shadow={false} />
        {Array.from({ length: bags }).map((_, i) => <CashBag key={i} x={360 + (i % 5) * 105} y={1000 - Math.floor(i / 5) * 90} s={0.8} />)}
        {/* the manager */}
        <Char x={190} y={1470 + m.wave(60, 3)} s={165} outfit="suit" top="#2a2f3d" pants="#2a2f3d" hair="side" hairColor="#6a6a6a" skin="#e6b08a" glasses
          face={m.t >= all ? "grin" : "neutral"} armR={[90, 130]} armL={[20, 10]} look={[0.6, -0.6]} />
      </View>
    </Stage>
  );
};

export default CashOffice;
