// Loop: "A salary or a cut: which would you take? Arnold said no to the salary."
// Back in the old studio office: a salary cheque slides onto the desk on "salary", a pie wedge beside it on
// "cut", a question mark pops between them on "take", Arnold steps in behind the desk on "Arnold" and pushes
// the cheque back on "no", ready to tear it: the hook's first frame.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Arnold, Cheque, GOLD, Office } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sal = m.at("salary", 4), cut = m.at("cut", 14), take = m.at("take", 26), arn = m.at("arnold", 40), no = m.at("no", 50);
  const chq = m.pop(sal, 12), wedge = m.pop(cut, 12), q = m.pop(take, 9);
  const step = m.pop(arn, 12);
  const back = m.lerp([no, no + 8], [0, 1]);
  const a = 0.4 * Math.PI * 2, r = 150;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a2412" vignette={0.42}>
        <View zoom={1.05 + 0.07 * m.lerp([arn, m.end], [0, 1])} cx={540} cy={820}>
          <Office m={m} arnold={step > 0 ? <g transform={`translate(${(1 - step) * 500} 0)`}><Arnold x={540} y={1300 + m.wave(60, 3)} s={360} face="smirk" armL={[60, 60]} armR={[60, 60]} /></g> : null}>
            {chq > 0 ? <g transform={`translate(${-back * 60} 0)`}><Cheque x={430} y={880 - 40 * chq} w={540} label="SALARY" value="" rot={-5} /></g> : null}
            {wedge > 0 ? (
              <g transform={`translate(700 ${870 - 40 * wedge}) scale(${wedge})`}>
                <path d={`M 0 60 L 0 ${60 - r} A ${r} ${r} 0 0 1 ${r * Math.sin(a)} ${60 - r * Math.cos(a)} Z`} fill={GOLD} stroke={INK} strokeWidth={6} />
                <Txt x={40} y={110} size={48} fill="#ffffff" stroke={INK}>A CUT</Txt>
              </g>
            ) : null}
            {q > 0 ? <g transform={`translate(560 ${620 - 30 * q}) scale(${0.4 + 0.6 * q})`}><circle r={75} fill="#ffc43d" stroke={INK} strokeWidth={5} /><Txt x={0} y={4} size={100} fill={INK}>?</Txt></g> : null}
          </Office>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
