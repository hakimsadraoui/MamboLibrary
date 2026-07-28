/**
 * Scene 2 — the dismissal.
 * "He showed his bosses. They told him it was cute — but don't tell anyone."
 *
 * The villain scene. Character on a sunburst, two props swinging in from
 * opposite edges inside hand-drawn diamonds, a number that slams, and a
 * punctuation flash.
 *
 * The two props are the whole argument of the scene: the future in one hand,
 * the cash cow in the other. And the number lands by being *small* — 0.01
 * megapixels is a pathetic spec, and they were still wrong to bury it.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Plate } from "../Plate";
import { FilmLook } from "../FilmLook";
import { MarigoldBox } from "../Type";
import {
  HEIGHT,
  WIDTH,
  boil,
  drift,
  ease,
  easeStepped,
  entrance,
  holdSwitch,
  posterizeTime,
} from "../engine";

const NEGATIVE_BURSTS = [
  [165, 167],
  [170, 172],
  [176, 178],
] as const;

const BW_AT = 174;

export const Scene2Dismissal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  const negative = holdSwitch(frame, NEGATIVE_BURSTS);
  const bw = frame >= BW_AT;

  // Exec: springs up at 84, punches in 96-116, then holds with a gentle sway.
  const rise = entrance(frame, { delay: 84, stiffness: 58, mass: 1.0 });
  const punch = ease(p, [96, 116], [1, 1.09], Easing.out(Easing.quad));
  const sway = drift(frame, { amplitude: 1.1, periodInFrames: 120 });

  return (
    <FilmLook>
      <AbsoluteFill
        style={{
          filter: negative ? "invert(1) hue-rotate(180deg)" : undefined,
        }}
      >
        <Sunburst />

        {/* --- the exec ------------------------------------------------ */}
        <AbsoluteFill
          style={{
            transform: `translateY(${(1 - rise) * 420}px) scale(${punch}) rotate(${sway * 0.25}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <Plate
            src="exec.png"
            fit="contain"
            style={{
              position: "absolute",
              left: "50%",
              bottom: -40,
              width: WIDTH * 0.82,
              height: HEIGHT * 0.72,
              marginLeft: -(WIDTH * 0.82) / 2,
              filter: bw ? "grayscale(1) contrast(1.18)" : undefined,
            }}
            tint="#2a1c10"
          />

          {/* cigarette smoke. Screen blend drops the black out of the plume;
              the contrast crush kills the lifted background the codec leaves
              behind, and the mask feathers the top so it trails off. Swap this
              div for <Video> once smoke.mp4 is in public/assets. */}
          <div
            style={{
              position: "absolute",
              left: "26%",
              top: "18%",
              width: WIDTH * 0.36,
              height: HEIGHT * 0.3,
              mixBlendMode: "screen",
              filter: "contrast(1.5) brightness(0.92)",
              opacity: ease(p, [92, 120], [0, 0.85]),
              WebkitMaskImage:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, #000 34%, #000 100%)",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, #000 34%, #000 100%)",
            }}
          >
            <Plate src="smoke.mp4" style={{ width: "100%", height: "100%" }} tint="#1a1a1a" />
          </div>

          {/* the darkroom-red safelight burning out of his eyes */}
          {bw ? <SafelightEyes frame={frame} /> : null}
        </AbsoluteFill>

        {/* --- the two props ------------------------------------------- */}
        <DiamondProp
          frame={frame}
          at={17}
          from="left"
          src="hand-left.png"
          top={HEIGHT * 0.13}
        />
        <DiamondProp
          frame={frame}
          at={47}
          from="right"
          src="hand-right.png"
          top={HEIGHT * 0.42}
        />

        {/* --- the number ---------------------------------------------- */}
        <SlotMachine frame={frame} />

        {/* --- the yellow caption -------------------------------------- */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 210,
            gap: 16,
          }}
        >
          <MarigoldBox frame={frame} at={130}>
            don&rsquo;t tell
          </MarigoldBox>
          <MarigoldBox frame={frame} at={148}>
            anyone
          </MarigoldBox>
        </AbsoluteFill>
      </AbsoluteFill>
    </FilmLook>
  );
};

const Sunburst: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 130% 95% at 50% 30%, #F2B01E 0%, #C4820F 52%, #6E4707 100%)",
    }}
  >
    <AbsoluteFill style={{ opacity: 0.12 }}>
      <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <polygon
              key={i}
              points={`540,576 ${540 + Math.cos(a) * 2400},${576 + Math.sin(a) * 2400} ${
                540 + Math.cos(a + 0.07) * 2400
              },${576 + Math.sin(a + 0.07) * 2400}`}
              fill="#ffe9b0"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * A prop sliding in from one edge inside a hand-drawn wireframe diamond.
 * The diamond draws on with a dashed stroke and wobbles on an 8fps boil —
 * slower than the 12fps everything else runs at, so it reads as drawn by hand
 * rather than rendered.
 */
const DiamondProp: React.FC<{
  frame: number;
  at: number;
  from: "left" | "right";
  src: string;
  top: number;
}> = ({ frame, at, from, src, top }) => {
  const slide = entrance(frame, { delay: at, stiffness: 46, mass: 1.05 });
  const dir = from === "left" ? -1 : 1;
  const x = (1 - slide) * dir * WIDTH * 0.9;
  const wobble = boil(frame, { amplitude: 1.6, seed: at, stepFps: 8 });
  const draw = ease(frame, [at + 4, at + 22], [0, 1]);
  const size = WIDTH * 0.46;

  return (
    <div
      style={{
        position: "absolute",
        top,
        [from]: WIDTH * 0.06,
        width: size,
        height: size,
        transform: `translateX(${x}px) rotate(${wobble}deg)`,
      }}
    >
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon
          points="100,8 192,100 100,192 8,100"
          fill="none"
          stroke="#ffe9b0"
          strokeWidth={3}
          strokeDasharray="14 9"
          strokeDashoffset={520 * (1 - draw)}
          opacity={0.85}
          pathLength={520}
        />
      </svg>
      <Plate
        src={src}
        fit="contain"
        style={{ position: "absolute", inset: "16%", width: "68%", height: "68%" }}
        tint="#3d3226"
      />
    </div>
  );
};

/**
 * The slot machine. Spins values past from 72 to 82 and slams to a stop on
 * MEGAPIXELS, with 0.01 locking in first. The landing shake is two 2-frame
 * steps — never a smooth settle, or it stops reading as a mechanism.
 */
const SlotMachine: React.FC<{ frame: number }> = ({ frame }) => {
  const REEL = ["GIGAPIXELS", "KILOPIXELS", "TERAPIXELS", "MEGAPIXELS"] as const;
  const SPIN_FROM = 72;
  const SPIN_TO = 82;

  if (frame < SPIN_FROM) return null;

  const spinning = frame < SPIN_TO;
  const word = spinning ? REEL[Math.floor(frame * 1.6) % REEL.length] : "MEGAPIXELS";
  const number = frame >= SPIN_TO - 4 ? "0.01" : "—";

  // two 2-frame shake steps on landing
  const shake = holdSwitch(frame, [
    [SPIN_TO, SPIN_TO + 1],
    [SPIN_TO + 3, SPIN_TO + 4],
  ])
    ? 7
    : 0;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${shake ? -shake : 0}px, ${shake}px)`,
      }}
    >
      <div style={{ textAlign: "center", opacity: easeStepped(frame, [SPIN_FROM, SPIN_FROM + 3], [0, 1]) }}>
        <div
          style={{
            fontFamily: "'Archivo', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: 210,
            lineHeight: 1,
            color: "#fff",
            letterSpacing: "-0.04em",
            textShadow: "0 10px 0 rgba(0,0,0,0.35)",
          }}
        >
          {number}
        </div>
        <div
          style={{
            fontFamily: "'Archivo', Helvetica, Arial, sans-serif",
            fontWeight: 900,
            fontSize: 92,
            letterSpacing: "0.04em",
            color: "#2a1c04",
          }}
        >
          {word}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SafelightEyes: React.FC<{ frame: number }> = ({ frame }) => {
  const bloom = ease(frame, [BW_AT, BW_AT + 10], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: HEIGHT * 0.3,
        gap: 78,
        flexDirection: "row",
        opacity: bloom,
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "#ff2d17",
            boxShadow: `0 0 ${40 * bloom}px ${16 * bloom}px rgba(255,45,23,0.85), 0 0 ${
              150 * bloom
            }px ${60 * bloom}px rgba(255,45,23,0.4)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
