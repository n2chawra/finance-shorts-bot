// "The people already living there, Siberia's native peoples, were made to pay, and many who fought back were
// crushed." Hunters' camps along the Lena and across the taiga light up warm, families with reindeer by their
// tents; a fur is handed to a Cossack at the fort, a hunter raises a bow, and the warm light goes cold under the red.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Asia, Cossack, Fort, Hunter, LENA, Line, Pelt, RIVER, RedLand, Reindeer, Tent, type LL } from "./props";

const CAMPS: LL[] = [[114.5, 60.6], [123.0, 63.6], [116.5, 64.0], [123.5, 59.9]];
const YAKUTSK: LL = [129.7, 62.0];

const Camps: React.FC<{ t: number; ks: number[]; warm: number; pay: number; bow: number }> = ({ t, ks, warm, pay, bow }) => {
  const at = useAt();
  const fort = at(YAKUTSK);
  const c1 = at(CAMPS[1]!);
  return (
    <g>
      {CAMPS.map((c, i) => {
        const xy = at(c);
        const k = ks[i] ?? 0;
        if (!xy || k <= 0) return null;
        return (
          <g key={i}>
            <Tent x={xy[0] - 70} y={xy[1]} s={120} k={k} warm={warm} />
            <Hunter x={xy[0] + 50} y={xy[1] + 8} s={105} k={k} bow={i === 1 ? bow : 0} hold={i === 1 && pay > 0 && pay < 0.2 ? 1 : 0} />
            <Reindeer x={xy[0] + 170} y={xy[1] + 10} s={85} k={k} t={t + i * 13} />
          </g>
        );
      })}
      {fort ? <Fort x={fort[0]} y={fort[1]} s={115} flag={1} t={t} /> : null}
      {fort ? <Cossack x={fort[0] - 150} y={fort[1] + 10} s={110} arm={pay > 0.8 ? 1 : 0} /> : null}
      {fort && c1 && pay > 0 && pay < 1 ? <Pelt x={c1[0] + (fort[0] - 150 - c1[0]) * pay} y={c1[1] - 60 + (fort[1] - c1[1]) * pay - Math.sin(pay * Math.PI) * 90} s={60} kind="sable" /> : null}
    </g>
  );
};

const Native: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pe = m.at("people", 4), li = m.at("living", 16), na = m.at("native", 30), pa = m.at("pay", 50), fo = m.at("fought", 66), cr = m.at("crushed", 84);
  const cold = m.lerp([cr - 2, cr + 18], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.4}>
      <View zoom={1.05 + 0.08 * m.lerp([pa - 4, pa + 14], [0, 1]) - 0.06 * cold + m.wave(80, 0.008)} cx={540 + 60 * m.lerp([pa - 4, pa + 14], [0, 1])}>
        <Asia center={[122.5, 61.6]} scale={2300}>
          <RedLand east={131} id="v1123n" front={0.4} o={0.35 + 0.35 * cold} />
          <Line via={LENA} k={1} color={RIVER} w={12} />
          <Camps t={m.t} ks={[m.pop(pe, 12), m.pop(li, 12), m.pop(na, 12), m.pop(na + 6, 12)]} warm={(0.6 + 0.4 * m.lerp([na, na + 10], [0, 1])) * (1 - cold)}
            pay={m.lerp([pa, pa + 22], [0, 1])} bow={m.pop(fo, 10) * (1 - cold)} />
        </Asia>
      </View>
      {cold > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#1d2b45" opacity={0.28 * cold} /> : null}
    </Stage>
  );
};

export default Native;
