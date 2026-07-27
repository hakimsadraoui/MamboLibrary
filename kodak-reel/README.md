# Kodak vs. the Digital Camera — Coded Reel Practice Kit

Build a second viral documentary reel yourself, using only **Remotion + Claude Code** (plus ElevenLabs for the audio). Same engine, same six-beat structure as the Netflix-vs-Blockbuster kit in this repo — new story.

> In 1975 a Kodak engineer built the first digital camera. His bosses told him not to tell anyone. Thirty-seven years later Kodak filed for bankruptcy, and Instagram sold for a billion dollars with thirteen employees and no film at all.

---

## Start here

**Open `how-to-kodak-reel.html` in your browser.** (Just double-click it.)

That's the full walkthrough: every prompt in build order, plus interactive breakdowns of each effect — the portal zoom, the cast shadow that's really the character, the negative flash, the lamp glow, the drawer slam, and the sound. Read it top to bottom before you build.

---

## What's inside

| Folder / file | What it is |
|---|---|
| `how-to-kodak-reel.html` | The walkthrough. **Read this first.** |
| `prompts/` | Every prompt as a copy-paste `.txt`, numbered in build order. `ALL-PROMPTS.txt` has them all in one file. |
| `build-assets/` | The topic-neutral source files carried over from the Netflix kit — the two film textures, the paper wall, the wood desk, the gold frame. Drop these into your Remotion project's `public/assets/`. |
| `build-assets/ASSETS.md` | The manifest for the story-specific assets: every job ID, every prompt, and how to pull them down. |

All seventeen story-specific assets have been generated with **Nano Banana Pro** and the
twelve that need it background-removed into clean cut-outs — but they are **not committed
here.** The session that made them couldn't download them past this environment's egress
policy, which also means none of them has been visually checked. `build-assets/ASSETS.md`
has the job ID and the exact prompt for every one, so you can either save them out of
Higgsfield or allowlist the CDN host and fetch the lot in one pass.

---

## How to build it

1. **Read** `how-to-kodak-reel.html`.
2. **Set up** a Remotion project with prompt `01-setup-remotion`, and copy everything from `build-assets/` into your project's `public/assets/`.
3. **Add the film look** with prompt `02-setup-film-look` — grade + grain + scan-line + posterize, plus a sprocket-hole edge overlay this reel adds on top.
4. **Build the six scenes**, one prompt at a time (`03` → `08`). After each, open **Remotion Studio** and eyeball the values on the sliders before moving on.
5. **Do the sound:** generate the voiceover (`09`) and the effects (`10`) in ElevenLabs, pick a background music track, mix it so the words always win, and render out a 1080×1920 MP4.

**Build order:** `00 Storyboard → 01 Remotion setup → 02 Film look → 03–08 Scenes 1–6 → 09 Voiceover → 10 SFX → music + render`

---

## The six beats

| # | Voiceover line | The scene |
|---|---|---|
| 1 | *In 1975, a young Kodak engineer built the world's first digital camera.* | Portal zoom through a framed lab photo |
| 2 | *He showed his bosses. They told him it was cute — but don't tell anyone about it.* | Smug exec on a yellow sunburst, slot machine slams on "0.01 MEGAPIXELS" |
| 3 | *So everyone else built the opposite. No film. No prints. No waiting.* | Three front pages spring onto a desk |
| 4 | *By 2012, Kodak had filed for bankruptcy and switched off its film plants for good.* | Grounded parallax punch outside the dead plant |
| 5 | *That same year, Instagram sold for a billion dollars — thirteen employees, not one roll of film.* | The loft, the swinging lamp, the phone flickering gold |
| 6 | *Kodak invented the future, then locked it in a drawer.* | Scene 4 cloned and reskinned — the drawer slams shut |

---

## The one rule that matters

**The voiceover is the source code.** Write and lock the six-line script first — every scene's timing is cut from the gaps between those lines. Start with the storyboard prompt (`00`) and let the words dictate the visuals.

## The second rule

**You don't need an original story.** Kodak's is one of the most-told cautionary tales in business. That's the point — the win isn't finding a story nobody knows, it's telling a known one better than the last person did.

---

*Structure and build method after the Netflix-vs-Blockbuster kit by MoSidd · AI Made Easy*
