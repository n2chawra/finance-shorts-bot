// Report (doc kit, on the investigator's desk): the real words of the U.S. Consumer Product Safety Commission's
// letter to the ASTM ride committee (25 Sept 2017, public domain) and its In-Depth Investigation, set as pages
// with the spoken line highlighted (modes papers, passed, cpsc, alert, quote, letter, asks); and Ohio's new law
// as a summary card, as reported (mode law).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, LookBackground, ReportPage, Texture } from "../../disaster/index";
import { ANTON, ChapterCard, FlatTag, INK, MONO, moments, ramp, RECIPE, RED, Stamp, TypeText } from "./ui";

type Page = { lines: string[]; hi: number; phrase?: string; quote?: string; stamp?: string; page: number; date: string; kind: string; report: string; first: string; hiAt: string; quoteAt?: string; underAt?: string };

const IDI = "In-Depth Investigation, Ohio State Fair ride incident";
const LETTER = "staff letter to the ASTM F24 amusement ride committee";
const PAGES: Record<string, Page> = {
  papers: {
    lines: ["The involved product is a portable amusement ride.", "The current owner purchased the ride from the first owner", "approximately one year after it was manufactured. The current owner",
      "was unable to provide any literature, receipts or service records", "from the previous owner."],
    hi: 3, phrase: "was unable to provide any literature, receipts or service records", stamp: "NONE PROVIDED", page: 2, date: "2017-07-27", kind: "CPSC", report: IDI, first: "investigators", hiAt: "current", underAt: "provide",
  },
  passed: {
    lines: ["The Department of Agriculture, Amusement Ride Safety Division,", "inspected the incident ride prior to the fair starting and the", "Standard Inspection report dated . . . is attached.", "The incident ride had passed inspection and was in full operation."],
    hi: 3, phrase: "had passed inspection and was in full operation", stamp: "PASSED", page: 3, date: "2017-07-27", kind: "CPSC", report: IDI, first: "standard", hiAt: "dated", underAt: "operation",
  },
  cpsc: {
    lines: ["Staff is concerned that in the interior surfaces of certain amusement rides,", "when fully assembled, water could pool inside the beam or condensation", "could form, resulting in potentially severe corrosion of the interior surfaces.",
      "For rides where there are no means to see inside the beam when fully", "assembled, a visual inspection after the ride is in place would not detect", "corrosion thinning of internal walls."],
    hi: 4, phrase: "a visual inspection after the ride is in place would not detect", quote: "a visual inspection after the ride is in place would not detect corrosion thinning of internal walls",
    page: 1, date: "2017-09-25", kind: "CPSC", report: LETTER, first: "Federal", hiAt: "visual", quoteAt: "detect",
  },
  alert: {
    lines: ["On . . . an amusement ride called the Fire Ball", "was involved in a fatal incident at the Ohio State Fair.", "Attachment 1 is the CPSC's In-Depth Investigation of this incident.",
      "Attachment 2 is the Safety Alert (Bulletin . . .) from The National Association", "of Amusement Ride Safety Officials (NAARSO). The safety bulletin states:"],
    hi: 3, phrase: "Attachment 2 is the Safety Alert", page: 1, date: "2017-09-25", kind: "CPSC", report: LETTER, first: "safety", hiAt: "inspectors", underAt: "warned",
  },
  quote: {
    lines: ["The safety bulletin states:", "excessive corrosion inside the gondola support beam . . . can lead to a", "hazardous wall thickness reduction of the beam and its adjacent joint,", "causing the beam to fail under normal operation.",
      "The safety alert references sand blast cleaning and full interior", "inspection by endoscope or video scope for assessment of corrosion."],
    hi: 1, phrase: "excessive corrosion inside the gondola support beam", quote: "excessive corrosion inside the gondola support beam . . . can lead to a hazardous wall thickness reduction of the beam and its adjacent joint, causing the beam to fail under normal operation",
    page: 1, date: "2017-09-25", kind: "CPSC", report: LETTER, first: "Excessive", hiAt: "Excessive", quoteAt: "hazardous", underAt: "normal",
  },
  letter: {
    lines: ["U.S. Consumer Product Safety Commission", "Division Director, Mechanical and Combustion Engineering", "Chairman, ASTM F24 Committee on Amusement Rides and Devices", "ASTM International", "Re: Ohio State Fair Fatal Ride Incident"],
    hi: 2, phrase: "ASTM F24 Committee on Amusement Rides and Devices", page: 1, date: "2017-09-25", kind: "CPSC", report: LETTER, first: "staff", hiAt: "committee", underAt: "standards",
  },
  asks: {
    lines: ["Staff requests that ASTM F-24 develop performance requirements such as:", "Requirements to prevent water pooling or condensation in critical components", "Means to facilitate visual inspection of the interior of structural beams",
      "Criteria to assess corrosion and actions to be taken based on the condition", "of the material."],
    hi: 1, phrase: "prevent water pooling", page: 2, date: "2017-09-25", kind: "CPSC", report: LETTER, first: "asked", hiAt: "water", underAt: "corrosion",
  },
};

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as { mode?: string; chapter?: string; listAt?: string[] };
  const ev = moments(p, m.at, m.end);
  const e = (n?: string) => (n ? ev[n] ?? m.at(n, 1e9) : 1e9);
  const mode = P.mode ?? "cpsc";
  if (mode === "law") return <LawCard t={t} e={e} end={m.end} />;
  const pg = PAGES[mode] ?? PAGES.cpsc!;
  const fa = e(pg.first), ha = e(pg.hiAt);
  const ticks = mode === "asks" ? (P.listAt ?? []).map((w) => e(w)) : [];
  return (
    <DisasterLookProvider value={RECIPE}>
      <LookBackground />
      <div style={{ position: "absolute", inset: 0, transform: "translate(-290px, 24px)" }}>
        <ReportPage t={t} end={m.end} lines={pg.lines} hi={pg.hi} phrase={pg.phrase} focusAt={(fa < 1e8 ? fa : 4) + 4} hiAt={ha < 1e8 ? ha : 24}
          underAt={pg.underAt ? e(pg.underAt) : undefined}
          agency="U.S. Consumer Product Safety Commission" report={pg.report} page={pg.page} date={pg.date} kind={pg.kind} push={1.3} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(20,14,8,0.6) 88%, rgba(20,14,8,0.75) 100%)" }} />
      <div style={{ position: "absolute", left: 1330, top: 250, width: 540, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ alignSelf: "flex-start", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#f6f1e4", background: "rgba(20,14,8,0.85)", padding: "6px 14px", borderRadius: 4 }}>SOURCE · U.S. CPSC</div>
        {pg.stamp && t >= ha && (
          <div style={{ alignSelf: "flex-start", transform: `rotate(-6deg) scale(${1.6 - 0.6 * ramp(t, ha + 6, 6)})`, opacity: ramp(t, ha + 6, 6), border: `7px solid ${pg.stamp === "PASSED" ? "#1f8a3f" : RED}`, color: pg.stamp === "PASSED" ? "#1f8a3f" : RED, fontFamily: ANTON, fontSize: 70, padding: "0 20px", background: "rgba(255,255,255,0.88)", whiteSpace: "nowrap" }}>{pg.stamp}</div>
        )}
        {pg.quote && pg.quoteAt && t >= e(pg.quoteAt) - 4 && (
          <div style={{ background: "rgba(250,246,236,0.97)", borderLeft: `12px solid ${RED}`, padding: "16px 22px", opacity: ramp(t, e(pg.quoteAt) - 4, 8), boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 31, lineHeight: 1.3, color: INK }}>“{pg.quote.slice(0, Math.max(0, Math.floor((t - e(pg.quoteAt)) * 2.2)))}”</div>
          </div>
        )}
      </div>
      <FlatTag t={t} tag="the real report" at={0} />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
      {mode === "asks" && (
        <div style={{ position: "absolute", left: 1330, top: 340, display: "flex", flexDirection: "column", gap: 18 }}>
          {["NO POOLING WATER", "SEE INSIDE BEAMS", "JUDGE CORROSION"].map((s, i) => {
            const k = ramp(t, ticks[i] ?? 1e9, 8);
            return k <= 0 ? null : (
              <div key={s} style={{ opacity: k, transform: `translateX(${(1 - k) * 30}px)`, display: "flex", alignItems: "center", gap: 14, background: "rgba(250,246,236,0.96)", border: `4px solid ${INK}`, borderRadius: 8, padding: "8px 20px" }}>
                <div style={{ fontFamily: ANTON, fontSize: 48, color: "#1f8a3f" }}>✓</div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: INK }}>{s}</div>
              </div>
            );
          })}
        </div>
      )}
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

/** Ohio's new law, summarised on a card on the desk (as reported): each requirement writes on its word. */
const LawCard: React.FC<{ t: number; e: (n?: string) => number; end: number }> = ({ t, e, end }) => {
  const z = 1.02 + 0.08 * ramp(t, e("engineer"), 24) + 0.02 * (t / Math.max(30, end));
  const rows: [string, string][] = [["corrosion", "YEARLY FATIGUE AND CORROSION REVIEW"], ["photographed", "EVERY MAJOR REPAIR PHOTOGRAPHED"], ["engineer", "AN ENGINEER ON THE ADVISORY BOARD"]];
  return (
    <DisasterLookProvider value={RECIPE}>
      <AbsoluteFill>
        <LookBackground />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
            <g transform={`rotate(-1.5 960 540) translate(0 ${(1 - ramp(t, e("Owners"), 14)) * 60})`} opacity={ramp(t, e("Owners") - 6, 10)}>
              <rect x={290} y={120} width={1340} height={820} fill="rgba(0,0,0,0.25)" transform="translate(16 18)" />
              <rect x={290} y={120} width={1340} height={820} fill="#f6f1e4" />
              <rect x={290} y={120} width={1340} height={90} fill="#1f3a6b" />
              <text x={330} y={182} fontFamily={MONO} fontWeight={700} fontSize={40} fill="#ffffff" letterSpacing={4}>OHIO · RIDE SAFETY LAW</text>
              <TypeText x={340} y={290} t={t} at={e("Owners")} text="OWNERS OF BIGGER RIDES MUST:" size={44} />
              {rows.map(([w, s], i) => {
                const k = ramp(t, e(w), 10);
                return (
                  <g key={w} opacity={0.3 + 0.7 * k}>
                    <rect x={340} y={350 + i * 150} width={1240 * k} height={96} fill="#ffe66d" opacity={0.7} />
                    <text x={370} y={414 + i * 150} fontFamily={MONO} fontWeight={700} fontSize={46} fill={INK}>{s}</text>
                  </g>
                );
              })}
              {t >= e("photographed") && (
                <g transform={`translate(1460 520) rotate(8)`} opacity={ramp(t, e("photographed"), 8)}>
                  <rect x={-70} y={-60} width={150} height={130} fill="#ffffff" stroke={INK} strokeWidth={4} />
                  <rect x={-55} y={-45} width={120} height={80} fill="#8c4a20" />
                </g>
              )}
              <Stamp x={1420} y={830} t={t} at={e("engineer")} text="P.E." color={RED} size={72} />
            </g>
          </g>
        </svg>
        <FlatTag t={t} tag="as reported" at={0} sub="Ohio's ride law, as reported by WOSU and the state's code" />
        <Texture t={t} />
      </AbsoluteFill>
    </DisasterLookProvider>
  );
};

export default Report;
