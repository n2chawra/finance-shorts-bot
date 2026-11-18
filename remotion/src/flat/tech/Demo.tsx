/**
 * A test reel for the tech channel's flat pieces (src/flat/tech), 15 s, in both formats: TechFlatDemo
 * (1080×1920) and TechFlatDemoLong (1920×1080). Five beats written the way a directed beat is: words,
 * figures (`params.fig`) and moments (`events`) come from the beat, the shot reads them. The figures
 * below are placeholders for checking the look, not facts. Not part of any video.
 *
 *   npx remotion still src/index.ts TechFlatDemo out.png --frame=80
 */
import React from "react";
import { Composition, useCurrentFrame } from "remotion";
import type { Beat, Timeline } from "../../contract/timeline";
import sample from "../../fixtures/sample-timeline.json";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../kit";
import { CardDeck, ChapterCard, EquivChain, LineChart, LitDoc, TECH, TechBackdrop, Words, type DeckItem, type EquivLink } from "./index";

const BEAT = 90;
type Fig = Record<string, string>;
const fig = (p: SceneProps): Fig => ((p.beat.params as { fig?: Fig }).fig ?? {});

// ------------------------------------------------------------------ the shots (as a video's beat files would be)

const DeckShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = fig(p);
  const v = p.tl.height > p.tl.width;
  const items = ((p.beat.params.items ?? []) as (DeckItem & { figKey?: string })[]).map((it) => ({ ...it, fig: it.figKey ? f[it.figKey] : undefined }));
  const on = items.map((_, i) => m.at(`item${i}`, 6 + i * 14));
  return (
    <Stage p={p} bg={TECH.bg} vignette={0.5}>
      <TechBackdrop glowAt={[p.tl.width / 2, p.tl.height / 2]} />
      <View zoom={m.lerp([0, m.end], [1.0, 1.04])}>
        <Words x={v ? 80 : 140} y={v ? 330 : 150} size={v ? 64 : 52} weight={800}>{String(p.beat.params.heading ?? "")}</Words>
        <CardDeck m={m} items={items} on={on} hi={Number(p.beat.params.hi ?? 0)} hiAt={m.at("named", 70)} />
      </View>
    </Stage>
  );
};

const ChapterShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  return (
    <Stage p={p} bg={TECH.bg} vignette={0.55}>
      <TechBackdrop grid={false} glowAt={[p.tl.width * 0.25, p.tl.height * 0.4]} />
      <ChapterCard m={m} n={String(p.beat.params.n ?? "")} title={String(p.beat.params.title ?? "")} kicker={String(p.beat.params.kicker ?? "")} on={m.at("title", 8)} />
    </Stage>
  );
};

const ChartShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = fig(p);
  const from = m.at("from", 8), to = m.at("to", 62);
  return (
    <Stage p={p} bg={TECH.bg} vignette={0.5}>
      <TechBackdrop />
      <View zoom={m.lerp([from, to], [1.0, 1.03])} cx={m.lerp([from, to], [p.tl.width * 0.5, p.tl.width * 0.52])} cy={p.tl.height * 0.5}>
        <LineChart m={m} series={(p.beat.params.series ?? []) as number[]} xLabels={(p.beat.params.xLabels ?? []) as string[]}
          title={String(p.beat.params.title ?? "")} endLabel={f.end ?? ""} endSub={String(p.beat.params.endSub ?? "")} from={from} to={to} landAt={m.at("land", to)} />
      </View>
    </Stage>
  );
};

const EquivShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = fig(p);
  const links = ((p.beat.params.links ?? []) as (EquivLink & { figKey?: string })[]).map((l) => ({ ...l, fig: l.figKey ? f[l.figKey] : undefined }));
  return (
    <Stage p={p} bg={TECH.bg} vignette={0.5}>
      <TechBackdrop />
      <EquivChain m={m} links={links} on={links.map((_, i) => m.at(`link${i}`, 6 + i * 34))} />
    </Stage>
  );
};

const DocShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  return (
    <Stage p={p} bg={TECH.bg} vignette={0.6}>
      <TechBackdrop grid={false} />
      <LitDoc m={m} title={String(p.beat.params.title ?? "")} sentences={(p.beat.params.sentences ?? []) as string[]} lit={Number(p.beat.params.lit ?? 0)}
        litAt={m.at("lit", 24)} marker source={String(p.beat.params.source ?? "")} />
    </Stage>
  );
};

// ------------------------------------------------------------------ the demo script

const beat = (i: number, id: string, params: Record<string, unknown>, events: Record<string, number>): Beat => ({
  id, scene: "directed", from: i * BEAT, frames: BEAT, params, events, camera: "static", transition: "cut", speaker: "narrator", chapter: null, say: "", voice: null,
});

const BEATS: Beat[] = [
  beat(0, "deck", {
    component: "Deck", heading: "Where the power goes", hi: 0,
    items: [
      { title: "The chips", sub: "GPUs doing the maths", icon: "gpu", figKey: "a" },
      { title: "Cooling", sub: "fans, chillers, water", icon: "water", figKey: "b" },
      { title: "Networking", sub: "switches and cables", icon: "server", figKey: "c" },
      { title: "Everything else", sub: "lights, losses", icon: "bolt", figKey: "d" },
    ],
    fig: { a: "60%", b: "25%", c: "10%", d: "5%" },
  }, { item0: 6, item1: 20, item2: 34, item3: 48, named: 66 }),
  beat(1, "chapter", { component: "Chapter", n: "02", title: "Why chips got so hungry", kicker: "Chapter two" }, { title: 10 }),
  beat(2, "chart", {
    component: "Chart", title: "Power per AI chip (watts)", endSub: "per chip, today",
    series: [250, 300, 400, 450, 700, 1000, 1200], xLabels: ["2017", "", "", "", "", "", "2025"], fig: { end: "1,200 W" },
  }, { from: 6, to: 60, land: 62 }),
  beat(3, "equiv", {
    component: "Equiv",
    links: [
      { icon: "server", figKey: "rack", label: "one AI rack" },
      { icon: "home", figKey: "homes", label: "homes' power", rel: "=" },
    ],
    fig: { rack: "120 kW", homes: "100" },
  }, { link0: 6, link1: 50 }),
  beat(4, "doc", {
    component: "Doc", title: "Annual Report", lit: 1, source: "Source: company report · 2025",
    sentences: [
      "Demand for accelerated computing continued to grow through the year.",
      "Data centre revenue more than doubled as customers built AI capacity.",
      "We expect supply to remain tight into the next fiscal year.",
    ],
  }, { lit: 26 }),
];

const SHOTS: Record<string, React.FC<SceneProps>> = { deck: DeckShot, chapter: ChapterShot, chart: ChartShot, equiv: EquivShot, doc: DocShot };

const timeline = (width: number, height: number): Timeline => ({
  ...(sample as unknown as Timeline), id: "v-20261118-90", format: width < height ? "short" : "long", width, height,
  durationInFrames: BEAT * BEATS.length, beats: BEATS, captions: false, sources: null,
});

export const TechFlatDemo: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const tl = timeline(width, height);
  const b = BEATS[Math.min(BEATS.length - 1, Math.floor(frame / BEAT))]!;
  const Shot = SHOTS[b.id]!;
  return <Shot beat={b} tl={tl} frame={frame - b.from} fps={30} />;
};

/** Registered in Root.tsx: the reel in both formats. */
export const TechFlatDemos: React.FC = () => (
  <>
    <Composition id="TechFlatDemo" component={TechFlatDemo} fps={30} width={1080} height={1920} durationInFrames={BEAT * BEATS.length} defaultProps={{ width: 1080, height: 1920 }} />
    <Composition id="TechFlatDemoLong" component={TechFlatDemo} fps={30} width={1920} height={1080} durationInFrames={BEAT * BEATS.length} defaultProps={{ width: 1920, height: 1080 }} />
  </>
);
