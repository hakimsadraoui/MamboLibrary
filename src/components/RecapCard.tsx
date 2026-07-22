import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {theme} from '../styles/theme';

export const RecapCard: React.FC<{
  title: string;
  categoryColor: string;
  keyPoints: string[];
  practiceTip: string;
  sourceRef: {filename: string; start: string; end: string};
  musicDemoAvailable: boolean;
}> = ({title, categoryColor, keyPoints, practiceTip, sourceRef, musicDemoAvailable}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200, stiffness: 110}});
  const points = keyPoints.slice(0, 3);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.color.bg,
        justifyContent: 'center',
        padding: `0 ${theme.safe.x + 60}px`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 42% at 24% 50%, ${categoryColor}1f 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 26}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.space.md,
          maxWidth: 1240,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.text,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: categoryColor,
          }}
        >
          Key focus
        </div>
        <div
          style={{
            fontFamily: theme.font.display,
            fontSize: 76,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: theme.color.text,
            lineHeight: 1.04,
          }}
        >
          {title}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {points.map((point, i) => {
            const d = spring({
              frame: frame - 6 - i * 4,
              fps,
              config: {damping: 200, stiffness: 120},
            });
            return (
              <div
                key={point}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 18,
                  opacity: d,
                  transform: `translateX(${(1 - d) * 18}px)`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: categoryColor,
                    flexShrink: 0,
                    transform: 'translateY(-4px)',
                  }}
                />
                <div
                  style={{
                    fontFamily: theme.font.text,
                    fontSize: 37,
                    fontWeight: 500,
                    color: theme.color.text,
                  }}
                >
                  {point}
                </div>
              </div>
            );
          })}
          {practiceTip ? (
            <div
              style={{
                fontFamily: theme.font.text,
                fontSize: 29,
                fontWeight: 400,
                color: theme.color.textDim,
                marginTop: 8,
              }}
            >
              {practiceTip}
            </div>
          ) : null}
          {!musicDemoAvailable ? (
            <div
              style={{
                fontFamily: theme.font.text,
                fontSize: 23,
                fontWeight: 500,
                color: theme.color.textDim,
                opacity: 0.85,
              }}
            >
              Music demonstration unavailable
            </div>
          ) : null}
        </div>
        <div
          style={{
            marginTop: theme.space.md,
            paddingTop: theme.space.sm,
            borderTop: `1px solid ${theme.color.line}`,
            fontFamily: theme.font.text,
            fontSize: 22,
            color: theme.color.textDim,
            opacity: interpolate(frame, [fps * 0.6, fps * 1.0], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Source: {sourceRef.filename} · Original segment {sourceRef.start}–{sourceRef.end}
        </div>
      </div>
    </AbsoluteFill>
  );
};
