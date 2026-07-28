/**
 * Scene 6 — the drawer. The finale.
 * "Kodak invented the future, then locked it in a drawer."
 *
 * This scene is a CLONE of Scene 4, not a rebuild. It imports the same
 * GroundedFall rig — same parallax punch off the feet, same cast shadow, same
 * push, same treatment, same posterize. Rebuilding it from scratch only gets
 * you a finale that doesn't quite match the fall it is echoing.
 *
 * What changes: the character is the engineer decades older, the background is
 * the Scene 1 lab now stripped and empty (we end where we started), he stays
 * centred, and one new element carries the punchline.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FilmLook, SOMBRE_GRADE } from "../FilmLook";
import { SerifLine, StackedLines } from "../Type";
import { WIDTH, decayOscillate, ease, holdSwitch, posterizeTime } from "../engine";
import { GroundedFall } from "./Scene4Fall";

const DRAWER_IN = 24;
/** Where the slide-in ends and the slam/rattle takes over. */
const DRAWER_SLAM = DRAWER_IN + 12;
/** One 2-frame negative blink, six frames after the drawer settles. */
const BLINK: ReadonlyArray<readonly [number, number]> = [[118, 120]];

export const Scene6Drawer: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = holdSwitch(frame, BLINK);

  return (
    <FilmLook grade={SOMBRE_GRADE} sprockets>
      <AbsoluteFill
        style={{
          backgroundColor: "#15130f",
          filter: blink ? "invert(1) hue-rotate(180deg)" : undefined,
        }}
      >
        <GroundedFall
          backgroundSrc="lab-bg.png"
          characterSrc="old-sasson.png"
          // Taller and narrower than Scene 4's exec — reuse that width
          // unchanged and he stretches.
          characterAspect={1696 / 2528}
        />

        <StackedLines
          frame={frame}
          lines={["Kodak invented", "the future"]}
          start={8}
          size={82}
          style={{ position: "absolute", left: 72, top: 290 }}
        />
        <div style={{ position: "absolute", left: 72, top: 520 }}>
          <SerifLine frame={frame} at={40} size={72}>
            then filed it away
          </SerifLine>
        </div>

        <Drawer frame={frame} />
      </AbsoluteFill>
    </FilmLook>
  );
};

/**
 * The drawer. Slides in from the right, then slams shut and rattles:
 *
 *   34px * cos(t * 0.6) * e^(-0.05t)
 *
 * That is the same decaying-oscillation rig as any wag or wobble — only the
 * axis changed, translation instead of rotation. The exponential envelope is
 * what sells it as metal; constant amplitude reads as a cartoon.
 */
const Drawer: React.FC<{ frame: number }> = ({ frame }) => {
  const p = posterizeTime(frame);
  if (p < DRAWER_IN) return null;

  const slideIn = ease(p, [DRAWER_IN, DRAWER_SLAM], [0, 1]);
  const scale = 0.72 + 0.28 * slideIn;
  const entryX = (1 - slideIn) * 620;
  const rattle = p >= DRAWER_SLAM ? decayOscillate(p, { start: DRAWER_SLAM }) : 0;
  const w = 320;

  // The dust puff out of the seam, on the frame it slams.
  const puff = ease(p, [DRAWER_SLAM, DRAWER_SLAM + 10], [0, 1]);
  const puffing = p >= DRAWER_SLAM && p <= DRAWER_SLAM + 10;

  return (
    <div
      style={{
        position: "absolute",
        left: WIDTH * 0.52,
        top: 700,
        width: w,
        transform: `translateX(${entryX + rattle}px) scale(${scale})`,
        transformOrigin: "50% 50%",
        opacity: ease(p, [DRAWER_IN, DRAWER_IN + 4], [0, 1]),
      }}
    >
      <svg viewBox="0 0 260 150" style={{ width: "100%", display: "block" }}>
        <rect x="6" y="10" width="248" height="130" rx="7" fill="#3d4348" stroke="#20262b" strokeWidth="3" />
        <rect x="18" y="24" width="224" height="102" rx="4" fill="#4c545a" stroke="#262c31" strokeWidth="2" />
        <rect x="18" y="24" width="224" height="14" fill="#5b646b" opacity="0.55" />
        <rect x="96" y="66" width="68" height="16" rx="7" fill="#262c31" />
        <rect x="102" y="70" width="56" height="5" rx="3" fill="#6c757c" />
        <rect x="30" y="128" width="200" height="5" rx="2" fill="#20262b" opacity="0.8" />
      </svg>

      {puffing ? (
        <div style={{ position: "absolute", left: -30, top: "44%", display: "flex", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                backgroundColor: "rgba(210,200,180,0.5)",
                filter: "blur(9px)",
                transform: `scale(${0.4 + puff * (1.8 + i * 0.3)}) translateX(${-puff * 26}px)`,
                opacity: (1 - puff) * 0.95,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
