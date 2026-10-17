-- An agent's proposed setting change on a notification, and the owner's decision on it.
ALTER TABLE "Notification" ADD COLUMN "proposal" JSONB;
ALTER TABLE "Notification" ADD COLUMN "decision" TEXT;
ALTER TABLE "Notification" ADD COLUMN "decidedAt" TIMESTAMP(3);
