import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import { SpikeLong } from "./SpikeLong";

export const Root: React.FC = () => (
  <>
    <Composition id="Short" component={Short} durationInFrames={750} fps={30} width={1080} height={1920} />
    <Composition id="SpikeLong" component={SpikeLong} durationInFrames={9000} fps={30} width={1920} height={1080} />
  </>
);
