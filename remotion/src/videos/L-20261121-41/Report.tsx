// Report (doc kit): the real page of the National Bureau of Standards' report (NBS Building Science Series
// 143, the abstract, public domain) settles on the desk on "federal" with its agency and date chips; the camera
// pushes in to the finding on "confirmed"; the highlighter swipes across "doubled the load on the box
// beam-hanger rod connections at the fourth floor" on "doubled" and a red underline draws on "load".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { AbsoluteFill } from "remotion";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, HonestyTag, ReportPage, Texture } from "../../disaster/index";

type Params = { src?: string };

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const src = (p.beat.params as Params).src ?? "";
  const ev = { federal: m.at("federal", 4), confirmed: m.at("confirmed", 40), doubled: m.at("doubled", 70), load: m.at("load", 85) };
  return (
    <DisasterLookProvider value="blueprint">
      <ReportPage t={t} end={m.end} src={src} aspect={1373 / 1910} box={[0.083, 0.531, 0.802, 0.021]}
        focusAt={ev.confirmed} hiAt={ev.doubled} underAt={ev.load}
        agency="National Bureau of Standards" report="the Kansas City Hyatt Regency walkways collapse" page={7} date="1982-05-01" kind="Investigation" push={2.5} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(4,8,16,0.85) 76%, rgba(4,8,16,0.85) 88.5%, rgba(4,8,16,0.35) 90%, rgba(4,8,16,0.35) 100%)" }} />
      <HonestyTag t={t} tag="the real report · abstract" at={ev.federal} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Report;
