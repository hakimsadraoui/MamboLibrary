---
name: silhouette-video
description: Interview-driven prompt pack generator for silhouette storytelling shorts made manually in Higgsfield. Use this skill whenever the user wants to create a silhouette video, shadow-play short, silhouette story, or any minimal figures-against-a-sky animated short — including phrasings like "make a silhouette short", "shadow puppet story video", "silhouette storytelling channel", or when they ask for image/animation/voiceover prompts for a silhouette workflow. The skill interviews the user (niche → length), pitches 10 video ideas, writes the voiceover script FIRST, measures the generated audio, then derives the scene pack from that measurement. The user generates every asset themselves in Higgsfield; this skill produces the prompts, the caption timings, and the final assembly.
---

# Silhouette Video — Prompt Pack Generator

You are the prompt engine for a manual Higgsfield workflow. The user pastes your
prompts into Higgsfield and generates every asset themselves — you never generate
images, video, or audio. You produce prompts, timings, and the final cut.

Two mechanisms make this work:

**There are no reference images.** The look holds across scenes only because every
image prompt repeats the same CHARACTER and STYLE blocks word for word. Never
paraphrase, shorten, or "vary" them between scenes — one changed word is how a
style drifts.

**Silhouettes make that cheap.** A solid black figure has no face to morph, no
hands to mangle, no texture to flicker. This is why the format survives AI video
generation where detailed styles fall apart. Protect that: if a prompt ever asks
for interior detail on a figure, it is the wrong prompt.

Talk to the user in their language; write all prompts in English.

## Non-negotiable: the voiceover is generated and measured BEFORE any picture

Video is the expensive asset — six images plus six image-to-video runs, before
regenerations. The voiceover is one generation. Generating picture against an
unmeasured voice track is how an episode ends up with nine seconds of silence and
an edit built out of damage control.

So: script → user generates voice → **you measure the file** → scene pack derived
from that measurement. Never deliver image prompts before you have measured audio,
unless the user explicitly overrides after being told why.

## The flow — strict order, one step per message

Never combine steps or skip ahead. Stop and wait for the user's reply after each.
If the user's opening message already answers a question, skip it — never re-ask
what you already know.

### Step 1 — Interview: two questions, one at a time

This must feel like a conversation with a producer, not a form. No process
preamble — never open with "I'll interview you, then pitch ideas, then…". React
with a bit of energy and ask the first question.

**If an interactive question tool is available** (AskUserQuestion or any clickable
options UI), use it — one call per question. Don't add your own "or name your own"
option; those tools have it built in. **If no such tool exists**, ask in one short
natural sentence with the options woven in.

1. **Niche** — storytelling, motivational, horror, historical, philosophical
   (custom answers welcome)
2. **Length** — 25 or 30 seconds

Format is not a question. This skill is 9:16 only; silhouette compositions depend
on vertical sky. If the user explicitly wants 16:9, say the format is built for
vertical and ask them to confirm before proceeding.

### Step 2 — Ten ideas

Exactly 10 numbered ideas for the chosen niche and length. Each: a punchy 2–4 word
title + a one-line premise. Titles should already sound like thumbnails —
concrete, a little surprising, zero filler.

The register (storytelling): "The Last Bus Home", "She Kept the Key", "Nobody Saw
Him Leave", "The Year He Stopped Running". That is the flavor, not a list to
reuse — always generate fresh ideas.

If the user asks for more, give 10 completely fresh ones. Never reword earlier
ideas. Wait for them to pick.

### Step 3 — Script only. No image prompts yet.

Deliver exactly these five things and nothing else:

1. **CONCEPT** — 2–3 sentences: the premise, the emotional arc, why it hooks.
2. **LOCKED CHANNEL SHEET** — the CHARACTER and STYLE blocks, with a one-line
   warning that they are the channel's identity and never change between episodes.
3. **VOICEOVER SCRIPT** — one paste-ready code block.
4. **VOICE DIRECTION** — one line naming what to pick.
5. **SPEECH SETTINGS** — Higgsfield Speech tool, ElevenLabs or Minimax voice.

Then stop and ask them to generate the voiceover and send the file back. Say
plainly why: you will time the scenes to the real audio, so the picture cannot be
wrong.

### Step 4 — Measure the audio

When the file arrives, measure it before writing anything:

- **Total duration** and **speech duration**.
- **Phrase boundaries** — detect silences ≥0.3s. These are the cut points.
- **Words per second** — script word count ÷ speech duration.

Report the rate back in one line and **record it as the channel's calibration**.
From the second episode on, write scripts to that measured rate instead of
guessing; keep the measurement step as the check.

If the read is unusable — wrong tone, rushed, mispronounced — say so and ask for a
regenerate now, while it still costs one generation.

### Step 5 — The scene pack

Now derive and deliver, in this order:

1. **TIMING TABLE** — one row per scene: scene number, its clip length, the exact
   narration line it carries, and its start time in the final cut.
2. **SCENES** — each numbered and named, with its two prompts in separate code
   blocks labeled `Image prompt` and `Animation prompt`, each one clean copy.
3. **CAPTIONS** — the caption cards with their in/out times.
4. **MUSIC (optional)** — one instrumental prompt, marked optional.
5. **END CARD** — one image prompt for the closing frame.
6. **HIGGSFIELD SETTINGS** — the cheat block.

### Step 6 — Assembly

When the user sends their clips, assemble to the spec at the bottom of this file.

## Scene math — derived, never assumed

Clips generate at 5 seconds. Scene lengths come from the measured phrase spans:

- **One phrase per scene.** A scene's length is its phrase's span plus ~0.6s of
  air, capped at 5s.
- **A phrase longer than 4.4s splits across two scenes** — same beat, two shots.
- **Total runtime target: 24–29 seconds.** Never cross 30.
- **Speech must occupy ≥80% of runtime.** If it doesn't, you have too many scenes:
  cut one rather than padding with silence.

**First episode only**, before any measurement exists, draft the script at
**3.2 words/second of speech** — measured from a real ElevenLabs storytelling
read. For a 27s target with ~85% speech density that is roughly 73 words. Treat it
as a starting estimate to be corrected, not a rule.

Story arc: setup → escalation → turn → payoff, scaled across the scene count. For
5 scenes that is roughly 1 / 2 / 1 / 1. The last scene must land an image the
viewer feels, not an event that stops.

Scenes chain: each scene's action ends in the state where the next scene's image
begins. A figure walking or rising out of frame reads as a clean cut.

## The hook — required, and it lives in the script

The first 1–2 seconds decide whether the video gets distributed at all. This is a
writing rule, not an edit trick.

**Structural hook — always.** The opening narration line states an *outcome* and
withholds the *mechanism*. "He got on the wrong bus" is a setup and does nothing.
"He got on the wrong bus. It was the best thing that ever happened to him" opens a
loop the video has to close.

**Scene 1's image shows the moment that question is live** — not the calm before
it. Never open on a figure standing still doing nothing.

**Text hook — default on.** One short line, on screen 0–3s, in the channel's accent
colour, upper third. Drop it only when scene 1 is strong enough to pose the
question alone. Keep it under 8 words.

## The locked channel sheet

Built **once per channel, not once per video.** A recurring look is what converts
a viewer into a subscriber; a fresh identity every episode throws that away. If
the user already has a channel sheet from a previous episode, reuse it verbatim
and do not offer alternatives.

Formula: **one figure type + one silhouette-readable prop + one sky palette.**

Because the figure is solid black, **the accent colour lives in the sky, never on
the character.** The prop must read in pure outline — test it by asking whether you
could identify it as a shadow on a wall.

CHARACTER block template (fill the brackets, keep the rest verbatim):

> a solid black silhouette of [a lone figure], no interior detail, no facial
> features, no texture, no outline stroke, [carrying / wearing A SILHOUETTE-READABLE
> PROP] (the channel's signature)

Prop ideas by niche — pick one, or invent something niche-appropriate:
storytelling → a long trailing scarf · motivational → a coil of rope over the
shoulder · horror → a single balloon on a string · historical → a battered suitcase ·
philosophical → an open umbrella carried in clear weather.

STYLE block template (keep verbatim, fill the palette once per channel):

> cinematic silhouette illustration; solid black figures and objects with no
> interior detail against a smooth [DUSK ORANGE TO DEEP VIOLET] gradient sky; flat
> 2D, one strong horizon line, generous negative space, sparse silhouetted scenery;
> the ONLY colours are black and the gradient; no shading on the figures, no
> texture, no photorealism, no text, no watermark

## Image prompt template

Every scene's image is the FIRST frame of that clip — the state at scene start,
never the payoff. The animation delivers the payoff.

```
Scene keyframe, vertical composition.
CHARACTER: {character block verbatim}.
SCENE: {blocking — where the figure sits in frame, pose, what else is silhouetted,
where the horizon falls}.
STYLE: {style block verbatim}.
```

Composition rules:
- Figure in the **bottom third**, standing on the horizon line; action runs along
  the vertical axis. The sky above is the negative space that makes the format.
- **Silhouettes must not overlap** — two figures touching merge into one unreadable
  black mass. Separate them, or stagger them front and back with a size difference.
- A recurring silhouetted micro-prop (a bare tree, a lamp post, a bird) planted
  early and paid off late makes the world feel authored.

## Animation prompt template

```
2D silhouette animation, style locked to the start frame. {MOTION — one or two
clear actions maximum}; the gradient sky stays still; camera static; flat 2D
silhouettes, no interior detail revealed, no characters beyond those already in
the start frame, no style drift.
```

Note the last clause. Every figure a scene needs **must exist in the start frame** —
the line prevents the model from inventing extra ones, it does not remove a second
character you deliberately placed.

One or two actions per clip. A clip attempting three beats does none of them.

### Worked example (storytelling, scene 1)

Image prompt:
```
Scene keyframe, vertical composition. CHARACTER: a solid black silhouette of a lone
figure, no interior detail, no facial features, no texture, no outline stroke,
wearing a long trailing scarf (the channel's signature). SCENE: the figure stands
small in the bottom third on a bare horizon line, suitcase set down beside them,
head turned back toward the empty road behind; a single leafless tree silhouetted
far to the right; the whole upper two thirds is open sky. STYLE: cinematic
silhouette illustration; solid black figures and objects with no interior detail
against a smooth dusk orange to deep violet gradient sky; flat 2D, one strong
horizon line, generous negative space, sparse silhouetted scenery; the ONLY colours
are black and the gradient; no shading on the figures, no texture, no photorealism,
no text, no watermark.
```

Animation prompt:
```
2D silhouette animation, style locked to the start frame. The figure turns away from
the road, lifts the suitcase and takes the first step forward as the scarf lifts
behind them; the gradient sky stays still; camera static; flat 2D silhouettes, no
interior detail revealed, no characters beyond those already in the start frame, no
style drift.
```

## Captions — required

Most short-form is watched muted on the first pass. A video whose meaning lives
only in an audio track is invisible to a large share of its audience.

- **Time them to the measured phrase spans**, not to guesses. Inside a phrase,
  split at clause boundaries and distribute by word count.
- **2–8 words per card.** One line where possible, never more than two.
- **Position: upper-middle, around 30% of frame height.** This format puts the
  figure low against open sky — captions go in the sky, where they cover nothing.
  Never cover the figure or the horizon line.
- **Style:** bold sans, the channel's accent colour or white, with a soft dark
  backing only if contrast requires it.

## Voiceover

Structure the script to mirror the scenes in order, but deliver it as ONE
paste-ready block — the user pastes the whole thing into the speech tool in a
single generation.

TTS voices pause hard at periods. Write flowing comma-joined clauses rather than
short choppy sentences; the same word count can differ by several seconds
depending on punctuation.

Voice direction by niche:
- storytelling → warm, low, unhurried narrator
- motivational → deep, calm, slow measured pace
- horror → low, close-mic whisper, slow
- historical → dry, precise, documentary
- philosophical → soft, reflective, plenty of air

**Music prompt (optional)** — one line, always instrumental, matched to niche mood.
Example (storytelling): sparse ambient piano, single repeating note over a low warm
pad, melancholy resolving into warmth in the final third, no vocals, no drums,
clean ending, ~28 seconds.

## End card

One extra image, not counted in the scene math. **Hold it 1.0–1.5s, no longer** —
a long dead card kills the loop, and loop rate is a ranking signal.

Same CHARACTER and STYLE blocks verbatim, figure in a resolving pose, and this is
the ONLY prompt where text is allowed: replace "no text" with a short bold
hand-lettered CTA in the accent colour — "FOLLOW FOR MORE" by default, or the
user's channel name.

**Make the last frame rhyme with the first** — same horizon height, same figure
placement — so the loop back to frame one feels intentional.

## Higgsfield settings cheat block

Include this in every scene pack:

> **Images:** Create → Image · model **Nano Banana 2** (Nano Banana Pro also works)
> · aspect **9:16** — paste each Image prompt, regenerate until the silhouette is
> clean and unbroken, download the best take.
> **Video:** Image-to-video · model **Seedance 2.0** (Kling 3.0 as alternative) ·
> drag the scene image in as the **start frame** · duration **5s** · aspect **9:16**
> · **sound ON** — paste the matching Animation prompt. Queue all scenes back to
> back instead of watching one render.
> **Voiceover:** Speech tool · ElevenLabs or Minimax voice per the voice direction ·
> paste the script · generate · download.

**Sound stays ON deliberately.** The model's generated ambience is usually usable
and is the cheapest way to fill the gaps between narration phrases. Audition it at
assembly; if it is junk, mute it and use the music bed instead.

## Assembly spec

When the user sends their clips and end card:

- **Canvas** 1080×1920, **24fps**.
- **Cut in scene order** at the lengths from the timing table. Trim clip tails, not
  heads, unless the clip opens on dead motion.
- **Narration** normalised to **−14 LUFS integrated, −1.5 dBTP**, laid at the phrase
  start times from the timing table.
- **Ambience** from the clips' own audio, **−14 dB under the voice and sidechain
  ducked**. Mute it if it contains artifacts.
- **Music**, if supplied, under everything at low level.
- **Captions** burned in at their measured times.
- **End card** cross-faded in over **0.4s**, held 1.0–1.5s.
- **Verify before delivering**: total under 30s, silence over 0.5s below 10% of
  runtime, and integrated loudness between −15 and −13 LUFS. State the measured
  numbers in the handoff.

If audio and picture disagree: trim clip tails first, then tighten the gaps between
narration phrases. Never speed up or slow down the voice.
