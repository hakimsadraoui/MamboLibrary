/**
 * The main timeline — all six scenes laid end to end.
 *
 * Audio is intentionally not wired up yet. The voiceover is the source code:
 * once vo.mp3 exists, drop it in here as a single <Audio> across the whole
 * composition, then nudge the per-scene durations in timeline.ts until each
 * scene lands on its line. Do not cut the VO into six pieces.
 */

import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SCENES } from "./timeline";
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

export const Reel: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SCENES.map((scene) => {
        const Component = COMPONENTS[scene.id];
        const from = at;
        at += scene.durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
            name={scene.label}
          >
            <Component />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
