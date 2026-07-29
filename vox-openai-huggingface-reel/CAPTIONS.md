# Captions — safe zones for Reels and TikTok

## Why these are separate files

The Higgsfield assembler burns captions server-side, but its subtitle option
takes exactly one parameter — `font`, from a fixed list of four. There is no
size, no position, no margin control, and the schema is closed
(`additionalProperties: false`). So the first cut's `anton` captions are
whatever size and position the backend chose, which cannot be steered toward a
platform safe zone.

Controlled captions therefore have to be burned outside that step. This folder
carries the cue files; `master-clean.mp4` (the no-caption assembly) is the
video to burn them onto.

## The safe area

Both apps overlay their own UI on top of your video. Anything underneath is
either hidden or unreadable. Worst case of the two, at 1080×1920:

| Edge | Reserve | What lives there |
|---|---|---|
| Top | 250px | IG header; TikTok's Following / For You tabs |
| Bottom | 560px | TikTok username + caption + music ticker + nav bar — taller than IG's stack, so it sets the limit |
| Right | 200px | like / comment / share / spinning audio disc |
| Left | 60px | general bleed |

The master is 720×1280, so every figure scales by 2/3:

| Edge | 1080×1920 | 720×1280 |
|---|---|---|
| Top | 250 | 167 |
| Bottom | 560 | **373** |
| Right | 200 | **133** |
| Left | 60 | 40 |

`captions.ass` bottom-anchors text with `MarginV: 373`, putting the lowest text
pixel at y=907 of 1280 — 71% down the frame, clear of both bottom stacks and
still low enough to read as a caption rather than a title.

`MarginL` and `MarginR` are both set to 133 rather than 40/133. Asymmetric
margins would centre the text between them and visually shove it left of frame
centre; equal margins keep it optically centred while still clearing the
right-hand button rail.

## Font size

`Fontsize: 36` at 720px wide — 5% of frame width, about 54px at 1080×1920.
Burned social captions typically run 6–8% of width, so this is noticeably
smaller while staying legible at arm's length on a phone. Adjust `FONT_SIZE` in
`build-captions.py` and re-run to change it; everything else follows.

## Timing

Cue times are computed, not transcribed. The assembler gives every block a
fixed 10s window, centres a take shorter than the window, and speed-compresses
a longer one to fit — so each block's span is known exactly, and phrases inside
it are given time in proportion to their character count. Every block
re-anchors to its own 10s boundary, so timing cannot drift across the reel.
35 cues, last one ending at 60.000s.

## Burning them in

```sh
ffmpeg -i master-clean.mp4 -vf "ass=captions.ass" -c:a copy reel-captioned.mp4
```

`captions.ass` names the **Anton** font. If it isn't installed locally, either
install it or change `FONT_NAME` in `build-captions.py` to something you have —
otherwise libass silently substitutes a default and the sizing shifts.

Over the busier collage blocks (5 and 6 especially), a solid backing plate
reads better than an outline. Swap `BorderStyle` from `1` to `3` in the style
line for an opaque box.

## The other option

`captions.srt` is the same cues without styling — import it into CapCut,
Premiere, or Resolve and style there. This is usually the better route: you get
to see the result, and both apps rank native/imported captions more favourably
than burned-in pixels for accessibility. Uploading `master-clean.mp4` and using
the app's own caption tool works too, and keeps the text inside the safe zone
automatically.
