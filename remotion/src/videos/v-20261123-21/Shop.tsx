// Shop: "But that phone wasn't for sale. The first one you could buy weighed {fact5} grams, and was {fact6} millimetres long."
// A shop: the prototype on the counter as a shutter rolls down behind it ("But"); a NOT FOR SALE label
// writes on beside it ("sale"); the shutter starts rolling up ("first") on the shelves: the first handset on sale standing on a weighing scale ("buy", close);
// it drops onto the scale ("weighed") and bounces as the display flickers (4.9 s); the display counts up the grams ("grams"); a modern phone
// slides in beside it ("was"); a length bracket runs up the old handset ("millimetres"); pull back to
// both side by side ("long", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Bracket3D, Camera3D, direct, FigLabel3D, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Counter, HS, Handset, ModernPhone, Scale, Shutter, k01 } from "./Models";

type Params = { fig?: { grams?: string; mm?: string } };
const TOP = 0.55; // the scale's platform

const Shop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const but = m.at("but", 2);
  const sale = m.at("sale", 18);
  const first = m.at("first", 32);
  const buy = m.at("buy", 40);
  const weighed = m.at("weighed", 50);
  const grams = m.at("grams", 62);
  const was = m.at("was", 70);
  const mm = m.at("millimetres", 80);
  const long = m.at("long", 86);
  const end = Math.max(m.end, long + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const down = k01(f, but, 12) * (1 - k01(f, first, Math.max(10, buy - first + 4)));
  const fall = k01(f, weighed, 8);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 3.6, 0], dir: [0.2, 0.15, 1], from: 17, to: 16, dur: Math.max(8, buy), fov: 40 },
    { at: buy, move: "push", look: [-0.6, 3.4, 0], dir: [0.3, 0.2, 1], to: 11.5, dur: Math.max(8, long - buy) },
    { at: long, move: "pullback", look: [0.3, 3.4, 0], dir: [0.35, 0.18, 1], to: 14, dur: Math.max(12, end - long) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={10} light={1.2}>
        <Camera3D keys={keys} seed="v2321-shop" />
        <Counter />
        <group position={[-1, 0.09, 0]}>
          <Scale press={fall} lit={fall + 0.6 * m.pulse(147, 8)} />
          <group position={[0, TOP + 0.6 * (1 - fall) + 0.12 * m.pulse(147, 6), 0]} rotation-y={0.2}><Handset keys={0.5} lit={0.6} /></group>
        </group>
        <ModernPhone position={[2.6 + 3 * (1 - k01(f, was, 14)), 0.09, 0.4]} rotation-y={-0.2} />
        <Shutter down={down} position={[0, 0, -2.4]} />
        <Label3D at={[-1, 4, 0.9]} offset={[1.6, 1.4, 0]} text="Not for sale" start={sale} end={first + 4} px={66} color={TECH.amber} align="center" />
        <FigLabel3D fig={fig.grams ?? ""} caption="grams" at={[-1, 0.4, 1.7]} start={grams} count={18} px={110} color="#79ffb0" />
        <Bracket3D from={[-2.1, TOP + 0.09, 0.9]} to={[-2.1, TOP + 0.09 + HS.h + HS.ant, 0.9]} side={[-1, 0, 0]} fig={fig.mm ?? ""} caption="millimetres long" start={mm} px={72} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default Shop;
