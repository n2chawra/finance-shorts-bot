// Report (doc kit): the real pages of the National Bureau of Standards report (NBS BSS 143, 1982, public
// domain) on the desk, the finding highlighted on its word. Params: `src` (the page, staged by
// generator.media), `box` (the finding's line on the page), `page`, `mode` (ruledout adds two RULED OUT
// stamps on "steel" and "workmanship"; arrive is the date line), and the moments name the words the page
// settles, pushes in and highlights on.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { DisasterLookProvider, HonestyTag, ReportPage, Texture } from "../../disaster/index";
import { moments, RECIPE, RED, ANTON } from "./ui";

type Params = { src?: string; box?: [number, number, number, number]; page?: number; mode?: string; moments?: { at: string }[] };

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const P = p.beat.params as Params;
  const ev = moments(p, m.at, m.end);
  const names = (P.moments ?? []).map((x) => x.at);
  const first = ev[names[0] ?? ""] ?? 4, last = ev[names[names.length - 1] ?? ""] ?? 40;
  const stamp = (at: number | undefined, y: number, text: string) => {
    if (at === undefined || t < at) return null;
    const k = Math.min(1, (t - at) / 6);
    return (
      <div style={{ position: "absolute", left: 1260, top: y, transform: `rotate(-8deg) scale(${1.8 - 0.8 * k})`, opacity: k, border: `6px solid ${RED}`, color: RED,
        fontFamily: ANTON, fontSize: 60, padding: "0 20px", letterSpacing: 4, background: "rgba(10,4,4,0.75)" }}>{text}</div>
    );
  };
  return (
    <DisasterLookProvider value={RECIPE}>
      <ReportPage t={t} end={m.end} src={P.src ?? ""} aspect={1373 / 1910} box={P.box ?? [0.07, 0.4, 0.85, 0.02]}
        focusAt={first + 6} hiAt={last} underAt={last + 10}
        agency="National Bureau of Standards" report="the Kansas City Hyatt Regency walkways collapse" page={P.page ?? 1} date="1982-05-01" kind="Investigation" push={2.3} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(3,6,4,0.85) 78%, rgba(3,6,4,0.85) 100%)" }} />
      {P.mode === "ruledout" && stamp(ev.steel, 300, "STEEL · RULED OUT")}
      {P.mode === "ruledout" && stamp(ev.workmanship, 440, "WORKMANSHIP · RULED OUT")}
      <HonestyTag t={t} tag="the real report" at={0} />
      <Texture t={t} />
    </DisasterLookProvider>
  );
};

export default Report;
