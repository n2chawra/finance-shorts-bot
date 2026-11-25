// Report (doc kit): the real pages of the NTSB's final report on Titan (MIR-25-36, 2025, public domain) on the
// desk, the finding highlighted on its word (modes cause, finding, recs, recstwo: `src`, `box`, `page`); and the
// Coast Guard's Marine Board as a hearing-room drawing with its reported words stamped (modes cg, culture).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { DisasterLookProvider, ReportPage, Texture } from "../../disaster/index";
import { FlatTag, ANTON, BLUE, ChapterCard, figOf, INK, MONO, moments, Person, ramp, RECIPE, RED, Sheet, Stamp, TypeText } from "./ui";

type Params = { src?: string; box?: [number, number, number, number]; page?: number; mode?: string; chapter?: string; moments?: { at: string }[] };

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const names = (P.moments ?? []).map((x) => x.at);
  const mode = P.mode ?? "cause";
  if (mode === "cg" || mode === "culture") {
    const zk = ramp(t, mode === "cg" ? e("preventable") : e("culture"), 18);
    return (
      <Sheet t={t} zoom={1.02 + 0.2 * zk + 0.02 * (t / Math.max(30, m.end))} cx={960} cy={540 - 60 * zk} html={<>
        <FlatTag t={t} tag="as reported" at={0} sub="the Coast Guard board's findings, as reported" />
        {P.chapter && <ChapterCard t={t} text={P.chapter} dark={false} />}
      </>}>
        <line x1={0} y1={900} x2={1920} y2={900} stroke={INK} strokeWidth={4} />
        <rect x={360} y={640} width={1200} height={40} fill="#e3e5e8" stroke={INK} strokeWidth={5} />
        <rect x={400} y={680} width={1120} height={220} fill="#f4f5f7" stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((i) => <Person key={i} x={560 + i * 200} y={640} s={2} color={i === 2 ? "#1f3a5c" : "#3e5a78"} k={ramp(t, i * 3, 8)} />)}
        <g opacity={ramp(t, 0, 10)}>
          <rect x={560} y={150} width={800} height={110} rx={10} fill={BLUE} />
          <text x={960} y={222} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={38} fill="#ffffff">US COAST GUARD · MARINE BOARD</text>
        </g>
        {mode === "cg" && (
          <g opacity={ramp(t, e("board"), 10)}>
            <rect x={660} y={300} width={600} height={120} rx={10} fill="#ffffff" stroke={INK} strokeWidth={4} />
            <TypeText x={960} y={375} t={t} at={e("board")} text="LOSS OF FIVE LIVES" size={40} anchor="middle" />
          </g>
        )}
        {mode === "cg" && <Stamp x={960} y={520} t={t} at={e("preventable")} text="PREVENTABLE" size={90} />}
        {mode === "culture" && (
          <g>
            <rect x={560} y={290} width={800} height={300} rx={10} fill="#ffffff" stroke={INK} strokeWidth={4} />
            <rect x={590} y={330} width={740 * ramp(t, e("toxic"), 14)} height={60} fill="#ffe66d" opacity={0.75} />
            <TypeText x={610} y={375} t={t} at={e("Coast")} text="TOXIC WORKPLACE CULTURE" size={42} />
            <line x1={610} y1={392} x2={610 + 640 * ramp(t, e("culture"), 12)} y2={392} stroke={RED} strokeWidth={6} />
            <rect x={590} y={460} width={540 * ramp(t, e("intimidation"), 14)} height={60} fill="#ffe66d" opacity={0.75} />
            <TypeText x={610} y={505} t={t} at={e("Coast") + 20} text="INTIMIDATION TACTICS" size={42} />
          </g>
        )}
      </Sheet>
    );
  }
  const first = e(names[0] ?? ""), last = e(names[names.length - 1] ?? "");
  const hiAt = mode === "cause" ? e("inadequate") : mode === "finding" ? e("flawed") : mode === "recs" ? e("study") : mode === "response" ? e("emergency") : e("rules");
  const recs = figOf(p, "recs");
  return (
    <DisasterLookProvider value={RECIPE}>
      <ReportPage t={t} end={m.end} src={P.src ?? ""} aspect={1530 / 1980} box={P.box ?? [0.12, 0.25, 0.75, 0.022]}
        focusAt={(first < 1e8 ? first : 4) + 6} hiAt={hiAt < 1e8 ? hiAt : 30} underAt={(last < 1e8 ? last : 40)}
        agency="U.S. National Transportation Safety Board" report="hull failure and implosion of submersible Titan" page={P.page ?? 1} date="2025-10-02" kind="Marine investigation" push={2.2} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 64%, rgba(10,14,20,0.8) 80%, rgba(10,14,20,0.85) 100%)" }} />
      <FlatTag t={t} tag="the real report" at={0} />
      {P.chapter && <ChapterCard t={t} text={P.chapter} />}
      {mode === "recs" && recs && t >= e("recommendations") && (
        <div style={{ position: "absolute", left: 1400, top: 200, background: "rgba(255,255,255,0.95)", border: `4px solid ${BLUE}`, borderRadius: 10, padding: "10px 26px", opacity: ramp(t, e("recommendations"), 10) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK }}>RECOMMENDATIONS</div>
          <div style={{ fontFamily: ANTON, fontSize: 96, color: BLUE, lineHeight: 1.1 }}>{countText(recs, ramp(t, e("recommendations"), 18))}</div>
        </div>
      )}
      {mode === "recstwo" && t >= e("people") && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(1600 620)" opacity={ramp(t, e("people"), 8)}><Person x={0} y={80} s={1.8} color={RED} /></g>
        </svg>
      )}
      {mode === "finding" && <div style={{ position: "absolute", left: 1420, top: 200, fontFamily: ANTON, fontSize: 64, color: RED, background: "rgba(255,255,255,0.92)", padding: "4px 20px", border: `4px solid ${RED}`, opacity: ramp(t, e("damaged"), 10) }}>{`DIVE ${figOf(p, "dive")}`}</div>}
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Report;
