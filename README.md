# Netflix vs Blockbuster — Coded Reel Practice Kit

Build the viral documentary reel yourself, using only **Remotion + Claude Code** (plus ElevenLabs for the audio). Everything you need is in this folder.

---

## Start here

**Open `how-to-netflix-reel.html` in your browser.** (Just double-click it.)

That's the full walkthrough: every prompt in build order, plus interactive breakdowns of each effect — the portal zoom, the cast shadow that's really the character, the lamp glow, the foam-finger wag, and the sound. Read it top to bottom before you build.

---

## What's inside

| Folder / file | What it is |
|---|---|
| `how-to-netflix-reel.html` | The walkthrough. **Read this first.** |
| `prompts/` | Every prompt as a copy-paste `.txt`, numbered in build order. `ALL-PROMPTS.txt` has them all in one file. |
| `build-assets/` | The source images the prompts reference — backgrounds, character cut-outs, textures. Drop these into your Remotion project's `public/assets/` folder. |
| `assets/` + `stills/` | Media the explainer page uses so it works offline. You don't need to touch these. |

---

## How to build it

1. **Read** `how-to-netflix-reel.html`.
2. **Set up** a Remotion project with prompt `01-setup-remotion`, and copy everything from `build-assets/` into your project's `public/assets/`.
3. **Add the film look** with prompt `02-setup-film-look` — this is the grade + grain + scan-line + posterize "engine" every scene reuses.
4. **Build the six scenes**, one prompt at a time (`03` → `08`). After each, open **Remotion Studio** and eyeball the values on the sliders before moving on.
5. **Do the sound:** generate the voiceover (`09`) and the effects (`10`) in ElevenLabs, pick a background music track, mix it so the words always win, and render out a 1080×1920 MP4.

**Build order:** `00 Storyboard → 01 Remotion setup → 02 Film look → 03–08 Scenes 1–6 → 09 Voiceover → 10 SFX → music + render`

---

## The one rule that matters

**The voiceover is the source code.** Write and lock the six-line script first — every scene's timing is cut from the gaps between those lines. Start with the storyboard prompt (`00`) and let the words dictate the visuals.

---

*Made by MoSidd · AI Made Easy*
