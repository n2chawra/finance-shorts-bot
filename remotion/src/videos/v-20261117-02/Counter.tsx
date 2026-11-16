// Build: "So AMC looks to the snack bar, where each moviegoer spends $7.87."
// The busy snack bar: the camera swings from the screen doors to the counter on "So", the popcorn machine pops
// over on "snack", Rohan steps up with a giant tub and a drink on "bar", the till screen lights up on "where", and
// on "spends" the till's display stamps the figure as the camera closes in.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";
import { Cup, PopMachine, Tub } from "./props";

type Params = { fig?: { spend?: string } };

const Counter: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const spend = (p.beat.params as Params).fig?.spend ?? "";
  const so = m.at("so", 1), snack = m.at("snack", 12), bar = m.at("bar", 20), where = m.at("where", 32), spends = m.at("spends", 46);
  const swing = m.lerp([so - 2, so + 16], [0, 1], Easing.inOut(Easing.cubic));
  const step = m.lerp([bar - 2, bar + 12], [0, 1], Easing.out(Easing.cubic));
  const till = m.t < where ? 0.25 : 1;
  const close = m.lerp([spends - 4, spends + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.06 * swing + 0.1 * close;
  const cx = 200 + 340 * swing, cy = 880 - 80 * close;
  return (
    <Stage p={p} bg="#3a1a2a" vignette={0.4}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-700} y={-400} width={2400} height={2600} fill="#3a1a2a" />
        {/* screen doors on the left */}
        <Block x={-560} y={520} w={300} h={780} fill="#5a2a3a" />
        <Block x={-240} y={520} w={300} h={780} fill="#5a2a3a" />
        {/* menu boards */}
        {[0, 1, 2].map((i) => <Block key={i} x={140 + i * 270} y={250} w={240} h={170} r={10} fill="#1d1a2b" />)}
        {[0, 1, 2].map((i) => <Glow key={`g${i}`} x={260 + i * 270} y={335} r={150} color="#ffcf4a" o={0.2} />)}
        <PopMachine x={180} y={560} w={230} burst={m.t >= snack ? 1 : 0.1} t={m.t} />
        {/* the server and the till */}
        <Char x={760} y={1360} s={160} outfit="shirt" top="#d7262b" pants="#2a2f3d" hair="bun" hairColor="#3a2a2a" skin="#d8a07a" face="happy" armL={[60, 90]} armR={[20, 10]} />
        <Block x={-700} y={1020} w={2400} h={300} fill="#8a2a3a" shadow="bottom" />
        <g transform="translate(560 585)"><Photo name="amc" s={100} t={m.t / 30} /></g>
        <Display x={480} y={600} w={420} h={210} label="SNACKS EACH" value={m.t >= spends ? spend : ""} color="#4dff9a" k={till} />
        <Glow x={690} y={705} r={260} color="#4dff9a" o={0.5 * m.pulse(spends + 2, 10)} />
        {/* Rohan with a tub and a drink */}
        <Char x={420 - 200 * (1 - step)} y={1520 + m.wave(60, 3)} s={180} who="rohan" face="happy" armL={[70, 110]} armR={[70, 110]}
          holdL={(h) => <Tub x={h[0]} y={h[1] + 20} w={130} />} holdR={(h) => <Cup x={h[0]} y={h[1] + 20} s={0.7} />} />
      </View>
    </Stage>
  );
};

export default Counter;
