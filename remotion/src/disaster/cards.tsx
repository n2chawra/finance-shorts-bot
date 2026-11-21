/**
 * Full-frame and overlay pieces for the disasters channel: HonestyTag (the genre's trust device on every
 * realistic shot), CauseBoard (the ending scorecard), ReportPage (the real investigation report over the
 * doc kit's DocumentProp). HTML over AbsoluteFill, pure functions of the frame `t`.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DocumentProp, type DocumentPropProps } from "../doc/DocumentProp";
import { fmtDate } from "../doc/theme";
import { ease, outCubic, typed } from "./Texture";
import { type LookProp, useDisasterLook } from "./looks";

/** channel.json look.honestyTags, by key (the texts are the channel's; keep them in step). */
export const HONESTY = {
  reconstruction: "3D reconstruction · not actual footage",
  reported: "as reported",
  principle: "general principle",
  paused: "time paused",
  speed: "2× speed",
} as const;
export type HonestyKey = keyof typeof HONESTY;

/** The honesty tag, top-left in mono: a preset key or the channel's own text. Fine print (probe skips it). */
export const HonestyTag: React.FC<LookProp & { t: number; tag: HonestyKey | string; at?: number; sub?: string }> = ({ look, t, tag, at, sub }) => {
  const L = useDisasterLook(look);
  const { width: w, height: h } = useVideoConfig();
  const v = h > w, u = Math.min(w, h) / 1080;
  const text = (tag in HONESTY ? HONESTY[tag as HonestyKey] : tag).toUpperCase();
  const k = ease(t, at, 8);
  if (k <= 0) return null;
  const size = (v ? 30 : 24) * u;
  return (
    <div data-probe="skip" style={{ position: "absolute", left: (v ? 48 : 56) * u, top: (v ? 210 : 48) * u, opacity: k, fontFamily: L.fonts.mono, color: L.ink,
      fontSize: size, letterSpacing: size * 0.12, background: L.panel, padding: `${size * 0.3}px ${size * 0.55}px`, borderLeft: `${4 * u}px solid ${L.label}`, borderRadius: 4 * u }}>
      {typed(text, t, at, 2.2)}
      {sub ? <div style={{ fontSize: size * 0.8, opacity: 0.7, marginTop: size * 0.2 }}>{sub}</div> : null}
    </div>
  );
};

export type Cause = { label: string; detail?: string; at?: number; verdict?: "cause" | "factor" | "ruled out" };

/** The ending scorecard: each cause slides in on its word and gets a stamp (red CAUSE, accent FACTOR,
 * grey RULED OUT). */
export const CauseBoard: React.FC<LookProp & { t: number; title: string; causes: Cause[]; titleAt?: number }> = ({ look, t, title, causes, titleAt }) => {
  const L = useDisasterLook(look);
  const { width: w, height: h } = useVideoConfig();
  const v = h > w, u = Math.min(w, h) / 1080;
  const size = (v ? 46 : 40) * u;
  const tk = ease(t, titleAt, 10);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${L.bg[0]}, ${L.bg[1]})`, padding: v ? `${300 * u}px ${70 * u}px` : `${90 * u}px ${180 * u}px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: size * 0.6 }}>
      <div style={{ fontFamily: L.fonts.title, fontWeight: 700, fontSize: size * 1.5, color: L.ink, opacity: tk, transform: `translateY(${(1 - tk) * 20}px)`, marginBottom: size * 0.4 }}>{title}</div>
      {causes.map((c, i) => {
        const k = ease(t, c.at, 10);
        const sk = c.at === undefined ? 1 : outCubic((t - c.at - 12) / 6);
        const verdict = c.verdict ?? "cause";
        const col = verdict === "cause" ? L.fail : verdict === "factor" ? L.accent : L.muted;
        return (
          <div key={i} style={{ position: "relative", opacity: k, transform: `translateX(${(1 - k) * -40 * u}px)`, background: L.panel, borderLeft: `${8 * u}px solid ${k > 0 && sk > 0 ? col : L.muted}`,
            padding: `${size * 0.5}px ${size * 0.7}px`, paddingRight: size * 6, borderRadius: 6 * u }}>
            <div style={{ fontFamily: L.fonts.mono, fontWeight: 700, fontSize: size, color: L.ink, letterSpacing: size * 0.06 }}>{typed(c.label.toUpperCase(), t, c.at, 1.8)}</div>
            {c.detail ? <div style={{ fontFamily: L.fonts.body, fontSize: size * 0.72, color: L.muted, marginTop: size * 0.15 }}>{c.detail}</div> : null}
            {sk > 0 ? (
              <div style={{ position: "absolute", right: size * 0.6, top: "50%", transform: `translateY(-50%) rotate(-8deg) scale(${1.7 - 0.7 * sk})`, opacity: sk,
                border: `${5 * u}px solid ${col}`, color: col, fontFamily: L.fonts.value, fontSize: size * 0.9, padding: `0 ${size * 0.3}px`, letterSpacing: size * 0.06, borderRadius: 6 * u }}>
                {verdict.toUpperCase()}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** The investigation report on screen: DocumentProp with the agency's header (agency on the small caps line,
 * so a long agency name never wraps into the body), the report's page number
 * and date chips, and the highlighter on the finding (DocumentProp's `hiAt`). */
export const ReportPage: React.FC<LookProp & Omit<DocumentPropProps, "w" | "h" | "header" | "source" | "surface"> & {
  agency: string; report: string; page: number; date: string; kind?: string;
}> = ({ look, agency, report, page, date, kind = "Accident report", ...doc }) => {
  const L = useDisasterLook(look);
  const { width: w, height: h } = useVideoConfig();
  const v = h > w, u = Math.min(w, h) / 1080;
  const size = (v ? 34 : 32) * u;
  const chip: React.CSSProperties = { fontFamily: L.fonts.mono, fontWeight: 700, fontSize: size, letterSpacing: size * 0.1, color: L.ink, background: L.panel, padding: `${size * 0.3}px ${size * 0.6}px`, borderRadius: 4 * u };
  return (
    <AbsoluteFill>
      <DocumentProp {...doc} w={w} h={h} surface={L.surface} header={{ form: agency, title: `${kind}: ${report}` }} source={`${agency} · ${fmtDate(date)}`} />
      <div style={{ position: "absolute", right: (v ? 48 : 56) * u, top: (v ? 210 : 48) * u, display: "flex", gap: size * 0.4 }}>
        <div style={chip}>{`P. ${page}`}</div>
        <div style={{ ...chip, color: L.label }}>{fmtDate(date).toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
};
