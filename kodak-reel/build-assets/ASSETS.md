# Asset manifest

The story-specific assets were generated with **Higgsfield → Nano Banana Pro** (`nano_banana_pro`,
2k) and cut out with Higgsfield's `image_background_remover`. They live in the Higgsfield
account they were generated from.

**They are not committed to this repo.** The session that generated them could not download
them: the Higgsfield CDN host `d8j0ntlcm91z4.cloudfront.net` is denied by this environment's
egress policy (the proxy answers `403` to `CONNECT`). Nothing is wrong with the files — see
*Getting them into the repo* below.

## What to drop into `public/assets/`

Files marked **cut-out** already have a transparent background and are ready to use. The
`source job` column is the original generation, kept so a cut-out can be redone without
paying for a new image.

| Filename | Job ID (download this one) | Size | Source job |
|---|---|---|---|
| `lab-bg.png` | `58f2c9bf-416a-4b35-8ec7-624fe56d52d9` | 1536×2752 | — |
| `kodak-plant-bg.png` | `a759fc35-ba13-43f3-b4ce-6e72cef762c3` | 1536×2752 | — |
| `loft-bg.png` | `dd92882d-d7c5-48b1-b9ec-106037edffa4` | 1536×2752 | — |
| `dust1.png` (dense, on black) | `386e810e-e415-4b85-b5b1-950899811040` | 1536×2752 | — |
| `dust2.png` (sparse, on black) | `3a45f20d-9c65-4997-b43d-e3f85ca37831` | 1536×2752 | — |
| `sasson-portrait.png` — **cut-out** | `86332870-3cdf-4cd5-aa5f-9969ada2213d` | 1696×2528 | `1b5e89e4-4073-4e49-82bd-66fe750d5c12` |
| `exec.png` — **cut-out** | `d659d3e9-dbf2-4fdd-ae7e-50e255e31fa1` | 1696×2528 | `f22b6ee0-3c50-43ae-90d5-7300fc52f9b4` |
| `grim-exec.png` — **cut-out** | `204f43ad-f499-4c86-a27b-276e7b0aefc6` | 1792×2400 | `3bb4710a-7aa0-45b1-ae32-e3a7a0265505` |
| `founder-char.png` — **cut-out** | `fe8c6655-8b29-4044-8ac0-d3a8085319c3` | 1696×2528 | `51520149-7b76-428e-96f5-3c12a0948e2b` |
| `hand-left.png` (prototype) — **cut-out** | `b30c209b-b9fd-47fb-878e-a774139a8aea` | 2048×2048 | `816e7eb2-94cb-4168-b4c7-70be28eac900` |
| `hand-right.png` (film roll) — **cut-out** | `ca3d96bb-947a-493c-a359-c46538df9ffb` | 2048×2048 | `cd9b8908-de2f-473c-b6dc-a2d75000a484` |
| `phone-cut.png` — **cut-out** | `41ede663-3a91-4f2b-a665-3b68fdac0782` | 2048×2048 | `e871d37f-0db1-4b0a-bbd0-705e427a2d55` |
| `lamp.png` — **cut-out** | `5ebb61d9-035d-48fc-9664-3e1f276aa8e5` | 2048×2048 | `33d855ed-ad15-40cc-8ac0-aafd9a1b2654` |
| `news-nofilm.png` — **cut-out** | `8788e7e4-e40c-47dd-9f2f-601370ca54e3` | 1792×2400 | `b9c97c04-40ac-4266-b025-5ba5b428bd45` |
| `news-noprints.png` — **cut-out** | `0749fc9c-6dd1-41c6-b110-1a94a764f5fb` | 1792×2400 | `4b0d5d57-ded0-4d36-a720-80c2d01667dc` |
| `news-nowaiting.png` — **cut-out** | `76dab23a-b42a-44dc-9567-cfee710033dc` | 1792×2400 | `ec182577-172d-4cca-84d1-df9707b9f856` |
| `old-sasson.png` — **cut-out** | `934ce9a0-b58a-4708-9deb-9e10399f4ba0` | 1696×2528 | `75f4e322-a8f1-48e2-a94e-3fd25c581d83` |

`old-sasson.png` is 1696×2528 against `grim-exec.png`'s 1792×2400 — genuinely taller and
narrower, which is exactly the aspect-ratio correction Scene 6's prompt asks you to make when
you clone Scene 4. Reuse Scene 4's width unchanged and he stretches.

Two spare alternates exist for these from a duplicate retry, if you prefer a different take:
`9154dfc4-45ce-4f8d-893c-6965d63eb37f` (older engineer) and
`cbe1ed2d-de54-46c7-a6bd-db5c60d2c4dc` (NO WAITING page). Neither has been cut out.

Already in this folder, carried over from the Netflix kit: `grain.jpg`, `grunge.jpg`,
`wall.jpg`, `wood-desk.jpg`, `gold-frame.png`.

All seventeen rendered and all twelve cut-outs completed.

### Not verified visually

The session that generated these could not fetch a single one of them back (same egress
block), so **nothing here has been looked at.** The prompts and the pipeline are sound, but
check each file when you pull it down — particularly the three newspaper headlines, since
text rendering is the most likely thing to come out wrong, and the cut-out edges on the two
characters holding objects, where background removers tend to eat thin wires and fingers.

### Not generated on purpose

- **`kodak-logo.png`** — a real trademark. Source it yourself, the same way the Netflix kit
  sourced its logo from an edit pack. Don't have a model fabricate it.
- **`smoke.mp4`** — a smoke plume shot on black, from a stock or edit pack.
- **`drawer.svg`** — the filing-cabinet drawer, from an icon/vector pack. A rough one is
  already drawn inline in `how-to-kodak-reel.html` if you want a starting point.
- **The engineer is an archetype, not a portrait.** Steven Sasson is a real living person,
  so both engineer characters were generated as generic period-appropriate figures rather
  than as his likeness. Keep it that way.
- **The plant signage is deliberately blank** — faded yellow and red paint with no readable
  lettering, so the building reads as *a* dead film plant without faking Kodak's branding.

## Getting them into the repo

Pick whichever is easier:

1. **Download from Higgsfield** — open each job in the Higgsfield UI and save it into
   `kodak-reel/build-assets/` under the filename in the table above.
2. **Allowlist the host** — add `d8j0ntlcm91z4.cloudfront.net` to the environment's egress
   policy, then a session can fetch every job by ID and commit them in one pass.

## Generation notes

Every prompt below was run at `nano_banana_pro`, resolution `2k`, count 1.

Two things kept the set consistent, and are worth preserving on a re-roll:

- **Generate clean, not aged.** No prompt asks for film grain, sepia or vignetting — the
  film treatment is applied in Remotion (prompt `02`), and baking it into the plates twice
  makes the reel look muddy.
- **Characters on flat grey, never in a room.** Every character was shot against a plain
  seamless backdrop so the cut-out is clean. The depth illusion in Scenes 4 and 6 depends on
  scaling the character independently of the background, which is impossible if they were
  generated standing in the scene.

### Prompts

**`lab-bg.png`**
> A 1970s corporate electronics research laboratory interior, vertical composition. A long workbench cluttered with oscilloscopes, breadboards, coils of ribbon cable and hand-built circuit boards. Beige and avocado-green equipment cabinets, fluorescent ceiling strip lights, off-white perforated ceiling tiles, scuffed linoleum floor. Completely empty, no people. Wide lens at eye level, deep focus, even neutral lighting. Clean sharp photographic image, no film grain, no text, no logos, no brand names.

**`kodak-plant-bg.png`**
> A shuttered mid-century industrial factory exterior, vertical composition. A long low brick and concrete building with rows of boarded-up windows, a large rusted blank signboard with faded peeling yellow and red paint and no readable lettering, a chain-link fence with a padlocked gate, weeds pushing through cracked asphalt, flat overcast grey sky. Abandoned and empty, no people. Wide lens at eye level. Clean sharp photographic image, no film grain, no text, no logos, no brand names.

**`loft-bg.png`**
> A bare early-2010s startup loft interior, vertical composition. Exposed red brick wall, black cable trays and electrical conduit running along the ceiling, high ceiling, scuffed wide-plank wooden floor, a cheap folding table pushed against the wall. Sparse and unfinished, no decoration, no lamps, no hanging lights. Completely empty, no people. Wide lens at eye level, dim even ambient light. Clean sharp photographic image, no film grain, no text, no logos.

**`dust1.png`**
> Fine dust motes suspended in still air, hundreds of small floating specks of varying size scattered irregularly across the whole frame, brightly side-lit so each particle glows white against a pure solid black background. Nothing else in frame at all — only the illuminated floating particles on black. Nearer specks sharp, further specks soft bokeh. No text, no objects, no surfaces.

**`dust2.png`**
> Sparse dust motes suspended in still air, a loose scattering of small floating specks spread thinly and unevenly across the whole frame, brightly side-lit so each particle glows white against a pure solid black background. Fewer and larger particles than a dense cloud. Nothing else in frame at all — only the illuminated floating particles on black. Mostly soft bokeh. No text, no objects, no surfaces.

**`sasson-portrait.png`**
> Full-body studio photograph of a young electronics engineer in their mid-twenties, 1970s period styling: thick-framed glasses, moustache, side-parted brown hair, short-sleeved button-down shirt with a pocket protector, brown slacks. They hold a large improvised prototype device in both hands at chest height — a beige metal box roughly the size of a toaster, a lens on the front, a cassette tape deck bolted to one side, a bundle of loose wires. Calm, quietly proud expression, facing camera. Standing against a completely plain flat mid-grey seamless studio backdrop with nothing else in frame. Even soft lighting, whole body visible from head to feet with margin around them, sharp focus. Clean photographic image, no text, no logos.

**`exec.png`**
> Full-body studio photograph of a smug corporate executive in their fifties, 1970s period styling: wide-lapel brown three-piece suit, thick knotted tie, heavy sideburns, slicked hair, tinted aviator glasses. One hand holds a lit cigarette at chest height, the other rests in a pocket. Dismissive, amused, faintly contemptuous expression, chin slightly raised, facing camera. Standing against a completely plain flat mid-grey seamless studio backdrop with nothing else in frame. Even soft lighting, whole body visible from head to feet with margin around them, sharp focus. Clean photographic image, no text, no logos.

**`grim-exec.png`**
> Full-body studio photograph of a defeated corporate executive in their fifties, early 2010s styling: rumpled dark grey suit, loosened tie, no jacket button done up, tired drawn face, shoulders slumped, looking down and slightly away. Under one arm they carry a cardboard file box holding a few desk items — a desk lamp, some folders, a framed photo face-down. Standing against a completely plain flat mid-grey seamless studio backdrop with nothing else in frame. Even soft lighting, whole body visible from head to feet with margin around them, sharp focus. Clean photographic image, no text, no logos.

**`founder-char.png`**
> Full-body studio photograph of a startup founder in their late twenties, early 2010s styling: plain grey t-shirt, dark jeans, sneakers, messy hair, three-day stubble. They stand relaxed and slightly slouched, hands loose at their sides, understated and unimpressed by their own success. Standing against a completely plain flat mid-grey seamless studio backdrop with nothing else in frame. Even soft lighting, whole body visible from head to feet with margin around them, sharp focus. Clean photographic image, no text, no logos.

**`old-sasson.png`**
> Full-body studio photograph of an engineer in their late sixties, present day: neatly trimmed white beard, wire-rimmed glasses, plain dark button-down shirt, chinos. They hold an old beige improvised prototype device in both hands at waist height — a metal box roughly the size of a toaster with a lens on the front and a cassette deck bolted to one side, clearly decades old and well kept. Calm, composed, quietly vindicated expression, facing camera. Standing against a completely plain flat mid-grey seamless studio backdrop with nothing else in frame. Even soft lighting, whole body visible from head to feet with margin around them, sharp focus. Clean photographic image, no text, no logos.

**`hand-left.png`**
> A single human hand and forearm entering from the left edge of the frame, holding up a beige improvised 1970s prototype camera — a boxy metal enclosure with a lens on the front, a cassette tape deck bolted to one side and a few loose wires. The hand is presented palm-up, offering the object toward camera. Plain flat mid-grey seamless background with nothing else in frame. Even soft studio lighting, sharp focus. Clean photographic image, no text, no logos.

**`hand-right.png`**
> A single human hand and forearm entering from the right edge of the frame, holding up a roll of 35mm photographic film — a small metal canister with a short tongue of film pulled out and curling. The hand is presented palm-up, offering the object toward camera. Plain flat mid-grey seamless background with nothing else in frame. Even soft studio lighting, sharp focus. Clean photographic image, no text, no logos, no brand names on the canister.

**`phone-cut.png`**
> A plain black slab smartphone from around 2012 standing upright, screen facing camera, the screen completely off and pure black with no icons. Rounded metal edges, a subtle rim highlight along the sides. Plain flat mid-grey seamless background with nothing else in frame. Even soft studio lighting, sharp focus. No text, no logos, no visible brand markings.

**`lamp.png`**
> A simple industrial pendant lamp hanging from a long black electrical cord — a shallow conical metal shade in weathered dark grey enamel with a single bare incandescent filament bulb beneath it. The bulb is switched OFF and unlit, emitting no light and casting no glow. Plain flat mid-grey seamless background with nothing else in frame. Even soft studio lighting, sharp focus. No text, no logos.

Generated unlit on purpose — the glow in Scene 5 is four radial gradients drawn in code, so a
lamp plate that already emits light will fight it.

**`news-nofilm.png`** / **`news-noprints.png`** / **`news-nowaiting.png`**
> A vintage newspaper front page lying flat, photographed straight on from directly above. Yellowed newsprint, dense columns of small body text, a thin masthead rule across the top. One enormous bold black condensed headline dominating the upper half reading exactly: **NO FILM** *(/ NO PRINTS / NO WAITING)*. Beneath it smaller subheadings and two grainy black-and-white photographs. The page is slightly creased with worn edges, cut out on a plain flat white background. Sharp, evenly lit flat-lay. The only large text on the page is the headline **NO FILM** *(/ NO PRINTS / NO WAITING)*.
