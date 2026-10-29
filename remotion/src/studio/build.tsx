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
 * Every figure is a placeholder string; numbers in actions (n, scale, k, value) come from @references.
 */
import React from "react";
import { spring } from "remotion";
import { CAST } from "../cast/cast";
import { Actor, type ActorSpec, at, clamp, type SceneProps, sec } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { countUp } from "../fmt/inr";
import { between, breathe, type Box as Rect, frameOn, type Frame, keepHeads, keepInside, type ShotSize, union } from "./camera";
import { Ball, Box, INK, PALETTE, type PropFC, type PropSet, Shadow, Shape } from "./draw";
import { Note, type Cur } from "./money";
import { VIDEOS } from "../videos/hooks";
import { groundY, World } from "./worlds";

type Spot = "left" | "center" | "right" | number;
interface Item { id: string; prop: string; x: number; y?: number; size?: number; label?: string; tag?: string; hidden?: boolean; state?: string; k?: number }
interface Act {
  at?: string; sec?: number; do: string; target: string; n?: number; cols?: number; text?: string; scale?: number;
  to?: string | { x: number; y?: number }; into?: string; k?: number; state?: string; value?: number; size?: ShotSize; dur?: number;
}
interface CamKey { at?: string; sec?: number; size: ShotSize; on?: string; move?: boolean }
interface BuildParams {
  world?: { kind?: string; tint?: string; horizon?: { prop: string; x: number; size?: number }[] };
  actors?: (Omit<ActorSpec, "x"> & { spot?: Spot })[]; items?: Item[]; actions?: Act[]; camera?: CamKey[];
}

// the money things every video may use beside its own props
const SHARED: PropSet = {
  note: ({ s }) => <g transform={`translate(0,${-s * 0.3})`}><Note cur="USD" nw={s * 1.6} /></g>,
  coin: ({ s, t }) => <g transform={`translate(0,${-s * 0.5})`}><Ball cx={0} cy={0} rx={s * 0.48} ry={s * 0.48 * Math.abs(Math.cos(t * 2)) + s * 0.08} fill={PALETTE.gold} s={s} /></g>,
  cash: ({ s }) => <g>{[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(0,${-s * 0.18 - i * s * 0.2})`}><Note cur="USD" nw={s * 1.3} /></g>)}</g>,
  box: ({ s, state }) => <g><Shadow w={s} s={s} /><Box x={-s * 0.5} y={-s} w={s} h={s} fill={state === "red" ? PALETTE.red : PALETTE.tan} s={s} /></g>,
};

/** What an unknown prop draws: a labelled card, so a missing drawing never breaks a render. */
const Missing: (name: string) => PropFC = (name) => ({ s }) => (
  <g>
    <Shape d={`M${-s * 0.6},${-s} h${s * 1.2} v${s * 0.8} h${-s * 1.2} z`} fill={PALETTE.cream} s={s} />
    <text x={0} y={-s * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.22} fill={INK}>{name}</text>
  </g>
);

const back = (x: number) => { const c = clamp(x), s = 1.7; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };
const easeIO = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** Everything an item is at time t, from its actions so far. */
interface ItemNow { show: number; scale: number; x: number; y: number; prop: string; swapK: number; fromProp: string; copies: number; cols: number; copyK: number;
  copyText?: string; state?: string; k: number; label?: string; tag?: string; tagK: number; glow: number; shake: number; broken: number; count?: { from: number; to: number; text: string; start: number } }

export const BuildScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as BuildParams;
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const own = VIDEOS[p.tl.id]?.props ?? {};
  const props: PropSet = { ...SHARED, ...own };
  const gy = groundY(P.world?.kind, h);
  const items = P.items ?? [];
  const actions = (P.actions ?? []).map((a) => ({ ...a, start: a.sec ?? at(p, a.at, 0) })).sort((a, b) => a.start - b.start);
  const cur = (p.tl.currency ?? "USD") as Cur;
  const spotX = (s: Spot | undefined, d: number) => typeof s === "number" ? s * w : s === "left" ? w * 0.24 : s === "right" ? w * 0.76 : s === "center" ? w * 0.5 : d;

  const home = (it: Item): [number, number] => [it.x * w, gy - (it.y ?? 0) * h];
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  // a wide frame has room to spare: things are drawn bigger there so the frame stays full
  const sizeOf = (it: Item) => h * (it.size ?? (v ? 0.16 : 0.22)) * (v ? 1 : 1.3);

  const now = (it: Item): ItemNow => {
    const mine = actions.filter((a) => a.target === it.id);
    const enters = mine.some((a) => a.do === "enter");
    const s: ItemNow = { show: it.hidden || enters ? 0 : 1, scale: 1, x: home(it)[0], y: home(it)[1], prop: it.prop, swapK: 1, fromProp: it.prop,
      copies: 0, cols: 0, copyK: 0, state: it.state, k: it.k ?? 0, label: it.label, tag: it.tag, tagK: it.tag ? 1 : 0, glow: 0, shake: 0, broken: 0 };
    for (const a of mine) {
      if (t < a.start) break;
      const d = t - a.start, dur = a.dur ?? 0.6, k = clamp(d / dur);
      switch (a.do) {
        case "enter": s.show = back(d / 0.45); break;
        case "exit": s.show = 1 - easeIO(d / 0.4); break;
        case "grow": case "shrink": { const from = s.scale, to = a.scale ?? (a.do === "grow" ? 1.6 : 0.55);
          s.scale = from + (to - from) * spring({ frame: d * p.fps, fps: p.fps, config: { damping: 11, stiffness: 120 } }); break; }
        case "move": { const [tx, ty] = typeof a.to === "string" ? (byId[a.to] ? home(byId[a.to]!) : [s.x, s.y]) : a.to ? [a.to.x * w, gy - (a.to.y ?? 0) * h] : [s.x, s.y];
          const e = easeIO(d / (a.dur ?? 0.8)); s.x += (tx - s.x) * e; s.y += (ty - s.y) * e - Math.sin(e * Math.PI) * h * 0.08; break; }
        case "swap": s.fromProp = s.prop; s.prop = a.into ?? s.prop; s.swapK = clamp(d / 0.5); break;
        case "break": s.broken = clamp(d / 0.3); s.shake = d < 0.4 ? 1 - d / 0.4 : 0; s.state = "broken"; break;
        case "fill": case "drain": { const from = s.k, to = a.k ?? (a.do === "fill" ? 1 : 0); s.k = from + (to - from) * easeIO(k); break; }
        case "state": s.state = a.state; break;
        case "label": s.label = a.text; break;
        case "tag": s.tag = a.text; s.tagK = back(d / 0.4); break;
        case "count": s.count = { from: s.count?.to ?? 0, to: a.value ?? 0, text: a.text ?? "", start: a.start }; s.tagK = 1; break;
        case "multiply": s.copies = Math.max(1, Math.round(a.n ?? 4)); s.cols = a.cols ?? 0; s.copyK = clamp(d / (a.dur ?? 1.2)); s.copyText = a.text; break;
        case "glow": s.glow = d < 1.2 ? Math.sin((d / 1.2) * Math.PI) : 0; break;
        case "shake": s.shake = d < 0.5 ? 1 - d / 0.5 : 0; break;
      }
    }
    return s;
  };

  const states = items.map((it) => ({ it, s: now(it) }));

  // the camera: keys and focus actions, framing items or actors
  const actorsP = P.actors ?? [];
  const aScale = (a: { scale?: number }) => a.scale ?? (v ? 1.5 : 1.55);
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
    return st ? keepHeads(f, itemBox(st), actorBoxes, w, h) : f;
  };
  const keys: (CamKey & { start: number })[] = [
    ...(P.camera ?? []).map((k) => ({ ...k, start: k.sec ?? at(p, k.at, 0) })),
    ...actions.filter((a) => a.do === "focus").map((a) => ({ size: a.size ?? "close", on: a.target, move: true, start: a.start })),
  ].sort((a, b) => a.start - b.start);
  if (!keys.length || keys[0]!.start > 0) keys.unshift({ size: "wide", on: "room", start: 0 });
  let fr: Frame = shoot(keys[0]!.size, keys[0]!.on), since = t;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]!;
    if (t < k.start) break;
    const next = shoot(k.size, k.on);
    fr = k.move ? between(fr, next, (t - k.start) / 0.6) : next;
    since = t - k.start;
  }
  fr = breathe(fr, since, w, h, p.beat.from % 7);

  const drawItem = ({ it, s }: { it: Item; s: ItemNow }, i: number) => {
    if (s.show <= 0.001) return null;
    const size = sizeOf(it);
    const Prop = props[s.prop] ?? Missing(s.prop);
    const From = props[s.fromProp] ?? Missing(s.fromProp);
    const shake = s.shake ? Math.sin(t * 70) * size * 0.05 * s.shake : 0;
    const tilt = s.broken * -9;
    const one = (dx: number, dy: number, sc: number, key: string, opacity = 1) => (
      <g key={key} transform={`translate(${s.x + dx + shake},${s.y + dy}) rotate(${tilt}) scale(${s.show * s.scale * sc})`} opacity={opacity}
        style={{ filter: s.broken > 0 ? `saturate(${1 - s.broken * 0.7})` : undefined }}>
        {s.glow > 0 && <circle cx={0} cy={-size * 0.5} r={size * 0.75} fill={PALETTE.yellow} opacity={0.35 * s.glow} />}
        {s.swapK < 1 && <g transform={`scale(${1 - s.swapK})`}><From s={size} t={t} k={s.k} state={s.state} seed={`${it.id}`} /></g>}
        <g transform={`scale(${s.swapK < 1 ? s.swapK : 1})`}><Prop s={size} t={t} k={s.k} state={s.state} seed={`${it.id}${key}`} /></g>
      </g>
    );
    // copies: the thing multiplies on the spot, in rows behind it, popping in one by one
    const copies: React.ReactNode[] = [];
    if (s.copies > 1) {
      const n = Math.min(s.copies, 60);
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
    const lead = s.copies > 1 ? Math.min(1, 2.6 / Math.sqrt(Math.min(s.copies, 60))) : 1;
    const tagY = s.y - size * s.scale * s.show * (s.copies > 1 ? 1.25 : 1.12);
    const countText = s.count ? (t >= s.count.start + 0.9 ? s.count.text : countUp(s.count.to, easeIO((t - s.count.start) / 0.9), s.count.text, "inr", p.tl.currency)) : undefined;
    const tagText = countText ?? s.copyText ?? s.tag;
    return (
      <g key={it.id + i}>
        {copies.reverse()}
        {one(s.copies > 1 ? -(Math.ceil(Math.sqrt(Math.min(s.copies, 60) * 1.6)) - 1) / 2 * size * lead * 0.85 : 0, 0, lead, "m")}
        {tagText && s.tagK > 0 && (
          <g transform={`translate(${s.x},${tagY}) scale(${clamp(s.tagK, 0, 1.2) * s.show})`}>
            <rect x={-(tagText.length * (v ? 30 : 22) + 40) / 2} y={v ? -84 : -64} width={tagText.length * (v ? 30 : 22) + 40} height={v ? 84 : 64} rx={18}
              fill="#fff" stroke={INK} strokeWidth={5} />
            <text x={0} y={v ? -24 : -18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={v ? 56 : 44} fill={INK}>{tagText}</text>
          </g>
        )}
        {s.label && (
          <text x={s.x} y={s.y + (v ? 62 : 48)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={v ? 46 : 34} fill="#fff"
            stroke={INK} strokeWidth={v ? 9 : 7} paintOrder="stroke">{s.label}</text>
        )}
      </g>
    );
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${fr.tx * 0.85}px, ${fr.ty * 0.85}px) scale(${1 + (fr.s - 1) * 0.85})`, transformOrigin: "0 0" }}>
        <World kind={P.world?.kind} tint={P.world?.tint} w={w} h={h} t={t} seed={`${p.tl.id}-${P.world?.kind ?? "studio"}`} horizon={P.world?.horizon} props={props} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${fr.tx}px, ${fr.ty}px) scale(${fr.s})`, transformOrigin: "0 0" }}>
        <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
          {[...states].sort((a, b) => a.s.y - b.s.y).map(drawItem)}
          {actorsP.map((a, i) => <Actor key={a.who + i} p={p} spec={{ ...a, x: spotX(a.spot, w / 2) / w, scale: aScale(a) }} ground={gy} index={i} />)}
        </svg>
      </div>
    </div>
  );
};

/** What a custom beat file needs most: the video's props and the build helpers (re-exported for videos/<id>/*.tsx). */
export { SHARED as SHARED_PROPS };
export type { Cur };
