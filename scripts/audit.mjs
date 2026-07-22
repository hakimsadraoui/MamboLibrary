// PHASE 1 — Source audit.
// Scans source-videos/, probes every file, detects likely duplicates and
// writes data/source-videos.json + reports/source-audit.md.
// Incremental: files whose size+mtime fingerprint is unchanged are kept as-is.
// Original files are NEVER modified.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  execFileAsync,
  formatTimecode,
  listSourceFiles,
  loadSources,
  probeSummary,
  saveSources,
  sourceIdFor,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');

const assessQuality = (probe) => {
  if (probe.height >= 1080) return 'good (1080p+)';
  if (probe.height >= 720) return 'acceptable (720p)';
  if (probe.height > 0) return `low (${probe.height}p)`;
  return 'unknown';
};

// Cheap audio-level sample of the first 90 s — enough to tell "has usable
// audio" from "silent/broken track" without decoding a full hour.
const sampleAudioLevel = async (file) => {
  try {
    const {stderr} = await execFileAsync('ffmpeg', [
      '-hide_banner', '-nostats',
      '-t', '90',
      '-i', file,
      '-map', 'a:0?',
      '-af', 'volumedetect',
      '-f', 'null', '-',
    ], {maxBuffer: 32 * 1024 * 1024});
    const mean = stderr.match(/mean_volume:\s*(-?[\d.]+) dB/);
    return mean ? Number(mean[1]) : null;
  } catch {
    return null;
  }
};

const main = async () => {
  const files = listSourceFiles();
  const existing = loadSources();
  const byId = new Map(existing.sources.map((s) => [s.id, s]));
  const seenIds = new Set();
  let added = 0;
  let updated = 0;

  for (const file of files) {
    const id = sourceIdFor(file);
    seenIds.add(id);
    const stat = fs.statSync(file);
    const prev = byId.get(id);
    const fingerprintSame =
      prev &&
      prev.sizeBytes === stat.size &&
      prev.mtime === stat.mtime.toISOString();
    if (fingerprintSame && !force) {
      continue;
    }

    console.log(`Auditing ${path.relative(PATHS.sourceVideos, file)} …`);
    const probe = await probeSummary(file);
    const meanVolume = probe.hasAudio ? await sampleAudioLevel(file) : null;
    const speechClear =
      meanVolume === null
        ? probe.hasAudio
          ? 'unknown — needs listening'
          : 'no audio track'
        : meanVolume > -45
          ? 'audio present — verify by listening'
          : 'very quiet — needs review';

    const record = {
      id,
      filename: path.basename(file),
      path: path.relative(PATHS.sourceVideos, file),
      durationSeconds: Math.round(probe.durationSeconds * 100) / 100,
      durationHuman: formatTimecode(probe.durationSeconds),
      width: probe.width,
      height: probe.height,
      fps: probe.fps,
      videoCodec: probe.videoCodec,
      audioCodec: probe.audioCodec,
      hasAudio: probe.hasAudio,
      meanVolumeDb: meanVolume,
      sizeBytes: stat.size,
      mtime: stat.mtime.toISOString(),
      recordingDate: probe.creationTime || (prev?.recordingDate ?? ''),
      // Human-supplied fields survive re-audits:
      instructor: prev?.instructor ?? '',
      existingTitle: prev?.existingTitle ?? '',
      notes: prev?.notes ?? '',
      technicalQuality: assessQuality(probe),
      fullBodyVisible: prev?.fullBodyVisible ?? 'unknown — verify visually',
      feetVisible: prev?.feetVisible ?? 'unknown — verify visually',
      musicPresent: prev?.musicPresent ?? 'unknown — determined during analysis',
      speechClear,
      transcribable: probe.hasAudio ? 'yes (audio track present)' : 'no audio track',
      potentialDuplicateOf: [],
      preppedPath: prev?.preppedPath ?? '',
      auditedAt: new Date().toISOString(),
    };
    byId.set(id, record);
    if (prev) updated += 1;
    else added += 1;
  }

  // Files removed from disk stay in the record (flagged) so step records
  // referencing them are not silently orphaned.
  for (const record of byId.values()) {
    record.missing = !seenIds.has(record.id);
  }

  // Duplicate detection: identical size, or duration within 1 s of another file.
  const records = [...byId.values()].filter((r) => !r.missing);
  for (const a of records) {
    a.potentialDuplicateOf = [];
    for (const b of records) {
      if (a.id === b.id) continue;
      const sameSize = a.sizeBytes === b.sizeBytes;
      const closeDuration =
        Math.abs(a.durationSeconds - b.durationSeconds) < 1 &&
        a.durationSeconds > 0;
      const similarName =
        a.filename.toLowerCase().replace(/[^a-z0-9]/g, '') ===
        b.filename.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sameSize || (closeDuration && similarName)) {
        a.potentialDuplicateOf.push(b.id);
      }
    }
  }

  const sources = [...byId.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  );
  saveSources({sources});

  // --- reports/source-audit.md ---
  const lines = [
    '# Source audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Total source files: **${records.length}**`,
    '',
  ];
  if (records.length === 0) {
    lines.push(
      '> **No source videos found.** Drop long-form teaching videos into',
      '> `source-videos/` and re-run `npm run audit` (or `npm run pipeline`).',
      '',
    );
  }
  for (const r of records) {
    lines.push(
      `## ${r.filename}`,
      '',
      `| Field | Value |`,
      `| --- | --- |`,
      `| Id | \`${r.id}\` |`,
      `| Path | \`source-videos/${r.path}\` |`,
      `| Duration | ${r.durationHuman} |`,
      `| Resolution | ${r.width}×${r.height} |`,
      `| Frame rate | ${r.fps} fps |`,
      `| Video codec | ${r.videoCodec} |`,
      `| Audio | ${r.hasAudio ? `${r.audioCodec} (mean ${r.meanVolumeDb ?? '?'} dB, first 90 s)` : 'none'} |`,
      `| Size | ${(r.sizeBytes / 1024 / 1024).toFixed(1)} MB |`,
      `| Recording date | ${r.recordingDate || 'unknown'} |`,
      `| Instructor | ${r.instructor || 'unknown'} |`,
      `| Existing title | ${r.existingTitle || '—'} |`,
      `| Technical quality | ${r.technicalQuality} |`,
      `| Full body visible | ${r.fullBodyVisible} |`,
      `| Feet visible | ${r.feetVisible} |`,
      `| Music present | ${r.musicPresent} |`,
      `| Speech clear | ${r.speechClear} |`,
      `| Transcribable | ${r.transcribable} |`,
      `| Potential duplicates | ${r.potentialDuplicateOf.join(', ') || 'none detected'} |`,
      '',
    );
  }
  const missing = sources.filter((r) => r.missing);
  if (missing.length) {
    lines.push('## Previously audited files now missing from disk', '');
    for (const r of missing) {
      lines.push(`- \`${r.path}\` (\`${r.id}\`)`);
    }
    lines.push('');
  }
  fs.mkdirSync(PATHS.reports, {recursive: true});
  fs.writeFileSync(path.join(PATHS.reports, 'source-audit.md'), lines.join('\n'));

  appendLog('audit', {added, updated, total: records.length});
  console.log(
    `Audit complete: ${records.length} source file(s) (${added} new, ${updated} re-audited).`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
