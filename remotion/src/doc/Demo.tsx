/**
 * A test reel for the documentary editor (src/doc), about 35 s, played through the real StoryVideo with
 * `"scene": "doc"` beats, so it exercises the same wiring a video does: DocDemo (1920×1080) and
 * DocDemoShort (1080×1920). Placeholder material only, not facts: a generated night-city clip
 * (DocDemoClip, rendered to public/doc-demo/), Commons photos and logos already in public/real (their
 * credits are in credits.json), a fictional company's page and made-up outlets. Not part of any video.
 *
 *   npx remotion render src/index.ts DocDemoClip public/doc-demo/city-night.mp4 --crf=26
 *   npx remotion still src/index.ts DocDemo out.png --frame=560
 */
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import type { Beat, Timeline } from "../contract/timeline";
import sample from "../fixtures/sample-timeline.json";
import { StoryVideo } from "../compositions/StoryVideo";
import { rng } from "../flat/kit";

// ------------------------------------------------------------------ the placeholder clip (generated, ours)

/** Out-of-focus city traffic at night: the kind of b-roll a stock site sells, made here so the demo needs
 * no download. Rendered once to public/doc-demo/city-night.mp4 (1280×720, 6 s). */
export const DocDemoClip: React.FC = () => {
  const f = useCurrentFrame();
  const r = rng("doc-demo-city");
  const towers = Array.from({ length: 16 }, (_, i) => ({ x: i * 86 - 20 + r() * 30, w: 60 + r() * 50, h: 180 + r() * 330 }));
  const lights = Array.from({ length: 70 }, () => ({ x: r() * 1500 - 100, y: 470 + r() * 230, r: 8 + r() * 34, v: 1.2 + r() * 4.5, warm: r() < 0.55, o: 0.25 + r() * 0.5 }));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0a1124 0%, #1b2547 55%, #3a2c3b 80%, #120d14 100%)" }}>
      <svg width={1280} height={720} style={{ position: "absolute", inset: 0, filter: "blur(5px)" }}>
        {towers.map((tw, i) => (
          <g key={i}>
            <rect x={tw.x} y={560 - tw.h} width={tw.w} height={tw.h + 40} fill={i % 2 ? "#0e1428" : "#141b33"} />
            {Array.from({ length: Math.floor(tw.h / 22) }).map((_, k) => [0, 1, 2].map((c) => {
              const lit = ((k * 7 + c * 3 + i * 5) % 9) < 4;
              return lit ? <rect key={`${k}-${c}`} x={tw.x + 8 + c * (tw.w / 3.3)} y={560 - tw.h + 10 + k * 22} width={tw.w / 6} height={9} fill={(k + c) % 3 ? "#ffcf7a" : "#9fd2ff"} opacity={0.75} /> : null;
            }))}
          </g>
        ))}
        <rect x={0} y={560} width={1280} height={160} fill="#0b0b12" />
      </svg>
      <svg width={1280} height={720} style={{ position: "absolute", inset: 0, filter: "blur(10px)", mixBlendMode: "screen" }}>
        {lights.map((l, i) => {
          const x = ((l.x + f * l.v * (l.warm ? 1 : -1)) % 1500 + 1500) % 1500 - 100;
          return <circle key={i} cx={x} cy={l.y} r={l.r} fill={l.warm ? "#ff9a3c" : "#ffffff"} opacity={l.o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the reel's beats

const CLIP = "doc-demo/city-night.mp4";
const CLIP_LEN = 6;

type B = { id: string; frames: number; params: Record<string, unknown>; events?: Record<string, number>; transition?: string; say?: string };
/** Figure objects and the poster card (Figures.tsx, Poster.tsx): placeholder figures, not facts. */
const FIGURE_PLAN: B[] = [
  {
    id: "fig-count", frames: 105, transition: "cut", params: {
      place: "the auction hall at night", camera: [{ sec: 0, size: "wide" }, { at: "count", size: "medium" }], moments: [{ at: "count", what: "the footage dims and the price counts up" }],
      fig: { sold: "1,080,000" },
      layers: [{ kind: "footage", src: CLIP, len: CLIP_LEN, grade: "night", move: "push" }, { kind: "count", figure: "sold", eyebrow: "Hammer price", unit: "yuan, for one toy", countAt: "count" }],
    }, events: { count: 10 },
  },
  {
    id: "fig-listing", frames: 120, transition: "cut", params: {
      place: "a resale app", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "flip", what: "the price flips to the new price" }, { at: "tag", what: "the red loss tag slams in" }],
      fig: { was: "$450", now: "$54", loss: "−88%" },
      layers: [{ kind: "listing", src: "doc-demo/tumbler.png", aspect: 0.51, title: "Tumbler, limited colour, unused", platform: "Resale", date: "2025-06", seller: "Placeholder listing for the demo",
        was: "was", now: "now", tag: "loss", flipAt: "flip", tagAt: "tag" }],
    }, events: { flip: 36, tag: 60 },
  },
  {
    id: "fig-ticker", frames: 120, transition: "cut", params: {
      place: "the stock board", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "flip", what: "the digits roll down" }, { at: "tape", what: "the tape types on" }],
      fig: { high: "$41.20", low: "$16.48", drop: "−60%" },
      layers: [{ kind: "ticker", label: "EXMP · NYSE", from: "high", to: "low", flipAt: "flip", tape: "{drop} from peak", tapeAt: "tape" }],
    }, events: { flip: 18, tape: 66 },
  },
  {
    id: "fig-sink", frames: 120, transition: "cut", params: {
      place: "the market share chart", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "draw", what: "the bars rise" }, { at: "sink", what: "the bar sinks and leaves its ghost" }],
      fig: { a: "38%", b: "14%", c: "27%", pts: "−24 pts" },
      layers: [{ kind: "sink", title: "Share of the market", sub: "placeholder figures", name: "Example Co", values: [38, 14], figs: ["a", "b"], tag: "pts",
        others: [{ name: "Rival", value: 27, figure: "c" }], drawAt: "draw", sinkAt: "sink" }],
    }, events: { draw: 4, sink: 48 },
  },
  {
    id: "fig-donut", frames: 105, transition: "cut", params: {
      place: "the share of sales", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "fill", what: "the ring fills to the share" }],
      fig: { share: "62%" },
      layers: [{ kind: "donut", title: "Who sells the most", sub: "placeholder figures", values: [62, 38], figure: "share", label: "of all sales", legend: ["Example Co", "Everyone else"], fillAt: "fill" }],
    }, events: { fill: 8 },
  },
  {
    id: "fig-poster", frames: 210, transition: "cut", params: {
      place: "the premiere", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "start", what: "the poster card cuts in and pushes" }],
      fig: { gross: "$585 MILLION", budget: "$140 million" },
      layers: [{ kind: "poster", src: "real/swift.jpg", focus: [0.5, 0.3], date: "2019-04-26", title: "Example Pictures", figure: "gross", sub: "worldwide · on a {budget} budget" }],
    },
  },
];

const PLAN: B[] = [
  {
    id: "chapter", frames: 75, transition: "cut", params: {
      place: "the city at night", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "start", what: "the chapter card rises over the city" }],
      layers: [{ kind: "footage", src: CLIP, len: CLIP_LEN, grade: "night", move: "push", dim: 0.15 }],
      overlays: [{ kind: "chapter", n: 1, title: "The Rise", style: "caps", plate: 0.4 }],
    },
  },
  {
    id: "city", frames: 120, transition: "fade", params: {
      place: "downtown at night", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "where", what: "the place's lower third wipes in" }],
      layers: [{ kind: "footage", src: CLIP, trim: 2, len: CLIP_LEN, grade: "doc", move: "drift-right", amount: 0.1, letterbox: true }],
      overlays: [
        { kind: "lowerThird", name: "Houston, Texas", role: "Placeholder clip · generated for this demo", at: "where", out: "spec" },
        { kind: "label", text: "open", sub: "a label box on its word", at: "spec" },
      ],
      fig: { open: "24 hours" },
    }, events: { where: 10, spec: 70 },
  },
  {
    id: "founder", frames: 135, transition: "cut", params: {
      place: "the founder's desk", camera: [{ sec: 0, size: "medium" }, { at: "cut", size: "close" }], moments: [{ at: "land", what: "the polaroid drops on the desk" }, { at: "cut", what: "a flash to the archive portrait" }],
      layers: [
        { kind: "photo", src: "real/bezos.jpg", aspect: 0.687, frame: "polaroid", caption: "Seattle, 2018", focus: [0.5, 0.3], landAt: "land", out: "cut", tilt: -4, pos: [0.6, 0.5] },
        { kind: "photo", src: "real/ellison.png", aspect: 0.75, frame: "full", treatment: "archive", focus: [0.5, 0.3], at: "cut", enter: "flash" },
      ],
      overlays: [{ kind: "lowerThird", name: "Jeff Bezos", role: "Photo: Seattle City Council · CC BY 2.0", at: "name", out: "cut" }],
    }, events: { land: 4, name: 20, cut: 70 },
  },
  {
    id: "filing", frames: 195, transition: "cut", params: {
      place: "the annual report", camera: [{ sec: 0, size: "wide" }, { at: "push", size: "close" }], moments: [{ at: "push", what: "the camera pushes to the line" }, { at: "mark", what: "the highlighter swipes the line" }, { at: "under", what: "the phrase is underlined" }, { at: "quote", what: "the quote types into the callout" }],
      layers: [{
        kind: "document", pushAt: "push", markAt: "mark", underAt: "under", quoteAt: "quote", stamp: "SAMPLE",
        header: { form: "Annual Report", company: "Example Holdings Inc.", title: "Management's discussion of results" },
        lines: [
          "The Company operates stores and an online marketplace in several",
          "regions. During the year management reviewed the carrying value of",
          "store assets, lease commitments and the outlook for each segment.",
          "The Board approved a plan to close underperforming locations and",
          "to reduce the cost base of the distribution network accordingly.",
          "Our auditors have expressed substantial doubt about the Company's",
          "ability to continue as a going concern absent new financing.",
          "Management believes the actions described below address these",
          "conditions, although no assurance can be given that they will.",
          "Liquidity was supported by a revolving credit facility, which the",
          "Company drew on in full before the end of the fourth quarter.",
          "Inventory levels were reduced and capital spending was deferred.",
          "Certain vendors shortened payment terms during the period.",
          "This page is a placeholder written for the documentary kit demo.",
        ],
        hi: 5, phrase: "substantial doubt",
        quote: "Substantial doubt about the Company's ability to continue as a going concern.",
        source: { text: "Annual report (sample), Example Holdings Inc.", date: "2001-04-02" },
      }],
    }, events: { push: 12, mark: 62, under: 80, quote: 96 },
  },
  {
    id: "press", frames: 135, transition: "whip", params: {
      place: "the press", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "h0", what: "first headline" }, { at: "h1", what: "second headline" }, { at: "h2", what: "third headline, its key words marked" }],
      layers: [
        { kind: "footage", src: CLIP, trim: 1, len: CLIP_LEN, grade: "bleach", blur: 14, dim: 0.45, move: "still", grain: 0.2 },
        {
          kind: "headline", plate: false, on: ["h0", "h1", "h2"], markAt: "mark", items: [
            { outlet: "The Example Ledger", date: "2001-10-16", title: "Retailer's shares slide as lenders grow wary", style: "paper" },
            { outlet: "Sample Market Wire", date: "2001-11-08", title: "Company restates results for four years", style: "web" },
            { outlet: "The Example Ledger", date: "2001-12-02", title: "Example Holdings files for bankruptcy", deck: "The largest collapse of its kind, a placeholder deck line.", style: "paper", hi: "files for bankruptcy" },
          ],
        },
      ],
    }, events: { h0: 4, h1: 34, h2: 64, mark: 96 },
  },
  {
    id: "price", frames: 135, transition: "cut", params: {
      place: "the share price chart", camera: [{ sec: 0, size: "wide" }, { at: "count", size: "medium" }], moments: [{ at: "draw", what: "the price line draws" }, { at: "count", what: "the last price counts up" }],
      fig: { last: "$0.26" },
      layers: [{
        kind: "chart", type: "line", tone: "fall", title: "Share price", sub: "Placeholder series, monthly close",
        values: [40, 48, 55, 61, 72, 84, 90, 78, 66, 41, 22, 9, 0.26], labels: [2000, "", "", "", "", "", "", "", "", "", "", "", 2001],
        marks: [{ i: 6, label: "Peak" }, { i: 10, label: "Restatement" }], figure: "last", figLabel: "at the last close", drawAt: "draw", drawLen: 60, countAt: "count",
      }],
      overlays: [{ kind: "source", text: "Placeholder data for the demo", date: "2001-12" }],
    }, events: { draw: 6, count: 74 },
  },
  {
    id: "stores", frames: 105, transition: "cut", params: {
      place: "the store count chart", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "draw", what: "the bars grow one by one, each figure landing on its bar" }],
      fig: { a: "1,200", b: "860", c: "640", d: "310" },
      layers: [{
        kind: "chart", type: "bar", tone: "neutral", title: "Stores by chain", sub: "Placeholder figures for the demo", values: [1200, 860, 640, 310], hiBar: 0,
        icons: ["real/amazon-cut.png", "real/netflix-cut.png", "real/amc-cut.png", "real/disneyland-cut.png"], figs: ["a", "b", "c", "d"], drawAt: "draw", drawLen: 36,
      }],
    }, events: { draw: 4 },
  },
  {
    id: "years", frames: 120, transition: "cut", params: {
      place: "the company's years", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "y0", what: "founding" }, { at: "y1", what: "listing" }, { at: "y2", what: "the peak" }, { at: "y3", what: "the collapse" }],
      layers: [{
        kind: "timeline", marks: [
          { year: 1985, label: "Founded in a garage", at: "y0", src: "real/bezos.jpg" },
          { year: 1997, label: "Lists on the stock exchange", at: "y1" },
          { year: 2000, label: "Peak: the most valuable in its field", at: "y2", src: "real/ellison.png" },
          { year: 2001, label: "Files for bankruptcy", at: "y3" },
        ],
      }],
    }, events: { y0: 2, y1: 30, y2: 58, y3: 86 },
  },
  {
    id: "versus", frames: 120, transition: "slide", params: {
      place: "two companies", camera: [{ sec: 0, size: "medium" }], moments: [{ at: "l", what: "the left side" }, { at: "r", what: "the right side" }, { at: "win", what: "the loser dims" }],
      fig: { a: "$638B", b: "$39B" },
      layers: [{
        kind: "split", leftAt: "l", rightAt: "r", countAt: "count", win: "left", winAt: "win",
        left: { name: "Amazon", src: "real/amazon-cut.png", fit: "contain", figure: "a", sub: "placeholder figure", color: "#3b3015" },
        right: { name: "Netflix", src: "real/netflix-cut.png", fit: "contain", figure: "b", sub: "placeholder figure", color: "#3b1515" },
      }],
    }, events: { l: 2, r: 14, count: 30, win: 72 },
  },
  {
    id: "where", frames: 90, transition: "fade", params: {
      place: "the map", camera: [{ sec: 0, size: "wide" }], moments: [{ at: "p0", what: "a pin on the head office" }, { at: "p1", what: "a pin on the warehouse" }],
      layers: [{ kind: "map", center: [-100, 40], scale: 1250, hi: ["United States of America"], pins: [{ lonlat: [-95.37, 29.76], label: "Houston", on: "p0" }, { lonlat: [-122.33, 47.6], label: "Seattle", on: "p1" }] }],
    }, events: { p0: 8, p1: 30 },
  },
  ...FIGURE_PLAN,
];

const BEATS: Beat[] = (() => {
  let from = 0;
  return PLAN.map((b) => {
    const beat: Beat = {
      id: b.id, scene: "doc", from, frames: b.frames, params: b.params, events: { start: 0, speech: 0, end: b.frames, ...(b.events ?? {}) },
      camera: "still", transition: b.transition ?? "cut", speaker: "narrator", chapter: null, say: b.say ?? "", voice: null,
    };
    from += b.frames;
    return beat;
  });
})();
export const DOC_DEMO_FRAMES = BEATS.reduce((a, b) => a + b.frames, 0);

const timeline = (width: number, height: number): Timeline => ({
  ...(sample as unknown as Timeline), id: "doc-demo", format: width < height ? "short" : "long", width, height, tempo: 1,
  durationInFrames: DOC_DEMO_FRAMES, beats: BEATS, captions: false, sources: null, logo: null, currency: "USD",
  disclaimer: "Placeholder material for the documentary kit demo.",
});

export const DocDemo: React.FC<{ width: number; height: number }> = ({ width, height }) => <StoryVideo timeline={timeline(width, height)} />;

/** Registered in Root.tsx: the reel in both formats, and the placeholder clip it plays. */
export const DocDemos: React.FC = () => (
  <>
    <Composition id="DocDemo" component={DocDemo} fps={30} width={1920} height={1080} durationInFrames={DOC_DEMO_FRAMES} defaultProps={{ width: 1920, height: 1080 }} />
    <Composition id="DocDemoShort" component={DocDemo} fps={30} width={1080} height={1920} durationInFrames={DOC_DEMO_FRAMES} defaultProps={{ width: 1080, height: 1920 }} />
    <Composition id="DocDemoClip" component={DocDemoClip} fps={30} width={1280} height={720} durationInFrames={CLIP_LEN * 30} />
  </>
);
