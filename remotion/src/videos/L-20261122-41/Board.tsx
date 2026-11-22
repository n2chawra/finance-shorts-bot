// Board (flat/doc): the investigation board. Modes (params.mode): chain (the cause chain, three links writing
// on their words and glowing red end to end), factors (two cause cards stamped), ruled (the two causes plus
// workmanship and materials stamped RULED OUT), score (the closing scorecard: weak detail, the rod change,
// the review).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, CauseChain, DisasterLookProvider, LookBackground, Texture, type Cause } from "../../disaster/index";
import { figOf, moments, RECIPE } from "./ui";

type Params = { mode?: string };

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
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><defs><pattern id="bg-grid" width={90} height={90} patternUnits="userSpaceOnUse"><rect width={90} height={4} fill="#39ff9a" /><rect width={4} height={90} fill="#39ff9a" /></pattern></defs><rect width={1920} height={1080} fill="url(#bg-grid)" opacity={0.3} /></svg>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${1 + 0.05 * (t / Math.max(1, m.end))}) translate(-960 -540)`}>
            <CauseChain t={t} x={140} y={500} w={1640} size={60} broken={2} breakAt={e("through")}
              links={[{ label: "weak detail", at: e("weak") }, { label: "rods changed", at: e("change") }, { label: "review let it through", at: e("review") }]} />
          </g>
        </svg>
        <Texture t={t} />
      </DisasterLookProvider>
    );
  }
  const inch = figOf(p, "inch");
  const causes: Cause[] = mode === "score"
    ? [{ label: "A weak detail", at: e("weak"), verdict: "cause" },
       { label: `A rod moved ${inch} inches`, at: e("rod"), verdict: "cause" },
       { label: "A review that let it through", at: e("review"), verdict: "factor" }]
    : [{ label: "Original detail too weak", at: mode === "factors" ? e("weak") : 0, verdict: "cause" },
       { label: "Rod change doubled the load", at: mode === "factors" ? e("doubled") : 0, verdict: "cause" },
       ...(mode === "ruled" ? [{ label: "Workmanship", at: e("welding"), verdict: "ruled out" as const }, { label: "Materials", at: e("materials"), verdict: "ruled out" as const }] : [])];
  return (
    <DisasterLookProvider value={RECIPE}>
      <CauseBoard t={t} title={mode === "score" ? "Three links, one walkway" : "What the report found"} titleAt={mode === "factors" ? e("little") : 0} causes={causes} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Board;
