/**
 * The turn: "But if the market crashes, the bank won't wait. It sells my shares for me, at the
 * worst price." The growth chart fills the frame and plunges red on "crashes"; the alarm spins on
 * "bank"; the padlocked shares are yanked across to the bank on "sells"; Sharma goes pale.
 *
 * events: crashes, bank, sells
 */
import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { Actor, at, clamp, type SceneProps, sec } from "../../scenes/kit";
import { World } from "../../studio/worlds";
import props from "./props";

const Chart = props.chart!, Alarm = props.alarm!, Shares = props.shares!, Bank = props.bank!, Padlock = props.padlock!;

const Turn: React.FC<SceneProps> = (p) => {
  const { width: w, height: h } = p.tl;
  const t = sec(p);
  const sp = (start: number, damping = 11) => (t < start ? 0 : spring({ frame: (t - start) * p.fps, fps: p.fps, config: { damping, stiffness: 150, mass: 0.8 } }));
  const tCrash = at(p, "crashes", 0.6), tBank = at(p, "bank", 1.6), tSells = at(p, "sells", 2.6);
  const crashed = t >= tCrash;
  const quake = t >= tCrash && t < tCrash + 0.6 ? Math.sin((t - tCrash) * 80) * 22 * (1 - (t - tCrash) / 0.6) : 0;
  const red = crashed ? clamp((t - tCrash) / 0.3) * (0.25 + 0.1 * Math.sin(t * 12)) : 0;
  const yank = clamp((t - tSells) / 0.7);
  const ease = yank < 0.5 ? 4 * yank ** 3 : 1 - (-2 * yank + 2) ** 3 / 2;
  const ground = h * 0.74;
  // the camera: on the chart first, then pulls back to show the bank taking the shares
  const s = t < tBank ? 1.5 : 1.5 - 0.5 * clamp((t - tBank) / 0.6);
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `translate(${quake}px, ${quake * 0.5}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 40%" }}>
        <World kind="city" tint="#ff3b3b" w={w} h={h} t={t} seed="turn-city" props={props} />
        <svg width={w} height={h} style={{ position: "absolute" }}>
          <g transform={`translate(${w * 0.5},${h * 0.5})`}><Chart s={h * 0.32} t={t} k={1} state={crashed ? "crash" : undefined} /></g>
          <g transform={`translate(${w * 0.82},${ground})`}><Bank s={h * 0.22} t={t} /></g>
          {sp(tBank) > 0 && <g transform={`translate(${w * 0.82},${ground - h * 0.25}) scale(${sp(tBank)})`}><Alarm s={h * 0.08} t={t} /></g>}
          <g transform={`translate(${w * (0.2 + 0.56 * ease)},${ground - Math.sin(ease * Math.PI) * h * 0.12}) rotate(${ease * 18})`}>
            <Shares s={h * 0.13} t={t} />
            <g transform={`translate(${h * 0.04},${-h * 0.05})`}><Padlock s={h * 0.06} t={t} /></g>
          </g>
          <Actor p={p} spec={{ who: "sharma", x: 0.22, scale: 1.2, acting: [{ sec: 0, pose: "present", expression: "neutral" }, { at: "crashes", pose: "worried", expression: "shock" }, { at: "sells", pose: "facepalm", expression: "sad" }] }} ground={h * 0.86} index={0} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#ff2020", opacity: red, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export default Turn;
