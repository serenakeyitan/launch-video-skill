import React from "react";
import { Composition } from "remotion";
import { FPS, W, H } from "./theme";
import { Demo, TOTAL } from "./Demo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TdocDemo"
    component={Demo}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
  />
);
