import { describe, expect, it } from "vitest";
import { onStoryClock } from "../src/contract/clock";
import { isScene } from "../src/contract/scenes";
import { Timeline } from "../src/contract/timeline";
import sample from "../src/fixtures/sample-timeline.json";

describe("timeline contract", () => {
  const tl = Timeline.parse(sample);

  it("parses the sample Python wrote", () => {
    expect(tl.beats.length).toBeGreaterThan(10);
    expect(tl.disclaimer).toBe("Illustrative only. Not financial advice.");
  });

  it("names only scenes the renderer has", () => {
    expect(tl.beats.filter((b) => !isScene(b.scene)).map((b) => b.id)).toEqual([]);
  });

  it("lays beats end to end inside the video", () => {
    let next = 0;
    for (const b of tl.beats) {
      expect(b.from).toBe(next);
      next = b.from + b.frames;
      for (const f of Object.values(b.events)) expect(f).toBeLessThanOrEqual(b.frames);
    }
    expect(next).toBeLessThanOrEqual(tl.durationInFrames);
  });

  it("puts no typed figure on screen: every rupee string in params is one of Python's figures", () => {
    const figures = new Set(Object.values(tl.figures));
    const strings: string[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === "string") strings.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    tl.beats.forEach((b) => walk(b.params));
    const rupees = strings.flatMap((s) => s.match(/₹[\d,.]+(?: (?:L|Cr))?/g) ?? []);
    expect(rupees.length).toBeGreaterThan(0);
    for (const r of rupees) expect(figures.has(r)).toBe(true);
  });

  it("rejects a timeline without the disclaimer", () => {
    expect(() => Timeline.parse({ ...sample, disclaimer: "" })).toThrow();
  });

  it("reads a timeline without a tempo as tempo 1 (the first sample)", () => {
    expect(tl.tempo).toBe(1);
  });

  it("puts a beat on the story clock: length, events and voice scale together", () => {
    const beat = tl.beats.find((b) => b.voice && Object.keys(b.events).length > 3)!;
    const story = onStoryClock(beat, 1.5);
    expect(story.frames).toBeCloseTo(beat.frames * 1.5);
    for (const [k, f] of Object.entries(beat.events)) expect(story.events[k]).toBeCloseTo(f * 1.5);
    expect(story.voice!.start).toBeCloseTo(beat.voice!.start * 1.5);
    expect(story.voice!.phonemes[0]!.s).toBeCloseTo(beat.voice!.phonemes[0]!.s * 1.5);
    expect(onStoryClock(beat, 1)).toBe(beat);
  });
});
