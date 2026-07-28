# kodak-reel — the Remotion project

The reel itself, built from prompts `01`–`08` in `../prompts/`. 1080×1920, 30fps,
920 frames (30.7s).

```bash
npm install
npm run dev          # Remotion Studio — preview and tune
npm run build        # render out/kodak-reel.mp4
npm run typecheck
npm run sync-assets  # after dropping new files into public/assets
```

## It runs before the art exists

Most of the image assets aren't in the repo yet (see `../build-assets/ASSETS.md`).
That doesn't block anything: `<Plate>` draws a labelled stand-in at the correct
size and position whenever a file is missing, so every scene's choreography is
already testable. The full reel renders today.

Dropping a real asset in is not a code change:

```bash
cp ~/Downloads/lab-bg.png public/assets/
npm run sync-assets
```

`sync-assets` regenerates `src/assets.ts`, and `<Plate src="lab-bg.png">` starts
rendering the photograph instead of the placeholder.

## Layout

| File | What it is |
|---|---|
| `src/engine.ts` | The shared motion toolkit. Everything else imports it. |
| `src/FilmLook.tsx` | The treatment wrapper — grade, grain, scan lines, vignette, gate weave, sprocket edge. |
| `src/Plate.tsx` | One flat image layer, with the missing-asset fallback. |
| `src/Type.tsx` | The two type voices plus the hand-drawn underline and pencil oval. |
| `src/timeline.ts` | Scene durations and the VO line each one is cut to. |
| `src/scenes/*` | One file per scene, one prompt per file. |
| `src/Reel.tsx` | The six scenes laid end to end. |
| `src/Root.tsx` | Compositions — the reel, plus each scene on its own. |

Every scene is registered as its own composition, so you can open
`Scene4Fall` in Studio and work on it without scrubbing past the other five.

## The three things not to break

**Time is posterized before it is eased.** `posterizeTime()` snaps the frame to
12fps steps; feed that to `interpolate()` instead of the raw frame and every
derived value inherits the judder. Ease the raw frame anywhere and that scene
will glide while the other five stutter.

**Hold keyframes stay hard.** The negative flash, the phone flicker, the window
that dies at frame 96 — all of them go through `holdSwitch()`. Instant on,
instant off. The moment one eases it stops reading as a camera artefact and
starts reading as CSS.

**Scene 6 is a clone, not a rebuild.** It imports `GroundedFall` from
`Scene4Fall.tsx`. The finale has to match the fall it echoes, so changes to the
parallax punch or the cast shadow belong in that shared component — don't let
the two drift apart.

## Not wired up yet

- **Audio.** The voiceover is the source code: once `vo.mp3` exists, add it as a
  single `<Audio>` across the whole composition in `Reel.tsx`, then nudge the
  per-scene durations in `timeline.ts` until each scene lands on its line. Don't
  cut the VO into six pieces. SFX and the music bed come after (prompt `10`).
- **`smoke.mp4`** in Scene 2 is a `<Plate>` standing in for a `<Video>`; the
  screen blend, contrast crush and top-edge mask around it are already in place.
- **Fonts.** Playfair Display and Archivo are referenced by name and currently
  fall back to system serif/sans. Add `@remotion/google-fonts` for the real cut.

## Tuning notes

Values worth touching first in Studio, all of them per the prompts:

- `FilmLook`'s scan lines are per spec (1.6px at 16% every 8px) but read heavy
  on flat placeholder plates. Re-judge once real photographs are behind them.
- The Scene 3 spring is deliberately soft — stiffness 42, mass 1.1. Raising the
  stiffness is the fastest way to make the reel look computer-made.
- Scene 4 and 6 share `GROUND = { x: 560, y: 1690 }`. Both the building and the
  character scale around that one point, not the frame centre.
