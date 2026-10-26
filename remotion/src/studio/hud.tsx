/**
 * The story HUD (2026-10-26, after The Curious Plot: a level tracker and a climbing number keep
 * people watching to see the last level). Drawn by StoryVideo over the beats, from the script:
 *
 *   timeline.structure = { levels: ["Sell", "Borrow", "Never sell"] }       the promised steps
 *   beat.params.hud = { level?: 2, counter?: { value: @x.v, text: "{x_v}", label?: "Tax bill", at? },
 *                       equation?: { text: "{a} × {b} = {c}", at? } }
 *
 * The level and the counter carry over from beat to beat until a beat changes them; the counter
 * counts from its last value to the new one and lands exactly on Python's string.
 */
import React from "react";
import { spring } from "remotion";
import type { Beat, Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { countUp } from "../fmt/inr";
import { INK } from "./draw";

interface Counter { value?: number; text?: string; label?: string; at?: string }
interface HudParams { level?: number; counter?: Counter; equation?: { text?: string; at?: string }; hide?: boolean; noCounter?: boolean }

const ease = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** The HUD state at this beat: the last level and counter set at or before it. */
function carried(tl: Timeline, index: number) {
  let level: number | undefined, counter: Counter | undefined, prev: Counter | undefined, counterBeat = -1;
  for (let i = 0; i <= index; i++) {
    const hud = (tl.beats[i]!.params.hud ?? {}) as HudParams;
    if (hud.level !== undefined) level = hud.level;
    if (hud.counter) { prev = counter; counter = hud.counter; counterBeat = i; }
  }
  return { level, counter, prev, counterBeat };
}

export const StoryHud: React.FC<{ tl: Timeline; index: number; beat: Beat; frame: number; fps: number }> = ({ tl, index, beat, frame, fps }) => {
  const levels = (tl as Timeline & { structure?: { levels?: string[] } }).structure?.levels ?? [];
  const hud = (beat.params.hud ?? {}) as HudParams;
  if (hud.hide || beat.scene === "end") return null;
  const { level, counter, prev, counterBeat } = carried(tl, index);
  if (!levels.length && !counter) return null;
  const { width: w, height: h } = tl;
  const v = h > w;
  const t = (frame - beat.from) / fps * tl.tempo;     // story seconds into this beat
  const evAt = (name?: string) => (name && name in beat.events ? beat.events[name]! / fps : 0);

  // the counter: counts up from the previous value when this beat sets a new one
  let counterText = hud.noCounter ? undefined : counter?.text;
  let label = counter?.label;
  let pulse = 0;
  if (counter && counterBeat === index && counter.value !== undefined) {
    const start = evAt(counter.at), d = t - start;
    if (d < 0) { counterText = prev?.text; label = prev?.label; }
    else if (d < 1) counterText = countUp(counter.value, ease(d), counter.text ?? "", "inr", tl.currency);
    pulse = d >= 0 && d < 1.3 ? Math.sin(Math.min(1, d / 1.3) * Math.PI) : 0;
  }
  const eq = hud.equation;
  const eqK = eq ? spring({ frame: Math.max(0, (t - evAt(eq.at)) * fps), fps, config: { damping: 12, stiffness: 150 } }) * (t >= evAt(eq.at) ? 1 : 0) : 0;
  const chip = v ? 44 : 30;

  return (
    <div data-hud style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {counterText && (
        <div style={{ position: "absolute", top: v ? 150 : 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {label && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: v ? 46 : 30, color: "#fff", textTransform: "uppercase", letterSpacing: 2,
            background: "rgba(10,12,24,0.55)", padding: "4px 22px", borderRadius: 999 }}>{label}</div>}
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: (v ? 118 : 84) * (1 + pulse * 0.12), color: "#ffd84a", lineHeight: 1.05,
            WebkitTextStroke: `${v ? 12 : 9}px ${INK}`, paintOrder: "stroke fill", filter: "drop-shadow(0 10px 0 rgba(0,0,0,0.45))" }}>{counterText}</div>
        </div>
      )}
      {eq?.text && eqK > 0 && (
        <div style={{ position: "absolute", top: v ? (counterText ? 420 : 170) : (counterText ? 190 : 50), left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: v ? 54 : 38, color: INK, background: "#fff", border: `5px solid ${INK}`, borderRadius: 18,
            padding: v ? "8px 28px" : "4px 18px", transform: `scale(${0.6 + 0.4 * eqK})`, boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>{eq.text}</div>
        </div>
      )}
      {levels.length > 0 && (
        <div style={{ position: "absolute", bottom: v ? 150 : 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: v ? 14 : 10, flexWrap: "wrap", padding: "0 30px" }}>
          {levels.map((name, i) => {
            const n = i + 1, on = level === n, done = level !== undefined && n < level;
            return (
              <div key={name} style={{ fontFamily: FONT, fontWeight: 800, fontSize: chip, padding: v ? "6px 20px" : "4px 14px", borderRadius: 999,
                background: on ? "#ffd84a" : done ? "rgba(124,240,178,0.9)" : "rgba(10,12,24,0.6)", color: on || done ? INK : "#fff",
                border: `4px solid ${on ? INK : "transparent"}`, transform: on ? "scale(1.12)" : undefined, whiteSpace: "nowrap" }}>
                {`${n} ${name}`}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
