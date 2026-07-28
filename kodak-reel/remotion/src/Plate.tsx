/**
 * A single flat image layer — a "plate".
 *
 * The whole reel is flat plates animated against each other; there is no 3D
 * anywhere. When the underlying file is missing, Plate draws a labelled
 * stand-in at the same size and position instead of failing the render, so
 * every scene's choreography is testable before the art arrives. Swapping a
 * placeholder for the real thing means dropping the file into public/assets
 * and running `npm run sync-assets` — no code change.
 */

import React from "react";
import { Img, staticFile } from "remotion";
import { hasAsset } from "./assets";

export type PlateProps = {
  /** Filename inside public/assets, e.g. "lab-bg.png". */
  src: string;
  style?: React.CSSProperties;
  fit?: React.CSSProperties["objectFit"];
  /** Placeholder tint. Only ever seen while the asset is missing. */
  tint?: string;
  className?: string;
};

export const Plate: React.FC<PlateProps> = ({
  src,
  style,
  fit = "cover",
  tint = "#3a3a44",
}) => {
  if (hasAsset(src)) {
    return (
      <Img
        src={staticFile(`assets/${src}`)}
        style={{ objectFit: fit, ...style }}
      />
    );
  }
  return <PlaceholderPlate src={src} style={style} tint={tint} />;
};

const PlaceholderPlate: React.FC<{
  src: string;
  style?: React.CSSProperties;
  tint: string;
}> = ({ src, style, tint }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tint,
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 14px, rgba(0,0,0,0) 14px, rgba(0,0,0,0) 28px)",
      border: "3px dashed rgba(255,255,255,0.35)",
      boxSizing: "border-box",
      overflow: "hidden",
      ...style,
    }}
  >
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 34,
        color: "rgba(255,255,255,0.82)",
        textAlign: "center",
        padding: "0 18px",
        lineHeight: 1.35,
        wordBreak: "break-word",
      }}
    >
      {src}
    </span>
  </div>
);
