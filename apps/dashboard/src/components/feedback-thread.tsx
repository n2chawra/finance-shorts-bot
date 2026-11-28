"use client";

/**
 * The agents' replies to one owner note as a thread (owner, 2026-11-28: the joined "system replied"
 * paragraph "looks very ugly when it goes to multiple agents"): a one-line summary, then one compact block
 * per agent with its colour, status, who it handed to, the commit, and its words (long ones folded).
 */
import { ArrowRight, Bot, CalendarClock, Clapperboard, Eye, GitCommitHorizontal, Hourglass, LayoutDashboard, Search, ShieldCheck, Telescope, Wrench, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { type Accent, Badge, IconTile, type Tone } from "@/components/ui";
import { fmtDateTime, fmtRelative, titleCase } from "@/lib/format";
import { ACTION_LABEL, type AckAction, type AgentReply, parseReplies, summarize } from "@/lib/feedback-replies";

/** Same colours and icons as the Agents page. */
const AGENT: Record<string, { name: string; icon: LucideIcon; accent: Accent }> = {
  auditor: { name: "Auditor", icon: ShieldCheck, accent: "sky" },
  research: { name: "Research", icon: Search, accent: "grape" },
  improver: { name: "Improver", icon: Wrench, accent: "lime" },
  dashboard: { name: "Dashboard", icon: LayoutDashboard, accent: "pink" },
  reviewer: { name: "Reviewer", icon: Eye, accent: "mint" },
  scout: { name: "Scout", icon: Telescope, accent: "sun" },
  studio: { name: "Studio", icon: Clapperboard, accent: "tang" },
  monthly: { name: "Monthly review", icon: CalendarClock, accent: "sky" },
};
const agentOf = (id: string) => AGENT[id] ?? { name: titleCase(id), icon: Bot, accent: "surface" as Accent };

const TONE: Record<AckAction, Tone> = { fixed: "good", partly: "info", handed: "neutral", noted: "neutral", "needs owner": "warning", declined: "critical" };

const REPO = "https://github.com/n2chawra/finance-shorts-bot/commit/";
/** Past this many characters a reply folds to three lines behind "Show more". */
const FOLD = 240;

function ReplyText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > FOLD;
  return (
    <div className="mt-1">
      <p className={`whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink2 ${long && !open ? "line-clamp-3" : ""}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
          className="mt-0.5 text-[12.5px] font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function AgentBlock({ r }: { r: AgentReply }) {
  const a = agentOf(r.agent);
  return (
    <li className="flex gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
      <IconTile icon={a.icon} accent={a.accent} size="sm" />
      <div className="min-w-0 flex-1">
        {r.acks.map((ack, i) => (
          <div key={i} className={i > 0 ? "mt-2.5 border-t border-line pt-2.5" : ""}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {i === 0 && <span className="text-[13px] font-semibold text-ink">{a.name}</span>}
              <Badge tone={TONE[ack.action]}>{ACTION_LABEL[ack.action].chip}</Badge>
              {ack.to && (
                <span className="inline-flex items-center gap-1 text-[12.5px] text-muted">
                  <ArrowRight aria-hidden className="size-3" /><span className="sr-only">handed to</span>{agentOf(ack.to).name}
                </span>
              )}
              {ack.commit && (
                <a href={`${REPO}${ack.commit}`} target="_blank" rel="noreferrer" title="The commit with this change"
                  className="ml-auto inline-flex items-center gap-1 font-mono text-[11.5px] text-muted hover:text-brand-text">
                  <GitCommitHorizontal aria-hidden className="size-3.5" />{ack.commit.slice(0, 7)}
                </a>
              )}
            </div>
            {ack.note && <ReplyText text={ack.note} />}
          </div>
        ))}
      </div>
    </li>
  );
}

/** The replies under a note: summary line (with the reply date), then the agent blocks. */
export function FeedbackThread({ response, at }: { response: string; at?: string | null }) {
  const r = parseReplies(response);
  const when = at ? <span title={fmtDateTime(at)}>{fmtRelative(at)}</span> : null;
  if (!r.agents.length) {
    // an older free-text answer, or only "waiting for …"
    return (
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-ink2">The system replied{when && <> · {when}</>}</div>
        {r.raw && <ReplyText text={r.raw} />}
        {r.waiting.length > 0 && <Waiting names={r.waiting} />}
      </div>
    );
  }
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        <span className="font-medium text-ink2">{summarize(r)}</span>
        {when && <span className="text-muted">· {when}</span>}
      </div>
      <ul className="mt-2.5 flex flex-col gap-2">{r.agents.map((a) => <AgentBlock key={a.agent} r={a} />)}</ul>
      {r.waiting.length > 0 && <Waiting names={r.waiting} />}
    </div>
  );
}

function Waiting({ names }: { names: string[] }) {
  return (
    <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] text-muted">
      <Hourglass aria-hidden className="size-3.5" />Waiting for {names.map((n) => agentOf(n).name).join(", ")}
    </p>
  );
}
