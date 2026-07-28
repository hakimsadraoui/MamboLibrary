/**
 * Scene 1 — the invention.
 * "In 1975, a young Kodak engineer built the world's first digital camera."
 *
 * The portal zoom-through. A black-and-white photo hangs framed on a museum
 * wall and the camera flies straight through the frame into the picture, which
 * blooms into colour as it lands.
 *
 * The trick is not the zoom, it is the WELD. For the first two seconds the
 * photo and the gold frame must move as one rigid object — content scale is
 * locked to a fixed multiple of the wall scale. Let them drift apart even
 * slightly before the detach and the illusion dies instantly: it stops being a
 * camera moving and becomes two layers scaling at different rates.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Plate } from "../Plate";
import { FilmLook } from "../FilmLook";
import { Plaque, SerifLine } from "../Type";
import {
  HEIGHT,
  WIDTH,
  blurBurst,
  drift,
  ease,
  easeStepped,
  posterizeTime,
} from "../engine";

/** Content scale is always this multiple of the wall scale, until the detach. */
const WELD = 0.369;
const DETACH = 62;

/** Photo base size, sized so the weld lands it exactly full-frame at 6.8x. */
const PHOTO_W = WIDTH / (WELD * 6.8);
const PHOTO_H = HEIGHT / (WELD * 6.8);

export const Scene1Invention: React.FC = () => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  // Slow push, then the acceleration through the frame.
  const wallScale =
    p <= 46
      ? ease(p, [0, 46], [1, 1.16], Easing.out(Easing.quad))
      : ease(p, [46, 76], [1.16, 6.8], Easing.in(Easing.quad));

  // Welded until DETACH, then the frame keeps accelerating out while the photo
  // settles into place and cross-fades to colour.
  const detached = p > DETACH;
  const goldScale = detached ? ease(p, [DETACH, DETACH + 14], [1, 3.4], Easing.in(Easing.quad)) : 1;
  const goldOpacity = detached ? ease(p, [DETACH, DETACH + 12], [1, 0]) : 1;
  const photoScale = detached ? ease(p, [DETACH, 72], [0.75, 1], Easing.out(Easing.quad)) : 1;
  const grayscale = detached ? ease(p, [DETACH, 72], [1, 0]) : 1;

  // Blur burst, peaking where the camera is fastest — this is what hides the
  // seam at the detach.
  const burst = blurBurst(p, [54, 61, 72], 9);

  // The wall exits on its own. It must not carry the photo out with it, which
  // is why the stage is a sibling of the wall and not a child.
  const wallFade = ease(p, [52, 72], [1, 0]);
  const wallBlur = ease(p, [52, 72], [0, 8]);

  return (
    <FilmLook sprockets>
      <AbsoluteFill style={{ backgroundColor: "#0d0a07" }}>
        {/* --- the museum wall --------------------------------------- */}
        <AbsoluteFill
          style={{
            transform: `scale(${wallScale})`,
            transformOrigin: "50% 46%",
            opacity: wallFade,
            filter: `blur(${wallBlur + burst}px)`,
          }}
        >
          <Plate src="wall.jpg" style={{ width: "100%", height: "100%" }} tint="#c3b795" />
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: HEIGHT * 0.58,
            }}
          >
            <Plaque>In 1975</Plaque>
          </AbsoluteFill>
        </AbsoluteFill>

        {/* --- the stage: photo + frame, welded to the wall's scale ---- */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              width: PHOTO_W,
              height: PHOTO_H,
              transform: `scale(${WELD * wallScale})`,
              filter: `blur(${burst / Math.max(1, WELD * wallScale)}px)`,
            }}
          >
            {/* the picture itself */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                transform: `scale(${photoScale})`,
                filter: `grayscale(${grayscale})`,
              }}
            >
              <LabInterior frame={frame} width={PHOTO_W} height={PHOTO_H} />
            </div>

            {/* the gold frame is a ring ON TOP of the photo, never a container
                around it — otherwise fading it out fades the picture too */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: `${PHOTO_W * 0.055}px solid #c9a13a`,
                boxShadow:
                  "0 0 0 4px #7a5d14, inset 0 0 0 4px #7a5d14, 0 30px 60px -20px rgba(0,0,0,0.7)",
                transform: `scale(${goldScale})`,
                opacity: goldOpacity,
                pointerEvents: "none",
              }}
            />
          </div>
        </AbsoluteFill>

        {/* --- captions over the settled lab --------------------------- */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 300,
            textAlign: "center",
          }}
        >
          <div>
            <SerifLine frame={frame} at={86}>
              the world&rsquo;s first
            </SerifLine>
            <SerifLine frame={frame} at={98}>
              digital camera
            </SerifLine>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </FilmLook>
  );
};

/** What is inside the photo — and, after the fly-through, the whole frame. */
const LabInterior: React.FC<{ frame: number; width: number; height: number }> = ({
  frame,
  width,
  height,
}) => {
  // Two dust plates sliding left at different rates so they parallax, each
  // with a lazy vertical sine so the motes hang rather than slide.
  const dust1X = easeStepped(frame, [0, 135], [0, -525]);
  const dust2X = dust1X * 0.6;
  const dust1Y = drift(frame, { amplitude: 14, periodInFrames: 150 });
  const dust2Y = drift(frame, { amplitude: 14, periodInFrames: 190, phase: 1.4 });

  // Character boil — breathe the scale +/-0.5%, sway +/-0.5deg over ~140
  // frames, both on the 12fps step so a flat cut-out reads as alive.
  const breathe = 1 + drift(frame, { amplitude: 0.005, periodInFrames: 96 });
  const sway = drift(frame, { amplitude: 0.5, periodInFrames: 140 });

  // The prototype tell: a soft warm glow behind the object in his hands, so
  // the eye goes to the thing and not the face.
  const glow = 0.35 + (drift(frame, { amplitude: 1, periodInFrames: 50 }) + 1) * 0.175;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Plate src="lab-bg.png" style={{ width: "100%", height: "100%" }} tint="#3a3227" />

      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        <Plate
          src="dust1.png"
          style={{
            position: "absolute",
            width: "160%",
            height: "100%",
            left: 0,
            transform: `translate(${dust1X}px, ${dust1Y}px)`,
            opacity: 0.55,
          }}
          tint="#101010"
        />
        <Plate
          src="dust2.png"
          style={{
            position: "absolute",
            width: "160%",
            height: "100%",
            left: 0,
            transform: `translate(${dust2X}px, ${dust2Y}px)`,
            opacity: 0.4,
          }}
          tint="#0c0c0c"
        />
      </div>

      {/* the warm pulse behind the prototype */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          width: width * 0.42,
          height: width * 0.42,
          marginLeft: -width * 0.21,
          marginTop: -width * 0.21,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,224,160,0.95) 0%, rgba(255,196,110,0) 68%)",
          mixBlendMode: "screen",
          opacity: glow,
        }}
      />

      <Plate
        src="sasson-portrait.png"
        fit="contain"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: width * 0.62,
          height: height * 0.78,
          marginLeft: -(width * 0.62) / 2,
          transform: `scale(${breathe}) rotate(${sway}deg)`,
          transformOrigin: "50% 100%",
        }}
        tint="#4a3a28"
      />
    </div>
  );
};
