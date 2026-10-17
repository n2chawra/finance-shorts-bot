/**
 * The two video formats and their layout rules. These numbers are hard rules from CLAUDE.md:
 * Shorts text is never smaller than 44 px and never within 120 px of the bottom edge (the Shorts
 * UI covers it). scripts/guard.py checks this file, so agents cannot quietly lower them.
 */
export type FormatName = "short" | "long";

export interface Frame {
  readonly name: FormatName;
  readonly width: number;
  readonly height: number;
  readonly minText: number;
  readonly bottomSafe: number;
  readonly sideMargin: number;
}

export const SHORT: Frame = { name: "short", width: 1080, height: 1920, minText: 44, bottomSafe: 120, sideMargin: 50 };
export const LONG: Frame = { name: "long", width: 1920, height: 1080, minText: 30, bottomSafe: 36, sideMargin: 80 };
export const FRAMES: Record<FormatName, Frame> = { short: SHORT, long: LONG };
export const FPS = 30;
