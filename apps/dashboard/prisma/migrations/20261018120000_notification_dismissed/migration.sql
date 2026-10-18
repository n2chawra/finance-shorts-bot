-- When the owner marked a notification resolved: it stays closed for a week even if its check still fails.
ALTER TABLE "Notification" ADD COLUMN "dismissedAt" TIMESTAMP(3);
