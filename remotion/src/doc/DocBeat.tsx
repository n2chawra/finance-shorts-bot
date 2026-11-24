/**
 * The documentary beat (`"scene": "doc"`): one beat of a hybrid documentary, assembled from layers the
 * script names (footage, a photo, a document, headlines, a chart, a timeline, a split, a map, a chapter
 * card) and overlays (a lower third, the source tag), every change on a spoken word.
 *
 * Unlike a directed beat it needs no code of its own: the director writes params, Python fills every
 * {placeholder} and checks them (renderer/timeline/build.py `doc_problems`), and this scene draws them.
 * Moments are event names (spoken words in the beat's `events`); a layer's own clock starts at its `at`,
 * so a clip cut in on a word starts its trim and its push there. README.md in this folder has the format.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../scenes/kit";
import { motion, type Motion } from "../flat/kit";
import { DocChart, type ChartMark } from "./DocChart";
import { DocMap, type Pin } from "./DocMap";
import { DocumentProp, type DocHeader } from "./DocumentProp";
import { Footage } from "./Footage";
import { FIGURE_KINDS, FigureLayer, isFigureKind } from "./FigureLayer";
import { Headline, type HeadlineItem } from "./Headline";
import { isMove } from "./move";
import { ChapterCard, LabelBox, LowerThird, SourceTag, type ChapterStyle } from "./Overlays";
import { PhotoPan, type PhotoFrame, type Treatment } from "./PhotoPan";
import { PolaroidRow } from "./PolaroidRow";
import { ProductStage } from "./ProductStage";
import { Split, type Side } from "./Split";
import { DOC, fmtDate, isGrade, outCubic, type Surface } from "./theme";
import { Timeline, type YearMark } from "./Timeline";
import { autoEnter, EnterFx, isEnter, LightLeak } from "./Transitions";
import { ArrowMark, DateSlam, slamShake, StampMark } from "./Annotate";
import { isMontageMode, Montage } from "./Montage";
import { Depth } from "./Depth";
import { LogoSticker } from "./LogoSticker";

export const LAYER_KINDS = ["footage", "photo", "document", "headline", "chart", "timeline", "split", "map", "chapter", "polaroids", "products", "montage", "depth", "logo", ...FIGURE_KINDS] as const;
export const OVERLAY_KINDS = ["lowerThird", "source", "chapter", "label", "arrow", "stamp", "date"] as const;

type Any = Record<string, unknown>;
const s = (v: unknown, d = ""): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : d);
const n = (v: unknown, d: number): number => (typeof v === "number" && isFinite(v) ? v : d);
const pair = (v: unknown, d: [number, number]): [number, number] =>
  Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number" ? [v[0], v[1]] : d;
const nums = (v: unknown): number[] => (Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : []);
const list = (v: unknown): Any[] => (Array.isArray(v) ? v.filter((x): x is Any => !!x && typeof x === "object") : []);

/** A figure: a key of params.fig, or a string Python already filled ("{rev_2019}" → "$4.2B"). */
const figOf = (fig: Record<string, string>, v: unknown): string | undefined => {
  if (typeof v !== "string" || !v) return undefined;
  return fig[v] ?? v;
};

type Ctx = { p: SceneProps; m: Motion; fig: Record<string, string>; w: number; h: number };

/** When a layer is on screen: from its `at` word to its `out` word (story frames). */
const span = (c: Ctx, l: Any): [number, number] => {
  const a = typeof l.at === "string" ? c.m.at(l.at, 0) : 0;
  const z = typeof l.out === "string" ? c.m.at(l.out, c.m.end) : c.m.end;
  return [a, Math.max(a + 1, z)];
};

const Layer: React.FC<{ c: Ctx; l: Any }> = ({ c, l }) => {
  const { m, w, h, fig, p } = c;
  const [a, z] = span(c, l);
  const t = m.t - a, end = z - a;
  // an event inside the layer, on the layer's own clock
  const ev = (name: unknown, d: number) => (typeof name === "string" ? m.at(name, a + d) - a : d);
  switch (l.kind) {
    case "footage":
      return <Footage src={s(l.src)} t={t} end={end} tempo={p.tl.tempo} w={w} h={h} trim={n(l.trim, 0)} rate={n(l.rate, 1)} len={typeof l.len === "number" ? l.len : undefined}
        move={isMove(l.move) ? l.move : "push"} amount={n(l.amount, 0.05)} focus={pair(l.focus, [0.5, 0.5])} grade={isGrade(l.grade) ? l.grade : "doc"}
        grain={n(l.grain, 0.2)} vignette={n(l.vignette, 0.45)} letterbox={l.letterbox === true} blur={n(l.blur, 0)} dim={n(l.dim, 0)} aspect={typeof l.aspect === "number" ? l.aspect : undefined} />;
    case "photo":
      return <PhotoPan src={s(l.src)} t={t} end={end} w={w} h={h} aspect={n(l.aspect, 1.5)} focus={pair(l.focus, [0.5, 0.4])} move={isMove(l.move) ? l.move : "push"}
        amount={n(l.amount, 0.12)} frame={s(l.frame, "full") as PhotoFrame} treatment={s(l.treatment, "none") as Treatment} grade={isGrade(l.grade) ? l.grade : "doc"}
        caption={typeof l.caption === "string" ? l.caption : undefined} surface={s(l.surface, "desk") as Surface} inAt={ev(l.landAt, 0)} tilt={n(l.tilt, -3)} pos={pair(l.pos, [0.5, 0.5])} />;
    case "document":
      return <DocumentProp t={t} end={end} w={w} h={h} src={typeof l.src === "string" ? l.src : undefined} aspect={typeof l.aspect === "number" ? l.aspect : undefined}
        box={Array.isArray(l.box) && l.box.length === 4 ? (nums(l.box) as [number, number, number, number]) : undefined}
        lines={Array.isArray(l.lines) ? l.lines.map((x) => s(x)) : undefined} header={(l.header && typeof l.header === "object" ? l.header : undefined) as DocHeader | undefined}
        hi={n(l.hi, 0)} phrase={typeof l.phrase === "string" ? l.phrase : undefined}
        focusAt={ev(l.pushAt, 8)} hiAt={l.markAt !== undefined ? ev(l.markAt, 30) : undefined} underAt={l.underAt !== undefined ? ev(l.underAt, 40) : undefined}
        quote={typeof l.quote === "string" ? l.quote : undefined} quoteAt={l.quote ? ev(l.quoteAt, 50) : undefined}
        source={sourceText(l.source)} surface={s(l.surface, "desk") as Surface} tilt={n(l.tilt, 18)} push={typeof l.push === "number" ? l.push : undefined} stamp={typeof l.stamp === "string" ? l.stamp : undefined} />;
    case "headline": {
      const items = list(l.items).map((it) => ({ outlet: s(it.outlet), date: s(it.date), title: s(it.title), deck: typeof it.deck === "string" ? it.deck : undefined,
        style: it.style === "web" ? "web" : "paper", hi: typeof it.hi === "string" ? it.hi : undefined } as HeadlineItem));
      const on = items.map((_, i) => ev(Array.isArray(l.on) ? l.on[i] : undefined, 4 + i * 26));
      return (
        <AbsoluteFill>
          {l.plate === false ? null : <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${DOC.bg2}, ${DOC.bg})` }} />}
          <Headline items={items} on={on} hiAt={l.markAt !== undefined ? ev(l.markAt, 40) : undefined} t={t} end={end} w={w} h={h} />
        </AbsoluteFill>
      );
    }
    case "chart":
      return <DocChart kind={l.type === "bar" ? "bar" : "line"} values={nums(l.values)} labels={Array.isArray(l.labels) ? l.labels.map((x) => s(x)) : []}
        title={typeof l.title === "string" ? l.title : undefined} sub={typeof l.sub === "string" ? l.sub : undefined}
        figure={figOf(fig, l.figure)} figLabel={typeof l.figLabel === "string" ? l.figLabel : undefined} hiBar={typeof l.hiBar === "number" ? l.hiBar : undefined}
        tone={l.tone === "fall" ? "fall" : l.tone === "neutral" ? "neutral" : "rise"} zero={l.zero === true}
        marks={list(l.marks).map((mk) => ({ i: n(mk.i, 0), label: s(mk.label), at: mk.at !== undefined ? ev(mk.at, 0) : undefined } as ChartMark))}
        barFigs={Array.isArray(l.figs) ? l.figs.map((x) => figOf(fig, x)) : []} icons={Array.isArray(l.icons) ? l.icons.map((x) => (typeof x === "string" && x ? x : undefined)) : []}
        drawAt={ev(l.drawAt, 6)} drawLen={n(l.drawLen, 40)} figAt={l.figure ? ev(l.countAt, 46) : undefined} plate={l.plate !== false} t={t} end={end} w={w} h={h} />;
    case "timeline":
      return <Timeline marks={list(l.marks).map((mk, i) => ({ year: typeof mk.year === "number" ? mk.year : s(mk.year), label: s(mk.label), at: ev(mk.at, 6 + i * 30),
        src: typeof mk.src === "string" ? mk.src : undefined } as YearMark))} t={t} end={end} w={w} h={h} />;
    case "split": {
      const side = (v: unknown): Side => {
        const o = (v && typeof v === "object" ? v : {}) as Any;
        return { name: s(o.name), src: typeof o.src === "string" ? o.src : undefined, fit: o.fit === "contain" ? "contain" : "cover", fig: figOf(fig, o.figure),
          sub: typeof o.sub === "string" ? o.sub : undefined, color: typeof o.color === "string" ? o.color : undefined };
      };
      return <Split left={side(l.left)} right={side(l.right)} leftAt={ev(l.leftAt, 2)} rightAt={ev(l.rightAt, 12)} figAt={l.countAt !== undefined ? ev(l.countAt, 24) : undefined}
        win={l.win === "left" || l.win === "right" ? l.win : undefined} winAt={l.winAt !== undefined ? ev(l.winAt, 40) : undefined} t={t} end={end} w={w} h={h} />;
    }
    case "map":
      return <DocMap fit={Array.isArray(l.fit) ? l.fit.map((x) => s(x)) : []} center={Array.isArray(l.center) ? pair(l.center, [0, 0]) : undefined} scale={typeof l.scale === "number" ? l.scale : undefined} hi={Array.isArray(l.hi) ? l.hi.map((x) => s(x)) : []}
        pins={list(l.pins).map((pn, i) => ({ at: pair(pn.lonlat, [0, 0]), label: typeof pn.label === "string" ? pn.label : undefined, on: ev(pn.on, 6 + i * 20) } as Pin))}
        t={t} end={end} w={w} h={h} />;
    case "chapter":
      return <ChapterCard n={typeof l.n === "number" ? l.n : undefined} title={s(l.title)} kicker={typeof l.kicker === "string" ? l.kicker : undefined}
        t={t} end={end} w={w} h={h} on={ev(l.titleAt, 4)} plate={n(l.plate, 1)} style={chapterStyle(l.style)} />;
    case "polaroids":
      return <PolaroidRow items={list(l.items).map((it, i) => ({ src: s(it.src), aspect: typeof it.aspect === "number" ? it.aspect : undefined, caption: typeof it.caption === "string" ? it.caption : undefined,
        at: ev(it.at, 6 + i * 24), bw: it.bw === true }))} surface={s(l.surface, "desk") as Surface} bw={l.bw === true} dim={n(l.dim, 0.55)} t={t} end={end} w={w} h={h} />;
    case "products":
      return <ProductStage mode={l.mode === "pallet" || l.mode === "wall" ? l.mode : "stage"} items={list(l.items).map((it, i) => ({ src: s(it.src), aspect: typeof it.aspect === "number" ? it.aspect : undefined,
        label: typeof it.label === "string" ? it.label : undefined, at: ev(it.at, 4 + i * 16) }))} count={figOf(fig, l.count)} countLabel={typeof l.countLabel === "string" ? l.countLabel : undefined}
        fillAt={ev(l.fillAt, 6)} fillLen={n(l.fillLen, 36)} backdrop={l.backdrop === "paper" ? "paper" : "charcoal"} t={t} end={end} w={w} h={h} />;
    case "montage":
      return <Montage items={list(l.items).map((it) => ({ src: s(it.src), focus: Array.isArray(it.focus) ? pair(it.focus, [0.5, 0.4]) : undefined,
        aspect: typeof it.aspect === "number" ? it.aspect : undefined, caption: typeof it.caption === "string" ? it.caption : undefined,
        at: it.at !== undefined ? ev(it.at, 0) : undefined }))} mode={isMontageMode(l.mode) ? l.mode : "punch"} every={n(l.every, 10)}
        grade={isGrade(l.grade) ? l.grade : "doc"} t={t} end={end} w={w} h={h} />;
    case "depth":
      return <Depth src={s(l.src)} cut={s(l.cut)} title={typeof l.title === "string" ? l.title : undefined} sub={typeof l.sub === "string" ? l.sub : undefined}
        titleAt={ev(l.titleAt, 8)} tone={l.tone === "white" || l.tone === "red" ? l.tone : "gold"} bgTreatment={l.bgTreatment === "archive" || l.bgTreatment === "none" ? l.bgTreatment : "bw"}
        grade={isGrade(l.grade) ? l.grade : "doc"} focus={Array.isArray(l.focus) ? pair(l.focus, [0.5, 0.45]) : undefined} side={l.side === "right" ? "right" : "left"}
        particles={l.particles === true} t={t} end={end} w={w} h={h} />;
    case "logo":
      return <LogoSticker src={s(l.src)} aspect={n(l.aspect, 3)} pos={pair(l.pos, [0.5, 0.3])} size={n(l.size, 0.62)} tilt={n(l.tilt, -4)} t={t} end={end} w={w} h={h} />;
    default:
      return isFigureKind(l.kind) ? <FigureLayer l={l} fig={fig} t={t} end={end} w={w} h={h} ev={ev} /> : null;
  }
};

const chapterStyle = (v: unknown): ChapterStyle => (v === "caps" || v === "tape" ? v : "serif");

/** "Form 10-K, Example Holdings Inc. · Apr 2, 2001" from {form, text, date} or a plain string. */
function sourceText(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Any;
    // the filing's form name is its own key ("Form 10-K": digits a script may not type into text)
    const what = [s(o.form), s(o.text)].filter(Boolean).join(", ");
    return [what, fmtDate(s(o.date))].filter(Boolean).join(" · ") || undefined;
  }
  return undefined;
}

const Overlay: React.FC<{ c: Ctx; o: Any }> = ({ c, o }) => {
  const { m, w, h } = c;
  const [a, z] = span(c, o);
  switch (o.kind) {
    case "lowerThird":
      return <LowerThird name={s(o.name)} role={typeof o.role === "string" ? o.role : undefined} t={m.t} w={w} h={h} inAt={a} outAt={typeof o.out === "string" ? z : undefined} />;
    case "source":
      return <SourceTag text={sourceText(o) ?? ""} w={w} h={h} k={outCubic((m.t - a - 4) / 12)} pos={o.pos === "top-right" ? "top-right" : "bottom-left"} />;
    case "chapter":
      return <ChapterCard n={typeof o.n === "number" ? o.n : undefined} title={s(o.title)} kicker={typeof o.kicker === "string" ? o.kicker : undefined}
        t={m.t - a} end={z - a} w={w} h={h} on={4} plate={n(o.plate, 0.7)} style={chapterStyle(o.style)} />;
    case "arrow":
      return <ArrowMark t={m.t} inAt={a} outAt={typeof o.out === "string" ? z : undefined} w={w} h={h} from={pair(o.from, [0.3, 0.3])} to={pair(o.to, [0.5, 0.5])}
        label={typeof o.label === "string" ? o.label : undefined} tone={o.tone === "gold" || o.tone === "white" ? o.tone : "red"} />;
    case "stamp":
      return <StampMark t={m.t} inAt={a} outAt={typeof o.out === "string" ? z : undefined} w={w} h={h} text={s(o.text)} pos={Array.isArray(o.pos) ? pair(o.pos, [0.5, 0.35]) : undefined}
        tone={o.tone === "gold" || o.tone === "white" ? o.tone : "red"} tilt={typeof o.tilt === "number" ? o.tilt : undefined} />;
    case "date":
      return <DateSlam t={m.t} inAt={a} outAt={typeof o.out === "string" ? z : undefined} w={w} h={h} date={s(o.date)} sub={typeof o.sub === "string" ? o.sub : undefined}
        pos={o.pos === "center" ? "center" : "top"} />;
    case "label":
      return <LabelBox text={figOf(c.fig, o.text) ?? ""} sub={typeof o.sub === "string" ? o.sub : undefined} t={m.t} w={w} h={h} inAt={a}
        outAt={typeof o.out === "string" ? z : undefined} tone={o.tone === "red" ? "red" : "white"} />;
    default:
      return null;
  }
};

export const DocScene: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const w = p.tl.width, h = p.tl.height;
  const P = p.beat.params as Any;
  const fig = (P.fig && typeof P.fig === "object" ? P.fig : {}) as Record<string, string>;
  const c: Ctx = { p, m, fig, w, h };
  const layers = list(P.layers);
  const overlays = list(P.overlays);
  // a punch: the whole picture snaps 5% closer on a word and holds
  const pk = typeof P.punch === "string" ? outCubic((m.t - m.at(P.punch, Infinity)) / 6) : 0;
  // a stamp or date slam shakes the whole picture as it lands
  const slam = overlays.filter((o) => o.kind === "stamp" || o.kind === "date").map((o) => slamShake(m.t, span(c, o)[0])).find((q) => q.x || q.y);
  const seed = `${p.beat.id}`;
  return (
    <AbsoluteFill style={{ background: DOC.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: [pk > 0 ? `scale(${1 + 0.05 * pk})` : "", slam ? `translate(${slam.x}px, ${slam.y}px) rotate(${slam.r}deg)` : ""].join(" ").trim() || undefined }}>
        {layers.map((l, i) => {
          const [a, z] = span(c, l);
          // a layer with no `out` holds past the beat's end (the video's tail after the last beat)
          if (m.t < a || (typeof l.out === "string" && m.t >= z)) return null;
          const kind = isEnter(l.enter) ? l.enter : autoEnter(s(l.kind), `${seed}:${p.tl.beats.findIndex((b) => b.id === p.beat.id)}`, i);
          return <EnterFx key={i} kind={kind} t={m.t - a} w={w} h={h}><Layer c={c} l={l} /></EnterFx>;
        })}
        <LightLeak t={m.t} seed={seed} o={0.12} />
      </AbsoluteFill>
      {overlays.map((o, i) => {
        const [a, z] = span(c, o);
        if (m.t < a || (typeof o.out === "string" && m.t >= z + 12)) return null;
        return <Overlay key={`o${i}`} c={c} o={o} />;
      })}
    </AbsoluteFill>
  );
};
