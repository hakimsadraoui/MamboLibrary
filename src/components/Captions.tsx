import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {CaptionCue} from '../lib/types';
import {theme} from '../styles/theme';

/**
 * Burned-in captions. Positioned top-centre so the dancer's feet are never
 * obscured. Max two lines; cue splitting is handled by scripts/captions.mjs.
 */
export const Captions: React.FC<{cues: CaptionCue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top: theme.safe.top + 84,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: theme.color.captionBg,
          borderRadius: theme.radius.sm,
          padding: '12px 28px',
          maxWidth: 1280,
          fontFamily: theme.font.text,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.35,
          color: theme.color.text,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
