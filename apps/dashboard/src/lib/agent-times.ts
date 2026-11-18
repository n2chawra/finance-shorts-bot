/**
 * When each agent runs for a channel (IST), as the routines at claude.ai → Code → Routines are set
 * (read 18 Nov 2026). `null`: the agent doesn't run for that channel. The Agents page and the Growth
 * loop's "next reviewer run" read it; keep it in step when a routine's time changes or a channel gets
 * its routines (the /new-channel skill's launch step).
 */
import { DEFAULT_CHANNEL } from "./channels";

export type AgentKey = "auditor" | "scout" | "studio" | "research" | "improver" | "dashboard" | "reviewer" | "monthly";
export type AgentTime = { label: string; days?: number[]; hour?: number; minute?: number } | null;

const t = (label: string, hour: number, minute: number, days?: number[]): AgentTime => ({ label, hour, minute, days });

const TIMES: Record<string, Record<AgentKey, AgentTime>> = {
  [DEFAULT_CHANNEL]: {
    auditor: t("22:02", 22, 2), research: t("22:17", 22, 17), improver: t("22:33", 22, 33),
    dashboard: t("23:00 Sun", 23, 0, [0]), scout: t("09:37 Mon, Thu", 9, 37, [1, 4]), studio: t("08:05 Mon, Wed", 8, 5, [1, 3]),
    reviewer: t("21:07 Tue, Fri", 21, 7, [2, 5]), monthly: t("12:07 on the 1st", 12, 7),
  },
  "geography-maps-geopolitical-mysteries": {
    // its own routines (created 18 Nov 2026); the auditor, improver and dashboard agents serve Paisa
    // Panchayat for now, and it makes no long videos (no scout or studio)
    research: t("00:12", 0, 12), reviewer: t("21:37 Tue, Fri", 21, 37, [2, 5]),
    auditor: null, improver: null, dashboard: null, scout: null, studio: null, monthly: null,
  },
};

/** The channel's agent times; a channel not listed yet has none of its own. */
export function agentTimes(channel: string): Record<AgentKey, AgentTime> {
  return TIMES[channel] ?? { auditor: null, scout: null, studio: null, research: null, improver: null, dashboard: null, reviewer: null, monthly: null };
}
