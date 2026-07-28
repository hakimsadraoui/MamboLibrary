/**
 * Compositions.
 *
 * Each scene is registered on its own so it can be built and previewed in
 * isolation — that is the whole point of one file per scene. `Reel` is the
 * assembled timeline.
 */

import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./engine";
import { SCENES, TOTAL_FRAMES } from "./timeline";
import { Reel } from "./Reel";
import { Scene1Invention } from "./scenes/Scene1Invention";
import { Scene2Dismissal } from "./scenes/Scene2Dismissal";
import { Scene3Opposite } from "./scenes/Scene3Opposite";
import { Scene4Fall } from "./scenes/Scene4Fall";
import { Scene5Payoff } from "./scenes/Scene5Payoff";
import { Scene6Drawer } from "./scenes/Scene6Drawer";

const COMPONENTS = {
  Scene1Invention,
  Scene2Dismissal,
  Scene3Opposite,
  Scene4Fall,
  Scene5Payoff,
  Scene6Drawer,
} as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {SCENES.map((scene) => (
      <Composition
        key={scene.id}
        id={scene.id}
        component={COMPONENTS[scene.id]}
        durationInFrames={scene.durationInFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);
