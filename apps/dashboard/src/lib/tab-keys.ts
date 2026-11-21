import type React from "react";

/*
 * Keyboard support for a hand-made row of role="tab" buttons (WAI-ARIA tabs pattern): the chosen tab
 * is the only one in the Tab order, and Left/Right (Home/End) move to and choose the next tab. Before
 * 2026-11-21 the Feedback, Videos and Analytics tab rows said they were tabs but ignored the arrow keys.
 */

/** tabIndex for one tab: only the selected one is reachable with Tab. */
export const tabIndexFor = (selected: boolean) => (selected ? 0 : -1);

/** onKeyDown for the element with role="tablist": arrows move focus and click the tab they land on. */
export function onTabListKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
  if (tabs.length === 0) return;
  const at = tabs.indexOf(document.activeElement as HTMLElement);
  let next: number;
  if (e.key === "ArrowRight") next = at < 0 ? 0 : (at + 1) % tabs.length;
  else if (e.key === "ArrowLeft") next = at < 0 ? tabs.length - 1 : (at - 1 + tabs.length) % tabs.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = tabs.length - 1;
  else return;
  e.preventDefault();
  const tab = tabs[next]!;
  tab.focus();
  tab.click();
  tab.scrollIntoView?.({ block: "nearest", inline: "nearest" });
}
