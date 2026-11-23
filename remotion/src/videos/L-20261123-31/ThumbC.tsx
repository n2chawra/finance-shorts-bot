/**
 * Thumbnail demo P2 (§3 C): the brand, huge, with a verdict tag. The store's own Crocs sign (Commons), cut out and
 * cracked, on Crocs green; the verdict on tilted red and white blocks.
 */
import React from "react";
import { DocThumb, Plate, ProductHero, VerdictTag, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-crocs-outlet-store-14771327729-f31696c5-cut"
const SIGN = "media/business-documentaries-rise-and-fall-of/commons-photo-crocs-outlet-store-14771327729-f31696c5-cut.png";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="brand" color="#3f9e2c" at={[0.62, 0.4]} w={w} h={h} />
      <ProductHero src={SIGN} aspect={1800 / 1344} box={[0.231, 0.278, 0.941, 0.879]} cx={w * 0.6} cy={h * 0.42} height={h * 0.64} tilt={-4}
        rim="#ffffff" damage={{ crack: 0.75, dust: 0.2, seed: "sign" }} w={w} h={h} />
      <VerdictTag kind="block" text={th.verdict ?? th.words} at={[0.3, 0.73]} tilt={-5} cap={0.13} w={w} h={h} />
    </DocThumb>
  );
}
