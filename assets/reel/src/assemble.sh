#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
mkdir -p edit
# Final master: 1080x1920, H.264 high, AAC beat
ffmpeg -y -framerate 30 -i frames/f%04d.png -i beat.wav \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium \
  -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -shortest \
  edit/COLORA_BlueEdition_reel_1080x1920.mp4
echo "final written"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,nb_frames,duration -of default=noprint_wrappers=1 edit/COLORA_BlueEdition_reel_1080x1920.mp4
ls -la edit/
