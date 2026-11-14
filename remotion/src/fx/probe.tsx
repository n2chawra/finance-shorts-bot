/**
 * Layout probe. When a still is rendered with `probe`, this measures every visible piece of text
 * on screen (its box after the camera and animations, and its effective font size) and logs it,
 * before the frame is captured. renderer/gates.py turns the log into layout problems: text below
 * the format's minimum size, inside the Shorts bottom zone, or outside the frame.
 */
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export interface ProbeItem { t: string; x: number; y: number; w: number; h: number; fs: number }

function textNodes(el: Element): Text[] {
  const out: Text[] = [];
  el.childNodes.forEach((n) => { if (n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim()) out.push(n as Text); });
  return out;
}

function measure(): ProbeItem[] {
  const out: ProbeItem[] = [];
  document.querySelectorAll("div, span, text").forEach((el) => {
    const nodes = textNodes(el);
    if (nodes.length === 0 || el.closest('[data-probe="skip"]')) return;      // decoration, not text to read
    const t = nodes.map((n) => n.textContent!.trim()).join(" ");
    const visible = (el as Element & { checkVisibility?: (o: object) => boolean }).checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true;
    if (!visible) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    // where the glyphs actually are (a centred line in a full-width box is not "off the frame")
    const range = document.createRange();
    range.setStartBefore(nodes[0]!);
    range.setEndAfter(nodes[nodes.length - 1]!);
    const g = range.getBoundingClientRect();
    const css = parseFloat(getComputedStyle(el).fontSize) || 0;
    // the size the viewer sees: CSS size times whatever transforms (camera, pops) scale the box by
    // SVG text has no layout box to compare with, so its scale comes from its screen matrix (camera
    // zooms and pops included); HTML text compares its box with its layout height
    let fs: number;
    if (el instanceof SVGGraphicsElement) {
      const m = el.getScreenCTM();
      fs = m ? css * Math.hypot(m.a, m.b) : css;
    } else {
      const layoutH = el instanceof HTMLElement ? el.offsetHeight : r.height;
      fs = layoutH > 0 ? css * (r.height / layoutH) : css;
    }
    out.push({ t: t.slice(0, 60), x: Math.round(g.left), y: Math.round(g.top), w: Math.round(g.width), h: Math.round(g.height), fs: Math.round(fs * 10) / 10 });
  });
  return out;
}

export const LayoutProbe: React.FC<{ frame: number }> = ({ frame }) => {
  const [handle] = useState(() => delayRender("layout probe"));
  useEffect(() => {
    requestAnimationFrame(() => {
      console.log("PROBE " + JSON.stringify({ frame, items: measure() }));
      continueRender(handle);
    });
  }, [frame, handle]);
  return null;
};
