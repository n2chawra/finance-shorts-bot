import React from "react";
import { Composition, Still } from "remotion";
import "./design/fonts";
import { calculateStoryMetadata, StoryVideo, type StoryProps } from "./compositions/StoryVideo";
import { calculateThumbnailMetadata, THUMB, Thumbnail } from "./compositions/Thumbnail";
import type { Timeline } from "./contract/timeline";
import sample from "./fixtures/sample-timeline.json";
import { ActingTest } from "./sheets/ActingTest";
import { AVATAR, BANNER, ChannelAvatar, ChannelBanner } from "./sheets/ChannelArt";
import { CharacterSheet } from "./sheets/CharacterSheet";
import { Promo, type PromoProps } from "./promo/Promo";
import { PromoThumb } from "./promo/Thumb";
import { ChannelAvatar as GlobalAvatar, ChannelBanner as GlobalBanner } from "./promo/Channel";

export const Root: React.FC = () => (
  <>
    {/* the real compositions: a timeline from renderer/timeline/build.py comes in as --props */}
    <Composition id="Story" component={StoryVideo} calculateMetadata={calculateStoryMetadata}
      defaultProps={{ timeline: sample as unknown as Timeline } satisfies StoryProps}
      durationInFrames={300} fps={30} width={1920} height={1080} />
    <Still id="Thumbnail" component={Thumbnail} calculateMetadata={calculateThumbnailMetadata}
      defaultProps={{ timeline: sample as unknown as Timeline } satisfies StoryProps} width={THUMB.width} height={THUMB.height} />
    {/* approval sheets */}
    <Still id="CharacterSheet" component={CharacterSheet} width={1920} height={1080} />
    <Composition id="ActingTest" component={ActingTest} durationInFrames={300} fps={30} width={1920} height={1080} />
    {/* channel art (assets/channel/): `npx remotion still src/index.ts ChannelAvatar|ChannelBanner <out.png>` */}
    <Still id="ChannelAvatar" component={ChannelAvatar} width={AVATAR.width} height={AVATAR.height} />
    <Still id="ChannelBanner" component={ChannelBanner} width={BANNER.width} height={BANNER.height} />
    {/* the owner's own explainer: how the channel's motion graphics are made with Claude + Remotion */}
    <Composition id="Promo" component={Promo} fps={30} width={1920} height={1080} durationInFrames={300}
      defaultProps={{ scenes: [], durationInFrames: 300 } satisfies PromoProps}
      calculateMetadata={({ props }) => ({ durationInFrames: props.durationInFrames || 300 })} />
    <Still id="PromoThumb" component={PromoThumb} width={1280} height={720} />
    <Still id="GlobalBanner" component={GlobalBanner} width={2560} height={1440} defaultProps={{ guides: false }} />
    <Still id="GlobalAvatar" component={GlobalAvatar} width={800} height={800} />
  </>
);
