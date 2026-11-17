-- Many channels on one platform (docs/plans/multi-channel.md, step 1). Additive: a Channel table with
-- Paisa Panchayat as its first row, and a channelId on the per-channel tables that defaults to it, so
-- every existing row and every current writer keeps working unchanged. ChannelDay and Breakdown keys
-- gain channelId (two channels can have the same day or scope). Nothing is dropped except one index
-- that the wider index replaces.
-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('setup', 'review', 'active', 'paused');

-- DropIndex
DROP INDEX "Breakdown_scope_kind_idx";

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "channelId" TEXT NOT NULL DEFAULT 'paisa-panchayat';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "channelId" TEXT NOT NULL DEFAULT 'paisa-panchayat';

-- AlterTable
ALTER TABLE "ChannelDay" DROP CONSTRAINT "ChannelDay_pkey",
ADD COLUMN     "channelId" TEXT NOT NULL DEFAULT 'paisa-panchayat',
ADD CONSTRAINT "ChannelDay_pkey" PRIMARY KEY ("channelId", "day", "format");

-- AlterTable
ALTER TABLE "Breakdown" DROP CONSTRAINT "Breakdown_pkey",
ADD COLUMN     "channelId" TEXT NOT NULL DEFAULT 'paisa-panchayat',
ADD CONSTRAINT "Breakdown_pkey" PRIMARY KEY ("channelId", "scope", "kind", "key");

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "channelId" TEXT DEFAULT 'paisa-panchayat';

-- AlterTable
ALTER TABLE "AgentActivity" ADD COLUMN     "channelId" TEXT DEFAULT 'paisa-panchayat';

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "channelId" TEXT DEFAULT 'paisa-panchayat';

-- AlterTable
ALTER TABLE "Study" ADD COLUMN     "channelId" TEXT NOT NULL DEFAULT 'paisa-panchayat';

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ChannelStatus" NOT NULL DEFAULT 'setup',
    "youtubeChannelId" TEXT,
    "refreshTokenEnc" TEXT,
    "connectedAt" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- Channel #1: every existing row belongs to it (the column defaults above), so the foreign keys hold.
INSERT INTO "Channel" ("id", "name", "status", "updatedAt") VALUES ('paisa-panchayat', 'Paisa Panchayat', 'active', CURRENT_TIMESTAMP);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_youtubeChannelId_key" ON "Channel"("youtubeChannelId");

-- CreateIndex
CREATE INDEX "Topic_channelId_idx" ON "Topic"("channelId");

-- CreateIndex
CREATE INDEX "Video_channelId_status_idx" ON "Video"("channelId", "status");

-- CreateIndex
CREATE INDEX "Breakdown_channelId_scope_kind_idx" ON "Breakdown"("channelId", "scope", "kind");

-- CreateIndex
CREATE INDEX "Notification_channelId_idx" ON "Notification"("channelId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelDay" ADD CONSTRAINT "ChannelDay_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breakdown" ADD CONSTRAINT "Breakdown_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentActivity" ADD CONSTRAINT "AgentActivity_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

