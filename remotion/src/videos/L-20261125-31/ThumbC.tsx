/**
 * C (P4, the market-share jump): Pizza Hut's share of US pizza then and now (th.jump: two Restaurant Dive figures),
 * struck through and falling, with the pan pizza as the subject on a dark red plate.
 */
import React from "react";
import { DocThumb, Plate, PriceJump, ProductHero, StackWords, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-pizza-hut-super-supreme-691dcbf9-cut"
const PAN = "media/business-documentaries-rise-and-fall-of/commons-photo-pizza-hut-super-supreme-691dcbf9-cut.png";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="dark" color="#8a2116" at={[0.3, 0.66]} w={w} h={h} />
      <ProductHero src={PAN} aspect={1800 / 1350} box={[0.0, 0.0, 1.0, 0.966]} cx={w * 0.27} cy={h * 0.66} height={h * 0.5} tilt={-8} rim="#ffe1c2" w={w} h={h} />
      {th.jump ? <PriceJump from={th.jump.from} to={th.jump.to} labels={th.jump.labels} dir={th.jump.dir} at={[0.66, 0.24]} w={w} h={h} /> : null}
      <StackWords text={th.words} w={w} h={h} cap={0.2} align="right" y={h * 0.44} maxW={w * 0.4} />
    </DocThumb>
  );
}
