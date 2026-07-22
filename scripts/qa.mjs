// Quality assurance — inspects every generated clip and writes
// reports/quality-report.md. Never modifies media; only reports and flags.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  execFileAsync,
  formatTimecode,
  loadSources,
  loadSteps,
  parseTimecode,
  probeSummary,
  readJson,
  saveSteps,
} from './lib/common.mjs';

// Must match layoutClip() in src/lib/timing.ts
const TITLE_SECONDS = 2.0;
const RECAP_SECONDS = 3.2;

const detectBlackFrames = async (file) => {
  try {
    const {stderr} = await execFileAsync('ffmpeg', [
      '-hide_banner', '-nostats',
      '-i', file,
      '-vf', 'blackdetect=d=0.8:pix_th=0.04',
      '-an', '-f', 'null', '-',
    ], {maxBuffer: 32 * 1024 * 1024, timeout: 0});
    const out = [];
    const re = /black_start:([\d.]+)\s+black_end:([\d.]+)/g;
    let m;
    while ((m = re.exec(stderr))) {
      out.push({start: Number(m[1]), end: Number(m[2])});
    }
    return out;
  } catch {
    return [];
  }
};

const audioLevel = async (file) => {
  try {
    const {stderr} = await execFileAsync('ffmpeg', [
      '-hide_banner', '-nostats',
      '-i', file,
      '-map', 'a:0?', '-af', 'volumedetect', '-f', 'null', '-',
    ], {maxBuffer: 32 * 1024 * 1024, timeout: 0});
    const mean = stderr.match(/mean_volume:\s*(-?[\d.]+) dB/);
    const max = stderr.match(/max_volume:\s*(-?[\d.]+) dB/);
    return {
      mean: mean ? Number(mean[1]) : null,
      max: max ? Number(max[1]) : null,
    };
  } catch {
    return {mean: null, max: null};
  }
};

const main = async () => {
  const steps = loadSteps();
  const sources = loadSources().sources;
  const results = [];
  let pass = 0;
  let warn = 0;
  let fail = 0;

  for (const step of steps) {
    const checks = [];
    const add = (name, ok, detail = '', level = 'fail') => {
      checks.push({name, ok, detail, level: ok ? 'pass' : level});
    };
    const source = sources.find((s) => s.id === step.sourceVideo);
    add('Source registered', Boolean(source), step.sourceVideo);

    // Source untouched? (fingerprint comparison — originals must never change
    // because of the pipeline. A user replacing a file is reported, not failed.)
    if (source && !source.missing) {
      const abs = path.join(PATHS.sourceVideos, source.path);
      const exists = fs.existsSync(abs);
      add('Source file present', exists, source.path);
      if (exists) {
        const stat = fs.statSync(abs);
        add(
          'Source unmodified since audit',
          stat.size === source.sizeBytes &&
            stat.mtime.toISOString() === source.mtime,
          'size+mtime fingerprint',
          'warn',
        );
      }
    }

    // Source timestamps sane?
    const srcStart = parseTimecode(step.sourceStartTime);
    const srcEnd = parseTimecode(step.sourceEndTime);
    add(
      'Source timestamps valid',
      srcEnd > srcStart &&
        (!source || srcEnd <= source.durationSeconds + 0.5),
      `${step.sourceStartTime}–${step.sourceEndTime}`,
    );
    for (const [i, sec] of step.sections.entries()) {
      add(
        `Section ${i + 1} within source bounds`,
        sec.sourceEnd > sec.sourceStart &&
          (!source || sec.sourceEnd <= source.durationSeconds + 0.5),
        `${sec.label}: ${formatTimecode(sec.sourceStart)}–${formatTimecode(sec.sourceEnd)}`,
      );
    }

    const clipAbs = step.clipPath
      ? path.join(PATHS.public, step.clipPath)
      : null;
    const clipExists = Boolean(clipAbs && fs.existsSync(clipAbs));
    add('Clip rendered', clipExists, step.clipPath || 'not rendered yet');

    if (clipExists) {
      let probe = null;
      try {
        probe = await probeSummary(clipAbs);
        add('Clip parses (renders successfully)', true);
      } catch (err) {
        add('Clip parses (renders successfully)', false, String(err));
      }
      if (probe) {
        const sectionSeconds = step.sections.reduce(
          (acc, s) => acc + (s.sourceEnd - s.sourceStart),
          0,
        );
        const expected = TITLE_SECONDS + sectionSeconds + RECAP_SECONDS;
        add(
          'Duration matches edit plan',
          Math.abs(probe.durationSeconds - expected) < 0.75,
          `expected ≈${expected.toFixed(1)}s, got ${probe.durationSeconds.toFixed(1)}s`,
        );
        add(
          'Resolution 1920×1080',
          probe.width === 1920 && probe.height === 1080,
          `${probe.width}×${probe.height}`,
        );
        add('Audio track present', probe.hasAudio, '', 'warn');
        if (probe.hasAudio) {
          const level = await audioLevel(clipAbs);
          add(
            'Audio audible (not silent)',
            level.mean !== null && level.mean > -55,
            `mean ${level.mean} dB`,
            'warn',
          );
          add(
            'No clipping',
            level.max !== null && level.max <= 0,
            `max ${level.max} dB`,
            'warn',
          );
        }
        const black = await detectBlackFrames(clipAbs);
        // Title/recap are dark by design; only mid-clip black is unexpected.
        const unexpected = black.filter(
          (b) =>
            b.start > TITLE_SECONDS + 1 &&
            b.end < probe.durationSeconds - RECAP_SECONDS - 1,
        );
        add(
          'No unexpected black frames',
          unexpected.length === 0,
          unexpected.map((b) => `${b.start.toFixed(1)}–${b.end.toFixed(1)}s`).join(', '),
          'warn',
        );
      }
    }

    const thumbAbs = step.thumbnailPath
      ? path.join(PATHS.public, step.thumbnailPath)
      : null;
    add(
      'Thumbnail exists',
      Boolean(thumbAbs && fs.existsSync(thumbAbs)),
      step.thumbnailPath || 'missing',
    );

    // Captions
    const cues = readJson(
      path.join(PATHS.captionsData, `${step.id}.json`),
      {cues: []},
    ).cues;
    const vttExists =
      step.captionsPath &&
      fs.existsSync(path.join(PATHS.public, step.captionsPath));
    add('Caption file (VTT) exists', Boolean(vttExists), step.captionsPath, 'warn');
    if (source?.hasAudio) {
      add(
        'Captions available (transcript found)',
        cues.length > 0,
        cues.length ? `${cues.length} cues` : 'no transcript — run npm run transcribe',
        'warn',
      );
    }
    if (cues.length && step.durationSeconds) {
      add(
        'Caption timing within clip',
        cues.every((c) => c.start >= 0 && c.end <= step.durationSeconds + 0.5),
        '',
        'warn',
      );
      add(
        'Captions max two lines',
        cues.every((c) => c.text.split('\n').length <= 2),
        '',
      );
    }

    add(
      'Registered in library data',
      Boolean(step.slug && step.title && step.category),
      '',
    );

    const failed = checks.filter((c) => !c.ok && c.level === 'fail');
    const warned = checks.filter((c) => !c.ok && c.level === 'warn');
    const status = failed.length ? 'FAIL' : warned.length ? 'WARN' : 'PASS';
    if (status === 'PASS') pass += 1;
    else if (status === 'WARN') warn += 1;
    else fail += 1;

    // QA failures feed the review queue automatically.
    if (failed.length && !step.reviewRequired) {
      step.reviewRequired = true;
      step.reviewReason = `QA failed: ${failed.map((c) => c.name).join('; ')}`;
    }

    results.push({step, status, checks});
  }
  saveSteps(steps);

  const lines = [
    '# Quality report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `**${results.length}** clip(s) checked — ${pass} pass · ${warn} with warnings · ${fail} failing`,
    '',
  ];
  if (results.length === 0) {
    lines.push(
      '> No steps exist yet. Add source videos, curate `data/steps.json`,',
      '> then run `npm run pipeline`.',
      '',
    );
  }
  for (const {step, status, checks} of results) {
    const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
    lines.push(`## ${icon} ${step.title} (\`${step.id}\`) — ${status}`, '');
    for (const c of checks) {
      const mark = c.ok ? '✓' : c.level === 'warn' ? '⚠' : '✗';
      lines.push(`- ${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
    }
    lines.push('');
  }
  fs.mkdirSync(PATHS.reports, {recursive: true});
  fs.writeFileSync(path.join(PATHS.reports, 'quality-report.md'), lines.join('\n'));
  appendLog('qa', {pass, warn, fail});
  console.log(
    `QA complete: ${pass} pass, ${warn} warn, ${fail} fail → reports/quality-report.md`,
  );
  if (fail > 0) process.exitCode = 1;
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
