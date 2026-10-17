import React from "react";
import { Composition, Still } from "remotion";
import "./design/fonts";
import { calculateStoryMetadata, StoryVideo, type StoryProps } from "./compositions/StoryVideo";
import { calculateThumbnailMetadata, THUMB, Thumbnail } from "./compositions/Thumbnail";
import type { Timeline } from "./contract/timeline";
import sample from "./fixtures/sample-timeline.json";
import { ActingTest } from "./sheets/ActingTest";
import { CharacterSheet } from "./sheets/CharacterSheet";

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
  </>
);
