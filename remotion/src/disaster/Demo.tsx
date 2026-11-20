/**
 * A test reel for the disasters 2D/doc kit (src/disaster): every piece in three looks (night-grid,
 * cross-section, chalk-site), 100 frames each: the diagram + instrument sheet for 65 frames, then a
 * full-frame card (ReportPage, CauseBoard, CauseBoard). Not part of any video; the figures are demo props.
 *
 *   npx remotion still src/index.ts DisasterKitDemo out.png --frame=60
 */
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { CauseBoard, HonestyTag, ReportPage } from "./cards";
import { Callout, CauseChain, Elevation, ForceDiagram } from "./diagrams";
import { AltimeterTape, ListAngle, LoadGauge, MissionClock, SpeedDial, WaterLevel } from "./instruments";
import { DisasterLookProvider, type RecipeId, useDisasterLook } from "./looks";
import { clamp01, LookBackground, Texture } from "./Texture";

const SEGMENTS: { look: RecipeId; kind: "bridge" | "dam" | "hull"; card: "report" | "board" }[] = [
  { look: "night-grid", kind: "bridge", card: "report" },
  { look: "cross-section", kind: "dam", card: "board" },
  { look: "chalk-site", kind: "hull", card: "board" },
];
const SEG = 100, SHEET = 65;
const W = 1920, H = 1080;

const Sheet: React.FC<{ t: number; kind: "bridge" | "dam" | "hull" }> = ({ t, kind }) => {
  const L = useDisasterLook();
  const v = clamp01(t / 55);
  const fail = clamp01((t - 40) / 20);
  const failPoint: [number, number] = kind === "bridge" ? [1000, 330] : kind === "dam" ? [1000, 280] : [1110, 390];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <ForceDiagram t={t} x={330} y={360} size={230} value={v} bank={[0, 38]} title="general principle" titleAt={0}
          forces={[
            { label: "lift", angle: [0, 38], len: [1, 0.7], tone: "ok", at: 2 },
            { label: "weight", angle: [180, 180], len: [0.9, 0.9], tone: "muted", dashed: true, at: 6 },
            { label: "side force", angle: [90, 120], len: [0.2, 0.85], tone: "fail", at: 14 },
          ]} />
        <Elevation t={t} x={720} y={130} w={620} h={360} kind={kind} drawAt={0} stress={clamp01((t - 20) / 30)} fail={fail} failPart={1}
          level={kind === "bridge" ? 0.18 : kind === "dam" ? 0.4 + 0.45 * v : 0.35} levelLabel={kind === "bridge" ? "river" : "water"}
          axis={{ max: kind === "hull" ? 30 : 60, unit: "m", ticks: 3, label: "height" }}
          dims={[{ from: [0.12, 0.66], to: [0.38, 0.66], label: kind === "bridge" ? "span 40 m" : "crest 12 m", at: 10 }]} />
        <Callout t={t} at={30} point={failPoint} label={[1180, 560]} text="the failing part" sub="as reported" tone="fail" size={26} />
        <SpeedDial x={1440} y={110} size={230} value={40 + 150 * v} max={200} unit="km/h" redFrom={160} ticks={4} />
        <AltimeterTape x={1745} y={95} size={300} value={9000 - 7200 * v} step={500} unit="ft" floor={2500} />
        <CauseChain t={t} x={90} y={700} w={1150} size={30} links={[{ label: "ice on wing", at: 4 }, { label: "less lift", at: 14 }, { label: "nose drops", at: 24 }, { label: "spiral", at: 34 }]} broken={2} breakAt={44} />
        <LoadGauge x={90} y={850} size={560} value={30 + 60 * v} limit={70} unit="t" />
        <ListAngle x={760} y={800} size={210} deg={-4 - 40 * fail} limit={35} />
        <WaterLevel t={t} x={1040} y={790} size={220} value={2 + 9 * v} max={12} danger={9} unit="m" />
        <MissionClock t={t} x={1340} y={820} size={480} seconds={8 * 3600 + 31 * 60 + 4 + Math.floor(t / 30) * (t > 45 ? 0 : 2)} flag={t > 45 ? "paused" : "speed"} rate={2} />
        <text x={W / 2 + 120} y={60} textAnchor="middle" fontFamily={L.fonts.title} fontStyle="italic" fontSize={34} fill={L.muted}>{L.name}</text>
      </svg>
      <HonestyTag t={t} tag={t > 45 ? "paused" : "reconstruction"} at={0} />
    </AbsoluteFill>
  );
};

const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(SEGMENTS.length - 1, Math.floor(f / SEG));
  const seg = SEGMENTS[i]!;
  const t = f - i * SEG;
  return (
    <DisasterLookProvider value={seg.look}>
      <AbsoluteFill>
        <LookBackground />
        {t < SHEET ? <Sheet t={t} kind={seg.kind} /> : seg.card === "report" ? (
          <ReportPage t={t - SHEET} end={SEG - SHEET} agency="National Transportation Safety Board" report="Collapse of a highway bridge" page={37} date="2008-11-14" kind="Highway accident report"
            lines={["The probable cause of the collapse was the inadequate", "load capacity, due to a design error, of the gusset", "plates at the main truss, which failed under a", "combination of substantial increases in the weight", "of the bridge and the traffic and concentrated", "construction loads on the day of the collapse."]}
            hi={1} phrase="due to a design error" focusAt={0} hiAt={4} underAt={14} />
        ) : (
          <CauseBoard t={t - SHEET} title="Why it failed" titleAt={0}
            causes={[{ label: "Design error", detail: "gusset plates too thin", at: 2, verdict: "cause" }, { label: "Added weight", detail: "resurfacing over the years", at: 8, verdict: "factor" }, { label: "Corrosion", detail: "checked and excluded", at: 14, verdict: "ruled out" }]} />
        )}
        <Texture t={f} />
      </AbsoluteFill>
    </DisasterLookProvider>
  );
};

export const DisasterKitDemo: React.FC = () => <Composition id="DisasterKitDemo" component={Reel} durationInFrames={SEG * SEGMENTS.length} fps={30} width={W} height={H} />;
