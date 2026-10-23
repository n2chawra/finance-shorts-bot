/**
 * A video's thumbnail: one cast member reacting, one figure Python computed, at most four words.
 * Read at phone size in a feed, so everything is big and high-contrast. The size follows the
 * video: a long video's is YouTube's 1280×720; a Short's is its 1080×1920 cover (9:16), with the
 * words on top, the figure in the middle and the character below.
 */
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { PROPS } from "../scenes/kit";
import { StoryVideo, type StoryProps } from "./StoryVideo";
import { BigWords, SecretThumb, VersusThumb } from "./ThumbFormats";

export const THUMB = { width: 1280, height: 720 } as const;
export const SHORT_THUMB = { width: 1080, height: 1920 } as const;

/** The thumbnail's size for a timeline: a Short's cover is vertical. */
export const thumbSize = (tl: Pick<Timeline, "format">) => (tl.format === "short" ? SHORT_THUMB : THUMB);

export const calculateThumbnailMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const tl = Timeline.parse(props.timeline);
  if (!tl.thumbnail) throw new Error("this timeline has no thumbnail block");
  return { props: { timeline: tl }, ...thumbSize(tl) };
};

/** The thing a story is about, drawn big for a thumbnail: a card, a phone, a house, a car, cash, a piggy bank. */
const Hero: React.FC<{ kind: string; x: number; y: number; cw: number; ch: number; k: number }> = ({ kind, x, y, cw, ch, k }) => {
  switch (kind) {
    case "phone": return <g><rect x={x + cw * 0.25} y={y - ch * 0.35} width={cw * 0.5} height={ch * 1.6} rx={36} fill="#1d2433" stroke="#ffffff" strokeWidth={6} />
      <rect x={x + cw * 0.29} y={y - ch * 0.27} width={cw * 0.42} height={ch * 1.42} rx={22} fill="#3d7bf5" /></g>;
    case "house": return <g><path d={`M${x},${y + ch * 0.4} L${x + cw / 2},${y - ch * 0.35} L${x + cw},${y + ch * 0.4}Z`} fill="#e8613c" stroke="#ffffff" strokeWidth={6} />
      <rect x={x + cw * 0.1} y={y + ch * 0.38} width={cw * 0.8} height={ch * 0.62} fill="#f6d7a7" stroke="#ffffff" strokeWidth={6} />
      <rect x={x + cw * 0.18} y={y + ch * 0.5} width={cw * 0.18} height={ch * 0.5} fill="#8d5524" /></g>;
    case "car": return <g><rect x={x} y={y + ch * 0.35} width={cw} height={ch * 0.4} rx={30} fill="#e03131" stroke="#ffffff" strokeWidth={6} />
      <path d={`M${x + cw * 0.2},${y + ch * 0.36} L${x + cw * 0.32},${y} L${x + cw * 0.72},${y} L${x + cw * 0.84},${y + ch * 0.36}Z`} fill="#c92a2a" stroke="#ffffff" strokeWidth={6} />
      <circle cx={x + cw * 0.24} cy={y + ch * 0.8} r={ch * 0.17} fill="#1d2433" /><circle cx={x + cw * 0.76} cy={y + ch * 0.8} r={ch * 0.17} fill="#1d2433" /></g>;
    case "cash": return <g>{[0, 1, 2].map((i) => <g key={i} transform={`translate(0,${-i * 26 * k})`}>
      <rect x={x} y={y + ch * 0.3} width={cw} height={ch * 0.55} rx={14} fill="#3fae6a" stroke="#ffffff" strokeWidth={5} />
      <circle cx={x + cw / 2} cy={y + ch * 0.575} r={ch * 0.16} fill="#9fe0b4" /></g>)}</g>;
    case "piggy": return <g><ellipse cx={x + cw / 2} cy={y + ch / 2} rx={cw / 2} ry={ch / 2} fill="#f6a3b5" stroke="#ffffff" strokeWidth={6} />
      <ellipse cx={x + cw * 0.95} cy={y + ch * 0.5} rx={cw * 0.1} ry={ch * 0.13} fill="#f08ca4" /><rect x={x + cw * 0.42} y={y + 6} width={cw * 0.16} height={10} rx={5} fill="#a04b62" /></g>;
    default: return <g><rect x={x} y={y} width={cw} height={ch} rx={24} fill="#2f5bd8" stroke="#ffffff" strokeWidth={6} />
      <rect x={x} y={y + ch * 0.16} width={cw} height={ch * 0.15} fill="#1d3a91" />
      <rect x={x + 34} y={y + ch * 0.42} width={62 * k} height={46 * k} rx={9} fill="#ffd34d" /></g>;
  }
};

/** The "story" layout (2026-10-19, after studying top finance thumbnails): one picture that tells the
 * story at a glance (a small payment on his phone turning into a giant bill) and two or three huge
 * words that add what the picture can't say. No sub line, no figure floating on a gradient. */
const StoryThumb: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail!;
  const member = CAST[th.who];
  if (!member) throw new Error(`unknown cast member ${th.who}`);
  const { width: w, height: h } = thumbSize(timeline);
  const v = h > w;
  const danger = timeline.palette.danger;
  // a picture that reads as an equation: the card with its small payment -> the receipt it becomes
  const k = v ? 1.35 : 1;
  const card = v ? { x: 70, y: 560, cw: 460, ch: 290 } : { x: 36, y: 300, cw: 380, ch: 240 };
  const rc = v ? { x: 560, y: 470, rw: 460, rh: 860 } : { x: 520, y: 238, rw: 360, rh: 470 };
  const arrow = v ? { x: 300, y: 1000 } : { x: 448, y: 470 };
  const zig = (x: number, y: number, wdt: number) => Array.from({ length: 13 }, (_, i) => `L${x + (wdt / 12) * i},${y + (i % 2 ? 18 : 0)}`).join(" ");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 55% 70%, #5a1f3a, #120f2b 65%)", overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {/* the hero object the story is about, tilted, with the small amount stuck on it */}
        <g transform={`rotate(-10 ${card.x + card.cw / 2} ${card.y + card.ch / 2})`}>
          <Hero kind={th.hero ?? "card"} x={card.x} y={card.y} cw={card.cw} ch={card.ch} k={k} />
          {th.small && <g transform={`translate(${card.x + card.cw * 0.6},${card.y + card.ch * 0.62}) rotate(6)`}>
            <rect x={-120 * k} y={-52 * k} width={240 * k} height={104 * k} rx={14} fill="#7cf0b2" stroke="#0e3b2a" strokeWidth={5} />
            <text x={0} y={-10 * k} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24 * k} fill="#0e3b2a">{(th.tag ?? "").toUpperCase()}</text>
            <text x={0} y={(th.tag ? 38 : 18) * k} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50 * k} fill="#0e3b2a">{th.small}</text>
          </g>}
        </g>
        {/* the arrow */}
        <path d={`M${arrow.x - 30 * k},${arrow.y} L${arrow.x + 30 * k},${arrow.y}`} stroke="#ffd34d" strokeWidth={22 * k} strokeLinecap="round" />
        <path d={`M${arrow.x + 10 * k},${arrow.y - 34 * k} L${arrow.x + 52 * k},${arrow.y} L${arrow.x + 10 * k},${arrow.y + 34 * k}`} fill="none" stroke="#ffd34d" strokeWidth={22 * k} strokeLinecap="round" strokeLinejoin="round" />
        {/* the receipt it turns into, long, torn at the bottom */}
        <g transform={`rotate(4 ${rc.x + rc.rw / 2} ${rc.y + rc.rh / 2})`}>
          <path d={`M${rc.x},${rc.y} L${rc.x + rc.rw},${rc.y} L${rc.x + rc.rw},${rc.y + rc.rh} ${zig(rc.x + rc.rw, rc.y + rc.rh, -rc.rw)} Z`} fill="#fbf7ee" stroke="#d8cfbb" strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => <g key={i}>
            <rect x={rc.x + 30} y={rc.y + 40 + i * 42 * k} width={rc.rw * (0.35 + (i % 3) * 0.1)} height={12 * k} rx={6} fill="#ddd2bd" />
            <rect x={rc.x + rc.rw - 30 - rc.rw * 0.18} y={rc.y + 40 + i * 42 * k} width={rc.rw * 0.18} height={12 * k} rx={6} fill="#ddd2bd" />
          </g>)}
          <line x1={rc.x + 24} x2={rc.x + rc.rw - 24} y1={rc.y + rc.rh * 0.6} y2={rc.y + rc.rh * 0.6} stroke="#5b5040" strokeWidth={4} strokeDasharray="12 8" />
          <text x={rc.x + rc.rw / 2} y={rc.y + rc.rh * 0.72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40 * k} fill="#5b5040">{(th.to ?? "You pay").toUpperCase()}</text>
          <text x={rc.x + rc.rw / 2} y={rc.y + rc.rh * 0.9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(108 * k, (rc.rw - 30) / Math.max(4, th.figure.length * 0.56))} fill={danger}>{th.figure}</text>
        </g>
        <Character id="thumb" look={member.look} pose={POSES[(th.pose ?? "worried") as PoseName] ?? POSES.worried} expression={(th.expression ?? "shock") as Expression}
          x={v ? w * 0.86 : w * 0.88} y={v ? h * 1.3 : h * 1.55} scale={v ? 2.4 : 1.75} gaze={[-0.7, 0.2]} shadow={false} />
      </svg>
      <div style={{ position: "absolute", left: 36, top: v ? 60 : 18, width: v ? w - 72 : w * 0.82, textAlign: "left", fontFamily: FONT,
        fontWeight: 900, fontSize: v ? 128 : 100, lineHeight: 0.95, color: "#ffffff", textTransform: "uppercase", letterSpacing: -2,
        WebkitTextStroke: "6px #000000", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.45)" }}>{th.words}</div>
    </AbsoluteFill>
  );
};

/** The frame a scene cover shows: `at` (a beat id) and `sec` into it, else the first hook beat near its end. */
export function coverFrame(tl: Timeline): number {
  const th = tl.thumbnail!;
  const beat = tl.beats.find((b) => b.id === th.at) ?? tl.beats.find((b) => b.scene === "hook") ?? tl.beats[0]!;
  const into = th.sec !== undefined ? Math.round((th.sec * tl.fps) / tl.tempo) : Math.round(beat.frames * 0.8);
  return beat.from + Math.max(0, Math.min(beat.frames - 1, into));
}

/**
 * The "scene" cover (2026-10-24): the video's own picture, so no two covers look alike, with the
 * channel's look on top: huge words over a blurred, darkened band (the scene's own money objects
 * carry the figures, so no extra card that would repeat one or cover a face). A long video's
 * 1920x1080 frame is scaled to the 1280x720 thumbnail.
 */
const SceneThumb: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail!;
  const { width: w, height: h } = thumbSize(timeline);
  const v = h > w;
  const k = w / timeline.width;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: timeline.palette.bg }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: timeline.width, height: timeline.height, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <StoryVideo timeline={timeline} atFrame={coverFrame(timeline)} />
      </div>
      {/* the title band: the scene's own words and tags under it are blurred and darkened away */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: v ? h * 0.36 : h, width: v ? w : w * 0.6,
        backdropFilter: "blur(14px) brightness(0.55)", WebkitBackdropFilter: "blur(14px) brightness(0.55)",
        maskImage: v ? "linear-gradient(180deg, #000 72%, transparent 100%)" : "linear-gradient(90deg, #000 70%, transparent 100%)",
        WebkitMaskImage: v ? "linear-gradient(180deg, #000 72%, transparent 100%)" : "linear-gradient(90deg, #000 70%, transparent 100%)" }} />
      <AbsoluteFill style={{ background: v
        ? "linear-gradient(180deg, rgba(5,6,14,0.7) 0%, rgba(5,6,14,0.35) 26%, rgba(5,6,14,0) 40%)"
        : "linear-gradient(90deg, rgba(5,6,14,0.7) 0%, rgba(5,6,14,0.3) 45%, rgba(5,6,14,0) 62%)" }} />
      <div style={{ position: "absolute", left: v ? 44 : 40, right: v ? 44 : w * 0.42, top: v ? 70 : 34, textAlign: v ? "center" : "left" }}>
        <BigWords text={th.words} size={v ? 136 : 92} />
      </div>
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<StoryProps> = (props) => {
  const th = props.timeline.thumbnail;
  const { width: w, height: h } = thumbSize(props.timeline);
  if (th?.layout === "versus") return <VersusThumb th={th} w={w} h={h} />;
  if (th?.layout === "secret") return <SecretThumb th={th} w={w} h={h} />;
  if (th?.layout === "scene") return <SceneThumb {...props} />;
  return th?.layout === "story" ? <StoryThumb {...props} /> : <CardThumb {...props} />;
};

const CardThumb: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail;
  const pal = timeline.palette;
  if (!th) return null;
  const member = CAST[th.who];
  if (!member) throw new Error(`unknown cast member ${th.who}`);
  const pose = POSES[(th.pose ?? "stand") as PoseName] ?? POSES.stand;
  const { width: w, height: h } = thumbSize(timeline);
  const v = h > w;
  const stripes = (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      {Array.from({ length: v ? 12 : 9 }, (_, i) => (
        <rect key={i} x={-200 + i * 190} y={-100} width={60} height={h + 200} fill={pal.text} opacity={0.035} transform={`rotate(18 ${w / 2} ${h / 2})`} />
      ))}
      <circle cx={v ? w * 0.5 : w * 0.8} cy={v ? h * 0.74 : h * 0.5} r={v ? 470 : 330} fill={pal.accent} opacity={0.14} />
      <Character id="thumb" look={member.look} pose={pose} expression={(th.expression ?? "shock") as Expression}
        x={v ? w * 0.5 : w * 0.8} y={v ? h + 700 : h + 520} scale={v ? 2.6 : 1.75} gaze={[v ? 0 : -0.4, 0]} shadow={false}
        holdL={th.prop ? PROPS[th.prop] : undefined} />
    </svg>
  );
  const words = { fontWeight: 900, lineHeight: 1.0, color: pal.text, textShadow: "0 6px 0 rgba(0,0,0,0.35)" } as const;
  const figure = {
    fontWeight: 900, lineHeight: 1.0, color: pal.danger, letterSpacing: -4, WebkitTextStroke: `10px ${pal.text}`, paintOrder: "stroke fill",
    transform: "rotate(-3deg)", filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.35))",
  } as const;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${v ? "50% 70%" : "30% 55%"}, ${pal.danger}66, ${pal.bg} 62%)`, overflow: "hidden" }}>
      {stripes}
      {v ? (
        <div style={{ position: "absolute", left: 60, top: 150, width: w - 120, textAlign: "center", fontFamily: FONT }}>
          <div style={{ ...words, fontSize: 128 }}>{th.words}</div>
          <div style={{ ...figure, marginTop: 50, fontSize: 230, transformOrigin: "center" }}>{th.figure}</div>
          {th.sub && (
            <div style={{ marginTop: 50, display: "inline-block", padding: "16px 34px", borderRadius: 18, background: pal.accent, color: "#1b1b1b", fontWeight: 800, fontSize: 64 }}>
              {th.sub}
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: "absolute", left: 56, top: 70, width: w * 0.62, fontFamily: FONT }}>
          <div style={{ ...words, fontSize: 92 }}>{th.words}</div>
          <div style={{ ...figure, marginTop: 26, fontSize: 200, transformOrigin: "left" }}>{th.figure}</div>
          {th.sub && (
            <div style={{ marginTop: 34, display: "inline-block", padding: "12px 26px", borderRadius: 14, background: pal.accent, color: "#1b1b1b", fontWeight: 800, fontSize: 46 }}>
              {th.sub}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
