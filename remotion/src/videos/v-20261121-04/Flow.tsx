// "Every day, about {fact1} barrels of oil sail through this one gap, a lane of sea between Iran's mountains and the
// tip of Oman." The strait close: the camera glides along the lane on "Every"; a sun crosses on "day"; barrels stack
// on the tankers' decks on "oil"; on "sail" the stream of tankers runs and a buoy counter counts the figure up; the
// shores press in on "gap"; the two-way lane draws on "lane"; Iran's mountains rise on "mountains"; Oman's tip glows.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { GOLD, Gulf, OMAN_TIP, Tanker } from "./props";

type Params = { fig?: { barrels?: string } };

const Buoy: React.FC<{ k: number; text: string; t: number }> = ({ k, text, t }) => {
  const xy = useAt()([55.6, 26.95]);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(540 ${560 + Math.sin(t / 9) * 4})`} opacity={Math.min(1, k * 2)}>
      <rect x={-330} y={-70} width={660} height={150} rx={24} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
      <Txt x={0} y={-30} size={50} fill={INK} weight={700}>BARRELS A DAY</Txt>
      <Txt x={0} y={34} size={72} fill="#b8352b">{text}</Txt>
    </g>
  );
};

const Mountains: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const pts: [number, number][] = [[55.6, 27.5], [56.3, 27.6], [57.0, 27.4], [57.7, 27.3]];
  return (
    <g>
      {pts.map((p, i) => {
        const xy = at(p);
        if (!xy || k <= 0) return null;
        const h = 120 * Math.min(1, Math.max(0, k * 1.5 - i * 0.15));
        return <path key={i} d={`M ${xy[0] - 80} ${xy[1]} L ${xy[0]} ${xy[1] - h} L ${xy[0] + 80} ${xy[1]} Z`} fill="#8a6a4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
      })}
    </g>
  );
};

const Flow: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.barrels ?? "";
  const ab = m.at("about", 14), br = m.at("barrels", 40), ev = m.at("every", 4), dy = m.at("day", 10), oi = m.at("oil", 24), sa = m.at("sail", 34), gp = m.at("gap", 70), ln = m.at("lane", 84), mt = m.at("mountains", 100), om = m.at("oman", 116);
  const glide = m.lerp([ev, m.end], [0, 1]);
  const pull = m.lerp([gp - 4, gp + 16], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[55.7 + 1.4 * glide, 26.3]} scale={14000 - 5000 * pull}
          colors={{ Iran: { fill: "#5f9b5a", trace: 1 }, Oman: { fill: "#c9543f", trace: 1, k: 0.6 + 0.4 * m.pulse(om + 8, 12) } }}>
          {m.t >= ln ? <MapRoute via={[[55.4, 26.25], [56.4, 26.45], [57.4, 25.95]]} k={m.lerp([ln, ln + 18], [0.05, 1])} color="#ffffff" width={8} /> : null}
          <Mountains k={m.lerp([mt, mt + 16], [0, 1])} />
          <MapLabel at={[55.0, 26.95]} text="IRAN" size={64} />
          <MapLabel at={[OMAN_TIP[0] + 0.1, OMAN_TIP[1] - 0.8]} text="OMAN" size={60} />
          <Ships t={m.t} run={m.lerp([sa, m.end], [0, 1])} barrels={m.lerp([oi, oi + 14], [0, 1])} />
          <Buoy k={m.pop(ab, 11) + 0.08 * m.pulse(br + 4, 6)} text={countText(n, m.lerp([ab, br], [0, 1]))} t={m.t} />
        </Gulf>
      </View>
      {dy > 0 ? <g opacity={Math.min(1, m.lerp([dy, dy + 8], [0, 1]))}><Ball x={180 + 720 * m.lerp([dy, m.end], [0, 1])} y={300 - 60 * Math.sin(Math.PI * m.lerp([dy, m.end], [0, 1]))} r={44} fill={GOLD} shadow={false} /></g> : null}
    </Stage>
  );
};

const Ships: React.FC<{ t: number; run: number; barrels: number }> = ({ t, run, barrels }) => {
  const at = useAt();
  const a = at([55.2, 26.2]), b = at([57.6, 25.9]);
  if (!a || !b) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const f = Math.min(1, ((i * 0.33 + run * 0.6 + t / 600) % 1));
        return <Tanker key={i} x={a[0] + (b[0] - a[0]) * f} y={a[1] + (b[1] - a[1]) * f + (i - 1) * 40} s={130} t={t} barrels={barrels} />;
      })}
    </g>
  );
};

export default Flow;
