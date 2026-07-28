/**
 * The shared motion engine. Every scene imports from here.
 *
 * The one idea that matters: nothing in this reel moves on a smooth 30fps
 * curve. Time is snapped to 12fps steps first, then fed into the easing — so
 * movement stutters like stop-motion instead of gliding. That single decision
 * is most of the reel's texture.
 */

import { interpolate, spring } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const POSTERIZE_FPS = 12;

/**
 * Snap a frame to POSTERIZE_FPS steps.
 *
 * At 30fps into 12fps steps the stride is 2.5 frames, so the returned value is
 * fractional — that is deliberate. Feed it to interpolate() in place of the
 * raw frame and every derived value inherits the judder for free.
 */
export const posterizeTime = (
  frame: number,
  fps: number = FPS,
  stepFps: number = POSTERIZE_FPS,
): number => {
  const stride = fps / stepFps;
  return Math.floor(frame / stride) * stride;
};

/** Deterministic 0..1 noise. Same input, same output on every render pass. */
const hash = (n: number): number => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** Deterministic -1..1 noise. */
const snoise = (n: number): number => hash(n) * 2 - 1;

/**
 * Boil — the constant hand-made wobble that keeps a flat cut-out alive.
 * Stepped by default, because a smooth boil just looks like drift.
 */
export const boil = (
  frame: number,
  {
    amplitude = 1,
    seed = 0,
    stepFps = POSTERIZE_FPS,
    fps = FPS,
  }: { amplitude?: number; seed?: number; stepFps?: number; fps?: number } = {},
): number => {
  const stepped = posterizeTime(frame, fps, stepFps);
  return snoise(stepped + seed * 1000) * amplitude;
};

/** A boil applied to x, y and rotation at once — the usual way it's used. */
export const boilTransform = (
  frame: number,
  {
    position = 2,
    rotation = 0.6,
    seed = 0,
    stepFps = POSTERIZE_FPS,
  }: { position?: number; rotation?: number; seed?: number; stepFps?: number } = {},
): { x: number; y: number; rotate: number } => ({
  x: boil(frame, { amplitude: position, seed, stepFps }),
  y: boil(frame, { amplitude: position, seed: seed + 7, stepFps }),
  rotate: boil(frame, { amplitude: rotation, seed: seed + 13, stepFps }),
});

/**
 * Drift — a slow sine. Use it for anything that should breathe rather than
 * travel: a character's scale, a lamp's swing, a cloud of dust.
 */
export const drift = (
  frame: number,
  {
    amplitude = 1,
    periodInFrames = 120,
    phase = 0,
    stepped = true,
    stepFps = POSTERIZE_FPS,
  }: {
    amplitude?: number;
    periodInFrames?: number;
    phase?: number;
    stepped?: boolean;
    stepFps?: number;
  } = {},
): number => {
  const t = stepped ? posterizeTime(frame, FPS, stepFps) : frame;
  return Math.sin((t / periodInFrames) * Math.PI * 2 + phase) * amplitude;
};

/** Pingpong — a 0..1 triangle that walks up and back down forever. */
export const pingpong = (frame: number, periodInFrames = 60): number => {
  const t = (frame % periodInFrames) / periodInFrames;
  return t < 0.5 ? t * 2 : 2 - t * 2;
};

/**
 * Entrance — a spring for things popping into place.
 * Defaults are deliberately soft (low stiffness, a little mass) so props glide
 * in over ~0.9s and settle with a small bounce. Crank the stiffness and
 * everything snaps in like a UI toast, which is the tell that a computer made it.
 */
export const entrance = (
  frame: number,
  {
    delay = 0,
    fps = FPS,
    stiffness = 42,
    mass = 1.1,
    damping = 12,
  }: {
    delay?: number;
    fps?: number;
    stiffness?: number;
    mass?: number;
    damping?: number;
  } = {},
): number =>
  spring({
    frame: frame - delay,
    fps,
    config: { stiffness, mass, damping },
  });

/**
 * A decaying oscillation — amplitude * cos(t * frequency) * e^(-decay * t).
 *
 * This is the finale's drawer slam, and it is the same rig as any wag or
 * wobble: only the axis it drives changes. The exponential envelope is what
 * sells it as something with mass; constant amplitude reads as a cartoon.
 */
export const decayOscillate = (
  frame: number,
  {
    start = 0,
    amplitude = 34,
    frequency = 0.6,
    decay = 0.05,
  }: { start?: number; amplitude?: number; frequency?: number; decay?: number } = {},
): number => {
  const t = frame - start;
  if (t < 0) return 0;
  return amplitude * Math.cos(t * frequency) * Math.exp(-decay * t);
};

/**
 * Hold keyframes — instant on, instant off, no interpolation.
 *
 * Every physical, camera-like event in this reel runs through here: the
 * negative flash, the phone flicker, the window that dies in one frame. The
 * moment one of them eases, it stops reading as a camera artefact.
 */
export const holdSwitch = (
  frame: number,
  ranges: ReadonlyArray<readonly [number, number]>,
): boolean => ranges.some(([from, to]) => frame >= from && frame <= to);

/**
 * A blur burst that ramps up and back down across three frame marks.
 * Peaks where the camera is fastest, which is what hides the seam in a
 * zoom-through.
 */
export const blurBurst = (
  frame: number,
  [from, peak, to]: readonly [number, number, number],
  peakBlur = 9,
): number => {
  if (frame <= from || frame >= to) return 0;
  return frame <= peak
    ? interpolate(frame, [from, peak], [0, peakBlur])
    : interpolate(frame, [peak, to], [peakBlur, 0]);
};

/**
 * Gate weave — the whole frame jitters a few pixels on the 12fps step, the way
 * film does moving through a projector gate. Always paired with a small
 * scale-up so the weave never reveals an edge.
 */
export const gateWeave = (
  frame: number,
  travel = 5,
): { x: number; y: number } => ({
  x: boil(frame, { amplitude: travel, seed: 3 }),
  y: boil(frame, { amplitude: travel, seed: 9 }),
});

/** Clamped interpolate — the 95% case, without repeating the options object. */
export const ease = (
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number],
  easing?: (t: number) => number,
): number =>
  interpolate(frame, input as [number, number], output as [number, number], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** The same, but on posterized time — the default for anything visible. */
export const easeStepped = (
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number],
  easing?: (t: number) => number,
): number => ease(posterizeTime(frame), input, output, easing);
