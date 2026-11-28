// Board (doc): the closing scorecard on the desk, four links stamped on their words, the last one red.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { CauseBoard, DisasterLookProvider, Texture, type Cause } from "../../disaster/index";
import { moments, RECIPE } from "./ui";

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n];
  const causes: Cause[] = [{ label: "A hollow arm", at: e("hollow"), verdict: "factor" }, { label: "Water with nowhere to go", at: e("Water"), verdict: "factor" },
    { label: "Rust out of sight", at: e("Rust"), verdict: "cause" }, { label: "Checks that saw only the outside", at: e("checks"), verdict: "factor" }];
  return (
    <DisasterLookProvider value={RECIPE}>
      <CauseBoard t={t} title="One arm, four links" titleAt={0} causes={causes} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Board;
