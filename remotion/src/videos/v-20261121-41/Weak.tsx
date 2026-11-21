// Weak: "Even that met only about {fact2} of what the code expected. Then it got worse."
// The investigators' report page on the desk, the finding highlighted as it is said ("Even", "only");
// cut on "code" to the test gauge: the joint's capacity bar stops short of the code's line, the figure
// on the bar; the gap shades amber ("worse").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion, View } from "../../flat/kit";
import { SourceLine } from "../../flat/kit";
import { MonoLabel } from "../../disaster/index";
import { ANTON, Flat, MONO } from "./World";

type Params = { fig?: { pct?: string } };
const INK = "#1f2a3a", PAPER = "#efe9dc", BLUE = "#ffd84a", AMBER = "#ffb23e", RED = "#ff3b30";

const Weak: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pct = (p.beat.params as Params).fig?.pct ?? "";
  const share = parseFloat(pct) / 100 || 0;
  const even = m.at("even", 4), only = m.at("only", 16), code = m.at("code", 40), worse = m.at("worse", 64);
  const gauge = m.t >= code;
  const words = pct.replace("%", " percent");
  const lines = [
    "It is also concluded that had the original",
    "hanger rod arrangement not been changed, the",
    `ultimate capacity would have been approximately`,
    `${words} of that expected under the`,
    "Kansas City Building Code.",
  ];
  const hk = m.lerp([only, only + 14], [0, 1]);
  if (!gauge) {
    const z = m.lerp([0, only + 10], [1.1, 1.24]);
    return (
      <Flat t={m.t} tag="as reported">
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <View zoom={z} cx={540} cy={m.lerp([0, only + 10], [860, 900])}>
            <g transform={`rotate(-2 540 860) translate(0 ${m.lerp([0, even + 6], [60, 0])})`}>
              <rect x={104} y={410} width={872} height={980} fill="rgba(0,0,0,0.5)" rx={4} />
              <rect x={90} y={390} width={872} height={980} fill={PAPER} rx={4} />
              <text x={130} y={470} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#6b6455" letterSpacing={3}>NATIONAL BUREAU OF STANDARDS</text>
              <text x={130} y={540} fontFamily="'Playfair Display', Georgia, serif" fontSize={44} fill={INK}>Investigation of the Kansas City</text>
              <text x={130} y={596} fontFamily="'Playfair Display', Georgia, serif" fontSize={44} fill={INK}>Hyatt Regency Walkways Collapse</text>
              <line x1={130} y1={636} x2={920} y2={636} stroke={INK} strokeWidth={2} />
              <text x={130} y={690} fontFamily={MONO} fontWeight={700} fontSize={30} fill="#6b6455" letterSpacing={3}>ABSTRACT</text>
              {lines.map((ln, i) => (
                <g key={i}>
                  {i >= 2 && i <= 4 ? (
                    <rect x={124} y={728 + i * 66} width={Math.min(1, hk * 3 - (i - 2)) * (i === 4 ? 520 : 800)} height={52} fill="rgba(255,216,74,0.75)" />
                  ) : null}
                  <text x={130} y={768 + i * 66} fontFamily="Georgia, serif" fontSize={38} fill={INK}>{ln}</text>
                </g>
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={i} x={130} y={1140 + i * 46} width={760 - (i * 97) % 220} height={16} fill="rgba(31,42,58,0.16)" rx={8} />
              ))}
            </g>
          </View>
        </svg>
        <SourceLine p={p} y={290} />
      </Flat>
    );
  }
  // the gauge: the joint's capacity against the code's line
  const fill = m.lerp([code, code + 18], [0, share]);
  const x0 = 140, wBar = 800, yBar = 820, hBar = 150;
  const gap = m.lerp([worse, worse + 10], [0, 1]);
  return (
    <Flat t={m.t} tag="general principle">
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <View zoom={m.lerp([code, m.end], [1.22, 1.14])} cx={540} cy={880}>
          <MonoLabel t={m.t} at={code} x={x0} y={yBar - 70} text="CONNECTION STRENGTH" size={48} color="#f4efe7" />
          <rect x={x0} y={yBar} width={wBar} height={hBar} fill="rgba(20,20,22,0.85)" stroke="#e9e2d6" strokeWidth={5} rx={10} />
          <rect x={x0 + wBar * share} y={yBar + 6} width={(wBar * (1 - share) - 6) * gap} height={hBar - 12} fill="#ffffff" opacity={0.22} />
          <rect x={x0 + 6} y={yBar + 6} width={(wBar - 12) * fill} height={hBar - 12} fill={BLUE} rx={6} />
          <text x={x0 + 26 + (wBar - 12) * fill - 30} y={yBar + 104} textAnchor="end" fontFamily={ANTON} fontSize={86} fill="#f4efe7">{fill > share * 0.98 ? pct : ""}</text>
          {/* the code's line at full */}
          <line x1={x0 + wBar} y1={yBar - 40} x2={x0 + wBar} y2={yBar + hBar + 40} stroke={RED} strokeWidth={8} />
          <MonoLabel t={m.t} at={code + 6} x={x0 + wBar} y={yBar + hBar + 100} text="WHAT THE CODE EXPECTED" size={44} color={RED} anchor="end" />
          {/* the joint, drawn small above the bar */}
          <g transform={`translate(540 ${560 + m.wave(70, 3)})`}>
            <rect x={-170} y={-50} width={340} height={100} fill="#e4ddd2" stroke="#1c1c20" strokeWidth={4} />
            <line x1={0} y1={-260} x2={0} y2={80} stroke="#b9b2a8" strokeWidth={22} />
            <rect x={-34} y={52} width={68} height={30} fill="#a9a39a" />
          </g>
          <MonoLabel t={m.t} at={worse} x={540} y={yBar + hBar + 210} text="THEN IT GOT WORSE" size={52} color={AMBER} anchor="middle" />
        </View>
      </svg>
    </Flat>
  );
};
export default Weak;
