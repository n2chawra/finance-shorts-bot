/**
 * Word-by-word captions for Shorts (most are watched muted). Pages of up to three tokens, a new
 * page after a full stop; the word being spoken pops in the accent colour. Figures show as on
 * screen ("₹60,000") because Python builds the tokens from the written line. Drawn outside the
 * camera, in real time, inside the Shorts safe zone.
 */
import React from "react";
import { spring } from "remotion";
import type { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { SHORT } from "../design/frame";

const PAGE = 3;

export const Captions: React.FC<{ tl: Timeline; frame: number; fps: number }> = ({ tl, frame, fps }) => {
  const beat = tl.beats.find((b) => frame >= b.from && frame < b.from + b.frames);
  const caps = beat?.voice?.captions;
  if (!beat || !beat.voice || !caps || caps.length === 0 || beat.scene === "end") return null;   // the end card has its text
  const t = (frame - beat.from - beat.voice.start) / fps;
  let active = -1;
  for (let i = 0; i < caps.length; i++) if (t >= caps[i]!.s) active = i;
  if (active < 0 || (active === caps.length - 1 && t > caps[active]!.e + 0.5)) return null;

  const pages: number[][] = [];
  let cur: number[] = [];
  caps.forEach((c, i) => {
    cur.push(i);
    if (cur.length === PAGE || /[.!?]$/.test(c.t)) { pages.push(cur); cur = []; }
  });
  if (cur.length) pages.push(cur);
  const page = pages.find((pg) => pg.includes(active)) ?? [];
  const since = Math.round((t - caps[active]!.s) * fps);
  const pop = spring({ frame: since, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });

  return (
    <div style={{
      position: "absolute", left: SHORT.sideMargin + 60, right: SHORT.sideMargin + 110, top: tl.height * 0.6,
      display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 38px",
      fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1.1, textAlign: "center",
    }}>
      {page.map((i) => {
        const on = i === active;
        return (
          <span key={i} style={{
            color: on ? tl.palette.accent : "#ffffff", WebkitTextStroke: "12px #0b0b12", paintOrder: "stroke fill",
            transform: `scale(${on ? 1 + 0.08 * pop : 1})`, transformOrigin: "50% 85%", display: "inline-block",
            textShadow: "0 8px 0 rgba(0,0,0,0.35)",
          }}>{caps[i]!.t}</span>
        );
      })}
    </div>
  );
};
