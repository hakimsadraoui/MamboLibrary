/**
 * The timeline. Every duration here was cut from the gaps between the six
 * spoken lines — the voiceover is the source code, so this file is downstream
 * of the script, never the other way round.
 *
 * Re-time the reel by editing durations here only; scenes read their own
 * length from the composition, and the main timeline lays them end to end.
 */

export const SCENES = [
  {
    id: "Scene1Invention",
    label: "1 · the invention",
    durationInFrames: 135,
    vo: "In 1975, a young Kodak engineer built the world's first digital camera.",
  },
  {
    id: "Scene2Dismissal",
    label: "2 · the dismissal",
    durationInFrames: 190,
    vo: "He showed his bosses. They told him it was cute — but don't tell anyone about it.",
  },
  {
    id: "Scene3Opposite",
    label: "3 · the opposite",
    durationInFrames: 150,
    vo: "So everyone else built the opposite. No film. No prints. No waiting.",
  },
  {
    id: "Scene4Fall",
    label: "4 · the fall",
    durationInFrames: 145,
    vo: "By 2012, Kodak had filed for bankruptcy and switched off its film plants for good.",
  },
  {
    id: "Scene5Payoff",
    label: "5 · the payoff",
    durationInFrames: 170,
    vo: "That same year, Instagram sold for a billion dollars — thirteen employees, not one roll of film.",
  },
  {
    id: "Scene6Drawer",
    label: "6 · the drawer",
    durationInFrames: 130,
    vo: "Kodak invented the future, then locked it in a drawer.",
  },
] as const;

export const TOTAL_FRAMES = SCENES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);

/** Absolute start frame of each scene on the main timeline. */
export const sceneOffsets = (): number[] => {
  let at = 0;
  return SCENES.map((s) => {
    const start = at;
    at += s.durationInFrames;
    return start;
  });
};
