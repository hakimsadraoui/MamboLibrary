/**
 * The film treatment. Wrap any scene in this and it reads as aged film.
 *
 * Written once, inherited by all six scenes — which is why every scene file
 * below is only about its own choreography and never about the look.
 *
 * On this reel the treatment is doing double duty: the story is *about* film,
 * so the grain and the sprocket holes are subject matter, not decoration.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, staticFile } from "remotion";
import { gateWeave, posterizeTime } from "./engine";

export type Grade = {
  saturate: number;
  contrast: number;
  sepia: number;
  brightness: number;
};

/** The house grade. Warmer and more Kodachrome than neutral. */
export const DEFAULT_GRADE: Grade = {
  saturate: 0.9,
  contrast: 1.06,
  sepia: 0.2,
  brightness: 0.95,
};

/** Scenes 4 and 6 sit lower and colder than the rest for the sombre beat. */
export const SOMBRE_GRADE: Grade = {
  saturate: 0.6,
  contrast: 1.12,
  sepia: 0.1,
  brightness: 0.92,
};

export type FilmLookProps = {
  children: React.ReactNode;
  grade?: Grade;
  scanLines?: boolean;
  textures?: boolean;
  vignette?: boolean;
  weave?: boolean;
  /** 35mm perforations down both edges. Off by default; on for the film beats. */
  sprockets?: boolean;
  weaveTravel?: number;
};

export const FilmLook: React.FC<FilmLookProps> = ({
  children,
  grade = DEFAULT_GRADE,
  scanLines = true,
  textures = true,
  vignette = true,
  weave = true,
  sprockets = false,
  weaveTravel = 5,
}) => {
  const frame = useCurrentFrame();
  const w = weave ? gateWeave(frame, weaveTravel) : { x: 0, y: 0 };

  // One hole every ~40 frames, stepped so the pull is mechanical.
  const sprocketOffset = (posterizeTime(frame) / 40) * 46;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          // The scale-up is not cosmetic — it is what stops the weave from
          // revealing an edge as it jitters the frame around.
          transform: `translate(${w.x}px, ${w.y}px) scale(1.012)`,
          filter: `saturate(${grade.saturate}) contrast(${grade.contrast}) sepia(${grade.sepia}) brightness(${grade.brightness})`,
        }}
      >
        {children}

        {textures ? (
          <>
            <AbsoluteFill
              style={{
                backgroundImage: `url(${staticFile("assets/grain.jpg")})`,
                backgroundSize: "cover",
                mixBlendMode: "multiply",
                filter: "invert(1) brightness(1.35) contrast(1.02)",
                opacity: 0.55,
                pointerEvents: "none",
              }}
            />
            <AbsoluteFill
              style={{
                backgroundImage: `url(${staticFile("assets/grunge.jpg")})`,
                backgroundSize: "cover",
                mixBlendMode: "color-burn",
                opacity: 0.16,
                pointerEvents: "none",
              }}
            />
          </>
        ) : null}

        {scanLines ? (
          <AbsoluteFill
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1.6px, rgba(0,0,0,0) 1.6px, rgba(0,0,0,0) 8px)",
              filter: "blur(0.7px)",
              pointerEvents: "none",
            }}
          />
        ) : null}

        {sprockets ? (
          <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.12 }}>
            <SprocketColumn side="left" offset={sprocketOffset} />
            <SprocketColumn side="right" offset={sprocketOffset} />
          </AbsoluteFill>
        ) : null}

        {vignette ? (
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 92% 82% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SprocketColumn: React.FC<{ side: "left" | "right"; offset: number }> = ({
  side,
  offset,
}) => (
  <div
    style={{
      position: "absolute",
      top: -46,
      bottom: -46,
      [side]: 18,
      width: 34,
      backgroundImage:
        "repeating-linear-gradient(180deg, #fff 0px, #fff 26px, rgba(0,0,0,0) 26px, rgba(0,0,0,0) 46px)",
      backgroundPositionY: `${offset % 46}px`,
      borderRadius: 4,
    }}
  />
);
