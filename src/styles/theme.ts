// Design system tokens shared by every Remotion composition.
// The web library mirrors these in app/src/styles.css custom properties.

export const theme = {
  color: {
    bg: '#0E0E11',
    bgElevated: '#17171C',
    panel: 'rgba(14, 14, 17, 0.82)',
    text: '#F5F2EC',
    textDim: '#B8B4AC',
    accent: '#E8B44F',
    accentHot: '#E4574C',
    line: 'rgba(245, 242, 236, 0.14)',
    captionBg: 'rgba(10, 10, 12, 0.72)',
    good: '#7FB35C',
    warn: '#E8B44F',
  },
  font: {
    display: "'Bebas Neue', 'DejaVu Sans', sans-serif",
    text: "'Inter', 'DejaVu Sans', sans-serif",
  },
  // 1080p canvas reference values
  space: {xs: 8, sm: 16, md: 28, lg: 48, xl: 84},
  radius: {sm: 8, md: 14, lg: 24},
  /** Safe margins so text clears player controls / mobile UI */
  safe: {x: 96, top: 72, bottom: 132},
  titleCard: {
    minSeconds: 1.8,
    maxSeconds: 2.4,
  },
  recap: {seconds: 3.2},
  crossfadeSeconds: 0.4,
} as const;

export type Theme = typeof theme;
