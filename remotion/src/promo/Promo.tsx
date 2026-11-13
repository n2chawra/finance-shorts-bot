/**
 * "How I make motion graphics with Claude and Remotion": a 3-minute explainer for the owner's own
 * channel and LinkedIn. Show, don't tell: every claim is on screen as the thing itself (the real
 * showcase playing in a phone, the prompt typed into a terminal, the code typing out, the checks
 * ticking). Scenes and word timings come from promo.json (voice built in Python).
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../design/fonts";

export interface PWord { w: string; s: number; e: number }
export interface PScene { id: string; from: number; frames: number; words: PWord[] }
export type PromoProps = { scenes: PScene[]; durationInFrames: number };

const C = { bg: "#0b0d14", panel: "#151a26", line: "#262d40", text: "#f3f4f8", muted: "#8a93a8", claude: "#e07a52", remotion: "#3b8cff", good: "#3ddc97", bad: "#ff5b5b", gold: "#ffd166" };
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

interface Ctx { t: number; fps: number; sc: PScene; w: number; h: number }
/** seconds into the scene when a word is spoken (the first word starting with `w`, case-insensitive) */
const when = (c: Ctx, w: string, d = 0) => {
  const hit = c.sc.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w.toLowerCase()));
  return hit ? hit.s - c.sc.from / c.fps : d;
};
const pop = (c: Ctx, at: number, damping = 13) => c.t < at ? 0 : spring({ frame: (c.t - at) * c.fps, fps: c.fps, config: { damping, stiffness: 160, mass: 0.8 } });

// ---------------- pieces ----------------

const Bg: React.FC<{ t: number; hue?: string }> = ({ t, hue = C.claude }) => (
  <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    <div style={{ position: "absolute", width: 1400, height: 1400, borderRadius: "50%", left: -300 + Math.sin(t * 0.2) * 80, top: -700,
      background: `radial-gradient(circle, ${hue}33, transparent 60%)` }} />
    <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", right: -400 + Math.cos(t * 0.17) * 80, bottom: -700,
      background: `radial-gradient(circle, ${C.remotion}30, transparent 60%)` }} />
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.08 }}>
      {Array.from({ length: 25 }, (_, i) => <line key={i} x1={i * 80 - ((t * 12) % 80)} y1={0} x2={i * 80 - ((t * 12) % 80)} y2={1080} stroke="#fff" />)}
      {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#fff" />)}
    </svg>
  </AbsoluteFill>
);

/** A phone playing a slice of a real render. */
const Phone: React.FC<{ src: string; from: number; x: number; y: number; scale?: number; k?: number; rot?: number; label?: string; labelColor?: string }> =
  ({ src, from, x, y, scale = 1, k = 1, rot = 0, label, labelColor = C.good }) => {
    const pw = 400 * scale, ph = pw * 16 / 9;
    return (
      <div style={{ position: "absolute", left: x - pw / 2, top: y - ph / 2, width: pw, height: ph, transform: `translateY(${(1 - k) * 500}px) rotate(${rot + (1 - k) * 8}deg) scale(${0.85 + 0.15 * k})`, opacity: clamp(k * 2) }}>
        <div style={{ position: "absolute", inset: -14 * scale, borderRadius: 54 * scale, background: "#05060a", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", border: `3px solid ${C.line}` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 42 * scale, overflow: "hidden", background: "#000" }}>
          <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} muted style={{ width: "100%", height: "100%" }} />
        </div>
        {label && <div style={{ position: "absolute", top: -78 * scale, left: 0, right: 0, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40 * scale, color: "#000", background: labelColor, padding: "6px 22px", borderRadius: 14 }}>{label}</span>
        </div>}
      </div>
    );
  };

/** A terminal where the owner's prompt types itself to Claude. */
const Terminal: React.FC<{ c: Ctx; x: number; y: number; w: number; prompt: string; start: number; reply?: string; k?: number }> = ({ c, x, y, w, prompt, start, reply, k = 1 }) => {
  const n = Math.floor(clamp((c.t - start) / Math.max(0.8, prompt.length * 0.035)) * prompt.length);
  const done = n >= prompt.length;
  const rk = done ? ease((c.t - start - prompt.length * 0.035 - 0.3) / 0.4) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 40}px)` }}>
      <div style={{ background: C.panel, borderRadius: 20, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 50, background: "#1c2232", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((col) => <div key={col} style={{ width: 16, height: 16, borderRadius: 8, background: col }} />)}
          <span style={{ fontFamily: "monospace", color: C.muted, fontSize: 24, marginLeft: 14 }}>claude</span>
        </div>
        <div style={{ padding: "26px 30px", fontFamily: "Consolas, monospace", fontSize: 34, lineHeight: 1.4, color: C.text, minHeight: 120 }}>
          <span style={{ color: C.claude, fontWeight: 700 }}>{"> "}</span>{prompt.slice(0, n)}
          {!done && <span style={{ opacity: Math.sin(c.t * 12) > 0 ? 1 : 0 }}>▍</span>}
          {reply && rk > 0 && <div style={{ marginTop: 18, color: C.good, opacity: rk, fontSize: 30 }}>● {reply}</div>}
        </div>
      </div>
    </div>
  );
};

type Tok = [string, string];   // [text, colour]
/** Code that types itself, a line at a time. */
const Code: React.FC<{ c: Ctx; x: number; y: number; w: number; lines: Tok[][]; start: number; file: string; k?: number }> = ({ c, x, y, w, lines, start, file, k = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 40}px)` }}>
    <div style={{ background: "#0f131d", borderRadius: 20, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
      <div style={{ height: 50, background: "#171c29", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: "monospace", fontSize: 24, color: C.muted }}>{file}</div>
      <div style={{ padding: "20px 26px", fontFamily: "Consolas, monospace", fontSize: 30, lineHeight: 1.5 }}>
        {lines.map((ln, i) => {
          const lk = ease((c.t - start - i * 0.32) / 0.25);
          return <div key={i} style={{ opacity: lk, transform: `translateX(${(1 - lk) * 30}px)`, whiteSpace: "pre" }}>
            <span style={{ color: "#4b5468", marginRight: 22 }}>{String(i + 1).padStart(2, " ")}</span>
            {ln.map(([s, col], j) => <span key={j} style={{ color: col }}>{s}</span>)}
          </div>;
        })}
      </div>
    </div>
  </div>
);
const K = "#c792ea", F = "#82aaff", S = "#c3e88d", N = "#f78c6c", P = "#e6e8ef", G = "#7f8aa3";

/** A big line of words that land one by one as they are spoken. */
const Headline: React.FC<{ c: Ctx; text: string; y: number; size?: number; color?: string; at?: number; x?: number; align?: "left" | "center" }> =
  ({ c, text, y, size = 96, color = C.text, at, x = 0, align = "center" }) => {
    const start = at ?? 0;
    return (
      <div style={{ position: "absolute", left: x, right: align === "center" ? x : undefined, top: y, textAlign: align, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color, letterSpacing: -1 }}>
        {text.split(" ").map((wd, i) => {
          const k = pop(c, start + i * 0.12, 12);
          return <span key={i} style={{ display: "inline-block", marginRight: size * 0.25, opacity: clamp(k * 2), transform: `translateY(${(1 - k) * 50}px)` }}>{wd}</span>;
        })}
      </div>
    );
  };

const Tag: React.FC<{ text: string; color: string; x: number; y: number; k: number; rot?: number }> = ({ text, color, x, y, k, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.5 + 0.5 * k}) rotate(${rot}deg)`, opacity: clamp(k * 2), transformOrigin: "0 50%" }}>
    <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#fff", background: color, padding: "10px 26px", borderRadius: 16, boxShadow: "0 14px 30px rgba(0,0,0,0.4)" }}>{text}</span>
  </div>
);

// ---------------- scenes ----------------

const SCENES: Record<string, React.FC<{ c: Ctx }>> = {
  hook: ({ c }) => (
    <>
      <Bg t={c.t} />
      <Phone src="promo/showcase.mp4" from={0} x={1520} y={560} scale={1.1} k={pop(c, 0.1, 16)} rot={-3} />
      <Headline c={c} text="Written." y={230} size={118} at={when(c, "written", 0.4)} x={120} align="left" />
      <Headline c={c} text="Animated." y={370} size={118} color={C.claude} at={when(c, "animated", 1)} x={120} align="left" />
      <Headline c={c} text="Voiced. By code." y={510} size={118} color={C.remotion} at={when(c, "voiced", 1.6)} x={120} align="left" />
      <Headline c={c} text="Claude + Remotion" y={760} size={72} color={C.gold} at={when(c, "claude", 6)} x={120} align="left" />
    </>
  ),
  problem: ({ c }) => (
    <>
      <Bg t={c.t} hue={C.bad} />
      <Headline c={c} text="3 videos a day. On autopilot." y={140} size={66} at={when(c, "three", 0.5)} x={110} align="left" />
      <Headline c={c} text="But the first ones looked like this:" y={260} size={56} color={C.muted} at={when(c, "first", 4)} x={110} align="left" />
      <Phone src="promo/old.mp4" from={3} x={1500} y={590} scale={1.0} k={pop(c, when(c, "first", 4), 16)} label="BEFORE" labelColor={C.bad} />
      <Tag text="Character at the edge" color={C.bad} x={150} y={470} k={pop(c, when(c, "character", 7))} rot={-2} />
      <Tag text="A number in a box" color={C.bad} x={190} y={590} k={pop(c, when(c, "number", 8))} rot={1} />
      <Tag text="Most of the screen empty" color={C.bad} x={150} y={710} k={pop(c, when(c, "empty", 9.5))} rot={-1} />
      <Headline c={c} text="Nobody wanted to watch it." y={870} size={64} color={C.gold} at={when(c, "nobody", 13)} x={110} align="left" />
    </>
  ),
  research: ({ c }) => {
    const chans = ["Kurzgesagt", "TED-Ed", "The Infographics Show"];
    const rules = [["Fill the frame", "fill"], ["Change the shot size", "change"], ["Make money a thing", "make"]];
    return (
      <>
        <Bg t={c.t} />
        <Headline c={c} text="Claude studied the best. Frame by frame." y={110} size={70} at={0.3} />
        {chans.map((n, i) => {
          const k = pop(c, when(c, n.split(" ")[0]!.replace("-", "").toLowerCase().slice(0, 4), 2 + i * 0.8));
          return <div key={n} style={{ position: "absolute", left: 160 + i * 560, top: 270, width: 500, height: 280, borderRadius: 24, background: C.panel, border: `2px solid ${C.line}`,
            transform: `translateY(${(1 - k) * 80}px) rotateY(${(1 - k) * 60}deg)`, opacity: clamp(k * 2), overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 8, padding: 16 }}>{Array.from({ length: 6 }, (_, j) => <div key={j} style={{ flex: 1, height: 130, borderRadius: 8,
              background: `linear-gradient(${120 + j * 30}deg, hsl(${(i * 70 + j * 25) % 360} 60% 45%), hsl(${(i * 70 + j * 25 + 40) % 360} 60% 30%))`,
              opacity: 0.4 + 0.6 * ease((c.t - 2 - i * 0.8 - j * 0.15) / 0.3) }} />)}</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: n.length > 12 ? 38 : 46, color: C.text, textAlign: "center", marginTop: 26 }}>{n}</div>
          </div>;
        })}
        {rules.map(([r, w], i) => {
          const k = pop(c, when(c, w!, 10 + i * 1.5));
          return <div key={r} style={{ position: "absolute", left: 300, top: 640 + i * 120, opacity: clamp(k * 2), transform: `translateX(${(1 - k) * -80}px)`,
            fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.text }}><span style={{ color: C.good, marginRight: 28 }}>✓</span>{r}</div>;
        })}
      </>
    );
  },
  stack: ({ c }) => {
    const nodes: [string, string, string][] = [["You", "describe it", C.gold], ["Claude Code", "writes the code", C.claude], ["Remotion", "renders frames", C.remotion], ["MP4", "the video", C.good]];
    const at = [when(c, "describe", 9), when(c, "claude", 4), when(c, "remotion", 1), when(c, "look", 14)];
    const order = [0, 1, 2, 3].sort((a, b) => at[a]! - at[b]!);
    return (
      <>
        <Bg t={c.t} hue={C.remotion} />
        <Headline c={c} text="The setup" y={90} size={84} at={0.2} />
        {nodes.map(([n, sub, col], i) => {
          const k = pop(c, Math.min(at[i]!, 2 + order.indexOf(i) * 1.2));
          return <div key={n} style={{ position: "absolute", left: 110 + i * 450, top: 300, width: 360, height: 220, borderRadius: 28, background: C.panel,
            border: `4px solid ${col}`, boxShadow: `0 0 60px ${col}44`, opacity: clamp(k * 2), transform: `scale(${0.7 + 0.3 * k})`, textAlign: "center", paddingTop: 50 }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: col }}>{n}</div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, color: C.muted, marginTop: 10 }}>{sub}</div>
          </div>;
        })}
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {[0, 1, 2].map((i) => {
            const x1 = 470 + i * 450, x2 = 560 + i * 450, y = 410, k = ease((c.t - 3 - i) / 0.6);
            const dot = (c.t * 0.9 + i * 0.3) % 1;
            return <g key={i} opacity={k}><line x1={x1} y1={y} x2={x1 + (x2 - x1) * k} y2={y} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
              <circle cx={x1 + (x2 - x1) * dot} cy={y} r={11} fill={C.gold} /></g>;
          })}
        </svg>
        <Code c={c} x={330} y={600} w={1260} start={when(c, "every", 4)} file="Scene.tsx" k={pop(c, when(c, "every", 4), 16)} lines={[
          [["const ", K], ["frame", P], [" = ", G], ["useCurrentFrame", F], ["();", G]],
          [["const ", K], ["grow", P], [" = ", G], ["spring", F], ["({ frame, fps });", G]],
          [["return ", K], ["<", G], ["CashStack ", F], ["height", N], ["={", G], ["grow", P], ["} />", G]],
        ]} />
      </>
    );
  },
  money: ({ c }) => (
    <>
      <Bg t={c.t} hue={C.good} />
      <Terminal c={c} x={90} y={110} w={980} start={0.4} prompt="make money feel physical: cash that piles up, notes that fly" reply="Added CashStack and MoneyFlow" k={pop(c, 0.1, 16)} />
      <Code c={c} x={90} y={520} w={980} start={when(c, "claude", 5)} file="studio/money.tsx" k={pop(c, when(c, "claude", 5), 16)} lines={[
        [["<", G], ["CashStack ", F], ["amount", N], ["=", G], ["{rich.final}", S], [" grow", N], [" />", G]],
        [["<", G], ["MoneyFlow ", F], ["from", N], ["=", G], ['"phone"', S], [" to", N], ["=", G], ['"bank"', S], [" />", G]],
      ]} />
      <Phone src="promo/showcase.mp4" from={6.2} x={1490} y={560} scale={1.1} k={pop(c, when(c, "cash", 3), 16)} rot={2} label="RESULT" />
    </>
  ),
  camera: ({ c }) => (
    <>
      <Bg t={c.t} />
      <Terminal c={c} x={90} y={110} w={980} start={0.3} prompt="give me a real camera: wide, close, extreme close-up" reply="Shot sizes cut on the spoken word" k={pop(c, 0.1, 16)} />
      {["WIDE", "CLOSE", "EXTREME"].map((s, i) => <Tag key={s} text={s} color={[C.remotion, C.claude, C.bad][i]!} x={120 + i * 330} y={560} k={pop(c, when(c, ["wide", "close", "extreme"][i]!, 3 + i))} />)}
      <Headline c={c} text="Vector art: even the tightest shot stays sharp." y={760} size={54} color={C.muted} at={when(c, "vector", 8)} x={110} align="left" />
      <Phone src="promo/showcase.mp4" from={19.3} x={1490} y={560} scale={1.1} k={pop(c, 1, 16)} rot={-2} label="RESULT" />
    </>
  ),
  sets: ({ c }) => (
    <>
      <Bg t={c.t} hue={C.gold} />
      <Terminal c={c} x={90} y={110} w={980} start={0.3} prompt="every set lit and alive, with depth" reply="Six sets, three layers each" k={pop(c, 0.1, 16)} />
      {[["A rented flat", "flat"], ["A penthouse at night", "penthouse"], ["A vault of gold", "vault"]].map(([s, w], i) =>
        <Tag key={s} text={s!} color={["#6b4f3a", "#2b3270", "#8a6a12"][i]!} x={120} y={500 + i * 115} k={pop(c, when(c, w!, 3 + i * 1.5))} rot={i % 2 ? 1 : -1} />)}
      <Headline c={c} text="3 layers × different speeds = a real camera" y={880} size={50} color={C.muted} at={when(c, "three", 10)} x={110} align="left" />
      <Phone src="promo/showcase.mp4" from={13.2} x={1490} y={560} scale={1.1} k={pop(c, 1, 16)} rot={2} label="RESULT" />
    </>
  ),
  loop: ({ c }) => {
    const z = 1 + 0.08 * c.t / 16;
    return (
      <>
        <Bg t={c.t} />
        <Headline c={c} text="Stills first. Video last." y={80} size={84} at={0.3} />
        <div style={{ position: "absolute", left: 210, top: 230, width: 1500, height: 780, borderRadius: 22, overflow: "hidden", border: `3px solid ${C.line}`,
          opacity: clamp(pop(c, 1.5, 16) * 2) }}>
          <Img src={staticFile("promo/stills.png")} style={{ width: "100%", transform: `scale(${z})`, transformOrigin: "30% 20%" }} />
        </div>
        <Tag text={"“The phone covers his face”"} color={C.bad} x={260} y={300} k={pop(c, when(c, "phone", 7))} rot={-2} />
        <Tag text={"“The plant hides the money”"} color={C.bad} x={900} y={560} k={pop(c, when(c, "plant", 9))} rot={2} />
        <Tag text="Fixed in seconds ✓" color={C.good} x={620} y={860} k={pop(c, when(c, "fixes", 11))} />
      </>
    );
  },
  hookdemo: ({ c }) => (
    <>
      <Bg t={c.t} hue={C.claude} />
      <Terminal c={c} x={90} y={110} w={980} start={0.3} prompt="write this video's own opening: a split screen, poor vs rich" k={pop(c, 0.1, 16)} />
      <Code c={c} x={90} y={470} w={980} start={when(c, "claude", 3)} file="videos/v-showcase-raise/Hook.tsx" k={pop(c, when(c, "claude", 3), 16)} lines={[
        [["<", G], ["Half ", F], ["side", N], ["=", G], ['"poor"', S], ["><", G], ["Flat ", F], ["/></", G], ["Half", F], [">", G]],
        [["<", G], ["Half ", F], ["side", N], ["=", G], ['"rich"', S], ["><", G], ["Penthouse ", F], ["/></", G], ["Half", F], [">", G]],
        [["<", G], ["Stamp ", F], ["at", N], ["=", G], ['"poor"', S], [" />  <", G], ["Toast ", F], ["text", N], ["=", G], ['"+₹20,000"', S], [" />", G]],
      ]} />
      <Phone src="promo/showcase.mp4" from={0} x={1490} y={560} scale={1.1} k={pop(c, when(c, "split", 4), 16)} rot={-2} label="RESULT" />
    </>
  ),
  gates: ({ c }) => {
    const checks = [["Too much empty background", "empty"], ["The same picture twice", "same"], ["One shot size the whole time", "one"]];
    const score = interpolate(c.t, [when(c, "this", 15), when(c, "nine", 17) + 0.6], [2.7, 9.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <>
        <Bg t={c.t} hue={C.bad} />
        <Headline c={c} text="It checks its own work." y={90} size={84} at={0.3} />
        {checks.map(([t, w], i) => {
          const k = pop(c, when(c, w!, 5 + i * 1.3));
          return <div key={t} style={{ position: "absolute", left: 140, top: 270 + i * 130, opacity: clamp(k * 2), transform: `translateX(${(1 - k) * -60}px)`,
            fontFamily: "Consolas, monospace", fontSize: 44, color: C.text }}><span style={{ color: C.bad, fontWeight: 800 }}>FAIL </span>{t}</div>;
        })}
        <div style={{ position: "absolute", left: 140, top: 700, fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.muted, opacity: clamp(pop(c, when(c, "fails", 9)) * 2) }}>
          → the video stops before it is even drawn</div>
        <div style={{ position: "absolute", right: 140, top: 270, width: 560, height: 560, borderRadius: 32, background: C.panel, border: `3px solid ${C.line}`, textAlign: "center",
          opacity: clamp(pop(c, when(c, "old", 12)) * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.muted, marginTop: 60 }}>Motion score</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 220, color: score > 6 ? C.good : C.bad, lineHeight: 1.2 }}>{score.toFixed(1)}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.muted }}>old videos: under 3</div>
        </div>
      </>
    );
  },
  sound: ({ c }) => {
    const drop = ease((c.t - when(c, "pushed", 9)) / 0.9);
    const bars: [string, number, string][] = [["Voice", 0.82, C.gold], ["Music", 0.42, C.remotion], ["Effects", 0.72 - 0.42 * drop, C.claude]];
    return (
      <>
        <Bg t={c.t} />
        <Headline c={c} text="Even the sound gets measured." y={90} size={80} at={0.3} />
        {bars.map(([n, v, col], i) => {
          const k = ease((c.t - when(c, "split", 4) - i * 0.3) / 0.5);
          const lvl = v * k + Math.sin(c.t * (5 + i)) * 0.015 * k;
          return <div key={n} style={{ position: "absolute", left: 360 + i * 440, bottom: 160, width: 220, textAlign: "center" }}>
            <div style={{ height: 560, position: "relative", background: C.panel, borderRadius: 20, overflow: "hidden", border: `2px solid ${C.line}` }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lvl * 100}%`, background: `linear-gradient(0deg, ${col}, ${col}99)` }} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: C.text, marginTop: 20 }}>{n}</div>
          </div>;
        })}
        <Tag text="Effects −14 dB under the voice" color={C.good} x={1180} y={250} k={pop(c, when(c, "fourteen", 10.5))} />
      </>
    );
  },
  beforeafter: ({ c }) => (
    <>
      <Bg t={c.t} />
      <Phone src="promo/old.mp4" from={2} x={640} y={590} scale={1.05} k={pop(c, when(c, "before", 1.5), 16)} rot={-3} label="BEFORE" labelColor={C.bad} />
      <Phone src="promo/showcase.mp4" from={12.5} x={1280} y={590} scale={1.05} k={pop(c, when(c, "after", 2.6), 16)} rot={3} label="AFTER" />
    </>
  ),
  outro: ({ c }) => (
    <>
      <Bg t={c.t} hue={C.claude} />
      <Headline c={c} text="Claude writes the code." y={240} size={100} color={C.claude} at={when(c, "claude", 0.3)} />
      <Headline c={c} text="Remotion draws it." y={390} size={100} color={C.remotion} at={when(c, "remotion", 1.6)} />
      <Headline c={c} text="I just direct." y={540} size={100} at={when(c, "direct", 2.6)} />
      <Headline c={c} text="Follow the journey: automating YouTube with AI" y={760} size={52} color={C.gold} at={when(c, "follow", 4)} />
    </>
  ),
};

/** Captions along the bottom: a few words at a time, the spoken one highlighted. */
const Captions: React.FC<{ words: PWord[]; t: number }> = ({ words, t }) => {
  const groups: PWord[][] = [];
  let cur: PWord[] = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    if (prev && (cur.length >= 5 || w.s - prev.e > 0.35 || /[.!?,:]$/.test(prev.w))) { groups.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) groups.push(cur);
  const g = groups.find((x, i) => t >= x[0]!.s && t < Math.min(groups[i + 1]?.[0]!.s ?? 1e9, x[x.length - 1]!.e + 0.4));
  if (!g) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff", background: "rgba(5,7,12,0.72)", padding: "10px 28px", borderRadius: 16 }}>
        {g.map((w, i) => <span key={i} style={{ color: t >= w.s && t < w.e + 0.05 ? C.gold : "#fff" }}>{w.w}{i < g.length - 1 ? " " : ""}</span>)}
      </span>
    </div>
  );
};

export const Promo: React.FC<PromoProps> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const i = Math.max(0, scenes.findIndex((s) => frame >= s.from && frame < s.from + s.frames));
  const sc = scenes[i] ?? scenes[scenes.length - 1]!;
  const local = frame - sc.from;
  const Scene = SCENES[sc.id] ?? SCENES.hook!;
  const t = local / fps;
  const k = ease(local / 9);                       // a quick push-in on every cut
  const words = scenes.flatMap((s) => s.words);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* each scene on its own clock, so the clips in it start where they should */}
      <Sequence from={sc.from} durationInFrames={sc.frames}>
        <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * k + 0.012 * t / 10})`, opacity: 0.4 + 0.6 * k }}>
          <Scene c={{ t, fps, sc, w, h }} />
        </AbsoluteFill>
      </Sequence>
      <Captions words={words} t={frame / fps} />
    </AbsoluteFill>
  );
};
