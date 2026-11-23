// "Then a Cossack chief called Yermak crossed them, rowing and dragging river boats, with just {fact1} men."
// Close on the ridge: Yermak in the leading boat (named on "Yermak"), the boat climbs the pass on log rollers,
// more boats follow, and a sign on the bank stamps the number of men.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Asia, Boat, Pine, RedLand, Ridge, WOOD, tipOf, type LL } from "./props";

const PASS: LL[] = [[57.2, 58.1], [58.4, 58.3], [59.2, 58.45], [60.0, 58.75], [61.2, 58.9], [62.4, 58.5]];

type Params = { fig?: { men?: string } };

const Fleet: React.FC<{ t: number; row: number; k: number; more: number; drag: number; name: number; men: string; sign: number }> = ({ t, row, k, more, drag, name, men, sign }) => {
  const at = useAt();
  const boats = [0, 0.13, 0.26].map((d, i) => ({ i, tip: tipOf(at, PASS, k - d), on: i === 0 ? 1 : more }));
  const lead = boats[0]!.tip;
  return (
    <g>
      {boats.slice().reverse().map(({ i, tip, on }) => tip && on > 0 && k - i * 0.13 > 0 ? (
        <g key={i}>
          {drag > 0 ? [-60, 0, 60].map((dx, j) => <Ball key={j} x={tip[0] + dx} y={tip[1] + 22} r={12 * drag} fill={WOOD} sw={3} shadow={false} />) : null}
          <Boat x={tip[0]} y={tip[1] + Math.sin(t / 7 + i) * 3} s={i === 0 ? 120 : 95} rot={tip[2]} crew={3} oar={t / (row > 0 ? 3 : 6) + i} leader={i === 0} k={on} />
        </g>
      ) : null)}
      {lead && name > 0 ? (
        <g opacity={Math.min(1, name)}>
          <Txt x={lead[0] + 40} y={lead[1] - 170} size={64} fill="#ffffff" stroke={INK}>YERMAK</Txt>
          <path d={`M${lead[0] + 40},${lead[1] - 130} L${lead[0] + 50},${lead[1] - 96}`} stroke={INK} strokeWidth={6} />
        </g>
      ) : null}
      {lead && sign > 0 ? <Tag x={lead[0] - 150} y={lead[1] - 400} w={300} h={110} text={`${men} MEN`} size={58} k={sign} rot={-4} /> : null}
    </g>
  );
};

const Woods: React.FC = () => {
  const at = useAt();
  const spots: LL[] = [[57.6, 58.9], [58.1, 57.7], [60.7, 58.1], [61.6, 59.4], [62.8, 59.1], [56.9, 58.6], [61.9, 57.9]];
  return <g>{spots.map((s, i) => { const xy = at(s); return xy ? <Pine key={i} x={xy[0]} y={xy[1]} s={80} /> : null; })}</g>;
};

const Yermak: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const men = (p.beat.params as Params).fig?.men ?? "";
  const co = m.at("cossack", 4), ye = m.at("yermak", 16), cr = m.at("crossed", 26), dr = m.at("dragging", 44), bo = m.at("boats", 56), mn = m.at("men", 70);
  const k = m.lerp([0, cr], [0.08, 0.2]) + m.lerp([cr, m.end], [0, 0.55]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.06 + 0.04 * m.pop(co, 12) + m.wave(70, 0.008)}>
        <Asia center={[58.6 + 2.6 * m.lerp([0, m.end], [0, 1]), 58.35]} scale={3300}>
          <RedLand east={58} id="v1123y" front={0.5} o={0.55} />
          <Woods />
          <Ridge k={1} s={2.6} shake={m.pulse(cr + 4, 6) * 0.6} />
          <Fleet t={m.t} row={m.after("rowing") ? 1 : 0} k={k} more={m.pop(bo, 12)} drag={m.lerp([dr, dr + 8], [0, 1]) * (1 - m.lerp([bo + 20, bo + 30], [0, 1]))} name={m.pop(ye, 10)} men={men} sign={m.pop(mn, 10)} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Yermak;
