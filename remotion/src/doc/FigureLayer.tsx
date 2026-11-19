/**
 * The figure-object layers of the doc scene (README.md "Figure objects"): reads a layer's params and draws
 * CountUp, ListingCard, Ticker, SinkBar, Donut (Figures.tsx) or PosterCard (Poster.tsx). Every figure is a
 * key of params.fig (or a string Python already filled); texts may name a fig key as `{key}`.
 */
import React from "react";
import { CountUp, Donut, fillFig, isTone, ListingCard, SinkBar, Ticker, type SinkOther } from "./Figures";
import { PosterCard } from "./Poster";

export const FIGURE_KINDS = ["count", "listing", "ticker", "sink", "donut", "poster"] as const;
export const isFigureKind = (x: unknown): boolean => typeof x === "string" && (FIGURE_KINDS as readonly string[]).includes(x);

type Any = Record<string, unknown>;
const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);
const num = (v: unknown, d: number): number => (typeof v === "number" && isFinite(v) ? v : d);
const nums = (v: unknown): number[] => (Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : []);

export const FigureLayer: React.FC<{
  l: Any; fig: Record<string, string>; t: number; end: number; w: number; h: number;
  /** an event on the layer's own clock (frames since the layer's `at`), `d` when it is not named */
  ev: (name: unknown, d: number) => number;
}> = ({ l, fig, t, end, w, h, ev }) => {
  const f = (v: unknown): string => { const x = str(v); return x === undefined ? "" : fig[x] ?? fillFig(x, fig); };
  const txt = (v: unknown): string | undefined => { const x = str(v); return x === undefined ? undefined : fillFig(x, fig); };
  const plate = l.plate !== false;
  switch (l.kind) {
    case "count":
      return <CountUp t={t} end={end} w={w} h={h} figure={f(l.figure)} unit={txt(l.unit)} eyebrow={txt(l.eyebrow)} countAt={ev(l.countAt, 4)} countLen={num(l.countLen, 54)}
        tone={isTone(l.tone) ? l.tone : "gold"} dim={num(l.dim, 0.45)} blur={num(l.blur, 10)} plate={l.plate === true} pos={l.pos === "low" ? "low" : "center"} />;
    case "listing":
      return <ListingCard t={t} end={end} w={w} h={h} src={str(l.src)} aspect={num(l.aspect, 1)} title={txt(l.title) ?? ""} platform={txt(l.platform)} date={str(l.date)} seller={txt(l.seller)}
        was={f(l.was)} now={str(l.now) ? f(l.now) : undefined} tag={str(l.tag) ? f(l.tag) : undefined} flipAt={ev(l.flipAt, 30)} tagAt={ev(l.tagAt, 46)} plate={plate} />;
    case "ticker":
      return <Ticker t={t} end={end} w={w} h={h} label={txt(l.label) ?? ""} from={f(l.from)} to={f(l.to)} flipAt={ev(l.flipAt, 20)}
        tape={txt(l.tape)} tapeAt={l.tape ? ev(l.tapeAt, 60) : undefined} plate={plate} />;
    case "sink": {
      const vals = nums(l.values);
      const figs = Array.isArray(l.figs) ? l.figs.map(f) : [];
      const others: SinkOther[] = Array.isArray(l.others) ? (l.others as unknown[]).filter((o): o is Any => !!o && typeof o === "object")
        .map((o) => ({ name: txt(o.name) ?? "", value: num(o.value, 0), fig: str(o.figure) ? f(o.figure) : undefined })) : [];
      return <SinkBar t={t} end={end} w={w} h={h} name={txt(l.name) ?? ""} before={vals[0] ?? 1} after={vals[1] ?? 0} beforeFig={figs[0] ?? ""} afterFig={figs[1] ?? ""}
        tag={str(l.tag) ? f(l.tag) : undefined} title={txt(l.title)} sub={txt(l.sub)} others={others} drawAt={ev(l.drawAt, 4)} sinkAt={ev(l.sinkAt, 40)} plate={plate} />;
    }
    case "donut":
      return <Donut t={t} end={end} w={w} h={h} values={nums(l.values)} figure={str(l.figure) ? f(l.figure) : undefined} label={txt(l.label)} title={txt(l.title)} sub={txt(l.sub)}
        legend={Array.isArray(l.legend) ? l.legend.map((x) => txt(x) ?? "") : []} fillAt={ev(l.fillAt, 6)} tone={isTone(l.tone) ? l.tone : "gold"} plate={plate} />;
    case "poster":
      return <PosterCard t={t} end={end} w={w} h={h} src={str(l.src)} focus={Array.isArray(l.focus) && l.focus.length === 2 ? [num(l.focus[0], 0.5), num(l.focus[1], 0.4)] : undefined}
        date={str(l.date)} title={txt(l.title)} figure={f(l.figure)} sub={txt(l.sub)} face={l.face === "display" ? "display" : "serif"} on={ev(l.on, 0)} />;
    default:
      return null;
  }
};
