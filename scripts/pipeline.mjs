// Full incremental pipeline:
//   audit → prep → transcribe → segment → captions → render → thumbnails → qa → manifest
// Every stage is incremental (fingerprint/hash-based), so re-running after
// adding one new source video only processes that video, and re-running
// after a data correction only re-renders the affected clip.

import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const skip = new Set(
  args
    .filter((a) => a.startsWith('--skip='))
    .flatMap((a) => a.replace('--skip=', '').split(',')),
);
const extra = args.filter((a) => !a.startsWith('--skip='));

const stages = [
  ['audit', 'audit.mjs'],
  ['prep', 'prep.mjs'],
  ['transcribe', 'transcribe.mjs'],
  ['segment', 'segment.mjs'],
  ['captions', 'captions.mjs'],
  ['render', 'render.mjs'],
  ['thumbnails', 'thumbnails.mjs'],
  ['qa', 'qa.mjs'],
  ['manifest', 'manifest.mjs'],
];

let failed = false;
for (const [name, script] of stages) {
  if (skip.has(name)) {
    console.log(`\n━━ ${name} (skipped) ━━`);
    continue;
  }
  console.log(`\n━━ ${name} ━━`);
  const res = spawnSync('node', [path.join('scripts', script), ...extra], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (res.status !== 0) {
    // QA reports failures via exit code but must not block the manifest.
    if (name === 'qa') {
      failed = true;
      continue;
    }
    console.error(`Stage "${name}" failed — stopping.`);
    process.exit(res.status ?? 1);
  }
}

console.log(
  failed
    ? '\nPipeline finished with QA failures — see reports/quality-report.md'
    : '\nPipeline finished cleanly.',
);
process.exit(failed ? 1 : 0);
