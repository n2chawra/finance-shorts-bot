// Board (flat): the investigators' room at night: a wall with a big corkboard under a desk lamp's pool of light,
// a drawing of the airliner and a map pinned at the corners, and the case's cards pinned in the middle. Modes
// (params.mode): chain (the promise: four cards pin on their words, red string runs card to card, the last
// string snaps), recap (three cards stamped, the fourth pin blinking over an empty space), factors (the board's
// four contributing factors pinned and stamped), pusher (two findings about the stick pusher), score (the
// closing scorecard). No figures.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { AMBER, ANTON, FlatTag, ICE, moments, ramp, RED, Sheet, TypeText } from "./ui";

type Params = { mode?: string };
type Card = { text: string; at: number; stamp?: string; red?: boolean };

const Pinned: React.FC<{ x: number; y: number; w: number; h: number; t: number; c: Card; rot: number }> = ({ x, y, w, h, t, c, rot }) => {
  const k = ramp(t, c.at, 10);
  if (k <= 0) return null;
  const sk = c.stamp ? ramp(t, c.at + 14, 6) : 0;
  const lines = c.text.split("\n");
  return (
    <g transform={`translate(${x} ${y - (1 - k) * 40}) rotate(${rot})`} opacity={k}>
      <rect x={6} y={8} width={w} height={h} fill="rgba(0,0,0,0.35)" />
      <rect x={0} y={0} width={w} height={h} fill="#f4f1e8" />
      <circle cx={w / 2} cy={14} r={11} fill={c.red ? RED : AMBER} stroke="#3a2a10" strokeWidth={3} />
      {lines.map((l, i) => <TypeText key={i} x={22} y={66 + i * 46} t={t} at={c.at + i * 10} text={l} size={36} color="#111111" />)}
      {sk > 0 && (
        <g transform={`translate(${w - 150} ${h - 52}) rotate(-8) scale(${1.6 - 0.6 * sk})`} opacity={sk}>
          <rect x={-10} y={-40} width={170} height={56} rx={6} fill="none" stroke={c.red ? RED : "#b5651d"} strokeWidth={6} />
          <text x={75} y={2} textAnchor="middle" fontFamily={ANTON} fontSize={40} fill={c.red ? RED : "#b5651d"}>{c.stamp}</text>
        </g>
      )}
    </g>
  );
};

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const mode = (p.beat.params as Params).mode ?? "chain";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  let title = "";
  let cards: Card[] = [];
  let string = false, snapAt = 1e9, blinkAt = 1e9;
  if (mode === "chain") {
    title = "ONE CRASH · FOUR LINKS";
    cards = [{ text: "SPEED SET\nTOO LOW", at: e("airspeed") }, { text: "TALK BELOW\nTEN THOUSAND", at: e("talk") }, { text: "WARNING\nNOT CALLED", at: e("warning") }, { text: "ONE WRONG\nREFLEX", at: e("reflex"), red: true }];
    string = true; snapAt = e("reflex");
  } else if (mode === "recap") {
    title = "SO FAR";
    cards = [{ text: "THE SPEED", at: e("speed"), stamp: "LAPSE" }, { text: "THE TALK", at: e("talk"), stamp: "LAPSE" }, { text: "THE CUE", at: e("cue"), stamp: "LAPSE" }];
    string = true; blinkAt = e("fourth");
  } else if (mode === "factors") {
    title = "CONTRIBUTING FACTORS";
    cards = [{ text: "SPEED NOT\nWATCHED", at: e("speed"), stamp: "FACTOR" }, { text: "STERILE COCKPIT\nNOT KEPT", at: e("sterile"), stamp: "FACTOR" },
      { text: "FLIGHT NOT\nMANAGED", at: e("managed"), stamp: "FACTOR" }, { text: "ICE SPEED\nPROCEDURES", at: e("procedures"), stamp: "FACTOR" }];
  } else if (mode === "pusher") {
    title = "THE STICK PUSHER";
    cards = [{ text: "ITS PUSH NOT\nSEEN AS RECOVERY", at: e("recognise"), stamp: "FINDING" }, { text: "OVERRIDING IT\nMADE IT WORSE", at: e("worse"), stamp: "FINDING", red: true }];
  } else {
    title = "FOUR LINKS · ONE CRASH";
    cards = [{ text: "SPEED TOO LOW\nFOR THE ICE", at: e("airspeed"), stamp: "FACTOR" }, { text: "TALK BELOW\nTEN THOUSAND", at: e("Talk"), stamp: "FACTOR" },
      { text: "WARNING BAND\nNOT CALLED", at: e("band"), stamp: "FACTOR" }, { text: "ONE PULL THE\nWRONG WAY", at: e("pull"), stamp: "CAUSE", red: true }];
  }
  const n = Math.max(cards.length, mode === "recap" ? 4 : 0);
  const cw = n <= 2 ? 560 : 330, ch = 210;
  const gap = n <= 2 ? 120 : 40;
  const x0 = 960 - (n * cw + (n - 1) * gap) / 2;
  const pos = Array.from({ length: n }, (_, i) => [x0 + i * (cw + gap), 400 + (i % 2) * 70] as [number, number]);
  const push = ramp(t, cards[Math.min(1, cards.length - 1)]!.at, 20) * (1 - ramp(t, cards[cards.length - 1]!.at + 10, 20) * 0.6);
  const zoom = 1.02 + 0.08 * push + 0.02 * (t / end);
  return (
    <Sheet t={t} zoom={zoom} cx={960} cy={520} grid={false} html={<FlatTag t={t} tag="reported" at={0} sub="the investigation, from the NTSB report" />}>
      {/* the room: wall, the corkboard in its frame, a lamp's pool of light, the desk edge */}
      <rect x={-200} y={-200} width={2400} height={1500} fill="#1a2027" />
      <rect x={110} y={110} width={1700} height={760} rx={10} fill="#5e4a33" stroke="#2a1f14" strokeWidth={18} />
      {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={130 + ((i * 197) % 1660)} cy={130 + ((i * 113) % 720)} r={3 + (i % 3)} fill="#4f3d29" />)}
      <ellipse cx={960} cy={380} rx={820} ry={420} fill="#ffe2a8" opacity={0.12} />
      <rect x={-200} y={900} width={2400} height={400} fill="#2c2219" />
      {/* the drawing of the airliner and the map, pinned in the corners */}
      <g transform="translate(170 150) rotate(-3)">
        <rect x={0} y={0} width={300} height={170} fill="#dfe8ee" />
        <path d="M 30 100 L 250 100 Q 275 100 275 88 L 60 80 Z M 110 80 L 200 80 L 190 60 L 120 60 Z M 40 92 L 30 50 L 50 50 L 60 90 Z" fill="none" stroke="#1f3b5c" strokeWidth={4} />
        <circle cx={150} cy={12} r={9} fill={ICE} />
      </g>
      <g transform="translate(1460 150) rotate(3)">
        <rect x={0} y={0} width={300} height={170} fill="#cfd8c8" />
        <path d="M 20 120 Q 90 60 150 90 T 280 60" stroke="#5b6b5c" strokeWidth={5} fill="none" />
        <circle cx={70} cy={98} r={10} fill={RED} /><circle cx={230} cy={72} r={10} fill={AMBER} />
        <circle cx={150} cy={12} r={9} fill={ICE} />
      </g>
      <TypeText x={960} y={300} t={t} at={0} text={title} size={52} color="#f4f1e8" anchor="middle" font={ANTON} cps={2} />
      {/* red string from card to card */}
      {string && pos.slice(1).map((q, i) => {
        const a = pos[i]!;
        const on = ramp(t, (cards[i + 1] ?? { at: blinkAt }).at, 10);
        if (on <= 0) return null;
        const snapped = i === n - 2 && t >= snapAt;
        const mx = (a[0] + cw + q[0]) / 2;
        return snapped
          ? <g key={i}><path d={`M ${a[0] + cw / 2} ${a[1] + 14} L ${mx - 20} ${(a[1] + q[1]) / 2 + 60}`} stroke={RED} strokeWidth={5} fill="none" /><path d={`M ${mx + 20} ${(a[1] + q[1]) / 2 + 70} L ${q[0] + cw / 2} ${q[1] + 14}`} stroke={RED} strokeWidth={5} fill="none" /></g>
          : <path key={i} d={`M ${a[0] + cw / 2} ${a[1] + 14} Q ${mx} ${(a[1] + q[1]) / 2 + 40 * on} ${a[0] + cw / 2 + (q[0] - a[0]) * on} ${a[1] + 14 + (q[1] - a[1]) * on}`} stroke="#c22a22" strokeWidth={5} fill="none" />;
      })}
      {cards.map((c, i) => <Pinned key={i} x={pos[i]![0]} y={pos[i]![1]} w={cw} h={ch} t={t} c={c} rot={[-2, 1.5, -1, 2][i % 4]!} />)}
      {mode === "recap" && t >= blinkAt && (
        <g transform={`translate(${pos[3]![0]} ${pos[3]![1]})`}>
          <rect x={0} y={0} width={cw} height={ch} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="22 14" opacity={Math.floor(t / 6) % 2 ? 1 : 0.35} />
          <text x={cw / 2} y={ch / 2 + 30} textAnchor="middle" fontFamily={ANTON} fontSize={90} fill={RED}>?</text>
          <circle cx={cw / 2} cy={14} r={11} fill={RED} />
        </g>
      )}
    </Sheet>
  );
};

export default Board;
