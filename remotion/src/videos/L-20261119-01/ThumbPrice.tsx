/**
 * Thumbnail demo P4 (§3 B, as then → now): two figures with an arrow, the clog as the subject, one word asking how.
 * The figures are th.jump's filled placeholders (the 10-K revenues), drawn short by PriceJump.
 */
import React from "react";
import { DocThumb, Plate, PriceJump, ProductHero, StackWords, type ThumbProps } from "../../doc/thumb";

const CLOG = "media/business-documentaries-rise-and-fall-of/commons-photo-single-croc-ef3df225-cut.png";

export default function ThumbPrice({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="dark" color="#2f5a35" at={[0.32, 0.66]} w={w} h={h} />
      <ProductHero src={CLOG} aspect={1800 / 1155} box={[0.247, 0.268, 0.91, 0.978]} cx={w * 0.33} cy={h * 0.68} height={h * 0.5} tilt={-8}
        rim="#cfe8ff" w={w} h={h} />
      {th.jump ? <PriceJump from={th.jump.from} to={th.jump.to} labels={th.jump.labels} dir={th.jump.dir} at={[0.5, 0.2]} w={w} h={h} /> : null}
      <StackWords text={th.words} w={w} h={h} cap={0.22} align="right" y={h * 0.42} maxW={w * 0.36} />
    </DocThumb>
  );
}
