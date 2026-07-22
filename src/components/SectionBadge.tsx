import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {theme} from '../styles/theme';

export const SectionBadge: React.FC<{
  label: string;
  color: string;
  sectionDuration: number;
}> = ({label, color, sectionDuration}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, sectionDuration - 10, sectionDuration - 1],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: theme.safe.top,
        left: theme.safe.x,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.color.panel,
        borderRadius: 999,
        padding: '12px 26px',
        opacity,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      <div
        style={{
          fontFamily: theme.font.text,
          fontSize: 25,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: theme.color.text,
        }}
      >
        {label}
      </div>
    </div>
  );
};
