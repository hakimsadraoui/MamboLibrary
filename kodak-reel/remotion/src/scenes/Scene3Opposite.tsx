/**
 * Scene 3 — the opposite.
 * "So everyone else built the opposite. No film. No prints. No waiting."
 *
 * Three negations in the line, so three objects on screen — this scene writes
 * itself. The papers enter from three *different* edges: three arriving from
 * the same side reads as a slideshow, three from three sides reads as montage.
 *
 * The spring is the number to guard. Stiffness ~42 with mass ~1.1 glides in
 * over ~0.9s and settles with a small bounce. Crank the stiffness and they
 * snap in like UI toasts, which is the giveaway that a computer made it.
 */

import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Plate } from "../Plate";
import { FilmLook } from "../FilmLook";
import { SerifLine } from "../Type";
import { HEIGHT, WIDTH, boil, ease, entrance, posterizeTime } from "../engine";

type Paper = {
  src: string;
  at: number;
  from: "left" | "right" | "bottom";
  x: number;
  y: number;
  rotate: number;
  startRotate: number;
};

const PAPERS: readonly Paper[] = [
  { src: "news-nofilm.png", at: 20, from: "left", x: 470, y: 980, rotate: -7, startRotate: -26 },
  { src: "news-noprints.png", at: 60, from: "right", x: 620, y: 940, rotate: 6, startRotate: 22 },
  { src: "news-nowaiting.png", at: 100, from: "bottom", x: 540, y: 1010, rotate: -3, startRotate: 14 },
];

export const Scene3Opposite: React.FC = () => {
  const frame = useCurrentFrame();
  const p = posterizeTime(frame);

  // Focus-hunt on the open — a blur clearing over the first ~14 frames — plus
  // a slow Ken-Burns push that runs the whole scene.
  const hunt = ease(p, [0, 14], [14, 0]);
  const ken = ease(p, [0, 150], [1.04, 1.13], Easing.out(Easing.quad));

  return (
    <FilmLook>
      <AbsoluteFill style={{ backgroundColor: "#241a10", filter: `blur(${hunt}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${ken})`, transformOrigin: "50% 55%" }}>
          <Plate src="wood-desk.jpg" style={{ width: "100%", height: "100%" }} tint="#4a3b28" />

          {PAPERS.map((paper, i) => (
            <React.Fragment key={paper.src}>
              <Negatives frame={frame} at={paper.at} index={i} x={paper.x} y={paper.y} />
              <NewspaperPlate frame={frame} paper={paper} />
            </React.Fragment>
          ))}
        </AbsoluteFill>

        {/* desk vignette, tighter than the film-look one */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 74% 62% at 50% 56%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.72) 100%)",
            pointerEvents: "none",
          }}
        />

        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 210 }}
        >
          <SerifLine
            frame={frame}
            at={4}
            size={70}
            opacity={ease(p, [40, 48], [1, 0])}
          >
            built the opposite.
          </SerifLine>
        </AbsoluteFill>
      </AbsoluteFill>
    </FilmLook>
  );
};

const NewspaperPlate: React.FC<{ frame: number; paper: Paper }> = ({ frame, paper }) => {
  const land = entrance(frame, { delay: paper.at, stiffness: 42, mass: 1.1 });
  const w = WIDTH * 0.56;
  const h = w * 1.34;

  const offX =
    paper.from === "left" ? -WIDTH * 1.1 : paper.from === "right" ? WIDTH * 1.1 : 0;
  const offY = paper.from === "bottom" ? HEIGHT * 0.9 : paper.from === "left" ? 260 : -180;

  const x = paper.x + (1 - land) * offX;
  const y = paper.y + (1 - land) * offY;
  const rotate = paper.startRotate + (paper.rotate - paper.startRotate) * land;
  const scale = 1.1 - 0.1 * land;
  const wobble = boil(frame, { amplitude: 0.5, seed: paper.at });

  if (frame < paper.at) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        transform: `rotate(${rotate + wobble}deg) scale(${scale})`,
        filter: "drop-shadow(-18px 26px 34px rgba(0,0,0,0.55))",
      }}
    >
      <Plate src={paper.src} fit="contain" style={{ width: "100%", height: "100%" }} tint="#d9d2bc" />
    </div>
  );
};

/**
 * Spent 35mm negatives scattering under each paper as it lands — the dead
 * format piling up while the headlines announce the new one. Same landing
 * frame, 0.6x the travel.
 */
const Negatives: React.FC<{
  frame: number;
  at: number;
  index: number;
  x: number;
  y: number;
}> = ({ frame, at, index, x, y }) => {
  const land = entrance(frame, { delay: at, stiffness: 42, mass: 1.1 });
  if (frame < at) return null;

  return (
    <>
      {Array.from({ length: 4 }, (_, i) => {
        const seed = index * 4 + i;
        const angle = ((seed * 47) % 180) - 90;
        const dx = (((seed * 31) % 200) - 100) * 3.1;
        const dy = (((seed * 17) % 120) - 60) * 2.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + dx * land,
              top: y + 180 + dy * land,
              width: 250,
              height: 62,
              marginLeft: -125,
              transform: `rotate(${angle}deg) translateY(${(1 - land) * 0.6 * 400}px)`,
              backgroundColor: "#241c12",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 4px, rgba(0,0,0,0) 4px 9px), repeating-linear-gradient(0deg, rgba(255,240,200,0.16) 0 5px, rgba(0,0,0,0) 5px 57px)",
              borderRadius: 3,
              opacity: 0.9 * land,
              filter: "drop-shadow(-6px 8px 10px rgba(0,0,0,0.5))",
            }}
          />
        );
      })}
    </>
  );
};
