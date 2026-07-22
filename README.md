# Mambo Video Library

Turns long-form Salsa/Mambo teaching videos into a **searchable library of
focused educational clips** — each with a title card, the relevant
explanation, slow/counted/music demonstrations, instructional overlays,
captions, a recap, a branded thumbnail, and full traceability back to the
original footage.

Built with **[Remotion](https://remotion.dev)** (data-driven compositions),
FFmpeg (inspection & preparation), faster-whisper (transcription), and a
static **React web library** with fuzzy search, filters and a training-grade
player (speed control, A/B looping, mirroring, captions, resume).

> Currently loaded with a tiny **synthetic demo lesson**
> (`source-videos/demo/`) that validates the whole pipeline end-to-end.
> Replace it with real footage and re-run the pipeline.

---

## Quick start

```bash
npm install                # once
npm run pipeline           # process sources → clips, thumbnails, captions, reports
npm run library:dev        # open the library at http://localhost:5173
npm run studio             # open Remotion Studio (preview/tune compositions)
```

Requirements: Node 20+, FFmpeg (`apt install ffmpeg`), and optionally
Python 3 + `npm run setup:whisper` for transcription.

## Adding new videos

1. Drop the long-form videos into `source-videos/` (sub-folders fine).
   Originals are **never modified, moved, renamed or deleted**.
   - Files too big for git (>100 MB)? Keep them local-only (the folder is
     gitignored), use Git LFS, or attach them to a **GitHub Release** and
     download them into `source-videos/`.
2. Run `npm run pipeline`. Every stage is **incremental** — only new or
   changed files are audited/prepped/transcribed, and only steps whose data
   changed are re-rendered.
3. Curate the detected steps (see *Workflow* below), re-run
   `npm run pipeline`, refresh the library.

## The workflow, stage by stage

| Command | What it does | Output |
| --- | --- | --- |
| `npm run audit` | Probes every source file (duration, resolution, fps, codecs, audio level), fingerprints it, detects likely duplicate files | `data/source-videos.json`, `reports/source-audit.md` |
| `npm run prep` | Web-compatible working copies (lossless remux when possible, else H.264/AAC transcode + loudness normalisation) | `public/sources/` |
| `npm run transcribe` | faster-whisper transcription with word timestamps (`WHISPER_MODEL=small` by default) | `data/transcripts/` |
| `npm run segment` | Proposes clip boundaries from silences, scene changes and transcript cues ("this step is called…", "5-6-7-8", "with the music") | `data/segments-draft/`, `reports/segment-drafts/` |
| `npm run segment -- --auto-steps` | Additionally creates **flagged, low-confidence step skeletons** for uncurated segments (they land in the review queue — nothing is invented silently) | `data/steps.json` |
| `npm run captions` | Clip-aligned caption cues + WebVTT files (max 2 lines, terminology fixes, top-positioned so feet stay visible) | `data/captions/`, `public/captions/` |
| `npm run render` | Renders every out-of-date clip with Remotion (title card → sections → recap; 1920×1080 H.264/AAC) | `renders/`, `public/clips/` |
| `npm run thumbnails` | Extracts the chosen frame and renders the branded thumbnail composition | `public/thumbnails/` |
| `npm run qa` | Automated checks: parses, duration matches the edit plan, A/V present, audio audible & unclipped, no unexpected black frames, captions in bounds, thumbnails exist, source untouched, timestamps sane | `reports/quality-report.md` |
| `npm run manifest` | CSV reports + syncs `data/` → `public/data/` for the static library | `reports/clip-manifest.csv`, `reports/duplicates.csv`, `reports/review-required.csv` |
| `npm run pipeline` | All of the above, in order, incrementally | everything |

## Where step editing happens

**Everything editable lives in `data/steps.json`** — one record per step
(see the demo records for the full schema): title, aliases, category, level,
timing, counts, source window (`sourceStartTime`/`sourceEndTime`), the
section-by-section edit plan (`sections[]` with per-section overlays and
optional count overlays), key points, mistakes, tips, confidence, review
flags, thumbnail frame time, and whether captions are burned in.

Categories/levels/types are configured in `data/categories.json`;
alternative spellings in `data/aliases.json` (used by search *and* caption
terminology fixing).

## Correcting a clip (feedback loop)

```bash
# Fix a title:
npm run revise -- --id step-demo-suzieq --set title="Suzie Q Variation"

# Fix clip boundaries (top-level + per-section):
npm run revise -- --id step-demo-basic --set sourceStartTime=00:00:12.8 \
  --set sections.0.sourceStart=12.8

# Clear a review flag after checking:
npm run revise -- --id step-demo-unknown1 --set title="Flare" \
  --set confidence=0.9 --set reviewRequired=false

# Correct captions: create data/captions/<stepId>.overrides.json with
# {"cues":[{"start":2.0,"end":4.5,"text":"…"}]} then run npm run revise
```

`revise` updates the record, appends to the **revision history**
(`data/revisions.json`: date, step, field, old → new, render status),
re-renders **only the affected clip**, regenerates its thumbnail and
captions, re-runs QA and the manifest. Unaffected clips are untouched.

## Review queue

Anything uncertain — names, boundaries, counts, categories, poor audio,
possible duplicates — is flagged (`reviewRequired`, `confidence`,
`reviewReason`) instead of being silently guessed:

- In the library: the **Review** page (thumbnail preview, proposed name,
  confidence, reason, alternatives, source + timestamp).
- On disk: `reports/review-required.csv`.

Confidence bands: ≥0.90 highly confident · 0.75–0.89 probably correct ·
0.50–0.74 review recommended · <0.50 don't publish without review.

## The web library

```bash
npm run library:dev      # development server
npm run library:build    # static production build → app/dist/
npm run library:preview  # serve the production build
```

- **Search** across names, aliases (incl. the global alias map), category,
  tags, counts, instructor, summary, technique points and common mistakes —
  typo-tolerant (Fuse.js).
- **Filters**: category, subcategory, level, type, instructor, On1/On2,
  starting foot, direction, music demo, slow demo, review status.
- **Player**: 0.5×/0.75×/1×/1.25×, 10-s rewind, whole-clip loop, **A/B
  section looping**, caption toggle (WebVTT), fullscreen, **mirror toggle
  with an explicit "MIRRORED" notice**, count display, keyboard controls
  (space, ←/→, j/l, [ ], a/b/x, m, c, f), resume position.
- Every step page shows the **original source file and timestamp** and links
  to the prepped source video.

The build is fully static — host `app/dist/` anywhere private. **Don't
publish it publicly with private source footage in `public/sources/`.**

## Remotion project

- `src/compositions/StepClip.tsx` — the single data-driven clip template
  (title card → sections with badges/cues/count overlays → key-focus recap;
  Remotion-controlled animation only).
- `src/compositions/StepThumbnail.tsx` — branded thumbnail still.
- `src/Root.tsx` registers one composition per step from `data/steps.json`;
  the render scripts pass only `{stepId}` and `calculateMetadata` resolves
  everything from data, so renders can never drift from the metadata.
- `npm run studio` to preview any step composition live.

Rendering configuration: 1920×1080 · 30 fps · H.264 + AAC · yuv420p.
Set `REMOTION_BROWSER_EXECUTABLE` to use a system Chromium (pre-wired in
the cloud environment); otherwise Remotion downloads its own headless shell.

## Environment notes

- **Transcription models**: `npm run setup:whisper` +
  `npm run transcribe` need access to huggingface.co to download the model
  once. In restricted cloud environments (like Claude Code's sandbox with a
  strict network policy) that download is blocked — run transcription
  locally, or loosen the environment's network policy. The pipeline
  degrades gracefully: steps without transcripts are flagged, nothing
  blocks.
- **Private footage**: `source-videos/`, `public/sources/`, `public/clips/`
  (except tiny demo files) and `renders/` are gitignored. Nothing private
  is committed or uploaded by the pipeline. No credentials live in the
  code; use environment variables for anything sensitive.

## Repository layout

```
source-videos/     ← drop original long-form videos here (never touched)
data/              ← the single source of truth (steps, sources, categories,
                     aliases, transcripts, captions, processing log, revisions)
src/               ← Remotion compositions/components/design tokens
app/               ← the static web library (Vite + React)
scripts/           ← the pipeline (audit/prep/transcribe/segment/captions/
                     render/thumbnails/qa/manifest/revise/pipeline)
public/            ← everything the library serves (clips, thumbnails,
                     captions, prepped sources, fonts, synced data)
renders/           ← raw Remotion render output
reports/           ← source-audit.md, clip-manifest.csv, duplicates.csv,
                     review-required.csv, quality-report.md, segment drafts
```
