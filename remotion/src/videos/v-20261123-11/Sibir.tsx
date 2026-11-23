// "A rich merchant family, the Stroganovs, paid for the trip, and Yermak took the capital of the Khan of Sibir."
// West of the Urals a merchant stands on the Stroganovs' lands by the Kama; a bag of coins flies to the boats,
// the boats row down the Tura to the khan's walled town on the Irtysh, a red banner goes up and red spreads to it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, Banner, Boat, CoinBag, Line, PERM, RIVER, RedLand, Ridge, SIBIR, Spot, TURA, Tent, IRTYSH, tipOf } from "./props";

const Scene: React.FC<{ t: number; mer: number; lab: number; pay: number; trip: number; took: number; cap: number; sib: number }> = ({ t, mer, lab, pay, trip, took, cap, sib }) => {
  const at = useAt();
  const pm = at(PERM), sb = at(SIBIR);
  const tip = tipOf(at, TURA, trip);
  if (!pm || !sb) return null;
  const start = at(TURA[0]!) ?? pm;
  const bx = pm[0] + (start[0] - pm[0]) * pay, by = pm[1] - 60 + (start[1] - pm[1]) * pay - Math.sin(pay * Math.PI) * 220;
  return (
    <g>
      <Line via={TURA} k={1} color={RIVER} w={14} />
      <Line via={IRTYSH} k={1} color={RIVER} w={16} />
      <Line via={[[54.0, 59.4], [56.25, 58.0], [55.2, 56.4]]} k={1} color={RIVER} w={14} />
      <Char x={pm[0]} y={pm[1] + 10 + Math.sin(t / 10) * 2} s={95 * Math.min(1, mer)} outfit="suit" top="#5b3a1e" hair="cap" hairColor="#3a2a1a" face={pay > 0 ? "smirk" : "neutral"} armR={[pay > 0 && pay < 1 ? 150 : 40, 20]} />
      <Spot at={PERM} name="STROGANOVS" k={lab} size={52} dy={-170} color="#f2b134" />
      {pay > 0 && pay < 1 ? <CoinBag x={bx} y={by} s={70} /> : null}
      {pay >= 1 && trip < 0.2 ? <Coin x={start[0] + 30} y={start[1] - 60} r={24} spin={t / 4} /> : null}
      {/* the khan's walled town */}
      <g>
        <Block x={sb[0] - 150} y={sb[1] - 40} w={300} h={44} fill="#9c7a52" sw={4} />
        {[-100, 0, 100].map((dx, i) => <Tent key={i} x={sb[0] + dx} y={sb[1] - 40} s={60} warm={1 - took} />)}
        <MapLabel at={[SIBIR[0], SIBIR[1] - 0.55]} text="SIBIR" size={60} type={sib} />
        <Banner x={sb[0] + 130} y={sb[1] - 40} s={90} k={cap} t={t} />
      </g>
      {tip ? <Boat x={tip[0]} y={tip[1] - 8 + Math.sin(t / 7) * 3} s={80} rot={tip[2]} crew={3} oar={t / 3.5} leader /> : null}
      {took > 0 ? <circle cx={sb[0]} cy={sb[1] - 40} r={60 + 200 * took} fill="none" stroke="#ffe08a" strokeWidth={10} opacity={1 - took} /> : null}
    </g>
  );
};

const Sibir: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const me = m.at("merchant", 6), st = m.at("stroganovs", 16), pa = m.at("paid", 28), tr = m.at("trip", 38), to = m.at("took", 52), ca = m.at("capital", 60), si = m.at("sibir", 76);
  const pan = m.lerp([tr - 4, to + 6], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.05 + 0.05 * m.lerp([to, to + 16], [0, 1]) + m.wave(80, 0.008)}>
        <Asia center={[61.5 + 4.5 * pan, 58.2]} scale={2100}>
          <RedLand east={58 + 11 * m.lerp([si, si + 24], [0, 1])} id="v1123b" front={0.8} o={0.5} />
          <Ridge k={1} s={1.8} />
          <Scene t={m.t} mer={m.pop(me, 12)} lab={m.lerp([st - 2, st + 14], [0, 1])} pay={m.lerp([pa, pa + 16], [0, 1])}
            trip={m.lerp([tr, to], [0, 1])} took={m.lerp([to, to + 22], [0, 1])} cap={m.pop(ca, 12)} sib={m.lerp([si - 2, si + 14], [0, 1])} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Sibir;
