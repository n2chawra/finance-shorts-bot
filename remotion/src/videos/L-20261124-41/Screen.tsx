// Screen (flat, the operations room on the Polar Prince, drawn as an engineer's cross-section of the room):
// the mission director at the console, the big tracking screen with the depth bar, the depth readout, the
// text-message list and an analog clock (no numerals). Modes (params.mode): track, lastmsg, comms,
// lastmsgdeep, silence, hours. The messages are the reported texts (on screen, never in the voice).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { FlatTag, BLUE, clamp, figOf, ICE, INK, MONO, moments, Person, ramp, RED, Sheet, TypeText } from "./ui";

type Params = { mode?: string };
const SX = 640, SY = 150, SW = 1160, SH = 700;   // the screen on the wall

type Msg = { who: "SUB" | "SHIP"; text: string; at: number; red?: boolean };

const Screen: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "track";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const f = (n: string) => figOf(p, n);
  const end = Math.max(30, m.end);
  // depth bar: how far down the sub's dot is (0 surface → 1 seabed)
  const depthK = mode === "track" ? 0.25 + 0.45 * ramp(t, e("sinking"), 60) : mode === "comms" ? 0.2 + 0.3 * ramp(t, e("screen"), end) : mode === "lastmsg" || mode === "lastmsgdeep" ? 0.86 : 0.86;
  const lost = mode === "silence" ? ramp(t, e("Silence"), 10) : mode === "hours" || mode === "plan" ? 1 : mode === "lastmsg" ? ramp(t, e("Nothing"), 10) : 0;
  const msgs: Msg[] = [];
  if (mode === "comms") msgs.push({ who: "SHIP", text: "COMMS CHECK", at: e("minutes") }, { who: "SUB", text: "OK", at: e("messages") });
  if (mode === "lastmsg" || mode === "lastmsgdeep") msgs.push({ who: "SUB", text: "DROPPED TWO WTS", at: e(mode === "lastmsg" ? "sends" : "message") });
  if (mode === "lastmsg") msgs.push({ who: "SHIP", text: "ACK", at: e("answers") }, { who: "SUB", text: "", at: e("Nothing"), red: true });
  if (mode === "silence") msgs.push({ who: "SUB", text: "DROPPED TWO WTS", at: -100 }, { who: "SHIP", text: "ACK", at: e("replies") }, { who: "SHIP", text: "LOST TRACKING", at: e("again") }, { who: "SHIP", text: "LOST TRACKING", at: e("again") + 14 });
  if (mode === "plan") msgs.push({ who: "SHIP", text: "LOST TRACKING", at: -100 }, { who: "SHIP", text: "LOST TRACKING", at: e("never") });
  if (mode === "hours") msgs.push({ who: "SHIP", text: "LOST TRACKING", at: -100 }, { who: "SHIP", text: "LOST TRACKING", at: e("sending") }, { who: "SHIP", text: "LOST TRACKING", at: e("sending") + 10 }, { who: "SHIP", text: "LOST TRACKING", at: e("sending") + 20 });
  const shown = msgs.filter((x) => t >= x.at);
  // the clock: hands turn; faster in "hours"
  const clockRate = mode === "hours" ? (t >= e("hours") ? 0.6 : 0.02) : mode === "plan" ? (t >= e("hour") ? 0.9 : 0.02) : 0.02;
  const minute = (t >= e("minute") && mode === "silence" ? 1 : 0) * Math.min(1, (t - e("minute")) / 10) * 6 + t * clockRate;
  // camera: medium on the room, close on the screen part the line is about
  const closeOn = mode === "track" ? e("screen") : mode === "lastmsg" ? e("ship") : mode === "comms" ? e("depth") : mode === "lastmsgdeep" ? 0 : mode === "silence" ? e("answer") : mode === "plan" ? e("hour") : e("acoustic");
  const zk = ramp(t, closeOn, 18);
  const zoom = 1.0 + 0.24 * zk + 0.02 * (t / end);
  const cx = 960 + (mode === "lastmsg" || mode === "lastmsgdeep" || mode === "silence" ? 230 : 120) * zk;
  const cy = 540 - 40 * zk;
  const depthVal = mode === "lastmsg" || mode === "lastmsgdeep" ? f("depth") : "";
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={<FlatTag t={t} tag="as reported" at={0} sub="the messages as reported" />}>
      {/* the room: floor line, desk, the director */}
      <line x1={0} y1={930} x2={1920} y2={930} stroke={INK} strokeWidth={4} />
      <rect x={130} y={720} width={520} height={30} fill="#e3e5e8" stroke={INK} strokeWidth={4} />
      <rect x={160} y={750} width={20} height={180} fill={INK} />
      <rect x={600} y={750} width={20} height={180} fill={INK} />
      <rect x={250} y={600} width={220} height={120} rx={8} fill="#0b1824" stroke={INK} strokeWidth={4} />
      <rect x={265} y={615} width={190} height={88} fill={lost > 0.5 ? "#2a0c0c" : "#0f3550"} />
      <Person x={420} y={930} s={2.4} color="#3e5a78" sit arm={t >= e("support") || mode !== "track" ? 40 + 8 * Math.sin(t * 0.2) : 10} />
      <Person x={180} y={930} s={2.4} color="#6d747c" k={mode === "hours" || mode === "silence" || mode === "plan" ? 1 : 0} arm={mode === "plan" && t >= e("up") ? 70 : 20} />
      {/* the big screen */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={16} fill="#06131f" stroke={INK} strokeWidth={8} />
      <TypeText x={SX + 40} y={SY + 60} t={t} at={0} text={mode === "track" ? `TRACKING · JUNE ${f("day")}, ${f("year")}` : "TRACKING · TITAN"} size={36} color={ICE} />
      {/* depth bar */}
      <rect x={SX + 60} y={SY + 100} width={90} height={540} rx={10} fill="#0d2a40" stroke="#3a6a9a" strokeWidth={4} />
      <rect x={SX + 66} y={SY + 106} width={78} height={528 * clamp(depthK)} rx={6} fill="#1f6fd1" opacity={0.6} />
      <rect x={SX + 52} y={SY + 620} width={106} height={14} fill={mode === "track" ? (t >= e("Titanic") ? RED : "#3a6a9a") : RED} />
      <circle cx={SX + 105} cy={SY + 106 + 528 * clamp(depthK)} r={20} fill={lost > 0.5 ? "#6d747c" : "#ffd27a"} stroke="#fff" strokeWidth={4} />
      <TypeText x={SX + 190} y={SY + 645} t={t} at={mode === "track" ? e("Titanic") : 0} text="WRECK" size={34} color={RED} />
      {/* depth readout */}
      {depthVal && (
        <g>
          <text x={SX + 200} y={SY + 150} fontFamily={MONO} fontWeight={700} fontSize={32} fill={ICE}>DEPTH · METRES</text>
          <text x={SX + 200} y={SY + 250} fontFamily="Anton, Poppins, sans-serif" fontSize={96} fill="#ffd27a">{countText(depthVal, ramp(t, 0, 24))}</text>
        </g>
      )}
      {mode === "track" && t >= e("Titanic") && (
        <g>
          <text x={SX + 200} y={SY + 150} fontFamily={MONO} fontWeight={700} fontSize={32} fill={ICE}>WRECK · METRES</text>
          <text x={SX + 200} y={SY + 250} fontFamily="Anton, Poppins, sans-serif" fontSize={96} fill={RED}>{countText(f("wreck"), ramp(t, e("Titanic"), 20))}</text>
        </g>
      )}
      {/* messages */}
      <rect x={SX + 560} y={SY + 100} width={560} height={540} rx={10} fill="#0a1a28" stroke="#3a6a9a" strokeWidth={3} />
      <text x={SX + 590} y={SY + 150} fontFamily={MONO} fontWeight={700} fontSize={32} fill={ICE}>TEXT LINK</text>
      {shown.slice(-5).map((x, i) => (
        <g key={i} transform={`translate(${SX + 590} ${SY + 200 + i * 90})`}>
          <rect x={0} y={0} width={500} height={72} rx={8} fill={x.who === "SUB" ? "#12324d" : "#1a2733"} stroke={x.red ? RED : x.who === "SUB" ? "#ffd27a" : "#6f8aa3"} strokeWidth={4} />
          <text x={18} y={48} fontFamily={MONO} fontWeight={700} fontSize={30} fill={x.who === "SUB" ? "#ffd27a" : ICE}>{x.who}</text>
          {x.text ? <TypeText x={110} y={48} t={t} at={x.at} text={x.text} size={30} color="#ffffff" cps={2} /> : <rect x={110} y={22} width={16} height={34} fill={RED} opacity={Math.floor(t / 8) % 2 ? 1 : 0} />}
        </g>
      ))}
      {/* weights dropping (the last message) */}
      {(mode === "lastmsg" || mode === "lastmsgdeep") && [0, 1].map((i) => {
        const at = e("weights") + i * 6;
        const k = clamp((t - at) / 20);
        return t >= at ? <rect key={i} x={SX + 290 + i * 70} y={SY + 330 + k * 240} width={44} height={60} rx={8} fill="#6d747c" stroke="#fff" strokeWidth={3} opacity={1 - k * 0.6} /> : null;
      })}
      {mode === "lastmsgdeep" && t >= e("normal") && <circle cx={SX + 470} cy={SY + 380} r={22} fill="#39d98a" />}
      {/* status: lost tracking */}
      {lost > 0 && <text x={SX + 200} y={SY + 330} fontFamily="Anton, Poppins, sans-serif" fontSize={64} fill={RED} opacity={lost}>NO SIGNAL</text>}
      {mode === "hours" && t >= e("believed") && <TypeText x={SX + 200} y={SY + 420} t={t} at={e("believed")} text="COMMS FAULT?" size={40} color="#ffd27a" />}
      {mode === "hours" && [0, 1, 2, 3].map((i) => <rect key={i} x={SX + 200 + i * 40} y={SY + 520 - i * 24} width={28} height={40 + i * 24} fill={t >= e("acoustic") && Math.floor(t / 6 + i) % 3 === 0 ? "#3a4a5a" : "#1a2530"} stroke="#6f8aa3" strokeWidth={2} />)}
      {mode === "plan" && (
        <g opacity={ramp(t, e("plan"), 10)} transform={`translate(${SX + 190} ${SY + 380})`}>
          <rect x={0} y={0} width={330} height={230} fill="#ffffff" stroke={INK} strokeWidth={4} />
          <text x={20} y={50} fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>DIVE PLAN</text>
          <rect x={14} y={80} width={302 * ramp(t, e("Titan"), 12)} height={50} fill="#ffe66d" opacity={0.8} />
          <text x={20} y={118} fontFamily={MONO} fontWeight={700} fontSize={30} fill={INK}>NO CONTACT:</text>
          <text x={20} y={180} fontFamily={MONO} fontWeight={700} fontSize={30} fill={RED}>ASCEND</text>
        </g>
      )}
      {mode === "plan" && t >= e("never") && <TypeText x={SX + 200} y={SY + 160} t={t} at={e("never")} text="SURFACE: NOTHING" size={40} color={RED} />}
      {/* the analog clock on the wall, no numerals */}
      <g transform="translate(300 300)">
        <circle r={110} fill="#ffffff" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-92} x2={0} y2={-78} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={0} y2={-56} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${300 + minute * 0.5})`} />
        <line x1={0} y1={0} x2={0} y2={-86} stroke={BLUE} strokeWidth={6} strokeLinecap="round" transform={`rotate(${minute * 6})`} />
        <circle r={8} fill={INK} />
      </g>
    </Sheet>
  );
};

export default Screen;
