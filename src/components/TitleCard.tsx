import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {theme} from '../styles/theme';

export const TitleCard: React.FC<{
  title: string;
  category: string;
  categoryColor: string;
  level: string;
  timing: string;
  instructor?: string;
  versionLabel?: string;
  durationInFrames: number;
}> = ({
  title,
  category,
  categoryColor,
  level,
  timing,
  instructor,
  versionLabel,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 200, stiffness: 120}});
  const rule = spring({
    frame: frame - 6,
    fps,
    config: {damping: 200, stiffness: 90},
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 9, durationInFrames - 1],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const metaParts = [category, level, timing].filter(Boolean);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.color.bg,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exit,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 62% 46% at 50% 58%, ${categoryColor}26 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.space.md,
          padding: `0 ${theme.safe.x}px`,
          transform: `translateY(${(1 - enter) * 34}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.display,
            fontSize: 128,
            lineHeight: 1.02,
            letterSpacing: '0.045em',
            color: theme.color.text,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
        <div
          style={{
            height: 3,
            width: 220,
            transform: `scaleX(${rule})`,
            backgroundColor: categoryColor,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: theme.font.text,
            fontSize: 33,
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: theme.color.textDim,
          }}
        >
          {metaParts.join('  ·  ')}
        </div>
        {instructor ? (
          <div
            style={{
              fontFamily: theme.font.text,
              fontSize: 26,
              fontWeight: 400,
              color: theme.color.textDim,
              opacity: 0.8,
            }}
          >
            {instructor}
          </div>
        ) : null}
        {versionLabel ? (
          <div
            style={{
              fontFamily: theme.font.text,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: categoryColor,
              border: `1px solid ${categoryColor}66`,
              borderRadius: 999,
              padding: '8px 22px',
            }}
          >
            {versionLabel}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
