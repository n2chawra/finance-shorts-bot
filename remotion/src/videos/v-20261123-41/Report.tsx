// Report: "The NTSB named spatial disorientation, and made {fact6} safety recommendations."
// The investigators' desk under a lamp: the NTSB final report page slides in ("NTSB"); the highlighter runs across
// the probable cause line ("named"); push in, SPATIAL DISORIENTATION highlighted amber ("disorientation"); a stack
// of recommendation cards slides out ("made") and fans across the desk ("safety"); the counter tab on the stack
// lands on its figure ("recommendations").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { AMBER, ANTON, Flat, k01, MONO, sm } from "./World";

type Params = { fig?: { recs?: string } };
const PAPER = "#efe9dc", INKD = "#1c1f24";

const Report: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const recs = (p.beat.params as Params).fig?.recs ?? "";
  const named = m.at("named", 15), dis = m.at("disorientation", 35), made = m.at("made", 50), safety = m.at("made", 50) + 10, rec = m.at("recommendations", 75);
  const slide = sm(t / 12);
  const hi = k01((t - named) / 22);
  const zoom = 1 + 0.18 * sm((t - dis) / 15) - 0.18 * sm((t - made) / 15);
  const fan = sm((t - safety) / 15);
  const cards = k01((t - made) / 10);
  return (
    <Flat t={t} tag="as reported">
      {/* the lamp's pool of light on the desk */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, #4a3423 0px, #57402b 38px, #3f2c1e 76px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(255,214,150,0.35), rgba(0,0,0,0.55) 62%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: 70, top: 330 + 500 * (1 - slide), width: 940, height: 760, background: PAPER, borderRadius: 6, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", transform: "rotate(-2deg)", padding: "40px 46px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: "#1d3f7a", letterSpacing: 3 }}>NTSB · FINAL REPORT</div>
          <div style={{ fontFamily: MONO, fontSize: 30, color: "#555", marginTop: 6 }} data-probe="skip">Aircraft Accident Report · Calabasas, California</div>
          <div style={{ height: 4, background: "#1d3f7a", margin: "18px 0 24px" }} />
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, color: INKD, letterSpacing: 2 }}>PROBABLE CAUSE</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 46, lineHeight: 1.35, color: INKD, marginTop: 14 }}>
            …continued flight into instrument conditions, which resulted in the pilot's{" "}
            <span style={{ position: "relative", fontWeight: 700 }}>
              <span style={{ position: "absolute", left: -4, top: 4, height: "1.1em", width: `calc(${hi * 100}% + 8px)`, background: AMBER, opacity: 0.75, borderRadius: 4 }} />
              <span style={{ position: "relative" }}>spatial disorientation</span>
            </span>{" "}and loss of control.
          </div>
        </div>
      </div>
      {/* the recommendation cards fanning out under the page */}
      {cards > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1090, height: 260, opacity: cards }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 300 + i * 70 * fan, top: 20 - i * 6, width: 360, height: 210, background: "#dfe6ee", border: "3px solid #1d3f7a", borderRadius: 8,
              transform: `rotate(${(i - 1.5) * 6 * fan}deg)`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }} />
          ))}
          <div style={{ position: "absolute", left: 140, top: 40, background: "#1d3f7a", color: "#fff", borderRadius: 12, padding: "6px 24px", textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>
            <div style={{ fontFamily: ANTON, fontSize: 110, lineHeight: 1.05 }}>{countText(recs, k01((t - rec) / 12))}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3 }}>SAFETY RECS</div>
          </div>
        </div>
      ) : null}
    </Flat>
  );
};
export default Report;
