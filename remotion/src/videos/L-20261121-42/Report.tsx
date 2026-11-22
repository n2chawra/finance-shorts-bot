// Report (doc kit): the real page of the National Bureau of Standards' report (NBS Building Science Series
// 143, the abstract, public domain), on the investigators' desk. It settles on "rods" with its agency and date
// chips; the camera pushes into the abstract on "report"; the highlighter swipes the two lines "from the day
// of construction, they had only minimal capacity to resist their own weight and had virtually no capacity to
// resist additional loads imposed by people" on "built"; a red underline draws on "weight".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { AbsoluteFill } from "remotion";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, HonestyTag, ReportPage, Texture } from "../../disaster/index";
import { ClearOfBadge, evs } from "./ui";

type Params = { src?: string };

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const src = (p.beat.params as Params).src ?? "";
  const e = evs(m, ["rods", "report", "day", "built", "minimal", "weight"]);
  return (
    <DisasterLookProvider value="night-grid">
      <ReportPage t={t} end={m.end} src={src} aspect={1373 / 1910} box={[0.062, 0.8, 0.862, 0.034]}
        focusAt={e.report} hiAt={e.built} underAt={e.weight}
        agency="National Bureau of Standards" report="the Kansas City Hyatt Regency walkways collapse" page={7} date="1982-05-01" kind="Investigation" push={2.5} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(4,8,16,0.85) 76%, rgba(4,8,16,0.85) 88.5%, rgba(4,8,16,0.35) 90%, rgba(4,8,16,0.35) 100%)" }} />
      <ClearOfBadge><HonestyTag t={t} tag="the real report · abstract" at={e.rods} /></ClearOfBadge>
      {t >= e.day! && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, height: 70, background: "rgba(6,12,24,0.92)", display: "flex", alignItems: "center", paddingLeft: 186, gap: 28,
          fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 34, letterSpacing: 4, opacity: Math.min(1, (t - e.day!) / 8) }}>
          <span style={{ color: "#ffd84a" }}>THE FINDING ▸</span>
          {t >= e.minimal! && <span style={{ color: "#f4f8ff", opacity: Math.min(1, (t - e.minimal!) / 8) }}>MINIMAL CAPACITY · OWN WEIGHT</span>}
        </div>
      )}
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Report;
