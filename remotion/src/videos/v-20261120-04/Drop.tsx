// "And then? The gates open. The water falls through the mountain, the machines spin, and out come {fact1}
// megawatts." The valley by day: the gates at the high lake swing open, water pours into the tunnel and races
// down to the hall; the camera closes on the machines, which glow and spin, sparks flying; on "megawatts"
// the map pulls out to Britain and power lines race from Wales to every city, the figure on a pylon sign.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, INK, Limb, Stage, View, countText, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { Britain, CITIES, Cavern, CityLights, ELIDIR, GOLD, Lake, MARCHLYN, Mountain, PERIS, Sign, Tunnel, Valley, ZAP } from "./props";

type Params = { fig?: { mw?: string } };

const Gates: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(MARCHLYN);
  if (!xy) return null;
  const x = xy[0] - 110, y = xy[1] + 70;
  return (
    <g>
      <rect x={x - 70} y={y - 14} width={140} height={28} fill="#9aa0ad" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${-70 * k} ${x - 60} ${y})`}><rect x={x - 60} y={y - 40} width={56} height={80} fill="#5c6478" stroke={INK} strokeWidth={5} /></g>
      <g transform={`rotate(${70 * k} ${x + 60} ${y})`}><rect x={x + 4} y={y - 40} width={56} height={80} fill="#5c6478" stroke={INK} strokeWidth={5} /></g>
    </g>
  );
};

const Pylon: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()(ELIDIR);
  if (!xy || k <= 0) return null;
  const x = Math.max(330, Math.min(700, xy[0] + 40)), y = Math.max(560, xy[1] - 140);
  return (
    <g>
      <Limb a={[x - 60, y + 220]} b={[x, y]} w={10} color="#7d8794" sw={3} />
      <Limb a={[x + 60, y + 220]} b={[x, y]} w={10} color="#7d8794" sw={3} />
      <Sign x={x} y={y} w={460} label="MEGAWATTS" value={text} k={k} bg="#1f2a48" fg={ZAP} />
    </g>
  );
};

const Drop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mw = (p.beat.params as Params).fig?.mw ?? "";
  const th = m.at("then", 4), mo = m.at("mountain", 80), ou = m.at("out", 130);
  const ga = m.at("gates", 25), wa = m.at("water", 45), fa = m.at("falls", 65), ma = m.at("machines", 95), sp = m.at("spin", 115), me = m.at("megawatts", 140);
  const close = m.lerp([fa - 2, fa + 18], [0, 1]);
  const britain = m.t >= me - 4;
  const spin = m.t * 2 + Math.max(0, m.t - sp) * Math.max(0, m.t - sp) * 0.4;
  return (
    <Stage p={p} bg={britain ? "#0e1b36" : "#5f9fae"} vignette={0.32}>
      {!britain ? (
        <View zoom={1.02 + m.wave(60, 0.012) + 0.03 * m.pulse(ou + 3, 6)} rot={1.2 * Math.sin(m.t * 2) * m.pulse(mo + 6, 10)}>
          <Valley center={[-4.083 - 0.015 * close, 53.136 - 0.012 * close]} scale={850000 * (1 + 0.9 * close)}>
            <Mountain />
            <Lake at={MARCHLYN} rx={170} ry={100} level={m.lerp([wa, m.end], [1, 0.8])} seed={2} rot={-0.3} t={m.t} />
            <Lake at={PERIS} rx={240} ry={60} level={m.lerp([fa, m.end], [0.55, 0.75])} seed={5} rot={-0.65} t={m.t} />
            <Tunnel k={1} flow={m.lerp([wa, wa + 10], [0, 1])} t={m.t * (1 + close * 2)} />
            <Gates k={m.lerp([ga, ga + 10], [0, 1]) + 0.08 * Math.sin(m.t * 1.5) * m.pulse(th + 6, 8)} />
            <Cavern open={1} n={6} spin={spin} lit={m.lerp([ma, ma + 10], [0, 1]) + 0.6 * m.pulse(ou + 3, 6)} flicker={m.t > sp ? Math.sin(m.t * 2.3) : 0} />
          </Valley>
          {m.t > sp ? [0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={420 + ((i * 97 + m.t * 9) % 300)} cy={980 - ((i * 53 + m.t * 7) % 200)} r={7} fill={ZAP} />) : null}
        </View>
      ) : (
        <View zoom={1.02 + m.lerp([me, m.end], [0, 0.05])}>
          <Britain center={[-3, 53.8]} scale={4200} night={1}>
            {CITIES.map((c, i) => <MapRoute key={c.name} via={[ELIDIR, c.at]} k={m.lerp([me + i, me + i + 14], [0, 1])} color={GOLD} width={7} dash={false} />)}
            <CityLights each={(i) => m.lerp([me + i + 10, me + i + 16], [0, 1])} />
            <Pylon k={m.pop(me, 12)} text={countText(mw, m.lerp([me, me + 20], [0, 1]))} />
          </Britain>
          <Flash k={m.pulse(me - 4, 5)} />
        </View>
      )}
    </Stage>
  );
};

export default Drop;
