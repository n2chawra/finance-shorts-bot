"use client";

import { FeedbackPanel } from "@/components/feedback";
import { PageHeader, Stagger } from "@/components/ui";

/** The owner's feedback (2026-10-30): notes on the channel, and every note, pick and stale with the system's answer. */
export default function FeedbackPage() {
  return (
    <Stagger>
      <PageHeader title="Feedback" sub="Tell the system what's wrong or what to do better. Every video run reads your open notes before it writes; overnight the agent whose job it is (improver, research, dashboard, auditor…) fixes it, hands on any part that belongs to another agent, and every answer shows here." />
      <FeedbackPanel title="Notes on the channel, and everything you've said" showVideo kinds={["general", "improve", "wrong"]} />
    </Stagger>
  );
}
