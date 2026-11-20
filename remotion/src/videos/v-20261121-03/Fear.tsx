// "Britain feared the French would use nearly empty Tristan to rescue him. So in {fact4}, it sent soldiers and
// claimed the island." Saint Helena and Tristan on the map: the Union flag rises over Saint Helena on "Britain";
// a French ship appears on "French"; Tristan sits almost bare, one hut, on "empty"; on "rescue" a dashed red route
// runs up from Tristan to Saint Helena with the French ship on it; on "soldiers" a British ship with redcoats sails
// in to Tristan; on "claimed" the camera closes in as a Union flag plants with the year on a sign; on "island" the
// rescue route snaps and fades.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapRoute, useAt } from "../../flat/map";
import { HELENA, House, Isle, Napoleon, Ocean, Planted, RED, Ship, Sign, TRISTAN } from "./props";

type Params = { fig?: { year?: string } };

const GARRISON: [number, number][] = [[14, -34.5], [2, -36], [-11.4, -37]];

const OnSpots: React.FC<{ t: number; ukH: number; hut: number; flagT: number; year: string; sign: number; nap: number }> = ({ t, ukH, hut, flagT, year, sign, nap }) => {
  const at = useAt();
  const h = at(HELENA), tr = at(TRISTAN);
  if (!h || !tr) return null;
  return (
    <g>
      {nap > 0 ? <g opacity={Math.min(1, nap * 2)}><Napoleon x={h[0] - 250} y={h[1] - 14} s={70 * Math.min(1, nap)} face="worried" /></g> : null}
      <Planted x={h[0] + 230} y={h[1] - 20} s={90} k={ukH} t={t} />
      <House x={tr[0] - 40} y={tr[1] - 6} s={38} k={hut} roof="#8a6a4a" />
      <Planted x={tr[0] + 10} y={tr[1] - 24} s={110} k={flagT} t={t} />
      <Sign x={Math.max(170, tr[0] - 230)} y={Math.min(1330, tr[1] + 30)} w={300} text={year} k={sign} size={72} />
    </g>
  );
};

const Fear: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const br = m.at("britain", 4), fr = m.at("french", 18), em = m.at("empty", 36), rs = m.at("rescue", 50), hm = m.at("him", 60), se = m.at("sent", 76), so = m.at("soldiers", 80), cl = m.at("claimed", 98), is = m.at("island", 110);
  const close = m.lerp([cl - 6, cl + 14], [0, 1]);
  const snap = m.lerp([is, is + 12], [0, 1]);
  const at = useAtCenter(close);
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + 0.24 * close + m.wave(90, 0.01)} cx={540 - 90 * close} cy={960 + 170 * close}>
        <Ocean center={at.center} scale={at.scale}>
          <Isle at={HELENA} r={34} t={m.t} name="SAINT HELENA" size={54} />
          <Isle at={TRISTAN} r={40} t={m.t} name="TRISTAN" size={54} below glow={m.pulse(em + 6, 10)} />
          {m.t >= rs && snap < 1 ? (
            <g opacity={1 - snap}>
              <MapRoute via={[TRISTAN, [-14, -27], [-10, -21]]} k={m.lerp([rs, rs + 26], [0.02, 1])} color={RED} width={10} dash
                mover={(x, y, a) => <Ship x={x} y={y - 12} s={90} angle={a} kind="french" t={m.t} />} />
            </g>
          ) : null}
          {m.t >= fr && m.t < rs ? <Ship x={260} y={860} s={100 * Math.min(1, m.pop(fr, 11))} kind="french" t={m.t} /> : null}
          {m.t >= se ? <MapRoute via={GARRISON} k={m.lerp([se, cl], [0.05, 1])} color="#f4efe4" width={8}
            mover={(x, y, a) => <Ship x={x} y={y - 12} s={110} angle={a} kind="sail" t={m.t} crew={1} />} /> : null}
          <OnSpots t={m.t} ukH={m.pop(br, 11)} hut={m.pop(em, 11)} flagT={m.pop(cl, 11)} year={year} sign={m.pop(cl + 4, 11)} nap={m.pop(hm, 11)} />
        </Ocean>
      </View>
    </Stage>
  );
};

function useAtCenter(close: number): { center: [number, number]; scale: number } {
  return { center: [-9 + 0 * close, -28.5], scale: 1300 };
}

export default Fear;
