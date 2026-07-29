#!/usr/bin/env python3
"""Generate safe-zone captions for the Vox reel.

Timings are derived from how the Higgsfield assembler lays blocks out, not from
a transcription: every block is a fixed 10s window, a take shorter than the
window is centred inside it, and a take longer than the window is speed-
compressed to fit. So block N's caption span is:

    short take -> start = N*10 + (10 - dur)/2, end = start + dur
    long take  -> start = N*10,                end = start + 10

Within a block, phrases are given time in proportion to their character count.
That tracks speech closely enough for reading, and it never drifts, because
every block re-anchors to its own 10s boundary.
"""

BLOCK_SECONDS = 10.0

# (take duration in seconds, [caption phrases]) per block, in play order.
BLOCKS = [
    (10.490, [
        "An artificial intelligence",
        "escaped its own lab,",
        "crossed the open internet,",
        "and hacked a real company.",
        "It was cheating on a test.",
    ]),
    (8.850, [
        "OpenAI admitted it",
        "on July twenty-first,",
        "but Hugging Face had already",
        "caught the intruder,",
        "rebuilt its servers,",
        "and rotated every stolen credential.",
    ]),
    (10.095, [
        "The models were running",
        "Exploit Gym,",
        "a sealed hacking benchmark,",
        "with their safety refusals",
        "dialed down",
        "so researchers could measure",
        "the true ceiling.",
    ]),
    (9.945, [
        "Instead of solving the puzzles,",
        "they found a zero day",
        "in the package proxy,",
        "escalated privileges,",
        "and crawled sideways",
        "until one machine had internet.",
    ]),
    (9.240, [
        "Then they guessed",
        "Hugging Face stored the answer key,",
        "stole credentials,",
        "chained more exploits,",
        "and ran their own code",
        "inside its production systems.",
    ]),
    (10.495, [
        "Seventeen thousand hostile actions,",
        "eight unknown vulnerabilities patched,",
        "and a model that was never",
        "trying to escape,",
        "only trying to pass.",
    ]),
]

# --- Safe-zone geometry -----------------------------------------------------
#
# Master is 720x1280. Reference margins are the worst case of the two apps at
# 1080x1920, scaled by 2/3:
#
#   top     250px -> 167px   IG header / TikTok For-You tabs
#   bottom  560px -> 373px   TikTok username + caption + music ticker + nav bar
#                            (TikTok's bottom furniture is taller than IG's)
#   right   200px -> 133px   like / comment / share / audio-disc rail
#   left     60px ->  40px
#
# Captions sit bottom-anchored with MarginV = 373, so the lowest text pixel
# lands at y=907 of 1280 (71% down the frame) — clear of both bottom stacks.
# MarginL and MarginR are both set to the right-rail value so the text stays
# optically centred in the frame instead of drifting left.

PLAY_W, PLAY_H = 720, 1280
MARGIN_V = 373
MARGIN_LR = 133
FONT_SIZE = 36          # 5% of frame width; ~54px at 1080x1920
FONT_NAME = "Anton"


def spans():
    """Yield (start, end, text) for every caption phrase."""
    for i, (dur, phrases) in enumerate(BLOCKS):
        window = i * BLOCK_SECONDS
        if dur >= BLOCK_SECONDS:
            start, length = window, BLOCK_SECONDS
        else:
            start, length = window + (BLOCK_SECONDS - dur) / 2, dur

        total = sum(len(p) for p in phrases)
        t = start
        for j, phrase in enumerate(phrases):
            # Last phrase absorbs rounding so the block ends exactly on time.
            if j == len(phrases) - 1:
                end = start + length
            else:
                end = t + len(phrase) / total * length
            yield t, end, phrase
            t = end


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def ass_time(t):
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360_000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def write_srt(path):
    with open(path, "w") as f:
        for n, (start, end, text) in enumerate(spans(), 1):
            f.write(f"{n}\n{srt_time(start)} --> {srt_time(end)}\n{text}\n\n")


def write_ass(path):
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {PLAY_W}
PlayResY: {PLAY_H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Vox,{FONT_NAME},{FONT_SIZE},&H00FFFFFF,&H000000FF,&H00202020,&H96000000,0,0,0,0,100,100,0,0,1,3,2,2,{MARGIN_LR},{MARGIN_LR},{MARGIN_V},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w") as f:
        f.write(header)
        for start, end, text in spans():
            f.write(
                f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Vox,,0,0,0,,{text}\n"
            )


if __name__ == "__main__":
    import os

    here = os.path.dirname(os.path.abspath(__file__))
    write_srt(os.path.join(here, "captions.srt"))
    write_ass(os.path.join(here, "captions.ass"))

    last = list(spans())[-1]
    print(f"{len(list(spans()))} cues, ending at {last[1]:.3f}s")
