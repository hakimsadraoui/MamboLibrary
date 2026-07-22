// Feedback & refinement loop.
// Apply a correction to one step, record the revision, and re-render only
// what that correction affects.
//
//   npm run revise -- --id <stepId> --set title="Suzie Q" --set level=Advanced
//   npm run revise -- --id <stepId> --set sourceStartTime=00:12:03 --set sourceEndTime=00:14:40
//   npm run revise -- --id <stepId> --set reviewRequired=false
//
// Values are parsed as JSON when possible (arrays/booleans/numbers), else
// kept as strings. Section boundaries can be edited via e.g.
//   --set sections.0.sourceStart=723.5

import {spawnSync} from 'node:child_process';
import {
  PATHS,
  appendLog,
  loadSteps,
  parseTimecode,
  readJson,
  saveSteps,
  writeJson,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const idFlag = args.indexOf('--id');
const stepId = idFlag >= 0 ? args[idFlag + 1] : null;
const sets = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--set' && args[i + 1]) {
    const eq = args[i + 1].indexOf('=');
    sets.push([args[i + 1].slice(0, eq), args[i + 1].slice(eq + 1)]);
  }
}
const noRender = args.includes('--no-render');

if (!stepId || sets.length === 0) {
  console.error(
    'Usage: npm run revise -- --id <stepId> --set field=value [--set field=value…] [--no-render]',
  );
  process.exit(2);
}

const steps = loadSteps();
const step = steps.find((s) => s.id === stepId);
if (!step) {
  console.error(`Step not found: ${stepId}`);
  process.exit(2);
}

const parseValue = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const setPath = (obj, dotted, value) => {
  const parts = dotted.split('.');
  let target = obj;
  for (const part of parts.slice(0, -1)) {
    target = target[/^\d+$/.test(part) ? Number(part) : part];
    if (target === undefined) {
      throw new Error(`Path not found: ${dotted}`);
    }
  }
  const last = parts.at(-1);
  const key = /^\d+$/.test(last) ? Number(last) : last;
  const previous = target[key];
  target[key] = value;
  return previous;
};

const revisions = readJson(PATHS.revisions, {revisions: []});
for (const [field, raw] of sets) {
  const value = parseValue(raw);
  const previous = setPath(step, field, value);
  revisions.revisions.push({
    date: new Date().toISOString(),
    stepId,
    field,
    previousValue: previous,
    newValue: value,
    renderStatus: noRender ? 'skipped' : 'pending',
  });
  console.log(`  ${field}: ${JSON.stringify(previous)} → ${JSON.stringify(value)}`);
}

// Keep top-level source window and the section plan consistent when the
// user edits only the top-level timestamps of a single-section step.
if (
  sets.some(([f]) => f === 'sourceStartTime' || f === 'sourceEndTime') &&
  step.sections.length === 1 &&
  !sets.some(([f]) => f.startsWith('sections.'))
) {
  step.sections[0].sourceStart = parseTimecode(step.sourceStartTime);
  step.sections[0].sourceEnd = parseTimecode(step.sourceEndTime);
  console.log('  (single section synced to the new source window)');
}

step.updatedAt = new Date().toISOString();
saveSteps(steps);
writeJson(PATHS.revisions, revisions);
appendLog('revise', {stepId, fields: sets.map(([f]) => f)});

if (!noRender) {
  console.log('\nRe-rendering the affected clip only …');
  const run = (script, extra = []) => {
    const res = spawnSync(
      'node',
      [`scripts/${script}`, '--id', stepId, ...extra],
      {stdio: 'inherit', cwd: PATHS.data + '/..'},
    );
    return res.status === 0;
  };
  const capOk = spawnSync('node', ['scripts/captions.mjs'], {
    stdio: 'inherit',
    cwd: PATHS.data + '/..',
  }).status === 0;
  const renderOk = run('render.mjs', ['--force']);
  const thumbOk = run('thumbnails.mjs', ['--force']);
  spawnSync('node', ['scripts/qa.mjs'], {stdio: 'inherit', cwd: PATHS.data + '/..'});
  spawnSync('node', ['scripts/manifest.mjs'], {stdio: 'inherit', cwd: PATHS.data + '/..'});

  const rev = readJson(PATHS.revisions, {revisions: []});
  for (const r of rev.revisions) {
    if (r.stepId === stepId && r.renderStatus === 'pending') {
      r.renderStatus = capOk && renderOk && thumbOk ? 'success' : 'failed';
    }
  }
  writeJson(PATHS.revisions, rev);
  console.log('\nRevision applied and re-rendered. Unaffected clips untouched.');
} else {
  console.log('\nRevision recorded (render skipped with --no-render).');
}
