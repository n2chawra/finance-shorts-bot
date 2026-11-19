/**
 * A document as evidence: a filing, an annual report or a court page lying at an angle on a desk, the
 * camera pushing to one line, a highlighter swiping it, an underline drawing under the phrase that
 * matters, and a callout with the quoted words typed on. "Source: <filing>, <date>" sits in the corner.
 *
 * Two ways to give the page:
 *   src    an image of the real page (the fetcher renders EDGAR / court pages to PNG); `box` marks the
 *          line to highlight as [x, y, w, h] fractions of the page
 *   lines  the page's text, typeset here in a filing face (EDGAR filings are text); `hi` is the line's
 *          index and `phrase` the words in it to mark (the whole line by default)
 * Body text is fine print (the layout probe skips it); the callout is what the viewer reads.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SourceTag, sourceTagPlace } from "./Overlays";
import { clamp01, DOC, DocVignette, FilmGrain, fs, outCubic, SANS, SERIF, smooth, SurfaceBg, unit, type Surface } from "./theme";

export type DocHeader = { company?: string; title?: string; form?: string };

export type DocumentPropProps = {
  t: number; end: number; w: number; h: number;
  src?: string; aspect?: number; box?: [number, number, number, number];
  lines?: string[]; header?: DocHeader; hi?: number; phrase?: string;
  focusAt?: number;            // frame the camera starts pushing to the line
  hiAt?: number;               // frame the highlighter swipes
  underAt?: number;            // frame the underline draws (omit: none)
  quote?: string; quoteAt?: number;    // callout with the quoted words typed on
  source?: string;             // "Form 10-K, Example Holdings Inc. · Apr 2, 2001"
  surface?: Surface;
  tilt?: number;               // degrees the page leans back at the wide shot
  push?: number;               // zoom at the close shot (1.9 default)
  stamp?: string;              // a red stamp across the page ("BANKRUPT", "CONFIDENTIAL"), lands with the highlight
};

const PAGE_ASPECT = 8.5 / 11;

const Marked: React.FC<{ text: string; phrase?: string; hk: number; uk: number; u: number }> = ({ text, phrase, hk, uk, u }) => {
  const i = phrase ? text.indexOf(phrase) : -1;
  const [a, b, c] = i >= 0 && phrase ? [text.slice(0, i), phrase, text.slice(i + phrase.length)] : ["", text, ""];
  return (
    <span>
      {a}
      <span style={{ position: "relative", display: "inline-block" }}>
        {b}
        {/* the highlighter: a slightly skewed swipe, multiplied over the ink */}
        <span style={{ position: "absolute", left: "-0.12em", top: "0.02em", height: "1.08em", width: `calc(${hk * 100}% + ${hk * 0.24}em)`,
          background: DOC.marker, mixBlendMode: "multiply", opacity: 0.85, transform: "skewX(-8deg) rotate(-0.6deg)", borderRadius: "0.12em" }} />
        {uk > 0 ? (
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: "-2%", bottom: "-0.32em", width: "104%", height: "0.42em", overflow: "visible" }}>
            <path d="M1,6 C20,3.5 40,8 60,5 S90,4 99,6" fill="none" stroke={DOC.red} strokeWidth={3.2 * u} strokeLinecap="round" vectorEffect="non-scaling-stroke"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - uk} />
          </svg>
        ) : null}
      </span>
      {c}
    </span>
  );
};

export const DocumentProp: React.FC<DocumentPropProps> = ({
  t, end, w, h, src, aspect, box, lines = [], header, hi = 0, phrase, focusAt = 10, hiAt, underAt, quote, quoteAt, source,
  surface = "desk", tilt = 18, push: push0, stamp,
}) => {
  const u = unit(w, h);
  const v = h > w;
  const pa = aspect ?? PAGE_ASPECT;
  const push = push0 ?? (v ? 1.4 : 1.9);     // a Short's page is already near full width
  const pageH = v ? h * 0.56 : h * 0.98;
  const pageW = Math.min(pageH * pa, w * (v ? 0.9 : 0.6));
  const ph = pageW / pa;
  // where the line sits on the page (page px from the top)
  const margin = pageW * 0.09;
  const body = pageW * 0.0235;
  const lh = body * 1.62;
  const headerH = header ? pageW * 0.2 : 0;
  const lineY = src && box ? (box[1] + box[3] / 2) * ph : margin + headerH + (hi + 0.5) * lh;
  const lineX = src && box ? (box[0] + box[2] / 2) * pageW : pageW * 0.5;
  // the camera: wide on the page, then a push to the line that ends a little above centre
  const e = smooth((t - focusAt) / 34);
  const z = 1 + (push - 1) * e;
  const a = tilt + (6 - tilt) * e;
  const cos = Math.cos((a * Math.PI) / 180);
  const dy = -(lineY - ph / 2) * cos * e + (v ? -h * 0.04 : -h * 0.06) * e;
  const dx = -(lineX - pageW / 2) * e * 0.85;
  const drift = (t / Math.max(1, end)) * 0.03;          // never quite still
  const hk = hiAt === undefined ? 0 : smooth((t - hiAt) / 30);    // a 1 s wipe from the word (the references: 1.2-1.6 s)
  const uk = underAt === undefined ? 0 : smooth((t - underAt) / 14);
  const qk = quoteAt === undefined ? 0 : clamp01((t - quoteAt) / 8);
  const typed = quote && quoteAt !== undefined ? Math.max(0, Math.floor((t - quoteAt - 4) * 1.5)) : 0;
  const sk = stamp && hiAt !== undefined ? outCubic((t - hiAt - 6) / 7) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <SurfaceBg kind={surface} lamp={[0.45, 0.3]} />
      <AbsoluteFill style={{ transform: `scale(${z * (1 + drift)}) translate(${dx}px, ${dy}px)`, display: "flex", alignItems: "center", justifyContent: "center", perspective: 2200 * u }}>
        <div style={{ position: "relative", width: pageW, height: ph, transform: `rotateX(${a}deg) rotateZ(${-3 + 2 * e}deg)`, transformStyle: "preserve-3d" }}>
          {/* the page under it, a little off */}
          <div style={{ position: "absolute", inset: 0, background: "#e4dcc8", transform: `translate(${14 * u}px, ${10 * u}px) rotate(2.2deg)`, boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.5)` }} />
          <div data-probe="skip" style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #f8f5ec, #ece5d3)", boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,0.55)`, overflow: "hidden" }}>
            {src ? (
              <>
                <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(0.12) contrast(1.05)" }} />
                {box ? (
                  <>
                    <div style={{ position: "absolute", left: `${box[0] * 100 - 0.6}%`, top: `${box[1] * 100}%`, height: `${box[3] * 100}%`, width: `${(box[2] * 100 + 1.2) * hk}%`,
                      background: DOC.marker, mixBlendMode: "multiply", opacity: 0.85, transform: "skewX(-8deg)" }} />
                    {uk > 0 ? (
                      <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: `${box[0] * 100}%`, top: `${(box[1] + box[3]) * 100}%`, width: `${box[2] * 100}%`, height: body * 0.5, overflow: "visible" }}>
                        <path d="M1,6 C20,3.5 40,8 60,5 S90,4 99,6" fill="none" stroke={DOC.red} strokeWidth={3.2 * u} strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - uk} />
                      </svg>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : (
              <div style={{ position: "absolute", inset: 0, padding: margin, fontFamily: SERIF, color: DOC.paperInk }}>
                {header ? (
                  <div style={{ height: headerH, textAlign: "center", borderBottom: `${Math.max(1, 2 * u)}px solid #2a251e` }}>
                    {header.form ? <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: body * 1.05, letterSpacing: body * 0.35 }}>{header.form.toUpperCase()}</div> : null}
                    {header.company ? <div style={{ fontWeight: 700, fontSize: body * 2.1, marginTop: body * 0.6, letterSpacing: body * 0.06 }}>{header.company}</div> : null}
                    {header.title ? <div style={{ fontStyle: "italic", fontSize: body * 1.2, marginTop: body * 0.4 }}>{header.title}</div> : null}
                  </div>
                ) : null}
                <div style={{ fontSize: body, lineHeight: `${lh}px`, textAlign: "justify" }}>
                  {lines.map((ln, i) => (
                    <div key={i} style={{ whiteSpace: "nowrap", overflow: "visible", opacity: i === hi ? 1 : 0.82 }}>
                      {i === hi ? <Marked text={ln} phrase={phrase} hk={hk} uk={uk} u={u} /> : ln}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* lamp light falling across the page */}
            <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 30% 20%, rgba(255,240,200,0.18), rgba(0,0,0,0) 60%, rgba(0,0,0,0.16))", pointerEvents: "none" }} />
            {stamp && sk > 0 ? (
              <div style={{ position: "absolute", left: "72%", top: "16%", transform: `translate(-50%, -50%) rotate(-12deg) scale(${1.6 - 0.6 * sk})`, opacity: 0.82 * sk,
                border: `${6 * u}px solid ${DOC.red}`, color: DOC.red, fontFamily: SANS, fontWeight: 900, fontSize: pageW * 0.09, padding: `0 ${pageW * 0.03}px`,
                letterSpacing: pageW * 0.008, mixBlendMode: "multiply", borderRadius: 8 * u }}>{stamp}</div>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrain t={t} o={0.3} moving={false} />
      <DocVignette o={0.6} />
      {/* the callout and the source tag share one bottom-anchored column, so they stack and never overlap */}
      <div style={{
        position: "absolute", left: v ? sourceTagPlace(w, h).left : w * 0.18, right: v ? w * 0.06 : w * 0.18, bottom: sourceTagPlace(w, h).bottom,
        display: "flex", flexDirection: "column", gap: 18 * u,
      }}>
      {quote && qk > 0 ? (
        <div style={{
          position: "relative",
          opacity: qk, transform: `translateY(${(1 - outCubic(qk)) * 30 * u}px)`,
          background: "rgba(10,13,20,0.86)", borderLeft: `${8 * u}px solid ${DOC.gold}`, borderRadius: 6 * u,
          padding: `${26 * u}px ${36 * u}px`, boxShadow: `0 ${20 * u}px ${60 * u}px rgba(0,0,0,0.5)`,
        }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: fs(w, h, v ? 54 : 46), lineHeight: 1.3, color: DOC.text }}>
            <span style={{ color: DOC.gold, fontWeight: 700 }}>“</span>
            {quote.slice(0, typed)}
            {/* the words still to come hold their place, so the box never grows while it types */}
            <span style={{ opacity: 0 }}>{quote.slice(typed)}</span>
            <span style={{ color: DOC.gold, fontWeight: 700, opacity: typed >= quote.length ? 1 : 0 }}>”</span>
          </div>
        </div>
      ) : null}
      {source ? <SourceTag text={source} w={w} h={h} k={clamp01((t - 6) / 10)} inline /> : null}
      </div>
    </AbsoluteFill>
  );
};
