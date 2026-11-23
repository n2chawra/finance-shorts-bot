// "But what were they really after? Fur. Sable and fox pelts sold for a fortune in Moscow." In the forest by the
// Irtysh a question mark pulses; on "Fur" a pile of pelts bursts out of the trees, a sable and a fox pop up on
// their words, coins rain on "fortune", and on "Moscow" the camera pulls back as the pelts fly west to Moscow.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Coin, Stage, View, motion, rng } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Asia, GOLD, Line, MOSCOW, Pelt, Pine, QMark, RedLand, Ridge, SIBIR, Spot, tipOf, type LL } from "./props";

const ROUTE: LL[] = [SIBIR, [60.5, 58.4], [50, 57.4], MOSCOW];
const R = rng("v1123fur");
const TREES = Array.from({ length: 16 }, (_, i) => ({ dx: (R() - 0.5) * 900, dy: -360 + R() * 520, s: 70 + R() * 40, i }));
const COINS = Array.from({ length: 9 }, () => ({ dx: (R() - 0.5) * 260, d: R() * 10 }));

const Forest: React.FC<{ t: number; q: number; pile: number; sab: number; fox: number; cash: number; fly: number; cashAt: number; tt: number }> = ({ t, q, pile, sab, fox, cash, fly, cashAt, tt }) => {
  const at = useAt();
  const c = at(SIBIR);
  if (!c) return null;
  const [x, y] = [c[0], c[1] - 40];
  const tip = tipOf(at, ROUTE, fly);
  return (
    <g>
      {TREES.map((tr) => <Pine key={tr.i} x={x + tr.dx} y={y + tr.dy} s={tr.s} />)}
      <QMark x={x} y={y - 260} k={q * (1 - pile)} t={t} size={200} />
      {[[-70, 10, -12], [60, 20, 14], [0, -30, 4]].map(([dx, dy, r], i) => <Pelt key={i} x={x + dx!} y={y + dy! + 40} s={80} kind={i === 1 ? "fox" : "sable"} k={pile} rot={r!} />)}
      <Pelt x={x - 170} y={y - 150} s={130} kind="sable" k={sab} rot={-10} />
      <Pelt x={x + 170} y={y - 150} s={130} kind="fox" k={fox} rot={10} />
      {cash > 0 ? COINS.map((co, i) => {
        const fall = Math.min(1, Math.max(0, (tt - cashAt - co.d) / 14));
        return fall > 0 ? <Coin key={i} x={x + co.dx} y={y - 420 + 420 * fall} r={26} spin={t / 4 + i} /> : null;
      }) : null}
      {fly > 0 ? <Line via={ROUTE} k={fly} color={GOLD} w={10} dash /> : null}
      {tip && fly > 0 && fly < 1 ? <Pelt x={tip[0]} y={tip[1] - 30} s={90} kind="sable" rot={-20} /> : null}
      <Spot at={MOSCOW} name="MOSCOW" k={fly > 0.6 ? (fly - 0.6) * 2.5 : 0} size={56} dy={-50} />
    </g>
  );
};

const Fur: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wh = m.at("what", 2), af = m.at("after", 14), fu = m.at("fur", 26), sa = m.at("sable", 36), fo = m.at("fox", 44), fr = m.at("fortune", 54), mo = m.at("moscow", 68);
  const back = m.lerp([mo - 8, mo + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + 0.12 * m.lerp([af, fu], [0, 1]) * (1 - back) + m.wave(80, 0.008)}>
        <Asia center={[68.4 - 15 * back, 58.6 - 1.2 * back]} scale={2900 - 1900 * back}>
          <RedLand east={69} id="v1123f" front={0.5} o={0.45} />
          <Ridge k={1} s={1.4} />
          <Forest t={m.t} tt={m.t} q={m.pop(wh, 10)} pile={m.pop(fu, 10)} sab={m.pop(sa, 10)} fox={m.pop(fo, 10)} cash={m.after("fortune") ? 1 : 0} cashAt={fr}
            fly={m.lerp([mo - 6, m.end - 4], [0, 1])} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Fur;
