// Ask (cause board): the chain as one picture, each link stamped on its word: the original connection
// (factor) on "who", the rod change (cause) on "caught", the phone approval (factor, as reported) on "phone";
// the question underlines in yellow on "comments".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, DisasterLookProvider, Texture } from "../../disaster/index";

const Ask: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = { who: m.at("who", 4), caught: m.at("caught", 24), phone: m.at("phone", 44), comments: m.at("below", 80) };
  const u = Math.max(0, Math.min(1, (t - ev.comments) / 14));
  const z = 1.0 + 0.04 * (t / Math.max(1, m.end));
  return (
    <DisasterLookProvider value="blueprint">
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <CauseBoard t={t} title="Who should have caught it?" titleAt={0}
          causes={[
            { label: "Original connection", detail: "weaker than the building code expected", at: ev.who, verdict: "factor" },
            { label: "Rod change during construction", detail: "doubled the load on the upper nuts", at: ev.caught, verdict: "cause" },
            { label: "Approved by phone", detail: "the fabricator's request, as reported", at: ev.phone, verdict: "factor" },
          ]} />
        <div style={{ position: "absolute", left: 180, top: 356, width: 770 * u, height: 8, background: "#ffd84a", borderRadius: 4 }} />
      </AbsoluteFill>
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Ask;
