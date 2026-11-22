// Board (flat/doc): the investigation board. Modes (params.mode): chain (the cause chain: three links write
// on their words and glow red), intro (the board lights), cfeed / cinstr / cturn / cstack / csited (the
// board's findings pinned one by one, each stamped on its word), score (the closing scorecard, four links).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, CauseChain, DisasterLookProvider, LookBackground, Texture, type Cause } from "../../disaster/index";
import { figOf, LampStrip, moments, RECIPE } from "./ui";

type Params = { mode?: string };
const ORDER = ["cfeed", "cinstr", "cturn", "cstack", "csited"];

const Grid: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <defs><pattern id="bg-grid" width={90} height={90} patternUnits="userSpaceOnUse"><rect width={90} height={4} fill="#39ff9a" /><rect width={4} height={90} fill="#39ff9a" /></pattern></defs>
    <rect width={1920} height={1080} fill="url(#bg-grid)" opacity={0.3} />
  </svg>
);

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "chain";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n];
  if (mode === "chain") {
    return (
      <DisasterLookProvider value={RECIPE}>
        <LookBackground />
        <Grid />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${1 + 0.05 * (t / Math.max(1, m.end))}) translate(-960 -540)`}>
            <CauseChain t={t} x={140} y={500} w={1640} size={60} broken={2} breakAt={e("close")}
              links={[{ label: "blind gauge", at: e("gauge") }, { label: "vent, no flare", at: e("vent") }, { label: "trailers too close", at: e("trailers") }]} />
          </g>
        </svg>
        <LampStrip t={t} marks={Object.values(ev)} />
        <Texture t={t} />
      </DisasterLookProvider>
    );
  }
  const hours = figOf(p, "hours");
  const all: Cause[] = [
    { label: hours ? `Fed for over ${hours} hours, none taken out` : "Fed for hours, none taken out", at: undefined, verdict: "cause" },
    { label: "False readings, tired crew, weak training", verdict: "cause" },
    { label: "No shift handover rule", verdict: "factor" },
    { label: "Unsafe blowdown stack kept in service", verdict: "cause" },
    { label: "Occupied trailers too close", verdict: "cause" },
  ];
  const stampAt: Record<string, string> = { cfeed: "procedure", cinstr: "alarms", cturn: "next", cstack: "warnings", csited: "hazardous" };
  let causes: Cause[];
  let title = "What the board found";
  if (mode === "score") {
    title = "Four links, one blast";
    causes = [{ label: "A blind gauge", at: e("gauge"), verdict: "cause" }, { label: "A tower filled for hours", at: e("filled"), verdict: "cause" },
      { label: "A stack with no flare", at: e("flare"), verdict: "cause" }, { label: "Trailers too close", at: e("trailers"), verdict: "cause" }];
  } else if (mode === "intro") {
    causes = [];
  } else {
    const n = ORDER.indexOf(mode);
    causes = all.slice(0, n + 1).map((c, i) => (i === n ? { ...c, at: e(stampAt[mode] ?? "") !== undefined ? (e(stampAt[mode]!)! - 14) : 0 } : { ...c, at: undefined }));
    if (mode === "cfeed") causes[0] = { ...all[0]!, label: hours ? `Fed for over ${hours} hours, none taken out` : all[0]!.label, at: (e("procedure") ?? 30) - 14 };
  }
  return (
    <DisasterLookProvider value={RECIPE}>
      <CauseBoard t={t} title={title} titleAt={mode === "intro" ? e("happen") : 0} causes={causes} />
      <div style={{ position: "absolute", inset: 0 }}><Grid /></div>
      <LampStrip t={t} marks={Object.values(ev)} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Board;
