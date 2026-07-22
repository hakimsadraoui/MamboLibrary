// Thumbnail generation.
// 1. Extracts the chosen frame (step.thumbnailTime, seconds in the SOURCE
//    video) with ffmpeg into public/thumbnails/.frames/
// 2. Renders the branded 1280×720 thumbnail with the StepThumbnail
//    composition (title, category, level, view label).
// Incremental: skipped when the thumbnail exists and inputs are unchanged.

import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {
  BROWSER_EXECUTABLE,
  PATHS,
  appendLog,
  execFileAsync,
  loadSources,
  loadSteps,
  readJson,
  saveSteps,
  sha1,
  writeJson,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const idFlag = args.indexOf('--id');
const onlyId = idFlag >= 0 ? args[idFlag + 1] : null;

const thumbHashFor = (step) =>
  sha1(
    JSON.stringify({
      title: step.title,
      category: step.category,
      level: step.level,
      versionLabel: step.versionLabel,
      thumbnailTime: step.thumbnailTime,
      sourceVideo: step.sourceVideo,
    }),
  );

const main = async () => {
  const steps = loadSteps();
  const sources = loadSources().sources;
  const log = readJson(PATHS.processingLog, {entries: [], renders: {}});
  log.thumbnails = log.thumbnails || {};

  const categories = readJson(PATHS.categories);
  const colorFor = (name) =>
    categories.categories.find((c) => c.name === name)?.color ?? '#E8B44F';

  const targets = steps.filter((step) => {
    if (onlyId && step.id !== onlyId) return false;
    const hash = thumbHashFor(step);
    const prev = log.thumbnails[step.id];
    const exists =
      step.thumbnailPath &&
      fs.existsSync(path.join(PATHS.public, step.thumbnailPath));
    return force || !prev || prev.hash !== hash || !exists;
  });

  if (targets.length === 0) {
    console.log('Thumbnails: everything is up to date.');
    return;
  }

  fs.mkdirSync(PATHS.thumbFrames, {recursive: true});
  fs.mkdirSync(PATHS.publicThumbs, {recursive: true});

  console.log('Bundling Remotion project …');
  const serveUrl = await bundle({
    entryPoint: PATHS.entry,
    publicDir: PATHS.public,
    onProgress: () => {},
  });

  for (const step of targets) {
    const source = sources.find((s) => s.id === step.sourceVideo);
    if (!source) {
      console.warn(`  ! ${step.id}: source ${step.sourceVideo} not found, skipping`);
      continue;
    }
    console.log(`Thumbnail for ${step.title} …`);
    const framePath = path.join(PATHS.thumbFrames, `${step.id}.png`);
    const input = path.join(PATHS.sourceVideos, source.path);
    await execFileAsync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', String(step.thumbnailTime ?? 0),
      '-i', input,
      '-frames:v', '1',
      '-vf', 'scale=1280:-2',
      framePath,
    ], {maxBuffer: 32 * 1024 * 1024});

    const inputProps = {
      frameImage: `thumbnails/.frames/${step.id}.png`,
      title: step.title,
      category: step.category,
      categoryColor: colorFor(step.category),
      level: step.level,
      viewLabel: step.versionLabel || '',
    };
    const composition = await selectComposition({
      serveUrl,
      id: 'StepThumbnail',
      inputProps,
      browserExecutable: BROWSER_EXECUTABLE ?? undefined,
      chromiumOptions: {enableMultiProcessOnLinux: true},
    });
    const outRel = `thumbnails/${step.slug}.jpg`;
    await renderStill({
      composition,
      serveUrl,
      output: path.join(PATHS.public, outRel),
      inputProps,
      imageFormat: 'jpeg',
      jpegQuality: 90,
      browserExecutable: BROWSER_EXECUTABLE ?? undefined,
      chromiumOptions: {enableMultiProcessOnLinux: true},
    });
    step.thumbnailPath = outRel;
    log.thumbnails[step.id] = {
      hash: thumbHashFor(step),
      renderedAt: new Date().toISOString(),
    };
    writeJson(PATHS.processingLog, log);
    saveSteps(steps);
    console.log(`  ✓ ${outRel}`);
  }

  appendLog('thumbnails', {rendered: targets.map((t) => t.id)});
  console.log(`Thumbnails complete: ${targets.length}.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
