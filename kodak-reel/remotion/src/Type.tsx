/**
 * The reel's on-screen text. Two voices only:
 *   - serif italic for the narration echo (pulled straight from the VO line)
 *   - a marigold box for the one word the scene is actually about
 * Plus the hand-drawn marks — a scribbled underline and a pencil oval.
 */

import React from "react";
import { ease, easeStepped } from "./engine";

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

export const SerifLine: React.FC<{
  children: React.ReactNode;
  frame: number;
  /** Frame the line starts fading up. */
  at: number;
  fadeFrames?: number;
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ children, frame, at, fadeFrames = 8, size = 74, opacity = 1, style }) => (
  <div
    style={{
      fontFamily: SERIF,
      fontStyle: "italic",
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.16,
      color: "#fdf6e6",
      textShadow: "0 4px 26px rgba(0,0,0,0.85)",
      opacity: easeStepped(frame, [at, at + fadeFrames], [0, opacity]),
      ...style,
    }}
  >
    {children}
  </div>
);

/** Lines that stack on one at a time, one every `stagger` frames. */
export const StackedLines: React.FC<{
  lines: readonly string[];
  frame: number;
  start: number;
  stagger?: number;
  size?: number;
  /** After this frame the whole stack falls back to `fadeTo` opacity. */
  dimAt?: number;
  fadeTo?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  frame,
  start,
  stagger = 6,
  size = 78,
  dimAt,
  fadeTo = 0.3,
  style,
}) => {
  const dim =
    dimAt === undefined ? 1 : easeStepped(frame, [dimAt, dimAt + 14], [1, fadeTo]);
  return (
    <div style={style}>
      {lines.map((line, i) => (
        <SerifLine
          key={line}
          frame={frame}
          at={start + i * stagger}
          size={size}
          opacity={dim}
        >
          {line}
        </SerifLine>
      ))}
    </div>
  );
};

/** The marigold caption box — one or two words, popped in on a step. */
export const MarigoldBox: React.FC<{
  children: React.ReactNode;
  frame: number;
  at: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, frame, at, size = 82, style }) => {
  const pop = easeStepped(frame, [at, at + 5], [0.82, 1]);
  const opacity = easeStepped(frame, [at, at + 4], [0, 1]);
  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: "#FFBE2E",
        color: "#16110D",
        fontFamily: "'Archivo', Helvetica, Arial, sans-serif",
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "-0.02em",
        padding: "6px 26px",
        borderRadius: 6,
        transform: `scale(${pop})`,
        opacity,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A hand-drawn yellow underline that draws itself on. */
export const HandUnderline: React.FC<{
  frame: number;
  from: number;
  to: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({ frame, from, to, width = 520, style }) => {
  const draw = ease(frame, [from, to], [0, 1]);
  const len = 1000;
  return (
    <svg
      viewBox="0 0 1000 40"
      style={{ width, height: width * 0.04, display: "block", ...style }}
    >
      <path
        d="M8 26 C 180 12, 350 34, 520 20 S 840 10, 992 24"
        fill="none"
        stroke="#FFBE2E"
        strokeWidth={11}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    </svg>
  );
};

/** The pencil oval that scribbles around a word. */
export const PencilOval: React.FC<{
  frame: number;
  from: number;
  to: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({ frame, from, to, width = 560, style }) => {
  const draw = ease(frame, [from, to], [0, 1]);
  const len = 1400;
  return (
    <svg
      viewBox="0 0 600 200"
      style={{ width, height: width / 3, display: "block", ...style }}
    >
      <path
        d="M300 18 C 120 18, 24 62, 26 104 C 28 150, 150 184, 306 182 C 452 180, 574 148, 572 100 C 570 56, 452 22, 292 24"
        fill="none"
        stroke="#FFBE2E"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
    </svg>
  );
};

/** The small serif museum plaque under the framed photo in Scene 1. */
export const Plaque: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: SERIF,
      fontSize: 26,
      letterSpacing: "0.06em",
      color: "#3a3020",
      backgroundColor: "#b9ab89",
      border: "2px solid #8d7f5f",
      padding: "5px 22px",
      borderRadius: 3,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
