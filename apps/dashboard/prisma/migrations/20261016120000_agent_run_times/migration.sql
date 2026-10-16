-- Run times of the self-improving agents, written by the agents themselves.
ALTER TABLE "AgentActivity" ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "finishedAt" TIMESTAMP(3);
