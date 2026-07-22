import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import type {ThumbnailProps} from '../lib/types';
import {theme} from '../styles/theme';
import {ensureFonts} from '../lib/fonts';

export const StepThumbnail: React.FC<ThumbnailProps> = ({
  frameImage,
  title,
  category,
  categoryColor,
  level,
  viewLabel,
}) => {
  ensureFonts();
  return (
    <AbsoluteFill style={{backgroundColor: theme.color.bg}}>
      <Img
        src={staticFile(frameImage)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to top, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.35) 34%, transparent 58%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 10,
          bottom: 0,
          backgroundColor: categoryColor,
        }}
      />
      {viewLabel ? (
        <div
          style={{
            position: 'absolute',
            top: 34,
            right: 34,
            fontFamily: theme.font.text,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.color.text,
            backgroundColor: theme.color.captionBg,
            borderRadius: 999,
            padding: '10px 24px',
          }}
        >
          {viewLabel}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          bottom: 44,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.display,
            fontSize: 92,
            lineHeight: 0.98,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: theme.color.text,
            textShadow: '0 2px 24px rgba(0,0,0,0.55)',
          }}
        >
          {title}
        </div>
        <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
          <span
            style={{
              fontFamily: theme.font.text,
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: theme.color.bg,
              backgroundColor: categoryColor,
              borderRadius: 6,
              padding: '7px 18px',
            }}
          >
            {category}
          </span>
          <span
            style={{
              fontFamily: theme.font.text,
              fontSize: 25,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: theme.color.text,
              border: `2px solid ${theme.color.line}`,
              backgroundColor: theme.color.captionBg,
              borderRadius: 6,
              padding: '5px 18px',
            }}
          >
            {level}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
