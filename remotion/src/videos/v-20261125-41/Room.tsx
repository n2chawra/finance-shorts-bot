// Room (flat, the operations room on the support ship, drawn on the instrument wall): the crew member at the
// console under the big tracking screen ("support"), leans in ("crew"), keys flash and a reply types on ("typed"),
// a second one ("another"), and the sub's side stays empty: a red cursor blinks, NO SIGNAL stamps over the depth
// bar ("Nothing"). The messages are the reported texts, on screen only.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ANTON, GREEN, ICE, MONO, moments, Person, ramp, RED, Screen, TypeText } from "./ui";

type Msg = { who: "SUB" | "SHIP"; text: string; at: number; red?: boolean };
const SX = 70, SY = 330, SW = 840, SH = 680;     // the screen on the wall

const Room: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const msgs: Msg[] = [
    { who: "SUB", text: "DROPPED TWO WTS", at: -100 },
    { who: "SHIP", text: "ACK", at: e("typed") },
    { who: "SHIP", text: "LOST TRACKING", at: e("another") },
    { who: "SUB", text: "", at: e("answer"), red: true },
  ];
  const shown = msgs.filter((x) => t >= x.at);
  const lost = ramp(t, e("answer"), 10);
  const lean = ramp(t, e("crew"), 10);
  const zc = ramp(t, e("reply"), 16) * (1 - ramp(t, e("answer"), 16));
  const zoom = 1.02 + 0.22 * zc + 0.015 * (t / Math.max(30, m.end));
  const cx = 540 + 110 * zc, cy = 880 - 120 * zc;
  const keyFlash = (i: number) => t >= e("typed") && t < e("typed") + 30 && Math.floor(t / 3 + i) % 4 === 0;
  return (
    <Screen t={t} zoom={zoom} cx={cx} cy={cy} tag="reported" tagSub="the messages as reported">
      {/* the wall clock */}
      <g transform="translate(860 250)">
        <circle r={58} fill="#06140c" stroke={GREEN} strokeWidth={5} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={ICE} strokeWidth={6} strokeLinecap="round" transform={`rotate(${120 + t * 0.05})`} />
        <line x1={0} y1={0} x2={0} y2={-48} stroke={AMBER} strokeWidth={4} strokeLinecap="round" transform={`rotate(${t * 1.2})`} />
      </g>
      {/* the big screen */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={16} fill="#020a06" stroke={GREEN} strokeWidth={6} />
      <TypeText x={SX + 34} y={SY + 66} t={t} at={-30} text="TRACKING · TITAN" size={48} color={GREEN} />
      {/* depth bar */}
      <rect x={SX + 40} y={SY + 110} width={90} height={530} rx={10} fill="#05180e" stroke={GREEN} strokeWidth={3} />
      <rect x={SX + 46} y={SY + 116} width={78} height={460} rx={6} fill={GREEN} opacity={0.25} />
      <circle cx={SX + 85} cy={SY + 576} r={22} fill={lost > 0.5 ? "#55665c" : AMBER} stroke="#ffffff" strokeWidth={4} />
      {/* the text log */}
      <rect x={SX + 170} y={SY + 110} width={630} height={530} rx={10} fill="#04110a" stroke={GREEN} strokeWidth={3} />
      {shown.map((x, i) => (
        <g key={i} transform={`translate(${SX + 190} ${SY + 130 + i * 126})`}>
          <rect x={0} y={0} width={590} height={110} rx={10} fill={x.who === "SUB" ? "#0c2618" : "#11201a"} stroke={x.red ? RED : x.who === "SUB" ? AMBER : GREEN} strokeWidth={4} />
          <text x={20} y={46} fontFamily={MONO} fontWeight={700} fontSize={44} fill={x.who === "SUB" ? AMBER : GREEN}>{x.who}</text>
          {x.text ? <TypeText x={20} y={96} t={t} at={x.at} text={x.text} size={46} color={ICE} cps={2.2} /> : <rect x={20} y={58} width={20} height={42} fill={RED} opacity={Math.floor(t / 7) % 2 ? 1 : 0} />}
        </g>
      ))}
      {lost > 0 && (
        <g transform={`translate(${SX + 112} ${SY + 540}) rotate(-90)`} opacity={lost}>
          <rect x={0} y={-70} width={330} height={96} fill="rgba(2,10,6,0.9)" stroke={RED} strokeWidth={6} />
          <text x={20} y={6} fontFamily={ANTON} fontSize={72} fill={RED}>NO SIGNAL</text>
        </g>
      )}
      {/* the console and the crew member */}
      <line x1={-100} y1={1330} x2={1180} y2={1330} stroke={GREEN} strokeWidth={4} />
      <rect x={120} y={1100} width={700} height={40} fill="#0b1a12" stroke={GREEN} strokeWidth={4} />
      <rect x={150} y={1140} width={24} height={190} fill={GREEN} opacity={0.6} />
      <rect x={770} y={1140} width={24} height={190} fill={GREEN} opacity={0.6} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={430 + i * 34} y={1080} width={26} height={16} rx={3} fill={keyFlash(i) ? AMBER : "#1b4a34"} />)}
      <Person x={560} y={1330} s={2.6} color="#2fbf7a" sit arm={30 + 40 * lean + (t >= e("typed") ? 8 * Math.sin(t * 0.9) : 0)} lean={10 * lean} />
      <TypeText x={110} y={1260} t={t} at={e("ship") - 4} text="SUPPORT SHIP · OPS" size={44} color={ICE} />
    </Screen>
  );
};

export default Room;
