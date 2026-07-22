import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CountOverlaySpec} from '../lib/types';
import {theme} from '../styles/theme';

/**
 * Animated count strip (1–8 for Mambo). Only rendered when counts were
 * confidently identified — uncertain counts are omitted and flagged for
 * review instead.
 */
export const CountOverlay: React.FC<{spec: CountOverlaySpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const totalCounts = spec.sequence.length * spec.cycles;
  const elapsed = (t - spec.startAt) / spec.secondsPerCount;
  const visible = elapsed >= -0.5 && elapsed < totalCounts + 0.5;
  if (!visible) {
    return null;
  }
  const currentIndex =
    elapsed >= 0
      ? Math.floor(elapsed % spec.sequence.length)
      : -1;
  const opacity = Math.min(
    interpolate(elapsed, [-0.5, 0], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(elapsed, [totalCounts, totalCounts + 0.5], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 46,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 10,
        opacity,
      }}
    >
      {spec.sequence.map((count, i) => {
        const isActive = i === currentIndex;
        // Mambo On2: the break steps are on 2 and 6 — subtly emphasised.
        const isBreak = count === '2' || count === '6';
        return (
          <div
            key={`${count}-${i}`}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.font.display,
              fontSize: 30,
              letterSpacing: '0.02em',
              color: isActive ? theme.color.bg : theme.color.text,
              backgroundColor: isActive
                ? isBreak
                  ? theme.color.accentHot
                  : theme.color.accent
                : theme.color.captionBg,
              border: isBreak
                ? `2px solid ${isActive ? 'transparent' : theme.color.accentHot + '88'}`
                : '2px solid transparent',
              transform: isActive ? 'scale(1.14)' : 'scale(1)',
            }}
          >
            {count}
          </div>
        );
      })}
    </div>
  );
};
