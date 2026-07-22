#!/usr/bin/env python3
"""Transcribe an audio file with faster-whisper and emit JSON.

Usage: python3 whisper_transcribe.py <audio.wav> <out.json> [model]
Model defaults to $WHISPER_MODEL or "small".
"""
import json
import os
import sys


def main() -> int:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            "faster-whisper is not installed. Run: npm run setup:whisper",
            file=sys.stderr,
        )
        return 3

    audio_path = sys.argv[1]
    out_path = sys.argv[2]
    model_name = sys.argv[3] if len(sys.argv) > 3 else os.environ.get(
        "WHISPER_MODEL", "small"
    )

    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        audio_path,
        vad_filter=True,
        word_timestamps=True,
    )

    out_segments = []
    for seg in segments:
        out_segments.append(
            {
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
                "avgLogprob": round(seg.avg_logprob, 4),
                "noSpeechProb": round(seg.no_speech_prob, 4),
                "words": [
                    {
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "word": w.word,
                        "probability": round(w.probability, 4),
                    }
                    for w in (seg.words or [])
                ],
            }
        )

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "language": info.language,
                "languageProbability": round(info.language_probability, 4),
                "durationSeconds": round(info.duration, 3),
                "model": model_name,
                "segments": out_segments,
            },
            fh,
            ensure_ascii=False,
            indent=2,
        )
    print(f"Wrote {out_path} ({len(out_segments)} segments)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
