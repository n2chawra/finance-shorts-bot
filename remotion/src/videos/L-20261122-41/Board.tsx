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
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${1 + 0.05 * (t / Math.max(1, m.end))}) translate(-960 -540)`}>
            <CauseChain t={t} x={170} y={470} w={1580} size={44} broken={2} breakAt={e("through")}
              links={[{ label: "weak detail", at: e("weak") }, { label: "rods changed", at: e("change") }, { label: "review let it through", at: e("review") }]} />
          </g>
        </svg>
        <Texture t={t} />
      </DisasterLookProvider>
    );
  }
  const inch = figOf(p, "inch");
  const causes: Cause[] = mode === "score"
    ? [{ label: "A weak detail", detail: "the box beam-hanger rod connection", at: e("weak"), verdict: "cause" },
       { label: `A rod moved ${inch} inches`, detail: "the change doubled the load", at: e("rod"), verdict: "cause" },
       { label: "A review that let it through", detail: "stamped as reviewed", at: e("review"), verdict: "factor" }]
    : [{ label: "Original detail too weak", detail: "short of the code from the start", at: mode === "factors" ? e("weak") : 0, verdict: "cause" },
       { label: "Rod change doubled the load", detail: "fourth-floor connections", at: mode === "factors" ? e("doubled") : 0, verdict: "cause" },
       ...(mode === "ruled" ? [{ label: "Workmanship", at: e("welding"), verdict: "ruled out" as const }, { label: "Materials", at: e("materials"), verdict: "ruled out" as const }] : [])];
  return (
    <DisasterLookProvider value={RECIPE}>
      <CauseBoard t={t} title={mode === "score" ? "Three links, one walkway" : "What the report found"} titleAt={mode === "factors" ? e("little") : 0} causes={causes} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Board;
