// Build: "And the CEO, Chris Kempczinski? He was paid {day_total} last year."
// The CEO's corner office at night, the city behind the glass. The desk lamp clicks on on "CEO", Kempczinski (his real
// head) spins round in his chair on "Chris", the wall screen counts up his pay on "paid", and he leans back with his
// hands behind his head on "last".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, CityWindow, Display, Glow, SourceLine, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GOLD } from "./props";

type Params = { fig?: { pay?: string } };

const Office: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pay = (p.beat.params as Params).fig?.pay ?? "";
  const ceo = m.at("ceo", 4), chris = m.at("chris", 14), paid = m.at("paid", 45), last = m.at("last", 110);
  const lamp = m.t >= ceo ? 1 : 0;
  const spin = m.lerp([chris - 2, chris + 8], [0, 1], Easing.out(Easing.cubic));
  const count = m.lerp([paid, paid + 40], [0, 1]);
  const lean = m.lerp([last - 2, last + 10], [0, 1]);
  const push = m.lerp([paid - 6, paid + 14], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#141826" vignette={0.42}>
        <View zoom={1.0 + 0.16 * push} cx={540 + m.wave(70, 8)} cy={900 - 160 * push + m.wave(60, 5)}>
          <rect x={-500} y={-500} width={2080} height={3000} fill="#2a2f45" />
          <CityWindow x={-200} y={180} w={420} h={760} night seed="kemp-l" />
          <CityWindow x={860} y={180} w={420} h={760} night seed="kemp-r" />
          {/* the wall screen with the pay */}
          <Display x={240} y={250} w={600} h={250} label="PAID LAST YEAR" value={count > 0 ? countText(pay, count) : ""} color={GOLD} k={0.4 + 0.6 * Math.min(1, count * 3)} />
          <rect x={-500} y={1100} width={2080} height={1500} fill="#4a3426" />
          {/* the CEO in his chair */}
          <Block x={430} y={850 + m.wave(80, 2)} w={220} h={320} r={50} fill="#3a1f1a" />
          <Char x={540} y={1250} s={200} outfit="suit" top="#2c3550" photo={spin > 0.5 ? "kempczinski" : undefined} back={spin < 0.5} sit
            face="grin" armL={lean > 0 ? [150 * lean + 12, 170 * lean] : [30, 40]} armR={lean > 0 ? [150 * lean + 12, 170 * lean] : [30, 40]} />
          {/* desk, lamp, nameplate */}
          <Block x={60} y={1080} w={960} h={170} r={14} fill="#7a5233" />
          <Block x={120} y={980} w={30} h={100} fill="#2a2a34" />
          <Block x={80} y={950} w={130} h={50} r={20} fill={lamp ? GOLD : "#55524a"} />
          <Glow x={150} y={1040} r={260} color={GOLD} o={0.45 * lamp} />
          <Tag x={600} y={1000} w={300} h={90} text="CEO" bg={GOLD} k={m.pop(chris - 1, 10)} />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Office;
