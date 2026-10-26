/**
 * Long-video thumbnails (owner, 2026-10-26: "the thumbnail is preventing people from clicking").
 * Our long thumbnails sold one small detail (a receipt with $45,424) and often a different video
 * from the title. The finance explainers that get millions sell the whole promise, in 1–3 huge words
 * that add to the title (2026 sample: Dhruv Rathee 10.1M, Little Bit Better 3.8M, Shain Isley
 * 1.13M, EverythingProfessor 1.09M, Psycho Bro 555K, how really? 551K):
 *
 *   grid      a list video: every item at once, a grid of the video's own things   ("DON'T FALL FOR THESE")
 *   ladder    a levels video: the whole ladder, coloured columns rising             (Shain Isley's 7 levels)
 *   extremes  rich vs poor: the two ends of the scale facing each other             (HOMELESS ↔ TRILLIONAIRE)
 *   face      a secret or a warning: one face, very big, and 2–3 huge words          ("BORROW UNTIL YOU DIE")
 *   scene     a story: one dramatic still of the video                               (Thumbnail.tsx SceneThumb)
 *
 * Things are drawn from the video's own props (videos/<id>/props.tsx), so no two thumbnails share a
 * picture. Rules checked in renderer/thumbs.py.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import type { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { INK, PALETTE, type PropSet, shade } from "../studio/draw";
import { SHARED_PROPS } from "../studio/build";
import { VIDEOS } from "../videos/hooks";
import { BigWords } from "./ThumbFormats";

type Th = NonNullable<Timeline["thumbnail"]>;
interface Item { prop?: string; label?: string; who?: string; pose?: string; expression?: string }
type LongTh = Th & { items?: Item[]; levels?: Item[]; ends?: (Item & { word?: string })[]; color?: string };

const COLORS: Record<string, [string, string]> = {
  teal: ["#0f8f86", "#0a5f59"], yellow: ["#ffd23f", "#f2a900"], red: ["#e5484d", "#a3171c"], navy: ["#1e2b5c", "#0d1430"],
  green: ["#1f9d55", "#0e6b37"], purple: ["#6c3fd1", "#3b1f85"], orange: ["#f2852b", "#c2560a"],
};
const LADDER = ["#e5484d", "#f2852b", "#ffd23f", "#2fb37a", "#1fa7a0", "#3d7bf5", "#8a63d2"];

function propsOf(tl: Timeline): PropSet {
  return { ...SHARED_PROPS, ...(VIDEOS[tl.id]?.props ?? {}) };
}

const Person: React.FC<{ it: Item; x: number; y: number; scale: number; gaze?: [number, number] }> = ({ it, x, y, scale, gaze }) => {
  const m = CAST[it.who ?? "rohan"];
  if (!m) return null;
  const pose = POSES[(it.pose ?? "stand") as PoseName] ?? POSES.stand;
  return <Character id={`p${it.who}${x | 0}`} look={m.look} pose={pose} expression={(it.expression ?? "neutral") as Expression} x={x} y={y} scale={scale} gaze={gaze} shadow={false} />;
};

const Thing: React.FC<{ it: Item; props: PropSet; x: number; y: number; s: number }> = ({ it, props, x, y, s }) => {
  const P = it.prop ? props[it.prop] : undefined;
  if (P) return <g transform={`translate(${x},${y})`}><P s={s} t={0.6} /></g>;
  return <Person it={it} x={x} y={y} scale={s / 560} />;
};

/** grid: the whole list at once, under a 2–4 word headline. */
export const GridThumb: React.FC<{ tl: Timeline; th: LongTh; w: number; h: number }> = ({ tl, th, w, h }) => {
  const props = propsOf(tl);
  const items = (th.items ?? []).slice(0, 12);
  const [c1, c2] = COLORS[th.color ?? "teal"] ?? COLORS.teal!;
  const cols = items.length <= 6 ? 3 : 4, rows = Math.ceil(items.length / cols);
  const top = h * 0.27, cw = (w - 60) / cols, ch = (h - top - 26) / rows;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${c1}, ${c2})`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 30, right: 30, top: 22, textAlign: "center", whiteSpace: "nowrap" }}>
        <BigWords text={th.words} size={Math.min(118, (w - 60) / Math.max(6, th.words.replace(/\*/g, "").length * 0.64))} />
      </div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {items.map((it, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x = 30 + cw * c, y = top + ch * r;
          return (
            <g key={i}>
              <rect x={x + 8} y={y + 6} width={cw - 16} height={ch - 12} rx={22} fill="#fff" stroke={INK} strokeWidth={6} />
              <Thing it={it} props={props} x={x + cw / 2} y={y + ch * (it.label ? 0.72 : 0.86)} s={ch * 0.55} />
              {it.label && <text x={x + cw / 2} y={y + ch - 22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.min(34, ch * 0.16)} fill={INK}>{it.label}</text>}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** ladder: every level at once, coloured columns rising left to right. */
export const LadderThumb: React.FC<{ tl: Timeline; th: LongTh; w: number; h: number }> = ({ tl, th, w, h }) => {
  const props = propsOf(tl);
  const levels = (th.levels ?? []).slice(0, 7);
  const n = Math.max(1, levels.length), cw = w / n;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #11142a, #262c55)", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {levels.map((it, i) => {
          const colTop = h * (0.78 - (0.5 * i) / Math.max(1, n - 1));
          const x = cw * i;
          return (
            <g key={i}>
              <rect x={x} y={colTop} width={cw} height={h - colTop} fill={LADDER[i % LADDER.length]} />
              <rect x={x} y={colTop} width={cw} height={10} fill="#fff" opacity={0.35} />
              <rect x={x + cw * 0.12} y={colTop + 16} width={cw * 0.76} height={44} rx={22} fill={INK} />
              <text x={x + cw / 2} y={colTop + 49} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">{`LEVEL ${i + 1}`}</text>
              <Thing it={it} props={props} x={x + cw / 2} y={colTop - 8} s={Math.min(cw * 0.95, h * 0.3)} />
              {it.label && <text x={x + cw / 2} y={h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.min(30, cw * 0.15)} fill={shade(INK, 0.1)}>{it.label}</text>}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 30, right: w * 0.36, top: 22 }}>
        <BigWords text={th.words} size={104} />
      </div>
    </AbsoluteFill>
  );
};

/** extremes: the two ends of the scale facing each other, one huge word each. */
export const ExtremesThumb: React.FC<{ tl: Timeline; th: LongTh; w: number; h: number }> = ({ tl, th, w, h }) => {
  const props = propsOf(tl);
  const [a, b] = th.ends ?? [];
  const side = (e: (Item & { word?: string }) | undefined, right: boolean) => e && (
    <>
      <div style={{ position: "absolute", top: 24, left: right ? w * 0.53 : 24, width: w * 0.44, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 92, color: "#fff", textTransform: "uppercase",
          background: right ? "#1f9d55" : "#a3171c", padding: "2px 26px", borderRadius: 20, border: "7px solid #fff", boxShadow: "0 10px 0 rgba(0,0,0,0.45)" }}>{e.word}</span>
      </div>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {e.prop && props[e.prop] && <g transform={`translate(${right ? w * 0.9 : w * 0.1},${h * 0.98})`}>{React.createElement(props[e.prop]!, { s: h * 0.34, t: 0.6 })}</g>}
        <Person it={e} x={right ? w * 0.7 : w * 0.3} y={h * 1.62} scale={1.75} gaze={[right ? -0.6 : 0.6, 0]} />
      </svg>
    </>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(135deg, #5b6378, #2b3042)", clipPath: "polygon(0 0, 54% 0, 46% 100%, 0 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 75% 40%, #ffd23f, #e08a00)", clipPath: "polygon(54% 0, 100% 0, 100% 100%, 46% 100%)" }} />
      <svg width={w} height={h} style={{ position: "absolute" }}><line x1={w * 0.54} y1={0} x2={w * 0.46} y2={h} stroke="#fff" strokeWidth={12} /></svg>
      {side(a, false)}
      {side(b, true)}
      {th.words && <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}><BigWords text={th.words} size={70} /></div>}
    </AbsoluteFill>
  );
};

/** face: one face very big with one strong expression, and 2–3 huge words. */
export const FaceThumb: React.FC<{ tl: Timeline; th: LongTh; w: number; h: number }> = ({ tl, th, w, h }) => {
  const props = propsOf(tl);
  const [c1, c2] = COLORS[th.color ?? "red"] ?? COLORS.red!;
  const prop = th.items?.[0];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 70% 45%, ${c1}, ${c2})`, overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <Person it={{ who: th.who, pose: th.pose ?? "worried", expression: th.expression ?? "shock" }} x={w * 0.74} y={h * 2.2} scale={2.9} gaze={[-0.5, 0.1]} />
        {prop?.prop && props[prop.prop] && <g transform={`translate(${w * 0.3},${h * 0.97}) rotate(-6)`}>{React.createElement(props[prop.prop]!, { s: h * 0.42, t: 0.6 })}</g>}
      </svg>
      <div style={{ position: "absolute", left: 34, top: 40, width: w * 0.5 }}>
        <BigWords text={th.words} size={124} />
      </div>
    </AbsoluteFill>
  );
};

export const LONG_LAYOUTS = ["grid", "ladder", "extremes", "face"] as const;

export const LongThumb: React.FC<{ tl: Timeline; w: number; h: number }> = ({ tl, w, h }) => {
  const th = tl.thumbnail as LongTh;
  if (th.layout === "grid") return <GridThumb tl={tl} th={th} w={w} h={h} />;
  if (th.layout === "ladder") return <LadderThumb tl={tl} th={th} w={w} h={h} />;
  if (th.layout === "extremes") return <ExtremesThumb tl={tl} th={th} w={w} h={h} />;
  return <FaceThumb tl={tl} th={th} w={w} h={h} />;
};

export { PALETTE };
