// Build: "In the auction room, the bidding climbed to $400M."
// The auction room on sale night: the auctioneer raises his gavel on "auction", paddles fly up across the room on
// "bidding", and on "climbed" the bid board climbs to the figure as the camera closes on it and the gavel comes down.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, INK, Stage, View, countText, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Paddle } from "./props";

type Params = { fig?: { bid?: string } };

const Bids: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const bid = (p.beat.params as Params).fig?.bid ?? "";
  const auction = m.at("auction", 2), bidding = m.at("bidding", 20), climbed = m.at("climbed", 40);
  const close = m.lerp([climbed - 4, climbed + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.35 * close, cx = 540 + 0 * close, cy = 960 - 380 * close;
  const k = m.lerp([bidding, climbed + 24], [0, 1], Easing.out(Easing.quad));
  const gavelDown = m.t >= climbed + 24 ? 1 : 0;
  const r = rng("paddles");
  const pads = Array.from({ length: 16 }).map((_, i) => ({ x: -60 + (i % 8) * 160 + r() * 40, y: 1250 + Math.floor(i / 8) * 130, t: bidding + r() * 30, c: ["#f4f1e8", "#ffd23f", "#f4f1e8", "#9fdcff"][i % 4]! }));
  return (
    <Stage p={p} bg="#2a0f14" vignette={0.48}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#5a181e" />
        <rect x={-400} y={1340} width={1880} height={900} fill="#2a1a1a" />
        <Display x={180} y={300} w={720} h={260} label="BID" value={m.t < bidding ? "- - -" : countText(bid, k)} color="#ffd23f" />
        {/* the rostrum and the auctioneer */}
        <Block x={360} y={860} w={360} h={300} fill="#6b4a2e" />
        <Char x={540} y={1000} s={190} outfit="suit" top="#1f2433" hair="side" skin="#e2a679" face={gavelDown ? "grin" : "happy"} look={[0, 0.2]}
          armR={gavelDown ? [100, 120] : [160, m.lerp([auction, auction + 10], [100, 175])]} armL={[60, 40]} />
        {/* phone bank on the side */}
        <Block x={-120} y={860} w={300} h={300} fill="#3a2a2a" />
        {[0, 1].map((i) => <Char key={`ph${i}`} x={-20 + i * 120} y={1180} s={120} outfit="shirt" top="#2a2f3d" hair={i ? "bun" : "side"} face="worried" armR={[150, 170]} armL={[20, 10]} />)}
        {/* the room's paddles */}
        {pads.map((q, i) => <Paddle key={i} x={q.x} y={q.y} up={m.t < q.t ? 0 : Math.min(1, m.pop(q.t, 10)) * (0.6 + 0.4 * Math.sin((m.t - q.t) / 4))} c={q.c} />)}
        {Array.from({ length: 8 }).map((_, i) => <Block key={`h${i}`} x={-100 + i * 160} y={1300} w={130} h={120} r={60} fill="#3a2a2a" sw={4} />)}
        <line x1={-400} y1={1342} x2={1480} y2={1342} stroke={INK} strokeWidth={4} />
      </View>
    </Stage>
  );
};

export default Bids;
