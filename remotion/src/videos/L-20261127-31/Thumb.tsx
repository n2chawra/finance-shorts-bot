/**
 * A (P2, the brand huge with a verdict): the Toys R Us wordmark (Commons, public domain), cracked and dusty, on the
 * brand's blue; the verdict on tilted red and white blocks. The on-topic hit (Company Man, "The Decline of Toys R Us")
 * puts the wordmark at the centre the same way.
 */
import React from "react";
import { DocThumb, Plate, ProductHero, VerdictTag, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-logo-of-toys-r-us-1986-2007-be9e8d19"
const LOGO = "media/business-documentaries-rise-and-fall-of/commons-photo-logo-of-toys-r-us-1986-2007-be9e8d19.png";

export default function Thumb({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="brand" color="#1f5fbf" at={[0.5, 0.36]} w={w} h={h} />
      <ProductHero src={LOGO} aspect={960 / 164} cx={w * 0.5} cy={h * 0.32} height={h * 0.2} tilt={-5} rim="#ffffff"
        damage={{ crack: 0.8, dust: 0.3, grey: 0.15, seed: "tru-logo" }} w={w} h={h} />
      <VerdictTag kind="block" text={th.verdict ?? th.words} at={[0.36, 0.72]} tilt={-5} cap={0.14} w={w} h={h} />
    </DocThumb>
  );
}
