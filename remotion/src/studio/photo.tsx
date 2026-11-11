/**
 * Real photos and logos (owner, 2026-11-11: "I approve using real images"; then "current image use looks
 * very bad": a framed rectangle pasted on a cartoon set). How the niche does it, and so how we do it:
 *  - never a rectangle: the subject is cut out of its background (`python -m generator.images` removes
 *    it offline when the photo is fetched) and edged like a die-cut sticker, a thick white rim and our ink
 *    line, so it sits in the set like any other thing;
 *  - a person is best as a bobblehead: their real head, a little oversized, on our cartoon body in the
 *    colour of their shirt (`"who": "photo:<name>"` in a beat's actors, cast/cast.ts);
 *  - as a thing (`"prop": "photo:<name>"`) the cut-out stands on the ground with a soft shadow and a slow
 *    sway, and enters, grows and swaps like every prop; a logo is cut along its own shape.
 * Only freely licensed files, credited in the description (public/real/credits.json).
 */
import React, { useEffect, useId, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

import { type PropFC, type PropSet } from "./draw";
import CREDITS from "../../public/real/credits.json";

interface Credit { file: string; aspect?: number; logo?: boolean; cut?: string; cutAspect?: number; head?: string; headAspect?: number }
const LIBRARY = CREDITS as Record<string, Credit>;

export const PHOTO_PREFIX = "photo:";
export const photoNames = (): string[] => Object.keys(LIBRARY);

/** The image is loaded before the frame is captured, so a still never shows an empty frame. */
function useLoaded(src: string): void {
  const [handle] = useState(() => delayRender(`photo ${src}`));
  useEffect(() => {
    const img = new Image();
    const done = () => continueRender(handle);
    img.onload = done;
    img.onerror = done;
    img.src = src;
  }, [src, handle]);
}

/** A soft contact shadow under the thing and a faint drop shadow behind the sticker (an SVG filter). */
const Shadowed: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <>
    <filter id={`sh${id}`} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.28" />
    </filter>
    <g filter={`url(#sh${id})`}>{children}</g>
  </>
);

/** The cut-out sticker about `s` tall, base on y = 0, swaying a little so it never sits dead still. */
export const Photo: React.FC<{ name: string; s: number; t?: number; state?: string }> = ({ name, s, t = 0, state }) => {
  const c = LIBRARY[name];
  const id = useId().replace(/:/g, "");
  const file = c?.cut ?? c?.file;
  const src = file ? staticFile(`real/${file}`) : staticFile("grain.png");
  useLoaded(src);
  if (!c || !file) {
    return <text x={0} y={-s / 2} textAnchor="middle" fontSize={s * 0.1} fill="#1d2433">{name}?</text>;
  }
  const aspect = Math.max(0.4, Math.min(2.4, (c.cut ? c.cutAspect : c.aspect) ?? 0.75));
  const w = s * aspect;
  const sway = Math.sin(t * 1.3) * 1.6;   // degrees, about the base
  const grey = state === "broken" || state === "gone";
  return (
    <g>
      <ellipse cx={0} cy={0} rx={w * 0.42} ry={s * 0.035} fill="rgba(0,0,0,0.22)" />
      <g transform={`rotate(${sway})`}>
        <Shadowed id={id}>
          <image href={src} x={-w / 2} y={-s} width={w} height={s} preserveAspectRatio="xMidYMax meet"
            style={grey ? { filter: "grayscale(1) brightness(0.9)" } : undefined} />
        </Shadowed>
      </g>
    </g>
  );
};

/** The real head of `name` in place of a cast member's drawn head (r = the rig's head radius), centred
 * where the drawn head is, a third bigger (bobblehead), turned a little with the body. */
export const PhotoHead: React.FC<{ name: string; r: number; turn?: number }> = ({ name, r, turn = 0 }) => {
  const c = LIBRARY[name];
  const src = c?.head ? staticFile(`real/${c.head}`) : staticFile("grain.png");
  useLoaded(src);
  if (!c?.head) return <circle r={r} fill="#d9a07a" stroke="#1d2433" strokeWidth={6} />;
  const h = r * 3.5, w = h * (c.headAspect ?? 0.88);
  // the sticker's chin sits on the neck: its bottom a little below the drawn jaw
  return (
    <g transform={`scale(${1 - Math.abs(turn) * 0.08},1)`}>
      <ellipse cx={0} cy={r * 1.05} rx={w * 0.3} ry={r * 0.12} fill="rgba(0,0,0,0.18)" />
      <image href={src} x={-w / 2} y={r * 1.15 - h} width={w} height={h} preserveAspectRatio="xMidYMax meet" />
    </g>
  );
};

const cache: Record<string, PropFC> = {};
const photoProp = (name: string): PropFC => (cache[name] ??= (p) => <Photo name={name} s={p.s} t={p.t} state={p.state} />);

/** A prop set that also knows every `photo:<name>`. */
export function withPhotos(set: PropSet): PropSet {
  return new Proxy(set, {
    get(target, key) {
      if (typeof key === "string" && !(key in target) && key.startsWith(PHOTO_PREFIX)) return photoProp(key.slice(PHOTO_PREFIX.length));
      return (target as Record<string | symbol, unknown>)[key];
    },
    has(target, key) {
      return key in target || (typeof key === "string" && key.startsWith(PHOTO_PREFIX));
    },
  });
}
