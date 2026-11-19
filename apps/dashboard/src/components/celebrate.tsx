"use client";

import { useEffect, useMemo } from "react";

import { useToast } from "@/components/toast";
import { fmtNum } from "@/lib/format";
import { useScorecard } from "@/lib/queries";
import { recordHolder, milestoneLabel, milestoneOf, winsOf, type Win } from "@/lib/records";

const SEEN_KEY = "overview:celebrated:v1";

function readSeen(): Set<string> {
  try { return new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]); } catch { return new Set(); }
}
function writeSeen(seen: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-300))); } catch { /* private window: show again next time */ }
}

const reducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return true; }
};

/** A light confetti burst from the top centre on a throwaway canvas (about 1.8 s, then removed). */
export function confetti() {
  if (typeof window === "undefined" || reducedMotion()) return;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  ctx.scale(dpr, dpr);
  const colors = ["#c8f04a", "#ff7ab6", "#ffd23f", "#4cc9f0", "#9b7bff", "#ff9f43"];
  const w = window.innerWidth;
  const parts = Array.from({ length: 90 }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 120, y: 70,
    vx: (Math.random() - 0.5) * 11, vy: Math.random() * -9 - 3,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    s: 5 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)],
  }));
  const start = performance.now();
  const DURATION = 1800;
  const frame = (t: number) => {
    const k = (t - start) / DURATION;
    if (k >= 1) { canvas.remove(); return; }
    ctx.clearRect(0, 0, w, window.innerHeight);
    ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    for (const p of parts) {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const winText = (w: Win) =>
  w.kind === "record"
    ? `🏆 New record: “${w.title}” has the channel's best-ever views (${fmtNum(w.views)}).`
    : `🎉 “${w.title}” just passed ${w.label}!`;

/**
 * Celebrates new wins once per device: one toast for the biggest unseen win (a record first) and a
 * confetti burst. Renders nothing.
 */
export function Celebrate() {
  const { data } = useScorecard();
  const toast = useToast();
  useEffect(() => {
    if (!data) return;
    const wins = winsOf(data.shorts);
    if (!wins.length) return;
    const seen = readSeen();
    const fresh = wins.filter((w) => !seen.has(w.key));
    if (!fresh.length) return;
    const top = [...fresh].sort((a, b) => (a.kind === b.kind ? b.views - a.views : a.kind === "record" ? -1 : 1))[0];
    for (const w of fresh) seen.add(w.key);
    writeSeen(seen);
    const id = setTimeout(() => { toast(winText(top)); confetti(); }, 600);
    return () => clearTimeout(id);
  }, [data, toast]);
  return null;
}

/** Per video id, the badge its card shows: "New record" for the record holder, else its milestone. */
export function useWinBadges(): Map<string, { label: string; record: boolean }> {
  const { data } = useScorecard();
  return useMemo(() => {
    const out = new Map<string, { label: string; record: boolean }>();
    if (!data) return out;
    for (const s of data.shorts) { const m = milestoneOf(s.views); if (m) out.set(s.id, { label: milestoneLabel(m), record: false }); }
    const rec = recordHolder(data.shorts);
    if (rec) out.set(rec.id, { label: Date.now() - Date.parse(rec.publishAt) < 14 * 86_400_000 ? "New record" : "Best ever", record: true });
    return out;
  }, [data]);
}

/** The small badge on a video's thumbnail. */
export function WinBadge({ label, record }: { label: string; record: boolean }) {
  return (
    <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-xs ${record ? "bg-[#ffd23f] text-[#3a2a00]" : "bg-[#c8f04a] text-[#1d2a00]"}`}>
      <span aria-hidden>{record ? "🏆" : "🎉"}</span>{label}
    </span>
  );
}
