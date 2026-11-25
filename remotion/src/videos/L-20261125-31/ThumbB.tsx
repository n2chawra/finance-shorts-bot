/**
 * B (P1, the loser's product ruined): Pizza Hut's pan pizza, greyed, dusty and cracked, at the bottom of a red crash
 * line on off-white grid paper; the verdict words, and the sale price on a red tag (th.figure, short form).
 */
import React from "react";
import { CrashLine, DocThumb, Plate, ProductHero, StackWords, VerdictTag, crashKey, shortFig, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-pizza-hut-pepperoni-pan-pizza-5aa07cce-cut"
const PAN = "media/business-documentaries-rise-and-fall-of/commons-photo-pizza-hut-pepperoni-pan-pizza-5aa07cce-cut.png";

export default function ThumbB({ th, w, h }: ThumbProps) {
  const box: [number, number, number, number] = [0.36, 0.06, 0.97, 0.72];
  const [kx] = crashKey("crash", box);
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="grid" at={[0.62, 0.5]} w={w} h={h} />
      <CrashLine shape="crash" box={box} seed="pizza-hut-2026" w={w} h={h} />
      <ProductHero src={PAN} aspect={1800 / 1350} box={[0.0, 0.147, 0.969, 1.0]} cx={Math.min(kx, 0.66) * w} cy={h * 0.6} height={h * 0.5} tilt={-8}
        damage={{ grey: 0.65, dust: 0.6, crack: 0.6, seed: "hut" }} w={w} h={h} />
      <StackWords text={th.words} w={w} h={h} cap={0.16} maxW={w * 0.36} color="#16181d" hi="#d8352a" shadow="light" />
      {th.figure ? <VerdictTag kind="block" text={shortFig(th.figure)} at={[0.19, 0.78]} tilt={-6} cap={0.11} w={w} h={h} /> : null}
    </DocThumb>
  );
}
