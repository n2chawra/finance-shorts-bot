/**
 * B (P1, the ruined product on a crash line): the abandoned Toys R Us store in Monroe, Louisiana (Commons, CC BY-SA),
 * cut out, greyed and cracked at the bottom of a red crash line on off-white grid paper; the on-topic hit's question.
 */
import React from "react";
import { CrashLine, DocThumb, Plate, ProductHero, StackWords, crashKey, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-abandoned-toys-r-us-in-monroe-la-01-22f7387d-cut"
const STORE = "media/business-documentaries-rise-and-fall-of/commons-photo-abandoned-toys-r-us-in-monroe-la-01-22f7387d-cut.png";

export default function ThumbB({ th, w, h }: ThumbProps) {
  const box: [number, number, number, number] = [0.34, 0.06, 0.97, 0.7];
  const [kx] = crashKey("crash", box);
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="grid" at={[0.62, 0.5]} w={w} h={h} />
      <CrashLine shape="crash" box={box} seed="toys-r-us-2018" w={w} h={h} />
      <ProductHero src={STORE} aspect={1800 / 1013} box={[0.0, 0.084, 1.0, 1.0]} cx={Math.max(kx, 0.64) * w} cy={h * 0.6} height={h * 0.62} tilt={-6}
        damage={{ grey: 0.6, dust: 0.5, crack: 0.5, seed: "store" }} w={w} h={h} />
      <StackWords text={th.words} w={w} h={h} cap={0.15} maxW={w * 0.36} color="#16181d" hi="#d8352a" shadow="light" />
    </DocThumb>
  );
}
