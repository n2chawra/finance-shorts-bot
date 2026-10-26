/** Every scene a timeline beat may name. StoryVideo's registry is typed against this list, so the
 * two cannot drift apart; Python and the tests read it without loading any React. */
export const SCENE_NAMES = [
  "stage", "chapter", "checklist", "end", "headline",
  "bignumber", "reveal", "statement", "monster", "snowball", "calendar", "split", "chart", "towers",
  "prop", "screen", "equation", "kinetic", "source", "bill", "road", "fork", "shot", "hook",
  // a world built per phrase from the video's own props, and a video's own coded beats (2026-10-26)
  "build", "custom",
] as const;

export type SceneName = (typeof SCENE_NAMES)[number];

export const isScene = (name: string): name is SceneName => (SCENE_NAMES as readonly string[]).includes(name);
