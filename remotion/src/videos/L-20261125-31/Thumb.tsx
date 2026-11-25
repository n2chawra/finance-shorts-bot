/**
 * A (P5, versus: the playbook's first pick for a business war): Pizza Hut's side dark, its pan pizza cracked and greyed
 * (the loser's side takes the damage, VersusSplit's note), Domino's side bright with its mark; two words naming the
 * fight on the bright side, clear of both marks and of the duration corner.
 */
import React from "react";
import { DocThumb, ProductHero, StackWords, VersusSplit, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-pizza-hut-2025-26edd20e", "media:commons-photo-dominos-pizza-logo-03cf39ee",
// "media:commons-photo-pizza-hut-super-supreme-691dcbf9-cut"
const HUT = "media/business-documentaries-rise-and-fall-of/commons-photo-pizza-hut-2025-26edd20e.png";
const DOM = "media/business-documentaries-rise-and-fall-of/commons-photo-dominos-pizza-logo-03cf39ee.png";
const PAN = "media/business-documentaries-rise-and-fall-of/commons-photo-pizza-hut-super-supreme-691dcbf9-cut.png";

export default function Thumb({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <VersusSplit left="#2a0d0d" right="#e8eef3" w={w} h={h}>
        <ProductHero src={HUT} aspect={1920 / 1613} cx={w * 0.22} cy={h * 0.27} height={h * 0.38} tilt={-6} edge={0} rim="#ffffff" w={w} h={h} />
        <ProductHero src={PAN} aspect={1800 / 1350} box={[0.0, 0.0, 1.0, 0.966]} cx={w * 0.25} cy={h * 0.72} height={h * 0.46} tilt={-10}
          damage={{ grey: 0.55, dust: 0.5, crack: 0.7, seed: "hut-a" }} rim="#ffd9b0" w={w} h={h} />
        <ProductHero src={DOM} aspect={1920 / 1671} cx={w * 0.71} cy={h * 0.6} height={h * 0.42} tilt={5} edge={0} rim="#ffffff" rimFrom="right" w={w} h={h} />
      </VersusSplit>
      <StackWords text={th.words} w={w} h={h} cap={0.14} x={w * 0.56} y={h * 0.04} maxW={w * 0.41} color="#16181d" hi="#d8352a" shadow="light" />
    </DocThumb>
  );
}
