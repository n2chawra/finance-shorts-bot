/**
 * Thumbnail demo P1 (the playbook's set for Crocs, style-study/2026-11-20-thumbnails.md §3 A): the ruined product on a
 * crash chart. One cut-out clog, dusty, cracked and drained of colour, at the bottom of a red-then-green V on
 * off-white grid paper; "ALMOST DEAD" stacked on the left, the 2008 loss on a small red tag (th.figure, short form).
 */
import React from "react";
import { CrashLine, DocThumb, Plate, ProductHero, StackWords, VerdictTag, crashKey, shortFig, type ThumbProps } from "../../doc/thumb";

// staged for the render: "media:commons-photo-single-croc-ef3df225-cut"
const CLOG = "media/business-documentaries-rise-and-fall-of/commons-photo-single-croc-ef3df225-cut.png";

export default function Thumb({ th, w, h }: ThumbProps) {
  const box: [number, number, number, number] = [0.36, 0.06, 0.97, 0.7];
  const [kx] = crashKey("v", box);
  return (
    <DocThumb w={w} h={h}>
      <Plate kind="grid" at={[0.62, 0.5]} w={w} h={h} />
      <CrashLine shape="v" box={box} seed="crocs-2008" w={w} h={h} />
      <ProductHero src={CLOG} aspect={1800 / 1155} box={[0.247, 0.268, 0.91, 0.978]} cx={kx * w - w * 0.02} cy={h * 0.55} height={h * 0.58} tilt={-7}
        damage={{ grey: 0.7, dust: 0.6, crack: 0.6, seed: "crocs" }} w={w} h={h} />
      <StackWords text={th.words} w={w} h={h} cap={0.16} maxW={w * 0.36} color="#16181d" hi="#d8352a" shadow="light" />
      {th.figure ? <VerdictTag kind="block" text={`−${shortFig(th.figure)}`} at={[0.19, 0.76]} tilt={-6} cap={0.11} w={w} h={h} /> : null}
    </DocThumb>
  );
}
