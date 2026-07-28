/**
 * Scene 4 — the fall.
 * "By 2012, Kodak had filed for bankruptcy and switched off its film plants."
 *
 * Two flat images. No 3D, no camera projection, no depth pass. The entire
 * sense of dimension comes from one decision: THE MAN SCALES FASTER THAN THE
 * BUILDING. Plant goes 1.0 -> 1.12, man goes 1.0 -> 1.7. That mismatch is what
 * the eye reads as "he is closer than the wall".
 *
 * And the anchor is everything. Both scale around ONE ground point at his feet,
 * not the frame centre. Scale from the centre and he slides up off the
 * pavement like a sticker.
 *
 * Scene 6 clones this file. Anything changed here should stay shared, or be
 * lifted into props — do not let the two drift apart.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Plate } from "../Plate";
import { FilmLook, SOMBRE_GRADE } from "../FilmLook";
import { HandUnderline, SerifLine, StackedLines } from "../Type";
import { HEIGHT, WIDTH, ease, posterizeTime } from "../engine";

/** The single ground point everything is anchored to. */
export const GROUND = { x: 560, y: 1690 };

export type FallSceneProps = {
  /** Background plate — the dead plant in Scene 4, the emptied lab in Scene 6. */
  backgroundSrc: string;
  /** Character cut-out. */
  characterSrc: string;
  /**
   * Character aspect. Scene 6's engineer is taller and narrower than Scene 4's
   * exec (1696x2528 against 1792x2400) — reuse Scene 4's width unchanged and
   * he stretches, which is exactly the correction the finale prompt asks for.
   */
  characterAspect: number;
  /** Scene 4 slides the man left to clear the right side. Scene 6 does not. */
  shift?: number;
  children?: React.ReactNode;
};

/**
 * The shared rig: grounded parallax punch + the cast shadow that is really the
 * character. Both scenes render through this.
 */
export const GroundedFall: React.FC<FallSceneProps> = ({
  backgroundSrc,
  characterSrc,
  characterAspect,
  shift = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  const buildingScale = ease(p, [8, 80], [1, 1.12], Easing.out(Easing.quad));
  const manScale = ease(p, [0, 58], [1, 1.7], Easing.out(Easing.quad));

  // The shift, with a motion-blur streak peaking mid-move.
  const shiftX = shift ? ease(p, [60, 86], [0, shift], Easing.inOut(Easing.quad)) : 0;
  const streak = shift
    ? p > 60 && p < 86
      ? Math.sin(((p - 60) / 26) * Math.PI) * 16
      : 0
    : 0;

  const manW = HEIGHT * 0.62 * characterAspect;
  const manH = HEIGHT * 0.62;

  return (
    <>
      {/* --- the building ---------------------------------------------- */}
      <AbsoluteFill
        style={{
          transform: `scale(${buildingScale})`,
          transformOrigin: `${GROUND.x}px ${GROUND.y}px`,
        }}
      >
        <Plate src={backgroundSrc} style={{ width: "100%", height: "100%" }} tint="#4a4438" />
      </AbsoluteFill>

      {/* --- the shadow IS the man -------------------------------------
          No shadow asset exists. This is the same cut-out, painted pure black,
          flipped down from the feet and skewed so it lies along the ground. */}
      <div
        style={{
          position: "absolute",
          left: GROUND.x + shiftX,
          top: GROUND.y,
          width: manW,
          height: manH,
          marginLeft: -manW / 2,
          marginTop: -manH,
          transform: `scale(${manScale}) scaleY(-0.55) skewX(-53deg)`,
          transformOrigin: "50% 100%",
          filter: "brightness(0) blur(7px)",
          opacity: 0.55,
        }}
      >
        <Plate src={characterSrc} fit="contain" style={{ width: "100%", height: "100%" }} tint="#000" />
      </div>

      {/* --- the man --------------------------------------------------- */}
      <div
        style={{
          position: "absolute",
          left: GROUND.x + shiftX,
          top: GROUND.y,
          width: manW,
          height: manH,
          marginLeft: -manW / 2,
          marginTop: -manH,
          transform: `scale(${manScale})`,
          transformOrigin: "50% 100%",
          filter: streak ? `blur(${streak}px)` : undefined,
        }}
      >
        <Plate src={characterSrc} fit="contain" style={{ width: "100%", height: "100%" }} tint="#3a2a1a" />
      </div>

      {children}
    </>
  );
};

export const Scene4Fall: React.FC = () => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  // The last light: a bank of lit windows that snaps to black on ONE hold
  // keyframe at 96. No fade. One frame, and the building is dead — it does
  // more for the line than any camera move could.
  const windowsLit = frame < 96;

  return (
    <FilmLook grade={SOMBRE_GRADE}>
      <AbsoluteFill style={{ backgroundColor: "#15130f" }}>
        <GroundedFall
          backgroundSrc="kodak-plant-bg.png"
          characterSrc="grim-exec.png"
          characterAspect={1792 / 2400}
          shift={-235}
        >
          {windowsLit ? (
            <div
              style={{
                position: "absolute",
                left: WIDTH * 0.12,
                top: HEIGHT * 0.44,
                width: WIDTH * 0.3,
                height: HEIGHT * 0.07,
                background:
                  "linear-gradient(180deg, rgba(255,214,150,0.55), rgba(255,190,110,0.22))",
                filter: "blur(9px)",
                mixBlendMode: "screen",
              }}
            />
          ) : null}
        </GroundedFall>

        {/* --- left line, dimming back as the man moves ----------------- */}
        <StackedLines
          frame={frame}
          lines={["filed for", "chapter", "eleven"]}
          start={24}
          dimAt={60}
          style={{ position: "absolute", left: 72, top: 300 }}
        />

        {/* --- right line, with the underline and a focus vignette ------ */}
        <div style={{ position: "absolute", right: 72, top: 980, textAlign: "right" }}>
          <SerifLine frame={frame} at={70} size={68} fadeFrames={8}>
            the film plants
          </SerifLine>
          <SerifLine frame={frame} at={74} size={68} fadeFrames={8}>
            went dark
          </SerifLine>
          <HandUnderline
            frame={frame}
            from={78}
            to={92}
            width={440}
            style={{ marginTop: 10, marginLeft: "auto" }}
          />
        </div>

        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 56% 30% at 68% 56%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.62) 100%)",
            opacity: ease(p, [70, 88], [0, 1]),
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </FilmLook>
  );
};
