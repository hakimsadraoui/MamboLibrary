// PHASE 2a — Transcription.
// Extracts mono 16 kHz audio from each source and transcribes it with
// faster-whisper (word-level timestamps). Skips sources that already have a
// transcript whose fingerprint matches. Degrades gracefully when whisper is
// not installed: sources are flagged instead of blocking the pipeline.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  execFileAsync,
  loadSources,
  readJson,
  writeJson,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');

const whisperAvailable = async () => {
  try {
    await execFileAsync('python3', ['-c', 'import faster_whisper']);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const data = loadSources();
  const sources = data.sources.filter((s) => !s.missing && s.hasAudio);
  fs.mkdirSync(PATHS.transcripts, {recursive: true});

  const pending = sources.filter((s) => {
    const out = path.join(PATHS.transcripts, `${s.id}.json`);
    if (force) return true;
    const existing = readJson(out, {});
    return existing.sourceMtime !== s.mtime;
  });

  if (pending.length === 0) {
    console.log('Transcription: nothing to do.');
    return;
  }

  if (!(await whisperAvailable())) {
    console.warn(
      [
        '',
        '⚠ faster-whisper is not installed — transcription skipped for:',
        ...pending.map((s) => `   - ${s.filename}`),
        '',
        '  Install it with:  npm run setup:whisper',
        '  then re-run:      npm run transcribe',
        '',
        '  The rest of the pipeline continues; affected steps are flagged',
        '  "transcript missing" in the review queue.',
      ].join('\n'),
    );
    appendLog('transcribe-skipped', {
      reason: 'faster-whisper not installed',
      files: pending.map((s) => s.id),
    });
    return;
  }

  const py = path.join(PATHS.data, '..', 'scripts', 'lib', 'whisper_transcribe.py');
  for (const source of pending) {
    const input = path.join(PATHS.sourceVideos, source.path);
    const wav = path.join(os.tmpdir(), `mambo-${source.id}.wav`);
    const out = path.join(PATHS.transcripts, `${source.id}.json`);
    console.log(`Transcribing ${source.filename} … (this can take a while)`);
    await execFileAsync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', input,
      '-vn', '-ac', '1', '-ar', '16000',
      wav,
    ], {maxBuffer: 32 * 1024 * 1024});
    try {
      await execFileAsync('python3', [py, wav, out], {
        maxBuffer: 64 * 1024 * 1024,
        timeout: 0,
      });
      const transcript = readJson(out);
      transcript.sourceId = source.id;
      transcript.sourceMtime = source.mtime;
      writeJson(out, transcript);
      appendLog('transcribe', {sourceId: source.id, segments: transcript.segments.length});
    } finally {
      fs.rmSync(wav, {force: true});
    }
  }
  console.log(`Transcription complete: ${pending.length} file(s).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
