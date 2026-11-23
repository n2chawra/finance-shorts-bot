-- "Delete channel" on the Channels page (2026-11-23): the channel is marked deleting at once (no more
-- uploads, hidden from the switcher), then delete-channel.yml purges its rows and the Channel row itself.
-- AlterEnum
ALTER TYPE "ChannelStatus" ADD VALUE 'deleting';
