/**
 * The build scene (owner, 2026-10-26: "animation should be dynamic to the script, not hardcoded
 * props"). One world fills up with the story's own things, and every spoken phrase changes it:
 * the hen appears on "hen", becomes a flock of 312 on "flock", the loan shrinks on "pays it back".
 * The verbs are generic code; the things are this video's own props (videos/<id>/props.tsx).
 * Read renderer/templates/SHOTS.md ("The build scene") before writing one.
 *
 * params: {
 *   world?: { kind: field|street|city|bank|kitchen|office|night|desert|space|studio, tint?, horizon?: [{prop, x, size?}] },
 *   actors?: [{ who, spot: left|center|right|0..1, scale?, acting, enter?, exit? }],
 *   items: [{ id, prop, x: 0..1, y?: 0..1 (above the ground, share of height), size?: 0..1 of height,
 *             label?: words under it, tag?: "{figure}" on a tag above it, hidden?: true (enters later), state?, k? }],
 *   actions: [{ at: <event> | sec: n, do: <verb>, target: <item id>, ... }],
 *   camera?: [{ at | sec, size: wide|medium|close|extreme, on: <item id> | <who> | all | room, move? }]
 * }
 * verbs: enter, exit, multiply {n, cols?, text?}, grow {scale}, shrink {scale}, move {to: <item id> | {x, y}},
 *        swap {into: <prop>}, break, fill {k}, drain {k}, state {state}, label {text}, tag {text},
 *        count {value, text}, glow, shake, focus {size?}
 *        enter {from?: <item id>} flies in (or grows out of `from`), shake hops, flow {to: <item id>, n?, text?}
 *        sends notes from the target to `to` (studio/travel.ts; adopted for every Short 2026-11-02)
 * The camera follows the action by itself (owner, 2026-11-02: "it's a way of presentation … it lacks
 * wow factor"): each action pushes in on its thing as it fires, unless a camera key is written there.
 * Marks (2026-11-02, after The Curious Plot: every clause gets its own picture): stamp {text} slams a
 * stamp on the thing, cross / tick mark it wrong or right, strike {text?} draws a red line through it
 * and swaps its tag, arrow {to, text?} draws an arrow from it to another thing with a label, bubble
 * {text} puts a speech bubble over it (target: an item id or an actor's name), step (target: an
 * actor) brings that actor forward. An item without `x` is placed by count, left to right; multiply
 * draws up to 400 (a flock, a pile). params.locked holds the camera still (the board scene).
 * Story motion (owner, 2026-11-02, on the first board demo: "lots of things are just popping or already
 * there rather than a story"): enter {how: "rise"} grows a thing out of the ground, {how: "drop"} drops it
 * in; try {to} sends a thing toward another and it bounces back (it can't get there); and with
 * params.attention the thing just acted on stays sharp while the others step back.
 * Every figure is a placeholder string; numbers in actions (n, scale, k, value) come from @references.
 */
import React from "react";
import { spring } from "remotion";
import { CAST } from "../cast/cast";
import { Actor, type ActorSpec, at, clamp, type SceneProps, sec } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { fitLine, minText, textWidth } from "../design/fit";
import { countUp } from "../fmt/inr";
import { capGrow, fitOnStage, grownScale } from "./stage";
import { between, breathe, type Box as Rect, frameOn, type Frame, keepHeads, keepInside, type ShotSize, holds, labelTop, MOVE_SEC, shows, steady, union } from "./camera";
import { type ScreenText, ScreenTexts } from "./labels";
import { pulse, shownIn, spokenFigures } from "./figures";
import { counterBottom, counterShown } from "./hud";
import { Ball, Box, INK, PALETTE, type PropFC, type PropSet, Shadow, Shape } from "./draw";
import { Note, type Cur } from "./money";
import { VIDEOS } from "../videos/hooks";
import { autoEnters, entry, entryStart, FLOW_SEC, flowEnd, flowPiece, hopAt, squashAt, squashScale } from "./travel";
import { groundY, World } from "./worlds";
import { PLACES } from "./places";

type Spot = "left" | "center" | "right" | number;
interface Item { id: string; prop: string; x?: number; y?: number; size?: number; label?: string; tag?: string; hidden?: boolean; state?: string; k?: number }
interface Act {
  at?: string; sec?: number; do: string; target: string; n?: number; cols?: number; text?: string; scale?: number;
  to?: string | { x: number; y?: number }; from?: string; into?: string; k?: number; state?: string; value?: number; size?: ShotSize; dur?: number;
  how?: "fly" | "rise" | "drop";
}
interface CamKey { at?: string; sec?: number; size: ShotSize; on?: string; move?: boolean }
interface BuildParams {
  world?: { kind?: string; tint?: string; horizon?: { prop: string; x: number; size?: number }[]; ground?: number; bare?: boolean };
  actors?: (Omit<ActorSpec, "x"> & { spot?: Spot })[]; items?: Item[]; actions?: Act[]; camera?: CamKey[];
  /** the board scene: a still camera, figures its own panels already show, and where its stage ends */
  locked?: boolean; carried?: string[];
  /** 0..1: things floating above the ground make way for a board panel (they fade and shrink) */
  yieldTo?: number;
  /** a card: every thing makes way for a panel, not only the floating ones */
  yieldAll?: boolean;
  /** the thing just acted on stays sharp, the others step back (the board) */
  attention?: boolean;
  /** where a spoken figure no thing carries slams in (a board room: under the header, over nothing) */
  heroY?: number;
  /** where an item without `y` floats (share of the height above the ground; the board's picture zone) */
  floatY?: number;
}

/** Marks drawn over a thing (stamp, cross, tick, strike): the action's text and how long ago it fired. */
interface Mark { kind: string; text?: string; d: number }
const MAX_COPIES = 400;   // a flock or a pile (the egg Short's 702 hens read as a field of them)

// the money things every video may use beside its own props
const SHARED: PropSet = {
  note: ({ s }) => <g transform={`translate(0,${-s * 0.3})`}><Note cur="USD" nw={s * 1.6} /></g>,
  coin: ({ s, t }) => <g transform={`translate(0,${-s * 0.5})`}><Ball cx={0} cy={0} rx={s * 0.48} ry={s * 0.48 * Math.abs(Math.cos(t * 2)) + s * 0.08} fill={PALETTE.gold} s={s} /></g>,
  cash: ({ s }) => <g>{[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(0,${-s * 0.18 - i * s * 0.2})`}><Note cur="USD" nw={s * 1.3} /></g>)}</g>,
  box: ({ s, state }) => <g><Shadow w={s} s={s} /><Box x={-s * 0.5} y={-s} w={s} h={s} fill={state === "red" ? PALETTE.red : PALETTE.tan} s={s} /></g>,
  // a city reads as a skyline, never a slab (owner, 2026-11-04; studio/places.tsx)
  ...PLACES,
};

/** What an unknown prop draws: a labelled card, so a missing drawing never breaks a render. */
const Missing: (name: string) => PropFC = (name) => ({ s }) => (
  <g>
    <Shape d={`M${-s * 0.6},${-s} h${s * 1.2} v${s * 0.8} h${-s * 1.2} z`} fill={PALETTE.cream} s={s} />
    <text x={0} y={-s * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.22} fill={INK}>{name}</text>
  </g>
);

/** Actions the camera follows by itself (labels, tags and glows don't move it). */
const AUTO_CAM = new Set(["enter", "flow", "grow", "shrink", "swap", "break", "multiply", "count", "drain", "fill"]);

const back = (x: number) => { const c = clamp(x), s = 1.7; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };
/** A figure slams in: overshoots to 1.25, settles to 1 (0.35 s). */
const slam = (d: number) => d < 0 ? Math.max(0, 1 + d / 0.05) * 0.2 : d < 0.12 ? 0.2 + (d / 0.12) * 1.05 : 1 + 0.25 * Math.max(0, 1 - (d - 0.12) / 0.23);

const easeIO = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** Everything an item is at time t, from its actions so far. */
interface ItemNow { show: number; scale: number; x: number; y: number; prop: string; swapK: number; fromProp: string; copies: number; cols: number; copyK: number;
  copyText?: string; state?: string; k: number; label?: string; tag?: string; tagK: number; glow: number; shake: number; broken: number; hop: number; squash: number; flying: boolean; count?: { from: number; to: number; text: string; start: number };
  marks: Mark[]; rise: number }

export const BuildScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as BuildParams;
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const own = VIDEOS[p.tl.id]?.props ?? {};
  const props: PropSet = { ...SHARED, ...own };
  const gy = groundY(P.world?.kind, h, P.world?.ground);
  const items = P.items ?? [];
  const written0 = (P.actions ?? []).map((a) => ({ ...a, start: a.sec ?? at(p, a.at, 0) }));
  // things arrive on their words instead of waiting on screen for them (owner, 2026-11-03; travel.ts)
  const actions = [...written0, ...autoEnters(P.items ?? [], written0).map((a) => a as unknown as (typeof written0)[number])].sort((a, b) => a.start - b.start);
  const cur = (p.tl.currency ?? "USD") as Cur;
  // things arrive and money travels instead of popping in and shaking (adopted 2026-11-02)
  const travel = true;
  // an actor's body always fits the frame (QA: a spot of 0.1 cut people in half at the edge)
  const spotX = (s: Spot | undefined, d: number) => typeof s === "number" ? Math.min(v ? 0.8 : 0.89, Math.max(v ? 0.2 : 0.11, s)) * w : s === "left" ? w * 0.24 : s === "right" ? w * 0.76 : s === "center" ? w * 0.5 : d;

  // things without a place are spread across the stage in the order they are listed
  const loose = items.filter((it) => typeof it.x !== "number");
  const autoX = (it: Item) => { const i = loose.indexOf(it), n = loose.length; return n === 1 ? 0.5 : 0.18 + (0.64 * i) / (n - 1); };
  // a thing stays whole at its biggest: a grow is capped at the room it has, the rest slides it in (stage.ts)
  const spotOf = (it: Item) => (typeof it.x === "number" ? it.x : autoX(it)) * w;
  const growCap = (it: Item, to: number) => capGrow(to, spotOf(it), sizeOf(it), w);
  const home = (it: Item): [number, number] => [fitOnStage(spotOf(it), sizeOf(it) * growCap(it, grownScale(actions, it.id)) * 0.6, w),
    gy - (it.y ?? P.floatY ?? 0) * h];
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  // a wide frame has room to spare: things are drawn bigger there so the frame stays full
  // (2026-11-02: 0.16 → 0.22 in a Short; the owner: "small objects put up when you speak of them")
  const sizeOf = (it: Item) => h * (it.size ?? (v ? 0.22 : 0.22)) * (v ? 1 : 1.3);

  const now = (it: Item): ItemNow => {
    const mine = actions.filter((a) => a.target === it.id);
    const enters = mine.some((a) => a.do === "enter");
    const s: ItemNow = { show: it.hidden || enters ? 0 : 1, scale: 1, x: home(it)[0], y: home(it)[1], prop: it.prop, swapK: 1, fromProp: it.prop,
      copies: 0, cols: 0, copyK: 0, state: it.state, k: it.k ?? 0, label: it.label, tag: it.tag, tagK: it.tag ? 1 : 0, glow: 0, shake: 0, broken: 0, hop: 0, squash: 0, flying: false, marks: [], rise: 1 };
    for (const a of mine) {
      if (t < a.start) break;
      const d = t - a.start, dur = a.dur ?? 0.6, k = clamp(d / dur);
      switch (a.do) {
        case "enter": {
          if (!travel) { s.show = back(d / 0.45); break; }
          if (a.how === "rise") { s.rise = back(d / 0.6); s.show = d < 0 ? 0 : 1; s.squash = squashAt(d - 0.6); break; }
          if (a.how === "drop") { const e = clamp(d / 0.45); s.y -= (1 - e * e) * h * 0.45; s.show = d < 0 ? 0 : 1; s.squash = squashAt(d - 0.45); s.flying = e < 0.98; break; }
          const src = a.from && byId[a.from] ? byId[a.from]! : undefined;
          const start = entryStart([s.x, s.y], w, h, src ? [home(src)[0], home(src)[1] - sizeOf(src) * 0.5] : undefined);
          const e = entry(d, start, [s.x, s.y], h, !!src);
          s.x = e.x; s.y = e.y; s.show = e.show; s.squash = e.squash; s.flying = e.e < 0.98; break;
        }
        case "exit": s.show = 1 - easeIO(d / 0.4); break;
        case "try": {      // heads for the other thing, can't get there, bounces back
          const tgt: [number, number] = typeof a.to === "string" && byId[a.to] ? home(byId[a.to]!) : [s.x, s.y];
          const go = d < 0.45 ? easeIO(d / 0.45) * 0.55 : 0.55 * (1 - back((d - 0.45) / 0.5));
          s.x += (tgt[0] - s.x) * go; s.y += (tgt[1] - s.y) * go;
          s.shake = d > 0.4 && d < 0.75 ? 1 - (d - 0.4) / 0.35 : 0; break;
        }
        case "grow": case "shrink": { const from = s.scale, to = a.do === "grow" ? growCap(it, a.scale ?? 1.6) : a.scale ?? 0.55;
          s.scale = from + (to - from) * spring({ frame: d * p.fps, fps: p.fps, config: { damping: 11, stiffness: 120 } }); break; }
        case "move": { const [tx, ty] = typeof a.to === "string" ? (byId[a.to] ? home(byId[a.to]!) : [s.x, s.y]) : a.to ? [a.to.x * w, gy - (a.to.y ?? 0) * h] : [s.x, s.y];
          const e = easeIO(d / (a.dur ?? 1.1)); s.x += (tx - s.x) * e; s.y += (ty - s.y) * e - Math.sin(e * Math.PI) * h * 0.025; break; }
        // a thing that turns into another leaves its marks behind (the slip's cross must not land on the shares)
        case "swap": s.fromProp = s.prop; s.prop = a.into ?? s.prop; s.swapK = clamp(d / 0.5); s.marks = s.marks.filter(() => d < 0.25); s.tag = undefined; break;
        case "break": s.broken = clamp(d / 0.3); s.shake = d < 0.4 ? 1 - d / 0.4 : 0; s.state = "broken"; break;
        case "fill": case "drain": { const from = s.k, to = a.k ?? (a.do === "fill" ? 1 : 0); s.k = from + (to - from) * easeIO(k); break; }
        case "state": s.state = a.state; break;
        case "label": s.label = a.text; break;
        case "tag": s.tag = a.text; s.tagK = back(d / 0.4); break;
        case "count": s.count = { from: s.count?.to ?? 0, to: a.value ?? 0, text: a.text ?? "", start: a.start }; s.tagK = 1; break;
        case "multiply": s.copies = Math.max(1, Math.min(MAX_COPIES, Math.round(a.n ?? 4))); s.cols = a.cols ?? 0; s.copyK = clamp(d / (a.dur ?? 1.2)); s.copyText = a.text; break;
        case "glow": s.glow = d < 1.2 ? Math.sin((d / 1.2) * Math.PI) : 0; break;
        case "shake": if (travel) s.hop = hopAt(d); else s.shake = d < 0.5 ? 1 - d / 0.5 : 0; break;
        case "stamp": case "cross": case "tick": s.marks = [...s.marks.filter((m) => m.kind !== a.do), { kind: a.do, text: a.text, d }]; s.hop = Math.max(s.hop, hopAt(d) * 0.5); break;
        case "strike": s.marks = [...s.marks, { kind: "strike", d }]; if (a.text && d > 0.45) { s.tag = a.text; s.tagK = back((d - 0.45) / 0.4); } break;
      }
    }
    // the thing a flow lands on squashes as the notes arrive
    if (travel) for (const a of actions) {
      if (a.do !== "flow" || a.to !== it.id) continue;
      const land = a.start + (a.dur ?? FLOW_SEC);
      s.squash = Math.max(s.squash, squashAt(t - land), squashAt(t - land - 0.25) * 0.6);
    }
    return s;
  };

  // a thing making way for a board panel fades with everything on it: its marks, tags and labels too
  const yielding = (it: Item) => ((it.y ?? P.floatY ?? 0) > 0.05 || !!P.yieldAll) && (P.yieldTo ?? 0) > 0;
  const states = items.map((it) => { const s = now(it); return { it, s: yielding(it) ? { ...s, show: s.show * (1 - (P.yieldTo ?? 0)) } : s }; });
  // attention: the thing acted on most recently leads; anything left behind by the story steps back
  const lastAct = (id: string) => Math.max(-1, ...actions.filter((a) => t >= a.start && (a.target === id || a.to === id)).map((a) => a.start));
  const acted = items.map((it) => ({ id: it.id, at: lastAct(it.id) })).filter((x) => x.at >= 0);
  const focusAt = Math.max(-1, ...acted.map((x) => x.at));
  const dimOf = (id: string) => {
    if (!P.attention || acted.length < 2) return 0;
    const mine = lastAct(id);
    return mine >= focusAt - 0.3 ? 0 : easeIO((t - focusAt) / 0.35);
  };
  // every figure reacts while it is said: its thing pulses, or the figure itself pops on screen
  const said = spokenFigures(p);
  const carries = (st: { it: Item; s: ItemNow }, text: string) =>
    [st.s.tag, st.s.label, st.s.copyText, st.s.count?.text].some((x) => x === text);
  const carriedElsewhere = new Set(P.carried ?? []);   // the board's equation, bars or card already show it
  const pulseOf = (st: { it: Item; s: ItemNow }) => Math.max(0, ...said.filter((f) => carries(st, f.text)).map((f) => pulse(t, f)));

  // the camera: keys and focus actions, framing items or actors
  const actorsP = P.actors ?? [];
  // the one speaking is big; anyone else steps back so the things being explained carry the frame
  // (owner, 2026-10-30: "the animation should be the centre of impression, not the characters")
  const speaking = (who: string) => p.beat.speaker === who;
  // `step` brings an actor forward (the son whose turn it is steps out of the lineup)
  const stepK = (who: string) => Math.max(0, ...actions.filter((a) => a.do === "step" && a.target === who && t >= a.start).map((a) => easeIO((t - a.start) / 0.4)));
  const aScale = (a: { scale?: number; who?: string }) => (a.scale ?? (speaking(a.who ?? "") ? (v ? 1.25 : 1.3) : (v ? 0.85 : 0.95))) * (1 + 0.18 * stepK(a.who ?? ""));
  // an actor head to feet, and their head with room for the shot's slow push (rig: head top 502 px above the feet)
  const actorBoxes = actorsP.map((a) => {
    const x = spotX(a.spot, w / 2), k = aScale(a) * (CAST[a.who]?.look.scale ?? 1);
    return { body: [x - 130 * k, gy - 510 * k, x + 130 * k, gy] as Rect, head: [x - 110 * k, gy - 540 * k, x + 110 * k, gy - 330 * k] as Rect };
  });
  const itemBox = ({ it, s }: { it: Item; s: ItemNow }): Rect => {
    const z = sizeOf(it) * s.scale;
    return [s.x - z * 0.6, s.y - z * 1.1, s.x + z * 0.6, s.y];
  };
  const target = (on: string | undefined): [number, number] => {
    if (!on || on === "room") return [w / 2, h / 2];
    const st = states.find((x) => x.it.id === on);
    if (st) return [st.s.x, st.s.y - sizeOf(st.it) * st.s.scale * 0.55];
    const a = actorsP.find((x) => x.who === on);
    if (a) return [spotX(a.spot, w / 2), gy - 420 * aScale(a) * (CAST[a.who]?.look.scale ?? 1)];
    return [w / 2, h / 2];
  };
  // "all" holds every thing on screen and every actor head to feet; a shot on a thing keeps the head of any actor it catches
  const shoot = (size: ShotSize, on: string | undefined): Frame => {
    if (on === "all") {
      const boxes = [...states.filter((x) => x.s.show > 0.5).map(itemBox), ...actorBoxes.map((a) => a.body)];
      if (!boxes.length) return frameOn(size, w / 2, h / 2, w, h);
      const u = union(boxes);
      return keepInside(frameOn(size, (u[0] + u[2]) / 2, (u[1] + u[3]) / 2, w, h), u, w, h);
    }
    const f = frameOn(size, ...target(on), w, h);
    const st = states.find((x) => x.it.id === on);
    // a shot on a thing keeps the whole thing in the frame (2026-11-02: close shots on a big dealer cut his head off)
    return st ? keepHeads(keepInside(f, itemBox(st), w, h, 60), itemBox(st), actorBoxes, w, h) : f;
  };
  const written: (CamKey & { start: number })[] = [
    ...(P.camera ?? []).map((k) => ({ ...k, start: k.sec ?? at(p, k.at, 0) })),
    ...actions.filter((a) => a.do === "focus").map((a) => ({ size: a.size ?? "close", on: a.target, move: true, start: a.start })),
  ];
  // the camera follows the action: each change pushes in on its thing (a flow on where the money
  // lands, a multiply pulls out to hold the crowd), unless the script put a camera key near it
  const auto: (CamKey & { start: number })[] = [];
  for (const a of actions) {
    if (!AUTO_CAM.has(a.do) || !byId[a.target] || (a as { auto?: boolean }).auto) continue;
    const flowTo = a.do === "flow" && typeof a.to === "string" && byId[a.to] ? a.to : undefined;
    const start = flowTo ? a.start + (a.dur ?? FLOW_SEC) * 0.55 : a.start;
    if (written.some((k) => Math.abs(k.start - start) < 0.9)) continue;
    // a big thing gets a medium shot, a small one a close-up; every other push is one size wider
    const big = sizeOf(byId[flowTo ?? a.target]!) > h * 0.25;
    const size: ShotSize = a.do === "multiply" ? "medium" : big || auto.length % 2 ? "medium" : "close";
    auto.push({ size, on: a.do === "multiply" ? "all" : flowTo ?? a.target, move: true, start });
  }
  const keys = P.locked ? [] : [...written, ...auto].sort((a, b) => a.start - b.start);
  if (!keys.length || keys[0]!.start > 0) keys.unshift({ size: "wide", on: "room", start: 0 });
  keys.splice(0, keys.length, ...steady(keys));
  let fr: Frame = shoot(keys[0]!.size, keys[0]!.on), since = t;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]!;
    if (t < k.start) break;
    const next = shoot(k.size, k.on);
    fr = k.move ? between(fr, next, (t - k.start) / MOVE_SEC) : next;
    since = t - k.start;
  }
  if (!P.locked) fr = breathe(fr, since, w, h, p.beat.from % 7);

  const drawItem = ({ it, s: s0 }: { it: Item; s: ItemNow }, i: number) => {
    const s = s0;
    const dim = dimOf(it.id);
    if (s.show <= 0.001) return null;
    const size = sizeOf(it);
    const Prop = props[s.prop] ?? Missing(s.prop);
    const From = props[s.fromProp] ?? Missing(s.fromProp);
    const shake = s.shake ? Math.sin(t * 70) * size * 0.05 * s.shake : 0;
    const tilt = s.broken * -9;
    const beatK = pulseOf({ it, s });
    // squash on landing, stretch on the way up a hop (scaled about the thing's base)
    const [qx, qy] = squashScale(s.squash - s.hop * 0.6);
    const lift = s.hop * size * 0.22;
    const one = (dx: number, dy: number, sc: number, key: string, opacity = 1) => (
      <g key={key} transform={`translate(${s.x + dx + shake},${s.y + dy - lift}) rotate(${tilt}) scale(${s.show * s.scale * sc * (1 + 0.14 * beatK) * (1 - 0.08 * dim)}) scale(${qx},${qy * s.rise})`} opacity={opacity * (1 - 0.5 * dim)}
        style={{ filter: s.broken > 0 ? `saturate(${1 - s.broken * 0.7})` : undefined }}>
        {Math.max(s.glow, beatK) > 0 && <circle cx={0} cy={-size * 0.5} r={size * 0.75} fill={PALETTE.yellow} opacity={0.35 * Math.max(s.glow, beatK)} />}
        {s.swapK < 1 && <g transform={`scale(${1 - s.swapK})`}><From s={size} t={t} k={s.k} state={s.state} seed={`${it.id}`} /></g>}
        <g transform={`scale(${s.swapK < 1 ? s.swapK : 1})`}><Prop s={size} t={t} k={s.k} state={s.state} seed={`${it.id}${key}`} /></g>
      </g>
    );
    // copies: the thing multiplies on the spot, in rows behind it, popping in one by one
    const copies: React.ReactNode[] = [];
    if (s.copies > 1) {
      const n = Math.min(s.copies, MAX_COPIES);
      const cols = s.cols || Math.ceil(Math.sqrt(n * 1.6));
      const cs = Math.min(1, 2.6 / Math.sqrt(n));
      for (let j = 1; j < n; j++) {
        const r = Math.floor(j / cols), c = j % cols;
        const appear = clamp((s.copyK * n - j) / 2);
        if (appear <= 0) continue;
        const dx = (c - (cols - 1) / 2) * size * cs * 0.85, dy = -r * size * cs * 0.45;
        copies.push(one(dx, dy, cs * back(appear), `c${j}`, 0.95));
      }
    }
    const lead = s.copies > 1 ? Math.min(1, 2.6 / Math.sqrt(Math.min(s.copies, MAX_COPIES))) : 1;
    // a multiplied row never runs off the frame: the whole group slides in (QA: five bills at x 0.82 cut the third)
    let slide = 0;
    if (s.copies > 1) {
      const n = Math.min(s.copies, MAX_COPIES), cols = s.cols || Math.ceil(Math.sqrt(n * 1.6));
      const half = ((Math.min(cols, n) - 1) / 2) * size * lead * 0.85 + size * lead * 0.6;
      slide = Math.min(w * 0.97 - half, Math.max(w * 0.03 + half, s.x)) - s.x;
    }
    // a thing only partly on screen keeps its picture but not its lettering (it would be cut)
    return (
      <g key={it.id + i} className={holds(fr, itemBox({ it, s }), w, h) ? undefined : "decor"} transform={slide ? `translate(${slide},0)` : undefined}>
        {copies.reverse()}
        {one(s.copies > 1 ? -(Math.ceil(Math.sqrt(Math.min(s.copies, MAX_COPIES) * 1.6)) - 1) / 2 * size * lead * 0.85 : 0, 0, lead, "m")}
      </g>
    );
  };

  // marks over a thing: a stamp slams on rotated, a cross or tick lands on it, a strike draws through it
  const min = minText(w, h);
  const markNodes: React.ReactNode[] = [];
  for (const { it, s } of states) {
    if (s.show <= 0.05) continue;
    const z = sizeOf(it) * s.scale, cx = s.x, cy = s.y - z * 0.55;
    for (const [mi, m] of s.marks.entries()) {
      const key = `${it.id}-${m.kind}-${mi}`;
      if (m.kind === "stamp" && m.text) {
        const k = m.d < 0.18 ? 1.7 - (m.d / 0.18) * 0.7 : 1, o = clamp(m.d / 0.08);
        const fs = Math.max(min, Math.min(z * 0.26, fitLine(m.text.toUpperCase(), z * 0.26, Math.max(z * 1.3, w * 0.4), { upper: true })));
        const bw = textWidth(m.text.toUpperCase(), fs, true) + fs * 1.1;
        // a stamp stays whole on the frame (smoke test: "PAID TWICE" ran off the right edge), clear of a Short's buttons
        const sx = Math.min(w * (v ? 0.86 : 0.96) - bw * 0.52, Math.max(w * 0.04 + bw * 0.52, cx));
        markNodes.push(<g key={key} transform={`translate(${sx},${cy}) rotate(-12) scale(${k})`} opacity={o}>
          <rect x={-bw / 2} y={-fs * 0.85} width={bw} height={fs * 1.6} rx={fs * 0.2} fill="rgba(255,255,255,0.86)" stroke="#e5484d" strokeWidth={Math.max(6, fs * 0.13)} />
          <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill="#e5484d" style={{ textTransform: "uppercase" }}>{m.text}</text>
        </g>);
      } else if (m.kind === "cross") {
        // the size of the thing it marks, not bigger (owner, 2026-11-02: "the cross was too big")
        const k = easeIO(m.d / 0.3), r = z * 0.3;
        markNodes.push(<g key={key} stroke="#e5484d" strokeWidth={Math.max(10, z * 0.055)} strokeLinecap="round" opacity={0.95}>
          <line x1={cx - r} y1={cy - r} x2={cx - r + 2 * r * k} y2={cy - r + 2 * r * k} />
          {m.d > 0.15 && <line x1={cx + r} y1={cy - r} x2={cx + r - 2 * r * easeIO((m.d - 0.15) / 0.3)} y2={cy - r + 2 * r * easeIO((m.d - 0.15) / 0.3)} />}
        </g>);
      } else if (m.kind === "tick") {
        const k = back(m.d / 0.35), r = Math.max(36, z * 0.2);
        markNodes.push(<g key={key} transform={`translate(${cx + z * 0.45},${cy - z * 0.35}) scale(${k})`}>
          <circle r={r} fill={PALETTE.green} stroke={INK} strokeWidth={6} />
          <path d={`M${-r * 0.45},0 L${-r * 0.1},${r * 0.35} L${r * 0.5},${-r * 0.35}`} fill="none" stroke="#fff" strokeWidth={r * 0.22} strokeLinecap="round" strokeLinejoin="round" />
        </g>);
      } else if (m.kind === "strike") {
        const k = easeIO(m.d / 0.35);
        markNodes.push(<line key={key} x1={cx - z * 0.7} y1={cy + z * 0.1} x2={cx - z * 0.7 + z * 1.4 * k} y2={cy - z * 0.1} stroke="#e5484d" strokeWidth={Math.max(12, z * 0.07)} strokeLinecap="round" />);
      }
    }
  }
  // arrows: drawn from one thing to another as the word fires, with a label chip in the middle
  const arrowNodes: React.ReactNode[] = [];
  const arrowTexts: { text: string; x: number; y: number; k: number; key: string }[] = [];
  for (const [ai, a] of actions.entries()) {
    if (a.do !== "arrow" || t < a.start || typeof a.to !== "string") continue;
    const from = states.find((x) => x.it.id === a.target), to = states.find((x) => x.it.id === a.to);
    if (!from || !to || from.s.show < 0.5) continue;
    const zf = sizeOf(from.it) * from.s.scale, zt = sizeOf(to.it) * to.s.scale;
    const dir = Math.sign(to.s.x - from.s.x) || 1;
    const x0 = from.s.x + dir * zf * 0.62, y0 = from.s.y - zf * 0.55, x1 = to.s.x - dir * zt * 0.62, y1 = to.s.y - zt * 0.55;
    const k = easeIO((t - a.start) / 0.45), mx = (x0 + x1) / 2, my = Math.min(y0, y1) - h * 0.05;
    const bx = (u: number) => (1 - u) ** 2 * x0 + 2 * (1 - u) * u * mx + u * u * x1, by = (u: number) => (1 - u) ** 2 * y0 + 2 * (1 - u) * u * my + u * u * y1;
    const pts = Array.from({ length: 24 }, (_, i) => { const u = (i / 23) * k; return `${bx(u)},${by(u)}`; }).join(" ");
    const ex = bx(k), ey = by(k), ang = Math.atan2(ey - by(Math.max(0, k - 0.05)), ex - bx(Math.max(0, k - 0.05)));
    const head = Math.max(26, h * 0.016);
    arrowNodes.push(<g key={`ar${ai}`} fill="none" stroke={INK} strokeWidth={Math.max(10, h * 0.006)} strokeLinecap="round" strokeLinejoin="round">
      <polyline points={pts} />
      {k > 0.2 && <path d={`M${ex - head * Math.cos(ang - 0.5)},${ey - head * Math.sin(ang - 0.5)} L${ex},${ey} L${ex - head * Math.cos(ang + 0.5)},${ey - head * Math.sin(ang + 0.5)}`} />}
    </g>);
    if (a.text) arrowTexts.push({ key: `art${ai}`, text: a.text, x: bx(0.5), y: by(0.5) - 10, k: back((t - a.start - 0.2) / 0.35) });
  }
  // speech bubbles over a thing or an actor: what they say, in a few words
  const bubbleNodes: React.ReactNode[] = [];
  for (const [bi, a] of actions.entries()) {
    if (a.do !== "bubble" || t < a.start || !a.text) continue;
    const st = states.find((x) => x.it.id === a.target), actor = actorsP.find((x) => x.who === a.target);
    let bx: number, by: number;
    if (st) { bx = st.s.x; by = st.s.y - sizeOf(st.it) * st.s.scale * 1.15; }
    else if (actor) { const k2 = aScale(actor) * (CAST[actor.who]?.look.scale ?? 1); bx = spotX(actor.spot, w / 2); by = gy - 560 * k2; }
    else continue;
    const k = back((t - a.start) / 0.35);
    const maxW = w * (v ? 0.62 : 0.34);
    const words = a.text.split(/\s+/), lines: string[] = [];
    for (const word of words) { const last = lines[lines.length - 1]; if (last && textWidth(`${last} ${word}`, min) < maxW - min) lines[lines.length - 1] = `${last} ${word}`; else lines.push(word); }
    const fs = Math.max(min, Math.min(...lines.map((l) => fitLine(l, min * 1.15, maxW - min))));
    const bw = Math.max(...lines.map((l) => textWidth(l, fs))) + fs * 1.4, bh = lines.length * fs * 1.2 + fs * 0.8;
    const cx = Math.min(w * 0.95 - bw / 2, Math.max(w * 0.05 + bw / 2, bx)), top = Math.max(h * 0.06, by - bh - 30);
    bubbleNodes.push(<g key={`bb${bi}`} transform={`translate(${cx},${top + bh / 2}) scale(${k}) translate(${-cx},${-(top + bh / 2)})`}>
      <path d={`M${bx - 24},${top + bh - 2} L${bx},${top + bh + 30} L${bx + 22},${top + bh - 2} Z`} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={cx - bw / 2} y={top} width={bw} height={bh} rx={fs * 0.5} fill="#fff" stroke={INK} strokeWidth={6} />
      <rect x={bx - 20} y={top + bh - 8} width={40} height={12} fill="#fff" />
      {lines.map((l, li) => <text key={li} x={cx} y={top + fs * 0.4 + (li + 1) * fs * 1.2 - fs * 0.25} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs} fill={INK}>{l}</text>)}
    </g>);
  }

  // tags and labels: in screen space, after the camera (labels.tsx), only for things on screen
  const scr = (x: number, y: number): [number, number] => [x * fr.s + fr.tx, y * fr.s + fr.ty];
  const texts: ScreenText[] = [];

  // flows: notes travel on an arc from one thing to another, the figure riding on the lead note
  const flowNodes: React.ReactNode[] = [];
  const riding = new Set<string>();
  if (travel) for (const [fi, a] of actions.entries()) {
    if (a.do !== "flow" || t < a.start) continue;
    const from = states.find((x) => x.it.id === a.target), to = states.find((x) => x.it.id === a.to);
    if (!from || !to) continue;
    const n = Math.max(1, Math.min(12, Math.round(a.n ?? 5))), dur = a.dur ?? FLOW_SEC, d = t - a.start;
    if (d > flowEnd(n, dur)) continue;
    const top = (st: typeof from): [number, number] => [st.s.x, st.s.y - sizeOf(st.it) * st.s.scale * 0.6];
    const src = top(from), dst = top(to), nw = h * (v ? 0.075 : 0.1);
    for (let j = n - 1; j >= 0; j--) {
      const pc = flowPiece(d, j, n, src, dst, h, dur);
      if (!pc) continue;
      // a short trail behind each note so the eye reads the path
      for (const lag of [0.08, 0.04]) {
        const g = flowPiece(d - lag, j, n, src, dst, h, dur);
        if (g) flowNodes.push(<Note key={`f${fi}-${j}-${lag}`} cur={cur} nw={nw * 0.9} x={g.x} y={g.y} rot={g.rot} opacity={0.22} />);
      }
      flowNodes.push(<Note key={`f${fi}-${j}`} cur={cur} nw={nw} x={pc.x} y={pc.y} rot={pc.rot * 0.15} />);
      // the figure rides the lead note until it nears the landing; a figure an end already shows needs no rider
      if (j === 0 && a.text && pc.k < 0.7 && ![from, to].some((st) => st.s.show > 0.5 && carries(st, a.text!))) {
        const [rx, ry] = scr(pc.x, pc.y - nw * 0.45);
        texts.push({ key: `flow${fi}`, kind: "tag", text: a.text, x: rx, y: ry, k: 1, fill: "#ffd84a" });
        riding.add(a.text);
      }
    }
  }
  // a figure no visible thing carries pops on screen by itself while it is said
  for (const [i, f] of said.entries()) {
    const k = pulse(t, f);
    if (k <= 0 || riding.has(f.text) || shownIn(f.text, carriedElsewhere) || states.some((st) => st.s.show > 0.5 && carries(st, f.text))) continue;
    texts.push({ key: `said${i}`, kind: "hero", text: f.text, x: w * 0.5, y: h * (P.heroY ?? (v ? 0.34 : 0.3)), k: slam(t - f.s) * Math.min(1, k * 1.6), fill: "#ffd84a" });
  }
  for (const a of arrowTexts) {
    const [ax, ay] = scr(a.x, a.y);
    texts.push({ key: a.key, kind: "tag", text: a.text, x: ax, y: ay, k: a.k });
  }
  const bodies = actorBoxes.map(({ body: [x0, y0, x1, y1] }): Rect => [...scr(x0, y0), ...scr(x1, y1)]);
  for (const st of states) {
    const { it, s } = st;
    if (s.show <= 0.05 || s.flying || !shows(fr, itemBox(st), w, h, 60)) continue;
    const size = sizeOf(it);
    const tagY = s.y - size * s.scale * s.show * (s.copies > 1 ? 1.25 : 1.12);
    const countText = s.count ? (t >= s.count.start + 0.9 ? s.count.text : countUp(s.count.to, easeIO((t - s.count.start) / 0.9), s.count.text, "inr", p.tl.currency)) : undefined;
    const tagText = countText ?? s.copyText ?? s.tag;
    const [tx, ty] = scr(s.x, tagY - 6);
    if (tagText && s.tagK > 0) texts.push({ key: `t${it.id}`, kind: "tag", text: tagText, x: tx, y: ty, k: Math.min(s.tagK, 1.2) * s.show * (1 + 0.15 * pulseOf(st)) });
    if (s.label) {
      const [lx, ly] = scr(s.x, s.y + 14);
      const above = tagText ? ty - (v ? 96 : 74) : ty;
      // a label never sits on a face or a body: over an actor it goes above the thing instead
      const lfs = fitLine(s.label, v ? 50 : 36, w, { min: minText(w, h) });
      const top = labelTop(ly, above, lx, textWidth(s.label, lfs) + 24, lfs * 1.15, bodies);
      texts.push({ key: `l${it.id}`, kind: "label", text: s.label, x: lx, y: top, above, k: s.show });
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${fr.tx * 0.85}px, ${fr.ty * 0.85}px) scale(${1 + (fr.s - 1) * 0.85})`, transformOrigin: "0 0" }}>
        <World kind={P.world?.kind} tint={P.world?.tint} w={w} h={h} t={t} seed={`${p.tl.id}-${P.world?.kind ?? "studio"}`} horizon={P.world?.horizon} props={props} ground={P.world?.ground} bare={P.world?.bare} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${fr.tx}px, ${fr.ty}px) scale(${fr.s})`, transformOrigin: "0 0" }}>
        <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
          {[...states].sort((a, b) => a.s.y - b.s.y).map(drawItem)}
          {flowNodes}
          {actorsP.map((a, i) => <Actor key={a.who + i} p={p} spec={{ ...a, x: spotX(a.spot, w / 2) / w, scale: aScale(a) }} ground={gy} index={i} />)}
          {arrowNodes}
          {markNodes}
          {bubbleNodes}
        </svg>
      </div>
      <ScreenTexts items={texts} w={w} h={h} scene="build" top={counterShown(p.tl, p.beat) ? counterBottom(w, h) : undefined} />
    </div>
  );
};

/** What a custom beat file needs most: the video's props and the build helpers (re-exported for videos/<id>/*.tsx). */
export { SHARED as SHARED_PROPS };
export type { Cur };
