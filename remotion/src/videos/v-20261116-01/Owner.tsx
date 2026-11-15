// Turn: "From April to June, with no new Grand Theft Auto out, its owner Take-Two still took $1.39B across all its games."
// Take-Two's boardroom high over the city at night: the wall calendar flips April to June, a spotlight hits an
// empty display stand on "no" and a red cross stamps its plaque, the boss's chair spins round on "owner", the
// big wall ticker counts to the figure on "took" and the boss leans back grinning, and on "games" the other
// game boxes on the shelves light up round the ticker.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, CityWindow, Display, Glow, INK, STROKE, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Spine } from "./props";

type Params = { fig?: { took?: string } };

const Owner: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const v = (p.beat.params as Params).fig?.took ?? "";
  const apr = m.at("april", 2), jun = m.at("june", 14), no = m.at("no", 30), owner = m.at("owner", 60), took = m.at("took", 74), games = m.at("games", 100);
  const close = m.lerp([no - 2, no + 12], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([owner, took + 6], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.15 + 0.45 * close - 0.6 * wide;
  const cx = 540 - 230 * close + 230 * wide, cy = 900 + 300 * close - 300 * wide;
  const k = m.lerp([took - 2, took + 20], [0, 1], Easing.out(Easing.cubic));
  const spin = m.lerp([owner - 2, owner + 10], [0, 1]);
  const lit = m.t >= games;
  return (
    <Stage p={p} bg="#0e0f26" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#22234a" />
        <CityWindow x={-260} y={160} w={420} h={880} seed="t2-a" />
        <CityWindow x={930} y={160} w={420} h={880} seed="t2-b" />
        <rect x={-400} y={1300} width={1880} height={900} fill="#3a2f4a" />
        {/* shelves of the company's other games */}
        {[260, 1000].map((y) => (
          <g key={y}>
            <rect x={200} y={y + 60} width={700} height={14} fill="#8a6a3a" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 9 }).map((_, i) => <g key={i} opacity={lit ? 1 : 0.35}><Spine x={215 + i * 76} y={y} w={56} h={60} tone={i + 1} /></g>)}
            {lit ? <Glow x={550} y={y + 30} r={360} color="#ffd23f" o={0.25 + m.wave(9, 0.05)} ry={80} /> : null}
          </g>
        ))}
        {/* the ticker: all of Take-Two's games, one quarter */}
        <Display x={230} y={400} w={640} h={280} label="TAKE-TWO, ALL GAMES" value={m.t < took - 2 ? "- - -" : countText(v, k)} color="#4dff9a" />
        {/* the calendar */}
        <rect x={230} y={720} width={240} height={220} rx={10} fill="#f4f1e8" stroke={INK} strokeWidth={STROKE} />
        <rect x={230} y={720} width={240} height={60} fill="#2a5bd7" stroke={INK} strokeWidth={4} />
        <Txt x={350} y={860} size={50} fill={INK}>{m.t < jun ? "APRIL" : m.t < jun + 6 ? "MAY" : "JUNE"}</Txt>
        {m.t >= apr && m.t < jun + 10 ? <rect x={230} y={780 - 160 * m.lerp([jun - 2, jun + 8], [0, 1])} width={240} height={160} fill="#f4f1e8" stroke={INK} strokeWidth={3} opacity={m.lerp([jun, jun + 10], [1, 0])} /> : null}
        {/* the empty stand where a new GTA would be */}
        <Glow x={250} y={1060} r={260} color="#fff1c9" o={0.55 * m.pop(no - 2, 12)} />
        <Block x={140} y={1120} w={220} h={190} fill="#c9c4d8" shadow="bottom" />
        <rect x={160} y={980} width={180} height={140} fill="none" stroke="#e8e1d4" strokeWidth={5} strokeDasharray="20 14" />
        <Tag x={100} y={1175} w={300} h={82} text="NEW GTA" bg="#ffcf4a" k={m.pop(no - 4, 10)} />
        {m.t >= no + 4 ? (
          <g transform={`translate(250 1215) scale(${1 + (1 - m.pop(no + 4, 9)) * 1.4})`}>
            <line x1={-110} y1={-50} x2={110} y2={50} stroke="#e0352b" strokeWidth={22} strokeLinecap="round" />
            <line x1={-110} y1={50} x2={110} y2={-50} stroke="#e0352b" strokeWidth={22} strokeLinecap="round" />
          </g>
        ) : null}
        {/* the boss in the chair */}
        <Block x={560} y={1220} w={420} h={60} fill="#5a3a26" />
        <g transform={`translate(780 1460)`}>
          <rect x={-120} y={-420} width={240} height={360} rx={40} fill="#2b2b33" stroke={INK} strokeWidth={STROKE} opacity={spin < 0.5 ? 1 : 0} />
        </g>
        {spin >= 0.5 ? (
          <Char x={780} y={1480 + m.wave(60, 3)} s={230} sit outfit="suit" top="#2f3445" pants="#2f3445" accent="#e0352b" hair="side" skin="#e2a679"
            face={m.t >= took ? "grin" : "smirk"} armL={[60, 40]} armR={m.t >= took ? [150, 160] : [60, 40]} tilt={m.t >= took ? -6 : 0} />
        ) : null}
      </View>
    </Stage>
  );
};

export default Owner;
