// Payoff: "When he sold, the team was valued at about {fact2}. That's {gap_ratio} what he paid."
// Back at the auction hall: the gavel falls on "sold", the price board counts up to the sale value on "valued", the
// old price tag Jordan paid hangs beside it, tiny, on "That's", and the times tag stamps between them as Jordan grins on
// "paid".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, Tag, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Hall } from "./Auction";
import { GOLD, Gavel, PriceBoard } from "./props";

type Params = { fig?: { sale?: string; paid?: string; times?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const sold = m.at("sold", 4), valued = m.at("valued", 16), that = m.at("that", 60), paid = m.at("paid", 90);
  const lift = m.lerp([0, sold - 2], [1, 1]) * (m.t < sold ? 1 : m.lerp([sold, sold + 3], [1, 0]));
  const count = m.lerp([valued, valued + 30], [0, 1]);
  const old = m.pop(that - 1, 10);
  const times = m.pop(paid - 1, 9);
  const wide = m.lerp([that - 4, that + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#3a1f2c" vignette={0.42}>
        <View zoom={1.15 - 0.15 * wide} cx={540 + m.wave(60, 6)} cy={600 + 200 * wide + m.wave(70, 5)}>
          <Hall lit={1}>
            <PriceBoard x={190} y={250} w={700} h={330} text={count > 0 ? countText(f.sale ?? "", count) : ""} label="VALUED AT" m={m} />
            {old > 0 ? <Tag x={150} y={610} w={300} h={100} text={f.paid ?? ""} size={56} bg="#e7e1d6" k={old} rot={-6} /> : null}
            {times > 0 ? <Tag x={580} y={600} w={300} h={140} text={f.times ?? ""} size={96} bg={GOLD} k={times} rot={5} /> : null}
            <Char x={330} y={1460 + m.wave(50, 3)} s={210} outfit="suit" top="#1d2433" photo="jordan" face={m.t >= paid ? "grin" : "smirk"} armR={m.t >= paid ? [150, 170] : [30, 20]} />
            <Char x={830} y={1300 + m.wave(50, 3)} s={170} outfit="suit" top="#2c2c38" face="happy" look={[-1, -0.3]} armR={[80 + 60 * lift, 40]} />
            <Gavel x={680} y={1020} lift={lift} />
          </Hall>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Payoff;
