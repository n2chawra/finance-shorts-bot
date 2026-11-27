/**
 * C (P4, the figure jump): the interest bill before the buyout struck through, the bill the year after, the cracked
 * wordmark as the subject, two words naming the cause. Figures are th.jump's filled placeholders (the 10-Ks).
 */
import React from "react";
import { DocThumb, Plate, PriceJump, ProductHero, StackWords, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-logo-of-toys-r-us-1986-2007-be9e8d19"
const LOGO = "media/business-documentaries-rise-and-fall-of/commons-photo-logo-of-toys-r-us-1986-2007-be9e8d19.png";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="dark" color="#1a2b4a" at={[0.32, 0.66]} w={w} h={h} />
      <ProductHero src={LOGO} aspect={960 / 164} cx={w * 0.34} cy={h * 0.74} height={h * 0.15} tilt={-7} rim="#cfe8ff"
        damage={{ crack: 0.7, grey: 0.35, seed: "tru-c" }} w={w} h={h} />
      {th.jump ? <PriceJump from={th.jump.from} to={th.jump.to} labels={th.jump.labels} dir={th.jump.dir} at={[0.5, 0.2]} w={w} h={h} /> : null}
      <StackWords text={th.words} w={w} h={h} cap={0.2} align="right" y={h * 0.42} maxW={w * 0.36} />
    </DocThumb>
  );
}
