// "And what it waits for is a kettle. When a big final ends on TV, millions of people get up and switch one
// on, all at once." The light flips to a warm living-room night over Britain: a big kettle drops onto
// London; the camera pulls out as a TV over the map shows the final whistle; little people pop up by every
// city on "millions"; kettles switch on city after city on "switch"; a demand gauge swings to red on "once".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { Britain, CITIES, CityLights, Kettle, LONDON, RED } from "./props";

const AtCities: React.FC<{ people: (i: number) => number; kettles: (i: number) => number; t: number }> = ({ people, kettles, t }) => {
  const at = useAt();
  return (
    <g>
      {CITIES.map((c, i) => {
        const xy = at(c.at);
        if (!xy) return null;
        const pk = people(i), kk = kettles(i);
        return (
          <g key={c.name}>
            {pk > 0 ? <Char x={xy[0] - 40} y={xy[1] + 10 - (1 - Math.min(1, pk)) * 30} s={34} face="happy" armR={[160 * Math.min(1, pk), 10]} armL={[20, 10]} /> : null}
            {kk > 0 ? <g transform={`translate(0 ${(1 - Math.min(1, kk)) * -60})`}><Kettle x={xy[0] + 40} y={xy[1] + 10} s={46} steam={kk > 0.9 ? 1 : 0} t={t} lit={Math.min(1, kk)} /></g> : null}
          </g>
        );
      })}
    </g>
  );
};

const BigKettle: React.FC<{ k: number; t: number; shrink: number }> = ({ k, t, shrink }) => {
  const xy = useAt()(LONDON);
  if (!xy || k <= 0) return null;
  return <g transform={`translate(0 ${(1 - Math.min(1, k)) * -300})`}><Kettle x={xy[0]} y={xy[1] + 10} s={260 - 200 * shrink} t={t} /></g>;
};

const Gauge: React.FC<{ x: number; y: number; k: number; v: number }> = ({ x, y, k, v }) => {
  if (k <= 0) return null;
  const a = -80 + 160 * v;
  return (
    <g opacity={Math.min(1, k * 2)} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * Math.min(1, k)})`}>
      <Block x={-190} y={-170} w={380} h={240} fill="#fff6dc" r={20} />
      <path d="M -130 30 A 130 130 0 0 1 130 30" fill="none" stroke="#3a9d5d" strokeWidth={26} />
      <path d="M 60 -86 A 130 130 0 0 1 130 30" fill="none" stroke={RED} strokeWidth={26} />
      <Limb a={[0, 30]} b={[Math.sin((a * Math.PI) / 180) * 115, 30 - Math.cos((a * Math.PI) / 180) * 115]} w={10} color={INK} sw={2} />
      <Txt x={0} y={-130} size={46} fill={INK}>DEMAND</Txt>
    </g>
  );
};

const Tv: React.FC<{ k: number; whistle: number; flash: number }> = ({ k, whistle, flash }) => {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)} transform={`translate(560 ${330 - (1 - Math.min(1, k)) * 120})`}>
      <Block x={-230} y={-150} w={460} h={290} fill="#1d1a2b" r={20} />
      <rect x={-205} y={-125} width={410} height={240} fill="#3f9d4a" />
      <rect x={-205} y={-10} width={410} height={6} fill="#ffffff" opacity={0.8} />
      <rect x={-205} y={-125} width={410} height={240} fill="#ffffff" opacity={0.6 * flash} />
      <circle cx={0} cy={-8} r={40} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.8} />
      <Txt x={0} y={70} size={52} fill="#ffffff" stroke={INK}>{whistle > 0 ? "FULL TIME" : "THE FINAL"}</Txt>
    </g>
  );
};

const Kettles: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wt = m.at("waits", 10), en = m.at("ends", 70), pe = m.at("people", 110);
  const ke = m.at("kettle", 30), fi = m.at("final", 60), tv = m.at("tv", 80), mi = m.at("millions", 100), sw = m.at("switch", 130), on = m.at("once", 160);
  const out = m.lerp([fi - 4, fi + 20], [0, 1]);
  return (
    <Stage p={p} bg="#0e1b36" vignette={0.35}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <Britain center={[-0.9 - 2.1 * out, 52.2 + 1.6 * out]} scale={14000 - 9800 * out} night={1}>
          <CityLights each={(i) => m.lerp([sw + i * 2, sw + i * 2 + 6], [0.15, 1])} />
          <AtCities people={(i) => m.pop(mi + i * 2, 12) * (1 + 0.4 * m.pulse(pe + 4 + i, 6))} kettles={(i) => m.pop(sw + i * 2, 12)} t={m.t} />
          <g transform={`rotate(${6 * Math.sin(m.t / 2) * m.pulse(wt + 6, 10)} 540 960)`}><BigKettle k={m.pop(ke - 8, 12)} t={m.t} shrink={out} /></g>
        </Britain>
      </View>
      <Tv k={m.pop(fi, 12)} whistle={m.t >= en ? 1 : 0} flash={m.pulse(tv + 3, 6)} />
      <Gauge x={290} y={1180} k={m.pop(on - 6, 12)} v={m.lerp([on, on + 14], [0.2, 0.97]) + m.wave(6, 0.01)} />
    </Stage>
  );
};

export default Kettles;
