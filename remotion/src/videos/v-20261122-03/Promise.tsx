// Promise: "He paid {fact1} coins, the first real purchase ever made with bitcoin."
// The same hallway (weekly test: the promise stays in the hook's place): one continuous move from the hook's close
// framing on the boxes across to the laptop on "He"; the coin counter over it rolls up as coins stream from the screen
// off to the stranger on
// "coins"; a FIRST ribbon stamps on the laptop on "first"; a receipt prints on "purchase"; the camera pulls back over the
// hall on "made", coins streaming out of the window
// to the stranger.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Display, INK, SourceLine, Stage, Txt, View, countText, motion, rng } from "../../flat/kit";
import { Driver, HALLBG, Hall, Laszlo, PizzaBox } from "./props";
import { HallTable } from "./Hook";

type Params = { fig?: { coins?: string } };

const PromiseShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const coins = (p.beat.params as Params).fig?.coins ?? "";
  const he = m.at("he", 2), cn = m.at("coins", 14), first = m.at("first", 40), purchase = m.at("purchase", 55), made = m.at("made", m.end - 20);
  const count = m.lerp([he + 4, he + 16], [0, 1]);
  const pour = m.lerp([cn, made + 10], [0, 1]);
  const ribbon = m.pop(first, 9);
  const receipt = m.lerp([purchase, purchase + 14], [0, 1]);
  const zoom = m.t < made ? m.lerp([0, he + 12], [1.18, 1.16]) : m.lerp([made, made + 16], [1.2, 1.0]);
  const cx = m.t < made ? m.lerp([0, he + 12], [540, 420]) : m.lerp([made, made + 16], [300, 520]);
  const cy = m.t < made ? m.lerp([0, he + 12], [900, 860]) : m.lerp([made, made + 16], [860, 950]);
  const r = rng("pizza-coins");
  const pile = Array.from({ length: 40 }).map(() => [r(), r()] as [number, number]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg={HALLBG} vignette={0.4}>
        <View zoom={zoom} cx={cx + m.wave(110, 5)} cy={cy}>
          <Hall m={m} door={1} />
          <HallTable m={m} send={0} glow={0.9} />
          <Driver x={880} y={1330} s={250} m={m} armR={[20, 10]} armL={[20, 10]} />
          <Laszlo x={470} y={1450} s={290} m={m} face={m.t >= first ? "shock" : "grin"} look={[-0.7, -0.3]} armR={[90, 70]} />
          <PizzaBox x={600} y={1000} w={300} m={m} />
          <PizzaBox x={600} y={935} w={300} m={m} steam={false} />
          {/* coins pouring out of the screen into a pile on the floor */}
          {pile.map(([a, b], i) => {
            const k = Math.max(0, Math.min(1, pour * 1.6 - (i / pile.length)));
            if (k <= 0) return null;
            const x = 200 + k * 760 + (a - 0.5) * 160;
            const y = 840 - k * (520 + b * 120);
            return <circle key={i} cx={x} cy={y} r={20} fill="#f7931a" stroke={INK} strokeWidth={3} />;
          })}
          <Display x={200} y={190} w={380} h={180} label="BITCOIN PAID" value={countText(coins, count)} color="#f7931a" k={m.lerp([he + 4, he + 10], [0, 1])} />
          {ribbon > 0 ? (
            <g transform={`translate(200 700) rotate(-8) scale(${1 + (1 - Math.min(1, ribbon)) * 1.2})`}>
              <rect x={-150} y={-45} width={300} height={90} rx={10} fill="#e0352b" stroke={INK} strokeWidth={6} />
              <Txt x={0} y={2} size={60} fill="#ffffff">FIRST</Txt>
            </g>
          ) : null}
          {receipt > 0 ? (
            <g transform={`translate(330 ${760 - receipt * 40})`}>
              <rect x={0} y={0} width={130} height={60 + receipt * 160} fill="#fbf8f0" stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => (receipt > i * 0.25 ? <rect key={i} x={15} y={20 + i * 40} width={100} height={10} rx={4} fill="#c9c2b2" /> : null))}
            </g>
          ) : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default PromiseShot;
