// "Then the money: rupees, dollars, euros, yen. About {fact2} currencies melt into one coin." Close on the
// map: a bundle of notes lands, then a rupee note on India, a dollar note on America, a euro note on Europe
// and a yen note on Japan, each on its word; a board counts the currencies; on "melt" the notes spiral into
// the middle of the world and one gold coin spins up out of them on "coin".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Char } from "../../flat/cast";
import { Sign, World } from "./props";

type Params = { fig?: { currencies?: string } };
const NOTES: { name: string; at: [number, number]; color: string }[] = [
  { name: "RUPEE", at: [79, 22], color: "#c9a0d8" }, { name: "DOLLAR", at: [-100, 40], color: "#8cc084" },
  { name: "EURO", at: [8, 48], color: "#8fb8e0" }, { name: "YEN", at: [138, 37], color: "#e8b4a0" },
];

const Note: React.FC<{ x: number; y: number; name: string; color: string; s: number; rot: number }> = ({ x, y, name, color, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Block x={-120} y={-60} w={240} h={120} fill={color} r={10} sw={5} />
    <rect x={-104} y={-44} width={208} height={88} rx={8} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
    <Txt x={0} y={4} size={48} fill={INK}>{name}</Txt>
  </g>
);

const Notes: React.FC<{ k: (i: number) => number; melt: number; t: number }> = ({ k, melt, t }) => {
  const at = useAt();
  return (
    <g>
      {NOTES.map((n, i) => {
        const xy = at(n.at);
        const kk = k(i);
        if (!xy || kk <= 0 || melt >= 1) return null;
        const a = melt * 6 + i * 1.57, r = (1 - melt) * 260;
        const x = xy[0] * (1 - melt) + (540 + Math.cos(a) * r) * melt, y = (xy[1] - 60) * (1 - melt) + (760 + Math.sin(a) * r) * melt - (1 - Math.min(1, kk)) * 200;
        return <Note key={n.name} x={Math.min(880, Math.max(200, x))} y={y} name={n.name} color={n.color} s={1.2 * (1 - 0.6 * melt)} rot={Math.sin(t / 10 + i) * 6 + melt * 200} />;
      })}
    </g>
  );
};

const Money: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.currencies ?? "";
  const mo = m.at("money", 4), ru = m.at("rupees", 20), _do = m.at("dollars", 32), eu = m.at("euros", 44), ye = m.at("yen", 56), cu = m.at("currencies", 80), me = m.at("melt", 100), co = m.at("coin", 125);
  const ks = [ru, _do, eu, ye];
  const melt = m.lerp([me, co], [0, 1]);
  const coin = m.pop(co, 10);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + 0.06 * m.pulse(mo + 4, 8) + m.wave(70, 0.01)}>
        <World center={[20, 30]} scale={290} merge={() => 1}>
          <Notes k={(i) => m.pop(ks[i]!, 12)} melt={melt} t={m.t} />
        </World>
        <Char x={540} y={1240} s={110} face={melt > 0.5 ? "shock" : "happy"} armL={[120, 30]} armR={[120 + 20 * Math.sin(m.t / 6), 30]} />
        {melt < 0.5 ? <g transform={`translate(0 ${-30 * m.pop(mo, 10)})`}>{[-1, 0, 1].map((i) => <Note key={i} x={540 + i * 70} y={930} name="CASH" color={["#8cc084", "#c9a0d8", "#8fb8e0"][i + 1]!} s={0.95} rot={i * 14} />)}</g> : null}
        {coin > 0 ? <Coin x={540} y={760} r={120 * Math.min(1.1, coin)} spin={0.2 + 0.8 * Math.abs(Math.cos(m.t / 6))} /> : null}
      </View>
      <Sign x={540} y={1300} w={460} label="CURRENCIES" value={countText(n, m.lerp([cu, cu + 20], [0, 1]))} k={m.pop(cu - 4, 12)} />
    </Stage>
  );
};

export default Money;
