/**
 * The shot: a beat composed freely from the studio kit instead of picked from a fixed layout
 * (owner, 2026-10-21: "every video works like a template"). A shot is a lit, layered set, the cast
 * on its spots, money objects, a camera that frames whoever matters at the size the moment needs,
 * and at most one key word stamped into the frame. Read .claude/skills/motion-direction first.
 *
 * params: {
 *   set: "flat" | "penthouse" | "vault",
 *   actors: [{ who, spot: "left"|"center"|"right"|0..1, scale?, acting, enter?, exit?, turn? }],
 *   objects: [
 *     { kind: "stack", id?, spot, amount: "@x.final", text?: "{x_final}", label?, at?, tone?: good|bad },
 *     { kind: "flow", from: <object id> | <who> | spot, to: same, at, dur?, n? },
 *     { kind: "phone", id?, spot?, height?: 0..1, title, figure?, at?, lines?: [{label, value?, at}], toasts?: [{text, at}] }
 *   ],
 *   camera: [{ at?: event | sec?: number, size: wide|medium|close|extreme, on: <who> | <object id> | "all" | "room", move?: true }],
 *   (ids are words: script text may not contain digits)
 *   word?: { text, at, color?: gold|good|bad|white, where?: top|left|right (keep it off the money tags) }
 * }
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { CAST } from "../cast/cast";
import { Actor, type ActorSpec, at, clamp, type SceneProps, sec } from "../scenes/kit";
import { FONT } from "../design/fonts";
import { between, breathe, frameOn, type Frame, type ShotSize } from "./camera";
import { CashStack, type Cur, MoneyFlow, PhoneApp } from "./money";
import { SETS } from "./sets";

type Spot = "left" | "center" | "right" | number;
interface ShotActor extends Omit<ActorSpec, "x"> { spot?: Spot }
interface StackObj { kind: "stack"; id?: string; spot?: Spot; amount?: number; text?: string; label?: string; at?: string; tone?: "good" | "bad" }
interface FlowObj { kind: "flow"; from: string; to: string; at?: string; dur?: number; n?: number }
interface PhoneObj { kind: "phone"; id?: string; spot?: Spot; height?: number; title?: string; figure?: string; at?: string; lines?: { label: string; value?: string; at?: string }[]; toasts?: { text: string; at?: string }[] }
type Obj = StackObj | FlowObj | PhoneObj;
const WORD_COLORS: Record<string, string> = { gold: "#ffd84a", good: "#7cf0b2", bad: "#ff6b6b", white: "#ffffff" };
interface CamKey { at?: string; sec?: number; size: ShotSize; on?: string; move?: boolean }
interface ShotParams { set?: string; actors?: ShotActor[]; objects?: Obj[]; camera?: CamKey[]; word?: { text: string; at?: string; color?: string; where?: "top" | "left" | "right" } }

export const ShotScene: React.FC<SceneProps> = (p) => {
  const P = p.beat.params as ShotParams;
  const { width: w, height: h } = p.tl;
  const v = h > w;
  const t = sec(p);
  const set = SETS[P.set ?? "flat"] ?? SETS.flat!;
  const S = set.spots(w, h);
  const spotX = (s: Spot | undefined, d: number) => typeof s === "number" ? s * w : s ? S[s] : d;
  const cur = (p.tl.currency ?? "INR") as Cur;
  const actors = P.actors ?? [];
  const objects = P.objects ?? [];
  const aScale = (a: ShotActor) => a.scale ?? (v ? 1.55 : 1.15);

  // where things are, so the camera can frame them and money can fly between them
  const stacks = objects.filter((o): o is StackObj => o.kind === "stack");
  const maxAmount = Math.max(1, ...stacks.map((s) => s.amount ?? 1));
  const stackFull = h * (v ? 0.42 : 0.5);
  const stackTop = (o: StackObj) => S.ground - stackFull * ((o.amount ?? 1) / maxAmount);
  const head = (who: string) => {
    const a = actors.find((x) => x.who === who);
    if (!a) return null;
    const look = CAST[who]?.look.scale ?? 1;
    return [spotX(a.spot, S.center), S.ground - 440 * aScale(a) * look] as [number, number];
  };
  const phones = objects.filter((o): o is PhoneObj => o.kind === "phone");
  const phoneAt = (o: PhoneObj): [number, number] => [spotX(o.spot, S.center), h * (o.height ?? 0.42)];
  const byId = (id: string) => objects.find((o) => (o.kind === "stack" || o.kind === "phone") && o.id === id) as StackObj | PhoneObj | undefined;
  const objAt = (o: StackObj | PhoneObj): [number, number] => o.kind === "stack" ? [spotX(o.spot, S.center), stackTop(o)] : phoneAt(o);
  const place = (name: string): [number, number] => {
    const o = byId(name);
    if (o) return objAt(o);
    const hd = head(name);
    if (hd) return [hd[0] + 60, hd[1] + 160];
    return [spotX(name as Spot, S.center), S.ground - h * 0.25];
  };
  const target = (on: string | undefined): [number, number] => {
    if (!on || on === "room") return [w / 2, h / 2];
    if (on === "all") {   // everyone and everything in the shot, centred
      const pts = [...actors.map((a) => head(a.who)!), ...objects.filter((x): x is StackObj | PhoneObj => x.kind !== "flow").map(objAt)];
      if (!pts.length) return [w / 2, h / 2];
      return [pts.reduce((a, b) => a + b[0], 0) / pts.length, pts.reduce((a, b) => a + b[1], 0) / pts.length + h * 0.06];
    }
    const o = byId(on);
    if (o) { const [x, y] = objAt(o); return o.kind === "stack" ? [x, y + 80] : [x, y]; }
    return head(on) ?? [w / 2, h / 2];
  };

  // the camera: keyframes cut (or move) on words
  const keys = (P.camera?.length ? P.camera : [{ size: "medium" as ShotSize, on: actors[0]?.who }]).map((k) => ({
    ...k, start: k.sec ?? at(p, k.at, 0),
  }));
  let fr: Frame = frameOn(keys[0]!.size, ...target(keys[0]!.on), w, h);
  let since = t - keys[0]!.start;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]!;
    if (t < k.start) break;
    const next = frameOn(k.size, ...target(k.on), w, h);
    fr = k.move ? between(fr, next, (t - k.start) / 0.6) : next;
    since = t - k.start;
  }
  fr = breathe(fr, since, w, h, p.beat.from % 7);
  const layer = (depth: number) => {      // parallax: the back moves less, the front more
    const s = 1 + (fr.s - 1) * depth;
    return { transform: `translate(${fr.tx * depth}px, ${fr.ty * depth}px) scale(${s})`, transformOrigin: "0 0" };
  };
  const dof = clamp((fr.s - 1.6) / 1.4) * 7;   // depth of field on close shots

  const Back = set.back, Front = set.front;
  const word = P.word;
  const wordStart = word ? at(p, word.at, 0.3) : 0;
  const wk = word && t >= wordStart ? spring({ frame: (t - wordStart) * p.fps, fps: p.fps, config: { damping: 9, stiffness: 180, mass: 0.8 } }) : 0;
  const shake = word && t >= wordStart && t < wordStart + 0.25 ? Math.sin((t - wordStart) * 90) * 10 * (1 - (t - wordStart) / 0.25) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <AbsoluteFill style={{ ...layer(0.82), filter: dof > 0.3 ? `blur(${dof}px)` : undefined }}>
        <Back w={w} h={h} t={t} seed={`${p.beat.id}-${P.set}`} />
      </AbsoluteFill>
      <AbsoluteFill style={layer(1)}>
        <svg width={w} height={h} style={{ position: "absolute" }}>
          {stacks.map((o, i) => {
            const start = at(p, o.at, 0.2);
            const k = clamp((t - start) / 1.1);
            return <CashStack key={`s${i}`} x={spotX(o.spot, S.center)} ground={S.ground} width={v ? 230 : 180} full={stackFull * ((o.amount ?? 1) / maxAmount)}
              k={k} cur={cur} label={o.label} text={o.text} textShown={k >= 1} tone={o.tone} seed={`${p.beat.id}s${i}`} />;
          })}
          {actors.map((a, i) => <Actor key={a.who + i} p={p} spec={{ ...a, x: spotX(a.spot, S.center) / w, scale: aScale(a) }} ground={S.ground} index={i} />)}
          {phones.map((o, i) => {
            const [x, y] = phoneAt(o);
            const start = at(p, o.at, 0);
            const k = clamp((t - start) / 0.45);
            return (
              <g key={`p${i}`} transform={`translate(0,${(1 - k) * h * 0.5})`} opacity={k}>
                <PhoneApp x={x} y={y} pw={v ? 380 : 280} t={t} title={o.title ?? ""} figure={o.figure} figureShown={t >= start + 0.4}
                  lines={(o.lines ?? []).map((l, j) => ({ ...l, at: at(p, l.at, start + 0.6 + j * 0.5) }))}
                  toasts={(o.toasts ?? []).map((n, j) => ({ ...n, at: at(p, n.at, start + 0.3 + j * 0.7) }))} />
              </g>
            );
          })}
          {objects.map((o, i) => o.kind === "flow"
            ? <MoneyFlow key={`f${i}`} from={place(o.from)} to={place(o.to)} t={t} start={at(p, o.at, 0.3)} dur={o.dur ?? 1.6} n={o.n ?? 10} cur={cur} nw={v ? 130 : 100} seed={`${p.beat.id}f${i}`} />
            : null)}
        </svg>
        <AbsoluteFill style={{ background: set.light, mixBlendMode: "screen", pointerEvents: "none" }} />
      </AbsoluteFill>
      {Front && (
        <AbsoluteFill style={{ ...layer(1.22), filter: dof > 0.3 ? `blur(${dof * 1.6}px)` : undefined }}>
          <Front w={w} h={h} t={t} seed={`${p.beat.id}-${P.set}f`} />
        </AbsoluteFill>
      )}
      {word && wk > 0 && (
        <div style={{ position: "absolute", left: word.where === "right" ? w * 0.42 : 40, right: word.where === "left" ? w * 0.42 : v ? 150 : 40,
          top: v ? h * 0.15 : h * 0.1, textAlign: word.where === "left" ? "left" : word.where === "right" ? "right" : "center" }}>
          <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: v ? 150 : 110, lineHeight: 1, textTransform: "uppercase",
            color: WORD_COLORS[word.color ?? "gold"] ?? WORD_COLORS.gold, WebkitTextStroke: `${v ? 16 : 12}px #000`, paintOrder: "stroke fill",
            transform: `translateY(${(1 - wk) * -260}px) scale(${0.7 + 0.3 * wk}) rotate(${(1 - wk) * -8 - 3}deg)`,
            filter: "drop-shadow(0 14px 0 rgba(0,0,0,0.5))" }}>{word.text}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
