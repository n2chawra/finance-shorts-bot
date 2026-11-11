/**
 * Real photos and logos (owner, 2026-11-11: "I approve using real images"). Only freely licensed files
 * fetched by `python -m generator.images fetch` live in public/real/<name>.jpg (or .png), each with its
 * author, licence and source in public/real/credits.json, which the description credits at ship time.
 *
 * In a script a photo is a prop named `photo:<name>`: `{"id": "cr7", "prop": "photo:ronaldo", ...}`
 * in a build or board beat, `"into": "photo:ronaldo"` on a swap, or <Photo name="ronaldo" .../> in a
 * video's own code. It draws as a framed print standing on its base, like every other prop.
 */
import React, { useEffect, useId, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

import { INK, PALETTE, type PropFC, type PropSet } from "./draw";
import CREDITS from "../../public/real/credits.json";

interface Credit { file: string; aspect?: number; logo?: boolean }
const LIBRARY = CREDITS as Record<string, Credit>;

export const PHOTO_PREFIX = "photo:";
export const photoNames = (): string[] => Object.keys(LIBRARY);

/** The image is loaded before the frame is captured, so a still never shows an empty frame. */
function useLoaded(src: string): boolean {
  const [handle] = useState(() => delayRender(`photo ${src}`));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const img = new Image();
    const done = () => { setOk(true); continueRender(handle); };
    img.onload = done;
    img.onerror = done;
    img.src = src;
  }, [src, handle]);
  return ok;
}

/** A framed print about `s` tall, base on y = 0. Logos sit on a white card without the photo frame. */
export const Photo: React.FC<{ name: string; s: number; t?: number; state?: string }> = ({ name, s, state }) => {
  const c = LIBRARY[name];
  const id = useId().replace(/:/g, "");
  const src = c ? staticFile(`real/${c.file}`) : "";
  useLoaded(src || staticFile("grain.png"));
  const aspect = Math.max(0.55, Math.min(1.6, c?.aspect ?? 0.8));   // width / height of the picture
  const ph = s * 0.86, pw = ph * aspect, pad = s * 0.05;
  const x0 = -pw / 2, y0 = -s + pad;
  const grey = state === "broken" || state === "gone";
  return (
    <g>
      <ellipse cx={0} cy={0} rx={(pw + pad * 2) * 0.55} ry={s * 0.04} fill="rgba(0,0,0,0.18)" />
      <rect x={x0 - pad} y={y0 - pad} width={pw + pad * 2} height={ph + pad * 2} rx={s * 0.04}
        fill={PALETTE.white} stroke={INK} strokeWidth={Math.max(3, s * 0.012)} />
      <clipPath id={`ph${id}`}><rect x={x0} y={y0} width={pw} height={ph} rx={s * 0.02} /></clipPath>
      {c ? (
        <image href={src} x={x0} y={y0} width={pw} height={ph} clipPath={`url(#ph${id})`}
          preserveAspectRatio={c.logo ? "xMidYMid meet" : "xMidYMid slice"} style={grey ? { filter: "grayscale(1)" } : undefined} />
      ) : (
        <text x={0} y={y0 + ph / 2} textAnchor="middle" fontSize={s * 0.1} fill={INK}>{name}?</text>
      )}
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
