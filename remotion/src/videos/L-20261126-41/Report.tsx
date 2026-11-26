// Report (doc kit): the real pages of the NTSB's final report on the crash (2010, public domain) on the desk,
// the finding highlighted on its word (modes cues, cause, recs: `src`, `box`, `page`), and on the
// recommendations page the count plate from params.fig.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { DisasterLookProvider, ReportPage, Texture } from "../../disaster/index";
import { AMBER, ANTON, ChapterCard, figOf, FlatTag, INK, MONO, moments, ramp, RECIPE } from "./ui";

type Params = { src?: string; box?: [number, number, number, number]; page?: number; mode?: string; chapter?: string; moments?: { at: string }[] };

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const names = (P.moments ?? []).map((x) => x.at);
  const mode = P.mode ?? "cause";
  const first = e(names[0] ?? ""), last = e(names[names.length - 1] ?? "");
  const hiAt = mode === "cause" ? e("inappropriate") : mode === "cues" ? e("time") : e("Administration");
  const recs = figOf(p, "recs");
  return (
    <DisasterLookProvider value={RECIPE}>
      <ReportPage t={t} end={m.end} src={P.src ?? ""} aspect={1530 / 1980} box={P.box ?? [0.115, 0.25, 0.75, 0.02]}
        focusAt={(first < 1e8 ? first : 4) + 6} hiAt={hiAt < 1e8 ? hiAt : 30} underAt={last < 1e8 ? last : 40}
        agency="U.S. National Transportation Safety Board" report="loss of control on approach, Colgan Air" page={P.page ?? 1} date="2010-02-02" kind="Aircraft accident report" push={2.2} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 64%, rgba(10,14,20,0.8) 80%, rgba(10,14,20,0.85) 100%)" }} />
      <FlatTag t={t} tag="the real report" at={0} />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
      {mode === "recs" && recs && t >= e("recommendations") && (
        <div style={{ position: "absolute", left: 1400, top: 200, background: "rgba(16,21,27,0.94)", border: `4px solid ${AMBER}`, borderRadius: 10, padding: "10px 26px", opacity: ramp(t, e("recommendations"), 10) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK }}>RECOMMENDATIONS</div>
          <div style={{ fontFamily: ANTON, fontSize: 96, color: AMBER, lineHeight: 1.1 }}>{countText(recs, ramp(t, e("recommendations"), 18))}</div>
        </div>
      )}
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Report;
