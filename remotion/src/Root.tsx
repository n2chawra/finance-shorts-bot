import React from "react";
import { Composition, Still } from "remotion";
import "./design/fonts";
import { ActingTest } from "./sheets/ActingTest";
import { CharacterSheet } from "./sheets/CharacterSheet";

export const Root: React.FC = () => (
  <>
    <Still id="CharacterSheet" component={CharacterSheet} width={1920} height={1080} />
    <Composition id="ActingTest" component={ActingTest} durationInFrames={300} fps={30} width={1920} height={1080} />
  </>
);
