// Promise: "And a plastic card covered 64% of it."
// Same warehouse floor: a shadow falls on "And"; on "plastic" a door-sized membership card crashes down beside
// the cash pallet and the camera pulls back with the shake; on "covered" the card's blue floods up the pallet
// to the share, and on "it" the share stamps on the flooded part as the camera pushes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { BigCard, CashPallet, Warehouse, frac } from "./props";

type Params = { fig?: { profit?: string; share?: string } };

const Covered: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const F = (p.beat.params as Params).fig ?? {};
  const and = m.at("and", 2), plastic = m.at("plastic", 10), covered = m.at("covered", 30), it = m.at("it", 60);
  const drop = m.lerp([plastic - 6, plastic + 3], [-1500, 0], Easing.in(Easing.quad));
  const bounce = m.pulse(plastic + 3, 6);
  const flood = m.lerp([covered, covered + 22], [0, frac(F.share)]);
  const wide = m.lerp([plastic - 2, plastic + 12], [0, 1]);
  const close = m.lerp([it - 8, it + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.2 - 0.2 * wide + 0.42 * close + m.lerp([0, m.end], [0, 0.03]);
  const cx = 460 + 80 * wide - 160 * close, cy = 900 + 20 * wide + 80 * close;
  const shake = m.t >= plastic + 3 && m.t < plastic + 13 ? Math.sin(m.t * 3.3) * (plastic + 13 - m.t) * 2.4 : 0;
  const shadow = m.lerp([and, plastic], [0, 0.35]) * (m.t < plastic + 3 ? 1 : 0);
  return (
    <Stage p={p} bg="#c9ccd6" vignette={0.35}>
      <View zoom={zoom} cx={cx + shake} cy={cy}>
        <Warehouse floor={1250} />
        <CashPallet x={120} y={1250} w={380} h={560} fill={flood} />
        <Tag x={130} y={500} w={360} h={150} text={F.profit ?? ""} size={84} />
        <Txt x={310} y={465} size={44} fill={INK}>PROFIT</Txt>
        <ellipse cx={760} cy={1250} rx={260} ry={40} fill="#000" opacity={shadow} />
        <g transform={`translate(0 ${drop - bounce * 30})`}>
          <BigCard x={560} y={560} w={400} h={660} rot={4} />
        </g>
        {m.t >= plastic + 3 ? <Glow x={760} y={1240} r={320} color="#ffffff" o={0.6 * m.pulse(plastic + 3, 10)} /> : null}
        <Tag x={150} y={1010} w={320} h={130} text={F.share ?? ""} rot={-6} size={84} bg="#ffffff" fg="#1f5fbf" k={m.pop(it - 2, 9)} />
        <Char x={900} y={1520} s={190} who="rohan" hair="side" outfit="shirt" face={m.t > plastic + 3 ? "shock" : "neutral"} look={[-1, -0.4]}
          armL={m.t > plastic + 3 ? [130, 150] : [15, 10]} armR={[15, 10]} />
      </View>
    </Stage>
  );
};

export default Covered;
