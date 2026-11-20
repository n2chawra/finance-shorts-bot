// Turn: "No. It pays for insurance, servers, staff and ads."
// The same office goes red on "No" and the jar shakes; then each cost pulls coins out of the jar on its word:
// an insurance shield on "insurance", a server rack on "servers", a row of desks with staff on "staff", a
// billboard ad on "ads".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, CityWindow, Glow, INK, STROKE, Stage, Txt, View, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { Char } from "../../flat/cast";
import { CoinStream, Jar as GlassJar } from "./props";

const Costs: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const no = m.at("no", 2), ins = m.at("insurance", 14), srv = m.at("servers", 30), staff = m.at("staff", 44), ads = m.at("ads", 60);
  const red = m.lerp([no, no + 4], [0, 1]);
  const shake = m.t >= no && m.t < no + 10 ? Math.sin(m.t * 3) * (no + 10 - m.t) * 1.6 : 0;
  const fill = 0.35 - 0.07 * [ins, srv, staff, ads].filter((f) => m.t >= f + 6).length;
  const jar: [number, number] = [540, 820];
  const wide = m.lerp([staff - 4, staff + 12], [0, 1], Easing.inOut(Easing.cubic));
  const item = (at: number) => m.pop(at, 11);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a0f18" vignette={0.42}>
        <View zoom={1.12 - 0.12 * wide} cx={540} cy={760 + 40 * wide}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1e2440" />
          {/* Uber's office: windows over the city, the logo on the wall */}
          <CityWindow x={-60} y={560} w={300} h={360} seed="uber-office-l" />
          <CityWindow x={840} y={560} w={300} h={360} seed="uber-office-r" />
          <Block x={360} y={560} w={360} h={150} r={18} fill="#ffffff" />
          <g transform="translate(540 670)"><Photo name="uber" s={90} t={m.t / 30} /></g>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#c0392b" opacity={0.3 * red} />
          <Block x={-200} y={1080} w={1480} h={120} r={10} fill="#8a5226" />
          <rect x={-200} y={1200} width={1480} height={800} fill="#6b3f1e" stroke={INK} strokeWidth={STROKE} />
          <GlassJar x={540} y={1085} w={300} h={360} fill={fill} shake={shake} />
          {/* insurance shield, top left */}
          {item(ins) > 0 ? (
            <g transform={`translate(230 330) scale(${1.4 * item(ins)})`}>
              <path d="M 0 -150 L 120 -100 Q 120 60 0 150 Q -120 60 -120 -100 Z" fill="#2c6bd6" stroke={INK} strokeWidth={STROKE} />
              <path d="M -45 0 L -10 40 L 55 -40" fill="none" stroke="#ffffff" strokeWidth={18} strokeLinecap="round" />
              <Txt x={0} y={200} size={40} fill="#ffffff" stroke={INK}>INSURANCE</Txt>
            </g>
          ) : null}
          <CoinStream m={m} a={jar} b={[230, 330]} from={ins} n={4} gap={3} dur={12} arc={120} r={26} />
          {/* server rack, top right */}
          {item(srv) > 0 ? (
            <g transform={`translate(830 330) scale(${1.3 * item(srv)})`}>
              <Block x={-110} y={-170} w={220} h={340} r={10} fill="#2a2e44" />
              {[0, 1, 2, 3, 4].map((r) => (
                <g key={r}>
                  <rect x={-90} y={-150 + r * 64} width={180} height={44} rx={6} fill="#3a3f55" stroke={INK} strokeWidth={3} />
                  <circle cx={60} cy={-128 + r * 64} r={8} fill={(Math.floor(m.t / 3) + r) % 2 ? "#4dff9a" : "#1f6b40"} />
                </g>
              ))}
              <Txt x={0} y={215} size={40} fill="#ffffff" stroke={INK}>SERVERS</Txt>
            </g>
          ) : null}
          <CoinStream m={m} a={jar} b={[830, 330]} from={srv} n={4} gap={3} dur={12} arc={120} r={26} />
          {/* staff at desks, left */}
          {item(staff) > 0 ? (
            <g transform={`translate(0 ${(1 - item(staff)) * 300})`}>
              {[60, 230].map((x, i) => (
                <g key={x}>
                  <Char x={x + 40} y={1060} s={110} skin={i ? "#e2b48f" : "#a8683a"} top={i ? "#2c6bd6" : "#7a3fb8"} hair={i ? "bun" : "side"} outfit="shirt" face="happy" armR={[60, 90]} armL={[60, 90]} />
                  <Block x={x - 30} y={940} w={150} h={90} r={8} fill="#0b0f14" />
                </g>
              ))}
              <Txt x={190} y={680} size={46} fill="#ffffff" stroke={INK}>STAFF</Txt>
            </g>
          ) : null}
          <CoinStream m={m} a={jar} b={[170, 900]} from={staff} n={4} gap={3} dur={12} arc={160} r={26} />
          {/* a billboard ad, right */}
          {item(ads) > 0 ? (
            <g transform={`translate(820 ${830 - (1 - item(ads)) * 600}) scale(1.3)`}>
              <Block x={-130} y={-110} w={260} h={180} r={12} fill="#ffc43d" />
              <Txt x={0} y={-20} size={64} fill={INK}>ADS</Txt>
              <rect x={-10} y={70} width={20} height={180} fill="#3a3f55" stroke={INK} strokeWidth={4} />
            </g>
          ) : null}
          <CoinStream m={m} a={jar} b={[820, 800]} from={ads} n={4} gap={3} dur={12} arc={140} r={26} />
          <Glow x={540} y={860} r={300} color="#ff5a4a" o={0.3 * red} />
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Costs;
