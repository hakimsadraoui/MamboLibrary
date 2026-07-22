// Source preparation: creates web/Remotion-compatible working copies in
// public/sources/ WITHOUT touching the originals.
//  - h264+aac in mp4/mov → lossless remux (-c copy, faststart)
//  - anything else       → high-quality H.264/AAC transcode (max 1080p)
// Also applies gentle loudness normalisation on transcode so explanations
// sit at a consistent level.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  execFileAsync,
  loadSources,
  saveSources,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');

const main = async () => {
  const data = loadSources();
  fs.mkdirSync(PATHS.publicSources, {recursive: true});
  let prepped = 0;

  for (const source of data.sources) {
    if (source.missing) continue;
    const input = path.join(PATHS.sourceVideos, source.path);
    const outName = `${source.id}.mp4`;
    const output = path.join(PATHS.publicSources, outName);
    const relPath = `sources/${outName}`;

    if (!force && source.preppedPath === relPath && fs.existsSync(output)) {
      continue;
    }

    const canRemux =
      source.videoCodec === 'h264' &&
      (source.audioCodec === 'aac' || !source.hasAudio);

    console.log(
      `Prepping ${source.filename} → public/${relPath} (${canRemux ? 'remux' : 'transcode'}) …`,
    );

    if (canRemux) {
      await execFileAsync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', input,
        '-c', 'copy',
        '-movflags', '+faststart',
        output,
      ], {maxBuffer: 32 * 1024 * 1024});
    } else {
      const filters = [];
      if (source.height > 1080) {
        filters.push('scale=-2:1080');
      }
      const videoArgs = [
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
        '-pix_fmt', 'yuv420p',
      ];
      const audioArgs = source.hasAudio
        ? ['-c:a', 'aac', '-b:a', '192k', '-af',
           'loudnorm=I=-18:LRA=11:TP=-1.5']
        : ['-an'];
      await execFileAsync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', input,
        ...(filters.length ? ['-vf', filters.join(',')] : []),
        ...videoArgs,
        ...audioArgs,
        '-movflags', '+faststart',
        output,
      ], {maxBuffer: 32 * 1024 * 1024, timeout: 0});
    }

    source.preppedPath = relPath;
    prepped += 1;
  }

  saveSources(data);
  appendLog('prep', {prepped});
  console.log(`Prep complete: ${prepped} file(s) prepared.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
