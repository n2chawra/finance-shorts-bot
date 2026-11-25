// Board (flat/doc): the investigation board. Modes (params.mode): chain (the promise: three links write on
// their words, the last snaps red), cstrength / crules (the safety board's findings pinned and stamped),
// score (the closing scorecard: four links stamped).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, CauseChain, DisasterLookProvider, LookBackground, Texture, type Cause } from "../../disaster/index";
import { figOf, GridBg, moments, RECIPE } from "./ui";

type Params = { mode?: string };

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "chain";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n];
  if (mode === "chain") {
    const dive = figOf(p, "dive");
    return (
      <DisasterLookProvider value={RECIPE}>
        <LookBackground />
        <GridBg />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 520) scale(${1 + 0.06 * (t / Math.max(1, m.end))}) translate(-960 -520)`}>
            <CauseChain t={t} x={140} y={480} w={1640} size={56} broken={2} breakAt={e("waved")}
              links={[{ label: "uncertified hull", at: e("hull") }, { label: dive ? `bang on dive ${dive}` : "a bang", at: e("bang") }, { label: "warnings waved away", at: e("warnings") }]} />
          </g>
        </svg>
        <Texture t={t} />
      </DisasterLookProvider>
    );
  }
  let title = "What the safety board found";
  let causes: Cause[];
  if (mode === "score") {
    title = "Four links, one implosion";
    causes = [{ label: "An uncertified hull", at: e("uncertified"), verdict: "cause" }, { label: "A window rated far short", at: e("window"), verdict: "factor" },
      { label: "A bang explained away", at: e("bang"), verdict: "cause" }, { label: "A hull left out in the cold", at: e("cold"), verdict: "factor" }];
  } else if (mode === "ctow") {
    causes = [{ label: "Hull strength never established", verdict: "cause" }, { label: "Sensor data misread", verdict: "factor" },
      { label: "Outdoor storage and towing never assessed", at: (e("hull") ?? 30) - 12, verdict: "cause" }];
  } else if (mode === "cstrength") {
    causes = [{ label: "Hull strength never established", at: (e("strong") ?? 20) - 12, verdict: "cause" }];
  } else {
    causes = [{ label: "Hull strength never established", verdict: "cause" }, { label: "Sensor data misread", verdict: "factor" },
      { label: "Storage and towing never assessed", verdict: "cause" }, { label: "Rules too weak", at: (e("weak") ?? 20) - 12, verdict: "factor" }];
  }
  return (
    <DisasterLookProvider value={RECIPE}>
      <CauseBoard t={t} title={title} titleAt={0} causes={causes} />
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply" }}><GridBg /></div>
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Board;
