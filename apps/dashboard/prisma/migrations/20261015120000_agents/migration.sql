-- Owner notifications, agent activity log and snapshots of the agents' repo files.
CREATE TYPE "Severity" AS ENUM ('info', 'warning', 'critical');

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seenAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
CREATE INDEX "Notification_resolvedAt_idx" ON "Notification"("resolvedAt");

CREATE TABLE "AgentActivity" (
    "id" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "findings" JSONB NOT NULL,
    "changes" JSONB NOT NULL,
    "nextCheck" TEXT,
    "links" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentActivity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AgentActivity_day_idx" ON "AgentActivity"("day");

CREATE TABLE "RepoDoc" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RepoDoc_pkey" PRIMARY KEY ("key")
);
