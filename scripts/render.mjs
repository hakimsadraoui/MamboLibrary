// Incremental clip rendering via @remotion/renderer.
// Bundles src/index.ts once, then renders every step whose render hash
// changed (or a single step with --id <stepId>). Output goes to renders/
// and is copied to public/clips/<slug>.mp4 for the library.

import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {
  BROWSER_EXECUTABLE,
  PATHS,
  appendLog,
  loadSteps,
  readJson,
  renderHashFor,
  saveSteps,
  writeJson,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const idFlag = args.indexOf('--id');
const onlyId = idFlag >= 0 ? args[idFlag + 1] : null;

export const TEMPLATE_VERSION = 'v1';

const main = async () => {
  const steps = loadSteps();
  const log = readJson(PATHS.processingLog, {entries: [], renders: {}});
  log.renders = log.renders || {};

  const targets = steps.filter((step) => {
    if (onlyId && step.id !== onlyId) return false;
    if (!step.sections?.length) return false;
    const hash = renderHashFor(step, TEMPLATE_VERSION);
    const rendered = log.renders[step.id];
    const outputExists =
      step.clipPath &&
      fs.existsSync(path.join(PATHS.public, step.clipPath));
    return force || !rendered || rendered.hash !== hash || !outputExists;
  });

  if (targets.length === 0) {
    console.log('Render: everything is up to date.');
    return;
  }
  console.log(`Render: ${targets.length} clip(s) to render.`);

  console.log('Bundling Remotion project …');
  const serveUrl = await bundle({
    entryPoint: PATHS.entry,
    publicDir: PATHS.public,
    onProgress: () => {},
  });

  fs.mkdirSync(PATHS.renders, {recursive: true});
  fs.mkdirSync(PATHS.publicClips, {recursive: true});

  for (const step of targets) {
    const compositionId = `step-${step.slug}`;
    console.log(`Rendering ${compositionId} …`);
    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps: {stepId: step.id},
      browserExecutable: BROWSER_EXECUTABLE ?? undefined,
      chromiumOptions: {enableMultiProcessOnLinux: true},
    });
    const outName = `${step.slug}.mp4`;
    const renderPath = path.join(PATHS.renders, outName);
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      audioCodec: 'aac',
      pixelFormat: 'yuv420p',
      crf: 20,
      outputLocation: renderPath,
      inputProps: {stepId: step.id},
      browserExecutable: BROWSER_EXECUTABLE ?? undefined,
      chromiumOptions: {enableMultiProcessOnLinux: true},
      onProgress: ({progress}) => {
        if (Math.round(progress * 100) % 25 === 0) {
          process.stdout.write(`\r  ${Math.round(progress * 100)}%   `);
        }
      },
    });
    process.stdout.write('\n');

    const clipRel = `clips/${outName}`;
    fs.copyFileSync(renderPath, path.join(PATHS.public, clipRel));
    step.clipPath = clipRel;
    step.durationSeconds =
      Math.round((composition.durationInFrames / composition.fps) * 100) / 100;
    step.updatedAt = new Date().toISOString();

    log.renders[step.id] = {
      hash: renderHashFor(step, TEMPLATE_VERSION),
      renderedAt: new Date().toISOString(),
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      output: clipRel,
      status: 'success',
    };
    writeJson(PATHS.processingLog, log);
    saveSteps(steps);
    console.log(`  ✓ ${clipRel} (${step.durationSeconds}s)`);
  }

  appendLog('render', {rendered: targets.map((t) => t.id)});
  console.log(`Render complete: ${targets.length} clip(s).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
