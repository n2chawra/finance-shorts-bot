// Payoff: "पर आंदोलन के दिनों में लोग अपनी गाड़ियों पर टी जी लिखते थे। इसलिए {fact4} में नई गाड़ियों का कोड बन गया टी जी।"
// Two places, cut on "नई" with a white flash. 1) Telangana in the movement years: the map turns to old paper, plain
// flags wave, people stand along a road, TG is brushed onto the cars, a calendar with the year drops in. 2) Today: a
// new car rolls in under the big plate, and on "बन" the plate flips from TS to TG with a punch.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion, type Motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import type { StateFx } from "../../flat/india";
import { Car, F, MapView, OldPlates, TEL, doneBefore, lerpFrame, painted, type Frame, type LL } from "./props";
import { Calendar, Flag, FlipPlate, PaintedCar, Person, TEL_C, mixHex } from "./extra";

type Params = { fig?: { year?: string } };

const FLAGS: { ll: LL; color: string }[] = [
  { ll: [77.9, 19.2], color: "#f08a3c" }, { ll: [78.9, 19.5], color: "#5fae6a" },
  { ll: [79.9, 19.0], color: "#e66aa0" }, { ll: [80.8, 18.4], color: "#f08a3c" },
];
const ROAD: [LL, LL] = [[77.6, 18.3], [80.5, 18.8]];
const SHIRTS = ["#3d8bd9", "#f08a3c", "#5fae6a", "#e66aa0", "#ffc43d", "#b467c9", "#2fb5a5"];
const CARS: { ll: LL; color: string }[] = [{ ll: [78.0, 16.5], color: "#3d8bd9" }, { ll: [80.4, 17.1], color: "#e8453c" }];

/** The movement years on the map: road, people, flags, cars with TG brushed on. */
const Movement: React.FC<{ m: Motion; an: number; lo: number; lt: number }> = ({ m, an, lo, lt }) => {
  const at = useAt();
  const a = at(ROAD[0]), b = at(ROAD[1]);
  const road = m.lerp([lo - 4, lo + 14], [0, 1]);
  return (
    <g>
      {a && b && road > 0 ? (
        <g>
          <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * road} y2={a[1] + (b[1] - a[1]) * road} stroke="#1d1a2b" strokeWidth={30} strokeLinecap="round" opacity={0.85} />
          <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * road} y2={a[1] + (b[1] - a[1]) * road} stroke="#c9b48a" strokeWidth={20} strokeLinecap="round" />
        </g>
      ) : null}
      {a && b ? SHIRTS.map((c, i) => {
        const f = (i + 0.5) / SHIRTS.length;
        return <Person key={i} x={a[0] + (b[0] - a[0]) * f} y={a[1] + (b[1] - a[1]) * f - 8} s={56} shirt={c} t={m.t} phase={i * 1.3}
          k={m.pop(lo + i * 2, 12)} arm={i % 2 === 0} />;
      }) : null}
      {FLAGS.map((fl, i) => {
        const xy = at(fl.ll);
        return xy ? <Flag key={i} x={xy[0]} y={xy[1]} h={140} color={fl.color} t={m.t} phase={i * 1.1} k={m.lerp([an + i * 3, an + i * 3 + 10], [0, 1])} /> : null;
      })}
      {CARS.map((c, i) => {
        const xy = at(c.ll);
        if (!xy) return null;
        const k = m.pop(lo + 4 + i * 4, 14);
        return k > 0 ? (
          <g key={i} opacity={Math.min(1, k * 2)}>
            <PaintedCar x={xy[0] - (1 - Math.min(1, k)) * 220} y={xy[1]} s={280} color={c.color} t={m.t + i * 9} text="TG"
              brush={m.lerp([lt + i * 6, lt + i * 6 + 14], [0, 1])} />
          </g>
        ) : null;
      })}
    </g>
  );
};

/** Today: the big plate on Telangana flips from TS to TG. */
const Today: React.FC<{ m: Motion; ban: number }> = ({ m, ban }) => (
  <g>
    <g data-probe="skip"><OldPlates names={doneBefore("payoff")} /></g>
    <FlipPlate at={TEL_C} from="TS" to="TG" flip={m.lerp([ban - 1, ban + 8], [0, 1])} size={1.4} dy={-290}
      glow={m.pulse(ban + 8, 14)} wob={m.wave(40, 1.2)} />
  </g>
);

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const an = m.at("andolan", 6), lo = m.at("log", 26), lt = m.at("likhte", 44), is = m.at("isliye", 64), na = m.at("nayi", 100), ban = m.at("ban", 118);
  const old = m.t < na;
  const paper = m.lerp([an - 2, an + 14], [0, 1]);
  let frame: Frame, states: Record<string, StateFx>, sheet: string, dim: number;
  if (old) {
    frame = lerpFrame(F.tel, F.telWide, 0.12 + m.lerp([is, is + 24], [0, 0.4]) + m.lerp([0, na], [0, 0.04]));
    const fade = Object.fromEntries(Object.entries(painted(doneBefore("payoff"))).map(([n, f]) => [n, { ...f, k: 1 - paper }]));
    states = { ...(paper < 1 ? fade : {}), [TEL]: { fill: "#ffc43d", lift: 0.3 } };
    sheet = mixHex("#f3ead6", "#e8d9b0", paper);
    dim = 0.5 + 0.15 * paper;
  } else {
    frame = lerpFrame(F.tel, F.telWide, m.lerp([na, m.end], [0.06, 0]));
    states = { ...painted(doneBefore("payoff")), [TEL]: { fill: "#ffc43d", lift: 0.4 + 0.4 * m.pulse(ban + 3, 10) } };
    sheet = "#f3ead6";
    dim = 0.45;
  }
  const carIn = m.lerp([na, na + 22], [0, 1]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.008) + (old ? m.lerp([0, na], [0, 0.03]) : 0.04 * m.pulse(ban + 2, 7))}>
        <MapView frame={frame} states={states} sheet={sheet} dim={dim}>
          {old ? <Movement m={m} an={an} lo={lo} lt={lt} /> : <Today m={m} ban={ban} />}
        </MapView>
        {old ? null : (
          <Car x={-320 + 820 * carIn + m.lerp([na + 22, m.end], [0, 30])} y={1060} s={300} color="#e8453c" t={m.t} code="TG" painted={m.lerp([ban, ban + 8], [0, 1])} />
        )}
      </View>
      {old ? <rect x={0} y={0} width={1080} height={1920} fill="#7a5a2a" opacity={0.13 * paper} /> : null}
      <Calendar x={540} y={old ? 200 : 210} k={m.pop(is, 12)} year={year} label="साल" t={m.t} />
      <Flash k={m.pulse(na, 6)} />
    </Stage>
  );
};

export default Payoff;
