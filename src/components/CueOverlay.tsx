import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CueOverlay as Cue} from '../lib/types';
import {theme} from '../styles/theme';

/**
 * Instructional cues ("Weight transfer", "Prep on 6", "Common mistake").
 * Anchored right side, vertically centered zone — clear of the dancer's
 * feet (bottom) and the section badge (top-left).
 */
export const CueOverlays: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const active = cues.filter((c) => t >= c.start && t <= c.end);

  return (
    <div
      style={{
        position: 'absolute',
        right: theme.safe.x,
        top: theme.safe.top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 14,
      }}
    >
      {active.map((cue) => {
        const inFrames = (t - cue.start) * fps;
        const outFrames = (cue.end - t) * fps;
        const opacity = Math.min(
          interpolate(inFrames, [0, 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          interpolate(outFrames, [0, 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        );
        const isMistake = cue.kind === 'mistake';
        return (
          <div
            key={`${cue.start}-${cue.text}`}
            style={{
              backgroundColor: theme.color.panel,
              borderRight: `4px solid ${
                isMistake ? theme.color.accentHot : theme.color.accent
              }`,
              borderRadius: theme.radius.sm,
              padding: '14px 24px',
              maxWidth: 520,
              opacity,
              transform: `translateX(${(1 - opacity) * 16}px)`,
            }}
          >
            {isMistake ? (
              <div
                style={{
                  fontFamily: theme.font.text,
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: theme.color.accentHot,
                  marginBottom: 4,
                }}
              >
                Common mistake
              </div>
            ) : null}
            <div
              style={{
                fontFamily: theme.font.text,
                fontSize: 28,
                fontWeight: 500,
                color: theme.color.text,
                textAlign: 'right',
              }}
            >
              {cue.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
