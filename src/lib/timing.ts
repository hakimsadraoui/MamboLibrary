import type {ClipSection} from './types';
import {theme} from '../styles/theme';

export const FPS = 30;

export interface SectionPlacement {
  section: ClipSection;
  /** First frame of this section on the clip timeline */
  from: number;
  /** Number of frames the section occupies */
  duration: number;
}

export interface ClipLayout {
  titleFrames: number;
  placements: SectionPlacement[];
  recapFrames: number;
  totalFrames: number;
}

export const secondsToFrames = (s: number, fps: number = FPS) =>
  Math.round(s * fps);

/**
 * Lays the clip out on a single timeline:
 * [title card] [section 1] [section 2] … [recap]
 * Sections butt together with a short audio/visual crossfade handled
 * inside the composition (each section keeps its full frames).
 */
export const layoutClip = (
  sections: ClipSection[],
  fps: number = FPS,
): ClipLayout => {
  const titleFrames = secondsToFrames(2.0, fps);
  const recapFrames = secondsToFrames(theme.recap.seconds, fps);
  let cursor = titleFrames;
  const placements: SectionPlacement[] = sections.map((section) => {
    const duration = Math.max(
      1,
      secondsToFrames(section.sourceEnd - section.sourceStart, fps),
    );
    const placement = {section, from: cursor, duration};
    cursor += duration;
    return placement;
  });
  return {
    titleFrames,
    placements,
    recapFrames,
    totalFrames: cursor + recapFrames,
  };
};

export const parseTimecode = (tc: string): number => {
  if (!tc) return 0;
  const parts = tc.split(':').map((p) => parseFloat(p));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  return parts.reduce((acc, part) => acc * 60 + part, 0);
};

export const formatTimecode = (totalSeconds: number): string => {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
};
