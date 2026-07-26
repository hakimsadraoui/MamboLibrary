---
workflow: general-video
flow: automation
storyboard: no
message: "The wrong turn was the right one — someone was waiting all along"
destination: youtube-shorts
aspect: 1080x1920
language: en
length: 28s
angle: story
---

## Intent

Episode of a daily stickman storytelling channel. A tired man boards the wrong
bus at the last stop of the night, watches the city turn into streets he has
never seen, and is stranded — until one lit window turns the mistake into the
point. Hand-drawn doodle on ruled notebook paper: black ink, one red accent
(his scarf), generous negative space.

This project is a **footage remix**, not a fresh generation. The six scene clips
and the end card were generated manually in Higgsfield; HyperFrames owns the
retime, the hook, the captions, the end card, and the mix. It is built to be
reused as the channel's per-episode template — swap the assets, move the
caption timings, re-render.

## Assets

- assets/body.mp4 — six Higgsfield clips, retimed and concatenated (26.125s, 24fps, silent).
- assets/mix.m4a — narration re-timed to the scene boundaries, with the clips' own
  generated ambience ducked underneath (27.525s, −14.5 LUFS).
- assets/endscreen.png — FOLLOW FOR MORE card, pre-scaled from 1536×2752 to 1080×1920.

## Customizations

- Hook plate in frame one ("He got on the wrong bus.") — states the stakes before
  the story starts, held 3.2s.
- Nine caption plates timed to the narration's measured phrase spans, positioned
  below the characters' faces at all times.
- End card cross-fades in over 0.4s rather than hard-cutting; it is tonally much
  heavier than the film and a hard cut reads as a slam.

## Notes

- Caption timings are derived from measured silence boundaries in the voiceover plus
  proportional word distribution inside each phrase — **not** word-level ASR. Hugging
  Face is blocked by the sandbox network policy, so local transcription was not
  available. Expect sub-second drift; re-time if a caption visibly lags.
- The ambience bed comes from the source clips' own generated audio, which was never
  auditioned. If it contains artifacts, drop `[amb]` from the mix and re-render.
- GSAP is vendored at `vendor/gsap.min.js`. The CDN is unreachable from this
  environment, and render-time network fetches break determinism regardless.
- Trim points came from per-scene motion energy: scene 1 keeps its tail (motion peaks
  at 4–5s on the look-up) and loses its static head; scenes 3 and 4 lose their tails.
- Scene 6 remains the least dynamic scene in the film. It is the payoff and should be
  the most dynamic — regenerate it before this template is reused.
