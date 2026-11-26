// Cabin (flat): a cut-away of the airliner's cabin on the night sheet: the fuselage drawn in section from the
// side, the flight deck at the nose, seat rows that fill with small figures on the word (two pilots, two
// flight attendants, the passengers), reading lights glowing warm, and the count on a plate by the door.
// People are shown going home, never hurt. The figure comes from params.fig.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { rnd } from "../../three/index";
import { AMBER, ANTON, figOf, FlatTag, ICE, INK, MONO, moments, Person, ramp, Sheet, TypeText } from "./ui";

const Cabin: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(30, m.end);
  const draw = ramp(t, e("aboard") - 10, 24);
  const pilots = ramp(t, e("pilots"), 10), fa = ramp(t, e("attendants"), 10), pax = ramp(t, e("passengers"), 30), warm = ramp(t, e("home"), 20);
  const zIn = ramp(t, e("pilots"), 18), zOut = ramp(t, e("home"), 20);
  const zoom = 1.02 + 0.2 * zIn * (1 - zOut) + 0.02 * (t / end);
  const cx = 960 + 120 * zIn * (1 - zOut), cy = 520;
  const rows = 18, seats = 4;
  const aboard = figOf(p, "aboard");
  return (
    <Sheet t={t} zoom={zoom} cx={cx} cy={cy} html={<FlatTag t={t} tag="reconstruction" at={0} sub="cabin layout simplified" />}>
      {/* the fuselage in section */}
      <path d="M 160 400 L 1500 400 Q 1700 400 1780 520 Q 1700 640 1500 640 L 160 640 Q 90 640 80 600 L 40 430 Q 60 400 160 400 Z" fill="#1a222b" stroke={INK} strokeWidth={6}
        strokeDasharray={5200} strokeDashoffset={5200 * (1 - draw)} />
      <rect x={180} y={420} width={1300} height={200} fill={`rgba(255,196,107,${0.06 + 0.12 * warm})`} opacity={draw} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: seats }, (_, s) => {
        const x = 230 + r * 70, y = 440 + s * 46 + (s > 1 ? 16 : 0);
        const i = r * seats + s;
        const fill = rnd("pax", i) < 0.72 ? 1 : 0;
        const k = Math.max(0, Math.min(1, pax * (rows * seats) / 18 - (i % 18) * 0.05 - Math.floor(i / 18) * 0.25));
        return (
          <g key={i} opacity={draw}>
            <rect x={x - 18} y={y - 14} width={36} height={30} rx={6} fill="#3a4652" />
            {fill > 0 && k > 0 && <circle cx={x} cy={y - 2} r={12} fill={["#c9b79c", "#8aa2b8", "#b0928a", "#9fb59a", "#d8c7a8"][i % 5]} opacity={k} />}
            {warm > 0 && s % 2 === 0 && <circle cx={x + 6} cy={y - 24} r={5} fill="#ffd58a" opacity={warm * (0.6 + 0.4 * Math.sin(t * 0.2 + i))} />}
          </g>
        );
      }))}
      {/* the flight deck and the crew */}
      <g opacity={draw}>
        <line x1={1500} y1={410} x2={1500} y2={630} stroke={INK} strokeWidth={4} />
        <Person x={1580} y={500} s={0.7} color={ICE} k={pilots} sit />
        <Person x={1580} y={600} s={0.7} color={ICE} k={pilots} sit />
        <Person x={1470} y={620} s={0.8} color={AMBER} k={fa} />
        <Person x={150} y={620} s={0.8} color={AMBER} k={fa} />
        <TypeText x={1590} y={380} t={t} at={e("pilots")} text="PILOTS" size={34} color={ICE} anchor="middle" />
        <TypeText x={420} y={380} t={t} at={e("attendants")} text="CABIN CREW" size={34} color={AMBER} anchor="middle" />
      </g>
      {/* the wing and props above, for scale */}
      <g opacity={0.6 * draw}><rect x={760} y={372} width={420} height={22} rx={8} fill="#6c7782" /><rect x={880} y={394} width={160} height={40} rx={18} fill="#6c7782" /></g>
      {/* the count plate */}
      {aboard && <g transform="translate(700 700)" opacity={ramp(t, e("aboard"), 12)}>
        <rect x={0} y={0} width={520} height={160} rx={10} fill="rgba(8,12,18,0.9)" stroke={AMBER} strokeWidth={4} />
        <text x={24} y={50} fontFamily={MONO} fontWeight={700} fontSize={32} fill={INK}>PEOPLE ABOARD</text>
        <text x={24} y={136} fontFamily={ANTON} fontSize={80} fill={AMBER}>{countText(aboard, ramp(t, e("aboard"), 30))}</text>
      </g>}
    </Sheet>
  );
};

export default Cabin;
