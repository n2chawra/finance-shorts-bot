/**
 * Words that carry the verdict or the stakes (playbook gaps #5, #6). Both use Anton at the playbook's size floor
 * (capitals ≥ 11% of the frame height, studio/thumbType CAP_MIN), so they read at 168 px like StackWords.
 *
 *   <VerdictTag kind="stamp">   the rubber stamp from doc/Annotate (landed, ink spread): "BANKRUPT?", "GOING CONCERN?"
 *   <VerdictTag kind="block">   tilted label blocks, one line each ("/" breaks), white on red then red on white
 *   <PriceJump>                 "$45 → $400": the old figure struck through, a heavy arrow, the new one bigger.
 *                               Figures come only from the spec's filled placeholders (th.jump), shortened by shortFig.
 * Red means a loss: a `dir: "up"` jump is green, a `"down"` one red.
 */
import React from "react";
import { StampMark } from "../Annotate";
import { DISPLAY } from "../theme";
import { ANTON_CAP, CAP_MIN } from "../../studio/thumbType";
import { shortFig } from "./frame";

const RED = "#e5483b", GREEN = "#22b45a";

/** Anton's font size for capitals `cap` of the frame height (never under the 11% floor). */
export const capSize = (h: number, cap = 0.12) => Math.ceil((Math.max(cap, CAP_MIN) * h) / ANTON_CAP);

export const VerdictTag: React.FC<{
  text: string; kind?: "stamp" | "block";
  at?: [number, number];        // the tag's centre, shares of the frame
  tilt?: number; cap?: number;
  tone?: "red" | "white";
  w: number; h: number;
}> = ({ text, kind = "stamp", at = [0.5, 0.42], tilt = -8, cap = 0.12, tone = "red", w, h }) => {
  const size = capSize(h, cap);
  const words = text.replace(/\*/g, "").toUpperCase();
  if (kind === "stamp") return <StampMark t={60} inAt={0} w={w} h={h} text={words.replace(/\s*\/\s*/g, " ")} pos={at} tone={tone} tilt={tilt} size={size} />;
  const lines = words.split("/").map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: at[0] * w, top: at[1] * h, transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.06, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }}>
      {lines.map((ln, i) => {
        const inv = (i % 2 === 1) !== (tone === "white");
        return (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1.04, padding: `${size * 0.02}px ${size * 0.16}px`, whiteSpace: "nowrap",
            background: inv ? "#ffffff" : RED, color: inv ? RED : "#ffffff", border: `${Math.round(size * 0.05)}px solid ${inv ? RED : "#ffffff"}` }}>{ln}</div>
        );
      })}
    </div>
  );
};

export const PriceJump: React.FC<{
  from: string; to: string;            // filled placeholders (th.jump.from / .to), never typed
  labels?: [string, string];           // small words over each ("THEN", "NOW"); no figures
  dir?: "up" | "down";
  at?: [number, number];               // the centre of the whole row
  cap?: number;
  short?: boolean;                     // shortFig both (default on)
  w: number; h: number;
}> = ({ from, to, labels, dir = "up", at = [0.5, 0.3], cap = 0.12, short = true, w, h }) => {
  const s = capSize(h, cap);
  const a = short ? shortFig(from) : from, b = short ? shortFig(to) : to;
  const col = dir === "up" ? GREEN : RED;
  const label = (t: string | undefined) => t ? (
    <div style={{ fontFamily: DISPLAY, fontSize: s * 0.36, color: "#ffffff", letterSpacing: s * 0.02, textShadow: "0 3px 8px rgba(0,0,0,0.8)", marginBottom: s * 0.04 }}>{t.toUpperCase()}</div>
  ) : null;
  const chip = (t: string, big: boolean): React.CSSProperties => ({
    position: "relative", fontFamily: DISPLAY, fontSize: big ? s * 1.25 : s, lineHeight: 1.02, whiteSpace: "nowrap",
    padding: `${s * 0.04}px ${s * 0.18}px`, borderRadius: s * 0.1, color: big ? "#ffffff" : "#e9e6df",
    background: big ? col : "#2b2d33", border: `${Math.round(s * 0.055)}px solid #ffffff`, boxShadow: `0 ${s * 0.08}px 0 rgba(0,0,0,0.4)`,
    transform: big ? "rotate(-3deg)" : "rotate(2deg)",
  });
  const aw = s * 0.95;
  return (
    <div style={{ position: "absolute", left: at[0] * w, top: at[1] * h, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: s * 0.12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {label(labels?.[0])}
        <div style={chip(a, false)}>
          {a}
          {/* the old figure struck through */}
          <div style={{ position: "absolute", left: "6%", right: "6%", top: "48%", height: s * 0.09, background: RED, transform: "rotate(-8deg)", borderRadius: s * 0.04 }} />
        </div>
      </div>
      <svg width={aw} height={s * 0.9} viewBox="0 0 100 90" style={{ overflow: "visible", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}>
        <path d="M 4 45 L 62 45" stroke="#ffffff" strokeWidth={30} strokeLinecap="round" />
        <polygon points="54,8 98,45 54,82" fill="#ffffff" stroke="#ffffff" strokeWidth={10} strokeLinejoin="round" />
        <path d="M 6 45 L 62 45" stroke={col} strokeWidth={18} strokeLinecap="round" />
        <polygon points="58,18 90,45 58,72" fill={col} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {label(labels?.[1])}
        <div style={chip(b, true)}>{b}</div>
      </div>
    </div>
  );
};

