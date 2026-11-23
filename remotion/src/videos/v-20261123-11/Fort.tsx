// "So every village they reached paid a tax in furs, called yasak, and each time the Cossacks built a wooden fort
// to collect it." On the Irtysh bank: a village of tents, a boat lands, a sack of furs walks to the Cossacks, a
// YASAK sign stamps on it, logs drop, the fort stands up, the furs pile inside and the red spreads round it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, Boat, Cossack, Fort as FortPiece, Hunter, IRTYSH, Line, Pelt, Pine, RIVER, RedLand, TOBOLSK, Tent, WOOD } from "./props";

const Bank: React.FC<{ t: number; walk: number; vil: number; land: number; sack: number; yas: number; logs: number; fort: number; pile: number }> = ({ t, walk, vil, land, sack, yas, logs, fort, pile }) => {
  const at = useAt();
  const c = at(TOBOLSK);
  if (!c) return null;
  const [x, y] = [c[0], c[1]];
  const sx = x - 260 + 480 * sack, sy = y - 10 - 110 * sack - Math.sin(sack * Math.PI) * 60;
  return (
    <g>
      <Line via={IRTYSH} k={1} color={RIVER} w={70} />
      {[[-420, -300], [-120, -330], [300, -320], [420, 60], [-460, 120]].map(([dx, dy], i) => <Pine key={i} x={x + dx!} y={y + dy!} s={110} />)}
      {[-360, -230].map((dx, i) => <Tent key={i} x={x + dx} y={y - 20 + i * 30} s={140} k={vil} />)}
      <Hunter x={x - 280} y={y + 60} s={120} k={vil} hold={sack > 0 && sack < 0.15 ? 1 : 0} />
      <Boat x={x - 40 + 140 * (1 - land)} y={y + 150} s={110} rot={180} crew={3} oar={t / 5} k={land} leader />
      {sack > 0 ? <g><Pelt x={sx} y={sy - 30} s={70} kind="sable" rot={-8} /><Pelt x={sx + 30} y={sy - 50} s={60} kind="fox" rot={12} /></g> : null}
      {yas > 0 && fort < 0.3 ? <Tag x={sx - 110} y={sy - 230} w={220} h={90} text="YASAK" size={54} k={yas} rot={-5} /> : null}
      {logs > 0 && fort <= 0.05 ? [0, 1, 2].map((i) => <Limb key={i} a={[x + 170 + i * 40, y - 520 + 380 * Math.min(1, logs * 1.3 - i * 0.15)]} b={[x + 190 + i * 40, y - 420 + 380 * Math.min(1, logs * 1.3 - i * 0.15)]} w={22} color={WOOD} />) : null}
      <FortPiece x={x + 250} y={y - 120} s={150} k={fort} flag={fort} t={t} />
      {pile > 0 ? [0, 1, 2].map((i) => <Pelt key={i} x={x + 210 + i * 40} y={y - 150 - i * 10} s={55} kind={i === 1 ? "fox" : "sable"} k={Math.min(1, pile * 3 - i)} />) : null}
      <Cossack x={x + 400 + 200 * (1 - walk)} y={y - 100} s={110} k={walk > 0 ? 1 : 0} arm={pile > 0 || (walk > 0 && fort < 1) ? 1 : 0} bob={Math.sin(t / 4) * 4 * (1 - walk)} />
      <MapLabel at={[TOBOLSK[0] + 0.5, TOBOLSK[1] + 1.25]} text="TOBOLSK" size={54} k={fort} />
    </g>
  );
};

const Fort: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const vi = m.at("village", 4), re = m.at("reached", 14), ta = m.at("tax", 26), ya = m.at("yasak", 38), cs = m.at("cossacks", 46), wo = m.at("wooden", 54), fo = m.at("fort", 62), co = m.at("collect", 76);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + 0.08 * m.lerp([fo, fo + 14], [0, 1]) - 0.06 * m.lerp([co, co + 18], [0, 1]) + m.wave(80, 0.008)} cx={540 + 60 * m.lerp([wo, fo], [0, 1])} cy={900}>
        <Asia center={[68.1, 58.15]} scale={5200}>
          <RedLand east={67.4 + 3.4 * m.lerp([co, co + 26], [0, 1])} id="v1123t" front={m.lerp([co, co + 8], [0, 1])} o={0.35} />
          <Bank t={m.t} walk={m.lerp([cs - 2, cs + 14], [0, 1])} vil={m.pop(vi, 12)} land={m.lerp([re - 6, re + 12], [0, 1])} sack={m.lerp([ta, ta + 30], [0, 1])} yas={m.pop(ya, 10)}
            logs={m.lerp([wo, wo + 12], [0, 1])} fort={m.lerp([fo - 4, fo + 18], [0, 1])} pile={m.lerp([co, co + 20], [0, 1])} />
        </Asia>
      </View>
    </Stage>
  );
};

export default Fort;
