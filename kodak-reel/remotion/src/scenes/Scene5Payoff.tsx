/**
 * Scene 5 — the payoff.
 * "That same year, Instagram sold for a billion dollars — thirteen employees."
 *
 * The money shot, and the one place this reel diverges emotionally from the
 * Netflix one: the payoff belongs to *somebody else entirely*. So the room is
 * deliberately cheap — brick, cable, one bare bulb. The contrast with a
 * hundred-year-old empire is the point.
 *
 * There is no light in the plate. The glow is four stacked radial gradients on
 * screen blend plus one blurred funnel beam, all parented to the lamp so they
 * swing with it. Everything here is drawn, not photographed.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Plate } from "../Plate";
import { FilmLook, type Grade } from "../FilmLook";
import { PencilOval, SerifLine } from "../Type";
import { HEIGHT, WIDTH, drift, ease, holdSwitch, posterizeTime } from "../engine";

const GRADE: Grade = { saturate: 0.86, contrast: 1.04, sepia: 0.12, brightness: 0.95 };

/** Where the bulb is. All five light layers hang off this point. */
const BULB = { x: 590, y: 345 };

/**
 * The phone flicker — hold keyframes only, no fades. It has to read as a
 * notification storm, not a lamp. Fade any of these and it becomes a lamp.
 */
const PHONE_ON: ReadonlyArray<readonly [number, number]> = [
  [23, 28],
  [32, 61],
  [64, 71],
];

export const Scene5Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  // The vintage focus-hunt: open wide and defocused, whoosh in as focus clears
  // by 21, dip out again 43-63, then creep to 1.08 on the money shot.
  const camScale =
    p < 21
      ? ease(p, [0, 21], [0.88, 1], Easing.out(Easing.cubic))
      : ease(p, [21, 170], [1, 1.08], Easing.inOut(Easing.quad));

  const defocus =
    p < 21
      ? ease(p, [0, 21], [16, 0])
      : p < 43
        ? 0
        : p < 63
          ? Math.sin(((p - 43) / 20) * Math.PI) * 11
          : 0;

  const isDefocused = defocus > 1.5;
  const phoneHot = holdSwitch(frame, PHONE_ON);

  // The lamp swings ~3deg over ~2s; the whole light rig is parented to it.
  const swing = drift(frame, { amplitude: 3, periodInFrames: 60, stepped: false });

  return (
    <FilmLook grade={GRADE}>
      <AbsoluteFill style={{ backgroundColor: "#0a0704" }}>
        <AbsoluteFill
          style={{ transform: `scale(${camScale})`, transformOrigin: "50% 52%" }}
        >
          <AbsoluteFill style={{ filter: `blur(${defocus}px)` }}>
            <Plate src="loft-bg.png" style={{ width: "100%", height: "100%" }} tint="#241c15" />
            <Plate
              src="founder-char.png"
              fit="contain"
              style={{
                position: "absolute",
                left: "50%",
                bottom: HEIGHT * 0.08,
                width: WIDTH * 0.66,
                height: HEIGHT * 0.56,
                marginLeft: -(WIDTH * 0.66) / 2,
              }}
              tint="#3c3226"
            />
            <Plate
              src="loft-desk.png"
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                height: HEIGHT * 0.3,
              }}
              tint="#2b241b"
            />
          </AbsoluteFill>

          {/* --- the phone, and its chartreuse notification flicker ----- */}
          <div
            style={{
              position: "absolute",
              left: WIDTH * 0.62,
              bottom: HEIGHT * 0.19,
              width: 120,
              height: 210,
              filter: `blur(${defocus}px)`,
            }}
          >
            <Plate src="phone-cut.png" fit="contain" style={{ width: "100%", height: "100%" }} tint="#191410" />
            {phoneHot ? (
              <div style={{ position: "absolute", inset: 0 }}>
                <Plate
                  src="phone-cut.png"
                  fit="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    filter: "sepia(1) saturate(5) hue-rotate(18deg) brightness(1.3)",
                  }}
                  tint="#d8ff2e"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: -40,
                    background:
                      "radial-gradient(circle, rgba(200,255,60,0.45) 0%, rgba(200,255,60,0) 70%)",
                    mixBlendMode: "screen",
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* --- the lamp and its five drawn light layers --------------- */}
          <LampRig frame={frame} swing={swing} defocused={isDefocused} />
        </AbsoluteFill>

        {/* --- headline ------------------------------------------------ */}
        <div style={{ position: "absolute", left: 76, top: 250 }}>
          {/* the oval scribbles around "billion" — that is the word the line
              is actually about, and the one the VO leans on */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <SerifLine frame={frame} at={9} size={88}>
              A billion
            </SerifLine>
            <PencilOval
              frame={frame}
              from={31}
              to={40}
              width={470}
              style={{ position: "absolute", left: -38, top: -26 }}
            />
          </div>
          <SerifLine frame={frame} at={26} size={88}>
            dollars
          </SerifLine>
          <SerifLine frame={frame} at={46} size={64}>
            thirteen employees
          </SerifLine>
        </div>

        {/* --- the counter-tell: the last canister, leaving ------------- */}
        <div style={{ position: "absolute", left: 76, bottom: 150 }}>
          <SerifLine frame={frame} at={72} size={44} opacity={0.9}>
            not one roll of film
          </SerifLine>
        </div>
        <FilmCanister frame={frame} />
      </AbsoluteFill>
    </FilmLook>
  );
};

/**
 * The lamp light. Four radial gradients on screen blend, plus a funnel beam
 * sent down behind the character to catch the brick.
 *
 * The focus response matters more than it sounds: when the lens defocuses, the
 * hot core has to bloom to ~2.4x into a soft bokeh disc and the halo has to
 * grow. Skip that and the glow looks pasted on the instant the lens softens.
 */
const LampRig: React.FC<{ frame: number; swing: number; defocused: boolean }> = ({
  swing,
  defocused,
}) => {
  const coreScale = defocused ? 2.4 : 1;
  const haloScale = defocused ? 1.45 : 1;
  const coreBlur = defocused ? 14 : 0;

  const layer = (
    size: number,
    background: string,
    scale = 1,
    blur = 0,
  ): React.CSSProperties => ({
    position: "absolute",
    left: BULB.x,
    top: BULB.y,
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: "50%",
    background,
    mixBlendMode: "screen",
    transform: `scale(${scale})`,
    filter: blur ? `blur(${blur}px)` : undefined,
    pointerEvents: "none",
  });

  return (
    <AbsoluteFill
      style={{ transform: `rotate(${swing}deg)`, transformOrigin: `${BULB.x}px 0px` }}
    >
      {/* the funnel beam, behind everything, edges masked off */}
      <div
        style={{
          position: "absolute",
          left: BULB.x,
          top: BULB.y,
          width: 620,
          height: 1100,
          marginLeft: -310,
          background:
            "linear-gradient(180deg, rgba(255,214,150,0.42) 0%, rgba(255,200,120,0.14) 58%, rgba(255,190,100,0) 100%)",
          clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
          filter: "blur(26px)",
          mixBlendMode: "screen",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
          pointerEvents: "none",
        }}
      />

      <Plate
        src="lamp.png"
        fit="contain"
        style={{
          position: "absolute",
          left: BULB.x - 130,
          top: 0,
          width: 260,
          height: BULB.y + 40,
        }}
        tint="#574837"
      />

      {/* ambient spill -> shade mouth -> bloom halo -> white-hot core */}
      <div
        style={layer(
          900,
          "radial-gradient(circle, rgba(255,196,110,0.34) 0%, rgba(255,170,70,0) 68%)",
        )}
      />
      <div
        style={{
          ...layer(
            240,
            "radial-gradient(ellipse, rgba(255,226,170,0.9) 0%, rgba(255,200,110,0) 76%)",
          ),
          height: 130,
          marginTop: -65,
          borderRadius: "50%",
        }}
      />
      <div
        style={layer(
          360,
          "radial-gradient(circle, rgba(255,214,140,0.85) 0%, rgba(255,190,90,0.35) 42%, rgba(255,180,70,0) 74%)",
          haloScale,
          defocused ? 18 : 0,
        )}
      />
      <div
        style={layer(
          80,
          "radial-gradient(circle, #fff 0%, #fff6d8 40%, rgba(255,235,180,0) 72%)",
          coreScale,
          coreBlur,
        )}
      />
    </AbsoluteFill>
  );
};

/** One 35mm canister rolling slowly out of frame — the last one, leaving. */
const FilmCanister: React.FC<{ frame: number }> = ({ frame }) => {
  const p = posterizeTime(frame);
  if (p < 78) return null;
  const x = ease(p, [78, 170], [WIDTH * 0.42, -220]);
  const spin = ease(p, [78, 170], [0, -720]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        bottom: 62,
        width: 110,
        height: 110,
        transform: `rotate(${spin}deg)`,
        opacity: 0.85,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "#2b2b2b",
          boxShadow: "inset 0 0 0 12px #3a3a3a",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 34,
          height: 34,
          marginLeft: -17,
          marginTop: -17,
          borderRadius: "50%",
          backgroundColor: "#111",
        }}
      />
    </div>
  );
};
