/**
 * A board card that shares its frame (owner, 2026-11-04, v-20261104-02: "after the hook 17 seconds of
 * video has texts only, no props animation"). On a card (no cast) a panel used to hide every thing;
 * a person card and two documents left 12 s of a Short with words only. Now a Short's card whose one
 * panel is small keeps its things standing under it.
 */
const PANEL_VERBS = new Set(["bars", "ring", "grid", "calendar", "buttons", "person", "doc"]);

/** A Short's card that shares the frame: the panel above this share of the height, the things' ground here. */
export const SHARED_PANEL_BOTTOM = 0.46, SHARED_GROUND = 0.69;
/** Whether a card beat keeps its things on screen under its panel: a Short, things to show, one panel
 *  (a person, or a document of at most three rows) and no sum or term taking the top. */
export function sharesCard(actions: { do: string; rows?: unknown[] }[], items: number, vertical: boolean): boolean {
  if (!vertical || !items) return false;
  const panels = actions.filter((a) => PANEL_VERBS.has(a.do));
  if (panels.length !== 1) return false;
  if (actions.some((a) => a.do === "equation" || a.do === "term")) return false;
  const p = panels[0]!;
  return p.do === "person" || (p.do === "doc" && (p.rows?.length ?? 0) <= 3);
}
