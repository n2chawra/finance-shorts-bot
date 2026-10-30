import { BarChart3, Bell, Bot, CalendarDays, Film, LayoutDashboard, LayoutTemplate, ListOrdered, type LucideIcon, MessageSquarePlus, Settings, Workflow } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; key: string };

/** Sidebar groups. `key` is the second key of the "g then key" shortcut. */
export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Pipeline",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard, key: "o" },
      { href: "/queue", label: "Queue", icon: ListOrdered, key: "q" },
      { href: "/calendar", label: "Calendar", icon: CalendarDays, key: "c" },
      { href: "/videos", label: "Videos", icon: Film, key: "v" },
    ],
  },
  {
    group: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3, key: "a" },
      { href: "/runs", label: "Runs", icon: Workflow, key: "r" },
    ],
  },
  {
    group: "Autopilot",
    items: [
      { href: "/agents", label: "Agents", icon: Bot, key: "i" },
      { href: "/notifications", label: "Notifications", icon: Bell, key: "n" },
      { href: "/feedback", label: "Feedback", icon: MessageSquarePlus, key: "f" },
    ],
  },
  {
    group: "Configure",
    items: [
      { href: "/templates", label: "Templates", icon: LayoutTemplate, key: "t" },
      { href: "/settings", label: "Settings", icon: Settings, key: "s" },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((g) => g.items);

export const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

/** Title for the top bar: the deepest matching nav item, or "Video" on a video page. */
export function pageTitle(path: string): { section: string; title: string } {
  if (/^\/videos\/[^/]+/.test(path)) return { section: "Videos", title: path.split("/")[2] };
  const item = [...NAV_ITEMS].reverse().find((i) => isActive(path, i.href));
  const group = NAV.find((g) => g.items.includes(item!))?.group ?? "";
  return { section: group, title: item?.label ?? "" };
}
