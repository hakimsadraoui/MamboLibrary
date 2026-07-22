// Builds time-synchronised captions for every step:
//   data/captions/<stepId>.json   — clip-relative cues (burn-in + player)
//   public/captions/<slug>.vtt    — WebVTT for the library player
//   data/captions-bundle.json     — bundle imported by the Remotion root
//
// Cues come from the source transcript, remapped from source time to the
// clip timeline (title card offset + section order). Text gets light cleanup
// (terminology fixes, capitalisation) but is never rewritten.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  formatTimecode,
  loadSources,
  loadSteps,
  readJson,
  writeJson,
} from './lib/common.mjs';

// Must match layoutClip() in src/lib/timing.ts
const TITLE_SECONDS = 2.0;
const MAX_LINE = 42;

const terminologyFixes = () => {
  const aliases = readJson(PATHS.aliases, {});
  const fixes = new Map();
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [canonical, alts] of Object.entries(aliases)) {
    if (canonical.startsWith('_')) continue;
    for (const alt of alts) {
      // Only genuine alternative spellings are auto-corrected. Aliases that
      // are contained in the canonical (or vice versa), like "Basic" for
      // "Basic Step", would corrupt correct sentences — skip those.
      if (
        norm(canonical).includes(norm(alt)) ||
        norm(alt).includes(norm(canonical))
      ) {
        continue;
      }
      fixes.set(alt.toLowerCase(), canonical);
    }
  }
  return fixes;
};

const cleanText = (text, fixes) => {
  let t = text.trim().replace(/\s+/g, ' ');
  for (const [wrong, right] of fixes) {
    const re = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    t = t.replace(re, right);
  }
  if (t.length > 0) {
    t = t[0].toUpperCase() + t.slice(1);
  }
  return t;
};

/** Wrap into at most two lines; returns null if it needs splitting. */
const wrapTwoLines = (text) => {
  if (text.length <= MAX_LINE) return text;
  if (text.length > MAX_LINE * 2) return null;
  const words = text.split(' ');
  let line1 = '';
  let i = 0;
  while (i < words.length && (line1 + ' ' + words[i]).trim().length <= MAX_LINE) {
    line1 = (line1 + ' ' + words[i]).trim();
    i += 1;
  }
  const line2 = words.slice(i).join(' ');
  if (line2.length > MAX_LINE) return null;
  return `${line1}\n${line2}`;
};

/** Split an over-long cue into balanced sub-cues on word timings. */
const splitCue = (cue) => {
  const pieces = Math.ceil(cue.text.length / (MAX_LINE * 2));
  const words = cue.text.split(' ');
  const perPiece = Math.ceil(words.length / pieces);
  const out = [];
  const span = cue.end - cue.start;
  for (let p = 0; p < pieces; p += 1) {
    const chunk = words.slice(p * perPiece, (p + 1) * perPiece).join(' ');
    if (!chunk) continue;
    out.push({
      start: cue.start + (span * p) / pieces,
      end: cue.start + (span * (p + 1)) / pieces,
      text: chunk,
    });
  }
  return out;
};

const vttTime = (s) => formatTimecode(s, true);

const main = () => {
  const steps = loadSteps();
  const sources = loadSources().sources;
  const fixes = terminologyFixes();
  fs.mkdirSync(PATHS.captionsData, {recursive: true});
  fs.mkdirSync(PATHS.publicCaptions, {recursive: true});

  const bundle = {};
  let built = 0;
  let missingTranscript = 0;

  for (const step of steps) {
    const source = sources.find((s) => s.id === step.sourceVideo);
    const transcript = source
      ? readJson(path.join(PATHS.transcripts, `${source.id}.json`), null)
      : null;

    // Manual caption overrides always win (feedback loop):
    const overridePath = path.join(PATHS.captionsData, `${step.id}.overrides.json`);
    const overrides = readJson(overridePath, null);

    let cues = [];
    if (overrides?.cues) {
      cues = overrides.cues;
    } else if (transcript) {
      let offset = TITLE_SECONDS;
      for (const section of step.sections) {
        const segs = transcript.segments.filter(
          (sg) => sg.end > section.sourceStart && sg.start < section.sourceEnd,
        );
        for (const sg of segs) {
          const start = Math.max(sg.start, section.sourceStart);
          const end = Math.min(sg.end, section.sourceEnd);
          if (end - start < 0.2) continue;
          const text = cleanText(sg.text, fixes);
          if (!text) continue;
          cues.push({
            start: offset + (start - section.sourceStart),
            end: offset + (end - section.sourceStart),
            text,
          });
        }
        offset += section.sourceEnd - section.sourceStart;
      }
    } else if (source?.hasAudio) {
      missingTranscript += 1;
    }

    // Enforce max-two-lines, splitting long cues.
    const finalCues = [];
    for (const cue of cues) {
      const wrapped = wrapTwoLines(cue.text);
      if (wrapped !== null) {
        finalCues.push({...cue, text: wrapped});
      } else {
        for (const piece of splitCue(cue)) {
          const w = wrapTwoLines(piece.text) ?? piece.text;
          finalCues.push({...piece, text: w});
        }
      }
    }
    finalCues.sort((a, b) => a.start - b.start);

    writeJson(path.join(PATHS.captionsData, `${step.id}.json`), {
      stepId: step.id,
      generatedAt: new Date().toISOString(),
      fromOverrides: Boolean(overrides?.cues),
      cues: finalCues,
    });
    bundle[step.id] = finalCues;

    // WebVTT — positioned near the top so the dancer's feet stay visible.
    const vtt = [
      'WEBVTT',
      '',
      ...finalCues.flatMap((cue, i) => [
        String(i + 1),
        `${vttTime(cue.start)} --> ${vttTime(cue.end)} line:8% align:center`,
        cue.text,
        '',
      ]),
    ].join('\n');
    const vttPath = path.join(PATHS.publicCaptions, `${step.slug}.vtt`);
    fs.writeFileSync(vttPath, vtt);
    step.captionsPath = `captions/${step.slug}.vtt`;
    built += 1;
  }

  writeJson(PATHS.captionsBundle, bundle);
  // Persist captionsPath updates
  writeJson(PATHS.steps, steps);
  appendLog('captions', {built, missingTranscript});
  console.log(
    `Captions: built ${built} caption set(s).` +
      (missingTranscript
        ? ` ${missingTranscript} step(s) have no transcript yet (flagged in QA).`
        : ''),
  );
};

main();
