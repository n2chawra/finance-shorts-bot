-- The default channel moved from Paisa Panchayat (deleted 2026-11-23) to the geography channel
-- (config/channel-layout.json "default"): rows written without a channel take it.
ALTER TABLE "Topic" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "Video" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "ChannelDay" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "Breakdown" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "Notification" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "AgentActivity" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "Feedback" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
ALTER TABLE "Study" ALTER COLUMN "channelId" SET DEFAULT 'geography-maps-geopolitical-mysteries';
