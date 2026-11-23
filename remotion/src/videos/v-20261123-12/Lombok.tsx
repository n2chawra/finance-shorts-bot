// "Other tankers sail further still, through the Lombok Strait, east of Bali, and then north past Borneo." A second
// tanker peels off east along Java; LOMBOK STRAIT writes in the gap beside Bali, the route turns north up between
// Borneo and Sulawesi, and Borneo lights up as it passes.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BALI, LAND, LANE, LOMBOK_ROUTE, Line, ROUTE, SEAsia, SUNDA_ROUTE, Spot, Tanker, tipOf } from "./props";

const Routes: React.FC<{ t: number; k: number; borneo: number }> = ({ t, k, borneo }) => {
  const at = useAt();
  const tip = tipOf(at, LOMBOK_ROUTE, k);
  const b = at([114.0, 0.5]);
  return (
    <g>
      <Line via={LANE.slice(2, 8)} k={1} color={LAND} w={30} ink={false} />
      <Line via={SUNDA_ROUTE} k={1} color={ROUTE} w={8} dash o={0.6} />
      {b && borneo > 0 ? <circle cx={b[0]} cy={b[1]} r={260} fill="#ffe08a" opacity={0.25 * borneo} /> : null}
      {k > 0 ? <Line via={LOMBOK_ROUTE} k={k} color="#ff9a3c" w={11} dash /> : null}
      {tip && k > 0 ? <Tanker x={tip[0]} y={tip[1]} s={80} rot={tip[2]} t={t} /> : null}
    </g>
  );
};

const Lombok: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ot = m.at("other", 2), fu = m.at("further", 12), lo = m.at("lombok", 30), ba = m.at("bali", 48), no = m.at("north", 62), bo = m.at("borneo", 76);
  const k = m.lerp([ot, lo], [0, 0.45]) + m.lerp([lo, no], [0, 0.15]) + m.lerp([no, m.end], [0, 0.4]);
  const pan = m.lerp([fu, no + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.05 * m.lerp([lo - 4, lo + 10], [0, 1]) * (1 - m.lerp([no, no + 10], [0, 1])) + m.wave(80, 0.008)}>
        <SEAsia center={[106 + 8 * pan, -3.5 + 1.5 * pan]} scale={2100} colors={{ Indonesia: { fill: "#c9c27a" }, Malaysia: { fill: "#e0b46a", k: 0.6 + 0.4 * m.pop(bo, 10) } }}>
          <Routes t={m.t} k={k} borneo={m.pop(bo, 10)} />
          <MapLabel at={[115.8, -10.6]} text="LOMBOK STRAIT" size={52} type={m.lerp([lo - 2, lo + 14], [0, 1])} />
          <Spot at={BALI} name="BALI" k={m.lerp([ba - 2, ba + 10], [0, 1])} size={48} left dy={-40} />
          <MapLabel at={[114.0, 0.8]} text="BORNEO" size={60} k={m.pop(bo, 10)} />
        </SEAsia>
      </View>
    </Stage>
  );
};

export default Lombok;
