/**
 * A montage of several photos inside one layer, so a beat can show many pictures fast:
 *   mode "punch"  the hook montage: each photo full frame, cut in with a zoom punch (1.18 → 1.04) and a
 *                 2-frame white flash, still pushing; a hard cut to the next; the last one holds and pushes
 *   mode "stack"  prints thrown onto a dark desk: each white-bordered print drops in from off frame at a
 *                 seeded angle, bounces as it lands and piles on the last; older prints darken; the camera pushes
 *   mode "grid"   an evidence wall: photos tile into a 2×3 (vertical) or 3×2 (landscape) grid one by one,
 *                 each popping in; after the last lands the wall pushes in toward it
 * Items arrive on their `at` (layer-clock frames, from the beat's words) or every `every` frames.
 * Deterministic: every offset and angle comes from a seeded hash of the item's src.
 */
import React, { useId } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { rng } from "../flat/kit";
import { clamp01, DOC, DocVignette, FilmGrain, fs, outBack, outCubic, SERIF, smooth, SurfaceBg, unit, useGrade, type GradeName } from "./theme";

export const MONTAGE_MODES = ["punch", "stack", "grid"] as const;
export type MontageMode = (typeof MONTAGE_MODES)[number];
export const isMontageMode = (x: unknown): x is MontageMode => typeof x === "string" && (MONTAGE_MODES as readonly string[]).includes(x);

export type MontageItem = { src: string; focus?: [number, number]; aspect?: number; caption?: string; at?: number };

type Props = { items: MontageItem[]; mode: MontageMode; every?: number; grade?: GradeName; t: number; end: number; w: number; h: number };

const pos = (f?: [number, number]) => (f ? `${f[0] * 100}% ${f[1] * 100}%` : "50% 40%");

const Pic: React.FC<{ it: MontageItem; filter: string; style?: React.CSSProperties }> = ({ it, filter, style }) => (
  <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos(it.focus), display: "block",
    filter: filter === "none" ? undefined : filter, ...style }} />
);

export const Montage: React.FC<Props> = ({ items, mode, every = 10, grade = "doc", t, end, w, h }) => {
  const id = `docmontage-${useId().replace(/:/g, "")}`;
  const { defs, filter } = useGrade(grade, id);
  const u = unit(w, h);
  const v = h > w;
  if (!items.length) return null;
  // when each item arrives (layer clock): its `at`, else every `every` frames
  const starts = items.map((it, i) => (typeof it.at === "number" ? it.at : i * every));
  const shown = starts.filter((s) => t >= s).length;   // how many have arrived
  const st = (i: number): number => starts[i] ?? 0;

  if (mode === "punch") {
    const i = Math.max(0, shown - 1);
    const it = items[i] as MontageItem;
    const lt = t - st(i);
    const next = i + 1 < items.length ? st(i + 1) : Math.max(end, st(i) + 1);
    const span = Math.max(1, next - st(i));
    const last = i === items.length - 1;
    // the punch: 1.18 → 1.04 over 6 frames, then a slow push (faster on short clips, gentler on the held last one)
    const punch = 1.18 - 0.14 * outCubic(lt / 6);
    const push = (last ? 0.06 : 0.035) * smooth(lt / span);
    const flash = lt < 2 ? (lt < 1 ? 0.85 : 0.4) : 0;
    const r = rng(`punch-${it.src}`);
    const dx = (r() - 0.5) * 2.4, dy = (r() - 0.5) * 2.4;   // each clip leans a different way
    return (
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {defs}
        <AbsoluteFill style={{ transform: `scale(${punch + push}) translate(${dx * smooth(lt / span)}%, ${dy * smooth(lt / span)}%)`, transformOrigin: pos(it.focus) }}>
          <Pic it={it} filter={filter} />
        </AbsoluteFill>
        <FilmGrain t={t} o={0.3} />
        <DocVignette o={0.5} />
        {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
      </AbsoluteFill>
    );
  }

  if (mode === "stack") {
    const cardW = v ? w * 0.6 : w * 0.32;
    const zoom = 1 + 0.08 * smooth(end > 0 ? t / end : 0);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {defs}
        <SurfaceBg kind="desk" />
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {items.slice(0, shown).map((it, i) => {
            const r = rng(`stack-${it.src}-${i}`);
            const lt = t - st(i);
            const rot = (r() - 0.5) * 18;
            const ox = (r() - 0.5) * (v ? 0.34 : 0.5) * w, oy = (r() - 0.5) * (v ? 0.5 : 0.3) * h;
            const from = r() < 0.5 ? -1 : 1;                       // thrown from the left or the right
            const fly = outCubic(lt / 9);
            const land = outBack(lt / 13);
            const aspect = it.aspect ?? 1.4;
            const imgW = cardW, imgH = Math.min(imgW / aspect, v ? h * 0.3 : h * 0.5);
            const pad = 18 * u, capH = it.caption ? 70 * u : 26 * u;
            const above = shown - 1 - i;                           // prints laid on top of this one
            const dark = Math.min(0.45, above * 0.16);
            return (
              <div key={i} style={{ position: "absolute", left: w / 2 + ox - (imgW + pad * 2) / 2, top: h / 2 + oy - (imgH + pad + capH) / 2,
                width: imgW + pad * 2, height: imgH + pad + capH, background: "#f6f3ec",
                transform: `translate(${(1 - fly) * from * w * 0.9}px, ${(1 - fly) * -h * 0.25}px) rotate(${rot + (1 - fly) * from * 25}deg) scale(${1.12 - 0.12 * land})`,
                boxShadow: `0 ${(8 + 26 * (1 - land)) * u}px ${(24 + 50 * (1 - land)) * u}px rgba(0,0,0,0.55), 0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.35)` }}>
                <div style={{ position: "absolute", left: pad, top: pad, width: imgW, height: imgH, overflow: "hidden", background: "#222" }}>
                  <Pic it={it} filter={filter} />
                </div>
                {it.caption ? (
                  <div style={{ position: "absolute", left: pad, right: pad, top: pad + imgH, height: capH, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: fs(w, h, 36), color: DOC.paperInk }}>{it.caption}</div>
                ) : null}
                <AbsoluteFill style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 40%, rgba(0,0,0,0.08))" }} />
                {dark > 0 ? <AbsoluteFill style={{ background: "#000", opacity: dark }} /> : null}
              </div>
            );
          })}
        </AbsoluteFill>
        <FilmGrain t={t} o={0.3} moving={false} />
        <DocVignette o={0.6} />
      </AbsoluteFill>
    );
  }

  // grid: an evidence wall
  const cols = v ? 2 : 3, rows = v ? 3 : 2;
  const gap = 14 * u, margin = v ? 70 * u : 60 * u;
  const cellW = (w - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (h - margin * 2 - gap * (rows - 1)) / rows;
  const cells = items.slice(0, cols * rows);
  const lastI = Math.min(shown, cells.length) - 1;
  const done = cells.length ? st(cells.length - 1) : 0;
  const pk = smooth((t - done - 8) / Math.max(20, end - done - 8));
  const target = lastI >= 0 ? lastI : 0;
  const cx = margin + (target % cols) * (cellW + gap) + cellW / 2, cy = margin + Math.floor(target / cols) * (cellH + gap) + cellH / 2;
  const z = 1 + 0.35 * pk;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: DOC.bg }}>
      {defs}
      <SurfaceBg kind="dark" />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px` }}>
        {cells.slice(0, shown).map((it, i) => {
          const lt = t - st(i);
          const pop = outBack(lt / 10);
          const col = i % cols, row = Math.floor(i / cols);
          const newest = i === lastI;
          return (
            <div key={i} style={{ position: "absolute", left: margin + col * (cellW + gap), top: margin + row * (cellH + gap), width: cellW, height: cellH,
              overflow: "hidden", opacity: clamp01(lt / 3), transform: `scale(${0.6 + 0.4 * pop})`,
              outline: newest ? `${4 * u}px solid ${DOC.gold}` : undefined, boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.6)` }}>
              <Pic it={it} filter={filter} style={{ transform: `scale(${1.08 + 0.04 * smooth(lt / 60)})` }} />
              {!newest && lastI >= 0 ? <AbsoluteFill style={{ background: "#000", opacity: 0.35 * pk + 0.15 }} /> : null}
              {lt < 2 ? <AbsoluteFill style={{ background: "#fff", opacity: lt < 1 ? 0.7 : 0.3 }} /> : null}
            </div>
          );
        })}
      </AbsoluteFill>
      <FilmGrain t={t} o={0.25} moving={false} />
      <DocVignette o={0.5} />
    </AbsoluteFill>
  );
};
